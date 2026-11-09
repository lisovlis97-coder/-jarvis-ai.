(() => {
'use strict';
if(window.__jarvisDesktopReady) return;
window.__jarvisDesktopReady=true;
document.title='J.A.R.V.I.S. | DESKTOP COMMAND CENTER';
document.documentElement.classList.add('jarvis-desktop');
const css=`
:root{color-scheme:dark}
body{background:radial-gradient(ellipse 70% 70% at 50% 35%,#103c57 0%,#051929 48%,#010813 96%);background-attachment:fixed;color:#bdeeff}
body:before{content:'';position:fixed;inset:0;pointer-events:none;opacity:.24;background:linear-gradient(transparent 98%,#2faaf82a 100%),linear-gradient(90deg,transparent 98%,#2faaf818 100%);background-size:45px 45px;mask-image:linear-gradient(to bottom,transparent 2%,black 90%)}
main{position:relative;max-width:1160px;padding:22px 35px 55px}
.top{border-bottom:1px solid #1c5569;padding-bottom:15px;font-size:11px;letter-spacing:3px}
.top span:first-child{color:#9beeff}
.brand{font-weight:200;letter-spacing:14px;font-size:44px;margin:18px auto 3px}
.subtitle{font-size:11px;letter-spacing:5px;color:#69b9d7}
.corewrap{height:370px;max-width:870px;margin:5px auto 0;overflow:visible}
.core{width:267px;height:267px;border:2px solid #49dcff;box-shadow:0 0 42px #28c6ff55,inset 0 0 55px #1eaef950;background:repeating-conic-gradient(from 0deg,#1dd4ff48 0deg 1deg,transparent 2deg 13deg),radial-gradient(circle,#23c6ff3b,#001d30 72%)}
.core:before{width:221px;height:221px;border-width:2px}.core:after{width:145px;height:145px;box-shadow:0 0 28px #16cfff,inset 0 0 30px #3dfbff}
.corewrap:before{width:318px;height:318px;border-color:#4bd5ff90}.corewrap:after{width:345px;height:345px;border-color:#5deaff77}
.center{font-size:15px;letter-spacing:3px;text-shadow:0 0 16px #b5fbff}
.hudhud{top:140px;font-size:12px;letter-spacing:2px;gap:10px;color:#5dabc8}
.hudhud strong{font-size:13px;color:#b0f6ff}.hudleft{left:32px}.hudright{right:32px}
.status{font-size:13px;font-weight:500;letter-spacing:4px;margin-bottom:10px}
.answer{max-width:870px;margin:0 auto;min-height:75px;border-color:#35a7ce;background:linear-gradient(120deg,#0b3147a8,#041421d6);font-size:16px;padding:16px 26px}
.controls,.sendline{max-width:870px;margin:13px auto}
.btn{border-color:#3ea4c9;letter-spacing:.6px;background:linear-gradient(135deg,#0c3a56,#072037);font-size:14px}
.btn.primary{background:linear-gradient(135deg,#1178a2,#063b65);border:1px solid #4ccee9;box-shadow:inset 0 0 16px #41d6ff24}
.btn:focus-visible{outline:2px solid #a1efff;outline-offset:2px}
#mic{font-weight:600;letter-spacing:2px}
input#input{background:#041928e6;border-color:#287a98}
.voiceCard,.memoryPanel,.log{background:linear-gradient(160deg,#072738e6,#03121ded);border-color:#2e7291}
.voiceHeader,.memoryTitle{color:#83dfff;letter-spacing:3px}
.settings,#mode,.voiceCard,.memoryPanel,.log,footer{max-width:870px;margin-left:auto;margin-right:auto}
#desktopHead{display:flex;justify-content:center;gap:24px;margin:2px auto 0;max-width:870px;font:11px monospace;letter-spacing:2px;color:#75b9d4}
#desktopHead span{padding:6px 14px;border-inline:1px solid #36758f}
#desktopNotice{max-width:870px;text-align:center;margin:0 auto 12px;font-size:12px;color:#7ad7ee}
#mic.recording{background:#662a31!important;border-color:#ff7793!important;box-shadow:0 0 25px #ff395d70}
@media(max-width:850px){main{padding:16px}.corewrap{height:320px}.core{width:210px;height:210px}.core:before{width:170px;height:170px}.core:after{width:115px;height:115px}.corewrap:before{width:260px;height:260px}.corewrap:after{width:285px;height:285px}.hudleft{left:0}.hudright{right:0}.hudhud{font-size:9px}.brand{font-size:35px}}
`;
const style=document.createElement('style');style.textContent=css;document.head.append(style);
const subtitle=document.querySelector('.subtitle');
if(subtitle)subtitle.textContent='PERSONAL INTELLIGENCE • WINDOWS COMMAND CENTER';
const head=document.createElement('div');head.id='desktopHead';head.innerHTML='<span>LOCAL AUDIO · WHISPER</span><span>AI CORE · GROQ</span><span>HUD · DESKTOP</span>';
subtitle?.after(head);
const status=document.querySelector('#status');
const notice=document.createElement('div');notice.id='desktopNotice';notice.textContent='Микрофон: один раз нажми «ГОВОРИТЬ», произнеси команду и нажми «ЗАВЕРШИТЬ».';
document.querySelector('#answer')?.after(notice);
const mic=document.getElementById('mic'),stop=document.getElementById('stop');
if(!mic)return;
let recorder=null,stream=null,parts=[],timer=null,recording=false,starting=false;
function cleanup(){
clearTimeout(timer);
if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
recorder=null;recording=false;starting=false;mic.classList.remove('recording');mic.textContent='🎙 ГОВОРИТЬ';
mic.disabled=false;
}
async function startRecording(){
if(starting||recording)return;
starting=true;mic.disabled=true;notice.textContent='Запрашиваю доступ к микрофону…';
try{
stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
if(!window.MediaRecorder)throw Error('Запись не поддерживается.');
const types=['audio/webm;codecs=opus','audio/webm','audio/ogg'];
const type=types.find(t=>MediaRecorder.isTypeSupported(t))||'';
recorder=new MediaRecorder(stream,type?{mimeType:type}:undefined);
parts=[];
recorder.ondataavailable=e=>{if(e.data.size)parts.push(e.data)};
recorder.onstop=async ()=>{
const blob=new Blob(parts,{type:recorder?.mimeType?.split(';')[0]||'audio/webm'});
cleanup();
notice.textContent='Распознаю речь…';
mic.disabled=true;
try{
const response=await fetch('/api/transcribe',{method:'POST',headers:{'content-type':blob.type},body:blob});
const data=await response.json();
if(!response.ok)throw Error(data.error||'Сервис распознавания не ответил');
const phrase=(data.text||'').trim();
if(!phrase){notice.textContent='Не удалось разобрать слова. Повтори команду.';return;}
notice.textContent='Распознано: '+phrase;
const input=document.getElementById('input');
input.value=phrase;document.getElementById('send').click();
}catch(e){notice.textContent='Ошибка: '+e.message}
finally{mic.disabled=false}
};
recorder.start();recording=true;starting=false;mic.disabled=false;
mic.classList.add('recording');mic.textContent='■ ЗАВЕРШИТЬ ЗАПИСЬ';
notice.textContent='СЛУШАЮ · Говори обычным голосом. Затем нажми кнопку ещё раз.';
timer=setTimeout(()=>{if(recorder?.state==='recording')recorder.stop()},20000);
}catch(e){cleanup();notice.textContent='Микрофон не запустился: '+e.message}
}
mic.addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();if(recording){if(recorder?.state==='recording')recorder.stop()}else{startRecording()}},true);
stop.addEventListener('click',()=>{if(recording && recorder?.state==='recording')recorder.stop()},true);
const originalSpeak=window.speechSynthesis?.speak?.bind(window.speechSynthesis);
if(originalSpeak){
let activeAudio=null;
window.speechSynthesis.speak=function(utterance){
const text=utterance?.text||'';
if(!text)return;
if(activeAudio){activeAudio.pause();activeAudio=null;}
const controller=new AbortController();
notice.textContent='Синтезирую мужской голос…';
fetch('/api/tts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:text.slice(0,900)}),signal:controller.signal})
.then(async response=>{if(!response.ok)throw Error('TTS недоступен');return response.blob()})
.then(async blob=>{
const url=URL.createObjectURL(blob);const audio=new Audio(url);activeAudio=audio;
audio.addEventListener('playing',()=>{utterance.onstart?.();notice.textContent='ВОСПРОИЗВОЖУ МУЖСКОЙ ГОЛОС';});
audio.addEventListener('ended',()=>{URL.revokeObjectURL(url);if(activeAudio===audio)activeAudio=null;utterance.onend?.();notice.textContent='Готов к следующей команде.'});
audio.addEventListener('error',()=>{URL.revokeObjectURL(url);if(activeAudio===audio)activeAudio=null;originalSpeak(utterance);notice.textContent='Нейроголос недоступен, включена резервная озвучка.'});
try{await audio.play()}catch{URL.revokeObjectURL(url);originalSpeak(utterance);notice.textContent='Нейроголос заблокирован, включена резервная озвучка.'}
})
.catch(()=>{originalSpeak(utterance);notice.textContent='Нейроголос недоступен, включена резервная озвучка.'});
};
}
})();