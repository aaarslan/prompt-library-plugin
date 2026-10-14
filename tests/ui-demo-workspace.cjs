const {JSDOM}=require('jsdom');
const assert=require('node:assert/strict');
const {LibraryService}=require('../lib/library-service.ts');
const {LIBRARY_HTML}=require('../lib/library-ui.ts');
const {createTestDatabase,TEST_LIMITS}=require('./test-db.ts');
const {sql,db:database}=createTestDatabase();
const service=new LibraryService(database,'fictional-local-owner',TEST_LIMITS);
let dom;const calls=[],errors=[];const envelope=data=>({content:[],structuredContent:data});
function response(id,result){dom.window.dispatchEvent(new dom.window.MessageEvent('message',{source:host,data:{jsonrpc:'2.0',id,result}}))}
function emit(data){dom.window.dispatchEvent(new dom.window.MessageEvent('message',{source:host,data:{jsonrpc:'2.0',method:'ui/notifications/tool-result',params:envelope(data)}}))}
const host={postMessage(message){calls.push(message);setTimeout(async()=>{try{if(message.method==='ui/initialize')response(message.id,{hostCapabilities:{serverTools:{},message:{text:{}},updateModelContext:{structuredContent:{}}}});else if(message.method==='tools/call')response(message.id,envelope(await service.call(message.params.name,message.params.arguments)));else if(message.id)response(message.id,{})}catch(e){response(message.id,{isError:true,content:[{type:'text',text:e.message}]})}},0)}};
const wait=()=>new Promise(r=>setTimeout(r,40));
const $=selector=>dom.window.document.querySelector(selector);
function click(selector){const el=$(selector);assert(el,selector);assert(!el.disabled,selector+' disabled');el.click()}
function input(selector,value){const el=$(selector);el.value=value;el.dispatchEvent(new dom.window.Event('input',{bubbles:true}))}
(async()=>{
 const personal=(await service.call('save_template',{title:'Synthetic normal private template',description:'Preservation fixture',body:'Private {{detail}}'})).template;
 const existing=(await service.call('prepare_draft',{template_id:personal.id,values:[{key:'detail',value:'Retain this normal fixture unchanged',source:'provided'}]})).draft;
 let original=JSON.stringify(sql.prepare('SELECT * FROM drafts WHERE owner_id = ?').all('fictional-local-owner'));
 dom=new JSDOM(LIBRARY_HTML,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local.test',beforeParse(w){Object.defineProperty(w,'parent',{value:host});w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false};w.addEventListener('error',e=>errors.push(e.message))}});
 await wait();emit(await service.call('open_library',{draft_id:existing.id}));
 assert.equal($('#workspace-label').hidden,true,'Normal library has no demo banner');assert.equal($('#footer-workspace').textContent,'Your library');assert.equal($('#workspace-switch').closest('footer').className,'app-footer');assert.equal(dom.window.document.querySelector('header #workspace-switch'),null);assert.equal(dom.window.document.querySelectorAll('footer nav[aria-label=\"Policies and support\"] a').length,3);assert.match($('#eligibility-notice').textContent,/Adults only.*18\+/);assert.equal($('#eligibility-notice').closest('footer').className,'app-footer');
 assert.equal($('textarea[data-key="detail"]').value,'Retain this normal fixture unchanged');
 input('textarea[data-key="detail"]','Unsaved normal edit');click('#workspace-switch');await wait();assert.match($('#status').textContent,/Save your current edits/);assert.match($('#workspace-label').textContent,/Your library/);
 // Explicitly save the restored fixture before establishing the demo baseline.
 input('textarea[data-key="detail"]','Retain this normal fixture unchanged');click('#save-draft');await wait();
 original=JSON.stringify(sql.prepare('SELECT * FROM drafts WHERE owner_id = ?').all('fictional-local-owner'));
 click('#workspace-switch');await wait();assert.equal($('#workspace-label').hidden,false);assert.match($('#workspace-label').textContent,/Demo workspace.*fictional data only/);assert($('#workspace').hidden);assert($('#recent-drafts').hidden);assert(!dom.window.document.body.textContent.includes(personal.title));assert.equal($('#template-title').value,'');
 const demoStart=calls.length;
 emit(await service.call('open_library',{draft_id:existing.id}));await wait();assert($('#workspace').hidden,'Normal notification must be ignored in demo');
 emit({workspace:'library',deleted:{templates:1,drafts:1},templates:[],recentDrafts:[],deletionScope:'Normal fixture'});assert.match($('#workspace-label').textContent,/Demo workspace/);
 click('[data-template="sample_project_brief"]');await wait();click('#fill-chat');await wait();
 const fill=calls.filter(c=>c.method==='ui/message').at(-1).params.content[0].text;assert.match(fill,/workspace="demo" on EVERY/);assert.match(fill,/only the fictional demo scenario/);
 const demoDraft=await service.call('prepare_draft',{workspace:'demo',template_id:'sample_project_brief',values:[{key:'project_name',value:'Fictional Orchard Club',source:'provided'}]});emit(demoDraft);await wait();
 input('textarea[data-key="goal"]','Fictional reading club launch');click('#save-draft');await wait();
 click('[data-action="edit-template"]');input('#template-title','Demo: Orchard Club');$('#template-form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));await wait();
 click('#import-button');input('#import-text','Fictional import {{topic}}');click('#preview-import');await wait();assert(!$('#import-summary').hidden);$('#template-dialog').close();
 click('#data-button');assert.match($('#data-dialog-title').textContent,/Demo/);assert.match($('#data-delete-warning').textContent,/Your library records are preserved/);
 click('#export-library');await new Promise(r=>setTimeout(r,200));const exported=JSON.parse($('#data-export-json').value);assert.equal(exported.workspace,'demo');assert.equal(exported.drafts.length,1);assert(!JSON.stringify(exported).includes('Retain this normal fixture'));
 input('#data-delete-confirmation','DELETE MY LIBRARY DATA');click('#delete-library-data');await wait();assert.match($('#status').textContent,/Demo workspace data was deleted/);
 assert.equal(JSON.stringify(sql.prepare('SELECT * FROM drafts WHERE owner_id = ?').all('fictional-local-owner')),original);
 const demoCalls=calls.slice(demoStart).filter(c=>c.method==='tools/call');assert(demoCalls.length>=7);assert(demoCalls.every(c=>c.params.arguments.workspace==='demo'));
 click('#done-data-dialog');click('#workspace-switch');await wait();assert.match($('#workspace-label').textContent,/Your library/);assert(!$('#recent-drafts').hidden);assert.equal($('#data-export-json').value,'');
 assert.equal(calls.filter(c=>c.method==='tools/call').at(-1).params.arguments.workspace,'library');
 assert.deepEqual(errors,[]);console.log('PASS: normal default, discreet accessible policy footer, adults-only requirement, explicit demo entry, demo UI isolation, explicit labels, unsaved-edit guard, workspace-scoped fill/import/save/export/delete, stale cross-workspace notifications, cleared caches, and normal draft byte preservation (local simulated bridge).');
 dom.window.close();sql.close();
})().catch(e=>{console.error(e);if(dom){console.error('UI error:', $('#error-text').textContent);dom.window.close()}sql.close();process.exit(1)});
