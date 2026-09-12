-- Oxygen Index: historical qualification assessments managed by the Oxygen team.
create table if not exists public.oxygen_index_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  experience_score integer not null default 0 check (experience_score between 0 and 25),
  safety_score integer not null default 0 check (safety_score between 0 and 25),
  field_skill_score integer not null default 0 check (field_skill_score between 0 and 20),
  discipline_score integer not null default 0 check (discipline_score between 0 and 15),
  contribution_score integer not null default 0 check (contribution_score between 0 and 15),
  total_score integer generated always as (
    experience_score + safety_score + field_skill_score + discipline_score + contribution_score
  ) stored check (total_score between 0 and 100),
  level text generated always as (
    case
      when (experience_score + safety_score + field_skill_score + discipline_score + contribution_score) >= 90 then 'OXYGEN CORE'
      when (experience_score + safety_score + field_skill_score + discipline_score + contribution_score) >= 75 then 'ADVANCED'
      when (experience_score + safety_score + field_skill_score + discipline_score + contribution_score) >= 50 then 'FIELD READY'
      when (experience_score + safety_score + field_skill_score + discipline_score + contribution_score) >= 25 then 'TRAIL READY'
      else 'FOUNDATION'
    end
  ) stored,
  notes text,
  evaluated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists oxygen_index_assessments_user_created_idx
  on public.oxygen_index_assessments(user_id, created_at desc);

alter table public.oxygen_index_assessments enable row level security;

-- Members can read only their own assessment history. Writes are performed by the protected admin API.
drop policy if exists "Members can view own Oxygen Index" on public.oxygen_index_assessments;
create policy "Members can view own Oxygen Index"
  on public.oxygen_index_assessments
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Admin API uses the service role, which bypasses RLS.
