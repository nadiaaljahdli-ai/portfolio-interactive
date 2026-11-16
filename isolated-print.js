/* Isolated print document: never paginate interactive page containers. */
(() => {
'use strict';
let root;
function build(){
  if(!document.body)return;
  if(!root){root=document.createElement('div');root.id='portfolio-print-root';document.body.append(root);}
  const originals=Array.from(document.querySelectorAll('#pages .page-block .paper'));
  if(!originals.length)return;
  const fragment=document.createDocumentFragment();
  for(const paper of originals){
    const sheet=document.createElement('div');sheet.className='portfolio-print-sheet';
    const copy=paper.cloneNode(true);
    copy.querySelectorAll('button,input,.evidence-tools,.evidence-tile-tools,.evidence-remove,.placeholder').forEach(x=>x.remove());
    copy.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
    sheet.append(copy);fragment.append(sheet);
  }
  root.replaceChildren(fragment);
}
// Evidence is restored asynchronously from IndexedDB. Keep print copies in sync
// with the original page DOM, without ever modifying the stored evidence.
let refreshQueued=false;
function refresh(){
  if(refreshQueued)return;
  refreshQueued=true;
  setTimeout(()=>{refreshQueued=false;buildAndSync();},60);
}
function watchEvidence(){
  const pages=document.getElementById('pages');
  if(!pages){setTimeout(watchEvidence,150);return;}
  new MutationObserver(records=>{
    if(records.some(r=>r.target.closest?.('.slot') || Array.from(r.addedNodes||[]).some(n=>n.nodeType===1&&(n.matches?.('.slot,.evidence-gallery,.evidence-tile')||n.querySelector?.('.evidence-gallery')))))refresh();
  }).observe(pages,{subtree:true,childList:true,attributes:true,attributeFilter:['src','class']});
  refresh();
}

// Populate the print-only DOM directly from the same IndexedDB records as the editor.
// This avoids relying on asynchronous screen rendering or cloned gallery state.
let evidenceSyncId=0;
async function syncPrintEvidence(){
 const token=++evidenceSyncId;
 let database;
 try{
  database=await new Promise((resolve,reject)=>{const req=indexedDB.open('portfolio-evidence-v2',1);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
 }catch(e){console.warn('Print evidence database unavailable',e);return;}
 const originals=Array.from(document.querySelectorAll('#pages .page-block'));
 const copies=Array.from(root?.querySelectorAll('.portfolio-print-sheet')||[]);
 if(!copies.length||copies.length!==originals.length){database.close();return;}
 for(let p=0;p<originals.length;p++){
  if(token!==evidenceSyncId)break;
  const sourceSlots=Array.from(originals[p].querySelectorAll('.paper > .slot'));
  const targetSlots=Array.from(copies[p].querySelectorAll('.paper > .slot'));
  for(let i=0;i<Math.min(sourceSlots.length,targetSlots.length);i++){
   const section=originals[p];
   const key='evidence:'+(section.getAttribute('data-page')||section.id||'page')+':'+i;
   let items;
   try{items=await new Promise((resolve,reject)=>{const request=database.transaction('images','readonly').objectStore('images').get(key);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}catch(e){continue;}
   if(token!==evidenceSyncId)break;
   if(!Array.isArray(items)||!items.length)continue;
   const target=targetSlots[i];
   target.classList.remove('empty');
   target.querySelectorAll('.evidence-gallery,.evidence-tools,.evidence-tile-tools').forEach(n=>n.remove());
   const gallery=document.createElement('div');gallery.className='evidence-gallery';
   for(const item of items){
    if(!item||typeof item.src!=='string'||!item.src.startsWith('data:image/'))continue;
    const tile=document.createElement('div');tile.className='evidence-tile'+(item.kind==='barcode'?' evidence-barcode':'');
    const img=document.createElement('img');img.src=item.src;
    img.style.transform='translate('+(Number(item.x)||0)+'px,'+(Number(item.y)||0)+'px) scale('+((Number(item.scale)||100)/100)+')';
    tile.append(img);gallery.append(tile);
   }
   target.append(gallery);
  }
 }
 database.close();
}
function buildAndSync(){build();syncPrintEvidence();}
window.addEventListener('beforeprint',buildAndSync);
window.addEventListener('focus',()=>{refresh();setTimeout(syncPrintEvidence,150);});
window.addEventListener('pageshow',()=>{refresh();setTimeout(syncPrintEvidence,150);});
document.addEventListener('click',e=>{
  if(e.target.closest('button')?.textContent?.trim()==='PDF')buildAndSync();
},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{buildAndSync();watchEvidence();});else{buildAndSync();watchEvidence();}
})();
