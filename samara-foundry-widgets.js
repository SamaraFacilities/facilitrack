/* ============================================================
   SAMARA · FOUNDRY WIDGETS
   Inyecta widgets adicionales en el dashboard usando los datos
   de Supabase que ya tienes. No toca nada del código existente.

   Uso:
     <script src="samara-foundry-widgets.js"></script>
   Pega esto JUSTO ANTES de </body> en tu index.html.
   ============================================================ */

(function(){
  'use strict';

  // ── STATE ─────────────────────────────────────────────────
  const S = {
    ots: [], eqs: [], profs: [], refs: [],
    lastFetch: 0,
    cache: 30000, // 30s
  };

  // ── ESTILOS ───────────────────────────────────────────────
  const css = `
    /* Ticker en header */
    .fdy-ticker {
      display: flex; align-items: center; gap: 22px;
      padding: 0 18px; margin-right: auto; margin-left: 18px;
      border-left: 1px solid var(--line);
      border-right: 1px solid var(--line);
      height: 56px;
    }
    .fdy-ticker .s { display: flex; align-items: baseline; gap: 6px; }
    .fdy-ticker .lab { font-size: 9.5px; color: var(--txt3); text-transform: uppercase; letter-spacing: 0.14em; font-weight: 500; }
    .fdy-ticker .val {
      font-family: 'Inter Tight', sans-serif; font-size: 18px; font-weight: 600;
      letter-spacing: -0.02em; font-variant-numeric: tabular-nums;
      color: var(--txt);
    }
    .fdy-ticker .val.red { color: var(--red); }
    .fdy-ticker .val.grn { color: var(--green); }
    .fdy-ticker .val.amb { color: var(--amber); }
    @media (max-width: 1100px) { .fdy-ticker { display: none; } }

    /* Sparkline en KPI */
    .fdy-spark { margin-top: 8px; color: var(--txt2); }
    .fdy-kpi-delta {
      display: inline-block; font-size: 10.5px; font-weight: 500;
      padding: 2px 8px; border-radius: 999px;
      margin-top: 8px; font-variant-numeric: tabular-nums;
      background: var(--bg3);
    }
    .fdy-kpi-delta.up { color: var(--green); }
    .fdy-kpi-delta.dn { color: var(--red); }

    /* Widget grid */
    .fdy-row { display: grid; gap: 14px; margin-bottom: 14px; }
    .fdy-row.r-2-1 { grid-template-columns: 2fr 1fr; }
    .fdy-row.r-3 { grid-template-columns: 1fr 1fr 1fr; }
    @media (max-width: 900px) {
      .fdy-row.r-2-1, .fdy-row.r-3 { grid-template-columns: 1fr; }
    }

    /* Cal 14 */
    .fdy-cal14 { display: grid; grid-template-columns: repeat(14,1fr); gap: 4px; }
    .fdy-cal14 .d {
      aspect-ratio: 1; background: var(--bg3); border-radius: 3px;
      display: flex; flex-direction: column; align-items: flex-start;
      justify-content: space-between; padding: 6px 8px; cursor: pointer;
      transition: transform .12s;
    }
    .fdy-cal14 .d:hover { transform: translateY(-1px); }
    .fdy-cal14 .d .n { font-size: 10px; color: var(--txt3); font-weight: 500; }
    .fdy-cal14 .d .c {
      font-family: 'Inter Tight', sans-serif; font-size: 18px; font-weight: 600;
      letter-spacing: -0.03em; font-variant-numeric: tabular-nums;
    }
    .fdy-cal14 .d.today { background: var(--txt); color: var(--bg); }
    .fdy-cal14 .d.today .n { color: var(--bg); opacity: 0.6; }
    .fdy-cal14 .d.hot { background: var(--accent); color: #fff; }
    .fdy-cal14 .d.hot .n { color: rgba(255,255,255,0.7); }
    .fdy-cal14 .d.weekend { opacity: 0.55; }

    /* Bar list */
    .fdy-barlist .it { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }
    .fdy-barlist .it:last-child { margin-bottom: 0; }
    .fdy-barlist .it .top { display: flex; justify-content: space-between; font-size: 12.5px; }
    .fdy-barlist .it .top .v {
      font-family: 'Inter Tight', sans-serif; font-weight: 600;
      font-variant-numeric: tabular-nums; font-size: 13px;
    }
    .fdy-bar { height: 6px; background: var(--bg3); border-radius: 999px; overflow: hidden; }
    .fdy-bar .f { height: 100%; background: var(--txt); border-radius: 999px; }
    .fdy-bar .f.accent { background: var(--accent); }
    .fdy-bar .f.amber { background: var(--amber); }
    .fdy-bar .f.red { background: var(--red); }
    .fdy-bar .f.green { background: var(--green); }

    /* Donut overlay */
    .fdy-oee-wrap { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; }
    .fdy-oee-num {
      font-family: 'Inter Tight', sans-serif; font-size: 26px; font-weight: 600;
      letter-spacing: -0.03em; line-height: 1;
    }
    .fdy-oee-lab { font-size: 9px; color: var(--txt3); text-transform: uppercase; letter-spacing: 0.14em; margin-top: 2px; font-weight: 500; }

    /* Person rows */
    .fdy-prow { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--line); }
    .fdy-prow:last-child { border-bottom: none; }
    .fdy-prow .av {
      width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
      font-size: 11px; font-weight: 600; color: #fff; flex-shrink: 0;
    }
    .fdy-prow .nm { font-size: 12.5px; font-weight: 500; }
    .fdy-prow .rl { font-size: 10.5px; color: var(--txt3); }
    .fdy-prow .ct {
      font-family: 'Inter Tight', sans-serif; font-weight: 600; font-size: 14px;
      font-variant-numeric: tabular-nums; margin-left: auto;
    }
    .fdy-prow .barwrap { flex: 1; max-width: 90px; }

    /* Stock */
    .fdy-stock .it { display: grid; grid-template-columns: 1fr auto auto; gap: 10px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--line); }
    .fdy-stock .it:last-child { border-bottom: none; }
    .fdy-stock .nm { font-size: 12.5px; font-weight: 500; }
    .fdy-stock .sub { font-size: 10.5px; color: var(--txt3); }
    .fdy-stock .qty {
      font-family: 'Inter Tight', sans-serif; font-weight: 600; font-size: 16px;
      font-variant-numeric: tabular-nums;
    }
    .fdy-stock .qty.danger { color: var(--red); }

    /* Card sub-header */
    .fdy-sub { font-size: 11px; color: var(--txt3); margin-top: 10px; }

    /* Hide redundant "Datos en tiempo real" banner */
    #tab-dashboard > div:first-child { display: none !important; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── HELPERS ───────────────────────────────────────────────
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => Array.from((p || document).querySelectorAll(s));
  const fmt = (n, d = 0) => Number(n||0).toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });
  const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
  const sameDay = (a, b) => a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  const parseDate = (v) => { if (!v) return null; try { return new Date(v); } catch(e) { return null; } };

  function avColor(name) {
    const colors = ['#d54a18','#1f5a5d','#1f5a3a','#b87016','#3b3a8c','#7c2d8e','#1f5fa8','#a14213'];
    let h = 0; for (let i = 0; i < (name||'').length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
    return colors[Math.abs(h) % colors.length];
  }
  function initials(n) {
    if (!n) return '?';
    const parts = String(n).trim().split(/\s+/);
    return ((parts[0]||'')[0]||'') + ((parts[1]||'')[0]||'');
  }

  function sparkPath(values, w, h) {
    if (!values || values.length < 2) return '';
    const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
    const step = w / (values.length - 1);
    return values.map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
  }

  function sparkSVG(values, w = 70, h = 22, color = 'currentColor', type = 'line') {
    if (!values || !values.length) return '';
    if (type === 'bar') {
      const max = Math.max(...values) || 1;
      const gap = 2, bw = (w - gap * (values.length - 1)) / values.length;
      const bars = values.map((v, i) => {
        const bh = (v / max) * (h - 2);
        return `<rect x="${(i*(bw+gap)).toFixed(1)}" y="${(h-bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${color}"/>`;
      }).join('');
      return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${bars}</svg>`;
    }
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${sparkPath(values, w, h)}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="square"/></svg>`;
  }

  function donutSVG(pct, size = 84, thick = 10, color = 'var(--green)') {
    const r = (size - thick) / 2;
    const c = 2 * Math.PI * r;
    const off = c - (pct / 100) * c;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" stroke="var(--bg3)" stroke-width="${thick}" fill="none"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" stroke="${color}" stroke-width="${thick}" fill="none"
        stroke-dasharray="${c}" stroke-dashoffset="${off}" stroke-linecap="butt"
        transform="rotate(-90 ${size/2} ${size/2})"/>
    </svg>`;
  }

  // ── DATA FETCH ────────────────────────────────────────────
  async function fetchData(force) {
    if (!force && Date.now() - S.lastFetch < S.cache) return;
    if (!window.db) return;
    try {
      // Prefer their globals if available, fall back to direct query
      if (window.allOTs && window.allOTs.length) S.ots = window.allOTs;
      else {
        const r = await window.db.from('ordenes_trabajo').select('*').order('created_at', { ascending: false }).limit(500);
        S.ots = r.data || [];
      }

      if (window.allEqs && window.allEqs.length) S.eqs = window.allEqs;
      else {
        const r = await window.db.from('equipos').select('*');
        S.eqs = r.data || [];
      }

      if (window.allProfs && window.allProfs.length) S.profs = window.allProfs;
      else {
        try {
          const r = await window.db.from('profiles').select('*');
          S.profs = r.data || [];
        } catch (e) { S.profs = []; }
      }

      if (window.allRefacciones && window.allRefacciones.length) S.refs = window.allRefacciones;
      else {
        try {
          const r = await window.db.from('refacciones').select('*');
          S.refs = r.data || [];
        } catch (e) { S.refs = []; }
      }

      S.lastFetch = Date.now();
    } catch (e) {
      console.warn('[Foundry widgets] fetch failed', e);
    }
  }

  // ── METRICS ───────────────────────────────────────────────
  function isEstado(ot, names) {
    const e = String(ot.estado || '').toLowerCase();
    return names.some(n => e.includes(n.toLowerCase()));
  }
  function isAbierta(ot) { return isEstado(ot, ['pendiente','asignad','progreso','urgente']); }
  function isCompletada(ot) { return isEstado(ot, ['completad','cerrad','verificad']); }
  function isUrgente(ot) {
    const p = String(ot.prioridad || '').toLowerCase();
    return p.includes('urgent') || p.includes('crít');
  }
  function isCorrectivo(ot) { return String(ot.tipo || '').toLowerCase().includes('correct'); }
  function isPreventivo(ot) { return String(ot.tipo || '').toLowerCase().includes('preventiv'); }

  function metrics() {
    const t = today();
    const last7 = Array.from({length:7}, (_,i) => addDays(t, -6 + i));
    const completadas7d = last7.map(d => S.ots.filter(o => {
      const co = parseDate(o.completado_en || o.fecha_completada || o.updated_at);
      return co && sameDay(co, d) && isCompletada(o);
    }).length);

    const creadas7d = last7.map(d => S.ots.filter(o => {
      const c = parseDate(o.created_at);
      return c && sameDay(c, d);
    }).length);

    const urgentes = S.ots.filter(o => isUrgente(o) && isAbierta(o)).length;
    const progreso = S.ots.filter(o => isEstado(o,['progreso'])).length;
    const completadasHoy = S.ots.filter(o => {
      const co = parseDate(o.completado_en || o.fecha_completada || o.updated_at);
      return co && sameDay(co, t) && isCompletada(o);
    }).length;
    const backlog = S.ots.filter(o => isEstado(o,['pendiente'])).length;

    // PM cumplimiento (últimos 30d)
    const last30 = addDays(t, -30);
    const pmCreadas = S.ots.filter(o => isPreventivo(o) && parseDate(o.created_at) >= last30).length;
    const pmCompletadas = S.ots.filter(o => isPreventivo(o) && parseDate(o.created_at) >= last30 && isCompletada(o)).length;
    const cumplPM = pmCreadas > 0 ? Math.round(pmCompletadas/pmCreadas*100) : 0;

    // Paro acumulado hoy (correctivos en progreso, hrs_trabajadas)
    const paroMin = S.ots.filter(o => isCorrectivo(o) && isAbierta(o))
      .reduce((s,o) => s + (Number(o.hrs_trabajadas||0)*60), 0);

    return { completadas7d, creadas7d, urgentes, progreso, completadasHoy, backlog, cumplPM, paroMin };
  }

  // ── RENDERERS ─────────────────────────────────────────────
  function renderTicker() {
    const m = metrics();
    const headerRight = $('.header .header-right');
    if (!headerRight) return;
    let t = $('.fdy-ticker');
    if (!t) {
      t = document.createElement('div');
      t.className = 'fdy-ticker';
      // Insert at the start of header-right so it sits after logo/title
      const header = $('.header');
      header.insertBefore(t, headerRight);
    }
    t.innerHTML = `
      <div class="s"><span class="lab">PM cumpl.</span><span class="val ${m.cumplPM >= 90 ? 'grn' : m.cumplPM >= 75 ? 'amb' : 'red'}">${m.cumplPM}%</span></div>
      <div class="s"><span class="lab">Backlog</span><span class="val">${m.backlog}</span></div>
      <div class="s"><span class="lab">Paro hoy</span><span class="val ${m.paroMin > 0 ? 'red' : ''}">${m.paroMin}m</span></div>
      <div class="s"><span class="lab">Equipos</span><span class="val">${S.eqs.length}</span></div>
    `;
  }

  function renderKpiSparklines() {
    const m = metrics();
    const cards = $$('#tab-dashboard .kpi-card');
    if (cards.length < 4) return;
    const sparks = [
      { values: [m.urgentes-2, m.urgentes-1, m.urgentes, m.urgentes-1, m.urgentes, m.urgentes, m.urgentes].map(v=>Math.max(0,v)), type:'bar', color:'var(--red)' },
      { values: m.creadas7d, type:'line', color:'var(--amber)' },
      { values: m.completadas7d, type:'line', color:'var(--green)' },
      { values: [S.eqs.length-2, S.eqs.length-1, S.eqs.length, S.eqs.length, S.eqs.length, S.eqs.length, S.eqs.length].map(v=>Math.max(0,v)), type:'line', color:'var(--blue)' },
    ];
    cards.forEach((card, i) => {
      if (i >= sparks.length) return;
      let spark = card.querySelector('.fdy-spark');
      if (!spark) {
        spark = document.createElement('div');
        spark.className = 'fdy-spark';
        card.appendChild(spark);
      }
      const s = sparks[i];
      spark.style.color = s.color;
      spark.innerHTML = sparkSVG(s.values, 110, 26, s.color, s.type);
    });
  }

  function renderCalendar14() {
    const t = today();
    const days = Array.from({length:14}, (_,i) => addDays(t, i));
    const counts = days.map(d =>
      S.ots.filter(o => {
        const fp = parseDate(o.fecha_programada);
        return fp && sameDay(fp, d) && !isCompletada(o);
      }).length
    );
    const total = counts.reduce((a,b)=>a+b,0);
    const avg = (total/14).toFixed(1);
    return `
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="ti ti-calendar"></i> Próximas 2 semanas · PM y correctivos</div>
          <span style="font-size:11px;color:var(--txt3);">Total <b style="color:var(--txt);font-variant-numeric:tabular-nums;">${total}</b> · media <b style="color:var(--txt);">${avg}</b>/día</span>
        </div>
        <div class="fdy-cal14">
          ${days.map((d,i) => {
            const today = i === 0;
            const hot = counts[i] >= 4;
            const weekend = d.getDay() === 0 || d.getDay() === 6;
            return `<div class="d ${today?'today':''} ${!today&&hot?'hot':''} ${!today&&!hot&&weekend?'weekend':''}" title="${d.toLocaleDateString('es-MX')} · ${counts[i]} OTs">
              <div class="n">${String(d.getDate()).padStart(2,'0')}</div>
              <div class="c">${counts[i]||'·'}</div>
            </div>`;
          }).join('')}
        </div>
        <div class="fdy-sub" style="display:flex;gap:16px;align-items:center;">
          <span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;background:var(--txt);border-radius:2px;"></span>Hoy</span>
          <span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:10px;height:10px;background:var(--accent);border-radius:2px;"></span>Alta carga (≥4)</span>
        </div>
      </div>
    `;
  }

  function renderOEE() {
    const m = metrics();
    return `
      <div class="card">
        <div class="card-header"><div class="card-title"><i class="ti ti-activity"></i> Salud de operación</div></div>
        <div class="fdy-oee-wrap">
          <div style="position:relative;">
            ${donutSVG(m.cumplPM, 92, 10, 'var(--accent)')}
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
              <div class="fdy-oee-num">${m.cumplPM}%</div>
              <div class="fdy-oee-lab">PM cumpl.</div>
            </div>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
            <div>
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
                <span style="color:var(--txt2);">Tasa cierre 7d</span>
                <span style="font-variant-numeric:tabular-nums;font-weight:600;">${m.completadas7d.reduce((a,b)=>a+b,0)}/${m.creadas7d.reduce((a,b)=>a+b,0)||1}</span>
              </div>
              <div class="fdy-bar"><div class="f green" style="width:${Math.min(100, m.completadas7d.reduce((a,b)=>a+b,0)/(m.creadas7d.reduce((a,b)=>a+b,0)||1)*100)}%"></div></div>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
                <span style="color:var(--txt2);">Backlog vs activos</span>
                <span style="font-variant-numeric:tabular-nums;font-weight:600;">${m.backlog} / ${m.urgentes+m.progreso}</span>
              </div>
              <div class="fdy-bar"><div class="f ${m.backlog > m.progreso*2 ? 'red' : 'accent'}" style="width:${Math.min(100, m.backlog/Math.max(1,m.backlog+m.progreso)*100)}%"></div></div>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
                <span style="color:var(--txt2);">Equipos operativos</span>
                <span style="font-variant-numeric:tabular-nums;font-weight:600;">${S.eqs.filter(e=>String(e.estado||'').toLowerCase().includes('operativ')).length}/${S.eqs.length}</span>
              </div>
              <div class="fdy-bar"><div class="f green" style="width:${S.eqs.length ? S.eqs.filter(e=>String(e.estado||'').toLowerCase().includes('operativ')).length/S.eqs.length*100 : 0}%"></div></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderTopFailures() {
    // Equipos con más correctivos (últimos 90d)
    const t90 = addDays(today(), -90);
    const counts = {};
    S.ots.filter(o => isCorrectivo(o) && parseDate(o.created_at) >= t90).forEach(o => {
      counts[o.equipo_id] = (counts[o.equipo_id]||0) + 1;
    });
    const top = Object.entries(counts).map(([id,c]) => {
      const eq = S.eqs.find(e => String(e.id) === String(id));
      return { eq, c };
    }).filter(x => x.eq).sort((a,b) => b.c - a.c).slice(0,5);
    const max = top[0]?.c || 1;
    return `
      <div class="card">
        <div class="card-header"><div class="card-title"><i class="ti ti-alert-triangle"></i> Top equipos con fallas · 90d</div></div>
        <div class="fdy-barlist">
          ${top.length === 0 ? '<div style="font-size:12px;color:var(--txt3);text-align:center;padding:18px 0;">Sin correctivos registrados</div>' : top.map((x,i) => `
            <div class="it">
              <div class="top">
                <span>${x.eq.codigo || x.eq.nombre || '—'} <span style="color:var(--txt3);font-size:11px;">${x.eq.nombre && x.eq.codigo ? '· '+x.eq.nombre : ''}</span></span>
                <span class="v">${x.c}</span>
              </div>
              <div class="fdy-bar"><div class="f ${i===0?'red':i===1?'amber':'accent'}" style="width:${x.c/max*100}%"></div></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderPersonalLoad() {
    const loads = S.profs
      .filter(p => ['tecnico','supervisor_zona','supervisor'].includes(String(p.rol||'').toLowerCase()))
      .map(p => ({
        p,
        c: S.ots.filter(o => String(o.asignado_a) === String(p.id) && isAbierta(o)).length
      }))
      .sort((a,b) => b.c - a.c)
      .slice(0,6);
    const max = Math.max(1, ...loads.map(x=>x.c), 5);
    return `
      <div class="card">
        <div class="card-header"><div class="card-title"><i class="ti ti-users"></i> Carga de personal</div></div>
        <div>
          ${loads.length === 0 ? '<div style="font-size:12px;color:var(--txt3);text-align:center;padding:18px 0;">Sin personal con OTs asignadas</div>' : loads.map(x => `
            <div class="fdy-prow">
              <span class="av" style="background:${avColor(x.p.nombre||'')}">${initials(x.p.nombre).toUpperCase()}</span>
              <div style="flex:1;min-width:0;">
                <div class="nm">${x.p.nombre || '—'}</div>
                <div class="rl">${x.p.rol || '—'}${x.p.zona ? ' · '+x.p.zona : ''}</div>
              </div>
              <div class="barwrap"><div class="fdy-bar"><div class="f ${x.c>=8?'red':x.c>=5?'amber':''}" style="width:${x.c/max*100}%"></div></div></div>
              <span class="ct">${x.c}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderStockBajo() {
    const low = S.refs
      .filter(r => Number(r.stock||0) <= Number(r.stock_minimo||r.min||0))
      .sort((a,b) => (a.stock/Math.max(1,a.stock_minimo||a.min)) - (b.stock/Math.max(1,b.stock_minimo||b.min)))
      .slice(0,5);
    return `
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="ti ti-package"></i> Stock crítico</div>
          ${low.length ? `<button class="btn-sm" onclick="setTab&&setTab('inventario')">Ver todo</button>` : ''}
        </div>
        <div class="fdy-stock">
          ${low.length === 0 ? '<div style="font-size:12px;color:var(--txt3);text-align:center;padding:18px 0;">Todo el stock en niveles correctos</div>' : low.map(r => `
            <div class="it">
              <div>
                <div class="nm">${r.nombre || '—'}</div>
                <div class="sub">${r.codigo || ''} ${r.ubicacion ? '· '+r.ubicacion : ''}</div>
              </div>
              <div class="qty ${r.stock < (r.stock_minimo||r.min||0) ? 'danger' : ''}">${r.stock||0}<span style="font-size:10px;color:var(--txt3);font-weight:400;"> / ${r.stock_minimo||r.min||0}</span></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ── MAIN RENDER ───────────────────────────────────────────
  function renderAll() {
    if (!isDashboardVisible()) return;
    renderTicker();
    renderKpiSparklines();

    const tab = $('#tab-dashboard');
    if (!tab) return;

    let wrap = $('#fdy-widgets');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'fdy-widgets';
      // Insert after kpi-grid, before two-col
      const twoCol = tab.querySelector('.two-col');
      if (twoCol) {
        twoCol.parentNode.insertBefore(wrap, twoCol);
      } else {
        tab.appendChild(wrap);
      }
    }
    wrap.innerHTML = `
      <div class="fdy-row r-2-1">${renderCalendar14()}${renderOEE()}</div>
      <div class="fdy-row r-3">${renderTopFailures()}${renderPersonalLoad()}${renderStockBajo()}</div>
    `;
  }

  function isDashboardVisible() {
    const tab = $('#tab-dashboard');
    return tab && !tab.classList.contains('panel-hidden') && tab.offsetParent !== null;
  }

  async function tick(force) {
    await fetchData(force);
    renderAll();
  }

  // ── INIT ──────────────────────────────────────────────────
  function init() {
    // Observe tab changes
    const observer = new MutationObserver(() => {
      if (isDashboardVisible()) tick(false);
    });
    const tab = $('#tab-dashboard');
    if (tab) observer.observe(tab, { attributes: true, attributeFilter: ['class','style'] });

    // Initial render
    tick(true);

    // Periodic refresh while visible
    setInterval(() => { if (isDashboardVisible()) tick(true); }, 60000);

    // Patch their setTab to refresh on dashboard switch
    if (typeof window.setTab === 'function' && !window.setTab.__fdyPatched) {
      const orig = window.setTab;
      window.setTab = function(...args){
        const r = orig.apply(this, args);
        if (args[0] === 'dashboard') setTimeout(() => tick(true), 200);
        return r;
      };
      window.setTab.__fdyPatched = true;
    }

    console.log('[Foundry widgets] inicializado ✓');
  }

  function waitForReady() {
    // Wait for app to be logged in and db ready
    if (window.db && $('#app') && $('#app').style.display !== 'none' && $('#tab-dashboard')) {
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
