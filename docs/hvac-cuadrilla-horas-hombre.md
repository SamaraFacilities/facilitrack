# Samara Facilities — propuesta de cuadrilla HVAC y horas-hombre

**Estado:** propuesta en rama de desarrollo; sin cambios en Supabase ni en producción.

## Requisitos aprobados
- 28 equipos Trane de 25 toneladas, distribuidos en cuatro semanas de siete equipos.
- Los **dos técnicos trabajan siempre en pareja** en cada intervención HVAC.
- **Una OT por equipo y evento** (no crear una OT por técnico).
- Cada técnico registra sus minutos efectivos, incluyendo pausas y salidas anticipadas.
- HH totales = suma de minutos efectivos de participantes / 60.
- Conservar `ordenes_trabajo.tiempo_minutos` para la duración de la orden.
- Ejemplo: 150 min + 135 min = 4.75 HH, duración 150 min.
- No inferir HH de registros históricos sin datos de participantes.

## Programación y antigüedad
- Dejar un calendario maestro de 12 meses y crear cada orden ejecutable 7 días antes.
- Prohibir órdenes duplicadas por equipo, tipo de mantenimiento y periodo; implementar garantía de unicidad en base de datos y generación idempotente.
- Revisar manualmente órdenes antiguas antes de cancelar/reprogramar, preservando historia.
- Aplicar checklist y evidencias, aprobación del supervisor.
- Programador diario: evaluar Supabase Cron / Edge Function y zona horaria America/Tijuana, sin activarlo hasta probar.

## Notas de despliegue
- La migración adjunta es borrador: requiere diseño RLS por rol antes de ejecutarse.
- El archivo principal de la app puede ser grande y se debe confirmar su versión vigente.
- No desplegar en main ni ejecutar cambios de datos antes de pruebas de integración.

## Pruebas imprescindibles
- Crear una OT con dos participantes y registrar 150 y 135 min: 4.75 HH.
- Registrar un solo técnico parcialmente y evitar que el informe se interprete como completo.
- Reintentar generación de OT sin duplicados.
- Confirmar que permisos de supervisor/técnico permitan únicamente acciones autorizadas.
- Asegurar compatibilidad con órdenes y reportes antiguos.
