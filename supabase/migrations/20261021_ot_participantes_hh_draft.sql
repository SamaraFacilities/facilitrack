-- BORRADOR: NO EJECUTAR EN PRODUCCIÓN SIN VALIDAR POLÍTICAS DE ACCESO.
create table if not exists public.ot_participantes (
  id bigint generated always as identity primary key,
  orden_id integer not null references public.ordenes_trabajo(id) on delete cascade,
  tecnico_id uuid not null references public.profiles(id),
  minutos_efectivos integer not null default 0 check (minutos_efectivos >= 0),
  registrado_por uuid references public.profiles(id),
  fecha_registro timestamptz not null default now(),
  unique (orden_id, tecnico_id)
);
create index if not exists ot_participantes_tecnico_idx on public.ot_participantes(tecnico_id);
alter table public.ot_participantes enable row level security;
-- RLS estricto pendiente de validar con los roles actuales de la aplicación.
-- No agregar policies abiertas de INSERT/UPDATE/DELETE sin comprobar autorización.
create or replace view public.v_ot_horas_hombre with (security_invoker = true) as
select o.id as orden_id,
       count(p.id) as participantes_registrados,
       coalesce(sum(p.minutos_efectivos),0) as minutos_hombre,
       round(coalesce(sum(p.minutos_efectivos),0)::numeric/60,2) as horas_hombre
from public.ordenes_trabajo o
left join public.ot_participantes p on p.orden_id=o.id
group by o.id;
