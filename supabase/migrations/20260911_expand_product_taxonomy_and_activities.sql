alter table public.products
  add column if not exists activities text[] not null default '{}';

create index if not exists products_category_idx on public.products(category);
create index if not exists products_subcategory_idx on public.products(subcategory);
create index if not exists products_activities_gin_idx on public.products using gin(activities);
