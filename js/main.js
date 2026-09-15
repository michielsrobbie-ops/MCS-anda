(function(){
  const $=s=>document.querySelector(s);
  const TABEL=[[0,0.91],[1000,1.63],[1500,1.98],[2000,2.32],[2500,2.66],[3000,3.00],[3500,3.34],[3878,3.59]];
  const MAXT=3878, DMIN=1.63, DMAX=3.59;
  const nl=(n,d=0)=>n.toLocaleString('nl-NL',{minimumFractionDigits:d,maximumFractionDigits:d});
  const diepgang=t=>{t=Math.max(0,Math.min(MAXT,t));for(let i=1;i<TABEL.length;i++){const[a,da]=TABEL[i-1],[b,db]=TABEL[i];if(t<=b)return da+(t-a)/(b-a)*(db-da);}return DMAX;};
  const tonnen=d=>{for(let i=1;i<TABEL.length;i++){const[a,da]=TABEL[i-1],[b,db]=TABEL[i];if(d<=db)return a+(d-da)/(db-da)*(b-a);}return MAXT;};
  const r50=x=>Math.round(x/50)*50;
  const KIEL=240,PX=25,y=d=>KIEL-d*PX;
  const vul=el=>el.style.setProperty('--p',((el.value-el.min)/(el.max-el.min)*100)+'%');

  let toegestaan=2.80, modus='ton', ton=2400, teu=160;

  // ijkschaal (hero)
  const S=$('#schaal'); const SMIN=1.4, SMAX=3.8;
  const pct=d=>(1-(d-SMIN)/(SMAX-SMIN))*100;
  let th='';
  for(let v=16;v<=36;v+=2){const d=v/10;th+=`<div class="tik" style="top:${pct(d)}%;width:${v%4===0?34:20}px"></div>`;if(v%4===0)th+=`<div class="cijfer" style="top:${pct(d)}%">${nl(d,1)}</div>`;}
  $('#tikken').innerHTML=th;

  function zet(d){toegestaan=Math.round(Math.max(DMIN,Math.min(DMAX,d))*100)/100;teken();}
  const vanPunt=e=>{const r=S.getBoundingClientRect();const f=(e.clientY-r.top)/r.height;zet(SMAX-f*(SMAX-SMIN));};
  S.addEventListener('pointerdown',e=>{S.setPointerCapture(e.pointerId);vanPunt(e);});
  S.addEventListener('pointermove',e=>{if(S.hasPointerCapture(e.pointerId))vanPunt(e);});
  S.addEventListener('keydown',e=>{const st=e.shiftKey?.1:.01;if(['ArrowUp','ArrowRight'].includes(e.key)){zet(toegestaan+st);e.preventDefault();}if(['ArrowDown','ArrowLeft'].includes(e.key)){zet(toegestaan-st);e.preventDefault();}if(e.key==='Home'){zet(DMIN);e.preventDefault();}if(e.key==='End'){zet(DMAX);e.preventDefault();}});
  const dm=$('#dMob'); dm.addEventListener('input',()=>zet(+dm.value));

  // svg merken + golf
  let mk='';for(let m=1;m<=4;m++){mk+=`<line x1="986" x2="994" y1="${y(m)}" y2="${y(m)}" stroke="#15302f"/><text x="997" y="${y(m)+4}">${m}</text>`;}
  $('#merken').innerHTML=mk;
  let g='M0 0';for(let x=0;x<1000;x+=25)g+=` Q${x+12.5} ${x%50?3:-3} ${x+25} 0`;
  $('#golf').setAttribute('d',g);

  // containers
  const kleuren=['#c8452f','#a33a28','#28504e','#6b1e2a','#4f7a5f','#8eaec2','#b86a2e','#c8452f','#2c4a66'];
  const PER=67,CW=715/PER,CH=26;let ch='';
  for(let l=0;l<4;l++)for(let c=0;c<PER;c++){ch+=`<rect x="${(150+c*CW).toFixed(2)}" y="${210-(l+1)*CH}" width="${(CW-1).toFixed(2)}" height="${CH-1.5}" fill="${kleuren[(c*7+l*3+(c>>2))%kleuren.length]}" opacity="0"/>`;}
  $('#containers').innerHTML=ch; const dozen=[...document.querySelectorAll('#containers rect')];

  function teken(){
    const ht=r50(tonnen(toegestaan));
    $('#hD').textContent=nl(toegestaan,2)+' m'; $('#hT').textContent=nl(ht)+' ton';
    const p=pct(toegestaan);
    $('#greep').style.top=p+'%'; $('#waterlaag').style.top=p+'%'; $('#greepTxt').textContent=nl(toegestaan,2)+' m';
    S.setAttribute('aria-valuenow',toegestaan.toFixed(2)); S.setAttribute('aria-valuetext',nl(toegestaan,2)+' meter, '+nl(ht)+' ton');
    dm.value=toegestaan; vul(dm);

    $('#uMax').textContent=nl(toegestaan,2)+' m';
    $('#maxG').style.transform=`translateY(${y(toegestaan)}px)`;
    $('#maxTxt').textContent='toegestaan '+nl(toegestaan,2)+' m';

    let hoev, wd;
    if(modus==='ton'){
      const d=diepgang(ton); wd=d; hoev=nl(ton)+' ton';
      $('#uD').textContent=nl(d,2)+' m';
      const st=$('#uStatus');
      if(d<=toegestaan+1e-6){st.className='status ja';st.textContent='Ja, dit past';$('#uRestNaam').textContent='Er kan nog bij';$('#uRest').textContent='ca. '+nl(Math.max(0,r50(ht-ton)))+' ton';}
      else{st.className='status nee';st.textContent='Te zwaar bij deze diepgang';$('#uRestNaam').textContent='Maximaal bij deze diepgang';$('#uRest').textContent='ca. '+nl(ht)+' ton';}
      const h=Math.min(1,ton/MAXT)*98, top=210-h;
      $('#bulk').setAttribute('y',top);$('#bulk').setAttribute('height',h);
      $('#bulkTop').setAttribute('d',h>1?`M150 ${top} Q507 ${top-Math.min(18,h*.3)-10} 865 ${top} Z`:'');
      dozen.forEach(r=>r.setAttribute('opacity',0));
      $('#beeldTxt').textContent='diepgang '+nl(d,2)+' m';
    }else{
      hoev=nl(teu)+' TEU'; wd=Math.min(toegestaan,2.4);
      $('#uLagen').textContent=Math.min(4,Math.ceil(teu/66.5))+' van de 4';
      $('#uVrij').textContent=nl(266-teu)+' TEU';
      $('#uWagens').textContent='ca. '+nl(Math.round(teu*134/266));
      dozen.forEach((r,i)=>r.setAttribute('opacity',i<teu?1:0));
      $('#bulk').setAttribute('height',0);$('#bulkTop').setAttribute('d','');
      $('#beeldTxt').textContent=nl(teu)+' van 266 TEU';
    }
    $('#waterG').style.transform=`translateY(${y(wd)}px)`;
    const rk=$('#rekenAanvraag'); rk.textContent='Vraag een prijs aan voor '+hoev; rk.dataset.hoev=hoev;
  }

  const koppel=(n,s,max,f)=>{n.addEventListener('input',()=>{const v=Math.max(0,Math.min(max,+n.value||0));s.value=v;vul(s);f(v);});s.addEventListener('input',()=>{n.value=s.value;vul(s);f(+s.value);});vul(s);};
  koppel($('#tonIn'),$('#tonSch'),MAXT,v=>{ton=v;teken();});
  koppel($('#teuIn'),$('#teuSch'),266,v=>{teu=v;teken();});
  const kies=m=>{modus=m;$('#tabTon').setAttribute('aria-selected',m==='ton');$('#tabTeu').setAttribute('aria-selected',m==='teu');$('#modusTon').hidden=m!=='ton';$('#modusTeu').hidden=m!=='teu';teken();};
  $('#tabTon').onclick=()=>kies('ton'); $('#tabTeu').onclick=()=>kies('teu');

  $('#rekenAanvraag').addEventListener('click',()=>{$('#fHoev').value=$('#rekenAanvraag').dataset.hoev;$(modus==='ton'?'#s1':'#s2').checked=true;});
  $('#heroAanvraag').addEventListener('click',()=>{$('#fHoev').value='tot '+$('#hT').textContent;});

  // vrachtwagens (statisch)
  let w='';for(let i=0;i<134;i++)w+='<svg viewBox="0 0 30 14"><use href="#wagen"/></svg>';
  $('#raster').innerHTML=w;

  // formulier
  const dt=new Date();dt.setDate(dt.getDate()+7);$('#fDatum').value=dt.toISOString().slice(0,10);
  $('#verder').onclick=()=>{$('#stap1').hidden=true;$('#stap2').hidden=false;$('#st2').classList.add('aan');$('#fNaam').focus();};
  $('#terug').onclick=()=>{$('#stap2').hidden=true;$('#stap1').hidden=false;$('#st2').classList.remove('aan');};
  $('#form').addEventListener('submit',e=>{e.preventDefault();$('#stap2').hidden=true;$('#stap3').hidden=false;$('#stappen').hidden=true;
    const van=$('#fVan').value.trim(),naar=$('#fNaar').value.trim();
    const route=van&&naar?`, van ${van} naar ${naar}`:'';
    $('#klaarTxt').textContent=`${$('#fHoev').value} ${document.querySelector('input[name=soort]:checked').value}${route}. Op de live site komt deze aanvraag direct binnen bij de familie Verdonk.`;});

  const toast=$('#toast');let tt;
  document.querySelectorAll('[data-toast]').forEach(b=>b.addEventListener('click',()=>{toast.textContent=b.dataset.toast;toast.classList.add('aan');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('aan'),2800);}));

  teken();
})();
