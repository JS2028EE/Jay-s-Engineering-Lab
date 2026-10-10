-- Jay's Engineering Lab — Study Sessions timestamp fix
-- Ensures the shared updated_at trigger has a matching column on study_sessions.

alter table public.study_sessions
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists study_sessions_updated_at on public.study_sessions;

create trigger study_sessions_updated_at
before update on public.study_sessions
for each row
execute function public.set_updated_at();
