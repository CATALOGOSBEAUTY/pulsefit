drop policy if exists "Public can read active products" on public.products;
drop policy if exists "Public can read active live products" on public.products;
create policy "Public can read active live products"
on public.products for select
using (is_active = true and catalog_status = 'live');

drop policy if exists "Public can read images for active products" on public.product_images;
drop policy if exists "Public can read images for active live products" on public.product_images;
create policy "Public can read images for active live products"
on public.product_images for select
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
    and products.is_active = true
    and products.catalog_status = 'live'
  )
);
