const KEY='diario-alergia-v1';
const THEMES={clinical:['Clean Clinical Light','#2f6fb0','#5aa0e6',[22,58,112]],oled:['Dark Mode OLED','#4aa3ff','#7c6bff',[20,26,48]],navy:['Navy Executive','#d9b36c','#16306a',[11,23,48]],emerald:['Emerald Nature','#0f9d74','#35c9a0',[10,92,72]]};
const ACCENTS=[['','Del tema'],['#C5005A','Cherry'],['#0b6b66','Dark Green'],['#65615E','Ash'],['#2b4a85','Navy']];
const GROUPS={resp:'Respiratorio',eye:'Ocular',oral:'Oral / SAO',cut:'Cutáneo',dig:'Digestivo'};
const DEF_SYM={resp:['Congestión nasal','Estornudos','Rinitis','Mucosidad','Picor de garganta'],eye:['Picor','Lagrimeo','Enrojecimiento'],oral:['Picor de lengua','Picor de paladar','Labios inflamados','Disfagia'],cut:['Urticaria por agua','Rojez por roce','Habones','Picor general','Granitos'],dig:['Retortijones','Molestia abdominal','Tránsito rápido']};
const TRIG={food:'Alimento',animal:'Gato / animal',water:'Agua / ducha',rub:'Roce / presión',other:'Otro'};
const PREP={crudo:'Crudo',pelado:'Pelado',cocinado:'Cocinado'},PLACE={ext:'Exterior',int:'Interior',both:'Mixto'};
const INT=['Leve','Suave','Moderado','Fuerte','Severo'],IC=['#2e9e6b','#7fb24a','#d9a21b','#e0742f','#d4493e'];
const MES=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const POL={grass_pollen:['Gramíneas',10,50],olive_pollen:['Olivo',50,200],birch_pollen:['Abedul',20,100],alder_pollen:['Aliso',20,100],mugwort_pollen:['Artemisa',10,50],ragweed_pollen:['Ambrosía',10,50]};
const LV=[['Bajo','#2e9e6b'],['Moderado','#d9a21b'],['Alto','#d4493e']];
let S={entries:[],settings:{name:'Juan Gutiérrez Cerdán',contact:'',theme:'clinical',accent:'',v:3,loc:{name:'Madrid',lat:40.4168,lon:-3.7038},syms:JSON.parse(JSON.stringify(DEF_SYM))}};
function norm(e){if(!e.kind){e.kind=(e.cats&&e.cats.length&&e.cats.every(c=>c==='resp'))?'env':'other';
const t=Array.isArray(e.trig)?e.trig:[];e.trig=t.includes('food')?'food':t.includes('cat')?'animal':t.includes('water')?'water':t.includes('rub')?'rub':t[0]?'other':'';e.prep=e.prep||e.state||''}
e.sym=e.sym||[];e.medName=e.medName||'';e.stress=e.stress||0;return e}
// Importa registros de las versiones anteriores (AlergoTrack .tsx, prototipo Gemini, v1/v2)
function fromLegacy(r){if(r.kind)return norm(r);const id=String(r.id||Date.now()+Math.random()),ts=r.ts||r.date||new Date().toISOString();
const P={Exterior:'ext',Interior:'int',Mixto:'both',exterior:'ext',interior:'int',mixto:'both'},T={'Alimento':'food','Agua / Ducha':'water','Roce / Presión':'rub','Epitelio (Gato)':'animal',alimento:'food',piel:'rub',agua:'water',gato:'animal'};
if(r.data){const d=r.data,env=r.type==='ambiental',i=env?Math.max(d.respiratory||0,d.ocular||0):(d.intensity||0);
return norm({id,ts,kind:env?'env':'other',int:i||1,resp:d.respiratory||0,eye:d.ocular||0,fat:0,place:P[d.context]||'',locName:'',med:!!d.antiH,medName:d.antiHName||'',
sym:env?d.specificSymptoms||[]:d.symptoms||[],trig:env?'':(T[d.trigger]||'other'),food:'',prep:env?'':(d.trigger==='Alimento'?(d.foodPrep||'').toLowerCase():''),stress:d.stress||0,notes:d.notes||''})}
const env=r.type==='ambiental';return norm({id,ts,kind:env?'env':'other',int:r.intensity||1,resp:env?r.intensity||0:0,eye:0,fat:env?r.fatigue||0:0,place:P[r.context]||'',locName:'',med:!!r.tookMeds,medName:'',
sym:r.symptoms||[],trig:env?'':(T[r.triggerType]||'other'),food:'',prep:'',stress:env?0:r.stressLevel||0,notes:r.notes||''})}
try{const x=JSON.parse(localStorage.getItem(KEY));if(x){S={...S,...x,settings:{...S.settings,...x.settings}};const sy={...DEF_SYM,...(x.settings&&x.settings.syms)};
if(!(x.settings&&x.settings.v>=3)){Object.keys(DEF_SYM).forEach(g=>DEF_SYM[g].forEach(s=>{if(!sy[g].includes(s))sy[g].push(s)}));S.settings.v=3}
S.settings.syms=sy;S.entries=(x.entries||[]).map(norm)}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const symName=s=>String(s).split('|').pop();
function symTxt(e){const s=(e.sym||[]).map(symName).join(', ');if(e.kind==='env'){const l=[e.resp&&'Resp. '+e.resp+'/5',e.eye&&'Ocular '+e.eye+'/5',e.fat&&'Fatiga '+e.fat+'/5'].filter(Boolean).join(' · ');return[s,l].filter(Boolean).join(' — ')||'—'}return s||'—'}
function trigTxt(e){if(e.kind==='env')return[PLACE[e.place]||'',e.locName||''].filter(Boolean).join(', ')||'Ambiental';
return(TRIG[e.trig]||'Sin desencadenante')+(e.trig==='food'&&e.food?': '+e.food:'')+(e.prep?' ('+PREP[e.prep].toLowerCase()+')':'')}
function monthStats(E){const m=Array.from({length:12},()=>({n:0,s:0,env:0,oth:0,med:0}));E.forEach(e=>{const k=new Date(e.ts).getMonth();m[k].n++;m[k].s+=e.int||0;e.kind==='env'?m[k].env++:m[k].oth++;if(e.med)m[k].med++});return m}
function importData(j){const a=Array.isArray(j)?j:(j.entries||j.records);if(!Array.isArray(a))throw 0;const have=new Set(S.entries.map(e=>e.id));let n=0;
a.forEach(r=>{const e=fromLegacy(r);if(!have.has(e.id)){S.entries.push(e);have.add(e.id);n++}});
if(j.settings)S.settings={...S.settings,...j.settings,syms:{...S.settings.syms,...(j.settings.syms||{})}};
if(j.patientName&&!S.settings.name)S.settings.name=j.patientName;if(j.location&&j.location.lat)S.settings.loc=j.location;save();return n}
