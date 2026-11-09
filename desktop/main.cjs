'use strict';
const {app,BrowserWindow,Menu,shell,dialog,session} = require('electron');
const path=require('node:path');
const fs=require('node:fs');
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
app.setAppUserModelId('ru.vector.jarvis');
// Desktop is permitted to play generated speech after an asynchronous network response.
app.commandLine.appendSwitch('autoplay-policy','no-user-gesture-required');
const hasAllowedUrl=url=>{try{const u=new URL(url);return u.origin===ORIGIN && (u.protocol==='https:')}catch{return false}};
function createWindow(){
 win=new BrowserWindow({
  width:1180,height:850,minWidth:480,minHeight:590,
  backgroundColor:'#020c16',title:'J.A.R.V.I.S.',
  autoHideMenuBar:true,show:false,
  webPreferences:{
   nodeIntegration:false,contextIsolation:true,sandbox:true,
   webSecurity:true,spellcheck:true,
   preload:path.join(__dirname,'preload.cjs')
  }
 });
 win.once('ready-to-show',()=>win.show());
 win.webContents.on('did-finish-load',()=>{if(hasAllowedUrl(win.webContents.getURL()) && new URL(win.webContents.getURL()).pathname==='/'){
   const script=fs.readFileSync(path.join(__dirname,'desktop-ui.js'),'utf8');
   win.webContents.executeJavaScript(script).catch(err=>console.warn('Desktop UI:',err.message));
 }});
 win.webContents.setWindowOpenHandler(({url})=>{if(url.startsWith('https://')||url.startsWith('http://'))shell.openExternal(url).catch(()=>{});return {action:'deny'}});
 win.webContents.on('will-navigate',(e,url)=>{if(!hasAllowedUrl(url)){e.preventDefault();if(/^https?:/.test(url))shell.openExternal(url).catch(()=>{})}});
 win.webContents.on('did-fail-load',(_e,code,_desc,url,isMainFrame)=>{if(isMainFrame&&code!==-3&&url.startsWith(ORIGIN))win.loadFile(path.join(__dirname,'offline.html'))});
 const menu=Menu.buildFromTemplate([
 {label:'Джарвис',submenu:[
 {label:'Открыть Джарвиса',click:()=>win.loadURL(HOME)},
 {label:'Обновить интерфейс',accelerator:'Ctrl+R',click:()=>win.webContents.reload()},
 {label:'Проверить обновления программы',click:()=>checkUpdates(true)},
 {label:'Голосовая лаборатория',click:()=>win.loadURL(ORIGIN+'/voice-lab')},
 {type:'separator'},{label:'Открыть в браузере',click:()=>shell.openExternal(HOME)},
 {label:'Выход',role:'quit'}]},
 {label:'Окно',submenu:[{label:'Поверх других окон',type:'checkbox',click:item=>win.setAlwaysOnTop(item.checked)},{role:'minimize'},{role:'togglefullscreen'}]},
 {label:'Помощь',submenu:[{label:'О программе',click:()=>dialog.showMessageBox(win,{type:'info',title:'J.A.R.V.I.S.',message:'J.A.R.V.I.S. для Windows',detail:'Версия '+app.getVersion()+'. Работающий помощник с Groq на сервере Render. Установленная версия проверяет обновления через GitHub Releases.'})}]}
 ]);
 Menu.setApplicationMenu(menu);
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
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
