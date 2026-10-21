/* Calendario maestro HVAC Samara. Módulo puro; NO crea OT ni escribe en Supabase. */
(function(root){
  'use strict';
  const TZ='America/Tijuana';
  function parseISO(date){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw Error('Fecha inválida');
    const [y,m,d]=date.split('-').map(Number);
    const dt=new Date(Date.UTC(y,m-1,d));
    if(dt.toISOString().slice(0,10)!==date) throw Error('Fecha inexistente');
    return dt;
  }
  function shiftDays(date,n){const d=parseISO(date);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
  function firstMonday(year,month){
    const first=new Date(Date.UTC(year,month-1,1));
    const add=(8-first.getUTCDay())%7;
    first.setUTCDate(first.getUTCDate()+add);
    return first.toISOString().slice(0,10);
  }
  // Cada semana: lunes a viernes, 7 equipos; distribuir 2/2/1/1/1 por día.
  const offsets=[0,0,1,1,2,3,4];
  function calendarioMes(year,month){
    if(!Number.isInteger(year)||year<2026||year>2100||!Number.isInteger(month)||month<1||month>12)
      throw Error('Periodo inválido');
    const lunes=firstMonday(year,month);
    return Array.from({length:28},(_,i)=>{
      const semana=Math.floor(i/7)+1;
      const fecha=shiftDays(lunes,(semana-1)*7+offsets[i%7]);
      return {codigo:'AC-'+String(i+1).padStart(2,'0'),semana,fecha_programada:fecha,
        tipo:'Inspección',cuadrilla:2,clave_periodo:year+'-'+String(month).padStart(2,'0')};
    });
  }
  function candidatas(calendario,fechaActual,ordenes=[]){
    parseISO(fechaActual);
    if(!Array.isArray(calendario)||!Array.isArray(ordenes)) throw Error('Datos inválidos');
    return calendario.filter(t=>{
      if(shiftDays(t.fecha_programada,-7)>fechaActual) return false;
      const existe=ordenes.some(o=>o.codigo===t.codigo&&o.tipo===t.tipo&&o.clave_periodo===t.clave_periodo);
      return !existe;
    });
  }
  const api={TZ,calendarioMes,candidatas,shiftDays};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.SamaraCalendarioHVAC=api;
})(typeof globalThis!=='undefined'?globalThis:this);
