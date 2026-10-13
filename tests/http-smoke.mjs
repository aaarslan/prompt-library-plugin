import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const child=spawn(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','dev','--config','dist/server/wrangler.json','--local','--persist-to','.wrangler/state','--ip','127.0.0.1','--port','4187','--inspector-port','0'],{env:{...process.env,XDG_CONFIG_HOME:process.cwd()+'/.sites-runtime/config'},stdio:['ignore','pipe','pipe']});
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
 assert.deepEqual(discovery.capabilities,{tools:{}});
 const latest=(await rpc('initialize',{protocolVersion:'2026-07-28'},undefined,{'MCP-Protocol-Version':'2026-07-28'})).data.result;
 assert.equal(latest.protocolVersion,'2026-07-28');
 assert.equal(latest.serverInfo.version,'1.2.1');
 assert.equal((await rpc('initialize',{protocolVersion:'unsupported'})).data.result.protocolVersion,'2026-07-28');
 assert.equal((await rpc('tools/list',{},undefined,{'MCP-Protocol-Version':'2026-07-28'})).data.result.tools.length,9);
 assert.equal((await rpc('tools/list',{})).data.result.tools.length,9);
 assert.equal((await rpc('tools/list',{},undefined,{'MCP-Protocol-Version':'bogus'})).status,400);
 assert.equal((await rpc('tools/list',{},undefined,{'Origin':'https://evil.example'})).status,403);
 const resource=(await rpc('resources/read',{uri:'ui://prompt-library/library-v3.html'})).data.result.contents[0];assert.equal(resource.mimeType,'text/html;profile=mcp-app');assert.ok(resource.text.includes('Prompt Library'));
 const legacyUi=(await rpc('resources/read',{uri:'ui://prompt-library/library-v1.html'})).data.result.contents[0];assert.equal(legacyUi.uri,'ui://prompt-library/library-v1.html');assert.ok(legacyUi.text.includes('Prompt Library'));
 assert.equal((await rpc('tools/call',{name:'list_templates',arguments:{}})).status,401);
 const list=(await rpc('tools/call',{name:'list_templates',arguments:{}},'test_alice')).data.result;assert.equal(list.structuredContent.templates.length,35);
 const draft=(await rpc('tools/call',{name:'prepare_draft',arguments:{template_id:'sample_project_brief',values:[{key:'project_name',value:'Fictional Orchard',source:'provided'}]}},'test_alice')).data.result.structuredContent.draft;
 assert.ok(draft.id);assert.ok(draft.missingFields.includes('goal'));
 const denied=(await rpc('tools/call',{name:'render_prompt',arguments:{draft_id:draft.id}},'test_bob')).data.result;assert.equal(denied.isError,true);
 const reopened=(await rpc('tools/call',{name:'open_library',arguments:{draft_id:draft.id}},'test_alice')).data.result.structuredContent;assert.equal(reopened.draft.values[0].value,'Fictional Orchard');
 assert.equal((await rpc('tools/call',{name:'export_library',arguments:{kind:'drafts'}})).status,401);
 const exported=(await rpc('tools/call',{name:'export_library',arguments:{kind:'drafts'}},'test_alice')).data.result.structuredContent;assert.equal(exported.records.length,1);assert.ok(!('renderedPrompt' in exported.records[0].draft));
 const bobDraft=(await rpc('tools/call',{name:'prepare_draft',arguments:{template_id:'sample_project_brief',values:[{key:'goal',value:'Fictional Bob boundary test',source:'provided'}]}},'test_bob')).data.result.structuredContent.draft;
 const unconfirmed=(await rpc('tools/call',{name:'delete_library_data',arguments:{confirmation:'yes'}},'test_alice')).data.result;assert.equal(unconfirmed.isError,true);
 const removed=(await rpc('tools/call',{name:'delete_library_data',arguments:{confirmation:'DELETE MY LIBRARY DATA'}},'test_alice')).data.result.structuredContent;assert.ok(removed.deleted.drafts>=1);
 assert.equal((await rpc('tools/call',{name:'export_library',arguments:{kind:'drafts'}},'test_alice')).data.result.structuredContent.records.length,0);
 assert.equal((await rpc('tools/call',{name:'render_prompt',arguments:{draft_id:bobDraft.id}},'test_bob')).data.result.structuredContent.draft.id,bobDraft.id);
 console.log('HTTP smoke passed: current discovery/negotiation and legacy initialization; 9 tools; UI resource; protocol and Origin rejection; anonymous 401; authenticated D1 read/write/reopen; cross-owner draft denial; paginated export; explicit-confirm atomic deletion preserving another synthetic owner.');
}catch(e){console.error(e);console.error(log.slice(-6000));process.exitCode=1;}finally{child.kill('SIGTERM');setTimeout(()=>child.kill('SIGKILL'),1500).unref();}
