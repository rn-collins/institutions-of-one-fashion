// Release gate. data/releases.json is the only record that decides what the
// public build emits. A piece is public when its releasedAt date (Pacific/Honolulu)
// is today or earlier and hold is false. Anything else, including an empty or
// malformed date, a missing entry or an unknown id, stays out of dist/.
import fs from 'node:fs';
import path from 'node:path';

export const SOCIAL_PIECES=['carousel-a','carousel-b','reel','pin-01','pin-02','pin-03','pin-04','youtube'];
export const pieceId=(dossierId,suffix='')=>`ioo-fashion/${dossierId.toLowerCase()}${suffix?`-${suffix}`:''}`;

// Today's date in Hawaii as YYYY-MM-DD. RELEASES_TODAY is honored only when
// RELEASES_TEST=1, so the test suite can check future dates; a production build
// always uses the real clock.
export function todayInHawaii(now=new Date()){
  if(process.env.RELEASES_TEST==='1'&&/^\d{4}-\d{2}-\d{2}$/.test(process.env.RELEASES_TODAY||''))return process.env.RELEASES_TODAY;
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Pacific/Honolulu',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}

export function loadReleases(root,{today=todayInHawaii()}={}){
  const file=process.env.RELEASES_TEST==='1'&&process.env.RELEASES_FILE?process.env.RELEASES_FILE:path.join(root,'data','releases.json');
  const doc=JSON.parse(fs.readFileSync(file,'utf8'));
  if(!Array.isArray(doc.pieces))throw new Error('data/releases.json: pieces must be an array');
  const byId=new Map();
  for(const piece of doc.pieces){
    if(!piece||typeof piece.id!=='string'||!piece.id)throw new Error('data/releases.json: every piece needs an id');
    if(byId.has(piece.id))throw new Error(`data/releases.json: duplicate id ${piece.id}`);
    if(piece.releasedAt&&!/^\d{4}-\d{2}-\d{2}$/.test(piece.releasedAt))throw new Error(`data/releases.json: ${piece.id} releasedAt must be YYYY-MM-DD or empty`);
    byId.set(piece.id,piece);
  }
  const isReleased=id=>{const p=byId.get(id);return Boolean(p&&p.hold===false&&typeof p.releasedAt==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p.releasedAt)&&p.releasedAt<=today)};
  const get=id=>byId.get(id);
  const postLinks=id=>{const urls=get(id)?.postUrls||{};return Object.entries(urls).filter(([,u])=>typeof u==='string'&&/^https:\/\//.test(u))};
  return {today,pieces:doc.pieces,get,isReleased,postLinks};
}
