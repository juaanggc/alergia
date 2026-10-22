const V='alergia-v3',F=['js/content.js','./','index.html','css/styles.css','js/data.js','js/pdf.js','js/app.js','manifest.webmanifest','icon-192.png','lib/jspdf.umd.min.js','lib/jspdf.plugin.autotable.min.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(F)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
e.respondWith(fetch(e.request).then(n=>{const c=n.clone();caches.open(V).then(x=>x.put(e.request,c));return n}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))))});
