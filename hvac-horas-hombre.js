/* Samara Facilities: HH de cuadrilla.
   Funciones puras, sin efectos en Supabase ni escritura automática.
   Integración en index.html pendiente de validación. */
(function(root){
  'use strict';
  function minutosValidos(v){
    if(v===null || v===undefined || (typeof v==='string' && !v.trim())) throw new Error('Minutos efectivos vacíos');
    const n=Number(v);
    if(!Number.isInteger(n) || n<0 || !Number.isSafeInteger(n))
      throw new Error('Minutos efectivos inválidos');
    return n;
  }
  function calcularHH(participantes){
    if(!Array.isArray(participantes)) throw new Error('Se requiere una lista');
    const ids=new Set();
    let total=0;
    for(const p of participantes){
      if(!p || typeof p.tecnico_id!=='string' || !p.tecnico_id.trim())
        throw new Error('Técnico no identificado');
      if(ids.has(p.tecnico_id)) throw new Error('Técnico duplicado');
      ids.add(p.tecnico_id);
      total+=minutosValidos(p.minutos_efectivos);
      if(!Number.isSafeInteger(total)) throw new Error('Total fuera de rango');
    }
    return {participantes:ids.size,minutos_hombre:total,horas_hombre:Math.round(total/60*100)/100};
  }
  function validarCuadrillaHVAC(participantes){
    const resultado=calcularHH(participantes);
    if(resultado.participantes!==2) throw new Error('HVAC requiere exactamente dos técnicos');
    return resultado;
  }
  const api={calcularHH,validarCuadrillaHVAC};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  root.SamaraHorasHombre=api;
})(typeof globalThis!=='undefined'?globalThis:this);
