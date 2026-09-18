-- Jay's Engineering Lab V0.4 relationship ownership hardening
-- Generic graph rows must reference records owned by the current user.

create or replace function public.entity_owned_by_user(p_entity_type text, p_entity_id uuid, p_user_id uuid)
returns boolean
language sql
stable
set search_path = pg_catalog, public
as $$
  select case p_entity_type
    when 'subject' then exists (
      select 1 from public.subjects s
      where s.id = p_entity_id and s.user_id = p_user_id
    )
    when 'lesson' then exists (
      select 1
      from public.lessons l
      join public.units u on u.id = l.unit_id
      join public.subjects s on s.id = u.subject_id
      where l.id = p_entity_id and s.user_id = p_user_id
    )
    when 'note' then exists (
      select 1 from public.notes n
      where n.id = p_entity_id and n.user_id = p_user_id
    )
    when 'test' then exists (
      select 1 from public.tests t
      where t.id = p_entity_id and t.user_id = p_user_id
    )
    when 'circuit' then exists (
      select 1 from public.circuits c
      where c.id = p_entity_id and c.user_id = p_user_id
    )
    when 'component' then exists (
      select 1 from public.components c
      where c.id = p_entity_id and c.user_id = p_user_id
    )
    when 'project' then exists (
      select 1 from public.projects p
      where p.id = p_entity_id and p.user_id = p_user_id
    )
    when 'mistake' then exists (
      select 1 from public.mistakes m
      where m.id = p_entity_id and m.user_id = p_user_id
    )
    else false
  end;
$$;

revoke execute on function public.entity_owned_by_user(text, uuid, uuid) from anon;
grant execute on function public.entity_owned_by_user(text, uuid, uuid) to authenticated;

alter table public.relationships
  drop constraint if exists relationships_source_type_check,
  drop constraint if exists relationships_target_type_check,
  drop constraint if exists relationships_relationship_type_check;

alter table public.relationships
  add constraint relationships_source_type_check check (
    source_type in ('subject','lesson','note','test','circuit','component','project','mistake')
  ),
  add constraint relationships_target_type_check check (
    target_type in ('subject','lesson','note','test','circuit','component','project','mistake')
  ),
  add constraint relationships_relationship_type_check check (
    relationship_type in ('related_to','explained_by','appears_in','caused','uses','tested_by','built_with','derived_from','supports','documents')
  );

drop policy if exists relationships_owner on public.relationships;
create policy relationships_owner
on public.relationships
for all
to authenticated
using (
  (select auth.uid()) = user_id
  and public.entity_owned_by_user(source_type, source_id, (select auth.uid()))
  and public.entity_owned_by_user(target_type, target_id, (select auth.uid()))
)
with check (
  (select auth.uid()) = user_id
  and public.entity_owned_by_user(source_type, source_id, (select auth.uid()))
  and public.entity_owned_by_user(target_type, target_id, (select auth.uid()))
);

drop policy if exists entity_tags_owner on public.entity_tags;
create policy entity_tags_owner
on public.entity_tags
for all
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.tags t
    where t.id = entity_tags.tag_id
      and t.user_id = (select auth.uid())
  )
  and public.entity_owned_by_user(entity_type, entity_id, (select auth.uid()))
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.tags t
    where t.id = entity_tags.tag_id
      and t.user_id = (select auth.uid())
  )
  and public.entity_owned_by_user(entity_type, entity_id, (select auth.uid()))
);

create index if not exists entity_tags_entity_idx on public.entity_tags(entity_type, entity_id);
