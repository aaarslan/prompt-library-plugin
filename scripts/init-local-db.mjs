import './sites-env.mjs';
import {spawnSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
if(process.argv.length>2)throw new Error('This script accepts no arguments and only initializes local test storage.');
for(const name of readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort()){
 const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--persist-to','.wrangler/state','--config','dist/server/wrangler.json','--file','drizzle/'+name],{stdio:'inherit',env:{...process.env,XDG_CONFIG_HOME:process.cwd()+'/.sites-runtime/config'}});
 if(result.status!==0)process.exit(result.status||1);
}
