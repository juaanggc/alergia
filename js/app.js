const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const loc=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,16);
const fd=iso=>new Date(iso).toLocaleString('es-ES',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
const ICO={home:'<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',hist:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',rep:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6"/>',set:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6"/>'};
let tab='home',H='all',RF='all',RK='365',EL=false,POLLEN=null,edit=null,F,PEND=null,R={from:loc(new Date(Date.now()-365*864e5)).slice(0,10),to:loc(new Date()).slice(0,10)};
const newF=k=>({kind:k||(F&&F.kind)||'env',when:loc(new Date()),resp:0,eye:0,fat:0,place:'',locName:S.settings.loc.name,med:false,medName:'',sym:[],trig:'',food:'',prep:'',int:0,stress:0,notes:''});F=newF('env');
const first=()=>(S.settings.name||'').trim().split(/\s+/)[0]||'';
const ch=(items,sel,act)=>items.map(([k,l])=>`<button type="button" class="chip ${sel.includes(k)?'on':''}" data-a="${act}" data-k="${esc(k)}">${esc(l)}</button>`).join('');
const sc=(v,act)=>`<div class="scale">${[1,2,3,4,5].map(n=>`<button type="button" style="--c:${IC[n-1]}" class="${v===n?'on':''}" data-a="${act}" data-k="${n}"><i style="background:${IC[n-1]}"></i>${n}<small>${INT[n-1]}</small></button>`).join('')}</div>`;
const symG=g=>`<div class="row">${ch(S.settings.syms[g].map(x=>[g+'|'+x,x]),F.sym,'sym')}<button type="button" class="chip add" data-a="addsym" data-k="${g}" data-x="log">+ Añadir</button></div>`;
function theme(){const s=S.settings,r=document.documentElement;r.dataset.t=s.theme;
if(s.accent){r.style.setProperty('--ac',s.accent);r.style.setProperty('--ac2',`color-mix(in srgb,${s.accent} 68%,#fff)`);r.style.setProperty('--acs',`color-mix(in srgb,${s.accent} 15%,transparent)`);r.style.setProperty('--on','#fff')}else['--ac','--ac2','--acs','--on'].forEach(p=>r.style.removeProperty(p));
const m=document.querySelector('meta[name=theme-color]');if(m)m.content=s.accent||THEMES[s.theme][1]}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),2200)}
function sheet(h,tall){$('#layer').innerHTML=`<div class="ov" data-a="close" data-bg="1"><div class="sheet ${tall?'tall':''}">${h}</div></div>`}
const closeSheet=()=>$('#layer').innerHTML='';
function ask(t,ok,fn){PEND=fn;sheet(`<h2>${esc(t)}</h2><button class="btn d" style="margin-top:0" data-a="yes">${ok}</button><button class="btn g" data-a="close">Cancelar</button>`)}
function done(){const e=document.createElement('div');e.className='done';e.innerHTML='<div><svg width="46" height="46" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>';document.body.append(e);if(navigator.vibrate)navigator.vibrate(15);setTimeout(()=>e.remove(),1100)}

/* ---------- INICIO ---------- */
const lvl=(k,v)=>v==null?-1:v<POL[k][1]?0:v<POL[k][2]?1:2;
async function loadPollen(){const l=S.settings.loc;
try{const j=await(await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${l.lat}&longitude=${l.lon}&hourly=${Object.keys(POL).join(',')}&timezone=auto&forecast_days=2`)).json(),h=j.hourly,today=loc(new Date()).slice(0,10),now=loc(new Date()).slice(0,13),out={};
Object.keys(POL).forEach(k=>{const v=h[k]||[],d=h.time.map((t,i)=>[t,v[i]]).filter(x=>x[0].startsWith(today)&&x[1]!=null).map(x=>x[1]),i=h.time.findIndex(t=>t.startsWith(now));out[k]={now:i<0?null:v[i],max:d.length?Math.max(...d):null}});POLLEN={at:Date.now(),v:out}}catch(e){POLLEN={err:1}}if(tab==='home')render()}
function advice(){const g=lvl('grass_pollen',POLLEN.v.grass_pollen.max),o=lvl('olive_pollen',POLLEN.v.olive_pollen.max);
return g===2?'Riesgo alto de gramíneas: cuidado con frutas crudas sin pelar y frutos secos. Mejor pelar o cocinar; evita el césped.':g===1?'Riesgo moderado de gramíneas: precaución con frutas crudas con piel. Ducha y cambio de ropa al volver a casa.':o===2?'Riesgo alto de olivo: posible mayor reactividad oral con crudos.':'Niveles bajos hoy. Mantén tus precauciones habituales.'}
function pollenCard(){const P=POLLEN,l=S.settings.loc;let b='<p class="sub">Cargando datos…</p>';
if(P&&P.err)b='<p class="sub">No se pudieron cargar los datos. Comprueba la conexión.</p>';
else if(P){const rows=Object.entries(POL).map(([k,v])=>[k,v[0],P.v[k]]).sort((a,b)=>(b[2].max||0)-(a[2].max||0)),w=Math.max(0,...rows.map(r=>lvl(r[0],r[2].max)));
b=`<div class="lv" style="--c:${LV[w][1]}"><span class="big"></span><div><b>Riesgo ${LV[w][0].toLowerCase()} hoy</b><div class="sub">${esc(advice())}</div></div></div>`+rows.map(([k,n,v])=>{const L=lvl(k,v.max);return`<div style="margin-bottom:12px"><div class="row" style="justify-content:space-between"><span>${n}</span><span class="sub">${v.max==null?'sin datos':'máx. '+Math.round(v.max)+' · ahora '+(v.now==null?'–':Math.round(v.now))+' gr/m³'}</span></div><div class="bar"><i style="width:${v.max==null?0:Math.min(100,v.max/POL[k][2]*50)}%;background:${L<0?'var(--ln)':LV[L][1]}"></i></div></div>`}).join('')+'<p class="sub">Fuente: Open-Meteo (CAMS, solo Europa). Umbrales orientativos; no incluye plátano de sombra.</p>'}
return `<div class="card"><button type="button" class="link" style="padding:0;margin-bottom:14px;font-size:15px;font-weight:650;color:var(--tx)" data-a="eloc">📍 ${esc(l.name)} ✎</button>
${EL?`<div class="split" style="margin-bottom:12px"><input id="city" placeholder="Buscar ciudad…" autocomplete="off"><button class="btn" style="margin:0" data-a="geo">Buscar</button></div><div class="row" id="res" style="margin-bottom:14px"></div>`:''}${b}</div>`}
function weekData(){return Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const k=loc(d).slice(0,10),L=S.entries.filter(e=>loc(new Date(e.ts)).slice(0,10)===k);return{l:'DLMXJVS'[d.getDay()],v:L.length?Math.max(1,...L.map(e=>e.int||0)):0}})}
function vHome(){const n=new Date(),E=S.entries,mo=E.filter(e=>{const d=new Date(e.ts);return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()}).length,
wk=E.filter(e=>Date.now()-new Date(e.ts)<7*864e5),sev=wk.filter(e=>e.int>=4).length,last=E.length?Math.floor((Date.now()-Math.max(...E.map(e=>+new Date(e.ts))))/864e5):null,W=weekData(),dw=W.filter(x=>x.v).length;
return `<p class="sub date">${n.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</p><h1 style="font-size:34px;margin-bottom:4px">Hola${first()?', <span class="gt">'+esc(first())+'</span>':''}</h1><p class="sub mb">Resumen clínico y estado actual</p>
<div class="stats"><div class="card st"><small>Este mes</small><b>${mo}</b></div><div class="card st"><small>7 días</small><b>${wk.length}</b><small>${sev} severos</small></div><div class="card st"><small>Último</small><b>${last===null?'–':last}</b><small>${last===null?'':'días atrás'}</small></div></div>
${pollenCard()}
<div class="card"><div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 style="margin:0">Tendencia semanal</h2><span class="sub">${dw} días con síntomas</span></div><div class="wk">${W.map(x=>`<div><i style="--c:${x.v?IC[x.v-1]:'var(--ln)'};height:${x.v?Math.round(x.v/5*72)+8:4}px"></i>${x.l}</div>`).join('')}</div></div>
<h2 style="margin:22px 0 12px;font-size:18px">Clínica y estilo de vida</h2><div class="lib">${ARTICLES.map(a=>`<button type="button" class="art" data-a="art" data-k="${a.id}"><span class="cov" style="--a:${a.c[0]};--b:${a.c[1]}">${a.e}</span><span class="at">${esc(a.t)}</span><span class="sub">${esc(a.s)}</span></button>`).join('')}</div>`}
function article(id){const a=ARTICLES.find(x=>x.id==id);sheet(`<div class="cov big" style="--a:${a.c[0]};--b:${a.c[1]}">${a.e}</div><h2 style="font-size:22px;line-height:1.25">${esc(a.t)}</h2>`+a.b.map(([t,x])=>t==='h'?`<h3>${esc(x)}</h3>`:t==='p'?`<p>${esc(x)}</p>`:`<ul>${x.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`).join('')+'<p class="sub">Información divulgativa; no sustituye el consejo de tu alergólogo.</p><button class="btn g" data-a="close">Cerrar</button>',1)}

/* ---------- REGISTRAR ---------- */
function vLog(){const env=F.kind==='env';
const E=`<div class="card"><label class="f">Afectación respiratoria</label>${sc(F.resp,'resp')}<div style="height:12px"></div>${symG('resp')}
<label class="f">Afectación ocular</label>${sc(F.eye,'eye')}<div style="height:12px"></div>${symG('eye')}
<label class="f">Fatiga o malestar general</label>${sc(F.fat,'fat')}</div>
<div class="card"><label class="f">Contexto</label><div class="row">${ch(Object.entries(PLACE),[F.place],'place')}</div><label class="f">Ubicación</label><input id="locName" value="${esc(F.locName)}" placeholder="Ciudad o lugar" autocomplete="off"></div>`;
const O=`<div class="card"><label class="f">Desencadenante</label><div class="row">${ch(Object.entries(TRIG),[F.trig],'trig')}</div>
${F.trig==='food'?`<label class="f">Alimento y preparación</label><input id="food" value="${esc(F.food)}" placeholder="Ej.: manzana, melocotón, nueces" autocomplete="off"><div class="row" style="margin-top:10px">${ch(Object.entries(PREP),[F.prep],'prep')}</div>`:''}</div>
<div class="card">${['oral','cut','dig'].map(g=>`<label class="f">${GROUPS[g]}</label>${symG(g)}`).join('')}<label class="f">Gravedad de la reacción</label>${sc(F.int,'int')}<label class="f">Estrés / ansiedad hoy (opcional)</label>${sc(F.stress,'stress')}</div>`;
const warn=(env?F.resp>=5:F.int>=5)?'<div class="note">Si notas dificultad para respirar, hinchazón de lengua o garganta, o mareo, llama al <b>112</b> o acude a urgencias.</div>':'';
return `<p class="sub">${edit?'Modo edición':'¿Cómo te encuentras?'}</p><h1 class="mb">${edit?'Editar registro':'Nuevo registro'}</h1>
<div class="seg" style="--i:${env?0:1}"><button type="button" class="${env?'on':''}" data-a="kind" data-k="env">Ambiental / Polen</button><button type="button" class="${env?'':'on'}" data-a="kind" data-k="other">Otras alergias</button></div>${env?E:O}${warn}
<div class="card"><button type="button" class="sw ${F.med?'on':''}" data-a="med"><span>Medicación de rescate<br><span class="sub">Antihistamínico u otra</span></span><span class="k"></span></button>${F.med?`<input id="medName" value="${esc(F.medName)}" placeholder="Fármaco y dosis (ej. Ebastina 20 mg)" style="margin-top:12px" autocomplete="off">`:''}
<label class="f">Fecha y hora</label><input type="datetime-local" id="when" value="${F.when}"><label class="f">Notas adicionales</label><textarea id="notes" rows="5" placeholder="Duración, actividad, cómo evolucionó…">${esc(F.notes)}</textarea></div>
<button class="btn" data-a="save">${edit?'Guardar cambios':'Guardar registro'}</button>${edit?'<button class="btn g" data-a="cancel">Cancelar edición</button>':''}`}

/* ---------- HISTORIAL ---------- */
function vHist(){const L=S.entries.filter(e=>H==='all'||e.kind===H).sort((a,b)=>b.ts.localeCompare(a.ts));
return `<h1>Historial</h1><p class="sub mb">${L.length} registros</p><div class="row mb">${ch([['all','Todos'],['env','Ambiental'],['other','Otras']],[H],'flt')}</div>`+(L.length?`<div class="card">${L.map(e=>`<div class="ent"><i style="--c:${IC[(e.int||1)-1]}"></i><div class="b"><div class="t"><span><span class="tag">${e.kind==='env'?'Ambiental':'Otra'}</span>${fd(e.ts)}</span><span>${e.int?INT[e.int-1]:'—'}<button class="link" data-a="edit" data-k="${e.id}">Editar</button><button class="link r" data-a="del" data-k="${e.id}">Borrar</button></span></div>
<div style="margin-top:4px">${esc(symTxt(e))}</div><div class="sub">${esc(trigTxt(e))}${e.stress?' · Estrés '+e.stress+'/5':''}${e.med?' · '+esc(e.medName||'Medicación'):''}${e.notes?' · '+esc(e.notes):''}</div></div></div>`).join('')}</div>`:'<div class="card sub">Sin registros todavía.</div>')}

/* ---------- INFORMES ---------- */
const inR=e=>{const t=new Date(e.ts);return t>=new Date(R.from+'T00:00')&&t<=new Date(R.to+'T23:59:59')};
const selE=()=>S.entries.filter(e=>inR(e)&&(RF==='all'||e.kind===RF));
function vRep(){const E=selE(),ms=monthStats(E),mx=Math.max(1,...ms.map(x=>x.n)),env=E.filter(e=>e.kind==='env').length;
return `<h1>Informes</h1><p class="sub mb">Página 1: resumen mensual · Páginas 2+: detalle cronológico</p><div class="card"><label class="f">Periodo</label><div class="row">${ch([['30','30 días'],['90','3 meses'],['365','12 meses'],['0','Todo']],[RK],'rng')}</div>
<div class="split" style="margin-top:12px"><div><label class="f" style="margin-top:0">Desde</label><input type="date" id="from" value="${R.from}"></div><div><label class="f" style="margin-top:0">Hasta</label><input type="date" id="to" value="${R.to}"></div></div>
<label class="f">Tipo de alergia</label><div class="row">${ch([['all','Todas'],['env','Ambientales'],['other','Otras']],[RF],'rf')}</div>
<label class="f">Vista previa por meses · ${E.length} registros (${env} ambientales, ${E.length-env} otras)</label><div class="mon">${ms.map((x,i)=>`<div><i style="--c:${x.n?IC[Math.min(4,Math.max(0,Math.round(x.s/x.n)-1))]:'var(--ln)'};height:${x.n?Math.max(6,Math.round(x.n/mx*64)):3}px"></i>${MES[i][0]}</div>`).join('')}</div>
${S.settings.name?'':'<p class="sub" style="margin-top:12px">Añade tu nombre en Ajustes para la cabecera.</p>'}<div style="height:14px"></div><button class="btn" data-a="pdf" ${E.length?'':'disabled'}>Generar PDF</button></div>`}

/* ---------- AJUSTES ---------- */
function vSet(){const s=S.settings;return `<h1>Ajustes</h1><p class="sub mb">Todo se guarda solo en este dispositivo.</p>
<div class="card"><label class="f">Nombre del paciente</label><input id="name" value="${esc(s.name)}" autocomplete="name"><label class="f">Datos de contacto (para el PDF)</label><input id="contact" value="${esc(s.contact)}" placeholder="Teléfono · email" autocomplete="off"></div>
<div class="card"><h2>Tema visual</h2><div class="th">${Object.entries(THEMES).map(([k,[n,a,b]])=>`<button type="button" class="${s.theme===k?'on':''}" data-a="theme" data-k="${k}"><i style="background:linear-gradient(135deg,${a},${b})"></i>${n}</button>`).join('')}</div>
<label class="f">Color de acento</label><div class="row">${ch(ACCENTS,[s.accent||''],'accent')}</div></div>
<div class="card"><h2>Síntomas frecuentes</h2>${Object.entries(GROUPS).map(([g,n])=>`<label class="f">${n}</label><div class="row">${s.syms[g].map(x=>`<button type="button" class="chip x" data-a="rmsym" data-k="${esc(g+'|'+x)}">${esc(x)}<b>×</b></button>`).join('')}<button type="button" class="chip add" data-a="addsym" data-k="${g}">+ Añadir</button></div>`).join('')}<button class="btn g" data-a="rst">Restaurar lista por defecto</button></div>
<div class="card"><h2>Copia de seguridad</h2><p class="sub" style="margin-bottom:10px">Importa también copias de AlergoTrack y de las versiones anteriores.</p><button class="btn g" style="margin-top:0" data-a="exp">Exportar JSON</button><button class="btn g" data-a="imp">Importar JSON</button><input type="file" id="file" accept=".json" hidden><button class="btn d" data-a="wipe">Borrar todos los registros</button></div>`}

/* ---------- RENDER / EVENTOS ---------- */
function render(anim){theme();const v=$('#v');v.classList.remove('view');if(anim){void v.offsetWidth;v.classList.add('view')}
v.innerHTML={home:vHome,log:vLog,hist:vHist,rep:vRep,set:vSet}[tab]();
const B=(k,l)=>`<button class="${tab===k?'on':''}" data-a="tab" data-k="${k}" aria-label="${l}"><svg viewBox="0 0 24 24">${ICO[k]}</svg>${l}</button>`;
$('#nav').innerHTML=B('home','Inicio')+B('hist','Historial')+`<button class="fab ${tab==='log'?'on':''}" data-a="tab" data-k="log" aria-label="Registrar"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>`+B('rep','Informes')+B('set','Ajustes')}
const tog=(a,k)=>{const i=a.indexOf(k);i<0?a.push(k):a.splice(i,1)};
document.addEventListener('input',e=>{const t=e.target;if(tab==='log'&&['when','notes','food','locName','medName'].includes(t.id))F[t.id]=t.value;
else if(t.id==='name'||t.id==='contact'){S.settings[t.id]=t.value.trim();save()}});
document.addEventListener('change',e=>{const t=e.target;if(t.id==='from'||t.id==='to'){R[t.id]=t.value;RK='';render()}
else if(t.id==='file'&&t.files[0])t.files[0].text().then(x=>{try{const n=importData(JSON.parse(x));render();toast(n+' registros importados')}catch(e){toast('Archivo no válido')}t.value=''})});
document.addEventListener('click',async ev=>{const b=ev.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,k=b.dataset.k;
if(b.dataset.bg&&ev.target!==b)return;
if(a==='close'){closeSheet();return}
if(a==='yes'){const f=PEND;PEND=null;closeSheet();f&&f();return}
if(a==='tab'){tab=k;if(k!=='log'&&edit){edit=null;F=newF()}render(1);window.scrollTo(0,0);if(k==='home'&&(!POLLEN||POLLEN.err||Date.now()-POLLEN.at>9e5))loadPollen();return}
if(a==='art'){article(k);return}
if(a==='kind'){F.kind=k}else if(['resp','eye','fat','int','stress'].includes(a))F[a]=F[a]===+k?0:+k;
else if(a==='place'||a==='prep')F[a]=F[a]===k?'':k;else if(a==='trig'){F.trig=F.trig===k?'':k;if(F.trig!=='food'){F.prep='';F.food=''}}
else if(a==='med')F.med=!F.med;else if(a==='sym')tog(F.sym,k);else if(a==='flt')H=k;else if(a==='rf')RF=k;
else if(a==='rng'){RK=k;const t=new Date();R.to=loc(t).slice(0,10);R.from=+k?loc(new Date(Date.now()-k*864e5)).slice(0,10):(S.entries.length?S.entries.map(e=>e.ts).sort()[0].slice(0,10):R.to)}
else if(a==='eloc')EL=!EL;
else if(a==='addsym'){const x=b.dataset.x||'';sheet(`<h2>Nuevo síntoma · ${GROUPS[k]}</h2><input id="sh" maxlength="40" placeholder="Nombre del síntoma" autocomplete="off"><div style="height:8px"></div><button class="btn" data-a="addok" data-k="${k}" data-x="${x}">Añadir</button><button class="btn g" data-a="close">Cancelar</button>`);setTimeout(()=>{const i=$('#sh');i&&i.focus()},350);return}
else if(a==='addok'){const v=($('#sh').value||'').trim();if(!v)return;const L=S.settings.syms[k];if(!L.includes(v))L.push(v);if(b.dataset.x==='log'&&!F.sym.includes(k+'|'+v))F.sym.push(k+'|'+v);save();closeSheet()}
else if(a==='rmsym'){const[g,n]=k.split('|');S.settings.syms[g]=S.settings.syms[g].filter(x=>x!==n);save()}
else if(a==='rst')ask('¿Restaurar las listas de síntomas?','Restaurar',()=>{S.settings.syms=JSON.parse(JSON.stringify(DEF_SYM));save();render()});
else if(a==='theme'){S.settings.theme=k;save()}else if(a==='accent'){S.settings.accent=k;save()}
else if(a==='save'){const env=F.kind==='env';if(env)F.int=Math.max(F.resp,F.eye,F.fat);
if(env?!F.int&&!F.sym.length:!F.trig&&!F.sym.length)return toast(env?'Indica algún nivel de afectación':'Elige un desencadenante o síntoma');
if(!F.int)return toast(env?'Indica algún nivel de afectación':'Indica la gravedad');
const p=POLLEN&&!POLLEN.err?{grass:POLLEN.v.grass_pollen.max,olive:POLLEN.v.olive_pollen.max}:null,o=edit&&S.entries.find(x=>x.id===edit);
const e={...F,id:edit||String(Date.now()),ts:new Date(F.when||Date.now()).toISOString(),food:F.food.trim(),notes:F.notes.trim(),medName:F.med?F.medName.trim():'',locName:env?F.locName.trim():'',pollen:(o&&o.pollen)||p};delete e.when;
if(env){e.trig='';e.food='';e.prep='';e.stress=0}else{e.resp=e.eye=e.fat=0;e.place=''}
if(o)S.entries[S.entries.indexOf(o)]=e;else S.entries.push(e);save();edit=null;F=newF();done();if(!POLLEN)loadPollen()}
else if(a==='cancel'){edit=null;F=newF()}
else if(a==='edit'){const e=S.entries.find(x=>x.id===k);edit=k;F={...newF(e.kind),...e,when:loc(new Date(e.ts)),sym:[...(e.sym||[])],locName:e.locName||'',food:e.food||'',prep:e.prep||'',trig:e.trig||'',notes:e.notes||'',medName:e.medName||'',resp:e.resp||0,eye:e.eye||0,fat:e.fat||0,stress:e.stress||0};tab='log';render(1);window.scrollTo(0,0);return}
else if(a==='del'){ask('¿Borrar este registro?','Borrar',()=>{S.entries=S.entries.filter(x=>x.id!==k);save();render()});return}
else if(a==='geo'){const q=$('#city').value.trim();if(!q)return;try{const r=await(await fetch('https://geocoding-api.open-meteo.com/v1/search?count=5&language=es&name='+encodeURIComponent(q))).json();
$('#res').innerHTML=(r.results||[]).map(c=>`<button type="button" class="chip" data-a="setloc" data-k="${esc(JSON.stringify([c.name+(c.admin1?', '+c.admin1:''),c.latitude,c.longitude]))}">${esc(c.name)}${c.admin1?', '+esc(c.admin1):''} (${esc(c.country_code||'')})</button>`).join('')||'<span class="sub">Sin resultados</span>'}catch(e){toast('Sin conexión')}return}
else if(a==='setloc'){const[n,la,lo]=JSON.parse(k);S.settings.loc={name:n,lat:la,lon:lo};F.locName=n;EL=false;save();POLLEN=null;loadPollen()}
else if(a==='pdf'){try{buildPdf(S,selE(),R,RF)}catch(e){console.error(e);toast('No se pudo generar el PDF')}return}
else if(a==='exp'){const l=document.createElement('a');l.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'}));l.download='diario-alergia-'+new Date().toISOString().slice(0,10)+'.json';l.click();return}
else if(a==='imp'){$('#file').click();return}
else if(a==='wipe'){ask('Se borrarán todos los registros clínicos','Borrar todo',()=>{S.entries=[];save();render();toast('Registros borrados')});return}
render()});
render(1);loadPollen();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
