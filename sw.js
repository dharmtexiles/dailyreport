/* Daily Report - keeps the app available offline. Network first, so updates you push to GitHub show up at once. */
const V='daily-report-gh-v1',
LOCAL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png'],
CDN=['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(async c=>{
 await Promise.all(LOCAL.map(u=>c.add(u).catch(()=>{})));
 await Promise.all(CDN.map(u=>c.add(new Request(u,{mode:'no-cors'})).catch(()=>{})));
 }).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.hostname==='script.google.com'||u.hostname.endsWith('googleusercontent.com')||u.hostname.endsWith('google.com')&&u.pathname.includes('gsi'))return;   /* never cache the server or Google sign-in */
 e.respondWith(fetch(e.request).then(res=>{
  if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(e.request,cp))}return res})
  .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))))});
