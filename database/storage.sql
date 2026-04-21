insert into storage.buckets (id, name, public)
values ('pulsefit-media', 'pulsefit-media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('pulsefit-products', 'pulsefit-products', true)
on conflict (id) do nothing;

drop policy if exists "Public can read pulsefit media" on storage.objects;
create policy "Public can read pulsefit media"
on storage.objects for select
using (bucket_id in ('pulsefit-media', 'pulsefit-products'));

-- Uploads e exclusoes devem passar pelo backend com service role.

