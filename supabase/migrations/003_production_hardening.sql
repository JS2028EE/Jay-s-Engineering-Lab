-- Jay's Engineering Lab V0.3 production hardening
-- Applied to production on 2026-09-18 after Supabase advisor audit.

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
alter function public.set_updated_at() set search_path = pg_catalog, public;

create index if not exists circuits_subject_id_idx on public.circuits(subject_id);
create index if not exists circuits_topic_id_idx on public.circuits(topic_id);
create index if not exists components_location_id_idx on public.components(location_id);
create index if not exists habit_goals_habit_id_idx on public.habit_goals(habit_id);
create index if not exists mistakes_subject_id_idx on public.mistakes(subject_id);
create index if not exists mistakes_topic_id_idx on public.mistakes(topic_id);
create index if not exists notes_subject_id_idx on public.notes(subject_id);
create index if not exists notes_topic_id_idx on public.notes(topic_id);
create index if not exists project_components_component_id_idx on public.project_components(component_id);
create index if not exists circuit_components_component_id_idx on public.circuit_components(component_id);
create index if not exists study_sessions_subject_id_idx on public.study_sessions(subject_id);
create index if not exists study_sessions_topic_id_idx on public.study_sessions(topic_id);
create index if not exists tests_subject_id_idx on public.tests(subject_id);
create index if not exists tests_topic_id_idx on public.tests(topic_id);
create index if not exists topics_subject_id_idx on public.topics(subject_id);
create index if not exists wellness_habits_category_id_idx on public.wellness_habits(category_id);
