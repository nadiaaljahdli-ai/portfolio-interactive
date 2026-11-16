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
  setTimeout(()=>{refreshQueued=false;build();},60);
}
function watchEvidence(){
  const pages=document.getElementById('pages');
  if(!pages){setTimeout(watchEvidence,150);return;}
  new MutationObserver(records=>{
    if(records.some(r=>r.target.closest?.('.slot') || Array.from(r.addedNodes||[]).some(n=>n.nodeType===1&&(n.matches?.('.slot,.evidence-gallery,.evidence-tile')||n.querySelector?.('.evidence-gallery')))))refresh();
  }).observe(pages,{subtree:true,childList:true,attributes:true,attributeFilter:['src','class']});
  refresh();
}
window.addEventListener('beforeprint',build);
window.addEventListener('focus',refresh);
window.addEventListener('pageshow',refresh);
document.addEventListener('click',e=>{
  if(e.target.closest('button')?.textContent?.trim()==='PDF')build();
},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{build();watchEvidence();});else{build();watchEvidence();}
})();
