// RN Collins house style for the held social pieces (RN Collins studio, Nov 2, 2026).
// Applied to every publication asset kit before it is written or rendered, so carousels, pins, Reel plans,
// YouTube copy, companion posts and downloads all follow the brand rules: no em or en dashes, no exclamation
// points, no "record" in brand copy, none of the banned words that appear in this corpus, and no first-person
// lines RN did not write. Proper names (National Archives and Records Administration, Tapestry, Inc., source
// titles) and URLs are left exactly as they are. The live dossier pages do not read the kits, so this pass
// changes nothing that is public today.
const SKIP_KEYS=new Set(['source','destination','url','href','directAssetUrl','canonicalUrl','assetId','packageId','id','disposition','visualStatus','sha256','sourceSha256','renderedSha256','pairedCarousel','domain','version','published','rights','institution','credit']);
const PROTECT=[/National Archives and Records Administration/g,/Records Administration/g,/Electronic Records Management/g,/Records Management/g,/Federal Records Act/g,/Congressional Record/g,/House Record/g,/Tapestry,? Inc\.?/g,/\bTapestry\b/g];
const VERB_BEFORE=/(?:^|[;:,.?]\s*|\b(?:and|or|to|must|should|then|also|can|could|will|we|you|they|please|always|never)\s+)$/i;
const NOUN_AFTER=/^\s*(?:of|is|was|are|were|card|cards|holder|label|book|books|keeping|set|sets|shows|says|carries|owner|owners|holds|lists|changes|survives|separates|becomes|marks|preserves|needs|supports|stay|open|for|in|on|at|that|which|\.|,|;|:|\?|\)|$)/i;
function swapRecord(text){
  return text.replace(/\b([Rr])ecord(s|ed|ing|keeping)?\b(-keeping)?/g,(match,r,suffix='',keeping='',offset,whole)=>{
    const cap=r==='R',before=whole.slice(0,offset),after=whole.slice(offset+match.length);
    const c=w=>cap?w[0].toUpperCase()+w.slice(1):w;
    if(suffix==='keeping'||keeping)return c('document keeping');
    if(suffix==='ed')return c('documented');
    if(suffix==='ing')return /(?:separately|without)\s+$/i.test(before)?c('logging'):c('audio');
    if(suffix==='s')return c('documents');
    return VERB_BEFORE.test(before)&&!NOUN_AFTER.test(after)?c('log'):c('document');
  });
}
const WORDS=[
  [/\bHowever,\s*/g,'But '],[/,\s*however,\s*/g,', but '],[/\bhowever\b/g,'but'],[/\bHowever\b/g,'But'],
  [/\bcrucial\b/g,'important'],[/\bCrucial\b/g,'Important'],
  [/\bvaluable\b/g,'useful'],[/\bValuable\b/g,'Useful'],
  [/\benduring\b/g,'lasting'],[/\bEnduring\b/g,'Lasting'],
  [/\bseamless\b/g,'smooth'],[/\bSeamless\b/g,'Smooth'],
  [/\bleverage constraints\b/g,'bargaining limits'],[/\bthe party with leverage\b/g,'the stronger party'],[/\bleverage device\b/g,'bargaining tool'],[/\bleverage\b/g,'bargaining power'],
  [/\bultimately\b/g,'in the end'],[/\bUltimately,\s*/g,'In the end, '],
  [/\badditionally\b/g,'also'],[/\bAdditionally,\s*/g,'Also, '],
  [/\bmoreover\b/gi,'also'],[/\bfurthermore\b/gi,'also'],
  [/\butilize\b/g,'use'],[/\bfacilitate\b/g,'help'],[/\brobust\b/g,'strong'],[/\bcomprehensive\b/g,'full'],
  [/\bfostering\b/g,'building'],[/\benhance\b/g,'improve'],[/\bpivotal\b/g,'central'],[/\bjourney\b/g,'path']
];
export function plainHouseText(input){
  let text=String(input??'');
  if(/^https?:\/\/\S+$/.test(text))return text;
  const held=[];
  for(const rx of PROTECT)text=text.replace(rx,m=>{held.push(m);return `\u0000${held.length-1}\u0000`});
  text=text
    .replace(/(\d)\s*[–—]\s*(\d)/g,'$1 to $2')
    .replace(/\b([A-Z]{3,})\s+[–—]\s+/g,'$1: ')
    .replace(/\s*[–—]\s*/g,', ')
    .replace(/!/g,'.')
    .replace(/\?\./g,'?')
    .replace(/,\s*,/g,',')
    .replace(/,\s*([.?;:])/g,'$1')
    .replace(/^,\s*/,'');
  for(const [rx,to] of WORDS)text=text.replace(rx,to);
  text=text.replace(/approval, recording\/editing/g,'approval, filming/editing').replace(/\bthe right not to record\b/g,'the right to decline taping').replace(/\brecordings\b/g,'audio and video files').replace(/\bRecordings\b/g,'Audio and video files');
  text=text.replace(/\bRECORDS?\b/g,m=>m.length>6?'DOCUMENTS':'DOCUMENT');
  text=swapRecord(text);
  text=text.replace(/\u0000(\d+)\u0000/g,(_,i)=>held[Number(i)]);
  return text;
}
export function houseStyle(value,key=''){
  if(typeof value==='string')return SKIP_KEYS.has(key)?value.replace(/[–—]/g,'-'):plainHouseText(value);
  if(Array.isArray(value))return value.map(v=>houseStyle(v,key));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,houseStyle(v,k)]));
  return value;
}
// Counts what a reviewer still has to read for: anything this pass cannot fix by rule.
export function houseStyleFindings(value,found={dashes:0,exclamations:0,record:0,firstPerson:[]},key=''){
  if(typeof value==='string'){
    if(SKIP_KEYS.has(key)||/^https?:\/\/\S+$/.test(value))return found;
    let probe=value;for(const rx of PROTECT)probe=probe.replace(rx,'');
    found.dashes+=(probe.match(/[–—]/g)||[]).length;found.exclamations+=(probe.match(/!/g)||[]).length;found.record+=(probe.match(/\brecord/gi)||[]).length;
    const fp=probe.replace(/[“"][^”"]*[”"]/g,'');if(/\b(?:I|me|my|I’m|I'm)\b/.test(fp))found.firstPerson.push(value.slice(0,120));
    return found;
  }
  if(Array.isArray(value)){for(const v of value)houseStyleFindings(v,found,key);return found}
  if(value&&typeof value==='object'){for(const [k,v] of Object.entries(value))houseStyleFindings(v,found,k);return found}
  return found;
}
