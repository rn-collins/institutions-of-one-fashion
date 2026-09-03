(function(g){
  const disclosure='Educational planning instrument; not legal advice. No data is transmitted.';
  const csvCell=value=>{let s=String(value??'');if(/^[=+\-@]/.test(s))s="'"+s;return `"${s.replaceAll('"','""')}"`};
  const snapshot=(tool,version,state,now=new Date().toISOString())=>({tool,version,generated_at:now,disclosure,...state});
  const toCSV=meta=>'field,value\n'+Object.entries(meta).map(([k,v])=>`${csvCell(k)},${csvCell(v)}`).join('\n');
  const toMarkdown=(title,meta)=>`# ${title}\n\n- Tool: ${meta.tool}\n- Version: ${meta.version}\n- Generated: ${meta.generated_at}\n- Disclosure: ${meta.disclosure}\n\n## Complete state\n`+Object.entries(meta).filter(([k])=>!['tool','version','generated_at','disclosure'].includes(k)).map(([k,v])=>`- ${k}: ${v===true?'checked':v===false?'unchecked':String(v).replaceAll('\n',' ')}`).join('\n');
  g.I1ToolCore={disclosure,csvCell,snapshot,toCSV,toMarkdown};
})(globalThis);
