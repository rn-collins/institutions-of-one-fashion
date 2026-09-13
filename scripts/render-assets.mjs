import fs from 'node:fs';import path from 'node:path';import sharp from 'sharp';import archiver from 'archiver';import {createHash} from 'node:crypto';
const palettes=[['#191714','#eee9df','#d7ff45'],['#172a52','#f1ede4','#ff674d'],['#7f191d','#fff0e4','#d7ff45'],['#49452f','#f5efdf','#dcae68'],['#22252b','#f5eee5','#83b4b2'],['#291d35','#f5e7d3','#dd8cb2'],['#073b3a','#edf1df','#d4ff52'],['#542f1e','#f5e7cf','#78a7d3']];
const xml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const wrap=(text,max=30,limit=9)=>{const words=String(text).replace(/\s+/g,' ').split(' '),lines=[];let line='';for(const word of words){if((line+' '+word).trim().length>max){if(line)lines.push(line);line=word}else line=(line+' '+word).trim();if(lines.length===limit)break}if(line&&lines.length<limit)lines.push(line);return lines};
const textLines=(lines,x,y,size,leading,fill,weight=400,anchor='start')=>lines.map((l,i)=>`<text x="${x}" y="${y+i*leading}" fill="${fill}" font-family="DejaVu Sans,Arial,sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${xml(l)}</text>`).join('');
export function frameLayout(w,h,hasObject=false){return {title:{x:w*.075,y:h*.15,w:w*(hasObject?.49:.85),h:h*.25},caption:{x:w*.075,y:h*(hasObject?.48:.51),w:w*(hasObject?.45:.85),h:h*.29},photo:hasObject?{x:w*.58,y:h*.34,w:w*.35,h:h*.32}:null,credit:{x:w*.075,y:h*.88,w:w*.85,h:h*.06}}}
function artSvg({w,h,kit,frame,sequence,index}){
  const hasObject=/^OBJ-(.+)$/.test(frame.assetId),photoLed=frame.visualType==='rights-cleared narrative photograph'&&hasObject,box=frameLayout(w,h,hasObject),p=palettes[(index+kit.packageId.charCodeAt(0))%palettes.length],[bg,fg,accent]=p;
  const title=wrap(kit.title,hasObject?18:(w>900?24:20),4),caption=wrap(frame.caption,hasObject?22:(w>900?38:29),hasObject?6:8),credit=wrap(frame.credit,w>900?55:38,3),layout=(index+frame.frame+(sequence==='B'?3:0))%4;
  const marks=[`<circle cx="${w*.78}" cy="${h*.22}" r="${Math.min(w,h)*.15}" fill="none" stroke="${accent}" stroke-width="3"/>`,`<path d="M${w*.08} ${h*.36} H${w*.92} M${w*.28} ${h*.08} V${h*.92}" stroke="${accent}" stroke-width="3" fill="none"/>`,`<rect x="${w*.59}" y="${h*.08}" width="${w*.28}" height="${h*.42}" fill="none" stroke="${accent}" stroke-width="4" transform="rotate(8 ${w*.73} ${h*.29})"/>`,`<path d="M${w*.1} ${h*.18} C${w*.38} ${h*.02},${w*.62} ${h*.5},${w*.9} ${h*.25} S${w*.58} ${h*.92},${w*.12} ${h*.7}" fill="none" stroke="${accent}" stroke-width="4"/>`][layout];
  const folio=photoLed?`I/1 × FASHION · ${xml(sequence)}.${String(frame.frame||1).padStart(2,'0')}`:`I/1 × FASHION · ${xml(kit.packageId)} · ${xml(sequence)}.${String(frame.frame||1).padStart(2,'0')}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}" fill-opacity="${photoLed?.56:1}"/>${marks}<text x="${w*.075}" y="${h*.07}" fill="${accent}" font-family="DejaVu Sans Mono,monospace" font-size="${w*.022}" letter-spacing="4">${folio}</text>${textLines(title,box.title.x,box.title.y,w*(hasObject?.038:.052),w*(hasObject?.045:.058),fg,700)}${textLines(caption,box.caption.x,box.caption.y,w*(hasObject?.026:.034),w*(hasObject?.037:.047),fg,400)}<line x1="${w*.075}" y1="${h*.84}" x2="${w*.925}" y2="${h*.84}" stroke="${fg}" stroke-opacity=".4"/>${textLines(credit,box.credit.x,box.credit.y,w*.018,w*.025,fg,400)}</svg>`;
}
async function renderFrame(dest,w,h,kit,frame,sequence,index,root){
  const match=/^OBJ-(.+)$/.exec(frame.assetId),box=frameLayout(w,h,Boolean(match)),svg=Buffer.from(artSvg({w,h,kit,frame,sequence,index}));let pipeline=sharp(svg);
  if(match){
    const photo=path.join(root,'src','media',`${match[1]}.jpg`);
    if(fs.existsSync(photo)){
      if(frame.visualType==='rights-cleared narrative photograph'){
        const image=await sharp(photo).resize(w,h,{fit:'cover',position:'attention'}).modulate({saturation:.82}).jpeg({quality:92}).toBuffer();
        pipeline=sharp(image).composite([{input:svg}]);
      }else{
        const image=await sharp(photo).resize(Math.round(box.photo.w),Math.round(box.photo.h),{fit:'cover'}).modulate({saturation:.72}).png().toBuffer();
        pipeline=sharp(svg).composite([{input:image,left:Math.round(box.photo.x),top:Math.round(box.photo.y)},{input:Buffer.from(`<svg width="${w}" height="${h}"><rect x="${box.photo.x}" y="${box.photo.y}" width="${box.photo.w}" height="${box.photo.h}" fill="none" stroke="${palettes[index%palettes.length][2]}" stroke-width="5"/></svg>`)}]);
      }
    }
  }
  const completedPhoto=['B02','B03'].includes(kit.packageId)&&frame.visualType==='rights-cleared narrative photograph';
  const rendered=await pipeline.png(completedPhoto?{compressionLevel:9}:{compressionLevel:9,palette:true,quality:85,colors:128}).toBuffer();
  fs.writeFileSync(dest,rendered);
}
async function zipDirectory(dir,out){await new Promise((resolve,reject)=>{const output=fs.createWriteStream(out),archive=archiver('zip',{zlib:{level:9}});output.on('close',resolve);archive.on('error',reject);archive.pipe(output);archive.directory(dir,false,{date:new Date('2026-09-07T00:00:00.000Z')});archive.finalize()})}
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
  const title=Buffer.from(`<svg width="1200" height="800"><rect width="1200" height="800" fill="#eee9df"/><text x="24" y="46" font-family="DejaVu Sans,Arial,sans-serif" font-size="26" font-weight="700" fill="#191714">${xml(kit.packageId)} · CAROUSEL ${sequence.toUpperCase()} · PHOTO SEQUENCE QA</text></svg>`);
  const contactSheet=path.join(qaDir,`${kit.packageId.toLowerCase()}-carousel-${sequence}-contact-sheet.png`);
  await sharp(title).composite(composites).png({compressionLevel:9}).toFile(contactSheet);
  const frames=carousel.frames.map((frame,index)=>{
    const sourceFile=path.join(root,'src','media',`${frame.assetId.slice(4)}.jpg`),renderedFile=path.join(frameDir,`frame-${String(index+1).padStart(2,'0')}.png`);
    return {frame:index+1,role:frame.role,canonicalUrl:frame.source,directAssetUrl:frame.directAssetUrl,sourceDimensions:frame.dimensions,crop:frame.crop,credit:frame.credit,rights:frame.rights,sourceSha256:sha256(sourceFile),renderedSha256:sha256(renderedFile)};
  });
  fs.writeFileSync(path.join(qaDir,`${kit.packageId.toLowerCase()}-carousel-${sequence}-provenance.json`),JSON.stringify({packageId:kit.packageId,carousel:sequence.toUpperCase(),status:carousel.visualStatus,contactSheet:`/qa/${path.basename(contactSheet)}`,frameCount:frames.length,uniqueSourceCount:new Set(frames.map(frame=>frame.sourceSha256)).size,frames},null,2));
}
export async function renderAssetExports({root,out,kits}){const exportRoot=path.join(out,'exports');fs.mkdirSync(exportRoot,{recursive:true});let packageIndex=0;for(const kit of kits){const dir=path.join(exportRoot,kit.packageId.toLowerCase());fs.mkdirSync(dir,{recursive:true});const tasks=[];for(const [seq,carousel] of [['a',kit.instagram.carouselA],['b',kit.instagram.carouselB]]){const d=path.join(dir,'instagram',seq);fs.mkdirSync(d,{recursive:true});carousel.frames.forEach((f,i)=>tasks.push(()=>renderFrame(path.join(d,`frame-${String(i+1).padStart(2,'0')}.png`),1080,1350,kit,f,seq.toUpperCase(),packageIndex+i,root)))}const pinDir=path.join(dir,'pinterest');fs.mkdirSync(pinDir,{recursive:true});kit.pinterest.pins.forEach((p,i)=>tasks.push(()=>renderFrame(path.join(pinDir,`pin-${String(i+1).padStart(2,'0')}.png`),1000,1500,kit,{...p,frame:i+1,visualType:'Pinterest evidence pin',source:p.destination,crop:'native 2:3',caption:p.description,alt:p.alt,disposition:'PLATFORM_EXPORT'},'PIN',packageIndex+i+8,root)));const ytFrame={...kit.instagram.carouselA.frames[0],frame:1,caption:kit.principle};tasks.push(()=>renderFrame(path.join(dir,'youtube-thumbnail.png'),1280,720,kit,ytFrame,'YT',packageIndex+19,root));const board={...kit.instagram.carouselB.frames[0],frame:1,caption:kit.reelsTikTokShorts.shots.map(s=>`${s.time} ${s.assetId}`).join(' · ')};tasks.push(()=>renderFrame(path.join(dir,'vertical-storyboard.png'),1080,1920,kit,board,'VERTICAL',packageIndex+25,root));const workers=Array.from({length:4},async()=>{while(tasks.length){const task=tasks.shift();await task()}});await Promise.all(workers);fs.writeFileSync(path.join(dir,'metadata.json'),JSON.stringify({packageId:kit.packageId,title:kit.title,author:kit.author,version:kit.version,rightsRule:kit.principle,instagram:kit.instagram,pinterest:kit.pinterest,youtube:kit.youtube,vertical:kit.reelsTikTokShorts},null,2));await zipDirectory(dir,path.join(exportRoot,`${kit.packageId.toLowerCase()}-publication-assets.zip`));await writeCarouselQa({root,out,kit,sequence:'a'});await writeCarouselQa({root,out,kit,sequence:'b'});packageIndex++}return {packages:kits.length,instagramFrames:kits.length*16,pinterestPins:kits.length*4,youtubeThumbnails:kits.length,verticalStoryboards:kits.length}}
