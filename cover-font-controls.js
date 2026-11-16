(()=>{'use strict';
const KEY='male-cover-school', NAME='male-cover-name-v3', SIZE='male-cover-font-size-v2';
let fontSize=16;try{fontSize=Math.max(12,Math.min(30,Number(localStorage.getItem(SIZE)||16)))}catch(e){}
const style=document.createElement('style');
style.textContent=`
.paper{position:relative!important}
.paper .cover-fields{position:absolute;bottom:3.2%;left:9%;width:82%;height:13.2%;z-index:8;display:flex;flex-direction:column;justify-content:center;gap:8%;padding:1.5% 3%;background:#0b294b;border:1px solid #d6b56c;border-radius:12px;box-shadow:0 2px 8px #061b3544;direction:rtl;box-sizing:border-box}
.paper .cover-fields .cover-pill{display:flex;align-items:center;gap:3%;height:43%;min-height:0;padding:0 4%;border-radius:999px;background:#fff;border:1px solid #d9bd7e;box-sizing:border-box;overflow:hidden}
.paper .cover-fields .cover-label{flex:0 0 auto;color:#102c4e;font-family:Tahoma,Arial,sans-serif;font-size:clamp(10px,2.2vw,18px);font-weight:700;white-space:nowrap}
.paper .cover-fields input.cover-name,.paper .cover-fields input.cover-school{position:static!important;inset:auto!important;top:auto!important;bottom:auto!important;left:auto!important;right:auto!important;display:block!important;flex:1 1 0!important;width:0!important;max-width:none!important;min-width:0!important;height:100%!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;outline:0!important;background:transparent!important;box-shadow:none!important;color:#102c4e!important;text-align:right!important;direction:rtl!important;font-family:Tahoma,Arial,sans-serif!important;font-size:var(--male-cover-font-size,16px)!important;font-weight:700!important;line-height:normal!important;box-sizing:border-box!important}
.paper .cover-fields input::placeholder{color:transparent!important}
.paper .cover-fields .cover-clear{flex:0 0 auto;width:24px;height:24px;border:0;border-radius:50%;background:#e9edf2;color:#263e59;font-size:19px;line-height:22px;text-align:center;padding:0;cursor:pointer}
@media print{.paper .cover-fields .cover-clear{display:none!important}.paper .cover-fields .cover-print-value{font-size:39px!important;line-height:1.15!important;font-weight:700!important}.paper .cover-fields .cover-label{font-size:25px!important}}
.paper .cover-fields .cover-print-value{display:block!important;flex:1;min-width:0;text-align:right;direction:rtl;color:#102c4e;font-family:Tahoma,Arial,sans-serif;font-weight:700;font-size:var(--male-cover-font-size,16px);white-space:nowrap;overflow:hidden;outline:none;min-height:1.4em}
.paper .cover-fields input.cover-name,.paper .cover-fields input.cover-school{display:none!important}@media print{.paper .cover-fields .cover-print-value{display:block!important}}
#cover-font-tools{position:fixed;right:12px;bottom:16px;z-index:9999;display:flex;gap:7px;align-items:center;background:#fff;border:1px solid #bbb;border-radius:12px;padding:7px;box-shadow:0 2px 12px #0003;direction:rtl}
#cover-font-tools button{border:0;border-radius:8px;background:#102f55;color:#fff;font-size:19px;min-width:38px;height:36px;padding:0}
#cover-font-tools span{font-size:12px;color:#24314a}
@media print{#cover-font-tools{display:none!important}.paper .cover-fields{box-shadow:none!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`;document.head.append(style);
const controls=document.createElement('div');controls.id='cover-font-tools';controls.innerHTML='<span>حجم خط الغلاف</span><button type="button" id="cover-font-plus" aria-label="تكبير الخط">+</button><button type="button" id="cover-font-minus" aria-label="تصغير الخط">−</button>';document.body.append(controls);
function apply(){document.documentElement.style.setProperty('--male-cover-font-size',fontSize+'px');try{localStorage.setItem(SIZE,fontSize)}catch(e){}}
controls.querySelector('#cover-font-plus').onclick=()=>{fontSize=Math.min(30,fontSize+2);apply()};
controls.querySelector('#cover-font-minus').onclick=()=>{fontSize=Math.max(12,fontSize-2);apply()};
function setup(){
document.querySelectorAll('.page-block[data-n="1"] .paper').forEach(paper=>{
 if(paper.querySelector('.cover-fields'))return;
 const old=paper.querySelector('input.cover-name');if(!old)return;
 const panel=document.createElement('div');panel.className='cover-fields';
 function row(label,input){const pill=document.createElement('div');pill.className='cover-pill';const caption=document.createElement('span');caption.className='cover-label';caption.textContent=label+' /';const printed=document.createElement('div');printed.className='cover-print-value';printed.contentEditable='true';printed.setAttribute('role','textbox');printed.setAttribute('aria-label',label);printed.setAttribute('dir','rtl');printed.textContent=input.value||'';printed.addEventListener('input',()=>{input.value=printed.textContent||'';try{localStorage.setItem(label==='الاسم'?NAME:KEY,input.value)}catch(e){}input.dispatchEvent(new Event('input',{bubbles:true}))});const clear=document.createElement('button');clear.type='button';clear.className='cover-clear';clear.textContent='×';clear.setAttribute('aria-label','حذف '+label);clear.addEventListener('click',()=>{printed.textContent='';input.value='';try{localStorage.setItem(label==='الاسم'?NAME:KEY,'')}catch(e){}input.dispatchEvent(new Event('input',{bubbles:true}));printed.focus()});pill.append(caption,input,printed,clear);panel.append(pill)}
 old.placeholder='';old.setAttribute('aria-label','الاسم');try{if(localStorage.getItem(NAME)!==null)old.value=localStorage.getItem(NAME)}catch(e){}row('الاسم',old);
 const school=document.createElement('input');school.type='text';school.className='cover-school';school.setAttribute('aria-label','المدرسة');school.autocomplete='organization';
 try{school.value=localStorage.getItem(KEY)||''}catch(e){}
 school.addEventListener('input',()=>{try{localStorage.setItem(KEY,school.value)}catch(e){}});
 row('المدرسة',school);paper.append(panel);
});
}
let scheduled=false;
new MutationObserver(records=>{
 if(scheduled)return;
 if(!records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.page-block')||n.querySelector?.('.page-block')))))return;
 scheduled=true;requestAnimationFrame(()=>{scheduled=false;setup()});
}).observe(document.body,{childList:true,subtree:true});
function syncPrint(){document.querySelectorAll('.cover-pill').forEach(pill=>{const input=pill.querySelector('input');const text=pill.querySelector('.cover-print-value');if(input&&text){input.value=text.textContent||'';try{localStorage.setItem(input.classList.contains('cover-name')?NAME:KEY,input.value)}catch(e){}}})}
window.addEventListener('beforeprint',syncPrint);
document.addEventListener('click',e=>{if(e.target.closest('button')?.textContent?.includes('حفظ'))syncPrint()},true);
document.getElementById('print')?.addEventListener('click',syncPrint,true);
apply();setup();
})();