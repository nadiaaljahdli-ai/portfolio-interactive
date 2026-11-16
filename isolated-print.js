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
window.addEventListener('beforeprint',build);
document.addEventListener('click',e=>{
  if(e.target.closest('button')?.textContent?.trim()==='PDF')build();
},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
