import { z } from 'zod';
import { fieldsFor, normalizeValues, render, SAMPLE_TEMPLATES, type Template, type FieldValue, InputError } from './prompt-core';
import { byteLength, storedBytesSql, type LibraryLimits } from './library-limits';
export type LibraryDB = D1Database;
export type Workspace = 'library' | 'demo';
const workspaceSchema=z.enum(['library','demo']).optional();
const demoOwnerKey=(ownerId:string)=>'\u001fprompt-library-demo:v1:'+ownerId;
const valueSchema=z.object({key:z.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,63}$/),value:z.string().max(12000),source:z.enum(['provided','inferred']),evidence:z.string().max(1200).optional()}).strict().superRefine((v,ctx)=>{if(v.source==='inferred'&&!v.evidence?.trim())ctx.addIssue({code:z.ZodIssueCode.custom,path:['evidence'],message:'An inferred value needs brief supporting evidence or an explicit assumption.'});});
const input=<T extends z.ZodRawShape>(shape:T)=>z.object({...shape,workspace:workspaceSchema}).strict();
export const schemas={
 list_templates:input({after_id:z.string().min(1).max(100).optional()}),
 open_library:input({template_id:z.string().max(100).optional(),draft_id:z.string().max(100).optional()}),
 save_template:input({title:z.string().trim().min(1).max(120),description:z.string().trim().max(600),body:z.string().trim().min(1).max(24000),category:z.string().trim().min(1).max(50).optional(),template_id:z.string().max(100).optional()}),
 preview_import:input({text:z.string().min(1).max(30000)}),
 prepare_draft:input({template_id:z.string().max(100),values:z.array(valueSchema).max(30)}),
 update_draft:input({draft_id:z.string().max(100),version:z.number().int().min(1),values:z.array(valueSchema).max(30)}),
 render_prompt:input({draft_id:z.string().max(100)}),
 export_library:input({kind:z.enum(['templates','drafts']),after_id:z.string().max(100).optional()}),
 delete_library_data:input({confirmation:z.literal('DELETE MY LIBRARY DATA')}),
};
export type ToolName=keyof typeof schemas;
type ToolInput = {[Name in ToolName]:{name:Name;args:z.infer<(typeof schemas)[Name]>}}[ToolName];
type Row={id:string;owner_id:string;title:string;description:string;body:string;category:string;created_at:string;updated_at:string};
type DraftRow={id:string;owner_id:string;template_id:string;template_snapshot:string;field_values:string;version:number;created_at:string;updated_at:string};
const asTemplate=(r:Row):Template=>({id:r.id,title:r.title,description:r.description,body:r.body,category:r.category,fields:fieldsFor(r.body),sample:false});
function asDraft(r:DraftRow){const template=JSON.parse(r.template_snapshot) as Template;const values=JSON.parse(r.field_values) as FieldValue[];return {template,draft:{id:r.id,templateId:r.template_id,version:r.version,values,...render(template,values),updatedAt:r.updated_at}};}
export class LibraryService {
 constructor(private db:LibraryDB,private ownerId:string,private limits?:LibraryLimits){if(!ownerId||/[\u0000-\u001f\u007f]/.test(ownerId)) throw new InputError('Sign in to use your private library.');}
 private writeLimits(){if(!this.limits)throw new InputError('Library storage limits are not configured. No change was saved.');return this.limits;}
 async list(ownerId=this.ownerId,afterId=''){
  const rows=await this.db.prepare('SELECT id, title, description, category FROM templates WHERE owner_id = ? AND id > ? ORDER BY id ASC LIMIT 26').bind(ownerId,afterId).all<Pick<Row,'id'|'title'|'description'|'category'>>();
  const custom=rows.results.slice(0,25);const hasMore=rows.results.length>25;
  const samples=afterId?[]:SAMPLE_TEMPLATES.map(({id,title,description,category,sample})=>({id,title,description,category,sample}));
  return {catalogVersion:2,templates:[...custom.map(t=>({...t,sample:false})),...samples],hasMore,nextCursor:hasMore?custom[custom.length-1].id:null,afterId:afterId||null};
 }
 async template(id:string,ownerId=this.ownerId){const sample=SAMPLE_TEMPLATES.find(t=>t.id===id);if(sample)return sample;const r=await this.db.prepare('SELECT * FROM templates WHERE id = ? AND owner_id = ?').bind(id,ownerId).first<Row>();if(!r)throw new InputError('Template not found in your library.');return asTemplate(r);}
 async draft(id:string,ownerId=this.ownerId){const r=await this.db.prepare('SELECT * FROM drafts WHERE id = ? AND owner_id = ?').bind(id,ownerId).first<DraftRow>();if(!r)throw new InputError('Draft not found in your library.');return asDraft(r);}
 async call(name:ToolName,args:unknown):Promise<Record<string,unknown>> {
  const parsed=schemas[name].safeParse(args); if(!parsed.success)throw new InputError(parsed.error.issues.map(x=>`${x.path.join('.')||'Input'}: ${x.message}`).join('; '));
  const a=parsed.data;
  const workspace:Workspace=a.workspace||'library';
  const ownerId=workspace==='demo'?demoOwnerKey(this.ownerId):this.ownerId;
  return {...await this.run({name,args:a} as ToolInput,ownerId),workspace};
 }
 private async run(input:ToolInput,ownerId:string):Promise<Record<string,unknown>> {
  if(input.name==='list_templates')return this.list(ownerId,input.args.after_id);
  if(input.name==='export_library'){
   const a=input.args;
   const table=a.kind==='templates'?'templates':'drafts';
   const rows=await this.db.prepare(`SELECT * FROM ${table} WHERE owner_id = ? AND id > ? ORDER BY id ASC LIMIT 2`).bind(ownerId,a.after_id||'').all<Row|DraftRow>();
   const page=rows.results.slice(0,1);const hasMore=rows.results.length>1;
   const records=page.map(r=>a.kind==='templates'?{...asTemplate(r as Row),createdAt:r.created_at,updatedAt:r.updated_at}:{template:JSON.parse((r as DraftRow).template_snapshot),draft:{id:r.id,templateId:(r as DraftRow).template_id,version:(r as DraftRow).version,values:JSON.parse((r as DraftRow).field_values),updatedAt:r.updated_at},createdAt:r.created_at});
   return {kind:a.kind,records,hasMore,nextCursor:hasMore?page[page.length-1].id:null,exportedAt:new Date().toISOString()};
  }
  if(input.name==='delete_library_data'){
   const results=await this.db.batch([
    this.db.prepare('DELETE FROM drafts WHERE owner_id = ?').bind(ownerId),
    this.db.prepare('DELETE FROM templates WHERE owner_id = ?').bind(ownerId),
   ]);
   return {deleted:{drafts:Number(results[0].meta.changes||0),templates:Number(results[1].meta.changes||0)},...await this.list(ownerId),recentDrafts:[],deletionScope:'Removed this workspace’s custom templates and drafts, including saved template snapshots, from the app’s active database. ChatGPT history and provider backups are not removed by this action.'};
  }

  if(input.name==='open_library'){
   const a=input.args;
   const catalog=a.template_id||a.draft_id?{}:await this.list(ownerId);
   const recentRows=await this.db.prepare("SELECT id, template_id, json_extract(template_snapshot, '$.title') AS title, version, updated_at FROM drafts WHERE owner_id = ? ORDER BY updated_at DESC LIMIT 12").bind(ownerId).all<Pick<DraftRow,'id'|'template_id'|'version'|'updated_at'> & {title:string}>();
   const recentDrafts=recentRows.results.map(r=>({id:r.id,templateId:r.template_id,title:r.title,version:r.version,updatedAt:r.updated_at}));
   if(a.draft_id){const d=await this.draft(a.draft_id,ownerId);return {...catalog,recentDrafts,...d};}
   return {...catalog,recentDrafts,...(a.template_id?{selectedTemplate:await this.template(a.template_id,ownerId)}:{})};
  }
  if(input.name==='preview_import'){
   const a=input.args;
   let raw:{title?:unknown;description?:unknown;body?:unknown;category?:unknown}={body:a.text,title:'Imported template',description:''};const warnings:string[]=[];
   if(a.text.trim().startsWith('{')&&!a.text.trim().startsWith('{{')){try{const candidate=JSON.parse(a.text);if(typeof candidate==='object'&&candidate&&!Array.isArray(candidate))raw=candidate;else throw new Error();}catch{throw new InputError('This looks like JSON but is not a valid template object. Use title, description, body, and optional category.');}}
   const p=schemas.save_template.safeParse({title:raw.title||'Imported template',description:raw.description||'',body:raw.body,category:raw.category||'General'});
   if(!p.success)throw new InputError('Import needs a text body of at most 24,000 characters and a title of at most 120 characters.');
   const fields=fieldsFor(p.data.body);if(!fields.length)warnings.push('No placeholders found. This will be a reusable fixed prompt.');
   return {template:{id:'preview_only',...p.data,fields,sample:false},fields,warnings,previewOnly:true};
  }
  if(input.name==='save_template'){
   const a=input.args;
   const fields=fieldsFor(a.body);const now=new Date().toISOString();const id=a.template_id||crypto.randomUUID();
   const limits=this.writeLimits();const size=byteLength(a.title)+byteLength(a.description)+byteLength(a.body)+byteLength(a.category||'General');
   if(a.template_id){
    if(a.template_id.startsWith('sample_'))throw new InputError('Samples are read-only. Save a new copy without template_id.');
    await this.template(a.template_id,ownerId);
    const result=await this.db.prepare(`UPDATE templates SET title = ?, description = ?, body = ?, category = ?, updated_at = ? WHERE id = ? AND owner_id = ? AND ${storedBytesSql} - length(CAST(title || description || body || category AS BLOB)) + ? <= ?`).bind(a.title,a.description,a.body,a.category||'General',now,id,ownerId,ownerId,ownerId,size,limits.bytesPerWorkspace).run();
    if(!result.meta.changes){await this.template(id,ownerId);throw new InputError('Library storage budget exceeded. Shorten this template or delete library data before saving.');}
   }else{
    const result=await this.db.prepare(`INSERT INTO templates (id, owner_id, title, description, body, category, created_at, updated_at) SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM templates WHERE owner_id = ?) < ? AND ${storedBytesSql} + ? <= ?`).bind(id,ownerId,a.title,a.description,a.body,a.category||'General',now,now,ownerId,limits.templatesPerWorkspace,ownerId,ownerId,size,limits.bytesPerWorkspace).run();
    if(!result.meta.changes)throw new InputError('Library template or storage budget exceeded. Export and delete library data before saving more.');
   }
   return {template:{id,title:a.title,description:a.description,body:a.body,category:a.category||'General',fields,sample:false}};
  }
  if(input.name==='prepare_draft'){
   const a=input.args;
   const template=await this.template(a.template_id,ownerId);const values=normalizeValues(template,a.values);
   if(template.fields.length && !values.some(v=>v.value))throw new InputError('No field values were supplied. Ask for missing information or open the template to review it; an empty draft has not been saved.');
   const rendered=render(template,values);
   const now=new Date().toISOString();const id=crypto.randomUUID();
   const limits=this.writeLimits(),snapshot=JSON.stringify(template),fieldValues=JSON.stringify(values);
   const result=await this.db.prepare(`INSERT INTO drafts (id, owner_id, template_id, template_snapshot, field_values, version, created_at, updated_at) SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM drafts WHERE owner_id = ?) < ? AND ${storedBytesSql} + ? <= ?`).bind(id,ownerId,template.id,snapshot,fieldValues,1,now,now,ownerId,limits.draftsPerWorkspace,ownerId,ownerId,byteLength(snapshot+fieldValues),limits.bytesPerWorkspace).run();
   if(!result.meta.changes)throw new InputError('Library draft or storage budget exceeded. Export and delete library data before saving more.');
   return {template,draft:{id,templateId:template.id,version:1,values,...rendered,updatedAt:now}};
  }
  if(input.name==='update_draft'){
   const a=input.args;
   const existing=await this.draft(a.draft_id,ownerId); if(existing.draft.version!==a.version)throw new InputError('This draft changed elsewhere. Open it again before saving.');
   const values=normalizeValues(existing.template,a.values);const rendered=render(existing.template,values);const now=new Date().toISOString();
   const limits=this.writeLimits(),fieldValues=JSON.stringify(values);
   const result=await this.db.prepare(`UPDATE drafts SET field_values = ?, version = version + 1, updated_at = ? WHERE id = ? AND owner_id = ? AND version = ? AND ${storedBytesSql} - length(CAST(field_values AS BLOB)) + ? <= ?`).bind(fieldValues,now,a.draft_id,ownerId,a.version,ownerId,ownerId,byteLength(fieldValues),limits.bytesPerWorkspace).run();
   if(!result.meta.changes)throw new InputError('This draft changed elsewhere or the library storage budget was exceeded. Open it again and shorten values before saving.');
   return {template:existing.template,draft:{...existing.draft,version:a.version+1,values,...rendered,updatedAt:now}};
  }
  const result=await this.draft(input.args.draft_id,ownerId);return result;
 }
}
