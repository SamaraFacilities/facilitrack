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

## Integración HTML preparada (21/oct/2026)
Se generó una vista previa de la aplicación a partir del HTML facilitado por el usuario (archivo `Samara_Facilities_HH_preview.html` guardado en Library). Incluye formularios de dos técnicos en ambas rutas de cierre: `cerrarOTDirecto` y `cerrarOT`; valida los dos integrantes, evita IDs repetidos, calcula HH y trata de guardar participantes en Supabase antes de completar la OT. **No desplegada ni subida como index.html al repositorio**, porque el blob `index.html` de main no coincide con el archivo recibido y el conector no devuelve su contenido al leerlo; sobreescribirlo a ciegas podría perder trabajo.

No ejecutar hasta aplicar y validar la migración `ot_participantes`, políticas RLS por rol, y pruebas de cierre con Supabase de pruebas. La vista previa pasa `node --check` para el script principal, pero no hay prueba E2E. **No fusionar este PR** hasta completar esa revisión.
