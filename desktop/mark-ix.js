(() => {
'use strict';
if(window.__jarvisMarkIX)return;
const d=document, $=id=>d.getElementById(id);
const frame=$('jarvisFrame'),center=$('jarvisCenter'),left=$('jarvisLeft'),right=$('jarvisRight');
if(!frame||!center||!left||!right)return;
window.__jarvisMarkIX=true;
d.documentElement.classList.add('mark-ix');
d.title='J.A.R.V.I.S. • MARK IX';
const make=(tag,cls,value)=>{const el=d.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=value;return el};
const banner=d.querySelector('main>.top>span:first-child');if(banner)banner.textContent='◈ STARK TECH / MARK IX • WINDOWS COMMAND CENTER';
const brand=d.querySelector('main>.brand');if(brand)brand.textContent='J.A.R.V.I.S.';
const sub=d.querySelector('main>.subtitle');if(sub)sub.textContent='MARK IX · PERSONAL INTELLIGENCE SYSTEM';
const centreTitle=center.querySelector('.jarvis-panel-title');if(centreTitle)centreTitle.textContent='◈ ARC REACTOR // NEURAL CORE';
const leftTitle=left.querySelector('.jarvis-panel-title');if(leftTitle)leftTitle.textContent='◈ SYSTEMS // TELEMETRY';
const rightTitle=right.querySelector('.jarvis-panel-title');if(rightTitle)rightTitle.textContent='◈ MEMORY // MISSION LOG';
const stage=$('stage');
if(stage){
 stage.append(make('div','arc-orbit'),make('div','arc-reticle'),make('div','arc-caption','ARC / 09 · INTELLIGENCE CORE'));
}
const dock=$('jarvisOpsQuick');
if(dock){const b=dock.querySelectorAll('button');['⌘ КОМАНДЫ','⇣ ЗАГРУЗКИ','▤ ЗАМЕТКИ'].forEach((label,i)=>{if(b[i])b[i].textContent=label})}
const indicator=(label,value)=>{
 const row=make('div','arc-signal');row.append(make('span','',label),make('b','',value));left.append(row);return row.lastElementChild;
};
const voiceSignal=indicator('VOICE LINK','STANDBY');
const aiSignal=indicator('NEURAL LINK','ONLINE');
const cpuSignal=indicator('PROCESSOR LOAD','--%');
const batterySignal=indicator('POWER SOURCE','—');
const clockSignal=indicator('LOCAL CLOCK','--:--');
const meterLabel=make('div','arc-meter-label','MEMORY UTILIZATION');
const meter=make('div','arc-meter'),fill=make('i');meter.append(fill);
const anchor=left.querySelector('.jarvis-section');
if(anchor){left.insertBefore(meterLabel,anchor);left.insertBefore(meter,anchor)}
const api=window.jarvisDesktop;
async function status(){
 try{
  const s=await api?.status?.();
  if(s){if(Number.isFinite(s.ramUsedPct))fill.style.width=Math.min(100,Math.max(1,s.ramUsedPct))+'%';if(Number.isFinite(s.cpuUsedPct))cpuSignal.textContent=s.cpuUsedPct+'%';batterySignal.textContent=s.onBattery?'BATTERY':'AC POWER';}
 }catch{}
}
status();setInterval(status,60000);
function pulse(){
 const st=$('status')?.textContent||'';
 voiceSignal.textContent=/ГОВОР|ВОСПРОИЗВ|ОЗВУЧ/i.test(st)?'SPEAKING':/СЛУША|ЗАПИС/i.test(st)?'LISTENING':'STANDBY';
 aiSignal.textContent=$('aiStatus')?.textContent||'ONLINE';
 clockSignal.textContent=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
pulse();setInterval(pulse,1000);
const settings=right.querySelector('.voiceCard');
if(settings){
 const toggle=make('button','arc-settings-toggle','◈ НАСТРОЙКИ ГОЛОСА   +');
 settings.before(toggle);settings.style.display='none';
 toggle.onclick=()=>{const open=settings.style.display==='none';settings.style.display=open?'block':'none';toggle.textContent=open?'◈ НАСТРОЙКИ ГОЛОСА   −':'◈ НАСТРОЙКИ ГОЛОСА   +'};
}
const memory=right.querySelector('.memoryPanel');
if(memory){const heading=memory.querySelector('.memoryTitle span');if(heading)heading.textContent='◈ LONG-TERM MEMORY'}
const log=right.querySelector('#log');if(log)log.setAttribute('aria-label','История диалога');
center.append(make('div','arc-footer','◈ GROQ ONLINE  /  WHISPER  /  WINDOWS OPERATIONS ◈'));
const diagnostic=$('diagnostics');if(diagnostic)diagnostic.textContent='Windows Desktop • Локальные заметки и история сохраняются на этом компьютере';
const voiceNote=d.querySelector('.voiceNote');if(voiceNote)voiceNote.textContent='Дополнительная озвучка и доступные голоса Windows.';
})();