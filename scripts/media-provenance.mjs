import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';

const hashFile=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const rel=(out,file)=>'/'+path.relative(out,file).split(path.sep).join('/');

export async function writeMediaProvenance({root,out,objects,kits,objectPackages,site}){
  const originals=[];
  for(const object of objects){
    const file=path.join(root,'src','media',`${object.id}.jpg`);
    const metadata=await sharp(file).metadata();
    originals.push({assetId:`OBJ-${object.id}`,installedPath:`/media/${object.id}.jpg`,mediaClass:'ARCHIVAL_COLLECTION_IMAGE',title:object.title,creator:object.maker,institution:object.url.includes('metmuseum.org')?'The Metropolitan Museum of Art':'Library of Congress',date:object.date,identifier:object.accession,canonicalUrl:object.url,directMediaUrl:object.image,rights:object.license,credit:object.credit,caption:object.caption,alt:object.alt,relatedPackages:objectPackages[object.id]||[],relevanceBasis:'Selected as a material witness only for the listed dossiers; each dossier states the precise institutional question the object illuminates.',originAssessment:{aiGenerated:false,basis:'Institution-served collection record identifies a historical object or photograph, creator/maker, date and stable accession/resource identifier. The local copy is traced to that exact official record.',limitation:'This is a provenance determination, not an AI-detector score.'},localFile:{sha256:hashFile(file),bytes:fs.statSync(file).size,width:metadata.width,height:metadata.height,format:metadata.format}});
  }
  const originalById=new Map(originals.map(x=>[x.assetId,x]));
  const derivatives=[];
  for(const kit of kits){
    const packageId=kit.packageId.toLowerCase(),dir=path.join(out,'exports',packageId),specifications=[];
    for(const [sequence,carousel] of [['a',kit.instagram.carouselA],['b',kit.instagram.carouselB]])carousel.frames.forEach((frame,index)=>specifications.push({file:path.join(dir,'instagram',sequence,`frame-${String(index+1).padStart(2,'0')}.png`),platform:'Instagram',format:`carousel-${sequence.toUpperCase()}`,frame}));
    kit.pinterest.pins.forEach((pin,index)=>specifications.push({file:path.join(dir,'pinterest',`pin-${String(index+1).padStart(2,'0')}.png`),platform:'Pinterest',format:'pin',frame:pin}));
    specifications.push({file:path.join(dir,'youtube-thumbnail.png'),platform:'YouTube',format:'thumbnail',frame:kit.instagram.carouselA.frames[0]},{file:path.join(dir,'vertical-storyboard.png'),platform:'Reels / TikTok / Shorts',format:'storyboard',frame:kit.instagram.carouselB.frames[0]});
    for(const spec of specifications){
      const metadata=await sharp(spec.file).metadata(),evidence=originalById.get(spec.frame.assetId);
      derivatives.push({installedPath:rel(out,spec.file),packageId:kit.packageId,platform:spec.platform,format:spec.format,mediaClass:'ORIGINAL_EDITORIAL_GRAPHIC',authoredBy:'RN Collins publication system',generatedBy:'Deterministic SVG composition and Sharp rasterization in scripts/render-assets.mjs',aiGenerated:false,evidenceAssetId:evidence?.assetId||null,evidenceCanonicalUrl:evidence?.canonicalUrl||null,evidenceRights:evidence?.rights||null,directRelevance:spec.frame.caption||spec.frame.description||kit.principle,labelingRule:'Editorial typography/evidence graphic; never represented as a found documentary photograph.',sourceTrace:spec.frame.source||spec.frame.destination||`/packages/${packageId}`,localFile:{sha256:hashFile(spec.file),bytes:fs.statSync(spec.file).size,width:metadata.width,height:metadata.height,format:metadata.format}});
    }
  }
  const archives=kits.map(kit=>{const file=path.join(out,'exports',`${kit.packageId.toLowerCase()}-publication-assets.zip`),members=derivatives.filter(x=>x.packageId===kit.packageId).map(x=>x.installedPath);return {installedPath:rel(out,file),packageId:kit.packageId,mediaClass:'DOWNLOAD_ARCHIVE',aiGenerated:false,containsOnlyManifestedEditorialExports:true,memberCount:members.length,members,localFile:{sha256:hashFile(file),bytes:fs.statSync(file).size}}});
  const manifest={manifestVersion:'2.0.0',audited:'2026-09-09',site,policy:'No AI-generated imagery. Found media must resolve to an official public collection record and a reusable item-level disposition. Publication graphics are deterministic editorial compositions and are labeled separately from documentary media.',assessmentBoundary:'Absence of AI generation is established from source provenance and the local deterministic render chain; no probabilistic AI detector is treated as proof.',counts:{archivalCollectionImages:originals.length,originalEditorialGraphics:derivatives.length,downloadArchives:archives.length,totalTrackedAssets:originals.length+derivatives.length+archives.length},archivalCollectionImages:originals,originalEditorialGraphics:derivatives,downloadArchives:archives};
  fs.writeFileSync(path.join(out,'media-provenance.json'),JSON.stringify(manifest,null,2));
  return manifest;
}
