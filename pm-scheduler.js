/* Samara Facilities — planificador seguro de PM (sin acceso directo a Supabase).
 * Uso: seleccionar los trabajos a generar; la inserción se integra SOLO después de
 * confirmar el origen vigente de la aplicación y protección de unicidad en BD.
 */
(function(root){
  'use strict';
  function isoLocal(d){
    if(typeof d==='string' && /^\d{4}-\d{2}-\d{2}$/.test(d)){
      const [y,m,day]=d.split('-').map(Number);
      const t=new Date(Date.UTC(y,m-1,day));
      if(t.getUTCFullYear()!==y || t.getUTCMonth()!==m-1 || t.getUTCDate()!==day) throw Error('Fecha inválida');
      return d;
    }
    const x=new Date(d);
    if(!Number.isFinite(x.getTime())) throw Error('Fecha inválida');
    return [x.getFullYear(),String(x.getMonth()+1).padStart(2,'0'),String(x.getDate()).padStart(2,'0')].join('-');
  }
  function daysBetween(today,date){
    const [a,b,c]=today.split('-').map(Number),[d,e,f]=date.split('-').map(Number);
    return Math.round((Date.UTC(d,e-1,f)-Date.UTC(a,b-1,c))/86400000);
  }
  function key(o){
    const equipo=Number(o.equipo_id);
    const tipo=String(o.tipo||'Preventivo').trim().toLowerCase();
    const actividad=String(o.actividad_id||o.plantilla_id||o.actividad||o.descripcion||'').trim().toLowerCase().replace(/\s+/g,' ');
    return [equipo,tipo,actividad,isoLocal(o.fecha_programada)].join('|');
  }
  function planNext({plan=[],existing=[],today=new Date(),daysBefore=7}={}){
    const dia=isoLocal(today);
    const known=new Set(existing.filter(o=>o.fecha_programada && o.estado!=='Cancelada').map(key));
    const selected=[],future=[],duplicates=[],overdue=[];
    for(const o of plan){
      if(!o.equipo_id || !o.fecha_programada || !(o.actividad_id||o.plantilla_id||o.actividad||o.descripcion)) throw Error('Plan incompleto');
      const identity=key(o),delta=daysBetween(dia,isoLocal(o.fecha_programada));
      if(known.has(identity)){duplicates.push(o);continue;}
      known.add(identity); // protege también duplicados dentro del lote
      if(delta>daysBefore){future.push(o);continue;}
      if(delta<0){overdue.push(o);continue;} // no crear OT histórica automáticamente
      selected.push({...o,tipo:o.tipo||'Preventivo',estado:'Pendiente'});
    }
    return {ready:selected,scheduled:future,existing:duplicates,overdue,asOf:dia};
  }
  function auditOrders({orders=[],today=new Date(),daysBefore=7}={}){
    const dia=isoLocal(today), groups=new Map();
    const counts={due:0,future:0,overdue:0,completed:0,undated:0};
    for(const o of orders){
      if(o.estado==='Cancelada') continue;
      if(o.estado==='Completada'){counts.completed++;continue;}
      if(!o.fecha_programada){counts.undated++;continue;}
      const days=daysBetween(dia,isoLocal(o.fecha_programada));
      if(days<0) counts.overdue++;
      else if(days<=daysBefore) counts.due++;
      else counts.future++;
      const k=key(o);
      if(!groups.has(k))groups.set(k,[]);
      groups.get(k).push(o);
    }
    return {counts,duplicates:[...groups.values()].filter(g=>g.length>1),asOf:dia};
  }
  // Agrupa fechas repetidas de una misma actividad; conserva identificadores para revisión manual.
  function duplicateReport(orders=[]){
    const groups=new Map();
    for(const o of orders){
      if(!o.fecha_programada || o.estado==='Cancelada') continue;
      const k=key(o);
      if(!groups.has(k)) groups.set(k,[]);
      groups.get(k).push(o);
    }
    return [...groups.entries()].filter(([,os])=>os.length>1).map(([identity,os])=>({
      identity,ids:os.map(o=>o.id).filter(x=>x!=null),date:isoLocal(os[0].fecha_programada),
      equipment:os[0].equipo_nombre||String(os[0].equipo_id),count:os.length
    }));
  }
  const api={isoLocal,daysBetween,key,planNext,auditOrders,duplicateReport};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else root.SamaraPMScheduler=api;
})(typeof globalThis!=='undefined'?globalThis:this);
