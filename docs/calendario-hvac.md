# Calendario HVAC automatizado — propuesta técnica

No está desplegado. El módulo `hvac-calendario.js` genera eventos de calendario sin insertar OT.

### Parámetros acordados
- 28 Trane AC-01…AC-28; dos técnicos **juntos** en cada mantenimiento.
- 4 semanas, 7 equipos por semana. Se propone distribución temporal lunes-viernes 2/2/1/1/1. Ajustar por ubicación física, acceso y carga laboral.
- Inspección mensual como evento del calendario. Preventivo detallado estacional separado y validado contra manual/capacitación.
- Se crean OT a siete días de su vencimiento, **únicamente** si no existe OT del mismo equipo/tipo/periodo.

### Implementación backend futura
1. Persistir programa maestro y periodo `YYYY-MM` por equipo/tipo sin abrir 12 OT.
2. Registrar identidad única `(equipo_id,tipo,periodo)` en la base para idempotencia incluso ante dos ejecuciones simultáneas; revisar que no choque con órdenes históricas.
3. La generación toma el inventario real y coteja OTs existentes, incluidas las 186 de aprobación HVAC antes de empezar; **no generar OT del mes mientras exista una equivalente sin resolución**, migrar antiguas bajo revisión.
4. Autenticación, RLS por roles, timezone `America/Tijuana`, cron diario y reglas de autorización.
5. Guardar por separado tiempo transcurrido y suma real de minutos de ambos técnicos.
6. Probar en entorno de pruebas antes de habilitar cron.

No activar con equipos sin confirmación de acceso seguro a cubierta, LOTO y competencias HVAC.
