# PM — Plan de integración segura (22-oct-2026)

## Validación
- `pm-scheduler.js` controla ventana de 7 días, fechas válidas, agrupación de posibles duplicados y estados cancelados.
- `pm-scheduler.test.cjs`: 15 aserciones ejecutadas con el motor JavaScript aislado; revisar además resultado CI y pruebas de navegador.
- `index.html` solo contiene **vista previa de lectura**. Aún no genera órdenes.

## Hallazgo en producción (Supabase: FACILITIES TRACKING)
La tabla `public.ordenes_trabajo` solo tiene índice único de PK `id`. **No existe protección de unicidad para PM** en BD.
Dos operaciones concurrentes pueden leer que no existe una orden e insertar ambas. La comprobación client-side no basta.

## Propuesta de datos — pendiente de aprobación e implementación
1. Revisar OTs históricas duplicadas, *sin eliminarlas*, y su relación con bitácoras y checklists.
2. Definir identidad estable de ciclo: equipo + tipo + plantilla/actividad + fecha local programada. **No usar únicamente texto libre** para identidad futura.
3. Guardar una clave idempotente (por ejemplo `pm_instancia_clave`) para órdenes **generadas por planificador nuevo**; conservar OTs antiguas sin forzar claves.
4. Crear índice único parcial sobre la clave de nuevas OTs activas **solo después de auditoría**. Considerar el efecto de órdenes canceladas y reprogrames.
5. Usar `INSERT ... ON CONFLICT` / RPC transaccional o operación equivalente, **con RLS y autorización verificadas**; el cliente no debe realizar doble consulta e inserción vulnerable a carreras.
6. Separar plan anual/calendario de OT ejecutable; generar a 7 días y dejar futuras solo en calendario.
7. Contar 196 órdenes `Por aprobar` heredadas sin cambiar sus estados automáticamente; algunas son futuras, no ejecutadas.
8. Probar en rama/entorno de prueba, respaldar, migrar y desplegar solo con revisión y aprobación.

## Casos de prueba faltantes
- Dos usuarios hacen clic simultáneamente para generar misma OT.
- Fecha próxima al cambio de zona horaria Mexicali/California.
- Cancelación y reprogramación.
- Inspección y PM distintos en mismo equipo/fecha.
- OT completada y próxima instancia del ciclo.
- PM por horas reales y PM por calendario cuando no existe horómetro.
- Interfaz iPhone/iPad y posible caché Service Worker.
