import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const html=await readFile(path.join(root,'public/index.html'));
const visits=new Map();
const system='Ты J.A.R.V.I.S. Mark V — персональный интеллектуальный помощник с атмосферой высокотехнологичной лаборатории. Говори естественным русским языком, уверенно, спокойно, интеллигентно; тонкий британский юмор и редкое обращение «сэр» уместны, но не превращай ответы в театральные реплики. Будь инициативным: предлагай следующий полезный шаг, когда это к месту. Для речи используй короткие плавные фразы, обычно 1–4 предложения, без длинных списков и markdown. Помни контекст диалога. Если тебя просят выполнить действие, которого ты не можешь сделать, прямо скажи об ограничении и предложи реальный способ. Не притворяйся, что видишь экран, управляешь устройствами, проверяешь сайты или имеешь доступ к данным без соответствующего инструмента. Не выдавай догадки за выполненные действия.';
function out(res,code,obj){res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','access-control-allow-origin':'same-origin'});res.end(JSON.stringify(obj))}
http.createServer(async(req,res)=>{
const url=new URL(req.url||'/', 'http://localhost');
if(req.method==='GET'&&url.pathname==='/'){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-cache','x-content-type-options':'nosniff'});res.end(html);return}
if(req.method==='GET'&&['/manifest.webmanifest','/icon.svg'].includes(url.pathname)){try{const file=await readFile(path.join(root,'public',url.pathname.slice(1)));res.writeHead(200,{'content-type':url.pathname.endsWith('svg')?'image/svg+xml':'application/manifest+json','cache-control':'public, max-age=3600','x-content-type-options':'nosniff'});res.end(file);return}catch{return out(res,404,{error:'Файл не найден'})}}
if(req.method==='GET'&&url.pathname==='/health')return out(res,200,{ok:true});
if(url.pathname!=='/api/chat')return out(res,404,{error:'Не найдено'});
if(req.method==='GET')return out(res,200,{ready:!!process.env.GROQ_API_KEY,model:process.env.GROQ_MODEL||'openai/gpt-oss-120b'});
if(req.method!=='POST')return out(res,405,{error:'Не поддерживается'});
if(!process.env.GROQ_API_KEY)return out(res,503,{error:'ИИ пока не подключён. Укажите GROQ_API_KEY в Render → Environment.'});
const ip=(req.headers['x-forwarded-for']||req.socket.remoteAddress||'unknown').toString().split(',')[0];
const now=Date.now();const bucket=visits.get(ip)||{time:now,n:0};if(now-bucket.time>60000){bucket.time=now;bucket.n=0}bucket.n++;visits.set(ip,bucket);if(visits.size>1000)visits.clear();if(bucket.n>12)return out(res,429,{error:'Лимит запросов. Повторите через минуту.'});
try{
let raw='';for await(const part of req){raw+=part;if(raw.length>18000)return out(res,413,{error:'Слишком длинное сообщение'})}
const data=JSON.parse(raw);const history=Array.isArray(data.history)?data.history:[];
const messages=[{role:'system',content:system},...history.slice(-16).filter(x=>x&&['user','model'].includes(x.role)&&typeof x.text==='string'&&x.text.trim()).map(x=>({role:x.role==='model'?'assistant':'user',content:x.text.slice(0,2000)}))];
if(messages.length<2||messages.at(-1).role!=='user')return out(res,400,{error:'Нет сообщения'});
const model=process.env.GROQ_MODEL||'openai/gpt-oss-120b';
const resp=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+process.env.GROQ_API_KEY},body:JSON.stringify({model,messages,temperature:0.7,max_completion_tokens:500}),signal:AbortSignal.timeout(25000)});
const result=await resp.json().catch(()=>({}));
if(!resp.ok)return out(res,resp.status===429?429:502,{error:resp.status===429?'Лимит нейросети исчерпан.':String(result?.error?.message||'Ошибка подключения к нейросети').slice(0,200)});
const answer=(result.choices?.[0]?.message?.content||'').trim();
return out(res,200,{answer:answer||'Не получилось сформировать ответ, сэр.'});
}catch(e){return out(res,500,{error:e?.name==='TimeoutError'?'Нейросеть отвечает слишком долго.':'Ошибка обработки сообщения.'})}
}).listen(Number(process.env.PORT||10000),'0.0.0.0');