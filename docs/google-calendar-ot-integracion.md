# Integración Google Calendar — Samara Facilities

## Decisión operativa
- Supervisor administra un calendario secundario llamado **Samara Facilities — Órdenes de Trabajo**.
- El supervisor compartirá ese calendario con los técnicos **después** de implementarlo; no necesitamos sus correos ahora.
- Supabase sigue como fuente de verdad para OT, checklist, participantes y HH.
- Calendar solo refleja avisos y agenda, nunca cierra ni genera OT en Supabase.

## Sincronización diseñada
- Nueva OT de supervisor de zona: publicar un evento de revisión, con referencia OT, equipo y enlace seguro; no incluir datos personales ni información sensible.
- Asignación/fecha: actualizar el mismo evento, no crear otro.
- OT programada: usar fecha y hora de `ordenes_trabajo`, zona `America/Tijuana`; si falta horario, dejar evento sin hora solo cuando se confirme esta regla.
- Reprogramación, cancelación y cierre: actualizar/anular el mismo evento según política operativa.
- El evento lleva marcador `OT <id>`; guardar `calendar_id` y `event_id` de Google en mapeo persistente 1:1 por OT. Clave única por OT/canal.
- Procesamiento asíncrono con tabla outbox, reintentos y deduplicación; **no** enviar notificaciones en cada UPDATE sin verificar cambios relevantes.
- Solo backend usa OAuth de calendario del supervisor (refresh token protegido en servidor, nunca en HTML ni GitHub). Usar cuenta de empresa autorizada.
- Recordatorios configurados en los eventos y en los iPads; **no garantiza entrega push inmediata**, así que corregir Web Push para urgencias.
- Limitar exposición de detalles si calendario se comparte fuera del equipo.
- Evitar recrear avisos históricos al habilitar integración; iniciar desde fecha de activación tras revisión.
- Confirmar calendario secundario mediante `calendar_id` creado manualmente (el conector conectado no ofrece operación `create_calendar`).
- No instalar ni disparar webhook en producción antes de tener autorización OAuth de la app y pruebas en entorno aislado.

## Pruebas
1. Generar OT de prueba: un solo evento.
2. Abrir app nuevamente: cero eventos extra.
3. Modificar OT: se actualiza el mismo `event_id`.
4. Dos técnicos acceden al calendario compartido y verifican recordatorios.
5. OT HVAC crea calendario futuro y su OT ejecutable siete días antes sin duplicados; HH se registran exclusivamente en Supabase.
6. Verificar revocación de acceso y fallos/reintentos de sincronización.
