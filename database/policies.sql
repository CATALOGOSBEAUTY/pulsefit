alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.media_files enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.settings enable row level security;

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
on public.categories for select
using (is_active = true);

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select
using (is_active = true);

drop policy if exists "Public can read images for active products" on public.product_images;
create policy "Public can read images for active products"
on public.product_images for select
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
    and products.is_active = true
  )
);

drop policy if exists "Public can read public settings" on public.settings;
create policy "Public can read public settings"
on public.settings for select
using (is_public = true);

-- Escritas administrativas devem passar pelo backend com service role.

