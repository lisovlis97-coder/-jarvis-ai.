'use strict';
const {app,BrowserWindow,Menu,shell,dialog,session,powerMonitor} = require('electron');
const path=require('node:path');
const fs=require('node:fs');
const os=require('node:os');
const {spawn}=require('node:child_process');
const {ipcMain}=require('electron');
const {autoUpdater}=require('electron-updater');
let checkingUpdate=false, updateTimer=null, manualUpdateCheck=false;
function checkUpdates(manual=false){
 if(!app.isPackaged || process.env.PORTABLE_EXECUTABLE_FILE){if(manual)dialog.showMessageBox({type:'info',message:'Автообновления доступны в установленной версии J.A.R.V.I.S., а не в Portable.'});return;}
 if(checkingUpdate)return;
 checkingUpdate=true;manualUpdateCheck=manual;
 autoUpdater.checkForUpdates().catch(e=>{checkingUpdate=false;if(manual)dialog.showMessageBox(win,{type:'warning',message:'Не удалось проверить обновления',detail:String(e.message||e).slice(0,300)})});
}
function setupUpdates(){
 if(!app.isPackaged || process.env.PORTABLE_EXECUTABLE_FILE)return;
 autoUpdater.autoDownload=true;
 autoUpdater.autoInstallOnAppQuit=false;
 autoUpdater.on('checking-for-update',()=>{checkingUpdate=true});
 autoUpdater.on('update-not-available',()=>{checkingUpdate=false;if(manualUpdateCheck){manualUpdateCheck=false;dialog.showMessageBox(win,{type:'info',message:'Обновлений пока нет',detail:'Установлена актуальная опубликованная версия J.A.R.V.I.S.'}).catch(()=>{})}});
 autoUpdater.on('update-available',()=>{checkingUpdate=false;manualUpdateCheck=false});
 autoUpdater.on('error',e=>{checkingUpdate=false;manualUpdateCheck=false;console.warn('Update check:',e?.message)});
 autoUpdater.on('update-downloaded',info=>{
  dialog.showMessageBox(win,{type:'info',buttons:['Перезапустить и обновить','Позже'],defaultId:0,cancelId:1,
   title:'Обновление Джарвиса',message:'Доступна новая версия J.A.R.V.I.S. '+info.version,
   detail:'Обновление скачано. Перезапустить программу для установки?'}).then(({response})=>{if(response===0)autoUpdater.quitAndInstall(false,true)}).catch(()=>{});
 });
 setTimeout(()=>checkUpdates(false),15000);
 updateTimer=setInterval(()=>checkUpdates(false),6*60*60*1000);
}

const HOME='https://jarvis-ai-assistant-aziv.onrender.com/';
const ORIGIN=new URL(HOME).origin;
let win;
let reconnectTimer=null, offline=false, reconnecting=false;
function clearReconnect(){
 if(reconnectTimer){clearInterval(reconnectTimer);reconnectTimer=null}
 offline=false;reconnecting=false;
}
async function retryConnection(){
 if(!offline||reconnecting||!win||win.isDestroyed())return;
 reconnecting=true;
 try{
  const response=await fetch(ORIGIN+'/health',{signal:AbortSignal.timeout(9000),cache:'no-store'});
  if(response.ok&&offline){
   offline=false;
   if(reconnectTimer){clearInterval(reconnectTimer);reconnectTimer=null}
   await win.loadURL(HOME);
  }
 }catch(e){console.warn('Waiting for JARVIS server:',e?.message||e)}
 finally{reconnecting=false}
}
function showOfflinePage(){
 if(!win||win.isDestroyed())return;
 offline=true;
 win.loadFile(path.join(__dirname,'offline.html')).catch(err=>console.warn('Offline page failed:',err.message));
 if(!reconnectTimer)reconnectTimer=setInterval(()=>retryConnection(),12000);
 setTimeout(()=>retryConnection(),2000);
}
app.setAppUserModelId('ru.vector.jarvis');
// Desktop is permitted to play generated speech after an asynchronous network response.
app.commandLine.appendSwitch('autoplay-policy','no-user-gesture-required');
const hasAllowedUrl=url=>{try{const u=new URL(url);return u.origin===ORIGIN && (u.protocol==='https:')}catch{return false}};

// Only exposes audio output controls: no shell execution or file operations from remote web content.
let currentVoiceProcess=null;
function isTrustedSender(event){
 try{return event.sender===win?.webContents && new URL(event.senderFrame.url).origin===ORIGIN}catch{return false}
}
function runWindowsSpeech(script,timeoutMs=30000){
 return new Promise((resolve,reject)=>{
  const proc=spawn('powershell.exe',['-NoLogo','-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,timeout:timeoutMs});
  currentVoiceProcess=proc;
  let stdout='',stderr='';
  proc.stdout?.on('data',b=>{stdout+=b.toString('utf8').slice(0,5000)});
  proc.stderr?.on('data',b=>{stderr+=b.toString('utf8').slice(0,1000)});
  proc.once('error',reject);
  proc.once('close',(code,signal)=>{if(currentVoiceProcess===proc)currentVoiceProcess=null;if(code===0)resolve(stdout.trim());else reject(new Error(stderr.trim()||'Windows voice engine is unavailable'))});
 });
}
function stopWindowsSpeech(){
 if(currentVoiceProcess){try{currentVoiceProcess.kill()}catch{}currentVoiceProcess=null}
}
const voiceInit=`Add-Type -AssemblyName System.Speech -ErrorAction Stop
$s=New-Object System.Speech.Synthesis.SpeechSynthesizer
$v=@($s.GetInstalledVoices() | Where-Object { $_.Enabled } | ForEach-Object { $_.VoiceInfo })
$ru=@($v | Where-Object { $_.Culture.Name -like 'ru*' })
$preferred=@($ru | Where-Object { $_.Gender.ToString() -eq 'Male' })
if ($preferred.Count -gt 0) { $s.SelectVoice($preferred[0].Name) }
elseif ($ru.Count -gt 0) { $s.SelectVoice($ru[0].Name) }
elseif ($v.Count -gt 0) { $s.SelectVoice($v[0].Name) }
else { throw 'На компьютере не установлены голоса Windows Speech.' }
`;
ipcMain.handle('jarvis:tts-voices',async event=>{
 if(!isTrustedSender(event))throw new Error('Unauthorized');
 const script=voiceInit+`$v | ForEach-Object { $_.Name + ' | ' + $_.Culture.Name + ' | ' + $_.Gender.ToString() }`;
 try{return await runWindowsSpeech(script,10000)}catch(e){return 'Голос Windows недоступен: '+e.message}
});
ipcMain.handle('jarvis:tts-speak',async(event,phrase)=>{
 if(!isTrustedSender(event))throw new Error('Unauthorized');
 const text=typeof phrase==='string'?phrase.trim().slice(0,1000):'';
 if(!text)throw new Error('Пустой текст');
 stopWindowsSpeech();
 const safe=Buffer.from(text,'utf8').toString('base64');
 const script=voiceInit+`$text=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${safe}')); $s.Rate=-1; $s.Speak($text); $s.Dispose()`;
 return await runWindowsSpeech(script,35000);
});
ipcMain.handle('jarvis:tts-stop',event=>{
 if(!isTrustedSender(event))return false;
 stopWindowsSpeech();return true;
});


const allowedDesktopActions=Object.freeze({
 calculator:{label:'Калькулятор',exe:'calc.exe'},
 notepad:{label:'Блокнот',exe:'notepad.exe'},
 explorer:{label:'Проводник Windows',exe:'explorer.exe'}
});
let previousCpu=os.cpus();
function cpuLoad(){
 const current=os.cpus(),before=previousCpu;previousCpu=current;
 let idle=0,total=0;
 for(let i=0;i<current.length;i++){
   const a=current[i].times,b=before[i]?.times||a;
   const keys=['user','nice','sys','idle','irq'];
   for(const k of keys){const delta=Math.max(0,a[k]-b[k]);total+=delta;if(k==='idle')idle+=delta}
 }
 return total>0?Math.round(100*(total-idle)/total):0;
}
ipcMain.handle('jarvis:system-status',event=>{
 if(!isTrustedSender(event))throw new Error('Unauthorized');
 const total=os.totalmem(),free=os.freemem();
 return {platform:'Windows',hostname:os.hostname().slice(0,60),cpus:os.cpus().length,
  ramTotalGb:Math.round(total/107374182.4)/10,ramUsedPct:Math.round(100*(total-free)/total),
  cpuUsedPct:cpuLoad(),onBattery:powerMonitor.isOnBatteryPower(),
  uptimeMinutes:Math.floor(os.uptime()/60),version:app.getVersion()};
});
ipcMain.handle('jarvis:launch-app',async(event,action)=>{
 if(!isTrustedSender(event))throw new Error('Unauthorized');
 if(typeof action!=='string'||!Object.hasOwn(allowedDesktopActions,action))throw new Error('Unsupported action');
 const entry=allowedDesktopActions[action];
 const result=await dialog.showMessageBox(win,{type:'question',buttons:['Запустить','Отмена'],defaultId:1,cancelId:1,
  title:'Разрешение J.A.R.V.I.S.',message:'Разрешить запуск приложения?',detail:entry.label});
 if(result.response!==0)return {ok:false,cancelled:true};
 return new Promise(resolve=>{
  try{
   const child=spawn(entry.exe,[],{detached:true,windowsHide:false,stdio:'ignore'});
   child.once('error',e=>resolve({ok:false,error:'Не получилось открыть '+entry.label+': '+e.message.slice(0,100)}));
   child.once('spawn',()=>{child.unref();resolve({ok:true,label:entry.label})});
  }catch(e){resolve({ok:false,error:String(e.message).slice(0,100)})}
 });
});

const safePlaces=Object.freeze({
 downloads:{label:'Загрузки',location:()=>path.join(os.homedir(),'Downloads')},
 documents:{label:'Документы',location:()=>app.getPath('documents')},
 desktop:{label:'Рабочий стол',location:()=>app.getPath('desktop')}
});
const safeSites=Object.freeze({
 vector:{label:'Вектор РФ',url:'https://vector-rf.ru/'},
 github:{label:'Наш GitHub J.A.R.V.I.S.',url:'https://github.com/lisovlis97-coder/jarvis-ai'},
 jarvis:{label:'Джарвис в браузере',url:HOME}
});
ipcMain.handle('jarvis:open-place',async(event,key)=>{
 if(!isTrustedSender(event))throw new Error('Unauthorized');
 if(typeof key!=='string'||!Object.hasOwn(safePlaces,key))throw new Error('Недоступная папка');
 const place=safePlaces[key];
 const confirm=await dialog.showMessageBox(win,{type:'question',buttons:['Открыть','Отмена'],defaultId:1,cancelId:1,
 title:'J.A.R.V.I.S. / Windows',message:'Открыть папку «'+place.label+'»?'});
 if(confirm.response!==0)return {ok:false,cancelled:true};
 const result=await shell.openPath(place.location());
 return result?{ok:false,error:result.slice(0,140)}:{ok:true,label:place.label};
});
ipcMain.handle('jarvis:open-site',async(event,key)=>{
 if(!isTrustedSender(event))throw new Error('Unauthorized');
 if(typeof key!=='string'||!Object.hasOwn(safeSites,key))throw new Error('Недоступный сайт');
 const site=safeSites[key];
 const confirm=await dialog.showMessageBox(win,{type:'question',buttons:['Открыть','Отмена'],defaultId:1,cancelId:1,
 title:'J.A.R.V.I.S. / Browser',message:'Открыть «'+site.label+'» во внешнем браузере?',detail:site.url});
 if(confirm.response!==0)return {ok:false,cancelled:true};
 await shell.openExternal(site.url);
 return {ok:true,label:site.label};
});
ipcMain.handle('jarvis:open-selected-file',async event=>{
 if(!isTrustedSender(event))throw new Error('Unauthorized');
 const result=await dialog.showOpenDialog(win,{title:'J.A.R.V.I.S. — выбрать документ',properties:['openFile'],
  filters:[{name:'Документы',extensions:['pdf','docx','doc','xlsx','xls','pptx','ppt','txt','csv','png','jpg','jpeg']},{name:'Все файлы',extensions:['*']}]});
 if(result.canceled||!result.filePaths.length)return {ok:false,cancelled:true};
 const filepath=result.filePaths[0],name=path.basename(filepath);
 const confirm=await dialog.showMessageBox(win,{type:'question',buttons:['Открыть','Отмена'],defaultId:1,cancelId:1,
  title:'Подтвердить действие',message:'Открыть выбранный документ?',detail:name});
 if(confirm.response!==0)return {ok:false,cancelled:true};
 const err=await shell.openPath(filepath);
 return err?{ok:false,error:err.slice(0,150)}:{ok:true,label:name};
});
ipcMain.handle('jarvis:window-action',async(event,action)=>{
 if(!isTrustedSender(event))throw new Error('Unauthorized');
 if(action==='fullscreen'){win.setFullScreen(!win.isFullScreen());return {ok:true,label:win.isFullScreen()?'Полный экран':'Оконный режим'}}
 if(action==='ontop'){win.setAlwaysOnTop(!win.isAlwaysOnTop());return {ok:true,label:win.isAlwaysOnTop()?'Поверх окон':'Обычное положение'}}
 throw new Error('Недоступное действие');
});
ipcMain.handle('jarvis:check-update',async event=>{
 if(!isTrustedSender(event))throw new Error('Unauthorized');
 checkUpdates(true);return {ok:true};
});

function createWindow(){
 win=new BrowserWindow({
  width:1180,height:850,minWidth:480,minHeight:590,
  backgroundColor:'#020c16',title:'J.A.R.V.I.S.',
  autoHideMenuBar:false,show:false,
  webPreferences:{
   nodeIntegration:false,contextIsolation:true,sandbox:true,
   webSecurity:true,spellcheck:true,
   preload:path.join(__dirname,'preload.cjs')
  }
 });
 win.once('ready-to-show',()=>win.show());
 win.webContents.on('did-finish-load',()=>{if(hasAllowedUrl(win.webContents.getURL()) && new URL(win.webContents.getURL()).pathname==='/'){
   const script=fs.readFileSync(path.join(__dirname,'desktop-ui.js'),'utf8');
   win.webContents.executeJavaScript(script).then(()=>{
     const hud=fs.readFileSync(path.join(__dirname,'hud-v2.js'),'utf8');
     return win.webContents.executeJavaScript(hud).then(()=>{
       const operations=fs.readFileSync(path.join(__dirname,'operations.js'),'utf8');
       return win.webContents.executeJavaScript(operations);
     });
   }).catch(err=>console.warn('Desktop UI:',err.message));
 }});
 win.webContents.setWindowOpenHandler(({url})=>{if(url.startsWith('https://')||url.startsWith('http://'))shell.openExternal(url).catch(()=>{});return {action:'deny'}});
 win.webContents.on('will-navigate',(e,url)=>{if(!hasAllowedUrl(url)){e.preventDefault();if(/^https?:/.test(url))shell.openExternal(url).catch(()=>{})}});
 win.webContents.on('did-fail-load',(_e,code,desc,url,isMainFrame)=>{
  if(!isMainFrame||code===-3||!url.startsWith(ORIGIN))return;
  console.warn('JARVIS connection failed:',code,desc);
  showOfflinePage();
 });
 win.webContents.on('did-finish-load',()=>{
  const current=win.webContents.getURL();
  if(hasAllowedUrl(current)&&new URL(current).pathname==='/'){
   clearReconnect();
  }
 });
 win.on('closed',()=>{if(reconnectTimer)clearInterval(reconnectTimer);reconnectTimer=null});
 const menu=Menu.buildFromTemplate([
 {label:'Джарвис',submenu:[
 {label:'Открыть Джарвиса',click:()=>{clearReconnect();win.loadURL(HOME).catch(()=>showOfflinePage())}},
 {label:'Обновить интерфейс',accelerator:'Ctrl+R',click:()=>win.webContents.reload()},
 {label:'Проверить обновления программы',click:()=>checkUpdates(true)},
 {label:'Голосовая лаборатория',click:()=>win.loadURL(ORIGIN+'/voice-lab')},
 {type:'separator'},{label:'Открыть в браузере',click:()=>shell.openExternal(HOME)},
 {label:'Выход',role:'quit'}]},
 {label:'Окно',submenu:[{label:'Поверх других окон',type:'checkbox',click:item=>win.setAlwaysOnTop(item.checked)},{role:'minimize'},{role:'togglefullscreen'}]},
 {label:'Обновления',submenu:[{label:'Проверить обновления J.A.R.V.I.S.',click:()=>checkUpdates(true)},{label:'Страница выпусков GitHub',click:()=>shell.openExternal('https://github.com/lisovlis97-coder/jarvis-ai/releases')}]},
 {label:'Помощь',submenu:[{label:'О программе',click:()=>dialog.showMessageBox(win,{type:'info',title:'J.A.R.V.I.S.',message:'J.A.R.V.I.S. для Windows',detail:'Версия '+app.getVersion()+'. Работающий помощник с Groq на сервере Render. Установленная версия проверяет обновления через GitHub Releases.'})}]}
 ]);
 Menu.setApplicationMenu(menu);
 win.setMenuBarVisibility(true);
 win.loadURL(HOME);
}
app.whenReady().then(()=>{
 // Only permit microphone on this trusted application origin and after browser permission request.
 session.defaultSession.setPermissionCheckHandler((wc,permission,requestingOrigin)=>permission==='media' && requestingOrigin===ORIGIN && wc===win?.webContents);
 session.defaultSession.setPermissionRequestHandler((wc,permission,callback,details)=>callback(permission==='media' && wc===win?.webContents && details.requestingUrl?.startsWith(ORIGIN)));
 createWindow();
 setupUpdates();
 app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()});
});
app.on('window-all-closed',()=>{stopWindowsSpeech();if(process.platform!=='darwin')app.quit()});
