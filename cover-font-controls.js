(()=>{'use strict';
const style=document.createElement('style');
style.textContent=`
.paper .cover-name{width:43%!important;right:17%!important;left:auto!important;text-align:center!important;direction:rtl!important;box-sizing:border-box!important;font-size:var(--cover-font-size,18px)!important;line-height:1.35!important;max-width:43%!important;min-width:0!important;padding:0 3px!important;background:transparent!important;z-index:12!important}
#cover-font-tools{position:fixed;right:12px;bottom:16px;z-index:9999;display:flex;gap:7px;align-items:center;background:#fff;border:1px solid #bbb;border-radius:12px;padding:7px;box-shadow:0 2px 12px #0003;direction:rtl}
#cover-font-tools button{border:0;border-radius:8px;background:#102f55;color:#fff;font-size:19px;min-width:38px;height:36px}
#cover-font-tools span{font-size:12px;color:#24314a}
@media print{#cover-font-tools{display:none!important}}
`;
document.head.append(style);
let size=18;try{size=Math.max(12,Math.min(32,Number(localStorage.getItem('male-cover-font-size')||18)))}catch(e){}
const bar=document.createElement('div');bar.id='cover-font-tools';bar.innerHTML='<span>حجم اسم الغلاف</span><button type="button" id="cover-font-plus" aria-label="تكبير خط الاسم">+</button><button type="button" id="cover-font-minus" aria-label="تصغير خط الاسم">−</button>';document.body.append(bar);
function apply(){document.documentElement.style.setProperty('--cover-font-size',size+'px')}
bar.querySelector('#cover-font-plus').onclick=()=>{size=Math.min(32,size+2);apply();try{localStorage.setItem('male-cover-font-size',size)}catch(e){}};
bar.querySelector('#cover-font-minus').onclick=()=>{size=Math.max(12,size-2);apply();try{localStorage.setItem('male-cover-font-size',size)}catch(e){}};
apply();
})();