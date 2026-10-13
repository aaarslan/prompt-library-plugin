import {readdirSync,lstatSync,readFileSync} from 'node:fs';
import {resolve,relative} from 'node:path';
const root=resolve(new URL('../',import.meta.url).pathname);
export const ignored=new Set(['node_modules','.git','.sites-runtime','.wrangler','.next','.vinext','dist','out','coverage','releases','.agents','.codex']);
export function inventory(dir=root){const files=[];for(const name of readdirSync(dir).sort()){if(ignored.has(name)||name.endsWith('.tsbuildinfo')||name==='next-env.d.ts')continue;const file=resolve(dir,name),s=lstatSync(file);if(s.isSymbolicLink())throw new Error('Symlink excluded: '+relative(root,file));if(s.isDirectory())files.push(...inventory(file));else files.push(relative(root,file));}return files;}
const files=inventory(),problems=[];
const patterns=[/appgprj_[a-f0-9]{20,}/i,/appgdep_[a-f0-9]{20,}/i,/plugin_asdk_app_sites_[a-f0-9]{20,}/i,/https:\/\/[a-z0-9-]+\.httpwww\.chatgpt\.site/i,/gh[pousr]_[A-Za-z0-9]{30,}/,/github_pat_[A-Za-z0-9_]{30,}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];
for(const f of files){if(/(^|\/)(\.env[^/]*|\.app\.json)$|\.(db|sqlite|sqlite3|pem|log)$/i.test(f))problems.push('Disallowed file: '+f);if(f.startsWith('.github/workflows/'))problems.push('CI workflow not included in this source release: '+f);const b=readFileSync(resolve(root,f));if(b.includes(0))continue;const text=b.toString('utf8');if(patterns.some(p=>p.test(text)))problems.push('Account binding or credential pattern: '+f);}
const manifest=JSON.parse(readFileSync(resolve(root,'.openai/hosting.json'),'utf8'));if(manifest.project_id)problems.push('Public hosting manifest must not contain an account project ID.');
if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}else console.log(`Public-source audit passed: ${files.length} files, no known private bindings, credentials, runtime data, or CI workflows.`);
