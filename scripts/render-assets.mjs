import fs from 'node:fs';import path from 'node:path';import sharp from 'sharp';import archiver from 'archiver';import {createHash} from 'node:crypto';
// RN Collins frame (Nov 2, 2026): graph-paper ground, graphite type, signal-orange keyline and panel outline (no dot
// before the corner label, Nov 2 rule in FRAME_SPEC_v2), Inter for headlines and body, IBM Plex Mono for the stamp and the credit panel. Type is drawn as vector
// outlines from the brand fonts in fonts/glyphs.json (converted from the studio's OFL Inter and IBM Plex Mono files),
// so the frames look the same on any machine and never fall back to another font. A character the brand fonts do not
// have stops the build. No type sits on a photograph; no text is cut off: if copy cannot fit at the brand floors
// (headline 56 px, body 34 px on a 1080 px frame) the frame is listed in .production/qa/render-fit.json.
// Machine ring (v3.19 frame, sourced Nov 2, 2026): each carousel has one real, openly licensed photo of an old machine
// from data/ring-machines.json. It fills the frame behind a graph-paper window, so only a 64 px ring shows, with the
// 8 px orange keyline directly inside it. The visible part steps across the machine from frame to frame (x 6% to 94%,
// zoom 1.5 to 1.7). The panel's second line credits it. A carousel without a registered machine stops the build.
const RING={ring:64,keyline:8,gap:20,xFrom:.06,xTo:.94,zoomFrom:1.5,zoomTo:1.7};
export function loadRingRegistry(root){
  const reg=JSON.parse(fs.readFileSync(path.join(root,'data','ring-machines.json'),'utf8')),by=new Map(),seen=new Set();
  const allowed=/^(CC0|CC BY [0-9.]+|public domain|public domain \(U\.S\. government work\))$/;
  for(const m of reg.machines){
    if(!allowed.test(m.licence))throw new Error(`Ring ${m.machineId}: licence ${m.licence} is not a ring licence.`);
    for(const k of [m.sha256,m.sourcePage,m.machineId])if(seen.has(k))throw new Error(`Ring ${m.machineId} is reused (${k}).`);else seen.add(k);
    if(by.has(m.carousel))throw new Error(`Carousel ${m.carousel} has two machines.`);
    const file=path.join(root,m.file);if(createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==m.sha256)throw new Error(`Ring ${m.machineId}: file hash differs from the registry.`);
    by.set(m.carousel,{...m,path:file});
  }
  return by;
}
const ringPublic=m=>({machineId:m.machineId,name:m.name,creator:m.creator,licence:m.licence,licenceUrl:m.licenceUrl,creditLine:m.creditLine,sourcePage:m.sourcePage,file:m.file,sha256:m.sha256});
const ringFor=(registry,packageId,seq)=>{const m=registry.get(`ioo-fashion/${packageId.toLowerCase()}-carousel-${seq}`);if(!m)throw new Error(`No ring machine registered for ${packageId} carousel ${seq.toUpperCase()}.`);return m};
const BRAND={paper:'#F7F6F2',graphite:'#2B2D31',orange:'#F05A22',orangeDeep:'#B53C12',panel:'#FFFFFF'};
const GLYPHS=JSON.parse(fs.readFileSync(new URL('../fonts/glyphs.json',import.meta.url),'utf8'));
const MARK='RN Collins · #renaissancex2m3';
const clean=t=>String(t??'').replace(/[   ]/g,' ').replace(/[–—]/g,', ').replace(/\s+\n/g,'\n').replace(/[ \t]+/g,' ').trim();
function advance(text,face,size){const f=GLYPHS[face];let a=0;for(const ch of text){const g=f.glyphs[ch];if(!g)throw new Error(`Brand font ${face} has no glyph for "${ch}" (U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')}). Refusing to render with a fallback font.`);a+=g[0]}return a/f.upm*size}
function wrapText(text,face,size,maxW){
  const lines=[];
  for(const para of clean(text).split('\n')){
    let line='';
    for(let word of para.split(' ').filter(Boolean)){
      while(advance(word,face,size)>maxW){let cut=word.length-1;while(cut>1&&advance(word.slice(0,cut),face,size)>maxW)cut--;if(line){lines.push(line);line=''}lines.push(word.slice(0,cut));word=word.slice(cut)}
      const next=line?`${line} ${word}`:word;
      if(advance(next,face,size)>maxW){lines.push(line);line=word}else line=next;
    }
    if(line)lines.push(line);
  }
  return lines;
}
function drawText(lines,x,y,face,size,lead,fill,anchor='start'){
  const f=GLYPHS[face],k=size/f.upm;let out='';
  lines.forEach((line,i)=>{let cx=anchor==='end'?x-advance(line,face,size):x;const by=y+i*lead;for(const ch of line){const [adv,d]=f.glyphs[ch];if(d)out+=`<path transform="translate(${cx.toFixed(2)} ${by.toFixed(2)}) scale(${k.toFixed(5)})" d="${d}"/>`;cx+=adv*k}});
  return `<g fill="${fill}">${out}</g>`;
}
const shortSource=url=>String(url||'').replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'');
// Safe zones used by the renderer and checked by the tests: title, caption, photo window and credit panel never overlap.
export function frameLayout(w,h,hasObject=false,{photoShare=null,panelHeight=null,ring=false}={}){
  const s=Math.min(w/1080,h/1080),m=(ring?RING.ring+RING.keyline+RING.gap:72)*s,landscape=w>h*1.2,panelH=panelHeight??(3*44+48)*s,panelY=h-m-panelH,top=m+92*s,bottom=panelY-36*s,cw=w-2*m;
  if(!hasObject)return {s,m,title:{x:m,y:top,w:cw,h:(bottom-top)*.4},caption:{x:m,y:top+(bottom-top)*.4,w:cw,h:(bottom-top)*.6},text:{x:m,y:top,w:cw,h:bottom-top},photo:null,credit:{x:m,y:panelY,w:cw,h:panelH}};
  if(landscape){const pw=cw*.38,tw=cw-pw-40*s;return {s,m,title:{x:m,y:top,w:tw,h:(bottom-top)*.45},caption:{x:m,y:top+(bottom-top)*.45,w:tw,h:(bottom-top)*.55},text:{x:m,y:top,w:tw,h:bottom-top},photo:{x:m+tw+40*s,y:top,w:pw,h:bottom-top},credit:{x:m,y:panelY,w:cw,h:panelH}}}
  const ph=(bottom-top)*(photoShare??.42),ty=top+ph+40*s;
  return {s,m,title:{x:m,y:ty,w:cw,h:(bottom-ty)*.4},caption:{x:m,y:ty+(bottom-ty)*.4,w:cw,h:(bottom-ty)*.6},text:{x:m,y:ty,w:cw,h:bottom-ty},photo:{x:m,y:top,w:cw,h:ph},credit:{x:m,y:panelY,w:cw,h:panelH}};
}
const fitLog=[],smallPanelLog=[];
function composeFrame({w,h,kit,frame,sequence,total,hasPhoto,photoLed,ring}){
  const s=Math.min(w/1080,h/1080),m=(ring?RING.ring+RING.keyline+RING.gap:72)*s,pad=24*s;
  // Credit panel type is 34 px; only a frame that cannot fit its copy otherwise drops the panel to 30 px (logged in render-fit.json).
  for(const panelPx of [34,30]){
  const mono=panelPx*s,monoLead=(panelPx+10)*s;
  const panelW=w-2*m-2*pad,creditLines=[...wrapText(`Credit: ${frame.credit||'RN Collins'}`,'mono400',mono,panelW),...(ring?wrapText(ring.creditLine,'mono400',mono,panelW):[]),...(frame.source?wrapText(`Source: ${shortSource(frame.source)}`,'mono400',mono,panelW):[]),MARK];
  const panelH=creditLines.length*monoLead+2*pad;
  const counter=sequence==='YT'?'YT':sequence==='VERTICAL'?'REEL':sequence==='PIN'?`PIN ${String(frame.frame).padStart(2,'0')}/04`:`${sequence} ${String(frame.frame||1).padStart(2,'0')}/${String(total).padStart(2,'0')}`;
  const cover=(frame.frame||1)===1&&sequence!=='PIN';
  const heads=(cover?[84,76,66,60,56]:[76,66,60,56]).map(v=>v*s),bodies=[48,44,40,36,34].map(v=>v*s);
  let chosen=null,box;
  for(const share of hasPhoto?(photoLed?[.56,.46,.36,.28,.22]:[.42,.34,.26,.2]):[null]){
    box=frameLayout(w,h,hasPhoto,{photoShare:share,panelHeight:panelH,ring:Boolean(ring)});
    for(const hs of heads){for(const bs of bodies){const tl=wrapText(kit.title,'inter800',hs,box.text.w),bl=wrapText(frame.caption,'inter600',bs,box.text.w),need=tl.length*hs*1.12+28*s+bl.length*bs*1.3;if(need<=box.text.h){chosen={hs,bs,tl,bl};break}}if(chosen)break}
    if(chosen)break;
  }
  if(!chosen&&panelPx===34)continue;
  if(chosen&&panelPx!==34)smallPanelLog.push({packageId:kit.packageId,sequence,frame:frame.frame||1,assetId:frame.assetId,panelPx});
  if(!chosen){const hs=heads.at(-1),bs=bodies.at(-1);chosen={hs,bs,tl:wrapText(kit.title,'inter800',hs,box.text.w),bl:wrapText(frame.caption,'inter600',bs,box.text.w),overflow:true};fitLog.push({packageId:kit.packageId,sequence,frame:frame.frame||1,assetId:frame.assetId,overflow:true})}
  const {hs,bs,tl,bl}=chosen,grid=[];
  for(let x=40*s;x<w;x+=40*s)grid.push(`M${x.toFixed(1)} 0V${h}`);for(let y=40*s;y<h;y+=40*s)grid.push(`M0 ${y.toFixed(1)}H${w}`);
  const stampY=m+34*s,titleY=box.text.y+hs*.9,bodyY=titleY+(tl.length-1)*hs*1.12+28*s+bs*1.05;
  const R=RING.ring*s,K=RING.keyline*s;
  const ground=ring?`<defs><clipPath id="win"><rect x="${R}" y="${R}" width="${w-2*R}" height="${h-2*R}"/></clipPath></defs><rect x="${R}" y="${R}" width="${w-2*R}" height="${h-2*R}" fill="${BRAND.paper}"/><path clip-path="url(#win)" d="${grid.join('')}" stroke="${BRAND.graphite}" stroke-opacity=".07" stroke-width="${Math.max(1,1.5*s).toFixed(2)}"/><rect x="${R+K/2}" y="${R+K/2}" width="${w-2*R-K}" height="${h-2*R-K}" fill="none" stroke="${BRAND.orange}" stroke-width="${K}"/>`
    :`<rect width="${w}" height="${h}" fill="${BRAND.paper}"/><path d="${grid.join('')}" stroke="${BRAND.graphite}" stroke-opacity=".07" stroke-width="${Math.max(1,1.5*s).toFixed(2)}"/><rect x="${20*s}" y="${20*s}" width="${w-40*s}" height="${h-40*s}" fill="none" stroke="${BRAND.orange}" stroke-width="${8*s}"/>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${ground}${drawText([`I/1 FASHION ${kit.packageId}`],m,stampY,'mono400',mono,monoLead,BRAND.graphite)}${drawText([counter],w-m,stampY,'mono400',mono,monoLead,BRAND.orangeDeep,'end')}${box.photo?`<rect x="${box.photo.x}" y="${box.photo.y}" width="${box.photo.w}" height="${box.photo.h}" fill="${BRAND.graphite}"/>`:''}${drawText(tl,box.text.x,titleY,'inter800',hs,hs*1.12,BRAND.graphite)}${drawText(bl,box.text.x,bodyY,'inter600',bs,bs*1.3,BRAND.graphite)}<rect x="${m}" y="${h-m-panelH}" width="${w-2*m}" height="${panelH}" fill="${BRAND.panel}" stroke="${BRAND.orange}" stroke-width="${3*s}"/>${drawText(creditLines,m+pad,h-m-panelH+pad+monoLead*.75,'mono400',mono,monoLead,BRAND.graphite)}</svg>`;
  return {svg,box};
  }
}
// The ring: the machine photo scaled to cover the frame at the step's zoom, cropped at the step's x position.
async function ringLayer(ring,w,h){
  const t=ring.steps>1?ring.step/(ring.steps-1):0,zoom=RING.zoomFrom+(RING.zoomTo-RING.zoomFrom)*t,xf=RING.xFrom+(RING.xTo-RING.xFrom)*t;
  const meta=await sharp(ring.path).metadata(),k=Math.max(w/meta.width,h/meta.height)*zoom,rw=Math.max(w,Math.round(meta.width*k)),rh=Math.max(h,Math.round(meta.height*k));
  const left=Math.min(rw-w,Math.max(0,Math.round(xf*rw-w/2))),top=Math.round((rh-h)/2);
  return sharp(ring.path).resize(rw,rh,{fit:'fill'}).extract({left,top,width:w,height:h}).png().toBuffer();
}
async function renderFrame(dest,w,h,kit,frame,sequence,index,root,total=8,ring=null){
  const match=/^OBJ-(.+)$/.exec(frame.assetId),photo=match?path.join(root,'src','media',`${match[1]}.jpg`):null,hasPhoto=Boolean(photo&&fs.existsSync(photo)),photoLed=hasPhoto&&frame.visualType==='rights-cleared narrative photograph';
  const {svg,box}=composeFrame({w,h,kit,frame,sequence,total,hasPhoto,photoLed,ring});
  let pipeline=sharp(Buffer.from(svg));
  if(ring)pipeline=sharp(await ringLayer(ring,w,h)).composite([{input:await pipeline.png().toBuffer(),left:0,top:0}]);
  if(hasPhoto){
    const pw=Math.round(box.photo.w),ph=Math.round(box.photo.h),image=await sharp(photo).resize(pw,ph,{fit:photoLed?'cover':'contain',position:'attention',background:BRAND.graphite}).png().toBuffer();
    pipeline=sharp(await pipeline.png().toBuffer()).composite([{input:image,left:Math.round(box.photo.x),top:Math.round(box.photo.y)}]);
  }
  const rendered=await pipeline.png(photoLed?{compressionLevel:9}:{compressionLevel:9,palette:true,quality:90,colors:256}).toBuffer();
  fs.writeFileSync(dest,rendered);
}
export async function zipDirectory(dir,out){await new Promise((resolve,reject)=>{const output=fs.createWriteStream(out),archive=archiver('zip',{zlib:{level:9}});output.on('close',resolve);archive.on('error',reject);archive.pipe(output);archive.directory(dir,false,{date:new Date('2026-09-07T00:00:00.000Z')});archive.finalize()})}
const sha256=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
async function writeCarouselQa({root,out,kit,sequence='a'}){
  const carousel=sequence==='a'?kit.instagram.carouselA:kit.instagram.carouselB;
  if(!['B02','B03'].includes(kit.packageId)||carousel.visualStatus!=='PHOTO_LED_COMPLETE')return;
  const qaDir=path.join(out,'qa');fs.mkdirSync(qaDir,{recursive:true});
  const frameDir=path.join(out,'exports',kit.packageId.toLowerCase(),'instagram',sequence);
  const composites=[];
  for(let i=0;i<carousel.frames.length;i++){
    const rendered=path.join(frameDir,`frame-${String(i+1).padStart(2,'0')}.png`);
    const thumb=await sharp(rendered).resize(270,338,{fit:'cover'}).png().toBuffer();
    composites.push({input:thumb,left:24+(i%4)*294,top:84+Math.floor(i/4)*358});
  }
  const title=Buffer.from(`<svg width="1200" height="800"><rect width="1200" height="800" fill="${BRAND.paper}"/>${drawText([`${kit.packageId} · CAROUSEL ${sequence.toUpperCase()} · PHOTO SEQUENCE QA`],24,46,'inter800',26,30,BRAND.graphite)}</svg>`);
  const contactSheet=path.join(qaDir,`${kit.packageId.toLowerCase()}-carousel-${sequence}-contact-sheet.png`);
  await sharp(title).composite(composites).png({compressionLevel:9}).toFile(contactSheet);
  const frames=carousel.frames.map((frame,index)=>{
    const sourceFile=path.join(root,'src','media',`${frame.assetId.slice(4)}.jpg`),renderedFile=path.join(frameDir,`frame-${String(index+1).padStart(2,'0')}.png`);
    return {frame:index+1,role:frame.role,canonicalUrl:frame.source,directAssetUrl:frame.directAssetUrl,sourceDimensions:frame.dimensions,crop:frame.crop,credit:frame.credit,rights:frame.rights,sourceSha256:sha256(sourceFile),renderedSha256:sha256(renderedFile)};
  });
  fs.writeFileSync(path.join(qaDir,`${kit.packageId.toLowerCase()}-carousel-${sequence}-provenance.json`),JSON.stringify({packageId:kit.packageId,carousel:sequence.toUpperCase(),status:carousel.visualStatus,contactSheet:`/qa/${path.basename(contactSheet)}`,frameCount:frames.length,uniqueSourceCount:new Set(frames.map(frame=>frame.sourceSha256)).size,frames},null,2));
}
export async function renderAssetExports({root,out,kits}){const exportRoot=path.join(out,'exports');fs.mkdirSync(exportRoot,{recursive:true});const registry=loadRingRegistry(root),ringLedger=[];let packageIndex=0;for(const kit of kits){const ringA=ringFor(registry,kit.packageId,'a'),ringB=ringFor(registry,kit.packageId,'b'),rings={a:ringA,b:ringB};const dir=path.join(exportRoot,kit.packageId.toLowerCase());fs.mkdirSync(dir,{recursive:true});const tasks=[];for(const [seq,carousel] of [['a',kit.instagram.carouselA],['b',kit.instagram.carouselB]]){const d=path.join(dir,'instagram',seq);fs.mkdirSync(d,{recursive:true});carousel.frames.forEach((f,i)=>tasks.push(()=>renderFrame(path.join(d,`frame-${String(i+1).padStart(2,'0')}.png`),1080,1350,kit,{...f,frame:i+1},seq.toUpperCase(),packageIndex+i,root,carousel.frames.length,{...rings[seq],step:i,steps:carousel.frames.length})))}const pinDir=path.join(dir,'pinterest');fs.mkdirSync(pinDir,{recursive:true});kit.pinterest.pins.forEach((p,i)=>tasks.push(()=>renderFrame(path.join(pinDir,`pin-${String(i+1).padStart(2,'0')}.png`),1000,1500,kit,{...p,frame:i+1,visualType:'Pinterest evidence pin',source:p.destination,crop:'native 2:3',caption:p.description,alt:p.alt,disposition:'PLATFORM_EXPORT'},'PIN',packageIndex+i+8,root,8,{...ringA,step:i,steps:4})));const ytFrame={...kit.instagram.carouselA.frames[0],frame:1,caption:kit.principle};tasks.push(()=>renderFrame(path.join(dir,'youtube-thumbnail.png'),1280,720,kit,ytFrame,'YT',packageIndex+19,root,8,{...ringA,step:0,steps:1}));const board={...kit.instagram.carouselB.frames[0],frame:1,caption:kit.reelsTikTokShorts.shots.map(s=>`${s.time} ${s.assetId}`).join(' · ')};tasks.push(()=>renderFrame(path.join(dir,'vertical-storyboard.png'),1080,1920,kit,board,'VERTICAL',packageIndex+25,root,8,{...ringB,step:0,steps:1}));const workers=Array.from({length:4},async()=>{while(tasks.length){const task=tasks.shift();await task()}});await Promise.all(workers);fs.writeFileSync(path.join(dir,'metadata.json'),JSON.stringify({packageId:kit.packageId,title:kit.title,author:kit.author,version:kit.version,rightsRule:kit.principle,instagram:kit.instagram,pinterest:kit.pinterest,youtube:kit.youtube,vertical:kit.reelsTikTokShorts,ringMachines:Object.fromEntries(Object.entries(rings).map(([k,m])=>[`carousel${k.toUpperCase()}`,ringPublic(m)]))},null,2));for(const [k,m] of Object.entries(rings))ringLedger.push({packageId:kit.packageId,carousel:k.toUpperCase(),usedOn:k==='a'?['carousel A frames 1 to 8','pins 1 to 4','YouTube thumbnail']:['carousel B frames 1 to 8','Reel storyboard'],...ringPublic(m)});await zipDirectory(dir,path.join(exportRoot,`${kit.packageId.toLowerCase()}-publication-assets.zip`));await writeCarouselQa({root,out,kit,sequence:'a'});await writeCarouselQa({root,out,kit,sequence:'b'});packageIndex++}const qaDir=path.join(out,'qa');fs.mkdirSync(qaDir,{recursive:true});fs.writeFileSync(path.join(qaDir,'ring-machines.json'),JSON.stringify({rule:'One openly licensed old-machine photo per carousel, never reused; see data/ring-machines.json.',count:ringLedger.length,machines:ringLedger},null,2));fs.writeFileSync(path.join(qaDir,'render-fit.json'),JSON.stringify({rule:'Headline floor 56 px, body floor 34 px on a 1080 px frame; nothing is cut off. Frames listed here could not fit at the floors and need shorter copy.',overflow:fitLog,smallCreditPanel:{rule:'Frames whose credit panel had to drop from 34 px to 30 px to fit the machine credit line.',frames:smallPanelLog}},null,2));return {renderFitOverflow:fitLog.length,packages:kits.length,instagramFrames:kits.length*16,pinterestPins:kits.length*4,youtubeThumbnails:kits.length,verticalStoryboards:kits.length}}
