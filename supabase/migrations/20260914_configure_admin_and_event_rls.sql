-- Admin identity lookup: signed-in users may only verify their own admin row.
alter table public.admin_users enable row level security;
grant select on table public.admin_users to authenticated;

drop policy if exists "Admins can verify own access" on public.admin_users;
create policy "Admins can verify own access"
on public.admin_users
for select
to authenticated
using ((select auth.uid()) = user_id);

-- Public event catalog: visitors can only read published events.
alter table public.events enable row level security;
grant select on table public.events to anon, authenticated;

drop policy if exists "Public can view published events" on public.events;
create policy "Public can view published events"
on public.events
for select
to anon, authenticated
using (published = true);

-- Admin CRUD is performed server-side with the service role in /api/admin/events.
-- No INSERT/UPDATE/DELETE policy is granted to normal authenticated users.
