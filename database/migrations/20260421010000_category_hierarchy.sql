alter table public.categories
add column if not exists parent_id uuid references public.categories(id) on delete restrict;

alter table public.products
add column if not exists subcategory_id uuid references public.categories(id) on delete set null;

create index if not exists idx_categories_parent_id on public.categories(parent_id);
create index if not exists idx_products_subcategory_id on public.products(subcategory_id);

insert into public.categories (name, slug, parent_id, sort_order, is_active)
values
  ('Masculina', 'masculina', null, 10, true),
  ('Feminina', 'feminina', null, 20, true)
on conflict (slug) do update
set name = excluded.name,
    parent_id = excluded.parent_id,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active;

with roots as (
  select id, slug from public.categories where slug in ('masculina', 'feminina')
),
seed_subcategories(name, slug, root_slug, sort_order) as (
  values
    ('Camisetas', 'masculina-camisetas', 'masculina', 10),
    ('Regatas', 'masculina-regatas', 'masculina', 20),
    ('Shorts', 'masculina-shorts', 'masculina', 30),
    ('Calcas', 'masculina-calcas', 'masculina', 40),
    ('Acessorios', 'masculina-acessorios', 'masculina', 50),
    ('Tops', 'feminina-tops', 'feminina', 10),
    ('Leggings', 'feminina-leggings', 'feminina', 20),
    ('Shorts', 'feminina-shorts', 'feminina', 30),
    ('Conjuntos', 'feminina-conjuntos', 'feminina', 40),
    ('Acessorios', 'feminina-acessorios', 'feminina', 50)
)
insert into public.categories (name, slug, parent_id, sort_order, is_active)
select seed.name, seed.slug, roots.id, seed.sort_order, true
from seed_subcategories seed
join roots on roots.slug = seed.root_slug
on conflict (slug) do update
set name = excluded.name,
    parent_id = excluded.parent_id,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active;

with roots as (
  select id, slug from public.categories where slug in ('masculina', 'feminina')
)
update public.categories
set parent_id = case
    when slug = 'roupas-masculinas' then (select id from roots where slug = 'masculina')
    when slug = 'roupas-femininas' then (select id from roots where slug = 'feminina')
    when slug = 'conjuntos' then (select id from roots where slug = 'feminina')
    when slug in ('suplementos', 'acessorios') then (select id from roots where slug = 'masculina')
    else parent_id
  end
where parent_id is null
  and slug not in ('masculina', 'feminina');

update public.products
set subcategory_id = category_id,
    category_id = categories.parent_id
from public.categories
where products.category_id = categories.id
  and categories.parent_id is not null
  and products.subcategory_id is null;

delete from public.categories c
where c.slug in ('roupas-masculinas', 'roupas-femininas', 'conjuntos', 'suplementos', 'acessorios')
  and not exists (
    select 1
    from public.products p
    where p.category_id = c.id
       or p.subcategory_id = c.id
  );
