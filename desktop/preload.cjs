'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('jarvisWindowsVoice',{
 speak:text=>ipcRenderer.invoke('jarvis:tts-speak',String(text||'').slice(0,1000)),
 stop:()=>ipcRenderer.invoke('jarvis:tts-stop'),
 voices:()=>ipcRenderer.invoke('jarvis:tts-voices')
});

contextBridge.exposeInMainWorld('jarvisDesktop',{
 status:()=>ipcRenderer.invoke('jarvis:system-status'),
 launch:action=>ipcRenderer.invoke('jarvis:launch-app',action),
 checkUpdates:()=>ipcRenderer.invoke('jarvis:check-update'),
 openPlace:key=>ipcRenderer.invoke('jarvis:open-place',key),
 openSite:key=>ipcRenderer.invoke('jarvis:open-site',key),
 openFile:()=>ipcRenderer.invoke('jarvis:open-selected-file'),
 windowAction:action=>ipcRenderer.invoke('jarvis:window-action',action)
});
