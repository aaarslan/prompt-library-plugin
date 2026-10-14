import {spawn,spawnSync} from 'node:child_process';
import {mkdtempSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const stateDirectory=mkdtempSync(join(tmpdir(),'prompt-library-http-'));
const localEnv={...process.env,XDG_CONFIG_HOME:process.cwd()+'/.sites-runtime/config'};
const limits={templatesPerWorkspace:2,draftsPerWorkspace:2,bytesPerWorkspace:500000,requestsPerMinute:1000,writesPerMinute:1000,globalRequestsPerMinute:2000};
for(const name of readdirSync('drizzle').filter(name=>name.endsWith('.sql')).sort()){
 const result=spawnSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--persist-to',stateDirectory,'--config','dist/server/wrangler.json','--file','drizzle/'+name],{env:localEnv,encoding:'utf8'});
 if(result.status!==0){rmSync(stateDirectory,{recursive:true,force:true});throw new Error('Fresh local migration failed: '+result.stdout+result.stderr);}
}
const child=spawn(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','dev','--config','dist/server/wrangler.json','--local','--persist-to',stateDirectory,'--ip','127.0.0.1','--port','4187','--inspector-port','0','--var','PROMPT_LIBRARY_LIMITS:'+JSON.stringify(limits)],{env:localEnv,stdio:['ignore','pipe','pipe']});
let log='';child.stdout.on('data',d=>log+=d);child.stderr.on('data',d=>log+=d);
const base='http://127.0.0.1:4187/mcp';
let seq=0;
async function rpc(method,params,owner,extra={}){const r=await fetch(base,{method:'POST',headers:{'content-type':'application/json',...(owner?{'oai-authenticated-user-id':owner}:{}),...extra},body:JSON.stringify({jsonrpc:'2.0',id:++seq,method,params})});const raw=await r.text();let data;try{data=JSON.parse(raw)}catch{throw new Error('Non-JSON MCP response '+r.status+' for '+method+': '+raw.slice(0,1000));}return {status:r.status,data};}
try{
 let ready=false;for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,250));try{const r=await fetch(base);if(r.status===405){ready=true;break}}catch{}}
 if(!ready)throw new Error('Preview unavailable: '+log.slice(-3000));
 // Let the local development worker finish its startup reload before exercising POSTs.
 await new Promise(r=>setTimeout(r,1500));
 assert.equal((await rpc('initialize',{protocolVersion:'2025-06-18'})).data.result.serverInfo.name,'prompt-library');
 const discovery=(await rpc('server/discover',{})).data.result;
 assert.ok(discovery.supportedVersions.includes('2026-07-28'));
 assert.ok(discovery.capabilities.resources,'Resource discovery must be advertised to clients that use server/discover');
 const latest=(await rpc('initialize',{protocolVersion:'2026-07-28'},undefined,{'MCP-Protocol-Version':'2026-07-28'})).data.result;
 assert.equal(latest.protocolVersion,'2026-07-28');
 assert.deepEqual(discovery.capabilities,latest.capabilities,'Discovery and initialization must advertise the same supported resources');
 assert.equal(latest.serverInfo.version,'2.0.0');
 assert.equal((await rpc('initialize',{protocolVersion:'unsupported'})).data.result.protocolVersion,'2026-07-28');
 assert.equal((await rpc('tools/list',{},undefined,{'MCP-Protocol-Version':'2026-07-28'})).data.result.tools.length,9);
 assert.equal((await rpc('tools/list',{})).data.result.tools.length,9);
 assert.equal((await rpc('tools/list',{},undefined,{'MCP-Protocol-Version':'bogus'})).status,400);
 assert.equal((await rpc('tools/list',{},undefined,{'Origin':'https://evil.example'})).status,403);
 const resourceList=(await rpc('resources/list',{})).data.result.resources;
 assert.equal(resourceList.length,1);
 const uiTool=(await rpc('tools/list',{})).data.result.tools.find(t=>t.name==='open_library');
 assert.equal(uiTool._meta.ui.resourceUri,resourceList[0].uri);
 const resource=(await rpc('resources/read',{uri:resourceList[0].uri})).data.result.contents[0];assert.equal(resource.uri,resourceList[0].uri);assert.equal(resource.mimeType,'text/html;profile=mcp-app');assert.ok(resource.text.includes('Prompt Library'));assert.ok(resource.text.includes('workspace-switch'));
 for(const version of [1,2,3,4,5]){const uri='ui://prompt-library/library-v'+version+'.html';const legacyUi=(await rpc('resources/read',{uri})).data.result.contents[0];assert.equal(legacyUi.uri,uri);assert.ok(legacyUi.text.includes('Prompt Library'));}
 const modernMeta={'io.modelcontextprotocol/protocolVersion':'2026-07-28','io.modelcontextprotocol/clientCapabilities':{}};
 for(const [method,params] of [['server/discover',{}],['tools/list',{}],['resources/list',{}],['resources/templates/list',{}],['resources/read',{uri:resourceList[0].uri}]]){
  for(const headers of [{},{'MCP-Protocol-Version':'2026-07-28'}]){
   const current=await rpc(method,{...params,_meta:modernMeta},undefined,headers);
   assert.equal(current.status,200);assert.equal(current.data.result.resultType,'complete');assert.equal(current.data.result.ttlMs,0);assert.equal(current.data.result.cacheScope,'private');
   if(method==='resources/read'){assert.equal(current.data.result.contents[0].text,resource.text);assert.deepEqual(Object.keys(current.data.result.contents[0]).sort(),['_meta','mimeType','text','uri']);}
  }
 }
 for(const headers of [{},{'MCP-Protocol-Version':'2025-11-25'}]){
  const legacy=(await rpc('resources/read',{uri:resourceList[0].uri},undefined,headers)).data.result;
  for(const field of ['resultType','ttlMs','cacheScope'])assert.equal(Object.hasOwn(legacy,field),false);
 }
 assert.equal((await rpc('resources/read',{uri:resourceList[0].uri,_meta:modernMeta},undefined,{'MCP-Protocol-Version':'2025-11-25'})).status,400);
 assert.equal((await rpc('resources/read',{uri:resourceList[0].uri,_meta:{'io.modelcontextprotocol/protocolVersion':'unsupported'}})).status,400);
 assert.equal((await rpc('initialize',{protocolVersion:'2026-07-28'})).data.result.resultType,'complete');
 const modernRead=(await rpc('tools/call',{name:'list_templates',arguments:{},_meta:modernMeta},'test_alice',{'MCP-Protocol-Version':'2026-07-28'})).data.result;
 assert.equal(modernRead.resultType,'complete');assert.equal(modernRead.structuredContent.templates.length,35);assert.equal(Object.hasOwn(modernRead,'ttlMs'),false);assert.equal(Object.hasOwn(modernRead,'cacheScope'),false);
 console.log('MCP 2026 wire contract passed: cache metadata, complete results, body/header agreement, legacy compatibility, and uncached tool results.');
 assert.equal((await rpc('tools/call',{name:'list_templates',arguments:{}})).status,401);
 const list=(await rpc('tools/call',{name:'list_templates',arguments:{}},'test_alice')).data.result;assert.equal(list.structuredContent.templates.length,35);assert.equal(list.structuredContent.catalogVersion,2);assert.equal(list.structuredContent.hasMore,false);assert.ok(list.structuredContent.templates.every(t=>!('body' in t)));assert.ok(list.content[0].text.length<300);
 const draft=(await rpc('tools/call',{name:'prepare_draft',arguments:{template_id:'sample_project_brief',values:[{key:'project_name',value:'Fictional Orchard',source:'provided'}]}},'test_alice')).data.result.structuredContent.draft;
 assert.ok(draft.id);assert.ok(draft.missingFields.includes('goal'));
 const denied=(await rpc('tools/call',{name:'render_prompt',arguments:{draft_id:draft.id}},'test_bob')).data.result;assert.equal(denied.isError,true);
 const reopened=(await rpc('tools/call',{name:'open_library',arguments:{draft_id:draft.id}},'test_alice')).data.result.structuredContent;assert.equal(reopened.draft.values[0].value,'Fictional Orchard');
 assert.equal((await rpc('tools/call',{name:'export_library',arguments:{kind:'drafts'}})).status,401);
 const exported=(await rpc('tools/call',{name:'export_library',arguments:{kind:'drafts'}},'test_alice')).data.result.structuredContent;assert.equal(exported.records.length,1);assert.ok(!('renderedPrompt' in exported.records[0].draft));
 const bobDraft=(await rpc('tools/call',{name:'prepare_draft',arguments:{template_id:'sample_project_brief',values:[{key:'goal',value:'Fictional Bob boundary test',source:'provided'}]}},'test_bob')).data.result.structuredContent.draft;
 assert.equal((await rpc('tools/call',{name:'open_library',arguments:{workspace:'demo'}})).status,401);
 const normalBefore=(await rpc('tools/call',{name:'export_library',arguments:{kind:'drafts'}},'test_alice')).data.result.structuredContent.records;
 const demoCall=async(name,args={})=>{const out=(await rpc('tools/call',{name,arguments:{...args,workspace:'demo'}},'test_alice')).data.result;assert.equal(out.isError,undefined);assert.equal(out.structuredContent.workspace,'demo');return out.structuredContent};
 await demoCall('delete_library_data',{confirmation:'DELETE MY LIBRARY DATA'});
 const isolated=await demoCall('open_library');assert.equal(isolated.recentDrafts.length,0);assert.ok(isolated.templates.every(t=>t.sample));
 assert.equal((await rpc('tools/call',{name:'render_prompt',arguments:{workspace:'demo',draft_id:draft.id}},'test_alice')).data.result.isError,true);
 const demoTemplate=(await demoCall('save_template',{title:'Demo: Orchard Club',description:'Fictional local D1 fixture',body:'Fictional {{goal}}'})).template;
 const demoDraft=(await demoCall('prepare_draft',{template_id:demoTemplate.id,values:[{key:'goal',value:'Book club launch',source:'provided'}]})).draft;
 assert.equal((await rpc('tools/call',{name:'render_prompt',arguments:{draft_id:demoDraft.id}},'test_alice')).data.result.isError,true);
 assert.equal((await rpc('tools/call',{name:'render_prompt',arguments:{workspace:'demo',draft_id:demoDraft.id}},'test_bob')).data.result.isError,true);
 assert.equal((await demoCall('open_library',{draft_id:demoDraft.id})).draft.id,demoDraft.id);
 assert.equal((await demoCall('update_draft',{draft_id:demoDraft.id,version:1,values:[{key:'goal',value:'Autumn book club launch',source:'provided'}]})).draft.version,2);
 assert.equal((await demoCall('render_prompt',{draft_id:demoDraft.id})).draft.renderedPrompt,'Fictional Autumn book club launch');
 for(const kind of ['templates','drafts'])assert.equal((await demoCall('export_library',{kind})).records.length,1);
 await demoCall('save_template',{title:'Quota fixture two',description:'',body:'Small'});
 const quota=(await rpc('tools/call',{name:'save_template',arguments:{workspace:'demo',title:'Quota fixture three',description:'',body:'Small'}},'test_alice')).data.result;assert.equal(quota.isError,true);assert.match(quota.content[0].text,/budget exceeded/);
 await demoCall('delete_library_data',{confirmation:'DELETE MY LIBRARY DATA'});
 const normalAfter=(await rpc('tools/call',{name:'export_library',arguments:{kind:'drafts'}},'test_alice')).data.result.structuredContent.records;
 assert.deepEqual(normalAfter,normalBefore);
 assert.deepEqual((await rpc('tools/call',{name:'render_prompt',arguments:{draft_id:draft.id}},'test_alice')).data.result.structuredContent.draft,draft);
 console.log('Local D1 demo isolation passed: reserved namespace round-trip, cross-workspace/user denial, update/export/delete, normal records unchanged.');
 const unconfirmed=(await rpc('tools/call',{name:'delete_library_data',arguments:{confirmation:'yes'}},'test_alice')).data.result;assert.equal(unconfirmed.isError,true);
 const removed=(await rpc('tools/call',{name:'delete_library_data',arguments:{confirmation:'DELETE MY LIBRARY DATA'}},'test_alice')).data.result.structuredContent;assert.ok(removed.deleted.drafts>=1);
 assert.equal((await rpc('tools/call',{name:'export_library',arguments:{kind:'drafts'}},'test_alice')).data.result.structuredContent.records.length,0);
 assert.equal((await rpc('tools/call',{name:'render_prompt',arguments:{draft_id:bobDraft.id}},'test_bob')).data.result.structuredContent.draft.id,bobDraft.id);
 const invalidUtf8=await fetch(base,{method:'POST',headers:{'content-type':'application/json'},body:new Uint8Array([123,34,120,34,58,34,255,34,125])});assert.equal((await invalidUtf8.json()).error.code,-32700);
 const oversized=JSON.stringify({jsonrpc:'2.0',id:1,method:'ping',params:{text:'界'.repeat(40000)}});
 const stream=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode(oversized));controller.close();}});
 const rejected=await fetch(base,{method:'POST',headers:{'content-type':'application/json','connection':'close'},body:stream,duplex:'half'});assert.equal(rejected.status,413);
 await new Promise(resolve=>setTimeout(resolve,750));
 try{assert.deepEqual((await rpc('ping',{})).data.result,{});}catch(error){if(!error.message.startsWith('Non-JSON MCP response 500 for ping: Error: Network connection lost.'))throw error;console.warn('KNOWN LOCAL TRANSPORT LIMIT: Miniflare lost the first post-cancellation connection. Checking recovery with one explicit read-only ping; no writes are retried.');await new Promise(resolve=>setTimeout(resolve,250));assert.deepEqual((await rpc('ping',{})).data.result,{});}
 console.log('HTTP smoke passed: current discovery/negotiation and legacy initialization; 9 tools; UI resource; protocol and Origin rejection; anonymous 401; authenticated D1 read/write/reopen; cross-owner draft denial; paginated export; explicit-confirm atomic deletion preserving another synthetic owner.');
}catch(e){console.error(e);console.error(log.split('\n').filter(line=>!line.startsWith('│')&&!line.startsWith('├')&&!line.startsWith('└')&&!line.startsWith('┌')).slice(-50).join('\n'));process.exitCode=1;}finally{child.kill('SIGTERM');const killTimer=setTimeout(()=>child.kill('SIGKILL'),1500);if(child.exitCode===null&&child.signalCode===null)await new Promise(resolve=>child.once('exit',resolve));clearTimeout(killTimer);rmSync(stateDirectory,{recursive:true,force:true});}
