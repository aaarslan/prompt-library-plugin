import { z } from 'zod';
import { fieldsFor, normalizeValues, render, SAMPLE_TEMPLATES, type Template, type FieldValue, InputError } from './prompt-core';
export type LibraryDB = D1Database;
const valueSchema=z.object({key:z.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,63}$/),value:z.string().max(12000),source:z.enum(['provided','inferred']),evidence:z.string().max(1200).optional()}).strict().superRefine((v,ctx)=>{if(v.source==='inferred'&&!v.evidence?.trim())ctx.addIssue({code:z.ZodIssueCode.custom,path:['evidence'],message:'An inferred value needs brief supporting evidence or an explicit assumption.'});});
export const schemas={
 list_templates:z.object({}).strict(),
 open_library:z.object({template_id:z.string().max(100).optional(),draft_id:z.string().max(100).optional()}).strict(),
 save_template:z.object({title:z.string().trim().min(1).max(120),description:z.string().trim().max(600),body:z.string().trim().min(1).max(24000),category:z.string().trim().min(1).max(50).optional(),template_id:z.string().max(100).optional()}).strict(),
 preview_import:z.object({text:z.string().min(1).max(30000)}).strict(),
 prepare_draft:z.object({template_id:z.string().max(100),values:z.array(valueSchema).max(30)}).strict(),
 update_draft:z.object({draft_id:z.string().max(100),version:z.number().int().min(1),values:z.array(valueSchema).max(30)}).strict(),
 render_prompt:z.object({draft_id:z.string().max(100)}).strict(),
 export_library:z.object({kind:z.enum(['templates','drafts']),after_id:z.string().max(100).optional()}).strict(),
 delete_library_data:z.object({confirmation:z.literal('DELETE MY LIBRARY DATA')}).strict(),
};
export type ToolName=keyof typeof schemas;
type Row={id:string;owner_id:string;title:string;description:string;body:string;category:string;created_at:string;updated_at:string};
type DraftRow={id:string;owner_id:string;template_id:string;template_snapshot:string;field_values:string;version:number;created_at:string;updated_at:string};
const asTemplate=(r:Row):Template=>({id:r.id,title:r.title,description:r.description,body:r.body,category:r.category,fields:fieldsFor(r.body),sample:false});
function asDraft(r:DraftRow){const template=JSON.parse(r.template_snapshot) as Template;const values=JSON.parse(r.field_values) as FieldValue[];return {template,draft:{id:r.id,templateId:r.template_id,version:r.version,values,...render(template,values),updatedAt:r.updated_at}};}
export class LibraryService {
 constructor(private db:LibraryDB,private ownerId:string){if(!ownerId) throw new InputError('Sign in to use your private library.');}
 async list(){const r=await this.db.prepare('SELECT * FROM templates WHERE owner_id = ? ORDER BY updated_at DESC LIMIT 200').bind(this.ownerId).all<Row>();return [...r.results.map(asTemplate),...SAMPLE_TEMPLATES];}
 async template(id:string){const sample=SAMPLE_TEMPLATES.find(t=>t.id===id);if(sample)return sample;const r=await this.db.prepare('SELECT * FROM templates WHERE id = ? AND owner_id = ?').bind(id,this.ownerId).first<Row>();if(!r)throw new InputError('Template not found in your library.');return asTemplate(r);}
 async draft(id:string){const r=await this.db.prepare('SELECT * FROM drafts WHERE id = ? AND owner_id = ?').bind(id,this.ownerId).first<DraftRow>();if(!r)throw new InputError('Draft not found in your library.');return asDraft(r);}
 async call(name:ToolName,args:unknown):Promise<Record<string,unknown>> {
  const parsed=schemas[name].safeParse(args); if(!parsed.success)throw new InputError(parsed.error.issues.map(x=>`${x.path.join('.')||'Input'}: ${x.message}`).join('; '));
  const a=parsed.data as any;
  if(name==='list_templates')return {templates:await this.list()};
  if(name==='export_library'){
   // Keyset pagination reaches every owned row without the UI's display limits.
   const table=a.kind==='templates'?'templates':'drafts';
   const rows=await this.db.prepare(`SELECT * FROM ${table} WHERE owner_id = ? AND id > ? ORDER BY id ASC LIMIT 2`).bind(this.ownerId,a.after_id||'').all<Row|DraftRow>();
   const page=rows.results.slice(0,1);const hasMore=rows.results.length>1;
   const records=page.map(r=>a.kind==='templates'?{...asTemplate(r as Row),createdAt:r.created_at,updatedAt:r.updated_at}:{template:JSON.parse((r as DraftRow).template_snapshot),draft:{id:r.id,templateId:(r as DraftRow).template_id,version:(r as DraftRow).version,values:JSON.parse((r as DraftRow).field_values),updatedAt:r.updated_at},createdAt:r.created_at});
   return {kind:a.kind,records,hasMore,nextCursor:hasMore?page[page.length-1].id:null,exportedAt:new Date().toISOString()};
  }
  if(name==='delete_library_data'){
   // D1 batches are atomic. Never accept a client-supplied owner or identity.
   const results=await this.db.batch([
    this.db.prepare('DELETE FROM drafts WHERE owner_id = ?').bind(this.ownerId),
    this.db.prepare('DELETE FROM templates WHERE owner_id = ?').bind(this.ownerId),
   ]);
   return {deleted:{drafts:Number(results[0].meta.changes||0),templates:Number(results[1].meta.changes||0)},templates:SAMPLE_TEMPLATES,recentDrafts:[],deletionScope:'Removed this user’s custom templates and drafts, including saved template snapshots, from the app’s active database. ChatGPT history and provider backups are not removed by this action.'};
  }

  if(name==='open_library'){
   const templates=await this.list();
   const recentRows=await this.db.prepare('SELECT id, template_id, template_snapshot, version, updated_at FROM drafts WHERE owner_id = ? ORDER BY updated_at DESC LIMIT 12').bind(this.ownerId).all<DraftRow>();
   const recentDrafts=recentRows.results.map(r=>({id:r.id,templateId:r.template_id,title:(JSON.parse(r.template_snapshot) as Template).title,version:r.version,updatedAt:r.updated_at}));
   if(a.draft_id){const d=await this.draft(a.draft_id);return {templates,recentDrafts,selectedTemplate:d.template,...d};}
   return {templates,recentDrafts,...(a.template_id?{selectedTemplate:await this.template(a.template_id)}:{})};
  }
  if(name==='preview_import'){
   let raw:{title?:unknown;description?:unknown;body?:unknown;category?:unknown}={body:a.text,title:'Imported template',description:''};const warnings:string[]=[];
   if(a.text.trim().startsWith('{')&&!a.text.trim().startsWith('{{')){try{const candidate=JSON.parse(a.text);if(typeof candidate==='object'&&candidate&&!Array.isArray(candidate))raw=candidate;else throw new Error();}catch{throw new InputError('This looks like JSON but is not a valid template object. Use title, description, body, and optional category.');}}
   const p=schemas.save_template.safeParse({title:raw.title||'Imported template',description:raw.description||'',body:raw.body,category:raw.category||'General'});
   if(!p.success)throw new InputError('Import needs a text body of at most 24,000 characters and a title of at most 120 characters.');
   const fields=fieldsFor(p.data.body);if(!fields.length)warnings.push('No placeholders found. This will be a reusable fixed prompt.');
   return {template:{id:'preview_only',...p.data,fields,sample:false},fields,warnings,previewOnly:true};
  }
  if(name==='save_template'){
   const fields=fieldsFor(a.body);const now=new Date().toISOString();const id=a.template_id||crypto.randomUUID();
   if(a.template_id){if(a.template_id.startsWith('sample_'))throw new InputError('Samples are read-only. Save a new copy without template_id.');await this.template(a.template_id);await this.db.prepare('UPDATE templates SET title = ?, description = ?, body = ?, category = ?, updated_at = ? WHERE id = ? AND owner_id = ?').bind(a.title,a.description,a.body,a.category||'General',now,id,this.ownerId).run();}
   else {await this.db.prepare('INSERT INTO templates (id, owner_id, title, description, body, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(id,this.ownerId,a.title,a.description,a.body,a.category||'General',now,now).run();}
   return {template:{id,title:a.title,description:a.description,body:a.body,category:a.category||'General',fields,sample:false},templates:await this.list()};
  }
  if(name==='prepare_draft'){
   const template=await this.template(a.template_id);const values=normalizeValues(template,a.values);
   if(template.fields.length && !values.some(v=>v.value))throw new InputError('No field values were supplied. Ask for missing information or open the template to review it; an empty draft has not been saved.');
   const rendered=render(template,values);
   const now=new Date().toISOString();const id=crypto.randomUUID();
   await this.db.prepare('INSERT INTO drafts (id, owner_id, template_id, template_snapshot, field_values, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(id,this.ownerId,template.id,JSON.stringify(template),JSON.stringify(values),1,now,now).run();
   return {template,draft:{id,templateId:template.id,version:1,values,...rendered,updatedAt:now}};
  }
  if(name==='update_draft'){
   const existing=await this.draft(a.draft_id); if(existing.draft.version!==a.version)throw new InputError('This draft changed elsewhere. Open it again before saving.');
   const values=normalizeValues(existing.template,a.values);const rendered=render(existing.template,values);const now=new Date().toISOString();
   const result=await this.db.prepare('UPDATE drafts SET field_values = ?, version = version + 1, updated_at = ? WHERE id = ? AND owner_id = ? AND version = ?').bind(JSON.stringify(values),now,a.draft_id,this.ownerId,a.version).run();
   if(!result.meta.changes)throw new InputError('This draft changed elsewhere. Open it again before saving.');
   return {template:existing.template,draft:{...existing.draft,version:a.version+1,values,...rendered,updatedAt:now}};
  }
  const result=await this.draft(a.draft_id);return {...result,renderedPrompt:result.draft.renderedPrompt,missingFields:result.draft.missingFields};
 }
}
