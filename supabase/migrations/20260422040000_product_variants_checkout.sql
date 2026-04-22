alter table public.products
  add column if not exists variants_enabled boolean not null default false;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  sku text,
  options jsonb not null default '[]'::jsonb,
  price numeric(12,2) check (price is null or price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists order_code text unique,
  add column if not exists fulfillment_type text not null default 'delivery' check (fulfillment_type in ('delivery', 'pickup')),
  add column if not exists payment_method text not null default 'pix' check (payment_method in ('cash', 'pix', 'card')),
  add column if not exists reference_point text,
  add column if not exists city text,
  add column if not exists state text;

alter table public.orders
  alter column cep drop not null,
  alter column address drop not null,
  alter column number drop not null,
  alter column neighborhood drop not null,
  alter column region drop not null;

alter table public.order_items
  add column if not exists product_variant_id uuid references public.product_variants(id) on delete set null,
  add column if not exists variant_label text,
  add column if not exists variant_options jsonb not null default '[]'::jsonb;

create index if not exists idx_product_variants_product_id on public.product_variants(product_id);
create index if not exists idx_product_variants_active on public.product_variants(is_active);
create index if not exists idx_orders_order_code on public.orders(order_code);

drop trigger if exists trg_product_variants_updated_at on public.product_variants;
create trigger trg_product_variants_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();
