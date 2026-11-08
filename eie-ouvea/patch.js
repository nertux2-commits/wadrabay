// Correctifs v1.0.2
api=async function(path,opt={}){const r=await fetch(SB_URL+'/rest/v1/'+path,{...opt,headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'x-team-key':S.team,'Content-Type':'application/json',...(opt.headers||{})}});const txt=await r.text();if(!r.ok)throw new Error(r.status+' '+txt.slice(0,120));return txt?JSON.parse(txt):null};
// Mise en cache de l'application pour le hors-ligne (même si un autre service worker a vidé le cache)
(function(){const C='eie-ouvea-v1.0.2';const F=['./','index.html','app.js','prot.js','patch.js','manifest.webmanifest','icon.svg'];
 if(!('caches' in window)||!navigator.onLine)return;caches.open(C).then(c=>Promise.all(F.map(f=>c.match(f).then(m=>m||fetch(new Request(f,{cache:'reload'})).then(r=>{if(r.ok)return c.put(f,r)}).catch(()=>{}))))).catch(()=>{});})();
