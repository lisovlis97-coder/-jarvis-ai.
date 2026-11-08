import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const html=await readFile(path.join(root,'public/index.html'));
const visits=new Map();
const system='Ты J.A.R.V.I.S., дружелюбный русскоязычный голосовой помощник с лаконичными, умными ответами. Тон спокойный, иногда обращайся «сэр». Не утверждай, что видишь экран, управляешь устройством или проверил данные, если это не так. Обычно отвечай 1–4 предложениями.';
function out(res,code,obj){res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','access-control-allow-origin':'same-origin'});res.end(JSON.stringify(obj))}
http.createServer(async(req,res)=>{
const url=new URL(req.url||'/', 'http://localhost');
if(req.method==='GET'&&url.pathname==='/'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-cache','x-content-type-options':'nosniff'});res.end(html);return}
if(req.method==='GET'&&url.pathname==='/health')return out(res,200,{ok:true});
if(url.pathname!=='/api/chat')return out(res,404,{error:'Не найдено'});
if(req.method==='GET')return out(res,200,{ready:!!process.env.GEMINI_API_KEY,model:process.env.GEMINI_MODEL||'gemini-2.5-flash'});
if(req.method!=='POST')return out(res,405,{error:'Не поддерживается'});
if(!process.env.GEMINI_API_KEY)return out(res,503,{error:'ИИ пока не подключён. Укажите GEMINI_API_KEY в Render → Environment.'});
const ip=(req.headers['x-forwarded-for']||req.socket.remoteAddress||'unknown').toString().split(',')[0];
const now=Date.now();const bucket=visits.get(ip)||{time:now,n:0};if(now-bucket.time>60000){bucket.time=now;bucket.n=0}bucket.n++;visits.set(ip,bucket);if(visits.size>1000)visits.clear();if(bucket.n>12)return out(res,429,{error:'Лимит запросов. Повторите через минуту.'});
try{
let raw='';for await(const part of req){raw+=part;if(raw.length>18000)return out(res,413,{error:'Слишком длинное сообщение'})}
const data=JSON.parse(raw);const history=Array.isArray(data.history)?data.history:[];
const contents=history.slice(-16).filter(x=>x&&['user','model'].includes(x.role)&&typeof x.text==='string'&&x.text.trim()).map(x=>({role:x.role,parts:[{text:x.text.slice(0,2000)}]}));
if(!contents.length||contents.at(-1).role!=='user')return out(res,400,{error:'Нет сообщения'});
const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
const resp=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents,generationConfig:{temperature:0.7,maxOutputTokens:500}}),signal:AbortSignal.timeout(25000)});
const result=await resp.json().catch(()=>({}));
if(!resp.ok)return out(res,resp.status===429?429:502,{error:resp.status===429?'Лимит нейросети исчерпан.':String(result?.error?.message||'Ошибка подключения к нейросети').slice(0,200)});
const answer=(result.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join('').trim();
return out(res,200,{answer:answer||'Не получилось сформировать ответ, сэр.'});
}catch(e){return out(res,500,{error:e?.name==='TimeoutError'?'Нейросеть отвечает слишком долго.':'Ошибка обработки сообщения.'})}
}).listen(Number(process.env.PORT||10000),'0.0.0.0');