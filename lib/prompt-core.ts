import { EXTRA_TEMPLATES } from './extra-templates';
export type Field = {key:string;label:string;required:true};
export type Template = {id:string;title:string;description:string;body:string;category:string;fields:Field[];sample:boolean};
export type FieldValue = {key:string;value:string;source:'provided'|'inferred';evidence?:string};
export class InputError extends Error {}
export function fieldsFor(body:string): Field[] {
  const keys = [...new Set([...body.matchAll(/\{\{\s*([a-zA-Z][a-zA-Z0-9_]{0,63})\s*\}\}/g)].map(m=>m[1]))];
  if(keys.length>30) throw new InputError('A template may have at most 30 fields.');
  const residue=body.replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9_]{0,63})\s*\}\}/g,'');
  if(residue.includes('{{') || residue.includes('}}')) throw new InputError('Use {{field_name}} placeholders containing letters, numbers, and underscores.');
  return keys.map(key=>({key,label:key.replace(/_/g,' ').replace(/^./,c=>c.toUpperCase()),required:true}));
}
export function normalizeValues(template:Template, input:FieldValue[]):FieldValue[] {
  const allowed=new Set(template.fields.map(f=>f.key)); const used=new Set();
  for(const v of input){
    if(!allowed.has(v.key)) throw new InputError(`Unknown field: ${v.key}`);
    if(used.has(v.key)) throw new InputError(`Duplicate field: ${v.key}`);
    used.add(v.key);
  }
  return input.map(v=>({...v,value:v.value.trim(),...(v.evidence?{evidence:v.evidence.trim()}: {})}));
}
export function render(template:Template, values:FieldValue[]) {
  const map=new Map(values.map(v=>[v.key,v.value]));
  const missingFields=template.fields.filter(f=>!map.get(f.key)?.trim()).map(f=>f.key);
  const encoder=new TextEncoder();let renderedBytes=encoder.encode(template.body).length;
  const renderedPrompt=template.body.replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9_]{0,63})\s*\}\}/g,(match,key)=>{const value=map.get(key)?.trim()||`{{${key}}}`;renderedBytes+=encoder.encode(value).length-encoder.encode(match).length;if(renderedBytes>100000)throw new InputError('The rendered prompt is too large. Shorten the values or repeated placeholders before saving.');return value;});
  return {renderedPrompt,missingFields};
}
const samples=[
 {id:'sample_project_brief',title:'Project brief',description:'Turn a clear goal into a practical, scoped plan.',category:'Planning',body:'Create a practical project brief for {{project_name}}.\n\nGoal: {{goal}}\nAudience: {{audience}}\nConstraints: {{constraints}}\nSuccess looks like: {{success_criteria}}\n\nCover the problem, proposed approach, scope, milestones, risks, and next decisions. Do not invent commitments or supporting facts. Label assumptions clearly.'},
 {id:'sample_clear_message',title:'Clear message',description:'Write a focused message for a specific reader.',category:'Writing',body:'Draft a {{channel}} message to {{recipient}} about {{topic}}.\n\nContext: {{context}}\nDesired outcome: {{desired_outcome}}\nTone and length: {{style}}\n\nLead with the point. Include only supplied facts. Do not send the message.'},
 {id:'sample_decision_review',title:'Decision review',description:'Compare options against the criteria that matter.',category:'Thinking',body:'Help me decide between {{options}} for {{decision}}.\n\nCriteria: {{criteria}}\nKnown facts: {{known_facts}}\nConstraints: {{constraints}}\n\nCompare trade-offs, identify missing evidence, and recommend the next useful step. Distinguish facts from assumptions. Avoid false precision.'}
];
export const SAMPLE_TEMPLATES:Template[]=[...samples,...EXTRA_TEMPLATES].map(t=>({...t,fields:fieldsFor(t.body),sample:true}));
