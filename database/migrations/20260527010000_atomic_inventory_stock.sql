create or replace function public.decrement_inventory_stock(
  target_table text,
  target_id uuid,
  decrement_by integer
)
returns table(previous_stock integer, next_stock integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_stock integer;
begin
  if decrement_by <= 0 then
    raise exception 'Quantidade de estoque invalida.';
  end if;

  if target_table = 'products' then
    select stock_quantity
      into current_stock
      from public.products
      where id = target_id
      for update;

    if not found or current_stock < decrement_by then
      raise exception 'Estoque insuficiente para o produto selecionado.';
    end if;

    update public.products
      set stock_quantity = current_stock - decrement_by,
          updated_at = now()
      where id = target_id;
  elsif target_table = 'product_variants' then
    select stock_quantity
      into current_stock
      from public.product_variants
      where id = target_id
      for update;

    if not found or current_stock < decrement_by then
      raise exception 'Estoque insuficiente para a variacao selecionada.';
    end if;

    update public.product_variants
      set stock_quantity = current_stock - decrement_by,
          updated_at = now()
      where id = target_id;
  else
    raise exception 'Tabela de estoque invalida.';
  end if;

  previous_stock := current_stock;
  next_stock := current_stock - decrement_by;
  return next;
end;
$$;

revoke all on function public.decrement_inventory_stock(text, uuid, integer) from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on function public.decrement_inventory_stock(text, uuid, integer) from anon;
  end if;

  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on function public.decrement_inventory_stock(text, uuid, integer) from authenticated;
  end if;

  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.decrement_inventory_stock(text, uuid, integer) to service_role;
  end if;
end $$;
