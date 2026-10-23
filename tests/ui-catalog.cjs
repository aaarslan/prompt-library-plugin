const {JSDOM}=require('jsdom');
const assert=require('node:assert/strict');
const {LibraryService}=require('../lib/library-service.ts');
const {LIBRARY_HTML}=require('../lib/library-ui.ts');
const {createTestDatabase,TEST_LIMITS}=require('./test-db.ts');
const {db}=createTestDatabase();
const service=new LibraryService(db,'fictional-catalog-owner',TEST_LIMITS);
let dom,repeatCursor=false;
const calls=[],errors=[];
const host={postMessage(message){calls.push(message);setTimeout(async()=>{let result={};try{if(message.method==='ui/initialize')result={hostCapabilities:{serverTools:{}}};else if(message.method==='tools/call'){const data=await service.call(message.params.name,message.params.arguments);if(repeatCursor&&message.params.name==='list_templates')data.nextCursor=message.params.arguments.after_id;result={content:[],structuredContent:data};}dom.window.dispatchEvent(new dom.window.MessageEvent('message',{source:host,data:{jsonrpc:'2.0',id:message.id,result}}));}catch(error){dom.window.dispatchEvent(new dom.window.MessageEvent('message',{source:host,data:{jsonrpc:'2.0',id:message.id,result:{isError:true,content:[{type:'text',text:error.message}]}}}));}},0)}};
const $=selector=>dom.window.document.querySelector(selector);
const wait=()=>new Promise(resolve=>setTimeout(resolve,10));
async function settle(){for(let i=0;i<300;i++){await wait();if(!$('#new-button').disabled)return;}throw new Error('UI did not settle');}
function click(selector){assert($(selector));assert(!$(selector).disabled);$(selector).click();}
(async()=>{
 const saved=[];
 for(let i=0;i<211;i++)saved.push((await service.call('save_template',{title:'Fictional template '+String(i).padStart(3,'0'),description:'Catalog fixture',category:'Writing',body:'Private body '+i+' {{person}}'})).template);
 const last=saved.sort((a,b)=>a.id.localeCompare(b.id)).at(-1);
 dom=new JSDOM(LIBRARY_HTML,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local.test',beforeParse(window){Object.defineProperty(window,'parent',{value:host});window.HTMLElement.prototype.scrollIntoView=function(){};window.HTMLDialogElement.prototype.showModal=function(){this.open=true};window.HTMLDialogElement.prototype.close=function(){this.open=false};window.addEventListener('error',event=>errors.push(event.message));}});
 await new Promise(resolve=>setTimeout(resolve,650));
 assert.equal(calls.filter(call=>call.method==='tools/call').length,0);assert($('#new-button').disabled);
 dom.window.dispatchEvent(new dom.window.MessageEvent('message',{source:host,data:{jsonrpc:'2.0',method:'ui/notifications/tool-input',params:{arguments:{workspace:'demo'}}}}));
 await new Promise(resolve=>setTimeout(resolve,650));await settle();
 assert.equal(calls.filter(call=>call.method==='tools/call').at(-1).params.arguments.workspace,'demo');assert.match($('#workspace-label').textContent,/Demo workspace/);
 click('#workspace-switch');await settle();
 const normalCallsStart=calls.length;
 assert.match($('#catalog-status').textContent,/60 template summaries loaded/);assert(!$('#load-more-templates').hidden);assert.match($('#template-list').textContent,/Review fields/);assert(!dom.window.document.body.textContent.includes('Private body'));
 repeatCursor=true;click('#load-more-templates');await settle();assert.match($('#error-text').textContent,/could not continue safely/);assert.match($('#catalog-status').textContent,/60 template summaries loaded/);
 repeatCursor=false;let pages=0;
 while(!$('#load-more-templates').hidden){click('#load-more-templates');await settle();assert(++pages<=8);}
 assert.equal(pages,8);assert($('#catalog-status').hidden);assert.equal($('#scope-list [data-scope="all"] .nav-count').textContent,'246');
 $('#search').value='Project brief';$('#search').dispatchEvent(new dom.window.Event('input',{bubbles:true}));
 const writesBefore=calls.filter(c=>c.method==='tools/call'&&['save_template','prepare_draft','update_draft','delete_library_data'].includes(c.params.name)).length;
 click('[data-preview-template="sample_project_brief"]');await settle();assert($('#gallery-preview').open);assert.equal($('#gallery-preview-title').textContent,'Project brief');assert.match($('#gallery-preview-body').textContent,/\{\{/);assert.equal($('#workspace').hidden,true);assert.equal($('#gallery-preview-fields').children.length,5);click('#back-gallery');assert(!$('#gallery-preview').open);
 $('#search').value='';$('#search').dispatchEvent(new dom.window.Event('input',{bubbles:true}));$('#gallery-sort').value='title';$('#gallery-sort').dispatchEvent(new dom.window.Event('change',{bubbles:true}));const titles=Array.from(dom.window.document.querySelectorAll('.template-card h3')).map(n=>n.textContent);assert.deepEqual(titles,[...titles].sort((a,b)=>a.localeCompare(b)));
 const writeCount=calls.filter(c=>c.method==='tools/call'&&['save_template','prepare_draft','update_draft','delete_library_data'].includes(c.params.name)).length;assert.equal(writeCount,writesBefore,'Gallery preview and sorting never save or mutate data');
 $('#search').value='Project brief';$('#search').dispatchEvent(new dom.window.Event('input',{bubbles:true}));click('[data-preview-template="sample_project_brief"]');await settle();click('#use-preview-template');await settle();assert.equal($('#workspace-title').textContent,'Project brief');assert(!$('#gallery-preview').open);click('[data-action="back-library"]');
 console.log('PASS: explicit read-only template preview, variable chips, alphabetical gallery sorting, and preview-to-personalize flow.');

 $('#search').value=last.title;$('#search').dispatchEvent(new dom.window.Event('input',{bubbles:true}));click('[data-template="'+last.id+'"]');await settle();assert.equal($('#workspace-title').textContent,last.title);assert.equal($('#workspace .template-body pre').textContent,last.body);
 const opens=calls.filter(call=>call.method==='tools/call'&&call.params.name==='open_library');assert.equal(opens.at(-1).params.arguments.template_id,last.id);
 assert(calls.slice(normalCallsStart).filter(call=>call.method==='tools/call').every(call=>call.params.arguments.workspace==='library'));
 click('[data-action="back-library"]');assert($('#load-more-templates').hidden);assert.deepEqual(errors,[]);
 console.log('PASS: real-service summary paging beyond 200 records, explicit partial counts, cursor-loop rejection, full-body selection, and retained catalog state (local simulated bridge).');
 dom.window.close();
 calls.length=0;
 const selectedOnly=await service.call('open_library',{workspace:'demo',template_id:'sample_project_brief'});
 dom=new JSDOM(LIBRARY_HTML,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local.test',beforeParse(window){Object.defineProperty(window,'parent',{value:host});window.HTMLElement.prototype.scrollIntoView=function(){};window.HTMLDialogElement.prototype.showModal=function(){this.open=true};window.HTMLDialogElement.prototype.close=function(){this.open=false};window.addEventListener('error',event=>errors.push(event.message));}});
 dom.window.dispatchEvent(new dom.window.MessageEvent('message',{source:host,data:{jsonrpc:'2.0',method:'ui/notifications/tool-result',params:{structuredContent:selectedOnly}}}));
 await new Promise(resolve=>setTimeout(resolve,650));await settle();
 assert.equal($('#workspace-title').textContent,'Project brief');assert.equal($('#scope-list [data-scope="all"] .nav-count').textContent,'35');
 const initialReads=calls.filter(call=>call.method==='tools/call');assert.deepEqual(initialReads.map(call=>call.params.name),['list_templates']);assert.equal(initialReads[0].params.arguments.workspace,'demo');
 click('[data-action="back-library"]');assert.equal($('#scope-list [data-scope="all"] .nav-count').textContent,'35');assert.deepEqual(errors,[]);
 console.log('PASS: selected-template launch preserves the editor and loads the complete Demo catalog with one read (local simulated bridge).');
 dom.window.close();
})().catch(error=>{console.error(error);if(dom)dom.window.close();process.exitCode=1;});
