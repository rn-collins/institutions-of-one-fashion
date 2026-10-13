// One build at a time per checkout. scripts/build.mjs empties and rewrites dist/ and
// .production/, so two builds (or a build during the test suite, which reads those
// folders) running at once in the same folder can see each other's half-written
// output. Both take this lock first. The test suite holds it for its whole run and
// sets BUILD_LOCK_HELD=1, so the builds it starts itself do not wait on it.
import fs from 'node:fs';
import path from 'node:path';

const sleep=ms=>Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,ms);
const alive=pid=>{try{process.kill(pid,0);return true}catch(e){return e.code==='EPERM'}};

export function acquireBuildLock(root,{timeoutMs=20*60*1000}={}){
  if(process.env.BUILD_LOCK_HELD==='1')return()=>{};
  const file=path.join(root,'.build.lock'),start=Date.now();
  for(;;){
    try{
      fs.writeFileSync(file,String(process.pid),{flag:'wx'});
      let released=false;
      const release=()=>{if(released)return;released=true;try{if(fs.readFileSync(file,'utf8')===String(process.pid))fs.rmSync(file,{force:true})}catch{}};
      process.on('exit',release);
      return release;
    }catch(e){
      if(e.code!=='EEXIST')throw e;
      let holder=0;try{holder=Number(fs.readFileSync(file,'utf8'))||0}catch{continue}
      // An empty file is a lock being written right now; only a lock left by a dead process is cleared.
      let stale=false;if(!holder){try{stale=Date.now()-fs.statSync(file).mtimeMs>10000}catch{continue}}
      if((holder&&!alive(holder))||stale){fs.rmSync(file,{force:true});continue}
      if(Date.now()-start>timeoutMs)throw new Error(`Another build or test run (process ${holder}) has held ${file} for over ${Math.round(timeoutMs/60000)} minutes`);
      sleep(500);
    }
  }
}
