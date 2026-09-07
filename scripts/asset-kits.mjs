const escCsv=value=>`"${String(value??'').replaceAll('"','""')}"`;

const lanes={
  build:['code','handoff','prototype','infrastructure','proof','counterexample','threshold','practice'],
  carry:['origin','translation','labor','handoff','distribution','credit','memory','return'],
  control:['asset','record','authority','constraint','counterclaim','jurisdiction','remedy','continuity'],
  continue:['risk','steward','record','voice','access','scenario','decision','next custodian']
};

function candidateFrame(candidate,index){
  const reusable=['PUBLIC_DOMAIN_CC0','REUSE'].includes(candidate.disposition);
  return {
    assetId:candidate.id,
    visualType:reusable?'rights-cleared collection object':'canonical public record card',
    source:candidate.canonicalUrl,
    crop:reusable?(index%2?'tight material/detail crop; retain uncropped download':'full object with generous field'):'typographic record excerpt; do not reproduce protected imagery',
    caption:candidate.caption||`${candidate.title} is retained as ${candidate.relevance.toLowerCase()}`,
    credit:candidate.credit||candidate.institution,
    alt:candidate.alt||`Source card for ${candidate.title}, credited to ${candidate.institution}.`,
    rights:candidate.rights,
    disposition:candidate.disposition,
    treatment:reusable?'local display and download with attached credit':'link, narrow quotation, or authorized player only as stated'
  };
}

function diagramFrame(p,x,movement,index){
  return {
    assetId:`${p.id}-DIAGRAM-${index+1}`,
    visualType:'original evidence diagram',
    source:`/packages/${p.id.toLowerCase()}`,
    crop:'native 4:5 diagram; preserve labels and evidence footer',
    caption:`${movement[0]} — ${movement[1]}. ${movement[2]}`,
    credit:'Concept and editorial design: RN Collins',
    alt:`Diagram mapping ${movement[1].toLowerCase()} within ${p.title}.`,
    rights:'Original publication graphic; no third-party imagery',
    disposition:'ORIGINAL_DIAGRAM',
    treatment:'render from verified text, source IDs, lines and geometric fields'
  };
}

export function buildAssetKits({packages,exhibitions,candidates}){
  const assigned=new Map(candidates.map(c=>[c.id,new Set()]));
  const kits=packages.map((p,packageIndex)=>{
    const x=exhibitions[p.id];
    const related=candidates.filter(c=>c.relatedPackages.includes(p.id));
    const selected=related.filter(c=>c.disposition!=='REJECTED');
    const reusable=selected.filter(c=>['PUBLIC_DOMAIN_CC0','REUSE'].includes(c.disposition));
    const linked=selected.filter(c=>!reusable.includes(c));
    const objectPrimary=reusable[packageIndex%Math.max(1,reusable.length)]||null;
    const records=[...linked,...reusable.filter(c=>c!==objectPrimary)];
    const baseFrames=[
      {assetId:`${p.id}-TITLE`,visualType:'original title plate',source:`/packages/${p.id.toLowerCase()}`,crop:'native 4:5; no crop',caption:x.thesis,credit:'RN Collins',alt:`Title plate for ${p.title}.`,rights:'Original publication graphic',disposition:'ORIGINAL_DIAGRAM',treatment:'typography, rule, folio and domain color only'},
      ...(objectPrimary?[candidateFrame(objectPrimary,0)]:[]),
      ...x.movements.map((m,i)=>diagramFrame(p,x,m,i)),
      ...records.slice(0,2).map((c,i)=>candidateFrame(c,i+1)),
      {assetId:`${p.id}-COUNTERPOINT`,visualType:'original counterpoint plate',source:`/packages/${p.id.toLowerCase()}#counterpoint`,crop:'native 4:5; no crop',caption:x.tension,credit:'RN Collins',alt:`Counterpoint card for ${p.title}.`,rights:'Original publication graphic',disposition:'ORIGINAL_DIAGRAM',treatment:'typographic quotation field; no decorative imagery'}
    ];
    while(baseFrames.length<10)baseFrames.push({
      assetId:`${p.id}-FIELD-${baseFrames.length+1}`,visualType:'original fieldwork plate',source:`/tools#${p.id.toLowerCase()}-tool`,crop:'native 4:5; no crop',caption:x.fieldwork[baseFrames.length%x.fieldwork.length],credit:'RN Collins',alt:`Fieldwork prompt for ${p.title}.`,rights:'Original publication graphic',disposition:'ORIGINAL_DIAGRAM',treatment:'numbered prompt and check line'
    });
    const carouselA=baseFrames.slice(0,8).map((f,i)=>({...f,frame:i+1,role:['hook','material witness','claim','mechanism','handoff','evidence','counterpoint','action'][i]}));
    const rotated=[baseFrames[0],...baseFrames.slice(4),...baseFrames.slice(1,4)];
    const carouselB=rotated.slice(0,8).map((f,i)=>({...f,frame:i+1,role:['provocation','system','record','constraint','case','decision','tool','source trail'][i]}));
    for(const c of related){
      const placements=[];
      if(carouselA.some(f=>f.assetId===c.id))placements.push('instagram-carousel-a');
      if(carouselB.some(f=>f.assetId===c.id))placements.push('instagram-carousel-b');
      placements.push(['PUBLIC_DOMAIN_CC0','REUSE'].includes(c.disposition)?'package-media-library':'package-resources-room');
      assigned.get(c.id).add(`${p.id}:${placements.join('+')}`);
    }
    const motionEvidence=[...carouselA.slice(1,5),...carouselB.slice(2,4)].filter((f,i,a)=>a.findIndex(v=>v.assetId===f.assetId)===i);
    return {
      packageId:p.id,title:p.title,domain:p.domain,version:'2.0',published:'2026-09-07',author:'RN Collins',
      principle:'Evidence leads; atmosphere never substitutes for provenance.',
      narrativeSequence:carouselA.map(({assetId,role,caption,source,rights})=>({assetId,role,caption,source,rights})),
      instagram:{carouselA:{title:`${p.title}: the institutional sequence`,frames:carouselA},carouselB:{title:`${p.title}: what the record changes`,frames:carouselB}},
      reelsTikTokShorts:{durationSeconds:60,shots:motionEvidence.map((f,i)=>({time:`${i*8}–${(i+1)*8}s`,assetId:f.assetId,motion:i%2?'vertical reveal with source footer':'slow evidence push; no synthetic parallax',voiceover:f.caption,credit:f.credit,rights:f.rights})),endCard:`Open ${p.id} at institutions-of-one-fashion.vercel.app`},
      pinterest:{pins:[carouselA[0],carouselA[1],carouselA[6],carouselB[3]].filter(Boolean).map((f,i)=>({assetId:f.assetId,title:[p.title,x.movements[i%4][1],`The ${p.domain} record`,`A field tool for ${p.title}`][i],description:f.caption,destination:`/packages/${p.id.toLowerCase()}`,alt:f.alt,credit:f.credit,rights:f.rights}))},
      youtube:{visualTimeline:[{time:'00:00–00:20',purpose:'cold open',asset:carouselA[0]},{time:'00:20–01:20',purpose:'material witness and source boundary',asset:carouselA[1]},{time:'01:20–05:20',purpose:'four-part institutional sequence',assetIds:carouselA.slice(2,6).map(f=>f.assetId)},{time:'05:20–06:30',purpose:'counterpoint',asset:carouselA[6]},{time:'06:30–08:00',purpose:'field tool and source trail',assetIds:carouselB.slice(-2).map(f=>f.assetId)}],screenRule:'Every third-party object or public record carries creator/institution, identifier, canonical source and rights treatment on first appearance.'},
      beehiiv:{hero:carouselA[1]||carouselA[0],inline:carouselA.slice(2,6),sourceBox:records.slice(0,4).map(c=>({assetId:c.id,title:c.title,url:c.canonicalUrl,disposition:c.disposition}))},
      linkedIn:{documentFrames:carouselB,postImage:carouselB[0],altText:carouselB.map(f=>f.alt).join(' ')},
      interactive:{url:`/tools#${p.id.toLowerCase()}-tool`,mapping:x.fieldwork.map((prompt,i)=>({step:i+1,prompt,evidenceAsset:carouselA[(i+2)%carouselA.length].assetId}))},
      resources:linked.map(c=>({assetId:c.id,title:c.title,url:c.canonicalUrl,disposition:c.disposition,use:c.relevance})),
      reusableDownloads:reusable.map(c=>({assetId:c.id,title:c.title,url:c.directMediaUrl,canonicalUrl:c.canonicalUrl,credit:c.credit,rights:c.rights})),
      candidateDisposition:related.map(c=>({assetId:c.id,disposition:c.disposition,destinations:['PUBLIC_DOMAIN_CC0','REUSE'].includes(c.disposition)?['media-library','narrative/platform kit where selected']:['resources-room','source card or authorized/link-only treatment'],exclusion:c.disposition==='REJECTED'?'Rejected in excavation ledger; not reproduced':null})),
      productionGate:'Written visual plan complete. RN owner-final approval, recording/editing, participant permissions, and counsel/specialist review where flagged remain human gates.'
    };
  });
  const corpusDisposition=candidates.map(c=>({assetId:c.id,title:c.title,disposition:c.disposition,destinations:[...(assigned.get(c.id)||[])],collectionFallback:(assigned.get(c.id)?.size||0)?null:'COLLECTION_LEVEL:excavation-index',reason:(assigned.get(c.id)?.size||0)?'Mapped to every related package.':'Candidate is collection-level and remains visible in the excavation ledger.'}));
  return {kits,corpusDisposition};
}

export function carouselCsv(kit){
  const rows=['carousel,frame,role,asset_id,visual_type,source,crop,caption,credit,alt,rights,disposition'];
  for(const [key,c] of Object.entries({A:kit.instagram.carouselA,B:kit.instagram.carouselB}))for(const f of c.frames)rows.push([key,f.frame,f.role,f.assetId,f.visualType,f.source,f.crop,f.caption,f.credit,f.alt,f.rights,f.disposition].map(escCsv).join(','));
  return rows.join('\n')+'\n';
}

export function motionMarkdown(kit){
  return `# ${kit.title} — motion and channel evidence manifest\n\nVersion ${kit.version} · RN Collins · 7 September 2026\n\n## Reels / TikTok / Shorts\n${kit.reelsTikTokShorts.shots.map(s=>`### ${s.time} — ${s.assetId}\nVoiceover: ${s.voiceover}\n\nTreatment: ${s.motion}\n\nCredit: ${s.credit}\n\nRights: ${s.rights}`).join('\n\n')}\n\n## YouTube visual timeline\n${kit.youtube.visualTimeline.map(s=>`- **${s.time} · ${s.purpose}:** ${s.asset?.assetId||s.assetIds.join(', ')}`).join('\n')}\n\n## Pinterest\n${kit.pinterest.pins.map(p=>`- **${p.title}** — ${p.assetId}; ${p.description}; ${p.credit}; ${p.rights}`).join('\n')}\n\n## Beehiiv and LinkedIn\nBeehiiv hero: ${kit.beehiiv.hero.assetId}. Inline: ${kit.beehiiv.inline.map(x=>x.assetId).join(', ')}. LinkedIn document: ${kit.linkedIn.documentFrames.map(x=>x.assetId).join(', ')}.\n\n## Release gate\n${kit.productionGate}\n`;
}
