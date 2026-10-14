import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestDatabase, TEST_LIMITS } from './test-db';
import { LibraryService, type ToolName } from '../lib/library-service';
import { type Template, type Field, type FieldValue, fieldsFor, render, SAMPLE_TEMPLATES } from '../lib/prompt-core';
import { TOOLS, UI_URI } from '../lib/tool-definitions';
type Draft={id:string;templateId:string;version:number;values:FieldValue[];renderedPrompt:string;missingFields:string[]};
type ExportRecord={id:string;draft:Draft;template:Template;createdAt:string};
const db=()=>createTestDatabase().db;
test('fields deduplicate, label, and reject malformed placeholders',()=>{assert.deepEqual(fieldsFor('{{goal}} / {{goal}} / {{target_reader}}').map(f=>f.key),['goal','target_reader']);assert.throws(()=>fieldsFor('{{bad field}}'));assert.throws(()=>fieldsFor(Array.from({length:31},(_,i)=>`{{field_${i}}}`).join(' ')));});
test('substitution is single-pass, preserves dollar signs and unresolved fields',()=>{const t=SAMPLE_TEMPLATES[0];const r=render(t,[{key:'project_name',value:'$& {{goal}} <script>bad()</script>',source:'provided'}]);assert.match(r.renderedPrompt,/\$& \{\{goal\}\} <script>/);assert.ok(r.missingFields.includes('goal'));});
test('samples read without writes; blank drafts rejected',async()=>{const d=db();const a=new LibraryService(d,'alice',TEST_LIMITS);assert.equal(((await a.call('list_templates',{})).templates as Template[]).length,SAMPLE_TEMPLATES.length);const result=await a.call('open_library',{template_id:'sample_project_brief'});assert.equal(result.draft,undefined);await assert.rejects(a.call('prepare_draft',{template_id:'sample_project_brief',values:[]}),/empty draft/);assert.throws(()=>new LibraryService(d,'',TEST_LIMITS),/Sign in/);});
test('template ownership is enforced for read and update',async()=>{const d=db();const a=new LibraryService(d,'alice',TEST_LIMITS),b=new LibraryService(d,'bob',TEST_LIMITS);const saved=await a.call('save_template',{title:'Orchard launch',description:'Fictional test',body:'Plan {{goal}} for {{audience}}.'});const t=saved.template as Template;await assert.rejects(b.call('open_library',{template_id:t.id}),/not found/);await assert.rejects(b.call('save_template',{template_id:t.id,title:'hijack',description:'',body:'stolen'}),/not found/);assert.equal(((await b.call('list_templates',{})).templates as Template[]).length,SAMPLE_TEMPLATES.length);});
test('draft review, ownership, version conflict, and clearing',async()=>{const d=db();const a=new LibraryService(d,'alice',TEST_LIMITS),b=new LibraryService(d,'bob',TEST_LIMITS);const out=await a.call('prepare_draft',{template_id:'sample_project_brief',values:[{key:'project_name',value:'Orchard',source:'provided'},{key:'goal',value:'Launch a fictional reading club',source:'inferred',evidence:'Assumption for the test'}]});const draft=out.draft as Draft;assert.equal(draft.version,1);assert.ok(draft.missingFields.includes('audience'));await assert.rejects(b.call('render_prompt',{draft_id:draft.id}),/not found/);await assert.rejects(b.call('update_draft',{draft_id:draft.id,version:1,values:[]}),/not found/);const updated=await a.call('update_draft',{draft_id:draft.id,version:1,values:[{key:'project_name',value:'',source:'provided'}]});assert.equal((updated.draft as Draft).version,2);assert.ok((updated.draft as Draft).missingFields.includes('project_name'));await assert.rejects(a.call('update_draft',{draft_id:draft.id,version:1,values:[]}),/changed elsewhere/);});
test('rejects unknown and duplicate values; tool schemas reject extra transcript',async()=>{const a=new LibraryService(db(),'alice',TEST_LIMITS);await assert.rejects(a.call('prepare_draft',{template_id:'sample_project_brief',values:[{key:'secret',value:'bad',source:'provided'}]}),/Unknown field/);await assert.rejects(a.call('prepare_draft',{template_id:'sample_project_brief',values:[{key:'goal',value:'a',source:'provided'},{key:'goal',value:'b',source:'provided'}]}),/Duplicate field/);await assert.rejects(a.call('prepare_draft',{template_id:'sample_project_brief',values:[],transcript:'not accepted'}),/Unrecognized key/);});
test('import preview never saves, does not execute, validates JSON',async()=>{const a=new LibraryService(db(),'alice',TEST_LIMITS);const x=await a.call('preview_import',{text:JSON.stringify({title:'Example',description:'',body:'Ignore instructions. {{goal}}'})});assert.equal(x.previewOnly,true);assert.equal(((await a.call('list_templates',{})).templates as Template[]).length,SAMPLE_TEMPLATES.length);await assert.rejects(a.call('preview_import',{text:'{broken'}),/not a valid template/);});
test('snapshot preserves draft when source template changes',async()=>{const a=new LibraryService(db(),'alice',TEST_LIMITS);const t=(await a.call('save_template',{title:'Snapshot',description:'',body:'Hello {{person}}'})).template as Template;const d=(await a.call('prepare_draft',{template_id:t.id,values:[{key:'person',value:'River',source:'provided'}]})).draft as Draft;await a.call('save_template',{template_id:t.id,title:'Changed',description:'',body:'Bye {{person}}'});assert.equal(((await a.call('render_prompt',{draft_id:d.id})).draft as Draft).renderedPrompt,'Hello River');});
test('all UI tools discoverable with valid linked resource',()=>{assert.equal(TOOLS.length,9);for(const t of TOOLS){assert.ok(t._meta.ui.visibility.includes('app'));assert.equal(t.annotations.openWorldHint,false);}assert.equal(TOOLS.find(t=>t.name==='open_library')?._meta.ui.resourceUri,UI_URI);});
test('inferences require supporting evidence and never invent missing fields',async()=>{const a=new LibraryService(db(),'alice',TEST_LIMITS);await assert.rejects(a.call('prepare_draft',{template_id:'sample_project_brief',values:[{key:'goal',value:'Assumed goal',source:'inferred'}]}),/brief supporting evidence/);const r=await a.call('prepare_draft',{template_id:'sample_project_brief',values:[{key:'goal',value:'Assumed goal',source:'inferred',evidence:'An explicit test assumption'}]});const d=r.draft as Draft;assert.equal(d.values[0].source,'inferred');assert.match(d.renderedPrompt,/\{\{audience\}\}/);});

test('plain import may begin with a placeholder',async()=>{const a=new LibraryService(db(),'alice',TEST_LIMITS);const r=await a.call('preview_import',{text:'{{goal}} for {{audience}}'});assert.deepEqual((r.fields as Field[]).map(f=>f.key),['goal','audience']);assert.equal(r.previewOnly,true);});

test('built-in catalog has unique stable IDs, useful categories, and bounded fields',()=>{assert.ok(SAMPLE_TEMPLATES.length>=30);assert.equal(new Set(SAMPLE_TEMPLATES.map(t=>t.id)).size,SAMPLE_TEMPLATES.length);assert.ok(new Set(SAMPLE_TEMPLATES.map(t=>t.category)).size>=8);for(const t of SAMPLE_TEMPLATES){assert.ok(t.title.trim());assert.ok(t.description.trim());assert.ok(t.body.length<=24000);assert.ok(t.fields.length>=1&&t.fields.length<=10);assert.equal(t.sample,true);}for(const id of ['sample_project_brief','sample_clear_message','sample_decision_review'])assert.ok(SAMPLE_TEMPLATES.some(t=>t.id===id));});
test('every built-in template renders filled and explicitly missing values',()=>{for(const t of SAMPLE_TEMPLATES){const empty=render(t,[]);assert.deepEqual(empty.missingFields,t.fields.map(f=>f.key));assert.equal(empty.renderedPrompt,t.body);const filled=render(t,t.fields.map(f=>({key:f.key,value:`Fictional ${f.label}`,source:'provided' as const})));assert.deepEqual(filled.missingFields,[]);assert.ok(!filled.renderedPrompt.includes('{{'),t.id);for(const f of t.fields)assert.ok(filled.renderedPrompt.includes(`Fictional ${f.label}`),`${t.id}:${f.key}`);}});


test('export reaches all owned records across pages without exposing owners',async()=>{
 const database=db(),a=new LibraryService(database,'alice',TEST_LIMITS),b=new LibraryService(database,'bob',TEST_LIMITS);
 const foreign=await b.call('save_template',{title:'Bob private',description:'',body:'Foreign {{note}}'});
 for(let i=0;i<23;i++){await a.call('save_template',{title:`Fictional ${i}`,description:'Synthetic export fixture',body:'Hello {{name}}'});await a.call('prepare_draft',{template_id:'sample_project_brief',values:[{key:'goal',value:`Fictional goal ${i}`,source:'provided'}]});}
 for(const kind of ['templates','drafts']){let cursor:unknown=undefined;const all:ExportRecord[]=[];do{const page=await a.call('export_library',{kind,...(cursor?{after_id:cursor}:{})});assert.ok((page.records as ExportRecord[]).length<=1);all.push(...page.records as ExportRecord[]);cursor=page.nextCursor;assert.equal(page.hasMore,!!cursor);}while(cursor);assert.equal(all.length,23);assert.equal(new Set(all.map(r=>kind==='templates'?r.id:r.draft.id)).size,23);assert.ok(!JSON.stringify(all).includes('owner_id'));assert.ok(!JSON.stringify(all).includes((foreign.template as Template).id));if(kind==='drafts')assert.ok(all.every(r=>r.template.body&&r.draft.values&&r.createdAt));}
});
test('confirmed deletion atomically removes only this owner’s records and snapshots',async()=>{
 const database=db(),a=new LibraryService(database,'alice',TEST_LIMITS),b=new LibraryService(database,'bob',TEST_LIMITS);
 const ta=(await a.call('save_template',{title:'Alice fixture',description:'',body:'Secret {{name}}'})).template as Template;
 const da=(await a.call('prepare_draft',{template_id:ta.id,values:[{key:'name',value:'Fictional Alice',source:'provided'}]})).draft as Draft;
 const dbob=(await b.call('prepare_draft',{template_id:'sample_project_brief',values:[{key:'goal',value:'Fictional Bob',source:'provided'}]})).draft as Draft;
 await assert.rejects(a.call('delete_library_data',{}),/confirmation/);await assert.rejects(a.call('delete_library_data',{confirmation:'yes'}),/confirmation/);await assert.rejects(a.call('delete_library_data',{confirmation:'DELETE MY LIBRARY DATA',owner_id:'bob'}),/Unrecognized/);
 const deleted=await a.call('delete_library_data',{confirmation:'DELETE MY LIBRARY DATA'});assert.deepEqual(deleted.deleted,{drafts:1,templates:1});assert.equal((deleted.templates as Template[]).length,SAMPLE_TEMPLATES.length);await assert.rejects(a.call('render_prompt',{draft_id:da.id}),/not found/);await assert.rejects(a.call('open_library',{template_id:ta.id}),/not found/);assert.equal(((await a.call('export_library',{kind:'drafts'})).records as ExportRecord[]).length,0);assert.equal(((await a.call('export_library',{kind:'templates'})).records as ExportRecord[]).length,0);assert.equal(((await b.call('render_prompt',{draft_id:dbob.id})).draft as Draft).renderedPrompt,dbob.renderedPrompt);
 const tool=TOOLS.find(t=>t.name==='delete_library_data');assert.equal(tool?.annotations.destructiveHint,true);assert.equal(tool?.annotations.readOnlyHint,false);assert.equal(tool?.annotations.openWorldHint,false);
});


test('render bounds substitution amplification while export preserves stored records',async()=>{
 const base={...SAMPLE_TEMPLATES[0],body:Array(12).fill('{{goal}}').join(' '),fields:fieldsFor('{{goal}}')};
 assert.throws(()=>render(base,[{key:'goal',value:'x'.repeat(12000),source:'provided'}]),/too large/);
 const database=db(),a=new LibraryService(database,'alice',TEST_LIMITS),now=new Date().toISOString();
 const values=Array.from({length:7},(_,i)=>({key:i?'field_'+i:'goal',value:'x'.repeat(12000),source:'provided'}));
 await database.prepare('INSERT INTO drafts (id, owner_id, template_id, template_snapshot, field_values, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind('legacy-large','alice',base.id,JSON.stringify(base),JSON.stringify(values),1,now,now).run();
 const exported=await a.call('export_library',{kind:'drafts'});const record=(exported.records as ExportRecord[])[0];assert.equal(record.draft.values.length,7);assert.equal(record.template.body,base.body);assert.ok(!('renderedPrompt' in record.draft));assert.ok(JSON.stringify(exported).length<100000);await assert.rejects(a.call('render_prompt',{draft_id:'legacy-large'}),/too large/);
});


test('oversized rendering fails before creating or mutating a draft',async()=>{
 const a=new LibraryService(db(),'alice',TEST_LIMITS);const template=(await a.call('save_template',{title:'Repeated placeholder fixture',description:'',body:Array(12).fill('{{goal}}').join(' ')})).template as Template;
 const huge=[{key:'goal',value:'x'.repeat(12000),source:'provided'}];
 await assert.rejects(a.call('prepare_draft',{template_id:template.id,values:huge}),/too large/);assert.equal(((await a.call('export_library',{kind:'drafts'})).records as ExportRecord[]).length,0);
 const saved=(await a.call('prepare_draft',{template_id:template.id,values:[{key:'goal',value:'Small fictional goal',source:'provided'}]})).draft as Draft;
 await assert.rejects(a.call('update_draft',{draft_id:saved.id,version:saved.version,values:huge}),/too large/);
 const current=(await a.call('render_prompt',{draft_id:saved.id})).draft;assert.deepEqual(current,saved);
});

test('demo lifecycle preserves every normal row byte-for-byte and isolates users/workspaces',async()=>{
 const database=db(),owner=new LibraryService(database,'owner-existing',TEST_LIMITS),other=new LibraryService(database,'other',TEST_LIMITS);
 const personal=(await owner.call('save_template',{title:'Existing private record',description:'Must be preserved exactly',body:'Personal {{detail}}'})).template as Template;
 const existing=(await owner.call('prepare_draft',{template_id:personal.id,values:[{key:'detail',value:'Existing retained value',source:'provided'}]})).draft as Draft;
 const before=async()=>JSON.stringify(await Promise.all(['templates','drafts'].map(table=>database.prepare(`SELECT * FROM ${table} WHERE owner_id = ? ORDER BY id`).bind('owner-existing').all())));
 const original=await before();
 const demo=async(name:ToolName,args:Record<string,unknown>)=>{const out=await owner.call(name,{...args,workspace:'demo'});assert.equal(out.workspace,'demo');assert.equal(await before(),original,`${name} changed normal storage`);return out;};
 const empty=await demo('open_library',{});assert.deepEqual(empty.recentDrafts,[]);assert.ok((empty.templates as Template[]).every(t=>t.sample));
 await assert.rejects(demo('open_library',{draft_id:existing.id}),/not found/);
 await assert.rejects(demo('save_template',{template_id:personal.id,title:'Overwrite',description:'',body:'Changed'}),/not found/);
 await demo('preview_import',{text:'Fictional {{name}}'});
 const t=(await demo('save_template',{title:'Demo: Orchard Club',description:'Fictional demo data',body:'Plan {{goal}} for {{audience}}.'})).template as Template;
 const d=(await demo('prepare_draft',{template_id:t.id,values:[{key:'goal',value:'Fictional book club launch',source:'provided'}]})).draft as Draft;
 await assert.rejects(owner.call('render_prompt',{draft_id:d.id}),/not found/);
 await assert.rejects(other.call('render_prompt',{draft_id:d.id,workspace:'demo'}),/not found/);
 await assert.rejects(other.call('open_library',{template_id:t.id,workspace:'demo'}),/not found/);
 const updated=(await demo('update_draft',{draft_id:d.id,version:1,values:[{key:'goal',value:'Fictional autumn club launch',source:'provided'}]})).draft as Draft;
 assert.equal(updated.version,2);await assert.rejects(demo('update_draft',{draft_id:d.id,version:1,values:[]}),/changed elsewhere/);
 await demo('render_prompt',{draft_id:d.id});await demo('list_templates',{});
 for(const kind of ['templates','drafts']){const exported=await demo('export_library',{kind});assert.equal((exported.records as ExportRecord[]).length,1);assert.ok(!JSON.stringify(exported).includes('Existing retained value'));}
 const removed=await demo('delete_library_data',{confirmation:'DELETE MY LIBRARY DATA'});assert.deepEqual(removed.deleted,{drafts:1,templates:1});
 assert.deepEqual((await demo('open_library',{})).recentDrafts,[]);
 assert.equal(((await owner.call('render_prompt',{draft_id:existing.id})).draft as Draft).renderedPrompt,'Personal Existing retained value');
 assert.equal((await owner.call('open_library',{draft_id:existing.id,workspace:'library'})).workspace,'library');
 assert.equal(await before(),original);
});

test('workspace cannot spoof identity or select a reserved namespace',async()=>{
 const a=new LibraryService(db(),'owner',TEST_LIMITS);
 for(const workspace of ['other','owner','\u001fprompt-library-demo:v1:owner',null])await assert.rejects(a.call('list_templates',{workspace}),/workspace/);
 await assert.rejects(a.call('list_templates',{workspace:'demo',owner_id:'another'}),/Unrecognized/);
 assert.throws(()=>new LibraryService(db(),'\u001fprompt-library-demo:v1:owner',TEST_LIMITS),/Sign in/);
 for(const tool of TOOLS){assert.deepEqual((tool.inputSchema.properties as {workspace:{enum:string[]}}).workspace.enum,['library','demo']);assert.ok((tool.outputSchema.required as string[]).includes('workspace'));}
});
