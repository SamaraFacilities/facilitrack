// node --test tests/horas-hombre.test.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {calcularHH,validarCuadrillaHVAC}=require('../hvac-horas-hombre.js');
test('ambos trabajan 150 min: 5.00 HH',()=>{
 assert.deepEqual(validarCuadrillaHVAC([
  {tecnico_id:'uno',minutos_efectivos:150},
  {tecnico_id:'dos',minutos_efectivos:150}
 ]),{participantes:2,minutos_hombre:300,horas_hombre:5});
});
test('duraciones distintas: 4.75 HH',()=>{
 assert.equal(validarCuadrillaHVAC([
  {tecnico_id:'uno',minutos_efectivos:150},
  {tecnico_id:'dos',minutos_efectivos:135}
 ]).horas_hombre,4.75);
});
test('rechaza técnico duplicado',()=>assert.throws(()=>calcularHH([
 {tecnico_id:'uno',minutos_efectivos:10},
 {tecnico_id:'uno',minutos_efectivos:10}
])));
test('rechaza negativos, decimales e inválidos',()=>{
 for(const val of [-1,3.5,'',Infinity]) assert.throws(()=>calcularHH([{tecnico_id:'uno',minutos_efectivos:val}]));
});
test('HVAC requiere dos participantes',()=>assert.throws(()=>validarCuadrillaHVAC([{tecnico_id:'uno',minutos_efectivos:10}])));
