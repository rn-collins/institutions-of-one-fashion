const navToggle=document.querySelector('.nav-toggle');
const primaryNav=document.querySelector('#primary-navigation');
const closeNavigation=()=>{
  navToggle?.setAttribute('aria-expanded','false');
  primaryNav?.classList.remove('open');
};
navToggle?.addEventListener('click',()=>{
  const expanded=navToggle.getAttribute('aria-expanded')==='true';
  navToggle.setAttribute('aria-expanded',String(!expanded));
  primaryNav?.classList.toggle('open',!expanded);
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&primaryNav?.classList.contains('open')){
    closeNavigation();
    navToggle?.focus();
  }
});
for(const link of document.querySelectorAll('#primary-navigation a')){
  const target=new URL(link.href,location.href).pathname.replace(/\/$/,'')||'/';
  const current=location.pathname.replace(/\/$/,'')||'/';
  if(target===current)link.setAttribute('aria-current','page');
}

const search=document.querySelector('[data-search]');
if(search){
  const rights=document.querySelector('[data-rights]');
  const run=()=>{
    const query=search.value.trim().toLowerCase();
    const facet=rights?.value||'all';
    let count=0;
    document.querySelectorAll('[data-text]').forEach(item=>{
      const show=item.dataset.text.includes(query)&&(facet==='all'||item.dataset.right===facet);
      item.hidden=!show;
      if(show)count++;
    });
    document.querySelector('[data-count]').textContent=count?`${count} record${count===1?'':'s'}`:'No matches. Reset filters or broaden the search.';
  };
  search.addEventListener('input',run);
  rights?.addEventListener('change',run);
  document.querySelector('[data-reset]')?.addEventListener('click',()=>{
    search.value='';
    if(rights)rights.value='all';
    run();
  });
}

const {snapshot,toCSV,toMarkdown}=globalThis.I1ToolCore;
for(const form of document.querySelectorAll('[data-tool]')){
  const key=`i1:${form.dataset.tool}:v${form.dataset.version}`;
  const restore=()=>{
    try{
      const data=JSON.parse(localStorage.getItem(key)||'{}');
      for(const element of form.elements){
        if(!element.name)continue;
        if(element.type==='checkbox')element.checked=data[element.name]===true;
        else element.value=data[element.name]??'';
      }
    }catch{}
  };
  const state=()=>Object.fromEntries([...form.elements].filter(element=>element.name).map(element=>[element.name,element.type==='checkbox'?element.checked:element.value]));
  form.addEventListener('input',()=>{
    try{
      localStorage.setItem(key,JSON.stringify(state()));
    }catch{
      form.querySelector('[data-storage]').textContent='Private storage unavailable; downloads still work.';
    }
  });
  for(const button of form.querySelectorAll('[data-download]')){
    button.addEventListener('click',()=>{
      const now=new Date().toISOString();
      const meta=snapshot(form.dataset.tool,form.dataset.version,state(),now);
      const csv=button.dataset.download==='csv';
      const body=csv?toCSV(meta):toMarkdown(form.querySelector('h2').textContent,meta);
      const type=csv?'text/csv':'text/markdown';
      const extension=csv?'.csv':'.md';
      const anchor=document.createElement('a');
      const url=URL.createObjectURL(new Blob([body],{type}));
      anchor.href=url;
      anchor.download=`${form.dataset.tool}-${now.slice(0,10)}${extension}`;
      anchor.click();
      setTimeout(()=>URL.revokeObjectURL(url),0);
    });
  }
  restore();
}

for(const editor of document.querySelectorAll('[data-companion-post]')){
  const textarea=editor.querySelector('[data-companion-text]');
  const status=editor.querySelector('[role="status"]');
  const storageKey=`i1:companion:${editor.dataset.companionPost}`;
  try{
    const saved=localStorage.getItem(storageKey);
    if(saved!==null)textarea.value=saved;
  }catch{}
  textarea.addEventListener('input',()=>{
    try{
      localStorage.setItem(storageKey,textarea.value);
      status.textContent='Saved in this browser.';
    }catch{
      status.textContent='Browser saving is unavailable. Download your edit to keep it.';
    }
  });
  editor.querySelector('[data-copy-post]')?.addEventListener('click',async()=>{
    try{
      await navigator.clipboard.writeText(textarea.value);
      status.textContent='Copied.';
    }catch{
      textarea.select();
      status.textContent='Selected. Use your device copy command.';
    }
  });
  editor.querySelector('[data-download-post]')?.addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([textarea.value],{type:'text/plain'}));
    const anchor=document.createElement('a');
    anchor.href=url;
    anchor.download=`${editor.dataset.companionPost.toLowerCase()}.txt`;
    anchor.click();
    setTimeout(()=>URL.revokeObjectURL(url),0);
    status.textContent='Downloaded.';
  });
}
