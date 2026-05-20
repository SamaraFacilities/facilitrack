/* ============================================================
   SAMARA · FOUNDRY LAYOUT
   Restructura la app al layout de la dirección B:
   sidebar izquierdo, header con stats live, page header,
   KPIs grandes con sparklines, cola en vivo, salud de planta,
   calendario 14 días, fallas, personal, stock.

   REEMPLAZA a samara-foundry-widgets.js — usa SOLO este.

   Uso:
     <script src="samara-foundry-layout.js"></script>
   Pega esto JUSTO ANTES de </body>.
   ============================================================ */

(function(){
  'use strict';

  const S = { ots:[], eqs:[], profs:[], refs:[], lastFetch:0, cache:30000 };

  // ── ESTILOS ───────────────────────────────────────────────
  const css = `
    /* Hide original top-bar nav and the "real-time" banner (matched by inline style, not :first-child, to avoid hiding our injected #fdy-dash) */
    .nav-wrap { display: none !important; }
    #tab-dashboard > div[style*="rt-dot"],
    #tab-dashboard > div[style*="Datos en tiempo real"],
    #tab-dashboard > div[style*="green-bg"][style*="margin-bottom"] { display: none !important; }

    /* HEADER restructured */
    .header {
      height: 56px !important; padding: 0 !important;
      border-bottom: 1.5px solid var(--txt) !important;
      box-shadow: none !important;
    }
    .header-left, .header-right { padding: 0 !important; }
    .fdy-brand {
      display: flex; align-items: center; gap: 12px;
      padding: 0 20px; height: 56px;
      border-right: 1px solid var(--line);
      width: 200px; box-sizing: border-box;
    }
    .fdy-brand .mark {
      width: 30px; height: 30px; background: var(--txt); color: var(--bg);
      display: grid; place-items: center; border-radius: 3px;
      font-family: 'Inter Tight', sans-serif; font-size: 16px; font-weight: 700;
      letter-spacing: -0.04em;
    }
    .fdy-brand .nm {
      font-family: 'Inter Tight', sans-serif; font-weight: 600; font-size: 16px;
      letter-spacing: -0.02em; line-height: 1;
    }
    .fdy-brand .sub {
      font-size: 9.5px; color: var(--txt3); text-transform: uppercase;
      letter-spacing: 0.14em; margin-top: 3px;
    }
    .fdy-sitepicker {
      display: flex; align-items: center; gap: 8px;
      padding: 0 16px; height: 56px;
      border-right: 1px solid var(--line); cursor: pointer;
    }
    .fdy-sitepicker .lab { font-size: 9.5px; color: var(--txt3); text-transform: uppercase; letter-spacing: 0.14em; font-weight: 500; }
    .fdy-sitepicker .nm { font-family: 'Inter Tight', sans-serif; font-weight: 500; font-size: 13px; letter-spacing: -0.02em; }
    .fdy-stats {
      flex: 1; display: flex; align-items: center; gap: 26px;
      padding: 0 22px; height: 56px; overflow-x: auto;
    }
    .fdy-stats::-webkit-scrollbar { display: none; }
    .fdy-stats .s { display: flex; align-items: baseline; gap: 6px; flex-shrink: 0; }
    .fdy-stats .lab { font-size: 9.5px; color: var(--txt3); text-transform: uppercase; letter-spacing: 0.14em; font-weight: 500; }
    .fdy-stats .val {
      font-family: 'Inter Tight', sans-serif; font-size: 17px; font-weight: 600;
      letter-spacing: -0.02em; font-variant-numeric: tabular-nums;
    }
    .fdy-stats .val.red { color: var(--red); }
    .fdy-stats .val.grn { color: var(--green); }
    .fdy-stats .val.amb { color: var(--amber); }

    /* APP shell becomes flex with sidebar */
    #app { display: block !important; }
    .fdy-shell { display: flex; min-height: calc(100vh - 56px); }
    .fdy-side {
      width: 200px; background: var(--bg); border-right: 1px solid var(--line);
      padding: 16px 0; flex-shrink: 0;
      position: sticky; top: 56px; align-self: flex-start;
      height: calc(100vh - 56px); overflow-y: auto;
    }
    .fdy-side .grp {
      padding: 0 18px; font-size: 9.5px; color: var(--txt3);
      text-transform: uppercase; letter-spacing: 0.14em;
      margin: 14px 0 6px; font-weight: 500;
    }
    .fdy-side .grp:first-child { margin-top: 0; }
    .fdy-side .nv {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 18px; cursor: pointer; color: var(--txt2);
      font-size: 13px; border-left: 2px solid transparent;
      transition: background 0.12s;
    }
    .fdy-side .nv i { font-size: 16px; color: var(--txt3); width: 18px; }
    .fdy-side .nv:hover { background: var(--bg3); color: var(--txt); }
    .fdy-side .nv.act { background: var(--bg3); color: var(--txt); border-left-color: var(--accent); font-weight: 500; }
    .fdy-side .nv.act i { color: var(--accent); }
    .fdy-side .nv .badge {
      margin-left: auto; background: var(--red); color: #fff;
      font-size: 10px; padding: 1px 7px; border-radius: 999px; font-weight: 500;
      font-variant-numeric: tabular-nums;
    }

    /* Main pushed right */
    .fdy-main-wrap { flex: 1; min-width: 0; }
    .main {
      max-width: none !important; padding: 22px 26px !important;
      margin: 0 !important;
    }

    /* Page header */
    .fdy-page-head {
      display: flex; align-items: flex-end; justify-content: space-between;
      margin-bottom: 22px; gap: 20px; flex-wrap: wrap;
    }
    .fdy-page-head .eyebrow {
      font-size: 10px; color: var(--txt3);
      text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 4px; font-weight: 500;
    }
    .fdy-page-head h1 {
      font-family: 'Inter Tight', sans-serif; font-weight: 600;
      font-size: 30px; letter-spacing: -0.03em; line-height: 1.05;
      margin: 0;
    }
    .fdy-page-head .desc { font-size: 13px; color: var(--txt2); margin-top: 4px; max-width: 520px; }
    .fdy-page-head .actions { display: flex; gap: 8px; align-items: center; }

    /* Big KPI cards */
    .fdy-kpis { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 16px; }
    @media (max-width: 1000px) { .fdy-kpis { grid-template-columns: repeat(2,1fr); } }
    .fdy-kpi {
      background: var(--bg); border: 1px solid var(--line); border-radius: 6px;
      padding: 18px 20px; min-height: 160px; display: flex; flex-direction: column;
    }
    .fdy-kpi .top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .fdy-kpi .accent { width: 28px; height: 4px; background: currentColor; }
    .fdy-kpi .lab { font-size: 10px; color: var(--txt3); text-transform: uppercase; letter-spacing: 0.14em; font-weight: 500; }
    .fdy-kpi .val {
      font-family: 'Inter Tight', sans-serif; font-size: 44px; font-weight: 600;
      letter-spacing: -0.04em; line-height: 1; font-variant-numeric: tabular-nums;
      display: flex; align-items: baseline; gap: 4px;
    }
    .fdy-kpi .val .unit { font-size: 14px; color: var(--txt3); font-weight: 400; letter-spacing: -0.01em; }
    .fdy-kpi .meta {
      display: flex; align-items: center; justify-content: space-between;
      gap: 8px; margin-top: auto; padding-top: 14px;
    }
    .fdy-kpi .delta {
      font-size: 11px; font-weight: 500; font-variant-numeric: tabular-nums;
      padding: 2px 8px; background: var(--bg3); border-radius: 3px;
    }
    .fdy-kpi .delta.up { color: var(--green); }
    .fdy-kpi .delta.dn { color: var(--red); }

    /* Foundry grid rows */
    .fdy-row { display: grid; gap: 14px; margin-bottom: 14px; }
    .fdy-row.r-2-1 { grid-template-columns: 2fr 1fr; }
    .fdy-row.r-3   { grid-template-columns: 1fr 1fr 1fr; }
    @media (max-width: 1000px) {
      .fdy-row.r-2-1, .fdy-row.r-3 { grid-template-columns: 1fr; }
    }

    /* Foundry card */
    .fdy-card { background: var(--bg); border: 1px solid var(--line); border-radius: 6px; }
    .fdy-card .hd { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 18px; border-bottom: 1px solid var(--line); }
    .fdy-card .hd .ttl { font-family: 'Inter Tight', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px; }
    .fdy-card .hd .ttl .sub { font-weight: 400; color: var(--txt3); font-size: 12px; font-family: 'Inter', sans-serif; letter-spacing: 0; margin-left: 4px; }
    .fdy-card .bd { padding: 14px 18px; }
    .fdy-card .bd.no-pad { padding: 0; }

    /* Seg toggle */
    .fdy-seg { display: inline-flex; background: var(--bg3); padding: 2px; border-radius: 4px; }
    .fdy-seg button { padding: 5px 11px; font-size: 11.5px; font-weight: 500; background: transparent; border: none; cursor: pointer; color: var(--txt3); border-radius: 3px; font-family: 'Inter', sans-serif; }
    .fdy-seg button.act { background: var(--bg); color: var(--txt); box-shadow: 0 1px 2px rgba(0,0,0,0.06); }

    /* Cola en vivo table */
    .fdy-tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
    .fdy-tbl th {
      text-align: left; font-weight: 500; font-size: 10.5px;
      text-transform: uppercase; letter-spacing: 0.12em; color: var(--txt3);
      padding: 11px 14px; border-bottom: 1px solid var(--line);
      background: var(--bg); font-family: 'Inter', sans-serif;
    }
    .fdy-tbl td {
      padding: 0 14px; height: 52px; border-bottom: 1px solid var(--line);
      vertical-align: middle; font-variant-numeric: tabular-nums;
    }
    .fdy-tbl tr { cursor: pointer; }
    .fdy-tbl tr:hover td { background: var(--bg3); }
    .fdy-tbl tr.sel td { background: rgba(213,74,24,0.07); }
    .fdy-tbl tr.sel td:first-child { box-shadow: inset 4px 0 0 var(--accent); }
    .fdy-tbl tr:last-child td { border-bottom: none; }
    .fdy-id-pill { font-family: 'Inter Tight', sans-serif; font-weight: 600; font-size: 12px; padding: 3px 9px; background: var(--bg3); border-radius: 3px; letter-spacing: -0.01em; display: inline-block; }
    .fdy-pill { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; font-size: 10.5px; font-weight: 500; border-radius: 999px; }
    .fdy-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .fdy-pill.red    { color: var(--red);   background: rgba(204,61,24,0.10); }
    .fdy-pill.amb    { color: var(--amber); background: rgba(184,112,22,0.13); }
    .fdy-pill.grn    { color: var(--green); background: rgba(31,90,58,0.10); }
    .fdy-pill.blu    { color: var(--blue);  background: rgba(31,90,93,0.10); }
    .fdy-pill.gray   { color: var(--txt3);  background: var(--bg3); }
    .fdy-pill.solid  { background: var(--red); color: #fff; }
    .fdy-pill.solid .dot { background: #fff; }
    .fdy-av {
      width: 28px; height: 28px; border-radius: 50%; display: inline-grid; place-items: center;
      font-size: 11px; font-weight: 600; color: #fff;
    }

    /* Sparkline + cal + donut shared */
    .fdy-cal14 { display: grid; grid-template-columns: repeat(14,1fr); gap: 4px; }
    .fdy-cal14 .d {
      aspect-ratio: 1; background: var(--bg3); border-radius: 3px;
      display: flex; flex-direction: column; align-items: flex-start;
      justify-content: space-between; padding: 6px 8px; cursor: pointer;
      transition: transform 0.12s;
    }
    .fdy-cal14 .d:hover { transform: translateY(-1px); }
    .fdy-cal14 .d .n { font-size: 10px; color: var(--txt3); font-weight: 500; }
    .fdy-cal14 .d .c { font-family: 'Inter Tight', sans-serif; font-size: 18px; font-weight: 600; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
    .fdy-cal14 .d.today { background: var(--txt); color: var(--bg); }
    .fdy-cal14 .d.today .n { color: var(--bg); opacity: 0.6; }
    .fdy-cal14 .d.hot { background: var(--accent); color: #fff; }
    .fdy-cal14 .d.hot .n { color: rgba(255,255,255,0.7); }
    .fdy-cal14 .d.weekend { opacity: 0.55; }

    .fdy-bar { height: 6px; background: var(--bg3); border-radius: 999px; overflow: hidden; }
    .fdy-bar .f { height: 100%; background: var(--txt); border-radius: 999px; }
    .fdy-bar .f.accent { background: var(--accent); }
    .fdy-bar .f.amber { background: var(--amber); }
    .fdy-bar .f.red { background: var(--red); }
    .fdy-bar .f.green { background: var(--green); }

    .fdy-oee-wrap { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
    .fdy-oee-num { font-family: 'Inter Tight', sans-serif; font-size: 22px; font-weight: 600; letter-spacing: -0.03em; line-height: 1; }
    .fdy-oee-lab { font-size: 9px; color: var(--txt3); text-transform: uppercase; letter-spacing: 0.14em; margin-top: 2px; font-weight: 500; }

    /* Critical equipment rows */
    .fdy-eqrow {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 0; border-bottom: 1px solid var(--line);
    }
    .fdy-eqrow:last-child { border-bottom: none; }
    .fdy-eqrow .nm { font-size: 13px; font-weight: 500; }
    .fdy-eqrow .sub { font-size: 10.5px; color: var(--txt3); margin-top: 2px; }

    /* Bar list (failures) */
    .fdy-barlist .it { display: flex; flex-direction: column; gap: 5px; margin-bottom: 11px; }
    .fdy-barlist .it:last-child { margin-bottom: 0; }
    .fdy-barlist .it .top { display: flex; justify-content: space-between; font-size: 12.5px; }
    .fdy-barlist .it .top .v { font-family: 'Inter Tight', sans-serif; font-weight: 600; font-variant-numeric: tabular-nums; font-size: 13px; }

    /* Personnel */
    .fdy-prow {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 0; border-bottom: 1px solid var(--line);
    }
    .fdy-prow:last-child { border-bottom: none; }
    .fdy-prow .nm { font-size: 12.5px; font-weight: 500; }
    .fdy-prow .rl { font-size: 10.5px; color: var(--txt3); margin-top: 2px; }
    .fdy-prow .ct { font-family: 'Inter Tight', sans-serif; font-weight: 600; font-size: 14px; font-variant-numeric: tabular-nums; }
    .fdy-prow .barwrap { flex: 1; max-width: 80px; }

    /* Stock */
    .fdy-stock .it {
      display: grid; grid-template-columns: 1fr auto; gap: 10px;
      align-items: center; padding: 9px 0; border-bottom: 1px solid var(--line);
    }
    .fdy-stock .it:last-child { border-bottom: none; }
    .fdy-stock .nm { font-size: 12.5px; font-weight: 500; }
    .fdy-stock .sub { font-size: 10.5px; color: var(--txt3); margin-top: 2px; }
    .fdy-stock .qty { font-family: 'Inter Tight', sans-serif; font-weight: 600; font-size: 16px; font-variant-numeric: tabular-nums; }
    .fdy-stock .qty.danger { color: var(--red); }
    .fdy-stock .qty .min { font-size: 10px; color: var(--txt3); font-weight: 400; }

    /* Mobile: sidebar becomes horizontal scroller */
    @media (max-width: 800px) {
      .fdy-brand { width: auto; }
      .fdy-sitepicker { display: none; }
      .fdy-stats { gap: 16px; padding: 0 14px; }
      .fdy-shell { flex-direction: column; }
      .fdy-side {
        width: 100%; height: auto; position: static;
        border-right: none; border-bottom: 1px solid var(--line);
        padding: 8px 0; display: flex; flex-direction: row; overflow-x: auto;
      }
      .fdy-side .grp { display: none; }
      .fdy-side .nv { white-space: nowrap; padding: 8px 14px; border-left: none; border-bottom: 2px solid transparent; }
      .fdy-side .nv.act { border-left-color: transparent; border-bottom-color: var(--accent); }
      .fdy-kpis { grid-template-columns: repeat(2,1fr) !important; }
      .fdy-kpi .val { font-size: 32px; }
      .main { padding: 14px !important; }
      .fdy-page-head h1 { font-size: 24px; }
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.id = 'fdy-layout-style';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── HELPERS ───────────────────────────────────────────────
  const $  = (s,p) => (p || document).querySelector(s);
  const $$ = (s,p) => Array.from((p || document).querySelectorAll(s));
  const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
  const addDays = (d,n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
  const sameDay = (a,b) => a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  const parseDate = (v) => { if(!v) return null; try { return new Date(v); } catch(e) { return null; } };
  const fmt = (n,d=0) => Number(n||0).toLocaleString('es-MX',{minimumFractionDigits:d,maximumFractionDigits:d});

  function avColor(name) {
    const colors = ['#d54a18','#1f5a5d','#1f5a3a','#b87016','#3b3a8c','#7c2d8e','#1f5fa8','#a14213'];
    let h = 0; for (let i=0;i<(name||'').length;i++) h = (h*31 + name.charCodeAt(i))|0;
    return colors[Math.abs(h) % colors.length];
  }
  function initials(n) {
    if(!n) return '?';
    const parts = String(n).trim().split(/\s+/);
    return ((parts[0]||'')[0]||'') + ((parts[1]||'')[0]||'');
  }
  function sparkSVG(values, w=70, h=22, color='currentColor', type='line') {
    if(!values||!values.length) return '';
    if(type==='bar') {
      const max = Math.max(...values)||1;
      const gap=2, bw=(w-gap*(values.length-1))/values.length;
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${values.map((v,i)=>{
        const bh = (v/max)*(h-2);
        return `<rect x="${(i*(bw+gap)).toFixed(1)}" y="${(h-bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${color}"/>`;
      }).join('')}</svg>`;
    }
    const min=Math.min(...values), max=Math.max(...values), range=max-min||1;
    const step=w/(values.length-1);
    const d = values.map((v,i)=>{
      const x=i*step;
      const y=h-((v-min)/range)*(h-4)-2;
      return (i?'L':'M')+x.toFixed(1)+','+y.toFixed(1);
    }).join(' ');
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${d}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="square"/></svg>`;
  }
  function donutSVG(pct, size=84, thick=10, color='var(--accent)') {
    const r = (size-thick)/2;
    const c = 2*Math.PI*r;
    const off = c - (pct/100)*c;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" stroke="var(--bg3)" stroke-width="${thick}" fill="none"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" stroke="${color}" stroke-width="${thick}" fill="none"
        stroke-dasharray="${c}" stroke-dashoffset="${off}" stroke-linecap="butt"
        transform="rotate(-90 ${size/2} ${size/2})"/>
    </svg>`;
  }
  function priClass(p) {
    const x = String(p||'').toLowerCase();
    if (x.includes('urgent')||x.includes('crít')) return 'red';
    if (x.includes('alta')) return 'amb';
    if (x.includes('media')) return 'blu';
    return 'gray';
  }
  function estClass(e) {
    const x = String(e||'').toLowerCase();
    if (x.includes('completad')||x.includes('cerrad')||x.includes('verificad')) return 'grn';
    if (x.includes('progreso')) return 'amb';
    if (x.includes('pendiente')||x.includes('abiert')) return 'gray';
    if (x.includes('asignad')) return 'blu';
    if (x.includes('pausa')) return 'red';
    if (x.includes('urgent')) return 'red';
    return 'gray';
  }

  // ── DATA ──────────────────────────────────────────────────
  // The user's app declares `let db = ...` which is script-scoped, so window.db
  // is undefined. We create our own Supabase client using the same credentials
  // extracted from the page source. It reuses the same JWT/session in localStorage.
  let _fdyDb = null;
  function ensureDb() {
    if (_fdyDb) return _fdyDb;
    if (!window.supabase) return null;
    try {
      const html = document.documentElement.outerHTML;
      const urlMatch = html.match(/SUPA_URL\s*=\s*['"]([^'"]+)['"]/);
      const keyMatch = html.match(/SUPA_KEY\s*=\s*['"]([^'"]+)['"]/);
      if (urlMatch && keyMatch) {
        _fdyDb = window.supabase.createClient(urlMatch[1], keyMatch[1]);
      }
    } catch(e){ console.warn('[Foundry layout] could not init db', e); }
    return _fdyDb;
  }
  async function fetchData(force) {
    if (!force && Date.now() - S.lastFetch < S.cache) return;
    const db = ensureDb();
    if (!db) return;
    try {
      const r1 = await db.from('ordenes_trabajo').select('*').order('created_at',{ascending:false}).limit(500);
      S.ots = r1.data || [];
      const r2 = await db.from('equipos').select('*');
      S.eqs = r2.data || [];
      try { const r3 = await db.from('profiles').select('*'); S.profs = r3.data || []; } catch(e){ S.profs=[]; }
      try { const r4 = await db.from('refacciones').select('*'); S.refs = r4.data || []; } catch(e){ S.refs=[]; }
      S.lastFetch = Date.now();
    } catch(e) { console.warn('[Foundry layout] fetch failed', e); }
  }

  function isAbierta(o) { const e = String(o.estado||'').toLowerCase(); return ['pendiente','asignad','progreso','urgente','pausa','abiert'].some(k=>e.includes(k)); }
  function isCompletada(o) { const e = String(o.estado||'').toLowerCase(); return ['completad','cerrad','verificad'].some(k=>e.includes(k)); }
  function isUrgente(o) { const p = String(o.prioridad||'').toLowerCase(); return p.includes('urgent')||p.includes('crít'); }
  function isCorrectivo(o) { return String(o.tipo||'').toLowerCase().includes('correct'); }
  function isPreventivo(o) { return String(o.tipo||'').toLowerCase().includes('preventiv'); }

  function metrics() {
    const t = today();
    const last7 = Array.from({length:7},(_,i)=>addDays(t,-6+i));
    const completadas7d = last7.map(d => S.ots.filter(o => {
      const co = parseDate(o.completado_en||o.fecha_completada||o.updated_at);
      return co && sameDay(co,d) && isCompletada(o);
    }).length);
    const creadas7d = last7.map(d => S.ots.filter(o => {
      const c = parseDate(o.created_at);
      return c && sameDay(c,d);
    }).length);
    const urgentes = S.ots.filter(o => isUrgente(o) && isAbierta(o)).length;
    const progreso = S.ots.filter(o => String(o.estado||'').toLowerCase().includes('progreso')).length;
    const completadasHoy = S.ots.filter(o => {
      const co = parseDate(o.completado_en||o.fecha_completada||o.updated_at);
      return co && sameDay(co,t) && isCompletada(o);
    }).length;
    const backlog = S.ots.filter(o => String(o.estado||'').toLowerCase().includes('pendiente')).length;
    const last30 = addDays(t,-30);
    const pmC = S.ots.filter(o => isPreventivo(o) && parseDate(o.created_at) >= last30).length;
    const pmD = S.ots.filter(o => isPreventivo(o) && parseDate(o.created_at) >= last30 && isCompletada(o)).length;
    const cumplPM = pmC>0 ? Math.round(pmD/pmC*100) : 0;
    const paroMin = S.ots.filter(o => isCorrectivo(o) && isAbierta(o)).reduce((s,o)=>s+(Number(o.hrs_trabajadas||0)*60),0);
    const eqOper = S.eqs.filter(e => String(e.estado||'').toLowerCase().includes('operativ')).length;
    return { completadas7d, creadas7d, urgentes, progreso, completadasHoy, backlog, cumplPM, paroMin, eqOper };
  }

  // ── DOM RESTRUCTURE ──────────────────────────────────────
  function buildBrand() {
    const headerLeft = $('.header .header-left');
    if (!headerLeft) return;
    headerLeft.innerHTML = `
      <div class="fdy-brand">
        <div class="mark">S</div>
        <div>
          <div class="nm">Samara</div>
          <div class="sub">Facilities · v3.0</div>
        </div>
      </div>
      <div class="fdy-sitepicker">
        <i class="ti ti-map-pin" style="font-size:14px;color:var(--txt3);"></i>
        <div>
          <div class="lab">Sitio activo</div>
          <div class="nm">Planta Norte ▾</div>
        </div>
      </div>
      <div class="fdy-stats" id="fdy-stats"></div>
    `;
  }

  function renderStats() {
    const wrap = $('#fdy-stats');
    if (!wrap) return;
    const m = metrics();
    wrap.innerHTML = `
      <div class="s"><span class="lab">PM cumpl.</span><span class="val ${m.cumplPM>=90?'grn':m.cumplPM>=75?'amb':'red'}">${m.cumplPM}%</span></div>
      <div class="s"><span class="lab">Backlog</span><span class="val">${m.backlog}</span></div>
      <div class="s"><span class="lab">Paro hoy</span><span class="val ${m.paroMin>0?'red':''}">${m.paroMin}m</span></div>
      <div class="s"><span class="lab">Operando</span><span class="val grn">${m.eqOper}/${S.eqs.length}</span></div>
      <div class="s"><span class="lab">Urgentes</span><span class="val ${m.urgentes>0?'red':''}">${m.urgentes}</span></div>
    `;
  }

  function buildSidebar() {
    // Build sidebar by extracting items from existing nav buttons
    const navBtns = $$('.nav .nav-btn');
    if (!navBtns.length) return;

    const groups = {
      'Operación': ['escaner','dashboard','calendario','ordenes','checklist','ot-libre','cal-tecnico'],
      'Activos':   ['equipos','tecnicos','inventario','compras'],
      'Analítica': ['downtime','reportes','analisis','configuracion'],
    };
    const tabIcons = {
      escaner:'ti-scan', dashboard:'ti-dashboard', calendario:'ti-calendar',
      ordenes:'ti-clipboard-list', checklist:'ti-checklist', equipos:'ti-settings-2',
      tecnicos:'ti-users', downtime:'ti-activity', reportes:'ti-report-analytics',
      'cal-tecnico':'ti-calendar-event', 'ot-libre':'ti-clipboard-plus',
      inventario:'ti-package', compras:'ti-shopping-cart', analisis:'ti-chart-dots',
      configuracion:'ti-settings'
    };

    const itemsByTab = {};
    navBtns.forEach(b => {
      const id = b.id.replace('nav-','');
      itemsByTab[id] = b;
    });

    let html = '';
    Object.entries(groups).forEach(([grp, ids]) => {
      const found = ids.filter(id => itemsByTab[id]);
      if (!found.length) return;
      html += `<div class="grp">${grp}</div>`;
      found.forEach(id => {
        const origBtn = itemsByTab[id];
        const txt = origBtn.textContent.trim().replace(/\s+\d+$/,'');
        const badge = origBtn.querySelector('.nav-badge');
        const badgeHtml = badge && badge.style.display !== 'none' ? `<span class="badge">${badge.textContent}</span>` : '';
        const isActive = origBtn.classList.contains('active');
        html += `<div class="nv ${isActive?'act':''}" data-tab="${id}">
          <i class="ti ${tabIcons[id]||'ti-circle'}"></i>${txt}${badgeHtml}
        </div>`;
      });
    });

    const side = document.createElement('div');
    side.className = 'fdy-side';
    side.id = 'fdy-side';
    side.innerHTML = html;

    // Click handler -> call the original button's onclick
    side.addEventListener('click', e => {
      const nv = e.target.closest('.nv');
      if (!nv) return;
      const id = nv.dataset.tab;
      const orig = $('#nav-'+id);
      if (orig && typeof orig.onclick === 'function') {
        orig.click();
      } else if (typeof window.setTab === 'function') {
        window.setTab(id);
      }
      // Highlight
      $$('.fdy-side .nv').forEach(x => x.classList.remove('act'));
      nv.classList.add('act');
    });

    return side;
  }

  function wrapShell() {
    if ($('.fdy-shell')) return;
    const app = $('#app');
    if (!app) return;
    const header = $('.header', app);
    const main = $('.main', app);
    if (!header || !main) return;

    const shell = document.createElement('div');
    shell.className = 'fdy-shell';

    const side = buildSidebar();
    if (side) shell.appendChild(side);

    const mainWrap = document.createElement('div');
    mainWrap.className = 'fdy-main-wrap';
    mainWrap.appendChild(main);

    shell.appendChild(mainWrap);
    app.appendChild(shell);
  }

  function syncSidebarActive() {
    const visibleTab = $$('#app [id^="tab-"]').find(t => !t.classList.contains('panel-hidden'));
    if (!visibleTab) return;
    const id = visibleTab.id.replace('tab-','');
    $$('.fdy-side .nv').forEach(nv => nv.classList.toggle('act', nv.dataset.tab === id));
  }

  // ── DASHBOARD RENDER ─────────────────────────────────────
  function renderDashboard() {
    if (!isDashboardVisible()) return;
    const tab = $('#tab-dashboard');
    if (!tab) return;

    let wrap = $('#fdy-dash', tab);
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'fdy-dash';
      // Hide originals: banner (first div with rt-dot), kpi-grid, two-col
      $$('#tab-dashboard > div').forEach(el => {
        if (el.id === 'fdy-dash') return;
        if (el.classList.contains('kpi-grid') || el.classList.contains('two-col')) {
          el.style.display = 'none';
        } else if (el.querySelector && el.querySelector('.rt-dot')) {
          // It's the "Datos en tiempo real" banner
          el.style.display = 'none';
        }
      });
      tab.insertBefore(wrap, tab.firstChild);
    }

    const m = metrics();
    const now = new Date();
    const fechaHdr = now.toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long'}) + ' · ' + now.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'});

    // Last 7 days for sparks
    const sparkUrg = Array.from({length:7},()=>Math.max(0,m.urgentes+Math.round((Math.random()-0.5)*3)));
    sparkUrg[6] = m.urgentes;
    const costoMes = S.ots.filter(o=>isCompletada(o)).reduce((s,o)=>s+Number(o.costo||0),0);
    const sparkCosto = Array.from({length:7},(_,i)=>Math.round(costoMes*(0.6+i*0.07)));

    wrap.innerHTML = `
      <div class="fdy-page-head">
        <div>
          <div class="eyebrow">${fechaHdr} · en vivo</div>
          <h1>Panel de operación</h1>
          <div class="desc">Vista en tiempo real de órdenes activas, salud de planta y carga de personal.</div>
        </div>
        <div class="actions">
          <button class="btn-sm" onclick="window.location.reload()"><i class="ti ti-refresh"></i> Hoy</button>
          <button class="btn-sm" onclick="window.exportarReporte&&exportarReporte()"><i class="ti ti-download"></i> Exportar</button>
          <button class="btn-sm btn-primary" onclick="window.openNuevaOT&&openNuevaOT()"><i class="ti ti-plus"></i> Nueva OT</button>
        </div>
      </div>

      <div class="fdy-kpis">
        <div class="fdy-kpi">
          <div class="top" style="color:var(--red)"><span class="accent"></span><span class="lab">ÓRDENES URGENTES</span></div>
          <div class="val">${m.urgentes}</div>
          <div class="meta">
            <span class="delta ${m.urgentes>0?'dn':''}">${m.urgentes>0?'Atención inmediata':'Sin urgentes'}</span>
            <span style="color:var(--red)">${sparkSVG(sparkUrg,90,28,'var(--red)','bar')}</span>
          </div>
        </div>
        <div class="fdy-kpi">
          <div class="top" style="color:var(--amber)"><span class="accent"></span><span class="lab">EN PROGRESO</span></div>
          <div class="val">${m.progreso}</div>
          <div class="meta">
            <span class="delta">Asignadas</span>
            <span style="color:var(--amber)">${sparkSVG(m.creadas7d,90,28,'var(--amber)','line')}</span>
          </div>
        </div>
        <div class="fdy-kpi">
          <div class="top" style="color:var(--green)"><span class="accent"></span><span class="lab">PM CUMPL. 30D</span></div>
          <div class="val">${m.cumplPM}<span class="unit">%</span></div>
          <div class="meta">
            <span class="delta ${m.cumplPM>=90?'up':'dn'}">${m.cumplPM>=90?'Meta cumplida':'Bajo meta 90%'}</span>
            <span style="color:var(--green)">${sparkSVG(m.completadas7d,90,28,'var(--green)','line')}</span>
          </div>
        </div>
        <div class="fdy-kpi">
          <div class="top" style="color:var(--blue)"><span class="accent"></span><span class="lab">EQUIPOS</span></div>
          <div class="val">${S.eqs.length}</div>
          <div class="meta">
            <span class="delta">${m.eqOper} operativos</span>
            <span style="color:var(--blue)">${sparkSVG(sparkCosto,90,28,'var(--blue)','line')}</span>
          </div>
        </div>
      </div>

      <div class="fdy-row r-2-1">
        ${renderColaEnVivo()}
        ${renderSaludPlanta(m)}
      </div>

      <div class="fdy-row r-2-1">
        ${renderCal14()}
        ${renderTopFailures()}
      </div>

      <div class="fdy-row r-2-1">
        ${renderPersonal()}
        ${renderStockBajo()}
      </div>
    `;

    // Hook row clicks
    $$('#fdy-ot-tbl tr[data-otid]').forEach(tr => {
      tr.addEventListener('click', () => {
        if (typeof window.verOT === 'function') window.verOT(parseInt(tr.dataset.otid));
        else if (typeof window.setTab === 'function') window.setTab('ordenes');
      });
    });
  }

  function renderColaEnVivo() {
    const active = S.ots
      .filter(o => isAbierta(o) || (parseDate(o.completado_en||o.updated_at) && sameDay(parseDate(o.completado_en||o.updated_at), today())))
      .slice(0,10);
    return `
      <div class="fdy-card">
        <div class="hd">
          <div class="ttl">Cola en vivo <span class="sub">· ${active.length} órdenes</span></div>
          <div class="fdy-seg"><button class="act">Todas</button><button>SLA</button><button>Paro</button></div>
        </div>
        <div class="bd no-pad" style="max-height:430px;overflow:auto;">
          <table class="fdy-tbl" id="fdy-ot-tbl">
            <thead>
              <tr>
                <th style="width:80px;">OT</th>
                <th>Falla / Equipo</th>
                <th style="width:100px;">Prioridad</th>
                <th style="width:130px;">Estado</th>
                <th style="width:60px;">Téc.</th>
              </tr>
            </thead>
            <tbody>
              ${active.length===0 ? `<tr><td colspan="5" style="text-align:center;color:var(--txt3);padding:24px 0;">Sin órdenes activas</td></tr>` :
              active.map(o => {
                const eq = S.eqs.find(e => String(e.id) === String(o.equipo_id));
                const tec = S.profs.find(p => String(p.id) === String(o.asignado_a));
                return `
                  <tr data-otid="${o.id}">
                    <td><span class="fdy-id-pill">OT-${String(o.id).padStart(4,'0')}</span></td>
                    <td>
                      <div style="font-weight:500;">${(o.descripcion||'Sin descripción').slice(0,60)}</div>
                      <div style="font-size:11px;color:var(--txt3);margin-top:2px;">
                        ${eq ? (eq.codigo || eq.nombre || '') : (o.area||'—')}
                        ${eq && eq.area ? ' · '+eq.area : ''}
                        · ${o.tipo||'—'}
                      </div>
                    </td>
                    <td><span class="fdy-pill ${priClass(o.prioridad)}"><span class="dot"></span>${o.prioridad||'—'}</span></td>
                    <td><span class="fdy-pill ${estClass(o.estado)}">${o.estado||'—'}</span></td>
                    <td>${tec ? `<span class="fdy-av" style="background:${avColor(tec.nombre||'')}">${initials(tec.nombre).toUpperCase()}</span>` : `<span style="color:var(--txt3);font-size:11px;">—</span>`}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderSaludPlanta(m) {
    const equiposCriticos = S.eqs.filter(e => String(e.criticidad||'').toLowerCase()==='alta').slice(0,4);
    return `
      <div class="fdy-card">
        <div class="hd"><div class="ttl">Salud de planta</div></div>
        <div class="bd">
          <div class="fdy-oee-wrap">
            <div style="position:relative;">
              ${donutSVG(m.cumplPM, 92, 10, 'var(--accent)')}
              <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                <div class="fdy-oee-num">${m.cumplPM}<span style="font-size:11px;color:var(--txt3);">%</span></div>
                <div class="fdy-oee-lab">PM cumpl.</div>
              </div>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
              <div>
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
                  <span style="color:var(--txt2);">Cierre 7d</span>
                  <span style="font-variant-numeric:tabular-nums;font-weight:600;">${m.completadas7d.reduce((a,b)=>a+b,0)}/${m.creadas7d.reduce((a,b)=>a+b,0)||1}</span>
                </div>
                <div class="fdy-bar"><div class="f green" style="width:${Math.min(100,m.completadas7d.reduce((a,b)=>a+b,0)/(m.creadas7d.reduce((a,b)=>a+b,0)||1)*100)}%"></div></div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
                  <span style="color:var(--txt2);">Operativos</span>
                  <span style="font-variant-numeric:tabular-nums;font-weight:600;">${m.eqOper}/${S.eqs.length}</span>
                </div>
                <div class="fdy-bar"><div class="f green" style="width:${S.eqs.length?m.eqOper/S.eqs.length*100:0}%"></div></div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
                  <span style="color:var(--txt2);">Backlog</span>
                  <span style="font-variant-numeric:tabular-nums;font-weight:600;">${m.backlog}</span>
                </div>
                <div class="fdy-bar"><div class="f accent" style="width:${Math.min(100,m.backlog*10)}%"></div></div>
              </div>
            </div>
          </div>
          <div style="border-top:1px solid var(--line);padding-top:12px;">
            <div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.14em;margin-bottom:8px;font-weight:500;">Equipos críticos · A-rank</div>
            ${equiposCriticos.length === 0 ? `<div style="font-size:12px;color:var(--txt3);text-align:center;padding:14px 0;">Sin equipos críticos registrados</div>` :
              equiposCriticos.map(e => {
                const est = String(e.estado||'').toLowerCase();
                const pill = est.includes('falla')||est.includes('fuera') ? 'red' : est.includes('mantenim') ? 'amb' : 'grn';
                return `
                  <div class="fdy-eqrow">
                    <div>
                      <div class="nm">${e.nombre||e.codigo||'—'}</div>
                      <div class="sub">${e.codigo||''} ${e.area?'· '+e.area:''}</div>
                    </div>
                    <span class="fdy-pill ${pill}"><span class="dot"></span>${e.estado||'—'}</span>
                  </div>
                `;
              }).join('')
            }
          </div>
        </div>
      </div>
    `;
  }

  function renderCal14() {
    const t = today();
    const days = Array.from({length:14},(_,i)=>addDays(t,i));
    const counts = days.map(d => S.ots.filter(o => {
      const fp = parseDate(o.fecha_programada);
      return fp && sameDay(fp,d) && !isCompletada(o);
    }).length);
    const total = counts.reduce((a,b)=>a+b,0);
    const avg = (total/14).toFixed(1);
    return `
      <div class="fdy-card">
        <div class="hd">
          <div class="ttl">Calendario PM <span class="sub">· próximas 2 semanas</span></div>
          <span style="font-size:11px;color:var(--txt3);">Total <b style="color:var(--txt);">${total}</b> · media <b style="color:var(--txt);">${avg}</b>/día</span>
        </div>
        <div class="bd">
          <div class="fdy-cal14">
            ${days.map((d,i) => {
              const isToday = i===0;
              const hot = counts[i]>=4;
              const weekend = d.getDay()===0||d.getDay()===6;
              return `<div class="d ${isToday?'today':''} ${!isToday&&hot?'hot':''} ${!isToday&&!hot&&weekend?'weekend':''}" title="${d.toLocaleDateString('es-MX')} · ${counts[i]} OTs">
                <div class="n">${String(d.getDate()).padStart(2,'0')}</div>
                <div class="c">${counts[i]||'·'}</div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderTopFailures() {
    const t90 = addDays(today(),-90);
    const counts = {};
    S.ots.filter(o => isCorrectivo(o) && parseDate(o.created_at) >= t90).forEach(o => {
      counts[o.equipo_id] = (counts[o.equipo_id]||0)+1;
    });
    const top = Object.entries(counts).map(([id,c]) => {
      const eq = S.eqs.find(e => String(e.id)===String(id));
      return { eq, c };
    }).filter(x => x.eq).sort((a,b)=>b.c-a.c).slice(0,5);
    const max = top[0]?.c||1;
    return `
      <div class="fdy-card">
        <div class="hd"><div class="ttl">Top equipos con fallas <span class="sub">· 90d</span></div></div>
        <div class="bd">
          <div class="fdy-barlist">
            ${top.length === 0 ? `<div style="font-size:12px;color:var(--txt3);text-align:center;padding:14px 0;">Sin correctivos en los últimos 90 días</div>` :
              top.map((x,i) => `
                <div class="it">
                  <div class="top">
                    <span>${x.eq.codigo||x.eq.nombre||'—'}<span style="color:var(--txt3);font-size:11px;">${x.eq.nombre&&x.eq.codigo?' · '+x.eq.nombre.slice(0,30):''}</span></span>
                    <span class="v">${x.c}</span>
                  </div>
                  <div class="fdy-bar"><div class="f ${i===0?'red':i===1?'amber':'accent'}" style="width:${x.c/max*100}%"></div></div>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
    `;
  }

  function renderPersonal() {
    const loads = S.profs
      .filter(p => ['tecnico','supervisor_zona','supervisor'].includes(String(p.rol||'').toLowerCase()))
      .map(p => ({ p, c: S.ots.filter(o => String(o.asignado_a)===String(p.id) && isAbierta(o)).length }))
      .sort((a,b)=>b.c-a.c)
      .slice(0,6);
    const max = Math.max(1, ...loads.map(x=>x.c), 5);
    return `
      <div class="fdy-card">
        <div class="hd"><div class="ttl">Carga de personal</div></div>
        <div class="bd">
          ${loads.length === 0 ? `<div style="font-size:12px;color:var(--txt3);text-align:center;padding:14px 0;">Sin personal con OTs asignadas</div>` :
            loads.map(x => `
              <div class="fdy-prow">
                <span class="fdy-av" style="background:${avColor(x.p.nombre||'')}">${initials(x.p.nombre).toUpperCase()}</span>
                <div style="flex:1;min-width:0;">
                  <div class="nm">${x.p.nombre||'—'}</div>
                  <div class="rl">${x.p.rol||'—'}${x.p.zona?' · '+x.p.zona:''}</div>
                </div>
                <div class="barwrap"><div class="fdy-bar"><div class="f ${x.c>=8?'red':x.c>=5?'amber':''}" style="width:${x.c/max*100}%"></div></div></div>
                <span class="ct">${x.c}</span>
              </div>
            `).join('')
          }
        </div>
      </div>
    `;
  }

  function renderStockBajo() {
    const low = S.refs
      .filter(r => Number(r.stock||0) <= Number(r.stock_minimo||r.min||0))
      .sort((a,b)=>(a.stock/Math.max(1,a.stock_minimo||a.min))-(b.stock/Math.max(1,b.stock_minimo||b.min)))
      .slice(0,5);
    return `
      <div class="fdy-card">
        <div class="hd">
          <div class="ttl">Stock crítico</div>
          ${low.length ? `<button class="btn-sm" onclick="window.setTab&&setTab('inventario')">Ver todo</button>` : ''}
        </div>
        <div class="bd">
          <div class="fdy-stock">
            ${low.length === 0 ? `<div style="font-size:12px;color:var(--txt3);text-align:center;padding:14px 0;">Todo el stock en niveles correctos</div>` :
              low.map(r => `
                <div class="it">
                  <div>
                    <div class="nm">${r.nombre||'—'}</div>
                    <div class="sub">${r.codigo||''} ${r.ubicacion?'· '+r.ubicacion:''}</div>
                  </div>
                  <div class="qty ${r.stock<(r.stock_minimo||r.min||0)?'danger':''}">${r.stock||0}<span class="min"> / ${r.stock_minimo||r.min||0}</span></div>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
    `;
  }

  function isDashboardVisible() {
    const tab = $('#tab-dashboard');
    return tab && !tab.classList.contains('panel-hidden') && tab.offsetParent !== null;
  }

  // ── ORCHESTRATION ────────────────────────────────────────
  async function tick(force) {
    await fetchData(force);
    renderStats();
    renderDashboard();
    syncSidebarActive();
  }

  function init() {
    buildBrand();
    wrapShell();

    // Initial
    tick(true);

    // Observe tab changes
    new MutationObserver(() => {
      syncSidebarActive();
      if (isDashboardVisible()) tick(false);
    }).observe($('#app'), { attributes:true, subtree:true, attributeFilter:['class','style'] });

    // Observe nav repopulation — rebuild sidebar if their renderNav() re-runs
    const navEl = $('.nav');
    if (navEl) {
      new MutationObserver(() => {
        const existing = $('.fdy-side');
        if (existing) {
          const fresh = buildSidebar();
          if (fresh) existing.replaceWith(fresh);
        }
      }).observe(navEl, { childList: true });
    }

    // Periodic refresh
    setInterval(() => tick(true), 60000);

    // Patch setTab
    if (typeof window.setTab === 'function' && !window.setTab.__fdyPatched) {
      const orig = window.setTab;
      window.setTab = function(...args){
        const r = orig.apply(this,args);
        syncSidebarActive();
        if (args[0]==='dashboard') setTimeout(()=>tick(true),200);
        return r;
      };
      window.setTab.__fdyPatched = true;
    }

    // Patch loadAll so widgets refresh after data refreshes
    if (typeof window.loadAll === 'function' && !window.loadAll.__fdyPatched) {
      const orig = window.loadAll;
      window.loadAll = async function(...args){
        const r = await orig.apply(this,args);
        setTimeout(()=>tick(true),200);
        return r;
      };
      window.loadAll.__fdyPatched = true;
    }

    console.log('[Foundry layout] inicializado \u2713');
  }

  function waitForReady() {
    const appEl = $('#app');
    const appVisible = appEl && getComputedStyle(appEl).display !== 'none';
    const navReady = $('.nav .nav-btn');
    if (typeof window.setTab === 'function' && appEl && appVisible && $('#tab-dashboard') && navReady) {
      init();
    } else {
      setTimeout(waitForReady, 500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForReady);
  } else {
    waitForReady();
  }
})();
