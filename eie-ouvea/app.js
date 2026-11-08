'use strict';
/* ===================== CONFIG ===================== */
const SB_URL='https://bdpbsdqxrrtvzdocezzy.supabase.co';
const SB_KEY='sb_publishable_wS72835MaYCHp0BqBrR0Nw_FG8a7CbN';
const PEOPLE=['Georges KAKUE','Jean-Marie ITA','Glwadys BAKO','Marvin WAITRONYIE','Cédric MEAOU'];
const CARRES=['M1','M2','M3','P1','P2'];
const QUARTS=['a','b','c','d'];
const CODES=['','r','+','1','2','3','4','5'];
const PROT=window.PROT||[];
const GROUPES={1:'Endémique Loyauté',2:'Rare à Ouvéa',3:'Peu commune à commune',4:'Citée, non revue',5:'Non connue à Ouvéa'};
const FOURMIS=['Wasmannia auropunctata (fourmi électrique)','Anoplolepis gracilipes (fourmi folle jaune)','Pheidole megacephala (fourmi à grosse tête)','Indéterminée'];
const REPTILES=['Bavayia (gecko) – à préciser','Bavayia des rivages','Emoia des Loyauté','Caledoniscincus atropunctatus','Lepidodactylus lugubris','Hemidactylus frenatus','Gecko indéterminé','Scinque indéterminé'];
const OISEAUX=['Perruche d’Ouvéa'];

/* ===================== STOCKAGE ===================== */
const LS={get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){toast('Mémoire pleine : exportez et synchronisez',true)}}};
let S=LS.get('eie_state',{obs:'',team:'',dev:'',carre:'M1',quart:'a',tab:'plantes',sub:'espece',rep:'',oi:'',poste:'F1',lastPull:'',lastSync:''});
if(!S.dev){S.dev=Math.random().toString(36).slice(2,8);LS.set('eie_state',S)}
let R=LS.get('eie_records',{});           // id -> record
const saveS=()=>LS.set('eie_state',S);
const saveR=()=>LS.set('eie_records',R);
// IndexedDB pour les photos
let DB;
function idb(){return new Promise((ok,ko)=>{if(DB)return ok(DB);const q=indexedDB.open('eie_photos',1);q.onupgradeneeded=()=>q.result.createObjectStore('p',{keyPath:'id'});q.onsuccess=()=>{DB=q.result;ok(DB)};q.onerror=()=>ko(q.error)})}
async function pPut(o){const d=await idb();return new Promise((ok,ko)=>{const t=d.transaction('p','readwrite');t.objectStore('p').put(o);t.oncomplete=ok;t.onerror=()=>ko(t.error)})}
async function pGet(id){const d=await idb();return new Promise(ok=>{const q=d.transaction('p').objectStore('p').get(id);q.onsuccess=()=>ok(q.result);q.onerror=()=>ok(null)})}
async function pAll(){const d=await idb();return new Promise(ok=>{const q=d.transaction('p').objectStore('p').getAll();q.onsuccess=()=>ok(q.result||[]);q.onerror=()=>ok([])})}
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();

/* ===================== OUTILS ===================== */
const $=(s,e=document)=>e.querySelector(s);
const h=(tag,attrs={},...kids)=>{const e=document.createElement(tag);for(const[k,v]of Object.entries(attrs||{})){if(k==='class')e.className=v;else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else if(k==='html')e.innerHTML=v;else if(v!==false&&v!=null)e.setAttribute(k,v===true?'':v)}for(const c of kids.flat()){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(c))}return e};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const now=()=>new Date().toISOString();
const hhmm=d=>{const x=d?new Date(d):new Date();return x.toTimeString().slice(0,5)};
const today=()=>new Date().toLocaleDateString('fr-FR');
const pad=(n,l=3)=>String(n).padStart(l,'0');
function toast(m,err){const t=$('#toast');t.textContent=m;t.className='show'+(err?' err':'');clearTimeout(t._t);t._t=setTimeout(()=>t.className='',2600)}
function vibrate(){try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(e){}}
function beep(){try{const a=new (window.AudioContext||window.webkitAudioContext)();const o=a.createOscillator();o.frequency.value=880;o.connect(a.destination);o.start();setTimeout(()=>{o.stop();a.close()},600)}catch(e){}}
const live=t=>Object.values(R).filter(r=>r.type===t&&!r.deleted);

/* ===================== SCHÉMAS ===================== */
// t: text num sel chk area gps photo cnt time
const SCH={
 carre:{titre:'Fiche 0 – Description du carré',ctx:['carre'],f:[
  ['vegetation','Type de végétation','sel',['','Forêt','Fourré','Lisière','Autre']],
  ['canopee_h','Hauteur de la canopée (m, télémètre)','num'],
  ['ouverture','Ouverture de la canopée (%)','num'],
  ['substrat','Sol','sel',['','Sable','Dalle','Blocs coralliens','Terre','Mélange']],
  ['litiere_centre','Litière centre (cm)','num'],['litiere_no','Litière coin NO (cm)','num'],['litiere_ne','Litière coin NE (cm)','num'],['litiere_se','Litière coin SE (cm)','num'],['litiere_so','Litière coin SO (cm)','num'],
  ['perturbations','Traces (coupe, feu, cochons, cerfs, déchets, plantes envahissantes)','area'],
  ['route_m2','Surface de route dans le carré (m²)','num'],
  ['gps','Point GPS (centre)','gps'],['photos','Photos','photo'],['remarque','Remarque','area']],
  lab:r=>`${r.carre} – ${r.vegetation||'description'}`},
 espece:{titre:'Fiche 1 – Liste des plantes (par quart)',ctx:['carre','quart'],f:[
  ['espece','Espèce (ou nom provisoire)','text','plantes',true],
  ['type_plante','Type','sel',['','Arbre','Arbuste','Liane','Herbe','Fougère','Épiphyte']],
  ['code_0_1','Code 0–1 m','codes'],['code_1_5','Code 1–5 m','codes'],['code_5','Code > 5 m','codes'],
  ['statut','Statut','sel',['','E (endémique)','I (indigène)','Intro (introduite)','?']],
  ['herbier','N° herbier','text'],['photos','Photos','photo'],['remarque','Remarque','text']],
  lab:r=>`${r.carre}${r.quart} – ${r.espece} [${r.code_0_1||'·'} / ${r.code_1_5||'·'} / ${r.code_5||'·'}]`},
 arbre:{titre:'Fiche 2 – Arbres (tour ≥ 15 cm à 1,30 m)',ctx:['carre','quart'],f:[
  ['num','N° d’étiquette','num',null,true],['tige','Tige (a, b… si fourchu)','text'],
  ['espece','Espèce','text','plantes'],
  ['tour','Tour à 1,30 m (cm)','num',null,true],
  ['hauteur','Hauteur (m)','num'],['mode_h','Hauteur mesurée','sel',['','Télémètre','Estimée']],
  ['etat','État','sel',['Vivant','Mort sur pied','Cassé']],
  ['cavite','Cavité (trou)','chk'],['gps','Point GPS','gps'],['photos','Photos','photo'],['remarque','Remarque','text']],
  lab:r=>`${r.carre}-${pad(r.num||0)}${r.tige||''} – ${r.espece||'?'} – ${r.tour||'?'} cm${r.hauteur?' – '+r.hauteur+' m':''}${r.cavite?' – cavité':''}`},
 jeunes:{titre:'Fiche 3 – Jeunes plants (petit carré 5 × 5 m)',ctx:['carre'],f:[
  ['espece','Espèce','text','plantes',true],
  ['plantules','Plantules (< 50 cm)','cnt'],['jeunes','Jeunes plants (50 cm – 1,30 m)','cnt'],['gaules','Gaules (> 1,30 m, tour < 15 cm)','cnt'],
  ['broute','Brouté','chk'],['herbier','N° herbier','text'],['photos','Photos','photo']],
  lab:r=>`${r.carre} – ${r.espece} : ${r.plantules||0} / ${r.jeunes||0} / ${r.gaules||0}`},
 herbier:{titre:'Fiche 4 – Registre d’herbier',ctx:['carre','quart'],f:[
  ['num','N° de récolte','text',null,true],['nom','Nom ou nom provisoire','text','plantes'],
  ['fleurs','Fleurs','chk'],['fruits','Fruits','chk'],['gps','Point GPS','gps'],['photos','Photos','photo'],['remarque','Remarque','text']],
  lab:r=>`${r.num} – ${r.nom||'?'} (${r.carre}${r.quart})`},
 protegee:{titre:'Fiche 5 – Espèces protégées (tous les pieds)',ctx:['carre','quart'],f:[
  ['espece','Espèce protégée','prot',null,true],
  ['stade','Stade','sel',['Adulte (tour ≥ 15 cm)','Jeune (tour < 15 cm)']],
  ['nombre','Nombre de pieds','cnt'],['gps','Point GPS','gps'],['photos','Photos (pas de prélèvement)','photo'],['remarque','Remarque (fleurs, fruits, état)','text']],
  lab:r=>`${r.carre}${r.quart} – ${r.espece} – ${r.nombre||0} pied(s)`},
 rep_obs:{titre:'Reptile observé',ctx:['session'],f:[
  ['espece','Espèce','text','reptiles',true],['nombre','Nombre','cnt'],
  ['support','Support','sel',['','Tronc','Feuillage','Litière','Sol','Pierre / bloc','Bois mort','Autre']],
  ['hauteur','Hauteur (m)','num'],['gps','Point GPS','gps'],['photos','Photos','photo'],['remarque','Remarque','text']],
  lab:r=>`${hhmm(r.ts)} – ${r.espece} ×${r.nombre||1}${r.support?' – '+r.support:''}`},
 fo_obs:{titre:'Fourmis au poste',ctx:['poste'],f:[
  ['sorte','Fourmi (espèce ou description)','text','fourmis',true],
  ['appat','Où','sel',['Thon','Miel','Recherche à vue']],
  ['abondance','Nombre sur l’appât','sel',['1 à 10','11 à 50','Plus de 50','Non compté (à vue)']],
  ['tube','N° de tube','text'],['photos','Photos','photo'],['remarque','Remarque','text']],
  lab:r=>`${r.poste} – ${r.sorte} – ${r.appat} – ${r.abondance}${r.tube?' – tube '+r.tube:''}`},
 oi_contact:{titre:'Oiseau vu ou entendu',ctx:['session'],f:[
  ['phase','Phase','sel',['Écoute 10 min','Parcours 20 min']],
  ['espece','Espèce','text','oiseaux',true],['nombre','Nombre','cnt'],
  ['contact','Contact','sel',['Chant','Cri','Vu','En vol']],['distance','Distance','sel',['< 15 m','> 15 m']],['remarque','Remarque','text']],
  lab:r=>`${hhmm(r.ts)} – ${r.espece} ×${r.nombre||1} – ${r.contact} – ${r.distance} (${(r.phase||'').split(' ')[0]})`},
 oi_nid:{titre:'Nid actif ou arbre à cavité',ctx:[],f:[
  ['type_nid','Type','sel',['Cavité','Nid actif']],['arbre','N° d’arbre (étiquette)','text'],['espece_arbre','Espèce de l’arbre','text','plantes'],
  ['oiseau','Oiseau (si nid actif)','text','oiseaux'],['hauteur','Hauteur (m)','num'],
  ['entree','Entrée de la cavité','sel',['','< 5 cm','5–10 cm','> 10 cm']],['orientation','Orientation','sel',['','N','NE','E','SE','S','SO','O','NO']],
  ['occupant','Occupé par','sel',['','Perruche','Abeilles','Autre oiseau','Vide','?']],
  ['gps','Point GPS','gps'],['photos','Photos (de loin)','photo'],['remarque','Remarque (santal, arbre en fruits…)','text']],
  lab:r=>`${r.type_nid} – arbre ${r.arbre||'?'} – ${r.espece_arbre||''} ${r.hauteur?r.hauteur+' m':''}`},
};
const SESS={
 rep_session:{titre:'Session reptiles',f:[['jour_nuit','Session','sel',['Nuit','Jour']],['observateurs','Observateurs','text'],['temp','Température (°C)','num'],['meteo','Météo','text']]},
 oi_session:{titre:'Matin oiseaux (point O1)',f:[['passage','Passage','sel',['1','2']],['meteo','Météo / vent','text']]},
 fo_poste:{titre:'Poste à fourmis',f:[['temp','Température (°C)','num'],['meteo','Météo','text']]},
};

/* ===================== ENREGISTREMENT ===================== */
function put(rec){rec.u=now();rec.dirty=true;R[rec.id]=rec;saveR();renderStatus();}
function del(id){if(!R[id])return;R[id].deleted=true;put(R[id]);}
function newRec(type,extra={}){return{id:uid(),type,ts:now(),date:today(),obs:S.obs,dev:S.dev,...extra}}
function lists(){const pl=new Set(),fo=new Set(FOURMIS),re=new Set(REPTILES),oi=new Set(OISEAUX);
 for(const r of Object.values(R)){if(r.deleted)continue;if(['espece','arbre','jeunes'].includes(r.type)&&r.espece)pl.add(r.espece);if(r.type==='herbier'&&r.nom)pl.add(r.nom);if(r.type==='fo_obs'&&r.sorte)fo.add(r.sorte);if(r.type==='rep_obs'&&r.espece)re.add(r.espece);if(r.type==='oi_contact'&&r.espece)oi.add(r.espece)}
 PROT.forEach(p=>pl.add(p[0]));return{plantes:[...pl].sort(),fourmis:[...fo],reptiles:[...re],oiseaux:[...oi].sort()}}

/* ===================== PHOTOS ===================== */
function compress(file){return new Promise((ok,ko)=>{const img=new Image();const url=URL.createObjectURL(file);img.onload=()=>{const M=1600;let w=img.width,hh=img.height;const k=Math.min(1,M/Math.max(w,hh));w=Math.round(w*k);hh=Math.round(hh*k);const c=document.createElement('canvas');c.width=w;c.height=hh;c.getContext('2d').drawImage(img,0,0,w,hh);URL.revokeObjectURL(url);ok(c.toDataURL('image/jpeg',0.72))};img.onerror=ko;img.src=url})}
async function addPhoto(rec,label){return new Promise(ok=>{const inp=h('input',{type:'file',accept:'image/*',capture:'environment',style:'display:none'});document.body.append(inp);inp.onchange=async()=>{const f=inp.files[0];inp.remove();if(!f)return ok(null);try{const data=await compress(f);const id=uid();await pPut({id,rec:rec.id,label,data,ts:now(),obs:S.obs,dev:S.dev,synced:false});ok(id)}catch(e){toast('Photo illisible',true);ok(null)}};inp.click()})}
async function thumb(id){const p=await pGet(id);return h('img',{class:'th',src:p?p.data:'',alt:'photo',onclick:()=>{if(p){const w=h('div',{class:'zoom',onclick:()=>w.remove()},h('img',{src:p.data}));document.body.append(w)}}})}

/* ===================== GPS ===================== */
function gps(){return new Promise(ok=>{if(!navigator.geolocation){toast('GPS indisponible',true);return ok(null)}toast('Recherche GPS… (rester immobile)');navigator.geolocation.getCurrentPosition(p=>ok({lat:+p.coords.latitude.toFixed(6),lon:+p.coords.longitude.toFixed(6),prec:Math.round(p.coords.accuracy)}),e=>{toast('GPS : '+e.message,true);ok(null)},{enableHighAccuracy:true,timeout:30000,maximumAge:0})})}

/* ===================== FORMULAIRE GÉNÉRIQUE ===================== */
function nextNum(type,carre){const ns=live(type).filter(r=>r.carre===carre).map(r=>+r.num||0);return ns.length?Math.max(...ns)+1:1}
function nextHerb(){const ns=live('herbier').map(r=>+(String(r.num).match(/(\d+)\s*$/)||[0,0])[1]);return 'JMI-'+pad((ns.length?Math.max(...ns):0)+1)}
function nextTube(poste){return poste+'-'+(live('fo_obs').filter(r=>r.poste===poste&&r.tube).length+1)}

function form(type,ctx,editId,after){
 const sc=SCH[type];const L=lists();
 const rec=editId?{...R[editId]}:newRec(type,ctx);
 if(!editId){
  if(type==='arbre')rec.num=nextNum('arbre',ctx.carre),rec.etat='Vivant';
  if(type==='herbier')rec.num=nextHerb();
  if(type==='fo_obs')rec.tube=nextTube(ctx.poste),rec.appat='Thon',rec.abondance='1 à 10';
  if(['rep_obs','oi_contact','protegee'].includes(type))rec.nombre=1;
  if(type==='oi_contact'){const s=R[ctx.session];rec.phase=(s&&s.t0&&(Date.now()-Date.parse(s.t0))>600000)?'Parcours 20 min':'Écoute 10 min';rec.contact='Chant';rec.distance='< 15 m'}
  if(type==='protegee')rec.stade='Adulte (tour ≥ 15 cm)';
  if(type==='oi_nid')rec.type_nid='Cavité';
 }
 const box=h('div',{class:'card form'});
 box.append(h('h3',{},editId?'Modifier – ':'' ,sc.titre));
 if(sc.ctx.includes('carre'))box.append(h('div',{class:'ctx'},`Carré ${rec.carre}${sc.ctx.includes('quart')?' – quart '+rec.quart:''}`));
 const inputs={};
 for(const[k,lab,t,opt,req]of sc.f){
  const row=h(t==='chk'?'label':'div',{class:'row'+(t==='chk'?' chk':'')});const L1=h('span',{class:'lab'},lab+(req?' *':''));
  let el;
  if(t==='text'){el=h('input',{type:'text',value:rec[k]||'',list:opt?'dl_'+opt:null,autocomplete:'off'})}
  else if(t==='num'){el=h('input',{type:'number',inputmode:'decimal',step:'any',value:rec[k]??''})}
  else if(t==='area'){el=h('textarea',{rows:2},rec[k]||'')}
  else if(t==='sel'){el=h('select',{},opt.map(o=>h('option',{value:o,selected:(rec[k]??opt[0])===o},o||'—')))}
  else if(t==='codes'){el=h('div',{class:'codes'});let v=rec[k]||'';const draw=()=>{el.innerHTML='';CODES.forEach(c=>el.append(h('button',{type:'button',class:'cb'+(v===c?' on':''),onclick:()=>{v=c;el.dataset.v=v;draw()}},c||'–')))};el.dataset.v=v;draw()}
  else if(t==='chk'){el=h('input',{type:'checkbox',checked:!!rec[k]})}
  else if(t==='cnt'){let v=+rec[k]||0;const n=h('span',{class:'cn'},String(v));el=h('div',{class:'cnt'},h('button',{type:'button',onclick:()=>{v=Math.max(0,v-1);n.textContent=v;el.dataset.v=v}},'−'),n,h('button',{type:'button',onclick:()=>{v++;n.textContent=v;el.dataset.v=v}},'+'),h('button',{type:'button',class:'small',onclick:()=>{v+=5;n.textContent=v;el.dataset.v=v}},'+5'));el.dataset.v=v}
  else if(t==='prot'){el=h('select',{},h('option',{value:''},'— choisir —'),...[1,2,3,4,5].map(g=>h('optgroup',{label:GROUPES[g]},PROT.filter(p=>p[2]===g).map(p=>h('option',{value:p[0],selected:rec[k]===p[0]},p[0]+(p[3]?' ('+p[3]+')':''))))))}
  else if(t==='gps'){const sp=h('span',{class:'gv'},rec.lat?`${rec.lat}, ${rec.lon} (±${rec.prec} m)`:'pas de point');el=h('div',{class:'gpsrow'},h('button',{type:'button',class:'btn2',onclick:async()=>{const g=await gps();if(g){Object.assign(rec,g);sp.textContent=`${g.lat}, ${g.lon} (±${g.prec} m)`;toast('Point pris ±'+g.prec+' m')}}},'📍 Prendre le point'),sp)}
  else if(t==='photo'){rec.photos=rec.photos||[];const th=h('div',{class:'ths'});const draw=async()=>{th.innerHTML='';for(const p of rec.photos)th.append(await thumb(p))};draw();el=h('div',{},h('button',{type:'button',class:'btn2',onclick:async()=>{const label=photoLabel(rec);const id=await addPhoto(rec,label);if(id){rec.photos.push(id);draw();toast('Photo enregistrée')}}},'📷 Ajouter une photo'),th)}
  inputs[k]={el,t};
  if(t==='chk')row.append(el,L1);else row.append(L1,el);
  if(type==='arbre'&&k==='hauteur'){const hint=h('div',{class:'hint'});const upd=()=>{const n=+inputs.num.el.value;hint.textContent=n%5===0&&n>0?'⚠ N° finissant par 0 ou 5 : mesurer la hauteur au télémètre':''};row.append(hint);setTimeout(()=>{inputs.num.el.addEventListener('input',upd);upd()})}
  box.append(row);
 }
 const read=()=>{for(const[k,{el,t}]of Object.entries(inputs)){if(t==='gps'||t==='photo')continue;let v;if(t==='chk')v=el.checked;else if(t==='codes'||t==='cnt')v=el.dataset.v;else v=el.value.trim();if(t==='num'||t==='cnt')v=v===''?'':+v;rec[k]=v}};
 const ok=()=>{read();
  for(const[k,lab,t,,req]of sc.f){if(req&&(rec[k]===''||rec[k]==null)){toast('Champ obligatoire : '+lab,true);return}}
  if(type==='arbre'){if(rec.tour!==''&&rec.tour<15){toast('Tour < 15 cm : ne pas mesurer (jeune plant)',true);return}
   const dup=live('arbre').find(r=>r.id!==rec.id&&r.carre===rec.carre&&+r.num===+rec.num&&(r.tige||'')===(rec.tige||''));if(dup&&!confirm('Le n° '+rec.carre+'-'+pad(rec.num)+(rec.tige||'')+' existe déjà. Enregistrer quand même ?'))return;
   if(+rec.num%5===0&&rec.hauteur===''&&!confirm('Pas de hauteur pour un n° finissant par 0 ou 5. Enregistrer quand même ?'))return}
  if(type==='espece'){const dup=live('espece').find(r=>r.id!==rec.id&&r.carre===rec.carre&&r.quart===rec.quart&&r.espece.toLowerCase()===String(rec.espece).toLowerCase());if(dup){toast('Déjà notée dans ce quart : modifiez la ligne existante',true);return}
   if(PROT.some(p=>p[0].toLowerCase()===String(rec.espece).toLowerCase()))alert('Espèce PROTÉGÉE : compter tous les pieds (onglet Protégées), GPS et photos, pas de rameau.')}
  if(type==='herbier'){const dup=live('herbier').find(r=>r.id!==rec.id&&r.num===rec.num);if(dup){toast('N° d’herbier déjà utilisé',true);return}}
  put(rec);toast('Enregistré');if(after)after(rec);
  if(type==='rep_obs')chrono(R[rec.session],'resume');
 };
 box.append(h('div',{class:'actions'},h('button',{class:'btn',onclick:ok},editId?'Enregistrer les modifications':'Enregistrer'),editId?h('button',{class:'btn3',onclick:()=>{if(confirm('Supprimer cette ligne ?')){del(editId);toast('Supprimé');if(after)after()}}},'Supprimer'):null,editId?h('button',{class:'btn3',onclick:()=>after&&after()},'Annuler'):null));
 return box;
}
function photoLabel(r){if(r.type==='arbre')return `${r.carre}-${pad(r.num||0)}${r.tige||''}`;if(r.type==='herbier')return r.num;if(r.carre)return `${r.carre}${r.quart||''}_${r.type}`;if(r.poste)return r.poste;return r.type}

function listView(type,filter,onEdit){
 const rows=live(type).filter(filter||(()=>true)).sort((a,b)=>a.ts<b.ts?1:-1);
 const box=h('div',{class:'card'},h('h3',{},`Déjà saisi (${rows.length})`));
 if(!rows.length)box.append(h('p',{class:'muted'},'Rien pour l’instant.'));
 for(const r of rows)box.append(h('div',{class:'li',onclick:()=>onEdit(r.id)},h('span',{},SCH[type].lab(r)),h('span',{class:'who'},(r.obs||'').split(' ')[0]+(r.dirty?' •':''))));
 return box;
}

/* ===================== VUES ===================== */
const V=$('#view');
function render(){clearInterval(TICK);V.innerHTML='';document.querySelectorAll('nav.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===S.tab));({plantes:vPlantes,reptiles:vReptiles,fourmis:vFourmis,oiseaux:vOiseaux,donnees:vDonnees})[S.tab]();renderDL();renderStatus();window.scrollTo(0,0)}
function renderDL(){const L=lists();const dl=$('#dls');dl.innerHTML='';for(const[k,arr]of Object.entries(L))dl.append(h('datalist',{id:'dl_'+k},arr.map(v=>h('option',{value:v}))))}
function ctxBar(withQuart){return h('div',{class:'ctxbar'},h('div',{class:'seg'},CARRES.map(c=>h('button',{class:S.carre===c?'on':'',onclick:()=>{S.carre=c;saveS();render()}},c))),withQuart?h('div',{class:'seg'},QUARTS.map(q=>h('button',{class:S.quart===q?'on':'',onclick:()=>{S.quart=q;saveS();render()}},q))):null)}
function vPlantes(){
 const subs=[['espece','Espèces'],['arbre','Arbres'],['jeunes','Jeunes plants'],['protegee','Protégées'],['herbier','Herbier'],['carre','Carré']];
 V.append(h('div',{class:'sub'},subs.map(([k,l])=>h('button',{class:S.sub===k?'on':'',onclick:()=>{S.sub=k;saveS();render()}},l))));
 const t=S.sub;const sc=SCH[t];const wq=sc.ctx.includes('quart');
 V.append(ctxBar(wq));
 const ctx={carre:S.carre};if(wq)ctx.quart=S.quart;
 const flt=r=>r.carre===S.carre&&(!wq||r.quart===S.quart||t==='arbre'||t==='herbier'||t==='protegee');
 const draw=(edit)=>{V.querySelectorAll('.dyn').forEach(e=>e.remove());const f=form(t,ctx,edit,()=>draw());f.classList.add('dyn');V.append(f);const l=listView(t,flt,id=>draw(id));l.classList.add('dyn');V.append(l);if(edit)f.scrollIntoView()};
 if(t==='carre'){const ex=live('carre').find(r=>r.carre===S.carre);draw(ex?ex.id:null);return}
 if(t==='espece')V.append(h('p',{class:'help'},'Codes : r = 1 pied, + = quelques pieds, 1 = < 5 %, 2 = 5–25 %, 3 = 25–50 %, 4 = 50–75 %, 5 = > 75 %. Une ligne par espèce et par quart.'));
 if(t==='arbre')V.append(h('p',{class:'help'},'Tour mesuré à 1,30 m, au mètre-ruban. Hauteur au télémètre si le n° finit par 0 ou 5. Le n° suivant est proposé automatiquement.'));
 if(t==='jeunes')V.append(h('p',{class:'help'},'Seulement dans le petit carré 5 × 5 m du coin sud-ouest. Jeunes arbres et arbustes (tour < 15 cm), pas les herbes ni les fougères.'));
 draw(null);
}
// ---- chrono reptiles / minuteurs
function elapsed(s){return (s.acc||0)+(s.run?Date.now()-Date.parse(s.run):0)}
function chrono(s,act){if(!s)return;if(act==='start'||act==='resume'){if(!s.run){s.run=now();if(!s.debut)s.debut=hhmm()}}else if(act==='pause'){if(s.run){s.acc=elapsed(s);s.run=null}}else if(act==='stop'){if(s.run){s.acc=elapsed(s);s.run=null}s.fin=hhmm();s.temps_min=Math.round((s.acc||0)/60000)}put(s)}
const fmt=ms=>{const s=Math.floor(ms/1000);return `${pad(Math.floor(s/60),2)}:${pad(s%60,2)}`};
let TICK;function tick(fn){clearInterval(TICK);TICK=setInterval(fn,1000);fn()}
function sessionPicker(type,key,label){
 const ss=live(type).sort((a,b)=>a.ts<b.ts?1:-1);
 const sel=h('select',{onchange:e=>{S[key]=e.target.value;saveS();render()}},h('option',{value:''},'— choisir —'),ss.map(s=>h('option',{value:s.id,selected:S[key]===s.id},label(s))));
 const add=h('button',{class:'btn2',onclick:()=>{V.querySelectorAll('.dyn').forEach(e=>e.remove());const box=h('div',{class:'card dyn'},h('h3',{},'Nouvelle : '+SESS[type].titre));const rec=newRec(type);const ins={};for(const[k,lab,t,opt]of SESS[type].f){const el=t==='sel'?h('select',{},opt.map(o=>h('option',{value:o},o))):h('input',{type:t==='num'?'number':'text',inputmode:t==='num'?'decimal':null});ins[k]=el;box.append(h('label',{class:'row'},h('span',{class:'lab'},lab),el))}
  if(type==='fo_poste')box.prepend(h('label',{class:'row'},h('span',{class:'lab'},'Poste'),ins.poste=h('select',{},['F1','F2','F3','F4'].map(p=>h('option',{value:p,selected:p===S.poste},p)))));
  if(type==='rep_session')ins.observateurs.value=S.obs;
  box.append(h('button',{class:'btn',onclick:()=>{for(const[k,el]of Object.entries(ins))rec[k]=el.value;if(type==='fo_poste'){S.poste=rec.poste}put(rec);S[key]=rec.id;saveS();render()}},'Créer'));V.append(box)}},'+ Nouvelle');
 return h('div',{class:'card'},h('div',{class:'row'},h('span',{class:'lab'},SESS[type].titre),sel),add);
}
function vReptiles(){
 V.append(h('p',{class:'help'},'Toujours à deux. Le chrono se met en pause pendant la saisie d’un reptile et repart à l’enregistrement.'));
 V.append(sessionPicker('rep_session','rep',s=>`${s.date} – ${s.jour_nuit} – ${s.debut||'non démarrée'}`));
 const s=R[S.rep];if(!s||s.deleted)return;
 const disp=h('div',{class:'chrono'});const st=h('div',{class:'muted'});
 const ctl=h('div',{class:'actions'},h('button',{class:'btn',onclick:()=>{chrono(s,s.run?'pause':'start');render()}},s.run?'⏸ Pause':(s.debut?'▶ Reprendre':'▶ Démarrer')),h('button',{class:'btn3',onclick:()=>{if(confirm('Terminer la session ?')){chrono(s,'stop');render()}}},'⏹ Terminer'));
 V.append(h('div',{class:'card'},h('h3',{},'Temps de recherche'),disp,st,ctl));
 tick(()=>{disp.textContent=fmt(elapsed(s));st.textContent=`Début ${s.debut||'–'}${s.fin?' – fin '+s.fin+' – '+s.temps_min+' min':''}`});
 const showList=()=>{V.querySelectorAll('.dyn').forEach(e=>e.remove());const l=listView('rep_obs',r=>r.session===s.id,id=>draw(id));l.classList.add('dyn');V.append(l)};
 const draw=(edit)=>{V.querySelectorAll('.dyn').forEach(e=>e.remove());if(!edit)chrono(s,'pause');const f=form('rep_obs',{session:s.id},edit,()=>showList());f.classList.add('dyn');V.append(f);const l=listView('rep_obs',r=>r.session===s.id,id=>draw(id));l.classList.add('dyn');V.append(l)};
 V.append(h('button',{class:'btn big',onclick:()=>draw(null)},'🦎 Reptile vu (met le chrono en pause)'));
 const l=listView('rep_obs',r=>r.session===s.id,id=>draw(id));l.classList.add('dyn');V.append(l);
}
function vFourmis(){
 V.append(h('p',{class:'help'},'1 poste = 1 carte thon + 1 carte miel au centre du carré. Pose à 8 h, lecture 1 h après, puis 15 min de recherche à vue.'));
 V.append(sessionPicker('fo_poste','fo',s=>`${s.poste} – ${s.date} – pose ${s.pose||'?'}`));
 const s=R[S.fo];if(!s||s.deleted)return;
 const disp=h('div',{class:'chrono'});
 V.append(h('div',{class:'card'},h('h3',{},`Poste ${s.poste}`),disp,h('div',{class:'actions'},h('button',{class:'btn',onclick:()=>{s.pose=hhmm();s.t0=now();put(s);render()}},s.pose?'Reposer (remet à zéro)':'Appâts posés maintenant'),h('button',{class:'btn2',onclick:()=>{s.lecture=hhmm();put(s);toast('Heure de lecture notée')}},'Lecture commencée'))));
 tick(()=>{if(!s.t0){disp.textContent='Pas encore posé';return}const left=3600000-(Date.now()-Date.parse(s.t0));if(left<=0&&!s._alert){s._alert=1;vibrate();beep();toast('1 heure écoulée : lire le poste')}disp.textContent=left>0?'Lecture dans '+fmt(left):'À lire (posé à '+s.pose+')'});
 const draw=(edit)=>{V.querySelectorAll('.dyn').forEach(e=>e.remove());const f=form('fo_obs',{poste:s.poste,session:s.id},edit,()=>draw());f.classList.add('dyn');V.append(f);const l=listView('fo_obs',r=>r.session===s.id,id=>draw(id));l.classList.add('dyn');V.append(l)};
 draw(null);
}
function vOiseaux(){
 const sub=S.oisub||'point';
 V.append(h('div',{class:'sub'},[['point','Point d’écoute O1'],['nid','Nids et cavités']].map(([k,l])=>h('button',{class:sub===k?'on':'',onclick:()=>{S.oisub=k;saveS();render()}},l))));
 if(sub==='nid'){const draw=(edit)=>{V.querySelectorAll('.dyn').forEach(e=>e.remove());const f=form('oi_nid',{},edit,()=>draw());f.classList.add('dyn');V.append(f);const l=listView('oi_nid',null,id=>draw(id));l.classList.add('dyn');V.append(l)};draw(null);return}
 V.append(h('p',{class:'help'},'Arriver en silence, attendre 1 min, puis Démarrer : 10 min d’écoute, puis 20 min de parcours. Alarme à la fin de chaque phase.'));
 V.append(sessionPicker('oi_session','oi',s=>`${s.date} – passage ${s.passage}`));
 const s=R[S.oi];if(!s||s.deleted)return;
 const disp=h('div',{class:'chrono'});
 V.append(h('div',{class:'card'},h('h3',{},`Passage ${s.passage}`),disp,h('div',{class:'actions'},h('button',{class:'btn',onclick:()=>{s.t0=now();s.debut=hhmm();put(s);render()}},s.t0?'Redémarrer':'▶ Démarrer l’écoute'))));
 tick(()=>{if(!s.t0){disp.textContent='Pas démarré';return}const e=Date.now()-Date.parse(s.t0);if(e<600000)disp.textContent='Écoute : '+fmt(600000-e);else if(e<1800000){if(!s._a1){s._a1=1;vibrate();beep();toast('Fin de l’écoute : parcours 20 min')}disp.textContent='Parcours : '+fmt(1800000-e)}else{if(!s._a2){s._a2=1;vibrate();beep()}disp.textContent='Terminé (début '+s.debut+')'}});
 const draw=(edit)=>{V.querySelectorAll('.dyn').forEach(e=>e.remove());const f=form('oi_contact',{session:s.id},edit,()=>draw());f.classList.add('dyn');V.append(f);const l=listView('oi_contact',r=>r.session===s.id,id=>draw(id));l.classList.add('dyn');V.append(l)};
 draw(null);
}
async function vDonnees(){
 const cnt=t=>live(t).length;
 const recap=h('table',{class:'tb'},h('tr',{},h('th',{},'Fiche'),h('th',{},'Lignes')),...[['carre','Carrés (fiche 0)'],['espece','Espèces (fiche 1)'],['arbre','Arbres (fiche 2)'],['jeunes','Jeunes plants (fiche 3)'],['herbier','Herbier (fiche 4)'],['protegee','Espèces protégées (fiche 5)'],['rep_session','Sessions reptiles'],['rep_obs','Reptiles'],['fo_poste','Postes fourmis'],['fo_obs','Fourmis'],['oi_session','Matins oiseaux'],['oi_contact','Contacts oiseaux'],['oi_nid','Nids et cavités']].map(([t,l])=>h('tr',{},h('td',{},l),h('td',{},String(cnt(t))))));
 const photos=await pAll();const pend=Object.values(R).filter(r=>r.dirty).length,pph=photos.filter(p=>!p.synced).length;
 V.append(h('div',{class:'card'},h('h3',{},'Synchronisation (quand il y a du réseau)'),h('p',{},`À envoyer : ${pend} ligne(s), ${pph} photo(s). Dernière synchro : ${S.lastSync?new Date(S.lastSync).toLocaleString('fr-FR'):'jamais'}.`),h('button',{class:'btn',onclick:()=>sync(true)},'🔄 Synchroniser maintenant'),h('p',{class:'muted'},'Envoie vos saisies et récupère celles des collègues. Sans réseau, tout reste enregistré dans le téléphone.')));
 V.append(h('div',{class:'card'},h('h3',{},'Exporter'),h('div',{class:'actions'},h('button',{class:'btn',onclick:exportXLSX},'📊 Excel pour Neodyme'),h('button',{class:'btn2',onclick:exportPhotos},'🖼 Photos (zip)'),h('button',{class:'btn2',onclick:exportJSON},'💾 Sauvegarde complète')),h('label',{class:'row'},h('span',{class:'lab'},'Importer une sauvegarde (fusion)'),h('input',{type:'file',accept:'.json,application/json',onchange:importJSON}))));
 V.append(h('div',{class:'card'},h('h3',{},'Récapitulatif'),recap));
 V.append(h('div',{class:'card'},h('h3',{},'Réglages'),settingsForm()));
}
function settingsForm(){const sel=h('select',{},h('option',{value:''},'— qui saisit ? —'),PEOPLE.map(p=>h('option',{value:p,selected:S.obs===p},p)));const tk=h('input',{type:'text',value:S.team||'',placeholder:'code équipe',autocapitalize:'characters'});
 return h('div',{},h('label',{class:'row'},h('span',{class:'lab'},'Je suis'),sel),h('label',{class:'row'},h('span',{class:'lab'},'Code équipe (synchronisation)'),tk),h('button',{class:'btn',onclick:()=>{S.obs=sel.value;S.team=tk.value.trim().toUpperCase();saveS();toast('Réglages enregistrés');renderStatus();if(S.obs)render()}},'Enregistrer'),h('p',{class:'muted'},'Appareil : '+S.dev+' – version '+window.APPV));}
function renderStatus(){const pend=Object.values(R).filter(r=>r.dirty).length;$('#st').textContent=`${(S.obs||'?').split(' ')[0]} · ${navigator.onLine?'en ligne':'hors ligne'} · ${pend} à envoyer`;}

/* ===================== SYNCHRO SUPABASE ===================== */
let SYNCING=false;
async function api(path,opt={}){const r=await fetch(SB_URL+'/rest/v1/'+path,{...opt,headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'x-team-key':S.team,'Content-Type':'application/json',...(opt.headers||{})}});if(!r.ok)throw new Error(r.status+' '+(await r.text()).slice(0,120));if(r.status===204||r.status===201)return null;return r.json()}
const strip=r=>{const{dirty,...d}=r;return d};
async function sync(manual){
 if(SYNCING)return;if(!S.team){if(manual)toast('Entrez le code équipe dans Réglages',true);return}
 if(!navigator.onLine){if(manual)toast('Pas de réseau : réessayez plus tard',true);return}
 SYNCING=true;if(manual)toast('Synchronisation…');
 try{
  const dirty=Object.values(R).filter(r=>r.dirty);
  for(let i=0;i<dirty.length;i+=200){const b=dirty.slice(i,i+200).map(r=>({id:r.id,type:r.type,data:strip(r),obs:r.obs,dev:r.dev,ts:r.ts,deleted:!!r.deleted}));await api('releves?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(b)});b.forEach(x=>{if(R[x.id]&&R[x.id].u===x.data.u)delete R[x.id].dirty})}
  saveR();
  const ph=(await pAll()).filter(p=>!p.synced);
  for(const p of ph){await api('photos?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify([{id:p.id,rec_id:p.rec,label:p.label,data:p.data,obs:p.obs,dev:p.dev,ts:p.ts}])});p.synced=true;await pPut(p)}
  let since=S.lastPull||'1970-01-01T00:00:00Z',more=true;
  while(more){const rows=await api(`releves?select=id,data,updated_at&updated_at=gt.${encodeURIComponent(since)}&order=updated_at.asc&limit=1000`);
   for(const x of rows){const loc=R[x.id];if(!loc||(!loc.dirty&&(!loc.u||x.data.u>=loc.u)))R[x.id]=x.data;since=x.updated_at}
   more=rows.length===1000}
  S.lastPull=since;S.lastSync=now();saveR();saveS();
  if(manual){toast('Synchronisé ✔');render()}else renderStatus();
 }catch(e){if(manual)toast('Échec synchro : '+e.message,true)}
 SYNCING=false;
}
setInterval(()=>sync(false),120000);window.addEventListener('online',()=>sync(false));

/* ===================== EXPORTS ===================== */
const COLS={meta:['id','date','heure','observateur','appareil']};
function rowsFor(t){const sc=SCH[t]||SESS[t];const fields=(sc.f||[]).filter(f=>f[2]!=='photo'&&f[2]!=='gps').map(f=>f[0]);
 const ctx=SCH[t]?SCH[t].ctx.filter(c=>c!=='session'):[];const extra={rep_session:['debut','fin','temps_min'],oi_session:['debut'],fo_poste:['poste','pose','lecture'],rep_obs:['session'],oi_contact:['session'],fo_obs:['session']}[t]||[];
 const head=[...COLS.meta,...ctx,...extra,...fields,'lat','lon','precision_m','photos'];
 if(t==='arbre')head.splice(head.indexOf('num')+1,0,'etiquette','diametre_cm','garder_D5');
 const rows=live(t).sort((a,b)=>a.ts<b.ts?-1:1).map(r=>{const o={id:r.id,date:r.date,heure:hhmm(r.ts),observateur:r.obs,appareil:r.dev,lat:r.lat||'',lon:r.lon||'',precision_m:r.prec||'',photos:(r.photos||[]).join(' ')};for(const k of [...ctx,...extra,...fields])o[k]=r[k]===true?'oui':r[k]===false?'':(r[k]??'');if(t==='arbre'){o.etiquette=`${r.carre}-${pad(r.num||0)}${r.tige||''}`;o.diametre_cm=r.tour?+(r.tour/Math.PI).toFixed(1):'';o.garder_D5=r.tour>=5*Math.PI?'oui':'non'}return head.map(k=>o[k]??'')});
 return [head,...rows]}
const SHEETS=[['carre','F0_Carres'],['espece','F1_Especes'],['arbre','F2_Arbres'],['jeunes','F3_Jeunes_plants'],['herbier','F4_Herbier'],['protegee','F5_Protegees'],['rep_session','Reptiles_sessions'],['rep_obs','Reptiles_obs'],['fo_poste','Fourmis_postes'],['fo_obs','Fourmis_obs'],['oi_session','Oiseaux_matins'],['oi_contact','Oiseaux_contacts'],['oi_nid','Nids_cavites']];
function download(blob,name){const a=h('a',{href:URL.createObjectURL(blob),download:name});document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},3000)}
async function shareOrDownload(blob,name){try{const f=new File([blob],name,{type:blob.type});if(navigator.canShare&&navigator.canShare({files:[f]})&&confirm('Partager le fichier (mail, WhatsApp…) ? Annuler = télécharger.')){await navigator.share({files:[f],title:name});return}}catch(e){}download(blob,name)}
const stamp=()=>new Date().toISOString().slice(0,16).replace(/[:T]/g,'-');
async function exportXLSX(){const sheets=SHEETS.map(([t,n])=>[n,rowsFor(t)]);
 const pl=lists().plantes.filter(n=>live('espece').some(r=>r.espece===n));sheets.push(['Liste_especes',[['espece','nb_quarts','carres','protegee'],...pl.map(n=>{const rs=live('espece').filter(r=>r.espece===n);return[n,rs.length,[...new Set(rs.map(r=>r.carre))].join(' '),PROT.some(p=>p[0]===n)?'oui':'']})]]);
 await shareOrDownload(new Blob([xlsx(sheets)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),`EIE_Ouvea_donnees_${stamp()}.xlsx`)}
async function exportJSON(){const photos=await pAll();await shareOrDownload(new Blob([JSON.stringify({v:1,dev:S.dev,obs:S.obs,records:R,photos})],{type:'application/json'}),`EIE_Ouvea_sauvegarde_${S.dev}_${stamp()}.json`)}
async function importJSON(e){const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());let n=0;for(const[id,r]of Object.entries(d.records||{})){if(!R[id]||(r.u||'')>(R[id].u||'')){R[id]={...r,dirty:true};n++}}saveR();for(const p of d.photos||[]){if(!(await pGet(p.id)))await pPut({...p,synced:false})}toast(n+' ligne(s) importée(s)');render()}catch(err){toast('Fichier illisible',true)}}
async function exportPhotos(){let ph=await pAll();if(S.team&&navigator.onLine&&confirm('Télécharger aussi les photos des collègues depuis le serveur ?')){try{toast('Téléchargement…');const rows=await api('photos?select=id,label,data,ts');const ids=new Set(ph.map(p=>p.id));rows.forEach(r=>{if(!ids.has(r.id))ph.push({id:r.id,label:r.label,data:r.data,ts:r.ts})})}catch(e){toast('Serveur : '+e.message,true)}}
 if(!ph.length){toast('Aucune photo');return}
 const files=ph.map(p=>{const b=atob(p.data.split(',')[1]);const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return[`${(p.label||'photo').replace(/[^\w.-]+/g,'_')}_${p.id}.jpg`,u]});
 files.push(['photos_index.csv',new TextEncoder().encode('﻿fichier;fiche_liee;etiquette;date\n'+ph.map(p=>`${(p.label||'photo').replace(/[^\w.-]+/g,'_')}_${p.id}.jpg;${p.rec||''};${p.label||''};${p.ts||''}`).join('\n'))]);
 await shareOrDownload(new Blob([zip(files)],{type:'application/zip'}),`EIE_Ouvea_photos_${stamp()}.zip`)}

/* --- zip (sans compression) + xlsx minimal --- */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u){let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRC[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function zip(files){const enc=new TextEncoder();const parts=[],cen=[];let off=0;
 for(const[name,data0]of files){const data=typeof data0==='string'?enc.encode(data0):data0;const nm=enc.encode(name);const c=crc32(data);
  const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);lh.setUint32(14,c,true);lh.setUint32(18,data.length,true);lh.setUint32(22,data.length,true);lh.setUint16(26,nm.length,true);
  parts.push(new Uint8Array(lh.buffer),nm,data);
  const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint32(16,c,true);ch.setUint32(20,data.length,true);ch.setUint32(24,data.length,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);
  cen.push(new Uint8Array(ch.buffer),nm);off+=30+nm.length+data.length}
 const csz=cen.reduce((a,b)=>a+b.length,0);const end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,csz,true);end.setUint32(16,off,true);
 return new Blob([...parts,...cen,new Uint8Array(end.buffer)])}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'');
function colL(i){let s='';i++;while(i){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s}
function xlsx(sheets){
 const sx=(rows)=>'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'+rows.map((r,i)=>`<row r="${i+1}">`+r.map((v,j)=>{const ref=colL(j)+(i+1);if(typeof v==='number'&&isFinite(v))return`<c r="${ref}"${i===0?' s="1"':''}><v>${v}</v></c>`;if(v===''||v==null)return'';return`<c r="${ref}" t="inlineStr"${i===0?' s="1"':''}><is><t xml:space="preserve">${esc(v)}</t></is></c>`}).join('')+'</row>').join('')+'</sheetData></worksheet>';
 const f=[['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+sheets.map((s,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')+'</Types>'],
  ['_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
  ['xl/workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+sheets.map((s,i)=>`<sheet name="${esc(s[0]).slice(0,31)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')+'</sheets></workbook>'],
  ['xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+sheets.map((s,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')+`<Relationship Id="rId${sheets.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
  ['xl/styles.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>'],
  ...sheets.map((s,i)=>[`xl/worksheets/sheet${i+1}.xml`,sx(s[1])])];
 return zip(f)}

/* ===================== DÉMARRAGE ===================== */
document.querySelectorAll('nav.tabs button').forEach(b=>b.onclick=()=>{S.tab=b.dataset.t;saveS();clearInterval(TICK);render()});
window.addEventListener('online',renderStatus);window.addEventListener('offline',renderStatus);
if(!S.obs){S.tab='donnees';saveS();setTimeout(()=>toast('Choisissez votre nom dans Réglages'),400)}
render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
