-- Reconcile legacy shows.is_practice with the canonical shows.event_type enum.
-- Safe to run after 001-init.sql or on older databases.

do $$
begin
  create type event_type as enum ('show', 'practice', 'meeting', 'audition', 'workshop');
exception
  when duplicate_object then null;
end $$;

alter table shows
  add column if not exists event_type event_type;

alter table shows
  alter column event_type set default 'show';

update shows
set event_type = case
  when coalesce(is_practice, false) then 'practice'::event_type
  else 'show'::event_type
end
where event_type is null;

alter table shows
  alter column event_type set not null;

alter table shows
  drop column if exists is_practice;
