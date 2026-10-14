import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('packaging validates the complete icon and rejects corrupt pixels behind a valid PNG header',()=>{
 const result=spawnSync('python3',['-c',`
import ast, pathlib, struct, zlib
source = ast.parse(pathlib.Path('scripts/package-submission.py').read_text())
function = next(node for node in source.body if isinstance(node, ast.FunctionDef) and node.name == 'png_dimensions')
exec(compile(ast.Module(body=[function], type_ignores=[]), '<packager>', 'exec'))
data = pathlib.Path('assets/icon.png').read_bytes()
assert png_dimensions(data) == (512, 512)
for damaged in [data[:24], data[:-5], data[:50] + bytes([data[50] ^ 1]) + data[51:]]:
    try:
        png_dimensions(damaged)
    except SystemExit:
        pass
    else:
        raise AssertionError('Corrupt PNG accepted')
`],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
});

test('preparation packaging preserves normalized paths and does not claim missing release evidence',()=>{
 const output=mkdtempSync(join(tmpdir(),'prompt-library-package-'));
 try{
  const args=['scripts/package-submission.py','--endpoint','https://fictional.example.invalid/mcp','--output',output];
  const refused=spawnSync('python3',args,{encoding:'utf8'});assert.notEqual(refused.status,0);assert.match(refused.stderr,/Missing verified recording/);
  const prepared=spawnSync('python3',[...args,'--draft'],{encoding:'utf8'});assert.equal(prepared.status,0,prepared.stderr);
  const report=JSON.parse(readFileSync(join(output,'submission-readiness.json'),'utf8'));
  assert.equal(report.ready_for_review_submission,false);assert.equal(report.package_materials_complete,false);assert.deepEqual(report.files,['LICENSE','assets/icon.png','mcp.json','plugin.json']);
 }finally{rmSync(output,{recursive:true,force:true});}
});
