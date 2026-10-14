import test from 'node:test';
import assert from 'node:assert/strict';
import {LibraryService} from '../lib/library-service';
import {claimLibraryRequest,readLibraryLimits} from '../lib/library-limits';
import {toolResultText} from '../lib/tool-result';
import {createTestDatabase,TEST_LIMITS} from './test-db';
import type {Template} from '../lib/prompt-core';

const templateInput={title:'Fictional fixture',description:'',body:'Hello {{person}}',category:'Writing'};

test('summary pagination discovers every owned template beyond the old 200-row cap',async()=>{
 const {db}=createTestDatabase();
 const service=new LibraryService(db,'fictional-a',TEST_LIMITS),other=new LibraryService(db,'fictional-b',TEST_LIMITS);
 for(let i=0;i<211;i++)await service.call('save_template',{...templateInput,title:'Fictional '+i,body:'Private body '+i+' {{person}}'});
 const foreign=(await other.call('save_template',templateInput)).template as Template;
 const demo=(await service.call('save_template',{...templateInput,workspace:'demo'})).template as Template;
 const ids=new Set<string>();let cursor:string|undefined;let builtins=0;let calls=0;
 do{
  const page=await service.call('list_templates',cursor?{after_id:cursor}:{});
  assert.equal(page.catalogVersion,2);assert.equal(page.afterId,cursor||null);
  const summaries=page.templates as {id:string;sample:boolean}[];
  assert.ok(summaries.length<= (cursor?25:60));
  for(const summary of summaries){assert.ok(!('body' in summary));assert.ok(!('fields' in summary));assert.ok(!ids.has(summary.id));ids.add(summary.id);if(summary.sample)builtins++;}
  assert.equal(page.hasMore,!!page.nextCursor);cursor=page.nextCursor as string|undefined;calls++;
 }while(cursor);
 assert.equal(ids.size,246);assert.equal(builtins,35);assert.equal(calls,9);
 assert.ok(!ids.has(foreign.id));assert.ok(!ids.has(demo.id));
 const selected=await service.call('open_library',{template_id:[...ids][0]});
 assert.ok((selected.selectedTemplate as Template).body.startsWith('Private body'));
 assert.equal(selected.templates,undefined);
 await assert.rejects(service.call('list_templates',{after_id:''}),/after_id/);
});

test('generated migration gives both export queries an owner/id range index without sorting',()=>{
 const {sql}=createTestDatabase();
 for(const table of ['templates','drafts']){
  const plan=sql.prepare(`EXPLAIN QUERY PLAN SELECT * FROM ${table} WHERE owner_id = ? AND id > ? ORDER BY id ASC LIMIT 2`).all('fictional-a','').map(row=>String(row.detail)).join('\n');
  assert.match(plan,new RegExp(table+'_owner_id'));assert.ok(!plan.includes('TEMP B-TREE'));
 }
});

test('a deletion between template ownership read and update cannot return saved success',async()=>{
 const {db,sql}=createTestDatabase();
 const service=new LibraryService(db,'fictional-a',TEST_LIMITS);
 const saved=(await service.call('save_template',templateInput)).template as Template;
 const prepare=db.prepare.bind(db);
 db.prepare=(query:string)=>{if(query.startsWith('UPDATE templates SET'))sql.prepare('DELETE FROM templates WHERE id = ?').run(saved.id);return prepare(query);};
 await assert.rejects(service.call('save_template',{...templateInput,template_id:saved.id,body:'Changed {{person}}'}),/not found/);
});

test('record budgets are atomic and scoped to the authenticated owner and workspace',async()=>{
 const {db}=createTestDatabase();const limits={...TEST_LIMITS,templatesPerWorkspace:1,draftsPerWorkspace:1};
 const service=new LibraryService(db,'fictional-a',limits),other=new LibraryService(db,'fictional-b',limits);
 const saves=await Promise.allSettled([service.call('save_template',templateInput),service.call('save_template',templateInput)]);
 assert.equal(saves.filter(result=>result.status==='fulfilled').length,1);
 const template=(saves.find(result=>result.status==='fulfilled') as PromiseFulfilledResult<Record<string,unknown>>).value.template as Template;
 await service.call('save_template',{...templateInput,workspace:'demo'});await other.call('save_template',templateInput);
 const draftArgs={template_id:template.id,values:[{key:'person',value:'River',source:'provided'}]};
 await service.call('prepare_draft',draftArgs);await assert.rejects(service.call('prepare_draft',draftArgs),/budget exceeded/);
 await service.call('save_template',{...templateInput,template_id:template.id,body:'Welcome {{person}}'});
 assert.equal(((await service.call('list_templates',{})).templates as unknown[]).length,36);
});

test('UTF-8 storage budgets reject oversized inserts and updates while keeping saved content',async()=>{
 const {db}=createTestDatabase();const service=new LibraryService(db,'fictional-a',{...TEST_LIMITS,bytesPerWorkspace:40});
 const surrogateBoundary=new LibraryService(db,'fictional-surrogate',{...TEST_LIMITS,bytesPerWorkspace:9});
 await assert.rejects(surrogateBoundary.call('save_template',{title:'A\ud800',description:'\udc00B',body:'x',category:'B'}),/budget exceeded/);
 const input={title:'A',description:'',category:'B',body:'界'.repeat(10)};
 const template=(await service.call('save_template',input)).template as Template;
 await assert.rejects(service.call('save_template',{...input,body:'界'.repeat(4)}),/budget exceeded/);
 await assert.rejects(service.call('save_template',{...input,template_id:template.id,body:'界'.repeat(13)}),/budget exceeded/);
 assert.equal((await service.template(template.id)).body,input.body);
 await service.call('save_template',{...input,template_id:template.id,body:'Short'});
 await assert.rejects(service.call('prepare_draft',{template_id:template.id,values:[]}),/budget exceeded/);
 assert.deepEqual((await service.call('export_library',{kind:'drafts'})).records,[]);
});

test('draft updates include snapshots and template bytes in the workspace storage budget',async()=>{
 const {db}=createTestDatabase();const writer=new LibraryService(db,'fictional-a',TEST_LIMITS);
 const template=(await writer.call('save_template',templateInput)).template as Template;
 const saved=(await writer.call('prepare_draft',{template_id:template.id,values:[{key:'person',value:'River',source:'provided'}]})).draft as {id:string;version:number;renderedPrompt:string};
 const limited=new LibraryService(db,'fictional-a',{...TEST_LIMITS,bytesPerWorkspace:450});
 await assert.rejects(limited.call('update_draft',{draft_id:saved.id,version:saved.version,values:[{key:'person',value:'界'.repeat(200),source:'provided'}]}),/storage budget/);
 assert.deepEqual((await writer.call('render_prompt',{draft_id:saved.id})).draft,saved);
});

test('request and write counters are shared across workspaces, expire, and retain denied-write counts',async()=>{
 const {db,sql}=createTestDatabase();const limits={...TEST_LIMITS,requestsPerMinute:3,writesPerMinute:1,globalRequestsPerMinute:5};
 await claimLibraryRequest(db,'fictional-a',true,limits,0);
 await assert.rejects(claimLibraryRequest(db,'fictional-a',true,limits,0),/budget exceeded/);
 await claimLibraryRequest(db,'fictional-a',false,limits,0);
 await claimLibraryRequest(db,'fictional-a',false,limits,0);
 await assert.rejects(claimLibraryRequest(db,'fictional-a',false,limits,0),/budget exceeded/);
 await assert.rejects(claimLibraryRequest(db,'fictional-b',false,limits,0),/budget exceeded/);
 await claimLibraryRequest(db,'fictional-a',true,limits,60_000);
 await claimLibraryRequest(db,'fictional-b',false,limits,180_000);
 assert.equal(sql.prepare('SELECT COUNT(*) AS count FROM library_usage WHERE bucket < 2').get()?.count,0);
});

test('missing limits fail closed, and concise tool text does not duplicate private structured payloads',async()=>{
 for(const value of [undefined,'{}','bad',JSON.stringify({...TEST_LIMITS,requestsPerMinute:0})])assert.throws(()=>readLibraryLimits(value),/not configured/);
 assert.deepEqual(readLibraryLimits(JSON.stringify(TEST_LIMITS)),TEST_LIMITS);
 const {db}=createTestDatabase();const service=new LibraryService(db,'fictional-a');
 await assert.rejects(service.call('save_template',templateInput),/not configured/);
 const privateText='Fictional private content '.repeat(1000);
 for(const name of ['save_template','prepare_draft','render_prompt'] as const){const text=toolResultText(name,{template:{body:privateText},draft:{renderedPrompt:privateText}});assert.ok(text.length<300);assert.ok(!text.includes(privateText));}
});
