/* Local evidence image persistence and removal. Does not modify original page artwork. */
(() => {
  'use strict';
  const DB='portfolio-evidence-v2', STORE='images';
  let dbPromise;
  function database(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB,1);
      req.onupgradeneeded=()=>req.result.createObjectStore(STORE);
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
    return dbPromise;
  }
  async function dbGet(key){
    const db=await database();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readonly'),r=tx.objectStore(STORE).get(key);
      r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
    });
  }
  async function dbPut(key,value){
    const db=await database();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).put(value,key);
      tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
    });
  }
  async function dbDelete(key){
    const db=await database();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
    });
  }
  const keys=new WeakMap();
  const busy=new WeakSet();
  function keyFor(slot){
    if(keys.has(slot))return keys.get(slot);
    const page=slot.closest('[data-page],.page,.sheet,section')||slot.parentElement;
    const pageId=page?.getAttribute('data-page')||page?.id||Array.from(document.querySelectorAll('.page,.sheet')).indexOf(page);
    const slots=page?Array.from(page.querySelectorAll('.slot')):Array.from(document.querySelectorAll('.slot'));
    const slotIndex=slots.indexOf(slot);
    const key='evidence:'+String(pageId)+':'+String(slotIndex);
    keys.set(slot,key);return key;
  }
  function addRemove(slot){
    if(slot.querySelector('.evidence-remove'))return;
    const btn=document.createElement('button');
    btn.type='button';btn.className='evidence-remove';btn.textContent='× حذف الصورة';
    btn.setAttribute('aria-label','حذف صورة الشاهد المضافة');
    btn.addEventListener('click',async e=>{
      e.preventDefault();e.stopPropagation();
      busy.add(slot);
      try{
        await dbDelete(keyFor(slot));
        slot.querySelectorAll('img').forEach(img=>img.remove());
        slot.classList.add('empty');
        if(!slot.querySelector('span')){
          const span=document.createElement('span');span.textContent='+ إضافة صورة شاهد';slot.append(span);
        }
        btn.remove();
      }catch(err){alert('تعذر حذف الصورة المحفوظة. حاولي مجددًا.');}
      finally{setTimeout(()=>busy.delete(slot),100);}
    });
    slot.append(btn);
  }
  async function capture(slot){
    if(busy.has(slot))return;
    const img=slot.querySelector('img');
    if(!img)return;
    addRemove(slot);
    const src=img.getAttribute('src');
    if(!src||!src.startsWith('data:image/'))return;
    busy.add(slot);
    try{await dbPut(keyFor(slot),src);}
    catch(err){console.warn('تعذر حفظ الصورة على الجهاز',err);}
    finally{busy.delete(slot);}
  }
  async function restore(slot){
    if(busy.has(slot))return;
    const existing=slot.querySelector('img');
    if(existing){addRemove(slot);await capture(slot);return;}
    busy.add(slot);
    try{
      const src=await dbGet(keyFor(slot));
      if(src&&!slot.querySelector('img')){
        const img=document.createElement('img');img.src=src;img.alt='صورة الشاهد المضافة';
        slot.append(img);slot.classList.remove('empty');addRemove(slot);
      }
    }catch(err){console.warn('تعذر استعادة الصورة',err);}
    finally{busy.delete(slot);}
  }
  let scanTimer;
  function scan(){
    document.querySelectorAll('.slot').forEach(slot=>{
      if(!slot.dataset.evidenceObserved){
        slot.dataset.evidenceObserved='1';
        const observer=new MutationObserver(()=>{if(!busy.has(slot))setTimeout(()=>restore(slot),180);});
        observer.observe(slot,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
        restore(slot);
      }
    });
  }
  const rootObserver=new MutationObserver(()=>{clearTimeout(scanTimer);scanTimer=setTimeout(scan,250);});
  function init(){scan();rootObserver.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
