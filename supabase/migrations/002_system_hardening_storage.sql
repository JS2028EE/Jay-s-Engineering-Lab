-- Jay's Engineering Lab V0.2 hardening + file storage
-- Run after 001_initial_schema.sql.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'subjects','units','lessons','lesson_requirements','topics','notes','tests',
    'test_questions','mistakes','component_locations','components','projects',
    'project_tasks','circuits','study_sessions','wellness_categories',
    'wellness_habits','wellness_checkins'
  ] loop
    execute format('drop trigger if exists %I on public.%I', t||'_updated_at', t);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t||'_updated_at', t
    );
  end loop;
end $$;

create index if not exists study_sessions_started_at_idx on public.study_sessions(started_at desc);
create index if not exists tests_test_date_idx on public.tests(test_date desc);
create index if not exists relationships_source_idx on public.relationships(source_type,source_id);
create index if not exists relationships_target_idx on public.relationships(target_type,target_id);
create index if not exists wellness_checkins_habit_date_idx on public.wellness_checkins(habit_id,checkin_date desc);

-- Private storage bucket for engineering files.
insert into storage.buckets (id,name,public)
values ('engineering-lab-files','engineering-lab-files',false)
on conflict (id) do update set public = false;

drop policy if exists "engineering files insert own folder" on storage.objects;
drop policy if exists "engineering files read own folder" on storage.objects;
drop policy if exists "engineering files update own folder" on storage.objects;
drop policy if exists "engineering files delete own folder" on storage.objects;

create policy "engineering files insert own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'engineering-lab-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "engineering files read own folder"
on storage.objects for select to authenticated
using (
  bucket_id = 'engineering-lab-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "engineering files update own folder"
on storage.objects for update to authenticated
using (
  bucket_id = 'engineering-lab-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'engineering-lab-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "engineering files delete own folder"
on storage.objects for delete to authenticated
using (
  bucket_id = 'engineering-lab-files'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

grant select, insert, update, delete on public.files to authenticated;
