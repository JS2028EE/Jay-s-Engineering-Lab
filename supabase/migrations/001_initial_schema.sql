-- Jay's Engineering Lab V0.1 schema
-- Supabase/Postgres. Authenticated users only; RLS + explicit Data API grants.

create extension if not exists pgcrypto;

-- =========================
-- Curriculum
-- =========================
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  name text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  name text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.lesson_requirements (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  requirement text not null,
  completed boolean not null default false,
  sort_order int not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  subject_id uuid references public.subjects(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- Notes / tests / mistakes
-- =========================
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null,
  content text not null default '',
  subject_id uuid references public.subjects(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  subject_id uuid references public.subjects(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  score numeric,
  max_score numeric,
  test_date date not null default current_date,
  difficulty text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (score is null or score >= 0),
  check (max_score is null or max_score > 0),
  check (score is null or max_score is null or score <= max_score)
);
create table if not exists public.test_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  question_number int not null,
  question_text text,
  user_answer text,
  correct_answer text,
  points_earned numeric,
  points_possible numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (test_id, question_number),
  check (question_number > 0)
);
create table if not exists public.mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  subject_id uuid references public.subjects(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  question text,
  user_answer text,
  correct_answer text,
  explanation text,
  what_went_wrong text,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- Physical lab / components
-- =========================
create table if not exists public.component_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  code text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (user_id, code)
);
create table if not exists public.components (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  type text,
  value text,
  quantity int not null default 0 check (quantity >= 0),
  manufacturer text,
  part_number text,
  purpose text,
  package text,
  datasheet_url text,
  photo_path text,
  location_id uuid references public.component_locations(id) on delete set null,
  location_code text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- Projects
-- =========================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  description text,
  goal text,
  status text not null default 'active' check (status in ('planned','active','paused','completed','archived')),
  start_date date,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  completed boolean not null default false,
  sort_order int not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.project_components (
  project_id uuid not null references public.projects(id) on delete cascade,
  component_id uuid not null references public.components(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  primary key (project_id, component_id)
);

-- =========================
-- Circuits / study
-- =========================
create table if not exists public.circuits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  subject_id uuid references public.subjects(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  schematic_path text,
  equations text,
  calculations text,
  expected_result text,
  measured_result text,
  simulation_result text,
  final_answer text,
  explanation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.circuit_components (
  circuit_id uuid not null references public.circuits(id) on delete cascade,
  component_id uuid not null references public.components(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  primary key (circuit_id, component_id)
);
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  subject_id uuid references public.subjects(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes int,
  summary text,
  created_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= started_at),
  check (duration_minutes is null or duration_minutes >= 0)
);

-- =========================
-- Wellness
-- =========================
create table if not exists public.wellness_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.wellness_habits (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.wellness_categories(id) on delete cascade,
  name text not null,
  target numeric,
  unit text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.habit_goals (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.wellness_habits(id) on delete cascade,
  start_date date not null default current_date,
  end_date date,
  target numeric,
  unit text,
  created_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);
create table if not exists public.wellness_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  habit_id uuid not null references public.wellness_habits(id) on delete cascade,
  checkin_date date not null default current_date,
  completed boolean not null default false,
  measurement numeric,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, checkin_date)
);

-- =========================
-- Files / tags / knowledge graph
-- =========================
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  bucket text not null,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  check (size_bytes is null or size_bytes >= 0)
);
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);
create table if not exists public.entity_tags (
  user_id uuid not null default auth.uid(),
  tag_id uuid not null references public.tags(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (tag_id, entity_type, entity_id)
);
create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  source_type text not null,
  source_id uuid not null,
  relationship_type text not null,
  target_type text not null,
  target_id uuid not null,
  created_at timestamptz not null default now()
);

-- =========================
-- Progress views. security_invoker makes underlying RLS apply.
-- =========================
create or replace view public.lesson_progress with (security_invoker = true) as
select l.id, l.unit_id, l.name,
  count(r.id)::int as requirement_count,
  coalesce(sum(case when r.completed then 1 else 0 end),0)::int as completed_count,
  case when count(r.id)=0 then 0 else round((sum(case when r.completed then 1 else 0 end)::numeric/count(r.id))*100)::int end as progress
from public.lessons l left join public.lesson_requirements r on r.lesson_id=l.id
group by l.id;

create or replace view public.unit_progress with (security_invoker = true) as
select u.id, u.subject_id, u.name,
  count(l.id)::int as lesson_count,
  coalesce(round(avg(lp.progress)),0)::int as progress
from public.units u left join public.lessons l on l.unit_id=u.id left join public.lesson_progress lp on lp.id=l.id
group by u.id;

create or replace view public.subject_progress with (security_invoker = true) as
select s.id, s.user_id, s.name,
  count(u.id)::int as unit_count,
  coalesce(round(avg(up.progress)),0)::int as progress
from public.subjects s left join public.units u on u.subject_id=s.id left join public.unit_progress up on up.id=u.id
group by s.id;

create or replace view public.project_progress with (security_invoker = true) as
select p.id, p.user_id, p.name, p.status,
  count(t.id)::int as task_count,
  coalesce(sum(case when t.completed then 1 else 0 end),0)::int as completed_task_count,
  case when count(t.id)=0 then 0 else round((sum(case when t.completed then 1 else 0 end)::numeric/count(t.id))*100)::int end as progress
from public.projects p left join public.project_tasks t on t.project_id=p.id
group by p.id;

-- =========================
-- RLS
-- =========================
alter table public.subjects enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_requirements enable row level security;
alter table public.topics enable row level security;
alter table public.notes enable row level security;
alter table public.tests enable row level security;
alter table public.test_questions enable row level security;
alter table public.mistakes enable row level security;
alter table public.component_locations enable row level security;
alter table public.components enable row level security;
alter table public.projects enable row level security;
alter table public.project_tasks enable row level security;
alter table public.project_components enable row level security;
alter table public.circuits enable row level security;
alter table public.circuit_components enable row level security;
alter table public.study_sessions enable row level security;
alter table public.wellness_categories enable row level security;
alter table public.wellness_habits enable row level security;
alter table public.habit_goals enable row level security;
alter table public.wellness_checkins enable row level security;
alter table public.files enable row level security;
alter table public.tags enable row level security;
alter table public.entity_tags enable row level security;
alter table public.relationships enable row level security;

-- Direct owner tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['subjects','topics','notes','tests','mistakes','component_locations','components','projects','circuits','study_sessions','wellness_categories','files','tags','relationships','entity_tags'] LOOP
    EXECUTE format('drop policy if exists %I on public.%I', t||'_owner', t);
    EXECUTE format('create policy %I on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t||'_owner', t);
  END LOOP;
END $$;

-- Child ownership follows the parent owner.
DO $$
BEGIN
  execute 'create policy units_owner on public.units for all to authenticated using (exists (select 1 from public.subjects s where s.id=units.subject_id and s.user_id=(select auth.uid()))) with check (exists (select 1 from public.subjects s where s.id=units.subject_id and s.user_id=(select auth.uid())))';
  execute 'create policy lessons_owner on public.lessons for all to authenticated using (exists (select 1 from public.units u join public.subjects s on s.id=u.subject_id where u.id=lessons.unit_id and s.user_id=(select auth.uid()))) with check (exists (select 1 from public.units u join public.subjects s on s.id=u.subject_id where u.id=lessons.unit_id and s.user_id=(select auth.uid())))';
  execute 'create policy lesson_requirements_owner on public.lesson_requirements for all to authenticated using (exists (select 1 from public.lessons l join public.units u on u.id=l.unit_id join public.subjects s on s.id=u.subject_id where l.id=lesson_requirements.lesson_id and s.user_id=(select auth.uid()))) with check (exists (select 1 from public.lessons l join public.units u on u.id=l.unit_id join public.subjects s on s.id=u.subject_id where l.id=lesson_requirements.lesson_id and s.user_id=(select auth.uid())))';
  execute 'create policy test_questions_owner on public.test_questions for all to authenticated using (exists (select 1 from public.tests t where t.id=test_questions.test_id and t.user_id=(select auth.uid()))) with check (exists (select 1 from public.tests t where t.id=test_questions.test_id and t.user_id=(select auth.uid())))';
  execute 'create policy project_tasks_owner on public.project_tasks for all to authenticated using (exists (select 1 from public.projects p where p.id=project_tasks.project_id and p.user_id=(select auth.uid()))) with check (exists (select 1 from public.projects p where p.id=project_tasks.project_id and p.user_id=(select auth.uid())))';
  execute 'create policy project_components_owner on public.project_components for all to authenticated using (exists (select 1 from public.projects p where p.id=project_components.project_id and p.user_id=(select auth.uid()))) with check (exists (select 1 from public.projects p where p.id=project_components.project_id and p.user_id=(select auth.uid())) and exists (select 1 from public.components c where c.id=project_components.component_id and c.user_id=(select auth.uid())))';
  execute 'create policy circuit_components_owner on public.circuit_components for all to authenticated using (exists (select 1 from public.circuits c where c.id=circuit_components.circuit_id and c.user_id=(select auth.uid()))) with check (exists (select 1 from public.circuits c where c.id=circuit_components.circuit_id and c.user_id=(select auth.uid())) and exists (select 1 from public.components c where c.id=circuit_components.component_id and c.user_id=(select auth.uid())))';
  execute 'create policy wellness_habits_owner on public.wellness_habits for all to authenticated using (exists (select 1 from public.wellness_categories c where c.id=wellness_habits.category_id and c.user_id=(select auth.uid()))) with check (exists (select 1 from public.wellness_categories c where c.id=wellness_habits.category_id and c.user_id=(select auth.uid())))';
  execute 'create policy habit_goals_owner on public.habit_goals for all to authenticated using (exists (select 1 from public.wellness_habits h join public.wellness_categories c on c.id=h.category_id where h.id=habit_goals.habit_id and c.user_id=(select auth.uid()))) with check (exists (select 1 from public.wellness_habits h join public.wellness_categories c on c.id=h.category_id where h.id=habit_goals.habit_id and c.user_id=(select auth.uid())))';
  execute 'create policy wellness_checkins_owner on public.wellness_checkins for all to authenticated using ((select auth.uid())=user_id and exists (select 1 from public.wellness_habits h join public.wellness_categories c on c.id=h.category_id where h.id=wellness_checkins.habit_id and c.user_id=(select auth.uid()))) with check ((select auth.uid())=user_id and exists (select 1 from public.wellness_habits h join public.wellness_categories c on c.id=h.category_id where h.id=wellness_checkins.habit_id and c.user_id=(select auth.uid())))';
END $$;

-- Explicit Data API access for authenticated users. Anonymous access is not granted.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.lesson_progress, public.unit_progress, public.subject_progress, public.project_progress to authenticated;

-- Because automatic exposure was disabled at project creation, future public tables stay closed
-- until a later migration explicitly grants access.
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- Helpful indexes
create index if not exists subjects_user_id_idx on public.subjects(user_id);
create index if not exists units_subject_id_idx on public.units(subject_id);
create index if not exists lessons_unit_id_idx on public.lessons(unit_id);
create index if not exists lesson_requirements_lesson_id_idx on public.lesson_requirements(lesson_id);
create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists tests_user_id_idx on public.tests(user_id);
create index if not exists mistakes_user_id_idx on public.mistakes(user_id);
create index if not exists components_user_id_idx on public.components(user_id);
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists project_tasks_project_id_idx on public.project_tasks(project_id);
create index if not exists circuits_user_id_idx on public.circuits(user_id);
create index if not exists study_sessions_user_id_idx on public.study_sessions(user_id);
create index if not exists wellness_categories_user_id_idx on public.wellness_categories(user_id);
create index if not exists wellness_checkins_user_id_idx on public.wellness_checkins(user_id);
create index if not exists files_user_id_idx on public.files(user_id);
