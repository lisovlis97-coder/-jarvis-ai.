(() => {
'use strict';
if(window.__jarvisHUDv2)return;window.__jarvisHUDv2=true;
const $=id=>document.getElementById(id),api=window.jarvisDesktop,main=document.querySelector('main');
if(!main||!$('stage'))return;
document.title='J.A.R.V.I.S. • COMMAND CENTER';document.documentElement.classList.add('jarvis-hud-v2');
const css='.jarvis-hud-v2 main{max-width:1700px;width:100%;padding:15px 22px 25px!important}body{background:radial-gradient(ellipse at 45% 24%,#0b3248,#020c19 76%)!important}.jarvis-hud-v2 main>.top{padding:0 4px 9px;border-bottom:1px solid #2f728966}.jarvis-hud-v2 main>.brand{font-size:30px;margin:9px 0 0;letter-spacing:12px}.jarvis-hud-v2 main>.subtitle{margin-bottom:4px}#desktopHead{display:none!important}.jarvis-hud-v2 #desktopVoiceReport{margin:0 auto 8px;font-size:11px;max-width:1080px}#jarvisFrame{display:grid;grid-template-columns:minmax(215px,265px) minmax(405px,1fr) minmax(245px,310px);gap:14px;align-items:stretch;margin:7px auto 0;max-width:1580px;min-height:610px}.jarvis-panel{border:1px solid #24556b;border-radius:13px;background:linear-gradient(155deg,#061e30ef,#020c19f8);box-shadow:inset 0 1px 0 #39a7cf20,0 10px 35px #0006;min-width:0;overflow:hidden}.jarvis-panel-title{font:11px Consolas,monospace;letter-spacing:2px;color:#91e4fc;padding:13px 14px;border-bottom:1px solid #1e4a61;background:linear-gradient(90deg,#0a38543a,transparent)}#jarvisLeft{display:flex;flex-direction:column}.jarvis-info-row{padding:11px 14px;border-bottom:1px solid #1b3b50;display:flex;align-items:baseline;justify-content:space-between;gap:9px;font:12px Consolas,monospace}.jarvis-info-row span{color:#759fb7;font-size:10px;letter-spacing:1px}.jarvis-info-row strong{font-weight:500;color:#9ceaff;text-align:right}.jarvis-section{padding:12px 13px 8px;border-bottom:1px solid #1b3b50}.jarvis-section-heading{font:10px Consolas,monospace;letter-spacing:2px;color:#75abbd;margin-bottom:9px}.jarvis-shortcut{width:100%;margin:0 0 8px;padding:10px 12px;text-align:left;background:#082941cf;border:1px solid #286d85;border-radius:8px;color:#c5efff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:9px}.jarvis-shortcut:hover{border-color:#5cd7ff;background:#0c4059}.jarvis-shortcut span{color:#88d8ec}#jarvisCenter{min-width:0;padding:0 16px 14px;display:flex;flex-direction:column;background:radial-gradient(circle at 50% 23%,#0b425547,#041522bb 61%)}#jarvisCenter .corewrap{width:100%;height:305px;margin:0 auto 4px;overflow:hidden}#jarvisCenter .core{width:220px;height:220px}#jarvisCenter .core:before{width:180px;height:180px}#jarvisCenter .core:after{width:125px;height:125px}#jarvisCenter .corewrap:before{width:263px;height:263px}#jarvisCenter .corewrap:after{width:290px;height:290px}#jarvisCenter .hudhud{top:119px}#jarvisCenter .status{margin:0 0 5px}#jarvisCenter .soundBars{margin:0 auto 6px}#jarvisCenter .answer{max-width:none;width:100%;min-height:72px;font-size:14px;margin:0 auto 8px;padding:12px 15px}#jarvisCenter .controls,#jarvisCenter .sendline{max-width:none;width:100%;margin:6px auto}#jarvisCenter .btn{padding:12px 13px}#jarvisCenter #desktopNotice{max-width:none;width:100%;margin:0 auto 8px;min-height:16px}#jarvisCenter input#input{padding:13px;font-size:14px}#jarvisRight{display:flex;flex-direction:column;max-height:790px;overflow:auto}#jarvisRight .voiceCard{margin:9px 10px;padding:10px;max-width:none}#jarvisRight .settings{margin:8px 10px;gap:5px}#jarvisRight #mode{font-size:11px;color:#8abbd5}#jarvisRight .memoryPanel{margin:9px 10px;padding:10px;font-size:12px;max-width:none}#jarvisRight #log{max-height:210px;margin:9px 10px}#jarvisRight footer{margin:7px 10px 14px;font-size:10px}.jarvis-panel-footer{margin-top:auto;padding:10px 12px;border-top:1px solid #20506a;color:#56899d;font:10px Consolas,monospace;letter-spacing:1px}.jarvis-task{border-bottom:1px solid #1b3b50;padding:7px 0;display:flex;align-items:center;gap:7px;color:#ccefff;font-size:12px}.jarvis-task input[type=checkbox]{width:16px;height:16px;accent-color:#36d1ff;flex:0 0 auto}.jarvis-task.completed span{text-decoration:line-through;opacity:.6}.jarvis-task span{flex:1;overflow-wrap:anywhere}.jarvis-task button{background:none;border:0;color:#7bafc6;cursor:pointer;font-size:15px}.jarvis-tasks-empty{font-size:11px;color:#6e9db7;padding:5px 0 9px}.jarvis-task-form{display:flex;gap:4px}.jarvis-task-form input{font-size:12px;padding:9px 7px;min-width:0;flex:1}.jarvis-task-form button{background:#0c3c56;border:1px solid #26718b;color:#bcefff;border-radius:7px;cursor:pointer}#jarvisActionStatus{margin-top:6px;font:11px/1.5 Consolas,monospace;color:#80c9e5;min-height:26px}#jarvisActionStatus.warn{color:#ffcb79}#jarvisQuickPrompts{display:flex;gap:5px;flex-wrap:wrap;padding:8px 0 2px}#jarvisQuickPrompts button{background:#081f32;border:1px solid #275872;color:#8bc3d8;border-radius:20px;font:10px Consolas,monospace;padding:7px 9px;cursor:pointer}@media(max-width:1150px){#jarvisFrame{grid-template-columns:210px minmax(340px,1fr);gap:10px}#jarvisRight{grid-column:1/-1;max-height:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-content:start}#jarvisRight>.jarvis-panel-title{grid-column:1/-1}#jarvisRight #log{grid-column:2}}@media(max-width:780px){.jarvis-hud-v2 main{padding:9px!important}#jarvisFrame{display:flex;flex-direction:column;min-height:0}#jarvisLeft{order:2}#jarvisCenter{order:1;padding:0 10px 12px}#jarvisRight{order:3;display:flex}#jarvisCenter .corewrap{height:275px}#jarvisCenter .core{width:190px;height:190px}#jarvisCenter .core:before{width:150px;height:150px}#jarvisCenter .core:after{width:104px;height:104px}#jarvisCenter .corewrap:before{width:233px;height:233px}#jarvisCenter .corewrap:after{width:260px;height:260px}#jarvisCenter .hudhud{top:109px}}';
const style=document.createElement('style');style.id='jarvis-hud-v2-style';style.textContent=css;document.head.append(style);
const make=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt)e.textContent=txt;return e};
const frame=make('section');frame.id='jarvisFrame';
const left=make('aside','jarvis-panel');left.id='jarvisLeft';const center=make('section','jarvis-panel');center.id='jarvisCenter';const right=make('aside','jarvis-panel');right.id='jarvisRight';
frame.append(left,center,right);(main.querySelector('#desktopVoiceReport')||main.querySelector('.subtitle'))?.after(frame);
left.append(make('div','jarvis-panel-title','◈ SYSTEM TELEMETRY'));
const fields=[['УСТРОЙСТВО','hostname'],['ЯДРА CPU','cpus'],['RAM','ramUsedPct'],['АПТАЙМ','uptimeMinutes'],['ВЕРСИЯ','version']];
for(const [caption,key] of fields){const row=make('div','jarvis-info-row'),a=make('span','',caption),b=make('strong','','—');b.dataset.stat=key;row.append(a,b);left.append(row)}
const actionSection=make('section','jarvis-section');left.append(actionSection);actionSection.append(make('div','jarvis-section-heading','БЫСТРЫЕ ДЕЙСТВИЯ · WINDOWS'));
for(const [key,label] of [['calculator','▣ Калькулятор'],['notepad','▤ Блокнот'],['explorer','▥ Проводник']]){const b=make('button','jarvis-shortcut');b.type='button';b.append(make('span','',label),make('span','','↗'));b.onclick=()=>runAction(key);actionSection.append(b)}
const updateBtn=make('button','jarvis-shortcut','↻ Проверить обновления');updateBtn.onclick=()=>api?.checkUpdates?.();actionSection.append(updateBtn);
const actionStatus=make('div','','Системные действия требуют разрешения.');actionStatus.id='jarvisActionStatus';actionSection.append(actionStatus);
const tasksSection=make('section','jarvis-section');tasksSection.style.flex='1';left.append(tasksSection);
tasksSection.append(make('div','jarvis-section-heading','◈ ЗАДАЧИ / ЛОКАЛЬНЫЙ СПИСОК'));
const taskItems=make('div');taskItems.id='jarvisTaskItems';tasksSection.append(taskItems);
const taskForm=make('form','jarvis-task-form'),taskInput=make('input');taskInput.type='text';taskInput.placeholder='Добавить задачу…';taskInput.maxLength=120;const taskSubmit=make('button','','+');taskSubmit.type='submit';taskForm.append(taskInput,taskSubmit);tasksSection.append(taskForm);
left.append(make('div','jarvis-panel-footer','OPERATIONS / AUTHORIZATION REQUIRED'));
center.append(make('div','jarvis-panel-title','◈ CENTRAL INTELLIGENCE CORE'));
for(const id of ['stage','status','bars','answer','desktopNotice']){const el=$(id);if(el)center.append(el)}
const quick=make('div');quick.id='jarvisQuickPrompts';center.append(quick);
for(const [label,prompt] of [['Состояние систем','Джарвис, расскажи, что ты сейчас умеешь.'],['План на день','Помоги составить план на сегодня.'],['Идеи для бизнеса','Предложи три идеи развития моего бизнеса.']]){const b=make('button','',label);b.type='button';b.onclick=()=>{const i=$('input');if(i){i.value=prompt;i.focus()}};quick.append(b)}
for(const selector of ['.controls','.sendline']){const el=main.querySelector(selector);if(el)center.append(el)}
center.append(make('div','jarvis-panel-footer','VOICE · AI · CONTROL // ALL SYSTEMS MONITORED'));
right.append(make('div','jarvis-panel-title','◈ MEMORY / ACTIVITY / AUDIO'));
for(const selector of ['.voiceCard','.settings','#searchLink','#mode','.memoryPanel','#log','footer']){const el=main.querySelector(selector);if(el)right.append(el)}
function statusMessage(msg,warn=false){actionStatus.textContent=msg;actionStatus.classList.toggle('warn',warn)}
async function runAction(action){if(!api?.launch){statusMessage('Управление Windows недоступно в этой сборке.',true);return}statusMessage('Ожидаю подтверждения в Windows…');try{const r=await api.launch(action);if(r?.ok)statusMessage('Запущено: '+r.label);else if(r?.cancelled)statusMessage('Команда отменена.');else statusMessage(r?.error||'Не удалось выполнить команду.',true)}catch(e){statusMessage('Ошибка: '+String(e.message||e).slice(0,130),true)}}
async function updateStats(){if(!api?.status)return;try{const d=await api.status();const fmt={hostname:d.hostname,cpus:String(d.cpus),ramUsedPct:d.ramUsedPct+'% / '+d.ramTotalGb+' GB',uptimeMinutes:Math.floor(d.uptimeMinutes/60)+' ч '+d.uptimeMinutes%60+' мин',version:d.version};for(const k of Object.keys(fmt)){const el=left.querySelector('[data-stat="'+k+'"]');if(el)el.textContent=fmt[k]}}catch(e){statusMessage('Данные ПК пока недоступны.',true)}}
updateStats();setInterval(updateStats,60000);
let tasks=[];try{const raw=JSON.parse(localStorage.getItem('jarvis-desktop-tasks-v1')||'[]');if(Array.isArray(raw))tasks=raw.filter(x=>x&&typeof x.text==='string').slice(-40)}catch{}
function saveTasks(){try{localStorage.setItem('jarvis-desktop-tasks-v1',JSON.stringify(tasks))}catch{}renderTasks()}
function renderTasks(){taskItems.replaceChildren();if(!tasks.length){taskItems.append(make('div','jarvis-tasks-empty','Задач пока нет.'));return}tasks.forEach((task,index)=>{const row=make('div','jarvis-task'+(task.done?' completed':'')),cb=make('input'),tx=make('span','',task.text),del=make('button','','×');cb.type='checkbox';cb.checked=!!task.done;cb.onchange=()=>{task.done=cb.checked;saveTasks()};del.type='button';del.title='Удалить';del.onclick=()=>{tasks.splice(index,1);saveTasks()};row.append(cb,tx,del);taskItems.append(row)})}
function addTask(value){const text=String(value||'').trim().slice(0,120);if(!text)return false;tasks.push({text,done:false});tasks=tasks.slice(-40);saveTasks();return true}
taskForm.addEventListener('submit',e=>{e.preventDefault();if(addTask(taskInput.value))taskInput.value=''});renderTasks();
function commandMatch(value){const s=String(value||'').trim().replace(/^джарвис[\s,.:!—-]*/i,'').toLowerCase();if(/^(?:открой|запусти|включи)\s+(?:мне\s+)?калькулятор/.test(s))return {kind:'launch',key:'calculator'};if(/^(?:открой|запусти)\s+(?:мне\s+)?блокнот/.test(s))return {kind:'launch',key:'notepad'};if(/^(?:открой|запусти)\s+(?:мне\s+)?проводник/.test(s))return {kind:'launch',key:'explorer'};const task=s.match(/^(?:добавь|запиши|создай)\s+(?:мне\s+)?(?:задачу|в задачи)\s*[:—-]?\s*(.+)/);if(task)return {kind:'task',text:task[1]};if(/^(?:покажи|открой)\s+(?:мои\s+)?задачи/.test(s))return {kind:'showTasks'};if(/^(?:проверь|проверить)\s+обновлен/.test(s))return {kind:'update'};return null}
async function intercept(e){const input=$('input');if(!input)return;const cmd=commandMatch(input.value);if(!cmd)return;e.preventDefault();e.stopImmediatePropagation();input.value='';if(cmd.kind==='launch')await runAction(cmd.key);if(cmd.kind==='task'){addTask(cmd.text);statusMessage('Задача сохранена на этом компьютере.')}if(cmd.kind==='showTasks')statusMessage('Задач: '+tasks.length+'. Они отображаются слева.');if(cmd.kind==='update'){api?.checkUpdates?.();statusMessage('Проверяю обновления…')}}
$('send')?.addEventListener('click',intercept,true);$('input')?.addEventListener('keydown',e=>{if(e.key==='Enter')intercept(e)},true);

/* Desktop cockpit: no document-level vertical scrolling. Individual history/tasks can scroll internally. */
const cockpitCSS=String.raw`
.jarvis-hud-v2,.jarvis-hud-v2 body{width:100%;height:100%;max-height:100%;overflow:hidden!important}
.jarvis-hud-v2 main{height:calc(100dvh - 0px);max-height:100dvh;overflow:hidden!important;display:flex;flex-direction:column;padding:7px 13px 10px!important}
.jarvis-hud-v2 main>.top{flex:0 0 30px;padding:0 8px 6px!important}
.jarvis-hud-v2 main>.brand{flex:0 0 auto;font-size:22px!important;margin:3px 0 0!important;line-height:1.18;letter-spacing:9px}
.jarvis-hud-v2 main>.subtitle{flex:0 0 auto;font-size:9px;margin:0!important;line-height:1.35}
.jarvis-hud-v2 main>#desktopVoiceReport{display:none!important}
#jarvisFrame{min-height:0!important;height:auto!important;flex:1 1 auto;margin:6px 0 0!important;gap:10px!important;grid-template-columns:minmax(180px,230px) minmax(370px,1fr) minmax(210px,280px)!important}
.jarvis-panel{min-height:0!important;max-height:100%;overflow:hidden}
.jarvis-panel-title{padding:9px 12px!important;font-size:10px!important;flex:0 0 auto}
#jarvisCenter{padding:0 12px 9px!important;min-height:0;overflow:hidden;display:flex;flex-direction:column}
#jarvisCenter .corewrap{height:clamp(155px,28vh,250px)!important;min-height:0!important;flex:0 1 auto;overflow:hidden!important}
#jarvisCenter .core{width:clamp(142px,20vh,185px)!important;height:clamp(142px,20vh,185px)!important}
#jarvisCenter .core:before{width:75%!important;height:75%!important}
#jarvisCenter .core:after{width:54%!important;height:54%!important}
#jarvisCenter .corewrap:before{width:clamp(167px,23vh,210px)!important;height:clamp(167px,23vh,210px)!important}
#jarvisCenter .corewrap:after{width:clamp(181px,25vh,226px)!important;height:clamp(181px,25vh,226px)!important}
#jarvisCenter .hudhud{top:calc(50% - 25px)!important;font-size:9px!important}
#jarvisCenter .status{font-size:11px!important;line-height:1.2;margin:2px 0!important;flex:0 0 auto}
#jarvisCenter .soundBars{height:21px!important;margin:0 auto 3px!important;flex:0 0 auto}
#jarvisCenter .answer{min-height:48px!important;max-height:125px;overflow:auto;font-size:13px!important;line-height:1.42;padding:8px 10px!important;margin:0 0 5px!important;flex:1 1 auto}
#jarvisCenter #desktopNotice{font-size:10px!important;line-height:1.25;margin:0 0 3px!important;min-height:15px!important}
#jarvisCenter .controls{margin:4px 0!important;flex:0 0 auto}
#jarvisCenter .controls .btn{font-size:12px!important;padding:10px 8px!important;white-space:nowrap}
#jarvisCenter .sendline{margin:4px 0!important;flex:0 0 auto}
#jarvisCenter .sendline input{padding:10px!important;font-size:13px!important}
#jarvisCenter .sendline .btn{padding:8px 12px!important}
#jarvisQuickPrompts{padding:2px 0!important;flex:0 0 auto}
#jarvisQuickPrompts button{padding:4px 8px!important;font-size:9px!important}
#jarvisCenter .jarvis-panel-footer{font-size:9px;padding:5px!important;flex:0 0 auto}
#jarvisLeft .jarvis-info-row{padding:7px 10px!important;font-size:11px!important}
#jarvisLeft .jarvis-section{padding:8px 10px!important}
#jarvisLeft .jarvis-shortcut{padding:7px 9px!important;margin-bottom:5px!important;font-size:11px!important}
#jarvisLeft .jarvis-panel-footer{padding:7px;font-size:9px}
#jarvisTaskItems{max-height:clamp(70px,18vh,175px);overflow:auto}
#jarvisRight{min-height:0;max-height:none!important;overflow:hidden!important;display:flex!important;flex-direction:column}
#jarvisRight .voiceCard{margin:5px 8px!important;padding:7px!important}
#jarvisRight .voiceHeader{font-size:9px!important}
#jarvisRight .voiceNote{display:none}
#jarvisRight .voiceRow{gap:5px}
#jarvisRight .voiceRow label{font-size:10px}
#jarvisRight .voiceRow select{min-width:0!important;font-size:10px;padding:4px!important}
#jarvisRight .voiceRow .btn{padding:6px;font-size:10px}
#jarvisRight .settings{margin:5px 8px!important;font-size:10px}
#jarvisRight .settings .btn{padding:6px!important;font-size:10px}
#jarvisRight .memoryPanel{margin:5px 8px!important;padding:8px!important;max-height:clamp(100px,25vh,210px);overflow:auto}
#jarvisRight .memoryHelp{font-size:9px!important}
#jarvisRight #log{flex:1 1 0;min-height:42px;max-height:none!important;margin:5px 8px!important;padding:7px;overflow:auto}
#jarvisRight footer{display:none}
@media(max-width:1050px){
#jarvisFrame{grid-template-columns:minmax(155px,190px) minmax(310px,1fr) minmax(185px,220px)!important;gap:7px!important}
#jarvisRight .voiceCard .voiceRow{max-height:100px;overflow:auto}
}
@media(max-width:760px){
.jarvis-hud-v2,.jarvis-hud-v2 body{overflow:auto!important;height:auto;max-height:none}
.jarvis-hud-v2 main{height:auto;max-height:none;overflow:visible!important}
#jarvisFrame{display:flex!important;flex-direction:column;height:auto!important;min-height:0}
.jarvis-panel{max-height:none}
#jarvisCenter{min-height:420px}
#jarvisRight{min-height:260px;max-height:500px!important}
}
`;
const cockpitStyle=document.createElement('style');cockpitStyle.id='jarvis-cockpit-fit';cockpitStyle.textContent=cockpitCSS;document.head.append(cockpitStyle);

})();