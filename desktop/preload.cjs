'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('jarvisWindowsVoice',{
 speak:text=>ipcRenderer.invoke('jarvis:tts-speak',String(text||'').slice(0,1000)),
 stop:()=>ipcRenderer.invoke('jarvis:tts-stop'),
 voices:()=>ipcRenderer.invoke('jarvis:tts-voices')
});
