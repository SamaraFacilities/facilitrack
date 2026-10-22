const assert=require('node:assert/strict');
const {planNext}=require('./pm-scheduler.js');
const base={equipo_id:23,tipo:'Preventivo',actividad_id:'hidraulico-1'};
const p=d=>({...base,fecha_programada:d});
let r=planNext({today:'2026-10-22',plan:[p('2026-10-29'),p('2026-10-30'),p('2026-10-21')]});
assert.equal(r.ready.length,1);assert.equal(r.scheduled.length,1);assert.equal(r.overdue.length,1);
r=planNext({today:'2026-10-22',plan:[p('2026-10-29'),p('2026-10-29')]});
assert.equal(r.ready.length,1);assert.equal(r.existing.length,1);
r=planNext({today:'2026-10-22',plan:[p('2026-10-29')],existing:[{...p('2026-10-29'),estado:'Por aprobar'}]});
assert.equal(r.ready.length,0);assert.equal(r.existing.length,1);
r=planNext({today:'2026-10-22',plan:[{...p('2026-10-29'),actividad_id:'otra'}]});
assert.equal(r.ready.length,1);
console.log('PM scheduler: 4 pruebas aprobadas');

const {auditOrders,isoLocal,daysBetween}=require('./pm-scheduler.js');
assert.throws(()=>isoLocal('2026-02-30'),/inválida/);
assert.equal(daysBetween('2026-10-22','2026-10-29'),7);
const audit=auditOrders({today:'2026-10-22',orders:[
 {...p('2026-10-29'),id:1,estado:'Por aprobar'},
 {...p('2026-10-29'),id:2,estado:'Por aprobar'},
 {...p('2026-11-10'),id:3,estado:'Por aprobar'},
 {...p('2026-10-20'),id:4,estado:'Por aprobar'},
 {...p('2026-10-20'),id:5,estado:'Completada'},
]});
assert.deepEqual(audit.counts,{due:2,future:1,overdue:1,completed:1,undated:0});
assert.equal(audit.duplicates.length,1);
console.log('PM audit: 4 verificaciones adicionales aprobadas');

const {duplicateReport}=require('./pm-scheduler.js');
const report=duplicateReport([
 {id:424,equipo_id:61,equipo_nombre:'AC-09',tipo:'Inspección',descripcion:'Limpieza de Filtros, revision de niveles de Gas',fecha_programada:'2027-05-03',estado:'Por aprobar'},
 {id:428,equipo_id:61,equipo_nombre:'AC-09',tipo:'Inspección',descripcion:'Limpieza de Filtros, revision de niveles de Gas',fecha_programada:'2027-05-03',estado:'Por aprobar'},
 {id:999,equipo_id:61,equipo_nombre:'AC-09',tipo:'Inspección',descripcion:'Limpieza de Filtros, revision de niveles de Gas',fecha_programada:'2027-05-03',estado:'Cancelada'}
]);
assert.equal(report.length,1);
assert.equal(report[0].ids.join(','),'424,428');
assert.equal(planNext({today:'2026-10-22',plan:[p('2026-10-29')],existing:[{...p('2026-10-29'),estado:'Cancelada'}]}).ready.length,1);
console.log('Reporte de duplicados y cancelaciones: 3 verificaciones aprobadas');
