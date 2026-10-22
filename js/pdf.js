function buildPdf(S,E,R,FK){
const {jsPDF}=window.jspdf,d=new jsPDF({unit:'mm',format:'a4'}),W=210,m=15,s=S.settings;
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),NAVY=s.accent?hex(s.accent):THEMES[s.theme][3],AC=[47,111,176];
const fd=(x,t)=>new Date(x).toLocaleString('es-ES',t?{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}:{day:'2-digit',month:'2-digit',year:'numeric'});
E=[...E].sort((a,b)=>a.ts.localeCompare(b.ts));const n=E.length,ms=monthStats(E),env=E.filter(e=>e.kind==='env').length,oth=n-env,med=E.filter(e=>e.med).length;
const ints=E.map(e=>e.int).filter(Boolean),avg=ints.length?ints.reduce((a,b)=>a+b,0)/ints.length:0;
let pk=0;ms.forEach((x,i)=>{if(x.n>ms[pk].n||(x.n===ms[pk].n&&x.s>ms[pk].s))pk=i});
const MN=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],FL={all:'Todas',env:'Solo ambientales',other:'Solo otras'}[FK||'all'];
// Cabecera
d.setFillColor(...NAVY).rect(0,0,W,44,'F');d.setTextColor(255).setFont('helvetica','normal').setFontSize(9).text('INFORME CLÍNICO DE ALERGIA',m,13);
d.setFont('helvetica','bold').setFontSize(21).text(s.name||'Paciente',m,25);
d.setFont('helvetica','normal').setFontSize(9.5).text(s.contact||'Contacto: —',m,32).text(`Periodo: ${fd(R.from+'T00:00')} a ${fd(R.to+'T00:00')}   ·   Tipo: ${FL}   ·   Generado: ${fd(new Date())}`,m,38);
// Métricas
const box=[['Total de crisis',String(n)],['Mes con mayor pico',n?MN[pk]:'—'],['Ambientales',n?Math.round(env/n*100)+'%':'—'],['Alimento / piel / otras',n?Math.round(oth/n*100)+'%':'—']],bw=(W-2*m-9)/4;
box.forEach(([l,v],i)=>{const x=m+i*(bw+3);d.setFillColor(243,247,252).setDrawColor(222,230,240).roundedRect(x,52,bw,22,3,3,'FD');d.setTextColor(100,115,135).setFontSize(8).text(l,x+4,59);d.setTextColor(...NAVY).setFont('helvetica','bold').setFontSize(i===1?13:17).text(v,x+4,69);d.setFont('helvetica','normal')});
d.setTextColor(70).setFontSize(9).text(`Intensidad media: ${avg?avg.toFixed(1)+'/5':'—'}   ·   Medicación de rescate: ${med} registros${n?' ('+Math.round(med/n*100)+'%)':''}`,m,81);
// Gráfica
d.setTextColor(...NAVY).setFont('helvetica','bold').setFontSize(11).text('Estacionalidad: frecuencia e intensidad por mes',m,91);
d.setFont('helvetica','normal').setFontSize(8).setTextColor(110).text('Altura = nº de registros. Color = intensidad media, de verde (leve) a rojo (severo). Suma de todos los años del periodo.',m,96);
const cx=m,cw=W-2*m,base=140,ch=36,mx=Math.max(1,...ms.map(x=>x.n)),sl=cw/12;d.setDrawColor(225).line(cx,base,cx+cw,base);
ms.forEach((x,i)=>{const h=x.n/mx*ch,a=x.n?x.s/x.n:0,c=a?hex(IC[Math.min(4,Math.max(0,Math.round(a)-1))]):[225,230,236];
d.setFillColor(...c).roundedRect(cx+i*sl+sl*.18,base-Math.max(h,.8),sl*.64,Math.max(h,.8),1,1,'F');
d.setTextColor(90).setFontSize(8).text(MES[i],cx+i*sl+sl/2,base+5,{align:'center'});if(x.n)d.setTextColor(...NAVY).setFont('helvetica','bold').text(String(x.n),cx+i*sl+sl/2,base-h-1.5,{align:'center'}).setFont('helvetica','normal')});
// Matriz
d.autoTable({startY:149,head:[['',...MES]],body:[['Registros',...ms.map(x=>x.n||'·')],['Intens. media',...ms.map(x=>x.n?(x.s/x.n).toFixed(1):'·')],['Ambiental',...ms.map(x=>x.env||'·')],['Otras',...ms.map(x=>x.oth||'·')],['Rescate',...ms.map(x=>x.med||'·')]],
styles:{fontSize:8.5,halign:'center',cellPadding:2,lineColor:[225,230,236],lineWidth:.2},headStyles:{fillColor:NAVY},columnStyles:{0:{halign:'left',fontStyle:'bold',cellWidth:26}},margin:{left:m,right:m},theme:'grid',
didParseCell:h=>{if(h.section!=='body'||h.column.index<1)return;const x=ms[h.column.index-1];
if(h.row.index===0&&x.n){const v=x.n/mx;h.cell.styles.fillColor=[255-Math.round(v*170),255-Math.round(v*110),255-Math.round(v*40)]}
if(h.row.index===1&&x.n){const a=x.s/x.n;h.cell.styles.fontStyle='bold';if(a<=1.5){h.cell.styles.fillColor=[220,252,231];h.cell.styles.textColor=[21,128,61]}else if(a<=3){h.cell.styles.fillColor=[254,240,138];h.cell.styles.textColor=[161,98,7]}else{h.cell.styles.fillColor=[254,202,202];h.cell.styles.textColor=[185,28,28]}}}});
let y=d.lastAutoTable.finalY+8;
// Resumen clínico: síntomas y SAO
const cnt={};E.forEach(e=>(e.sym||[]).forEach(x=>{const k=symName(x);cnt[k]=(cnt[k]||0)+1}));const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,5);
if(top.length){d.setFont('helvetica','bold').setFontSize(9.5).setTextColor(...NAVY).text('Síntomas más frecuentes',m,y);d.setFont('helvetica','normal').setFontSize(9).setTextColor(60).text(top.map(x=>`${x[0]} (${x[1]})`).join('  ·  '),m,y+5,{maxWidth:W-2*m});y+=12}
const fo={};E.filter(e=>e.kind==='other'&&e.trig==='food'&&e.food).forEach(e=>{const k=e.food.toLowerCase(),o=fo[k]=fo[k]||{crudo:0,pelado:0,cocinado:0,'':0};o[e.prep||'']++});
const fr=Object.entries(fo).sort((a,b)=>Object.values(b[1]).reduce((p,q)=>p+q)-Object.values(a[1]).reduce((p,q)=>p+q)),rows=Math.min(fr.length,Math.floor((283-y-14)/6.2));
if(rows>0){d.setFont('helvetica','bold').setFontSize(9.5).setTextColor(...NAVY).text('Alimentos asociados a síntomas (SAO): episodios según preparación',m,y);
d.autoTable({startY:y+2,head:[['Alimento','Crudo','Pelado','Cocinado','Sin indicar']],body:fr.slice(0,rows).map(([k,v])=>[k,v.crudo||'·',v.pelado||'·',v.cocinado||'·',v['']||'·']),styles:{fontSize:8,cellPadding:1.4,halign:'center'},columnStyles:{0:{halign:'left'}},headStyles:{fillColor:NAVY},margin:{left:m,right:m},theme:'grid'})}
// Detalle
d.addPage();d.setTextColor(...NAVY).setFont('helvetica','bold').setFontSize(13).text('Registro cronológico detallado',m,18);d.setFont('helvetica','normal').setFontSize(8.5).setTextColor(110).text(`${n} registros · ${s.name||'Paciente'} · ${FL}`,m,24);
d.autoTable({startY:29,head:[['Fecha y hora','Tipo','Desencadenante / contexto','Síntomas','Int.','Medicación','Notas']],
body:E.map(e=>[fd(e.ts,1),e.kind==='env'?'Ambiental':'Otra',trigTxt(e)+(e.stress?`\nEstrés ${e.stress}/5`:'')+(e.pollen&&e.pollen.grass!=null?`\nGram. ${Math.round(e.pollen.grass)} gr/m³`:''),symTxt(e),e.int||'–',e.med?(e.medName||'Sí'):'–',e.notes||'']),
styles:{fontSize:8,cellPadding:2,valign:'top',lineColor:[232,236,242],lineWidth:.15},headStyles:{fillColor:NAVY},alternateRowStyles:{fillColor:[247,249,252]},
columnStyles:{0:{cellWidth:23},1:{cellWidth:16},4:{cellWidth:9,halign:'center'},5:{cellWidth:20},6:{minCellWidth:24}},margin:{left:m,right:m,bottom:16},theme:'grid',
didParseCell:h=>{if(h.section==='body'&&h.column.index===4){const v=+h.cell.raw;if(v){const c=hex(IC[v-1]);h.cell.styles.textColor=c;h.cell.styles.fontStyle='bold'}}}});
const pc=d.getNumberOfPages();for(let i=1;i<=pc;i++){d.setPage(i);d.setFontSize(7).setTextColor(140).text('Datos autorregistrados por el paciente. Resumen descriptivo; no constituye diagnóstico ni sustituye la valoración clínica.',m,290);d.setFontSize(8).text(`${s.name||'Paciente'}  ·  Página ${i} de ${pc}`,W-m,294,{align:'right'})}
d.save(`informe-alergia-${(s.name||'paciente').replace(/\s+/g,'_')}_${R.from}_${R.to}.pdf`)}
