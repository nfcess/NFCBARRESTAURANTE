-- Ejecutá este archivo completo una vez en Supabase: SQL Editor > New query.
create table public.restaurants (id uuid primary key default gen_random_uuid(), name text not null, owner_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now());
create table public.feedback (id bigint generated always as identity primary key, restaurant_id uuid not null references public.restaurants(id) on delete cascade, message text not null check (char_length(message) between 1 and 1000), rating smallint check (rating between 1 and 5), customer_name text check (char_length(customer_name) <= 80), contact text check (char_length(contact) <= 120), created_at timestamptz not null default now());
alter table public.restaurants enable row level security;
alter table public.feedback enable row level security;
-- Esta función permite validar el restaurante sin revelar su contenido público.
create function public.is_valid_restaurant(target_id uuid)
returns boolean language sql security definer set search_path = public stable
as $$ select exists (select 1 from public.restaurants where id = target_id) $$;
-- Los visitantes pueden enviar, pero jamás seleccionar ni modificar mensajes.
create policy "public can submit feedback" on public.feedback for insert to anon, authenticated with check (public.is_valid_restaurant(restaurant_id));
-- Cada dueño autenticado ve solo los mensajes de sus propios restaurantes.
create policy "owners can read their feedback" on public.feedback for select to authenticated using (exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = auth.uid()));
-- Cada dueño puede borrar solamente los mensajes de su propio restaurante.
create policy "owners can delete their feedback" on public.feedback for delete to authenticated using (exists (select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = auth.uid()));
create policy "owners can read their restaurants" on public.restaurants for select to authenticated using (owner_id = auth.uid());
-- PASO FINAL: creá un usuario dueño en Authentication > Users y copiá su UUID.
-- insert into public.restaurants (name, owner_id) values ('Bar El Parque', 'ABAJO_EL_UUID_DEL_USUARIO');
