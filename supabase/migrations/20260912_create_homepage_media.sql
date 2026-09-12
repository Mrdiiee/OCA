create table if not exists public.homepage_media (
  key text primary key,
  label text not null,
  path text not null,
  url text not null,
  alt_text text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.homepage_media enable row level security;

insert into storage.buckets (id, name, public)
values ('homepage_media', 'homepage_media', true)
on conflict (id) do update set public = true;

create index if not exists homepage_media_updated_at_idx on public.homepage_media(updated_at desc);
