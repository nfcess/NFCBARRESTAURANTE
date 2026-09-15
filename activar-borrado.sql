-- Ejecutá solamente este archivo en Supabase > SQL Editor.
-- Sirve también si ya habías ejecutado el esquema anterior.
drop policy if exists "owners can delete their feedback" on public.feedback;

create policy "owners can delete their feedback"
on public.feedback
for delete
to authenticated
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = feedback.restaurant_id
      and r.owner_id = auth.uid()
  )
);
