(() => {
'use strict';
if(window.__jarvisOps)return;window.__jarvisOps=true;
const d=document,api=window.jarvisDesktop,$=id=>d.getElementById(id);
const left=$('jarvisLeft'),center=$('jarvisCenter');if(!left||!center)return;
const style=d.createElement('style');style.textContent="#jarvisOpsQuick{display:flex;gap:5px;flex-wrap:wrap;justify-content:center;margin:2px 0 6px}#jarvisOpsQuick button{background:#0a3048;border:1px solid #27738d;color:#b7e9fb;border-radius:7px;padding:6px 9px;font:11px Consolas;cursor:pointer}#jarvisPalette{position:fixed;inset:0;z-index:100000;background:#000c;display:none;place-items:start center;padding:9vh 16px}#jarvisPalette.visible{display:grid}#jarvisPaletteBox{width:min(620px,96vw);max-height:75vh;border:1px solid #4db9d8;border-radius:16px;background:#041728;box-shadow:0 25px 65px #000b;overflow:hidden}#jarvisPaletteTop{display:flex;gap:8px;padding:14px;border-bottom:1px solid #20546d}#jarvisPaletteTop input{flex:1;min-width:0;background:transparent;color:#ccefff;border:0;outline:0;font-size:15px}#jarvisPaletteTop button{background:#113f58;color:#b9eaff;border:1px solid #4a839b;border-radius:7px}.jarvis-palette-list{max-height:54vh;overflow:auto;padding:10px}.jarvis-palette-list button{display:flex;justify-content:space-between;gap:8px;width:100%;background:#09263b;border:1px solid #26506a;border-radius:8px;color:#c8ecff;padding:11px;margin-bottom:5px;cursor:pointer}.jarvis-palette-list button:hover{border-color:#55d3ef}.jarvis-palette-list small{color:#83aeca}#jarvisNotesToggle{width:100%;background:#08293f;border:1px solid #2a7592;color:#a4e7fc;padding:8px;border-radius:8px;text-align:left;cursor:pointer;font-size:12px}#jarvisNotesPanel{display:none;padding:8px 0}#jarvisNotesPanel.visible{display:block}#jarvisNotesEntry{width:100%;resize:none;min-height:55px;max-height:90px;background:#061b2d;border:1px solid #39708a;border-radius:7px;color:#cdeeff;padding:7px;font-size:12px}#jarvisNotesSave{background:#0c4c6d;border:1px solid #44a1c0;border-radius:6px;color:#d7f8ff;padding:7px 9px;margin:5px 0;cursor:pointer}#jarvisNotesList{max-height:clamp(50px,13vh,110px);overflow:auto;font-size:11px}.jarvis-note{margin:5px 0;padding:7px;border:1px solid #1f4b65;border-radius:7px;color:#a9d9eb;white-space:pre-wrap;overflow-wrap:anywhere}.jarvis-note button{float:right;background:transparent;color:#92bed1;border:0;cursor:pointer}#jarvisCommandStatus{color:#84e1ff;font:11px Consolas;text-align:center;margin-bottom:4px}";d.head.append(style);
const make=(tag,cls,text)=>{const e=d.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const info=make('div','','Командный режим активен');info.id='jarvisCommandStatus';
center.insertBefore(info,$('jarvisQuickPrompts'));
const bar=make('div');bar.id='jarvisOpsQuick';center.insertBefore(bar,info);
const palette=make('div');palette.id='jarvisPalette';palette.setAttribute('role','dialog');palette.setAttribute('aria-label','Быстрые команды');
const box=make('div');box.id='jarvisPaletteBox',top=make('div');top.id='jarvisPaletteTop';
const search=make('input');search.placeholder='Поиск команд…';const close=make('button','','ESC');
top.append(search,close);const list=make('div','jarvis-palette-list');box.append(top,list);palette.append(box);d.body.append(palette);
const commands=[
['calculator','Калькулятор','Программа',()=>api?.launch?.('calculator')],
['notepad','Блокнот','Программа',()=>api?.launch?.('notepad')],
['explorer','Проводник','Программа',()=>api?.launch?.('explorer')],
['downloads','Загрузки','Папка Windows',()=>api?.openPlace?.('downloads')],
['documents','Документы','Папка Windows',()=>api?.openPlace?.('documents')],
['desktop','Рабочий стол','Папка Windows',()=>api?.openPlace?.('desktop')],
['siteVector','Вектор РФ','Сайт компании',()=>api?.openSite?.('vector')],
['siteJarvis','Джарвис в браузере','Сайт',()=>api?.openSite?.('jarvis')],
['updates','Проверить обновления','Программа',()=>api?.checkUpdates?.()],
['notes','Мои заметки','Локально на ПК',()=>{notesPanel.classList.add('visible');notesEntry.focus()}]
];
async function run(item){hide();try{const r=await item[3]();info.textContent=r?.ok?'Выполнено: '+(r.label||item[1]):r?.cancelled?'Команда отменена':r?.error?'Ошибка: '+r.error:'Команда: '+item[1]}catch(e){info.textContent='Ошибка: '+String(e.message||e).slice(0,100)}}
function show(){palette.classList.add('visible');search.value='';render();search.focus()}
function hide(){palette.classList.remove('visible')}
function render(){list.replaceChildren();const query=search.value.toLocaleLowerCase('ru');for(const item of commands.filter(x=>(x[1]+' '+x[2]).toLocaleLowerCase('ru').includes(query))){const b=make('button');b.append(make('span','',item[1]),make('small','',item[2]));b.onclick=()=>run(item);list.append(b)}}
for(const [text,fn] of [['⌘ Команды',show],['⇣ Загрузки',()=>run(commands[3])],['▤ Заметки',()=>run(commands[9])]]){const b=make('button','',text);b.onclick=fn;bar.append(b)}
search.oninput=render;close.onclick=hide;palette.onclick=e=>{if(e.target===palette)hide()};
d.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();show()}else if(e.key==='Escape')hide()});
const section=make('section','jarvis-section');left.insertBefore(section,left.lastElementChild);
const toggle=make('button','','▤ РАБОЧИЕ ЗАМЕТКИ');toggle.id='jarvisNotesToggle';section.append(toggle);
const notesPanel=make('div');notesPanel.id='jarvisNotesPanel';const notesEntry=make('textarea');notesEntry.id='jarvisNotesEntry';notesEntry.maxLength=1500;notesEntry.placeholder='Твоя идея или заметка…';
const save=make('button','','Сохранить');save.id='jarvisNotesSave';const notesList=make('div');notesList.id='jarvisNotesList';notesPanel.append(notesEntry,save,notesList);section.append(notesPanel);
toggle.onclick=()=>notesPanel.classList.toggle('visible');
let notes=[];try{const v=JSON.parse(localStorage.getItem('jarvis-windows-notes-v1')||'[]');if(Array.isArray(v))notes=v.filter(x=>typeof x==='string').slice(0,30)}catch{}
function store(){try{localStorage.setItem('jarvis-windows-notes-v1',JSON.stringify(notes))}catch{}draw()}
function draw(){notesList.replaceChildren();notes.forEach((note,i)=>{const row=make('div','jarvis-note'),del=make('button','','×');del.title='Удалить заметку';del.onclick=()=>{notes.splice(i,1);store()};row.append(del,make('span','',note));notesList.append(row)})}
function addNote(value){const v=String(value||'').trim().slice(0,1500);if(!v)return;notes.unshift(v);notes=notes.slice(0,30);store();notesPanel.classList.add('visible');info.textContent='Заметка сохранена на этом компьютере'}
save.onclick=()=>{addNote(notesEntry.value);notesEntry.value=''};draw();
function match(value){
const s=String(value||'').trim().replace(/^джарвис[\s,.:!—-]*/i,'').toLocaleLowerCase('ru');
if(/^(?:открой|покажи)\s+(?:папку\s+)?загрузки/.test(s))return {key:'downloads'};
if(/^(?:открой|покажи)\s+(?:папку\s+)?документы/.test(s))return {key:'documents'};
if(/^(?:открой|покажи)\s+рабочий стол/.test(s))return {key:'desktop'};
if(/^(?:открой|покажи)\s+(?:сайт\s+)?вектор\s*рф/.test(s))return {key:'siteVector'};
if(/^(?:покажи|открой)\s+(?:список\s+)?команд/.test(s))return {key:'palette'};
const m=s.match(/^(?:запиши|сохрани|добавь)\s+(?:заметку|в заметки)(?:\s*[:—-]\s*|\s+)(.+)/);if(m)return {note:m[1]};
return null;
}
function intercept(event){const input=$('input'),action=match(input?.value);if(!action)return;event.preventDefault();event.stopImmediatePropagation();input.value='';if(action.note){addNote(action.note);return}if(action.key==='palette')show();else {const item=commands.find(x=>x[0]===action.key);if(item)run(item)}}
d.addEventListener('click',e=>{if(e.target?.closest?.('#send'))intercept(e)},true);
d.addEventListener('keydown',e=>{if(e.target?.id==='input'&&e.key==='Enter')intercept(e)},true);
})();