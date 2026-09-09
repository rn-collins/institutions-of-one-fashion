import fs from 'node:fs';
import path from 'node:path';
import {domains,packages,objects,sources,claims,exhibitions} from './data.mjs';

const out=path.resolve('docs/11-visual-assignment-matrix.md');
const clean=s=>String(s??'').replaceAll('|','\\|').replace(/\s+/g,' ').trim();
const rows=[];
const add=(route,title,judgment,t1,t2,t3,gate)=>rows.push([route,title,judgment,t1,t2,t3,gate]);

add('/','Gallery entrance','IMAGE-FIRST CURATED SEQUENCE','House of Worth ball gown (OBJ-81112)','Liz Claiborne with model (OBJ-loc-gtfy-00717)','Four-room Build–Carry–Control–Continue threshold graphic','Use four distinct objects; no generic fashion montage.');
const roomLead={build:'B02',carry:'CA03',control:'CO01',continue:'CN01'};
for(const d of domains){const p=packages.find(x=>x.id===roomLead[d.slug]),x=exhibitions[p.id],o=objects.find(v=>v.id===x.objectId);add(`/${d.slug}`,`${d.name} room`,'IMAGE + EVIDENCE-GRAPHIC INDEX',`${o.title} (${o.id})`,`Room-specific annotated source/document detail`,`Ten- or twelve-dossier systems map`, 'Image establishes the room; the map is more informative than repeated card thumbnails.');}

const graphicFirst=new Set(['CO01','CO02','CO04','CO05','CO06','CO07','CO08','CO10','CO11','CO12','CN05','CN10','CN12','B04','B05']);
for(const p of packages){const x=exhibitions[p.id],o=objects.find(v=>v.id===x.objectId),sourceIds=[...new Set([...(claims[p.id]||[]).flatMap(r=>r[2]),...x.movements.flatMap(m=>m[4])])],s1=sources.find(s=>sourceIds.includes(s.id)&&s.url),s2=sources.find(s=>sourceIds.includes(s.id)&&s.url&&s.id!==s1?.id);const judgment=graphicFirst.has(p.id)?'EVIDENCE-GRAPHIC FIRST; IMAGE AS MATERIAL WITNESS':'IMAGE-FIRST HYBRID';add(`/packages/${p.id.toLowerCase()}`,`${p.id} · ${p.title}`,judgment,`${o.title} (${o.id}) — installed rights-cleared material witness`,s1?`${s1.title} (${s1.id}) — installed source-specific evidence card; canonical link retained`:'Four-movement evidence graphic — installed original publication graphic',s2?`${s2.title} (${s2.id}) — installed source-specific evidence card; canonical link retained`:`Four-movement ${p.domain} evidence graphic — installed original publication graphic`,graphicFirst.has(p.id)?'The institutional relationship leads because the diagram communicates it more precisely than decorative fashion imagery.':'The material witness leads; source cards and original evidence graphics provide the distinct secondary sequence.');}

add('/evidence','Evidence collection','IMAGE-FIRST OBJECT SALON','18-object rights-cleared collection sequence','Accession/credit details as object labels','Provenance and related-dossier network graphic','Every object remains individually downloadable.');
add('/excavation','Excavation record','EVIDENCE-GRAPHIC FIRST','Source-surface registry map','Candidate disposition flow','Dated 44-package coverage matrix','Screenshots add little unless they prove a specific search result.');
add('/rights','Rights desk','EVIDENCE-GRAPHIC + DOCUMENT DETAIL','Disposition taxonomy diagram','Representative canonical record detail','Asset-to-rights-to-treatment decision path','Avoid garment imagery that implies a license conclusion.');
add('/tools','Tools floor','EDITORIAL TYPOGRAPHY + LIVE INTERACTION','Four-domain instrument directory','Completed-state tool example','Download-format and privacy-flow graphic','Live forms are the evidence; decorative imagery would reduce clarity.');
add('/about','Method','EDITORIAL TYPOGRAPHY + EVIDENCE GRAPHIC','Build–Carry–Control–Continue method plate','Evidence-label taxonomy','Object-level rights protocol flow','Method clarity outranks atmosphere; one material witness may punctuate the page.');

if(rows.length!==54)throw new Error(`Expected 54 route rows; received ${rows.length}`);
const head=`# Institutions of One × Fashion — visual assignment matrix\n\n**Release head audited:** publication edition 1.0  \n**Standard:** every route receives an intentional visual judgment. Every dossier installs at least three relevant visual/evidence objects. A real image is preferred when it proves or materially deepens the story; evidence graphics or editorial typography lead when they communicate the institutional relationship more precisely. No AI-generated imagery.\n\n| Route | Surface | Visual judgment | Target 1 | Target 2 | Target 3 | Curatorial gate |\n|---|---|---|---|---|---|---|\n`;
fs.writeFileSync(out,head+rows.map(r=>`| ${r.map(clean).join(' | ')} |`).join('\n')+'\n');
console.log(`Wrote ${rows.length} visual assignments to ${out}`);
