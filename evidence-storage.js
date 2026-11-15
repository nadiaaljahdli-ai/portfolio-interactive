/* Multi-image evidence editor; original page artwork remains untouched. */
(() => {
'use strict';
const DB='portfolio-evidence-v2',STORE='images';
let dbp;
function db(){return dbp ||= new Promise((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});}
async function read(k){const d=await db();return new Promise((ok,no)=>{const r=d.transaction(STORE).objectStore(STORE).get(k);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});}
async function write(k,v){const d=await db();return new Promise((ok,no)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).put(v,k);t.oncomplete=ok;t.onerror=()=>no(t.error);});}
const states=new WeakMap();
function keyFor(slot){const page=slot.closest('[data-page],.page,.sheet,section')||slot.parentElement;const id=page?.getAttribute('data-page')||page?.id||'page';return 'evidence:'+id+':'+Array.from(page.querySelectorAll('.slot')).indexOf(slot);}
function normalize(value){if(Array.isArray(value))return value.filter(x=>x&&typeof x.src==='string').map(x=>({src:x.src,scale:Math.max(45,Math.min(180,Number(x.scale)||100))}));if(typeof value==='string'&&value.startsWith('data:image/'))return [{src:value,scale:100}];return [];}
function button(label,action,cls){const b=document.createElement('button');b.type='button';b.textContent=label;b.className=cls||'evidence-control';b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();action();});return b;}
async function save(s){try{await write(s.key,s.items);}catch(e){console.warn('Evidence save failed',e);alert('تعذر حفظ الصور على الجهاز. تحققي من مساحة التخزين.');}}
function render(s){
 const {slot}=s;
 s.rendering=true;
 slot.querySelectorAll('.evidence-gallery,.evidence-tools,.evidence-remove').forEach(n=>n.remove());
 const original=slot.querySelector('span');if(original)original.style.display=s.items.length?'none':'';
 if(!s.items.length){slot.classList.add('empty');s.rendering=false;return;}
 slot.classList.remove('empty');
 const gallery=document.createElement('div');gallery.className='evidence-gallery';
 s.items.forEach((item,i)=>{
   const tile=document.createElement('div');tile.className='evidence-tile';
   const img=document.createElement('img');img.src=item.src;img.alt='شاهد '+(i+1);img.style.transform='scale('+(item.scale/100)+')';tile.append(img);
   const tools=document.createElement('div');tools.className='evidence-tile-tools';
   tools.append(button('−',()=>resize(s,i,-10),'evidence-mini'),button('+',()=>resize(s,i,10),'evidence-mini'),button('×',()=>{s.items.splice(i,1);render(s);save(s);},'evidence-mini evidence-delete'));
   tile.append(tools);gallery.append(tile);
 });
 const bar=document.createElement('div');bar.className='evidence-tools';
 bar.append(button('+ صورة',()=>s.input.click(),'evidence-add'));
 slot.append(gallery,bar);
 s.rendering=false;
}
function resize(s,i,delta){s.items[i].scale=Math.max(45,Math.min(180,s.items[i].scale+delta));render(s);save(s);}
async function addFiles(s,files){
 for(const file of files){if(!file.type.startsWith('image/'))continue;
   const data=await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>no(r.error);r.readAsDataURL(file);});
   s.items.push({src:data,scale:100});
 }
 render(s);await save(s);
}
async function initSlot(slot){
 if(states.has(slot))return;
 const input=document.createElement('input');input.type='file';input.accept='image/*';input.multiple=true;input.hidden=true;
 const s={slot,input,key:keyFor(slot),items:[],rendering:false};states.set(slot,s);
 input.addEventListener('change',()=>{const files=Array.from(input.files||[]);input.value='';addFiles(s,files);});
 slot.append(input);
 slot.addEventListener('click',e=>{
   if(e.target.closest('button,.evidence-tile-tools,.evidence-tools'))return;
   e.preventDefault();e.stopImmediatePropagation();input.click();
 },true);
 try{s.items=normalize(await read(s.key));}catch(e){console.warn('Cannot load evidence',e);}
 const existing=Array.from(slot.children).filter(n=>n.tagName==='IMG'&&n.src?.startsWith('data:image/'));
 for(const img of existing){if(!s.items.some(x=>x.src===img.src))s.items.push({src:img.src,scale:100});img.remove();}
 render(s);if(existing.length)save(s);
 const observer=new MutationObserver(()=>{
  if(s.rendering)return;
  const added=Array.from(slot.children).filter(n=>n.tagName==='IMG'&&n.src?.startsWith('data:image/'));
  if(!added.length)return;
  for(const img of added){if(!s.items.some(x=>x.src===img.src))s.items.push({src:img.src,scale:100});img.remove();}
  render(s);save(s);
 });
 observer.observe(slot,{childList:true});
}
function scan(){document.querySelectorAll('.slot').forEach(initSlot);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();
new MutationObserver(()=>scan()).observe(document.documentElement,{childList:true,subtree:true});
})();