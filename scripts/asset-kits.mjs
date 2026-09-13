const escCsv=value=>`"${String(value??'').replaceAll('"','""')}"`;

const lanes={
  build:['code','handoff','prototype','infrastructure','proof','counterexample','threshold','practice'],
  carry:['origin','translation','labor','handoff','distribution','credit','memory','return'],
  control:['asset','record','authority','constraint','counterclaim','jurisdiction','remedy','continuity'],
  continue:['risk','steward','record','voice','access','scenario','decision','next custodian']
};

const domainRelevance={
  build:'Institutions of One is about making one person’s judgment legible enough to become a durable practice without pretending the person is replaceable.',
  carry:'Institutions of One is about letting work travel through other hands, formats, and places without losing the intelligence or people that made it possible.',
  control:'Institutions of One is about knowing where authority actually lives—across names, agreements, accounts, records, and decisions—not where the mythology says it lives.',
  continue:'Institutions of One is about designing for the day the founder is unavailable, so the work can remain alive without becoming an imitation of them.'
};

function postText(parts){
  return [parts.hook,parts.context,...parts.story,parts.relevance,parts.ending,parts.cta].join('\n\n');
}

function buildCompanionPosts(p,x){
  const relevance=domainRelevance[p.domain];
  const movements=x.movements.map(([,title,text])=>`${title} ${text}`);
  const a={
    label:'Companion post A',
    hook:p.summary,
    context:x.intro.join('\n\n'),
    story:movements,
    relevance,
    ending:`The point is not to make a person disappear into a system. It is to build enough structure that their work can grow, travel, and remain intelligible without asking their body to carry every function forever. ${x.tension}`,
    cta:`Read the carousel, then save it for the next time this question appears in your own work. What is the first decision you would move out of one person’s head?`
  };
  const b={
    label:'Companion post B',
    hook:`Here is the question: ${p.summary}`,
    context:`The visible work is only the surface. The carousel begins with a narrower proposition: ${x.thesis}`,
    story:[...movements].reverse(),
    relevance,
    ending:`That is the shift this carousel is tracing: from a compelling output to the conditions that let meaning, responsibility, and memory survive around it. The institution is not scale for its own sake. It is the structure that keeps the work answerable to its own promises.`,
    cta:`Move through the carousel from the final question back to the opening image. Save it as a working prompt—and tell me which part of the institution is still invisible in your practice.`
  };
  return [a,b].map((post,index)=>({
    id:`${p.id}-COMPANION-${index?'B':'A'}`,
    ...post,
    anatomy:{hook:post.hook,context:post.context,story:post.story,relevance:post.relevance,ending:post.ending,cta:post.cta},
    text:postText(post),
    editableFormats:['plain text','Markdown'],
    pairedCarousel:index?'B':'A'
  }));
}

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

function collectionPhotoFrame(object,caption){
  return {
    assetId:`OBJ-${object.id}`,
    visualType:'rights-cleared narrative photograph',
    source:object.url,
    directAssetUrl:object.image,
    dimensions:{width:object.width,height:object.height},
    crop:object.cropSuitability,
    caption,
    credit:`${object.credit} · ${object.sourceInstitution}`,
    creator:object.maker,
    institution:object.sourceInstitution,
    alt:object.alt,
    rights:object.license,
    disposition:'PUBLIC_DOMAIN_CC0',
    treatment:'full-bleed editorial crop with legible source credit; no synthetic alteration'
  };
}

function b01PhotoLedCarousel(objects,x){
  const byId=id=>objects.find(object=>object.id===id);
  const specifications=[
    ['81112',x.thesis],
    ['159187','House of Worth remains the named maker across objects made years apart. A house begins to appear when authorship persists as an operating identity, not just one exceptional garment.'],
    ['80430',`${x.movements[0][1]} ${x.movements[0][2]}`],
    ['155989','Charles Frederick Worth and Jean-Philippe Worth are both attached to this gown’s attribution. Continuity becomes visible when a house can carry creative authority across more than one named hand.'],
    ['159303',`${x.movements[2][1]} ${x.movements[2][2]}`],
    ['159172',`${x.movements[3][1]} ${x.movements[3][2]}`],
    ['84652',x.tension],
    ['81630',`Look across the eight objects. Which decisions recur, which change, and which records let you recognize one house without pretending every garment is the same? ${x.fieldwork[0]}`]
  ];
  return specifications.map(([id,caption],index)=>({...collectionPhotoFrame(byId(id),caption),frame:index+1,role:['hook','material witness','code','handoff','proof','continuity','counterpoint','action'][index]}));
}

function b01PhotoLedCarouselB(objects,x){
  const byId=id=>objects.find(object=>object.id===id);
  const specifications=[
    ['156069','A house is not an honorific applied after success. It becomes visible when one name can remain attached to a changing body of work, records, and responsibility.'],
    ['106545','The same house attribution appears on an afternoon dress made for a different setting. A system carries identity without requiring one repeated silhouette.'],
    ['81619','The record changes what can survive: maker, date, material, accession, and custody remain attached after the original room and relationships are gone.'],
    ['84553','A coat tests whether the house can move beyond the category that made it recognizable. Institutional code is a way of deciding, not a command to keep making the same object.'],
    ['159174','An ensemble is already a coordination problem. Components, materials, skilled hands, and approvals must resolve into one legible proposition.'],
    ['81467','A wedding dress adds occasion, expectation, and consequence. The house has to interpret a specific promise rather than merely repeat its most familiar answer.'],
    ['101642',x.tension],
    ['159193','This 1901 evening coat keeps the House of Worth attribution after Charles Frederick Worth’s death. The public record shows continuity of the name; the next institutional question is what authority, method, and obligations made that continuity possible.']
  ];
  return specifications.map(([id,caption],index)=>({...collectionPhotoFrame(byId(id),caption),frame:index+1,role:['provocation','system','record','constraint','case','decision','counterpoint','source trail'][index]}));
}

function b02PhotoLedCarouselA(objects,x){
  const byId=id=>objects.find(object=>object.id===id);
  const specifications=[
    ['81112','A code is a pattern you can recognize even when object, occasion, and proportion change.'],
    ['106545','Look for recurring choices in line, surface, volume, and finish—not one repeated silhouette.'],
    ['81619','Sample complete bodies of work. A hero image can suggest a code; only recurrence can establish one.'],
    ['159187','Name each recurring choice as a decision: its range, rationale, contributors, and living exceptions.'],
    ['81630','Test the code with blind comparisons and collaborator critique. Preserve disagreement.'],
    ['159303','Change the function. If recognition survives only in a ball gown, the code is too narrow.'],
    ['101642','Keep the counterexample. It stops a living practice from collapsing into a checklist or costume.'],
    ['159193','Let the code evolve. Credit every hand, and never confuse recognition with ownership of style.']
  ];
  return specifications.map(([id,caption],index)=>({...collectionPhotoFrame(byId(id),caption),frame:index+1,role:['hook','recurrence','notice','name','test','variation','counterexample','evolve'][index]}));
}

function b02PhotoLedCarouselB(objects){
  const byId=id=>objects.find(object=>object.id===id);
  const specifications=[
    ['155989','Recognition can outlive one hand. A house code becomes institutional when attribution, practice, and change can travel together.'],
    ['156069','Start across time, not with one famous look. A code accumulates through choices made under different conditions.'],
    ['159172','An ensemble reveals coordination: parts, materials, skilled hands, and approvals must resolve into one proposition.'],
    ['84553','Change the category. A coat asks whether the judgment travels beyond the object that first made it recognizable.'],
    ['81467','Change the promise. A wedding dress tests whether the code can answer an occasion without becoming a costume.'],
    ['80430','Institutions of One makes judgment legible enough to travel—without pretending the founder or collaborators are replaceable.'],
    ['159174','The durable code records contributors, exceptions, and reasons. It preserves a way of deciding, not a frozen visual recipe.'],
    ['84652','Now test your own work: which choice recurs, which exception keeps it alive, and whose hand must be credited?']
  ];
  return specifications.map(([id,caption],index)=>({...collectionPhotoFrame(byId(id),caption),frame:index+1,role:['hook','context','development','range','test','i1 relevance','ending','invitation'][index]}));
}

export function buildAssetKits({packages,exhibitions,candidates,objects=[]}){
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
    const carouselA=p.id==='B01'?b01PhotoLedCarousel(objects,x):p.id==='B02'?b02PhotoLedCarouselA(objects,x):baseFrames.slice(0,8).map((f,i)=>({...f,frame:i+1,role:['hook','material witness','claim','mechanism','handoff','evidence','counterpoint','action'][i]}));
    const rotated=[baseFrames[0],...baseFrames.slice(4),...baseFrames.slice(1,4)];
    const carouselB=p.id==='B01'?b01PhotoLedCarouselB(objects,x):p.id==='B02'?b02PhotoLedCarouselB(objects):rotated.slice(0,8).map((f,i)=>({...f,frame:i+1,role:['provocation','system','record','constraint','case','decision','tool','source trail'][i]}));
    for(const c of related){
      const placements=[];
      if(carouselA.some(f=>f.assetId===c.id))placements.push('instagram-carousel-a');
      if(carouselB.some(f=>f.assetId===c.id))placements.push('instagram-carousel-b');
      placements.push(['PUBLIC_DOMAIN_CC0','REUSE'].includes(c.disposition)?'package-media-library':'package-resources-room');
      assigned.get(c.id).add(`${p.id}:${placements.join('+')}`);
    }
    const motionEvidence=[...carouselA.slice(1,5),...carouselB.slice(2,4)].filter((f,i,a)=>a.findIndex(v=>v.assetId===f.assetId)===i);
    const companionPosts=buildCompanionPosts(p,x);
    return {
      packageId:p.id,title:p.title,domain:p.domain,version:'2.0',published:'2026-09-07',author:'RN Collins',
      principle:'The image opens the question; the story earns the conclusion.',
      narrativeSequence:carouselA.map(({assetId,role,caption,source,rights})=>({assetId,role,caption,source,rights})),
      instagram:{carouselA:{title:`${p.title}: the institutional sequence`,visualStatus:['B01','B02'].includes(p.id)?'PHOTO_LED_COMPLETE':'OPEN_VISUAL_REPLACEMENT',frames:carouselA},carouselB:{title:`${p.title}: what the record changes`,visualStatus:['B01','B02'].includes(p.id)?'PHOTO_LED_COMPLETE':'OPEN_VISUAL_REPLACEMENT',frames:carouselB}},
      reelsTikTokShorts:{durationSeconds:60,shots:motionEvidence.map((f,i)=>({time:`${i*8}–${(i+1)*8}s`,assetId:f.assetId,motion:i%2?'vertical reveal with source footer':'slow evidence push; no synthetic parallax',voiceover:f.caption,credit:f.credit,rights:f.rights})),endCard:`Open ${p.id} at institutions-of-one-fashion.vercel.app`},
      pinterest:{pins:[carouselA[0],carouselA[1],carouselA[6],carouselB[3]].filter(Boolean).map((f,i)=>({assetId:f.assetId,title:[p.title,x.movements[i%4][1],`The ${p.domain} record`,`A field tool for ${p.title}`][i],description:f.caption,destination:`/packages/${p.id.toLowerCase()}`,alt:f.alt,credit:f.credit,rights:f.rights}))},
      youtube:{visualTimeline:[{time:'00:00–00:20',purpose:'cold open',asset:carouselA[0]},{time:'00:20–01:20',purpose:'material witness and source boundary',asset:carouselA[1]},{time:'01:20–05:20',purpose:'four-part institutional sequence',assetIds:carouselA.slice(2,6).map(f=>f.assetId)},{time:'05:20–06:30',purpose:'counterpoint',asset:carouselA[6]},{time:'06:30–08:00',purpose:'field tool and source trail',assetIds:carouselB.slice(-2).map(f=>f.assetId)}],screenRule:'Every third-party object or public record carries creator/institution, identifier, canonical source and rights treatment on first appearance.'},
      beehiiv:{hero:carouselA[1]||carouselA[0],inline:carouselA.slice(2,6),sourceBox:records.slice(0,4).map(c=>({assetId:c.id,title:c.title,url:c.canonicalUrl,disposition:c.disposition}))},
      linkedIn:{documentFrames:carouselB,postImage:carouselB[0],altText:carouselB.map(f=>f.alt).join(' ')},
      companionPosts,
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
