-- Jay's Engineering Lab V0.1 schema
create extension if not exists pgcrypto;

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, name text not null, description text, sort_order int default 0, created_at timestamptz default now()
);
create table if not exists public.units (
  id uuid primary key default gen_random_uuid(), subject_id uuid not null references public.subjects(id) on delete cascade, name text not null, description text, sort_order int default 0, created_at timestamptz default now()
);
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(), unit_id uuid not null references public.units(id) on delete cascade, name text not null, description text, sort_order int default 0, created_at timestamptz default now()
);
create table if not exists public.lesson_requirements (
  id uuid primary key default gen_random_uuid(), lesson_id uuid not null references public.lessons(id) on delete cascade, requirement text not null, completed boolean not null default false, sort_order int default 0, completed_at timestamptz
);
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null, content text default '', subject_id uuid references public.subjects(id) on delete set null, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, name text not null, subject_id uuid references public.subjects(id) on delete set null, score numeric, max_score numeric, test_date date default current_date, difficulty text, notes text, created_at timestamptz default now()
);
create table if not exists public.mistakes (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, subject_id uuid references public.subjects(id) on delete set null, topic text, question text, user_answer text, correct_answer text, explanation text, what_went_wrong text, severity text default 'medium', resolved boolean not null default false, created_at timestamptz default now()
);
create table if not exists public.components (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, name text not null, type text, value text, quantity int not null default 0, manufacturer text, part_number text, purpose text, package text, datasheet_url text, photo_path text, location_code text, notes text, created_at timestamptz default now()
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, name text not null, description text, goal text, status text not null default 'active', progress int not null default 0 check (progress between 0 and 100), start_date date, due_date date, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade, title text not null, completed boolean not null default false, sort_order int default 0
);
create table if not exists public.circuits (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, name text not null, subject_id uuid references public.subjects(id) on delete set null, topic text, schematic_path text, equations text, calculations text, expected_result text, measured_result text, simulation_result text, final_answer text, explanation text, created_at timestamptz default now()
);
create table if not exists public.circuit_components (
  circuit_id uuid not null references public.circuits(id) on delete cascade, component_id uuid not null references public.components(id) on delete cascade, quantity int default 1, primary key (circuit_id, component_id)
);
create table if not exists public.project_components (
  project_id uuid not null references public.projects(id) on delete cascade, component_id uuid not null references public.components(id) on delete cascade, quantity int default 1, primary key (project_id, component_id)
);
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, subject_id uuid references public.subjects(id) on delete set null, topic text, started_at timestamptz not null, ended_at timestamptz, duration_minutes int, summary text, created_at timestamptz default now()
);
create table if not exists public.wellness_categories (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, name text not null, created_at timestamptz default now()
);
create table if not exists public.wellness_habits (
  id uuid primary key default gen_random_uuid(), category_id uuid not null references public.wellness_categories(id) on delete cascade, name text not null, target numeric, unit text, created_at timestamptz default now()
);
create table if not exists public.wellness_checkins (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, habit_id uuid not null references public.wellness_habits(id) on delete cascade, checkin_date date not null default current_date, completed boolean not null default false, measurement numeric, note text, unique(habit_id, checkin_date)
);
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, bucket text not null, storage_path text not null, file_name text not null, mime_type text, size_bytes bigint, created_at timestamptz default now()
);
create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(), user_id uuid not null, source_type text not null, source_id uuid not null, relationship_type text not null, target_type text not null, target_id uuid not null, created_at timestamptz default now()
);

-- Progress views keep dashboard values derived from source records.
create or replace view public.lesson_progress as
select l.id, l.unit_id, l.name, count(r.id)::int as requirement_count,
       coalesce(sum(case when r.completed then 1 else 0 end),0)::int as completed_count,
       case when count(r.id)=0 then 0 else round((sum(case when r.completed then 1 else 0 end)::numeric / count(r.id))*100)::int end as progress
from public.lessons l left join public.lesson_requirements r on r.lesson_id=l.id group by l.id;

create or replace view public.unit_progress as
select u.id, u.subject_id, u.name, count(l.id)::int as lesson_count,
       coalesce(round(avg(lp.progress)),0)::int as progress
from public.units u left join public.lessons l on l.unit_id=u.id left join public.lesson_progress lp on lp.id=l.id group by u.id;

create or replace view public.subject_progress as
select s.id, s.user_id, s.name, count(u.id)::int as unit_count,
       coalesce(round(avg(up.progress)),0)::int as progress
from public.subjects s left join public.units u on u.subject_id=s.id left join public.unit_progress up on up.id=u.id group by s.id;

-- Enable RLS. Policies below assume Supabase Auth users and auth.uid() ownership.
alter table public.subjects enable row level security;
alter table public.notes enable row level security;
alter table public.tests enable row level security;
alter table public.mistakes enable row level security;
alter table public.components enable row level security;
alter table public.projects enable row level security;
alter table public.circuits enable row level security;
alter table public.study_sessions enable row level security;
alter table public.wellness_categories enable row level security;
alter table public.wellness_checkins enable row level security;
alter table public.files enable row level security;
alter table public.relationships enable row level security;

-- Add owner policies after confirming your Supabase Auth setup. This avoids accidentally opening personal data.
