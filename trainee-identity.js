/* Editable trainee identity, preserved separately from evidence. */
(()=>{'use strict';
const STORE='portfolio-trainee-identity-v1';
let data={name:'',school:'',department:'',role:'',specialty:'',year:'',qualification:'',personalPage:5};
try{data={...data,...JSON.parse(localStorage.getItem(STORE)||'{}')}}catch(e){}
const fields=[['name','الاسم'],['school','اسم المدرسة'],['department','الإدارة التعليمية'],['role','المسمى الوظيفي'],['specialty','التخصص'],['year','العام الدراسي'],['qualification','المؤهل العلمي']];
const css=document.createElement('style');
css.textContent=`
#identity-open{position:fixed;bottom:18px;left:15px;z-index:9999;border:0;border-radius:12px;background:#624b7a;color:white;padding:12px 18px;font-weight:bold;box-shadow:0 3px 12px #0005}
#identity-panel{display:none;position:fixed;inset:0;z-index:100000;background:#0009;align-items:center;justify-content:center;padding:12px}
#identity-panel .identity-inner{direction:rtl;text-align:right;background:white;color:#292332;width:min(520px,100%);max-height:90vh;overflow:auto;padding:20px;border-radius:15px}
#identity-panel label{display:block;margin:9px 0;font-size:14px}#identity-panel input,#identity-panel select{display:block;width:100%;padding:9px;border:1px solid #bcb1c9;border-radius:7px;margin-top:4px}
#identity-panel button{border:0;background:#624b7a;color:white;padding:11px 18px;border-radius:8px;margin:8px 5px 0}
.identity-text{position:absolute;z-index:10;direction:rtl;text-align:center;pointer-events:none;color:#302639;font-family:Arial,sans-serif;line-height:1.4;text-shadow:0 1px 2px #fff9;white-space:pre-wrap;overflow-wrap:anywhere}
.identity-cover{left:15%;width:70%;bottom:9%;font-size:clamp(10px,1.5vw,19px);font-weight:700}
.identity-personal{left:13%;width:74%;top:35%;font-size:clamp(10px,1.3vw,17px);background:#ffffffb8;border-radius:5px;padding:2%}
@media print{#identity-open,#identity-panel{display:none!important}.identity-text{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`;
document.head.append(css);
const open=document.createElement('button');open.id='identity-open';open.type='button';open.textContent='بياناتي';document.body.append(open);
const panel=document.createElement('div');panel.id='identity-panel';
panel.innerHTML='<div class="identity-inner"><h3>بيانات المتدرب / المتدربة</h3><p>تظهر بيانات الاسم والمدرسة على الغلاف، وتظهر البيانات المهنية في صفحة البيانات الشخصية.</p><div id="identity-fields"></div><label>رقم صفحة البيانات الشخصية<select id="identity-page"></select></label><button id="identity-save" type="button">حفظ البيانات</button><button id="identity-close" type="button">إغلاق</button></div>';
document.body.append(panel);
const holder=panel.querySelector('#identity-fields');
fields.forEach(([key,label])=>{const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.dataset.key=key;input.value=data[key]||'';l.append(input);holder.append(l)});
const sel=panel.querySelector('#identity-page');for(let i=2;i<=23;i++){const o=document.createElement('option');o.value=i;o.textContent='الصفحة '+i;sel.append(o)}sel.value=data.personalPage;
open.onclick=()=>{panel.style.display='flex'};panel.querySelector('#identity-close').onclick=()=>panel.style.display='none';
function update(){
document.querySelectorAll('.identity-text').forEach(n=>n.remove());
const roots=[document.getElementById('pages'),document.getElementById('printRoot')].filter(Boolean);
roots.forEach(root=>{const sheets=[...root.querySelectorAll('.sheet, .page-block')];if(!sheets.length)return;
function put(index,cls,txt){const sheet=sheets[index];if(!sheet)return;const page=sheet.querySelector('.page, .paper')||sheet;const n=document.createElement('div');n.className='identity-text '+cls;n.textContent=txt;page.append(n)}
if(data.name||data.school){const old=sheets[0].querySelector('.cover-name');if(old){old.value=data.name||'';old.style.display='none'}put(0,'identity-cover',[data.name,data.school].filter(Boolean).join(' — '));}
const lines=fields.map(([k,label])=>data[k]?label+' : '+data[k]:null).filter(Boolean);
if(lines.length)put(Math.max(1,Math.min(22,Number(data.personalPage||5)-1)),'identity-personal',lines.join('\n'));
});
}
panel.querySelector('#identity-save').onclick=()=>{fields.forEach(([k])=>data[k]=panel.querySelector('[data-key="'+k+'"]').value.trim());data.personalPage=Number(sel.value);try{localStorage.setItem(STORE,JSON.stringify(data))}catch(e){alert('تعذر حفظ البيانات: مساحة التخزين ممتلئة');return}update();panel.style.display='none'};
let pending=false;const observer=new MutationObserver(mutations=>{if(pending)return;if(!mutations.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.sheet, .page-block')||n.querySelector?.('.sheet, .page-block')))))return;pending=true;requestAnimationFrame(()=>{pending=false;update()})});
observer.observe(document.body,{childList:true,subtree:true});update();window.addEventListener('beforeprint',update);
})();