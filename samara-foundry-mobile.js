/* ============================================================
   SAMARA · FOUNDRY MOBILE — Black & White Edition
   UI shell para técnicos y supervisores de zona en mobile/iPad
   Pega este archivo en el mismo repo que index.html
   ============================================================ */

(function(){
  'use strict';

  /* ── CSS ── */
  const css = `
    body.fdym {
      background: #f4f4f4 !important;
      padding-bottom: 80px !important;
      padding-top: 0 !important;
      font-family: 'Inter', system-ui, sans-serif !important;
    }
    body.fdym .header    { display: none !important; }
    body.fdym .nav-wrap  { display: none !important; }
    body.fdym .fdy-shell { display: block !important; }
    body.fdym .fdy-side  { display: none !important; }
    body.fdym .fdy-main-wrap, body.fdym .main {
      width: 100% !important; padding: 0 !important; max-width: none !important;
    }
    body.fdym #fdy-dash { display: none !important; }

    /* TOP BAR */
    .fdym-top {
      position: sticky; top: 0; z-index: 50;
      background: #fff; border-bottom: 1.5px solid #0a0a0a;
      display: flex; align-items: center; gap: 12px;
      padding: 0 18px;
      padding-top: env(safe-area-inset-top);
      height: calc(56px + env(safe-area-inset-top));
    }
    .fdym-top .mark {
      width: 34px; height: 34px; border-radius: 4px;
      background: #0a0a0a; color: #fff;
      display: grid; place-items: center;
      font-family: 'Inter Tight', sans-serif; font-weight: 700;
      font-size: 15px; letter-spacing: -0.03em; flex-shrink: 0;
    }
    .fdym-top .who { flex: 1; min-width: 0; }
    .fdym-top .who .brand {
      font-family: 'Inter Tight', sans-serif; font-weight: 600;
      font-size: 16px; letter-spacing: -0.02em; line-height: 1.1; color: #0a0a0a;
    }
    .fdym-top .who .sub {
      font-size: 10px; color: #888; text-transform: uppercase;
      letter-spacing: 0.12em; font-weight: 500; margin-top: 1px;
    }
    .fdym-top .bell {
      width: 34px; height: 34px; border-radius: 50%;
      background: #f2f2f2; border: 1px solid #e0e0e0;
      display: grid; place-items: center; cursor: pointer; position: relative;
    }
    .fdym-top .bell i { font-size: 18px; color: #404040; }
    .fdym-top .bell .dot {
      position: absolute; top: 6px; right: 6px;
      width: 8px; height: 8px; border-radius: 50%;
      background: #b02a1a; border: 2px solid #fff;
    }
    .fdym-top .av {
      width: 34px; height: 34px; border-radius: 50%;
      background: #0a0a0a; color: #fff;
      display: grid; place-items: center;
      font-family: 'Inter Tight', sans-serif; font-weight: 600;
      font-size: 12px; cursor: pointer; flex-shrink: 0;
    }

    /* AGENDA SCREEN */
    .fdym-greeting { padding: 22px 18px 14px; }
    .fdym-greeting .eyebrow {
      font-size: 11px; color: #888; text-transform: uppercase;
      letter-spacing: 0.12em; font-weight: 500; margin-bottom: 10px;
    }
    .fdym-greeting .count {
      font-family: 'Inter Tight', sans-serif; font-weight: 700;
      font-size: 34px; letter-spacing: -0.03em; line-height: 1.1; color: #0a0a0a;
    }
    .fdym-greeting .count .num { color: #0a0a0a; font-size: 38px; }
    .fdym-greeting .count .sub {
      display: block; font-size: 30px; font-weight: 600;
      color: #0a0a0a; margin-top: 2px;
    }

    /* KPI STRIP */
    .fdym-kpis {
      display: grid; grid-template-columns: repeat(3,1fr);
      gap: 8px; padding: 0 18px 18px;
    }
    .fdym-kpi {
      background: #fff; border: 1px solid #e0e0e0; border-radius: 10px;
      padding: 14px 12px;
    }
    .fdym-kpi .lab {
      font-size: 10px; color: #888; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.10em; margin-bottom: 7px;
    }
    .fdym-kpi .val {
      font-family: 'Inter Tight', sans-serif; font-weight: 700;
      font-size: 28px; letter-spacing: -0.03em; line-height: 1;
      font-variant-numeric: tabular-nums; color: #0a0a0a;
    }
    .fdym-kpi .val.danger { color: #b02a1a; }
    .fdym-kpi .val.warn   { color: #7a5200; }
    .fdym-kpi .val.ok     { color: #1a6636; }

    /* FILTER CHIPS */
    .fdym-chips {
      display: flex; gap: 8px; padding: 0 18px 16px;
      overflow-x: auto; -webkit-overflow-scrolling: touch;
    }
    .fdym-chips::-webkit-scrollbar { display: none; }
    .fdym-chip {
      padding: 8px 18px; border: 1.5px solid #c0c0c0;
      background: #fff; color: #404040;
      font-size: 13px; font-weight: 500; border-radius: 999px;
      white-space: nowrap; cursor: pointer; flex-shrink: 0;
      font-family: 'Inter', sans-serif; transition: all .12s;
    }
    .fdym-chip.act {
      background: #0a0a0a; color: #fff; border-color: #0a0a0a;
    }
    .fdym-chip .n { margin-left: 5px; opacity: 0.5; font-variant-numeric: tabular-nums; }

    /* OT CARDS */
    .fdym-cards {
      padding: 0 18px 24px; display: flex; flex-direction: column; gap: 10px;
    }
    .fdym-card {
      background: #fff; border: 1px solid #e0e0e0; border-radius: 12px;
      padding: 16px; cursor: pointer; position: relative; overflow: hidden;
      transition: box-shadow .12s;
    }
    .fdym-card::before {
      content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
    }
    .fdym-card.pri-urgente::before { background: #b02a1a; }
    .fdym-card.pri-alta::before    { background: #7a5200; }
    .fdym-card.pri-media::before   { background: #404040; }
    .fdym-card.pri-baja::before    { background: #c0c0c0; }
    .fdym-card:active { box-shadow: 0 2px 12px rgba(0,0,0,.10); }

    .fdym-card .card-top {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 8px; gap: 8px;
    }
    .fdym-card .ot-id {
      font-family: 'Inter Tight', sans-serif; font-weight: 600; font-size: 12px;
      background: #f2f2f2; padding: 3px 9px; border-radius: 5px;
      letter-spacing: -0.01em; color: #0a0a0a;
    }
    .fdym-card .badges { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .fdym-card .card-title {
      font-family: 'Inter Tight', sans-serif; font-weight: 600;
      font-size: 16px; letter-spacing: -0.02em; line-height: 1.3;
      margin-bottom: 10px; color: #0a0a0a;
    }
    .fdym-card .card-meta {
      display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: #888;
    }
    .fdym-card .meta-it { display: inline-flex; align-items: center; gap: 4px; }
    .fdym-card .meta-it i { font-size: 13px; }
    .fdym-card .meta-it.paro { color: #b02a1a; font-weight: 600; }

    /* PILLS */
    .fdym-pill {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; font-size: 11px; font-weight: 500; border-radius: 999px;
    }
    .fdym-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .fdym-pill.red   { color: #b02a1a; background: rgba(176,42,26,0.08); }
    .fdym-pill.amb   { color: #7a5200; background: rgba(122,82,0,0.09); }
    .fdym-pill.grn   { color: #1a6636; background: rgba(26,102,54,0.08); }
    .fdym-pill.gray  { color: #888;    background: #f2f2f2; }
    .fdym-pill.sla   { color: #fff; background: #7a5200; font-weight: 700; }
    .fdym-pill.paro-badge { color: #fff; background: #b02a1a; font-weight: 700; }
    .fdym-pill.solid { color: #fff; background: #0a0a0a; }

    /* OT DETAIL */
    .fdym-detail { padding-bottom: 90px; }
    .fdym-detail-top { padding: 16px 18px 14px; border-bottom: 1px solid #e0e0e0; }
    .fdym-detail-back {
      display: flex; align-items: center; gap: 6px;
      font-size: 14px; color: #404040; cursor: pointer;
      margin-bottom: 16px; font-weight: 500; font-family: 'Inter', sans-serif;
    }
    .fdym-detail-back i { font-size: 18px; color: #0a0a0a; }
    .fdym-detail-id {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 10px;
    }
    .fdym-detail-id .ot-num {
      font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 13px;
      background: #0a0a0a; color: #fff; padding: 4px 12px; border-radius: 5px;
    }
    .fdym-detail-id .ot-time { font-size: 13px; color: #888; }
    .fdym-detail-title {
      font-family: 'Inter Tight', sans-serif; font-weight: 700;
      font-size: 24px; letter-spacing: -0.03em; line-height: 1.2;
      color: #0a0a0a; margin-bottom: 14px;
    }
    .fdym-detail-badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
    .fdym-detail-badge {
      padding: 5px 14px; border-radius: 999px; font-size: 12px; font-weight: 500;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .fdym-detail-badge.critica { background: rgba(176,42,26,0.08); color: #b02a1a; }
    .fdym-detail-badge.progreso { background: #f2f2f2; color: #404040; border: 1px solid #e0e0e0; }
    .fdym-detail-badge.tipo    { background: #f2f2f2; color: #404040; border: 1px solid #e0e0e0; }
    .fdym-detail-badge.paro    { background: #b02a1a; color: #fff; }

    /* INFO GRID */
    .fdym-info-grid {
      margin: 14px 18px; background: #fff;
      border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;
    }
    .fdym-info-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 13px 16px; border-bottom: 1px solid #e0e0e0;
    }
    .fdym-info-row:last-child { border-bottom: none; }
    .fdym-info-row .lbl {
      font-size: 11px; color: #888; text-transform: uppercase;
      letter-spacing: 0.10em; font-weight: 600;
    }
    .fdym-info-row .val { font-size: 14px; color: #0a0a0a; font-weight: 500; }
    .fdym-info-row .val.sla-neg { color: #b02a1a; font-weight: 700; }

    /* CHECKLIST */
    .fdym-cl-section { padding: 0 18px; }
    .fdym-cl-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 10px;
    }
    .fdym-cl-header .ttl {
      font-size: 11px; color: #888; text-transform: uppercase;
      letter-spacing: 0.10em; font-weight: 600;
    }
    .fdym-cl-bar { height: 3px; background: #e0e0e0; border-radius: 2px; overflow: hidden; margin-bottom: 14px; }
    .fdym-cl-bar .fill { height: 100%; background: #0a0a0a; border-radius: 2px; transition: width .3s; }
    .fdym-cl-items { display: flex; flex-direction: column; gap: 8px; }
    .fdym-cl-item {
      background: #fff; border: 1px solid #e0e0e0; border-radius: 10px;
      padding: 16px; display: flex; align-items: center; gap: 14px; cursor: pointer;
    }
    .fdym-cl-item .check {
      width: 26px; height: 26px; border-radius: 50%;
      border: 2px solid #c0c0c0; flex-shrink: 0;
      display: grid; place-items: center; transition: all .15s;
    }
    .fdym-cl-item.done .check { background: #1a6636; border-color: #1a6636; }
    .fdym-cl-item.done .check i { color: #fff; font-size: 14px; }
    .fdym-cl-item .item-label { font-size: 15px; color: #0a0a0a; font-weight: 400; flex: 1; line-height: 1.3; }
    .fdym-cl-item.done .item-label { text-decoration: line-through; color: #888; }

    /* ACTION BUTTON */
    .fdym-action-wrap {
      position: fixed; bottom: 0; left: 0; right: 0;
      padding: 12px 18px; padding-bottom: max(12px, env(safe-area-inset-bottom));
      background: #fff; border-top: 1px solid #e0e0e0; z-index: 60;
    }
    .fdym-action-btn {
      width: 100%; background: #0a0a0a; color: #fff;
      border: none; border-radius: 10px; padding: 16px;
      font-family: 'Inter Tight', sans-serif; font-weight: 600;
      font-size: 16px; letter-spacing: -0.01em; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .fdym-action-btn i { font-size: 20px; }
    .fdym-action-btn:active { opacity: 0.85; }

    /* BOTTOM NAV */
    .fdym-bottombar {
      position: fixed; left: 0; right: 0; bottom: 0;
      background: #fff; border-top: 1px solid #e0e0e0;
      display: grid; grid-template-columns: repeat(5,1fr);
      padding-bottom: max(8px, env(safe-area-inset-bottom));
      z-index: 50;
    }
    .fdym-bottombar .it {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      cursor: pointer; color: #888; font-size: 10px; font-weight: 500;
      padding: 10px 4px 6px; font-family: 'Inter', sans-serif; transition: color .12s;
    }
    .fdym-bottombar .it i { font-size: 22px; }
    .fdym-bottombar .it.act { color: #0a0a0a; }
    .fdym-bottombar .scan-btn {
      display: flex; flex-direction: column; align-items: center;
      gap: 3px; cursor: pointer; padding: 4px 4px 6px;
      color: #888; font-size: 10px; font-weight: 500; font-family: 'Inter', sans-serif;
    }
    .fdym-bottombar .scan-fab {
      width: 54px; height: 54px; border-radius: 50%;
      background: #0a0a0a; color: #fff;
      display: grid; place-items: center; margin-top: -26px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
    }
    .fdym-bottombar .scan-fab i { font-size: 26px; }

    body.fdym input, body.fdym select, body.fdym textarea {
      font-size: 16px !important; min-height: 44px !important;
    }
    body.fdym .btn-sm { min-height: 44px; }
  `;

  /* ── INJECT CSS ── */
  if(!document.getElementById('fdym-style')){
    const el = document.createElement('style');
    el.id = 'fdym-style';
    el.textContent = css;
    document.head.appendChild(el);
  }

  /* ── HELPERS ── */
  const $ = (s,p) => (p||document).querySelector(s);
  const $$ = (s,p) => Array.from((p||document).querySelectorAll(s));
  const pad2 = n => String(n).padStart(2,'0');
  const initials = n => { const p=(n||'').trim().split(/\s+/); return ((p[0]||'')[0]||'')+((p[1]||'')[0]||''); };
  const parseDate = v => { try { return v ? new Date(v) : null; } catch(e){ return null; } };
  const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
  const sameDay = (a,b) => a&&b && a.toDateString()===b.toDateString();
  function priClass(p){
    const x=String(p||'').toLowerCase();
    if(x.includes('urgent')) return 'red';
    if(x.includes('alta'))   return 'amb';
    if(x.includes('media'))  return 'gray';
    return 'gray';
  }

  /* ── STATE ── */
  const S = { filter:'todas', activeOT:null, clItems:[] };

  function isMobileRole(){
    const r = window.curProf?.rol;
    return r==='tecnico' || r==='supervisor_zona';
  }

  function myOTs(){
    const all = window.allOTs || [];
    if(window.curProf?.rol === 'supervisor_zona'){
      const zona = window.curProf?.zona;
      const eqsZona = (window.allEqs||[]).filter(e=>e.area===zona).map(e=>e.id);
      return all.filter(o => eqsZona.includes(o.equipo_id) && o.estado !== 'Completada');
    }
    const meId = window.curUser?.id;
    const meNom = window.curProf?.nombre;
    return all.filter(o => String(o.tecnico_id)===String(meId) || o.tecnico_nombre===meNom);
  }

  /* ── TOP BAR ── */
  function renderTop(subtitle){
    let wrap = $('#fdym-top');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.id = 'fdym-top'; wrap.className = 'fdym-top';
      document.body.insertBefore(wrap, document.body.firstChild);
    }
    const nm = window.curProf?.nombre || '–';
    wrap.innerHTML = `
      <div class="mark">S</div>
      <div class="who">
        <div class="brand">Samara</div>
        <div class="sub">${subtitle||'MI AGENDA'}</div>
      </div>
      <div class="bell" onclick="window.toggleNotifPanel&&toggleNotifPanel()">
        <i class="ti ti-bell"></i>
      </div>
      <div class="av" onclick="window.doLogout&&doLogout()">${initials(nm).toUpperCase()}</div>
    `;
  }

  /* ── BOTTOM NAV ── */
  function renderBottombar(active){
    let bar = $('#fdym-bottombar');
    if(!bar){
      bar = document.createElement('div');
      bar.id = 'fdym-bottombar'; bar.className = 'fdym-bottombar';
      document.body.appendChild(bar);
    }
    const tabs = [
      {k:'agenda',    icon:'ti-layout-list',  label:'Agenda'},
      {k:'hoy',       icon:'ti-calendar',     label:'Hoy'},
      {k:'scan',      fab:true,               label:'Scan'},
      {k:'historial', icon:'ti-clock-hour-4', label:'Historial'},
      {k:'perfil',    icon:'ti-user',         label:'Perfil'},
    ];
    bar.innerHTML = tabs.map(t => {
      if(t.fab) return `
        <div class="scan-btn" onclick="_fdymNav('scan')">
          <div class="scan-fab"><i class="ti ti-scan"></i></div>
          <span>${t.label}</span>
        </div>`;
      return `<div class="it ${active===t.k?'act':''}" onclick="_fdymNav('${t.k}')">
        <i class="ti ${t.icon}"></i><span>${t.label}</span>
      </div>`;
    }).join('');
  }

  /* ── NAVIGATE ── */
  function _fdymNav(t){
    const screen = $('#fdym-screen');
    if(t==='scan'){
      if(screen) screen.style.display='none';
      renderTop('ESCÁNER QR');
      if(typeof window.setTab==='function') window.setTab('escaner');
      if(typeof window.startScanner==='function') window.startScanner();
      renderBottombar('scan');
    } else if(t==='historial'){
      if(screen) screen.style.display='none';
      renderTop('HISTORIAL');
      if(typeof window.setTab==='function') window.setTab('ordenes');
      renderBottombar('historial');
    } else {
      if(screen) screen.style.display='';
      S.activeOT = null;
      S.filter = t==='hoy' ? 'hoy' : 'todas';
      renderTop('MI AGENDA');
      renderScreen();
      renderBottombar(t==='hoy'?'hoy':'agenda');
    }
  }
  window._fdymNav = _fdymNav;

  /* ── MAIN SCREEN ── */
  function renderScreen(){
    let wrap = $('#fdym-screen');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.id = 'fdym-screen';
      const top = $('#fdym-top');
      top ? top.insertAdjacentElement('afterend', wrap) : document.body.appendChild(wrap);
    }
    wrap.style.display = '';
    S.activeOT ? renderDetail(wrap) : renderAgenda(wrap);
  }

  /* ── AGENDA ── */
  function renderAgenda(wrap){
    const ots = myOTs();
    const activas  = ots.filter(o=>o.estado!=='Completada');
    const urgentes = activas.filter(o=>o.prioridad==='Urgente').length;
    const progreso = activas.filter(o=>o.estado==='En progreso').length;
    const complHoy = ots.filter(o=>{
      const co=parseDate(o.fecha_cierre);
      return co && sameDay(co,today()) && o.estado==='Completada';
    }).length;

    const now=new Date();
    const dias=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const meses=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const fecha=`${dias[now.getDay()].toUpperCase()} ${now.getDate()} ${meses[now.getMonth()].toUpperCase()}`;
    const nombre=(window.curProf?.nombre||'').split(' ')[0]||'Técnico';

    const filterDefs=[
      {k:'todas',l:'Todas',n:activas.length},
      {k:'paro',l:'Paro',n:urgentes},
      {k:'sla',l:'SLA',n:progreso},
      {k:'hoy',l:'Hoy',n:activas.filter(o=>{const fp=parseDate(o.fecha_programada);return fp&&sameDay(fp,today());}).length},
      {k:'pendiente',l:'Pendiente',n:activas.filter(o=>o.estado==='Pendiente').length},
    ];

    let list=[...activas];
    if(S.filter==='paro')       list=list.filter(o=>o.prioridad==='Urgente');
    else if(S.filter==='sla')   list=list.filter(o=>o.estado==='En progreso');
    else if(S.filter==='hoy')   list=list.filter(o=>{const fp=parseDate(o.fecha_programada);return fp&&sameDay(fp,today());});
    else if(S.filter==='pendiente') list=list.filter(o=>o.estado==='Pendiente');
    list.sort((a,b)=>{const po={Urgente:0,'En progreso':1,Pendiente:2};return (po[a.prioridad]||3)-(po[b.prioridad]||3);});

    wrap.innerHTML=`
      <div class="fdym-greeting">
        <div class="eyebrow">HOLA, ${nombre.toUpperCase()} · ${fecha}</div>
        <div class="count">
          <span class="num">${activas.length}</span> órdenes
          <span class="sub">te esperan hoy</span>
        </div>
      </div>
      <div class="fdym-kpis">
        <div class="fdym-kpi"><div class="lab">Paros</div><div class="val ${urgentes>0?'danger':''}">${urgentes}</div></div>
        <div class="fdym-kpi"><div class="lab">SLA Risk</div><div class="val ${progreso>0?'warn':''}">${progreso}</div></div>
        <div class="fdym-kpi"><div class="lab">Completas</div><div class="val ok">${complHoy}</div></div>
      </div>
      <div class="fdym-chips">
        ${filterDefs.map(f=>`<button class="fdym-chip ${S.filter===f.k?'act':''}" data-f="${f.k}">${f.l}<span class="n">${f.n}</span></button>`).join('')}
      </div>
      <div class="fdym-cards">
        ${list.length===0?`
          <div style="text-align:center;padding:48px 0;color:#888;">
            <i class="ti ti-checks" style="font-size:40px;display:block;margin-bottom:10px;opacity:.3;"></i>
            <div style="font-size:16px;font-weight:500;color:#0a0a0a;margin-bottom:4px;">¡Todo al día!</div>
            <div style="font-size:13px;">Sin órdenes en esta vista.</div>
          </div>
        `:list.map(o=>_otCard(o)).join('')}
      </div>
    `;

    $$('.fdym-chip',wrap).forEach(b=>b.addEventListener('click',()=>{S.filter=b.dataset.f;renderAgenda(wrap);}));
    $$('.fdym-card[data-otid]',wrap).forEach(c=>c.addEventListener('click',()=>_openDetail(parseInt(c.dataset.otid))));
  }

  function _otCard(o){
    const isU=o.prioridad==='Urgente'&&o.estado!=='Completada';
    const isProg=o.estado==='En progreso';
    const priKey=(o.prioridad||'baja').toLowerCase().replace(/\s/g,'-');
    const eq=(window.allEqs||[]).find(e=>e.id===o.equipo_id);
    const zona=eq?.area||'–';
    let slaBadge='';
    if(isProg&&o.fecha_creacion){
      const mins=Math.floor((Date.now()-new Date(o.fecha_creacion))/60000);
      if(mins>60){const h=Math.floor(mins/60),m=mins%60;slaBadge=`<span class="fdym-pill sla">● SLA -${pad2(h)}:${pad2(m)}</span>`;}
    }
    return `
      <div class="fdym-card pri-${priKey}" data-otid="${o.id}">
        <div class="card-top">
          <span class="ot-id">OT-${String(o.id).padStart(4,'0')}</span>
          <div class="badges">
            ${isU?'<span class="fdym-pill red"><span class="dot"></span>Crítica</span>':''}
            ${slaBadge}
            ${!isU&&!slaBadge?`<span class="fdym-pill ${priClass(o.prioridad)}">● ${o.prioridad||'Media'}</span>`:''}
          </div>
        </div>
        <div class="card-title">${o.equipo_nombre||'–'}${o.descripcion?' — '+(o.descripcion||'').slice(0,45):''}</div>
        <div class="card-meta">
          ${eq?`<span class="meta-it"><i class="ti ti-settings-2"></i>${eq.codigo||eq.nombre}</span>`:''}
          <span class="meta-it"><i class="ti ti-map-pin"></i>${zona}</span>
          ${o.tiempo_minutos?`<span class="meta-it"><i class="ti ti-clock"></i>${Math.floor(o.tiempo_minutos/60)}h ${o.tiempo_minutos%60}m</span>`:''}
          ${isU?'<span class="meta-it paro"><i class="ti ti-alert-triangle"></i>Paro</span>':''}
        </div>
      </div>`;
  }

  /* ── OT DETAIL ── */
  function _openDetail(otId){
    S.activeOT=(window.allOTs||[]).find(o=>o.id===otId);
    if(!S.activeOT) return;
    const cl=_getCL(S.activeOT);
    S.clItems=cl?cl.items.map(item=>({...item,done:false})):[];
    renderTop('MI AGENDA');
    renderScreen();
    renderBottombar('agenda');
  }

  function _getCL(ot){
    const plantillas=window.allPlantillas||[];
    for(const p of plantillas){
      if(String(p.equipo_id)===String(ot.equipo_id)){
        try{
          const raw=typeof p.items==='string'?JSON.parse(p.items):p.items;
          const items=Array.isArray(raw)?raw:(raw?.items||[]);
          if(items.length) return {nombre:ot.tipo,items};
        }catch(e){}
      }
    }
    return null;
  }

  function renderDetail(wrap){
    const o=S.activeOT;
    if(!o){renderAgenda(wrap);return;}
    const eq=(window.allEqs||[]).find(e=>e.id===o.equipo_id);
    const isU=o.prioridad==='Urgente';
    const isParo=isU&&o.tipo==='Correctivo';
    let slaStr='–',slaCls='';
    if(o.fecha_creacion&&o.estado==='En progreso'){
      const mins=Math.floor((Date.now()-new Date(o.fecha_creacion))/60000);
      if(mins>60){const h=Math.floor(mins/60),m=mins%60;slaStr=`-${pad2(h)}:${pad2(m)}`;slaCls='sla-neg';}
    }
    const doneCnt=S.clItems.filter(i=>i.done).length;
    const totalCnt=S.clItems.length;
    const pct=totalCnt?Math.round(doneCnt/totalCnt*100):0;
    const hora=o.fecha_creacion?new Date(o.fecha_creacion).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit',hour12:false}):'–';

    wrap.innerHTML=`
      <div class="fdym-detail">
        <div class="fdym-detail-top">
          <div class="fdym-detail-back" id="fdym-back">
            <i class="ti ti-arrow-left"></i> Mi agenda
          </div>
          <div class="fdym-detail-id">
            <span class="ot-num">OT-${String(o.id).padStart(4,'0')}</span>
            <span class="ot-time">Reportada ${hora}</span>
          </div>
          <div class="fdym-detail-title">${o.equipo_nombre||'–'}${o.descripcion?' — '+o.descripcion:''}</div>
          <div class="fdym-detail-badges">
            ${isU?'<span class="fdym-detail-badge critica"><span style="width:6px;height:6px;border-radius:50%;background:#b02a1a;display:inline-block;"></span>Crítica</span>':''}
            <span class="fdym-detail-badge progreso">${o.estado||'–'}</span>
            <span class="fdym-detail-badge tipo">${o.tipo||'–'}</span>
            ${isParo?'<span class="fdym-detail-badge paro"><span style="width:6px;height:6px;border-radius:50%;background:#fff;display:inline-block;"></span>Paro activo</span>':''}
          </div>
        </div>

        <div class="fdym-info-grid">
          ${eq?`<div class="fdym-info-row"><span class="lbl">Equipo</span><span class="val">${eq.codigo||eq.nombre}</span></div>`:''}
          <div class="fdym-info-row"><span class="lbl">Zona</span><span class="val">${eq?.area||'–'}</span></div>
          ${o.tiempo_minutos?`<div class="fdym-info-row"><span class="lbl">Tiempo est.</span><span class="val">${o.tiempo_minutos} min</span></div>`:''}
          ${slaStr!=='–'?`<div class="fdym-info-row"><span class="lbl">SLA</span><span class="val ${slaCls}">${slaStr}</span></div>`:''}
        </div>

        ${totalCnt>0?`
        <div class="fdym-cl-section">
          <div class="fdym-cl-header">
            <span class="ttl">CHECKLIST · ${doneCnt} DE ${totalCnt}</span>
          </div>
          <div class="fdym-cl-bar"><div class="fill" style="width:${pct}%"></div></div>
          <div class="fdym-cl-items">
            ${S.clItems.map((item,i)=>`
              <div class="fdym-cl-item ${item.done?'done':''}" data-idx="${i}">
                <div class="check">${item.done?'<i class="ti ti-check"></i>':''}</div>
                <div class="item-label">${item.label||'–'}</div>
              </div>`).join('')}
          </div>
        </div>`:`
        <div style="padding:24px 18px;text-align:center;color:#888;">
          <i class="ti ti-clipboard-x" style="font-size:32px;display:block;margin-bottom:8px;opacity:.35;"></i>
          <div style="font-size:14px;color:#404040;">Sin checklist configurado</div>
          <div style="font-size:12px;margin-top:4px;">El admin puede crearlo desde Equipos</div>
        </div>`}

      </div>
      <div class="fdym-action-wrap">
        <button class="fdym-action-btn" id="fdym-start-btn">
          <i class="ti ti-player-play"></i>
          ${o.estado==='En progreso'?'Continuar trabajo':'Iniciar trabajo'}
        </button>
      </div>
    `;

    $('#fdym-back',wrap).addEventListener('click',()=>{S.activeOT=null;renderTop('MI AGENDA');renderScreen();});
    $$('.fdym-cl-item[data-idx]',wrap).forEach(el=>el.addEventListener('click',()=>{
      S.clItems[parseInt(el.dataset.idx)].done=!S.clItems[parseInt(el.dataset.idx)].done;
      renderDetail(wrap);
    }));
    $('#fdym-start-btn',wrap).addEventListener('click',()=>{
      if(typeof window.iniciarOTDesdeOrdenes==='function') window.iniciarOTDesdeOrdenes(o.id);
      else if(typeof window.setTab==='function') window.setTab('checklist');
    });
  }

  /* ── ACTIVATE / TICK ── */
  function activate(){
    document.body.classList.add('fdym');
    renderTop('MI AGENDA');
    renderScreen();
    renderBottombar('agenda');
  }

  function tick(){
    const should=isMobileRole();
    if(should && !document.body.classList.contains('fdym')){
      activate();
    } else if(!should && document.body.classList.contains('fdym')){
      document.body.classList.remove('fdym');
      $('#fdym-top')?.remove(); $('#fdym-screen')?.remove(); $('#fdym-bottombar')?.remove();
    } else if(should && !S.activeOT){
      renderTop('MI AGENDA'); renderScreen(); renderBottombar('agenda');
    }
  }

  function waitForReady(){
    if(window.curProf && window.allOTs!==undefined){
      tick();
      if(!window._fdymInterval){
        window._fdymInterval = setInterval(()=>{
          if(window.curProf && document.body.classList.contains('fdym') && !S.activeOT) tick();
        }, 5000);
      }
      console.log('[Foundry mobile B&W] inicializado ✓');
    } else {
      setTimeout(waitForReady, 500);
    }
  }

  /* Also expose as named function for device detection */
  window._initFoundryMobile = function(){ waitForReady(); };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', waitForReady);
  } else {
    waitForReady();
  }
})();
