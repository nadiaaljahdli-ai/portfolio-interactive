(()=>{'use strict';
const css=document.createElement('style');
css.textContent=`
.paper{position:relative!important}
.paper .cover-name{position:absolute!important;top:var(--cover-name-top,76%)!important;left:18%!important;right:auto!important;width:46%!important;max-width:46%!important;height:3.2%!important;min-height:18px!important;margin:0!important;padding:0 2px!important;border:0!important;outline-offset:1px!important;background:transparent!important;box-shadow:none!important;text-align:center!important;direction:rtl!important;color:#10233e!important;font-size:var(--cover-font-size,16px)!important;line-height:1.1!important;z-index:4!important}
.paper .cover-name::placeholder{color:#506078}
.paper .cover-school{position:absolute!important;top:var(--cover-school-top,79.5%)!important;left:18%!important;width:46%!important;height:3%!important;min-height:16px!important;margin:0!important;padding:0 2px!important;border:0!important;background:transparent!important;box-shadow:none!important;text-align:center!important;direction:rtl!important;color:#10233e!important;font-size:var(--school-font-size,13px)!important;line-height:1.1!important;z-index:4!important;box-sizing:border-box!important}
#cover-font-tools{position:fixed;right:12px;bottom:16px;z-index:9999;display:flex;gap:7px;align-items:center;background:#fff;border:1px solid #bbb;border-radius:12px;padding:7px;box-shadow:0 2px 12px #0003;direction:rtl}
#cover-font-tools button{border:0;border-radius:8px;background:#102f55;color:#fff;font-size:19px;min-width:38px;height:36px}
#cover-font-tools span{font-size:12px;color:#24314a}
@media print{#cover-font-tools{display:none!important}.paper .cover-name,.paper .cover-school{outline:none!important}}
`;document.head.append(css);
let size=16;try{size=Math.max(10,Math.min(30,Number(localStorage.getItem('male-cover-font-size')||16)))}catch(e){}
const bar=document.createElement('div');bar.id='cover-font-tools';bar.innerHTML='<span>حجم خط الغلاف</span><button type="button" id="cover-font-plus" aria-label="تكبير خط الغلاف">+</button><button type="button" id="cover-font-minus" aria-label="تصغير خط الغلاف">−</button>';document.body.append(bar);
function apply(){document.documentElement.style.setProperty('--cover-font-size',size+'px');document.documentElement.style.setProperty('--school-font-size',Math.max(10,size-3)+'px')}
bar.querySelector('#cover-font-plus').onclick=()=>{size=Math.min(30,size+2);apply();try{localStorage.setItem('male-cover-font-size',size)}catch(e){}};
bar.querySelector('#cover-font-minus').onclick=()=>{size=Math.max(10,size-2);apply();try{localStorage.setItem('male-cover-font-size',size)}catch(e){}};
function addSchool(){document.querySelectorAll('.page-block[data-n="1"] .paper').forEach(paper=>{if(paper.querySelector('.cover-school'))return;const input=document.createElement('input');input.type='text';input.className='cover-school';input.placeholder='اسم المدرسة';input.setAttribute('aria-label','اسم المدرسة');try{input.value=localStorage.getItem('male-cover-school')||''}catch(e){}input.addEventListener('input',()=>{try{localStorage.setItem('male-cover-school',input.value)}catch(e){}});paper.append(input)})}
let pending=false;new MutationObserver(m=>{if(pending)return;if(!m.some(x=>[...x.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.page-block')||n.querySelector?.('.page-block')))))return;pending=true;requestAnimationFrame(()=>{pending=false;addSchool()})}).observe(document.body,{childList:true,subtree:true});
addSchool();apply();
})();