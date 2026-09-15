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
    const ht=Math.floor(tonnen(toegestaan));
    $('#hD').textContent=nl(toegestaan,2)+' m'; $('#hT').textContent=nl(ht)+' ton';
    const p=pct(toegestaan);
    $('#greep').style.top=p+'%'; $('#waterlaag').style.top=p+'%'; $('#greepTxt').textContent=nl(toegestaan,2)+' m';
    S.setAttribute('aria-valuenow',toegestaan.toFixed(2)); S.setAttribute('aria-valuetext',nl(toegestaan,2)+' meter, '+nl(ht)+' ton');
    dm.value=toegestaan; vul(dm);

    $('#uMax').textContent=nl(toegestaan,2)+' m';
    $('#maxG').style.transform=`translateY(${y(toegestaan)}px)`;
    $('#maxTxt').textContent='ingesteld '+nl(toegestaan,2)+' m';

    let hoev, wd;
    if(modus==='ton'){
      const d=diepgang(ton); wd=d; hoev=nl(ton)+' ton';
      $('#uD').textContent=nl(d,2)+' m';
      const st=$('#uStatus');
      if(d<=toegestaan+1e-6){st.className='status ja';st.textContent='Onder de ingestelde grens';$('#uRestNaam').textContent='Verschil met ingestelde grens';$('#uRest').textContent='ca. '+nl(Math.max(0,r50(ht-ton)))+' ton';}
      else{st.className='status nee';st.textContent='Boven de ingestelde grens';$('#uRestNaam').textContent='Maximaal bij deze diepgang';$('#uRest').textContent='ca. '+nl(ht)+' ton';}
      const h=Math.min(1,ton/MAXT)*98, top=210-h;
      $('#bulk').setAttribute('y',top);$('#bulk').setAttribute('height',h);
      $('#bulkTop').setAttribute('d',h>1?`M150 ${top} Q507 ${top-Math.min(18,h*.3)-10} 865 ${top} Z`:'');
      dozen.forEach(r=>r.setAttribute('opacity',0));
      $('#beeldTxt').textContent='diepgang '+nl(d,2)+' m';
    }else{
      hoev=nl(teu)+' TEU'; wd=Math.min(toegestaan,2.4);
      $('#uVrij').textContent=nl(266-teu)+' TEU';
      dozen.forEach((r,i)=>r.setAttribute('opacity',i<teu?1:0));
      $('#bulk').setAttribute('height',0);$('#bulkTop').setAttribute('d','');
      $('#beeldTxt').textContent=nl(teu)+' van 266 TEU';
    }
    document.querySelector('.legenda').hidden=modus!=='ton';
    $('#waterG').style.display=modus==='ton'?'':'none';
    $('#maxG').style.display=modus==='ton'&&$('#advanced').open?'':'none';
    $('#maxLegend').hidden=!(modus==='ton'&&$('#advanced').open);
    $('#advanced').hidden=modus!=='ton';
    $('#waterG').style.transform=`translateY(${y(wd)}px)`;
    const rk=$('#rekenAanvraag'); rk.textContent='Bespreek deze lading: '+hoev; rk.dataset.hoev=hoev;
  }

  const validateAmount=()=>{
    const input=$(modus==='ton'?'#tonIn':'#teuIn');
    const valid=input.value!==''&&input.validity.valid;
    $('#calc-error').hidden=valid;
    $('#calc-error').textContent=modus==='ton'?'Vul een heel getal in van 0 tot 3.878 ton. Bespreek grotere ladingen rechtstreeks met ons.':'Vul een heel getal in van 0 tot 266 TEU.';
    $('#rekenAanvraag').setAttribute('aria-disabled',String(!valid));
    return valid;
  };
  const koppel=(n,s,max,f)=>{
    n.addEventListener('input',()=>{if(n.value!==''&&n.validity.valid){s.value=n.value;vul(s);f(+n.value);}validateAmount();});
    s.addEventListener('input',()=>{n.value=s.value;vul(s);f(+s.value);validateAmount();});vul(s);
  };
  koppel($('#tonIn'),$('#tonSch'),MAXT,v=>{ton=v;teken();});
  koppel($('#teuIn'),$('#teuSch'),266,v=>{teu=v;teken();});
  const kies=m=>{modus=m;$('#tabTon').setAttribute('aria-selected',m==='ton');$('#tabTeu').setAttribute('aria-selected',m==='teu');$('#modusTon').hidden=m!=='ton';$('#modusTeu').hidden=m!=='teu';teken();validateAmount();};
  $('#tabTon').onclick=()=>kies('ton'); $('#tabTeu').onclick=()=>kies('teu');

  const updateQuantityLabel=()=>{
    const type=document.querySelector('input[name=soort]:checked').value;
    const container=type==='containers',bulk=type==='droge bulk';
    $('#hoeveelheidLabel').textContent=container?'Hoeveelheid (TEU)':bulk?'Hoeveelheid (ton)':'Hoeveelheid (inclusief eenheid)';
    $('#fHoev').placeholder=container?'Bijvoorbeeld 160 TEU':bulk?'Bijvoorbeeld 2.400 ton':'Bijvoorbeeld 20 pallets of 500 ton';
  };
  document.querySelectorAll('input[name=soort]').forEach(input=>input.addEventListener('change',()=>{
    $('#fHoev').value='';$('#fHoev').setCustomValidity('');updateQuantityLabel();
  }));
  $('#rekenAanvraag').addEventListener('click',e=>{if(!validateAmount()){e.preventDefault();return;}$(modus==='ton'?'#s1':'#s2').checked=true;updateQuantityLabel();$('#fHoev').value=$('#rekenAanvraag').dataset.hoev;});

  

  // vrachtwagens (statisch)
  let w='';for(let i=0;i<134;i++)w+='<svg viewBox="0 0 30 14"><use href="#wagen"/></svg>';
  $('#raster').innerHTML=w;

  $('#advanced').addEventListener('toggle',()=>{
    document.querySelectorAll('.advanced-result').forEach(el=>el.hidden=!$('#advanced').open);
    teken();
  });

  // Demonstration only: no network request and no storage of personal data.
  const date=new Date();
  const today=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
  $('#fDatum').min=today; $('#fDatum').value='';
  const validateStep=id=>{
    for(const input of document.querySelectorAll(id+' input')){
      if(input.required&&input.type!=='date')input.setCustomValidity(input.value.trim()?'':'Vul dit veld in.');
      if(!input.reportValidity())return false;
    }
    return true;
  };
  $('#form').addEventListener('input',e=>{if(e.target.setCustomValidity)e.target.setCustomValidity('');});
  const showStep=n=>{[1,2,3].forEach(i=>$('#stap'+i).hidden=i!==n);$('#stappen').hidden=n===3;$('#st2').classList.toggle('aan',n===2);};
  $('#verder').onclick=()=>{if(validateStep('#stap1')){showStep(2);$('#fNaam').focus();}};
  $('#terug').onclick=()=>{showStep(1);$('#fVan').focus();};
  $('#bewerkAanvraag').onclick=()=>{showStep(1);$('#fVan').focus();};
  $('#form').addEventListener('submit',e=>{
    e.preventDefault();
    if(!$('#stap1').hidden){$('#verder').click();return;}
    if(!validateStep('#stap2'))return;
    $('#klaarTxt').textContent='Zo ziet uw aanvraag eruit. Er is niets verstuurd. Neem voor een echte aanvraag telefonisch of per e-mail contact op.';
    const labels=[['Laadhaven','fVan'],['Loshaven','fNaar'],['Hoeveelheid','fHoev'],['Laden vanaf','fDatum'],['Naam','fNaam'],['Bedrijf','fBedrijf'],['Telefoon','fTel'],['E-mail','fMail']];
    const list=$('#aanvraagOverzicht');list.replaceChildren();
    const addRow=(label,value)=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);list.append(row);};
    addRow('Soort lading',document.querySelector('input[name=soort]:checked').value);
    labels.forEach(([label,id])=>{const value=$('#'+id).value.trim();if(value)addRow(label,id==='fDatum'?value.split('-').reverse().join('-'):value);});
    showStep(3);$('#klaarTxt').focus();
  });

  const toast=$('#toast');let tt;
  document.querySelectorAll('[data-toast]').forEach(b=>b.addEventListener('click',()=>{toast.textContent=b.dataset.toast;toast.classList.add('aan');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('aan'),2800);}));

  teken();
})();

const menuButton=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#main-menu');
function closeMenu(){menuButton.setAttribute('aria-expanded','false');navigation.classList.remove('is-open');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));navigation.classList.toggle('is-open',open);});
navigation.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();}});
