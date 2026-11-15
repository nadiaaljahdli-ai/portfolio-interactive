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
function normalize(value){if(Array.isArray(value))return value.filter(x=>x&&typeof x.src==='string').map(x=>({src:x.src,scale:Math.max(45,Math.min(180,Number(x.scale)||100)),kind:x.kind==='barcode'?'barcode':'image',x:Number(x.x)||0,y:Number(x.y)||0}));if(typeof value==='string'&&value.startsWith('data:image/'))return [{src:value,scale:100}];return [];}
function button(label,action,cls){const b=document.createElement('button');b.type='button';b.textContent=label;b.className=cls||'evidence-control';b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();action();});return b;}
async function save(s){try{await write(s.key,s.items);}catch(e){console.warn('Evidence save failed',e);alert('تعذر حفظ الصور على الجهاز. تحققي من مساحة التخزين.');}}
function render(s){
 const {slot}=s;
 s.rendering=true;
 slot.querySelectorAll('.evidence-gallery,.evidence-tools,.evidence-remove').forEach(n=>n.remove());
 slot.querySelectorAll('button').forEach(n=>{if(n.textContent.includes('حذف الصورة'))n.remove();});
 const original=slot.querySelector('span');if(original)original.style.display=s.items.length?'none':'';
 if(!s.items.length)slot.classList.add('empty');else slot.classList.remove('empty');
 const gallery=document.createElement('div');gallery.className='evidence-gallery';
 s.items.forEach((item,i)=>{
   const tile=document.createElement('div');tile.className='evidence-tile'+(item.kind==='barcode'?' evidence-barcode':'');tile.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();slot.querySelectorAll('.evidence-tile').forEach(t=>t.classList.remove('evidence-selected'));tile.classList.add('evidence-selected');slot.classList.add('evidence-editing');});
   const img=document.createElement('img');img.src=item.src;img.alt=(item.kind==='barcode'?'باركود ':'شاهد ')+(i+1);img.style.transform='translate('+ (item.x||0) +'px,'+(item.y||0)+'px) scale('+(item.scale/100)+')';tile.append(img);
   attachTouch(img,item,s);
   const tools=document.createElement('div');tools.className='evidence-tile-tools';
   tools.append(button('×',()=>{s.items.splice(i,1);render(s);save(s);},'evidence-mini evidence-delete'));
   tile.append(tools);gallery.append(tile);
 });
 const bar=document.createElement('div');bar.className='evidence-tools';
 bar.append(button('+ صورة',()=>s.input.click(),'evidence-add'),button('+ باركود',()=>s.barcodeInput.click(),'evidence-add evidence-add-barcode'));
 slot.append(gallery,bar);
 s.rendering=false;
}
function attachTouch(img,item,s){
 let start=null,changed=false;
 const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 img.addEventListener('touchstart',e=>{if(!e.touches.length)return;start={x:e.touches[0].clientX,y:e.touches[0].clientY,scale:item.scale,ox:item.x||0,oy:item.y||0,d:e.touches.length>1?dist(e.touches):0};changed=false;},{passive:true});
 img.addEventListener('touchmove',e=>{if(!start)return;e.preventDefault();changed=true;
 if(e.touches.length>1){if(!start.d){start.d=dist(e.touches);start.scale=item.scale;}item.scale=Math.max(45,Math.min(250,Math.round(start.scale*dist(e.touches)/Math.max(1,start.d))));}
 else if(!start.d){item.x=Math.max(-120,Math.min(120,start.ox+e.touches[0].clientX-start.x));item.y=Math.max(-120,Math.min(120,start.oy+e.touches[0].clientY-start.y));}
 img.style.transform='translate('+(item.x||0)+'px,'+(item.y||0)+'px) scale('+(item.scale/100)+')';
 },{passive:false});
 img.addEventListener('touchend',()=>{if(changed)save(s);if(!imgTouchesRemaining())start=null;},{passive:true});
 function imgTouchesRemaining(){return false;}
}
function resize(s,i,delta){s.items[i].scale=Math.max(45,Math.min(180,s.items[i].scale+delta));render(s);save(s);}
async function addFiles(s,files,kind='image'){
 for(const file of files){if(!file.type.startsWith('image/'))continue;
   const data=await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>no(r.error);r.readAsDataURL(file);});
   s.items.push({src:data,scale:100,kind,x:0,y:0});
 }
 render(s);await save(s);
}
async function initSlot(slot){
 if(states.has(slot))return;
 const input=document.createElement('input');input.type='file';input.accept='image/*';input.multiple=true;input.hidden=true;
 const barcodeInput=document.createElement('input');barcodeInput.type='file';barcodeInput.accept='image/*';barcodeInput.multiple=true;barcodeInput.hidden=true;
 const s={slot,input,barcodeInput,key:keyFor(slot),items:[],rendering:false};states.set(slot,s);
 input.addEventListener('change',()=>{const files=Array.from(input.files||[]);input.value='';addFiles(s,files);});
 barcodeInput.addEventListener('change',()=>{const files=Array.from(barcodeInput.files||[]);barcodeInput.value='';addFiles(s,files,'barcode');});
 slot.append(input,barcodeInput);
 slot.addEventListener('click',e=>{
   if(e.target===input||e.target===barcodeInput||e.target.closest('.evidence-tools,.evidence-tile-tools'))return;
   e.preventDefault();e.stopImmediatePropagation();
   const tile=e.target.closest('.evidence-tile');
   if(tile){slot.querySelectorAll('.evidence-tile').forEach(t=>t.classList.remove('evidence-selected'));tile.classList.add('evidence-selected');slot.classList.add('evidence-editing');return;}
   if(e.target.closest('.evidence-tools,.evidence-tile-tools,button'))return;
   input.click();
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
function scan(){document.querySelectorAll('.slot').forEach(initSlot);setupBackup();}

async function backupAll(){
 const d=await db();
 return new Promise((resolve,reject)=>{
  const entries={};const tx=d.transaction(STORE,'readonly');const req=tx.objectStore(STORE).openCursor();
  req.onsuccess=()=>{const cur=req.result;if(cur){if(String(cur.key).startsWith('evidence:'))entries[cur.key]=normalize(cur.value);cur.continue();}else resolve(entries);};
  req.onerror=()=>reject(req.error);
 });
}
async function exportBackup(){
 try{
  const entries=await backupAll();const count=Object.values(entries).reduce((n,a)=>n+a.length,0);
  if(!count){alert('لا توجد صور أو باركودات محفوظة في هذا المتصفح. افتحي النسخة التي تحتوي على شواهدك.');return;}
  const blob=new Blob([JSON.stringify({format:'portfolio-evidence-backup',version:1,created:new Date().toISOString(),entries})],{type:'application/json'});
  const file=new File([blob],'شواهد-ملف-الإنجاز.json',{type:'application/json'});
  if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
   try{await navigator.share({files:[file],title:'نسخة احتياطية لشواهد الإنجاز'});return;}
   catch(err){if(err.name==='AbortError')return;}
  }
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  alert('تم تجهيز النسخة الاحتياطية. احتفظي بها في تطبيق الملفات ثم افتحي الموقع في Safari لاستيرادها.');
 }catch(err){console.error(err);alert('تعذر تصدير النسخة الاحتياطية.');}
}
async function importBackup(file){
 if(!file)return;
 try{
  const data=JSON.parse(await file.text());
  if(data.format!=='portfolio-evidence-backup'||data.version!==1||!data.entries||typeof data.entries!=='object'||Array.isArray(data.entries))throw Error('Invalid backup');
  const entries=Object.entries(data.entries);
  if(!entries.length||entries.length>500||entries.some(([k,v])=>!/^evidence:[^:]+:\\d+$/.test(k)||!Array.isArray(v)||v.length>100||v.some(x=>!x||typeof x.src!=='string'||!/^data:image\\//.test(x.src))))throw Error('Invalid entries');
  if(!confirm('سيتم استيراد الشواهد من النسخة الاحتياطية إلى هذا المتصفح. ستُستبدل الشواهد في المربعات المطابقة. هل تريدين المتابعة؟'))return;
  const d=await db();
  await new Promise((resolve,reject)=>{
   const tx=d.transaction(STORE,'readwrite');for(const [key,items] of entries)tx.objectStore(STORE).put(normalize(items),key);
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
  alert('تم استيراد الشواهد بنجاح. ستُحدّث الصفحة لعرض الصور والباركودات.');location.reload();
 }catch(err){console.error(err);alert('ملف النسخة الاحتياطية غير صالح أو تعذر استيراده. لم تُحذف بياناتك.');}
}
function setupBackup(){
 if(document.getElementById('evidence-backup-controls'))return;
 const wrap=document.createElement('div');wrap.id='evidence-backup-controls';
 const out=button('⬇ تصدير الشواهد',exportBackup,'evidence-backup-btn');
 const inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';inp.hidden=true;
 inp.addEventListener('change',()=>{const file=inp.files?.[0];inp.value='';importBackup(file);});
 const load=button('⬆ استيراد الشواهد',()=>inp.click(),'evidence-backup-btn');
 wrap.append(out,load,inp);
 const nav=document.querySelector('nav');if(nav)nav.insertAdjacentElement('afterend',wrap);else document.body.prepend(wrap);
}

document.addEventListener('click',e=>{if(!e.target.closest('.slot'))document.querySelectorAll('.slot.evidence-editing').forEach(s=>{s.classList.remove('evidence-editing');s.querySelectorAll('.evidence-selected').forEach(t=>t.classList.remove('evidence-selected'));});});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();
new MutationObserver(()=>scan()).observe(document.documentElement,{childList:true,subtree:true});
})();