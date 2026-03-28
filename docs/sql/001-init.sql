
-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Drop tables in reverse dependency order
drop table if exists email_outbox cascade;
drop table if exists notifications cascade;
drop table if exists show_review_events cascade;
drop table if exists show_cast cascade;
drop table if exists show_occurrences cascade;
drop table if exists show_roles cascade;
drop table if exists shows cascade;
drop table if exists theater_memberships cascade;
drop table if exists theaters cascade;
drop table if exists profiles cascade;

-- Drop enums
drop type if exists email_outbox_status cascade;
drop type if exists notification_entity cascade;
drop type if exists review_action cascade;
drop type if exists show_cast_status cascade;
drop type if exists show_cast_source cascade;
drop type if exists show_occurrence_status cascade;
drop type if exists show_role cascade;
drop type if exists casting_mode cascade;
drop type if exists event_type cascade;
drop type if exists show_status cascade;
drop type if exists membership_status cascade;
drop type if exists theater_role cascade;
drop type if exists profile_visibility cascade;

-- Enums
create type theater_role as enum ('admin', 'manager', 'staff', 'instructor', 'member');
create type membership_status as enum ('active', 'inactive');
create type show_status as enum ('draft', 'pending_review', 'approved', 'rejected', 'cancelled');
create type event_type as enum ('show', 'practice', 'meeting', 'audition', 'workshop');
create type casting_mode as enum ('direct_invite', 'theater_casting', 'public_casting');
create type show_role as enum ('producer');
create type show_occurrence_status as enum ('scheduled', 'changed', 'cancelled');
create type show_cast_source as enum ('invited', 'requested');
create type show_cast_status as enum ('pending', 'accepted', 'declined', 'withdrawn', 'removed');
create type review_action as enum ('submitted', 'approved', 'rejected', 'changes_requested');
create type notification_entity as enum ('show', 'occurrence', 'cast');
create type email_outbox_status as enum ('queued', 'sent', 'failed');
create type profile_visibility as enum ('public', 'theater_only', 'private');

-- Users / profiles (ties to Supabase auth.users)
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
    display_name text not null,
    avatar_url text,
    timezone text default 'UTC',
    pronouns text,
    bio text,
    city text,
    handle text,
    home_theater_id uuid,
    contact_links jsonb not null default '{}'::jsonb,
    notification_preferences jsonb not null default '{}'::jsonb,
    availability jsonb,
    casting_notes text,
    visibility profile_visibility not null default 'theater_only',
    verified_at timestamptz,
    trust_flags jsonb not null default '{}'::jsonb,
    deleted_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index idx_profiles_display_name on profiles using gin (to_tsvector('english', display_name));
create unique index idx_profiles_handle_lower_unique on profiles (lower(handle));

-- Theaters
create table theaters (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    tagline text,
    street text,
    city text,
    state_region text,
    postal_code text,
    country text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Theater memberships
create table theater_memberships (
    theater_id uuid not null references theaters(id) on delete cascade,
    user_id uuid not null references profiles(id) on delete cascade,
    roles theater_role[] not null default array['member']::theater_role[],
    status membership_status not null default 'active',
    created_at timestamptz not null default now(),
    primary key (theater_id, user_id)
);
create index idx_theater_memberships_user on theater_memberships (user_id);

-- Shows
create table shows (
    id uuid primary key default gen_random_uuid(),
    theater_id uuid not null references theaters(id) on delete cascade,
    created_by_user_id uuid references profiles(id) on delete set null,
    status show_status not null default 'draft',
    title text not null,
    description text,
    event_type event_type not null default 'show',
    casting_mode casting_mode not null default 'direct_invite',
    cast_min integer,
    cast_max integer,
    is_cast_finalized boolean not null default false,
    is_public_listed boolean not null default false,
    ticket_url text,
    on_sale_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index idx_shows_theater on shows (theater_id);
create index idx_shows_status on shows (status);

-- Show roles (producer, etc.)
create table show_roles (
    show_id uuid not null references shows(id) on delete cascade,
    user_id uuid not null references profiles(id) on delete cascade,
    role show_role not null default 'producer',
    created_at timestamptz not null default now(),
    primary key (show_id, user_id, role)
);

-- Occurrences
create table show_occurrences (
    id uuid primary key default gen_random_uuid(),
    show_id uuid not null references shows(id) on delete cascade,
    starts_at timestamptz not null,
    ends_at timestamptz,
    status show_occurrence_status not null default 'scheduled',
    created_at timestamptz not null default now()
);
create index idx_show_occurrences_show on show_occurrences (show_id, starts_at);

-- Cast assignments
create table show_cast (
    show_id uuid not null references shows(id) on delete cascade,
    user_id uuid not null references profiles(id) on delete cascade,
    source show_cast_source not null,
    status show_cast_status not null default 'pending',
    program_order integer,
    note text,
    created_at timestamptz not null default now(),
    primary key (show_id, user_id)
);
create index idx_show_cast_user on show_cast (user_id);

-- Review events / moderation log
create table show_review_events (
    id uuid primary key default gen_random_uuid(),
    show_id uuid not null references shows(id) on delete cascade,
    action review_action not null,
    actor_user_id uuid references profiles(id) on delete set null,
    note text,
    created_at timestamptz not null default now()
);
create index idx_show_review_events_show on show_review_events (show_id, created_at);

-- Notifications
create table notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references profiles(id) on delete cascade,
    type text not null,
    entity_type notification_entity not null,
    entity_id uuid not null,
    payload jsonb,
    dedupe_key text not null,
    read_at timestamptz,
    created_at timestamptz not null default now(),
    unique (user_id, dedupe_key)
);
create index idx_notifications_user_read on notifications (user_id, read_at);

-- Email outbox (optional)
create table email_outbox (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references profiles(id) on delete set null,
    template text not null,
    payload jsonb,
    dedupe_key text,
    status email_outbox_status not null default 'queued',
    created_at timestamptz not null default now(),
    sent_at timestamptz,
    last_error text,
    unique (user_id, dedupe_key)
);

-- Utility function: update updated_at automatically where present
create or replace function public.set_timestamp()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Attach triggers to tables that have updated_at
create trigger trg_profiles_updated
  before update on profiles
  for each row execute procedure set_timestamp();

create trigger trg_theaters_updated
  before update on theaters
  for each row execute procedure set_timestamp();

create trigger trg_shows_updated
  before update on shows
  for each row execute procedure set_timestamp();

-- Late-bound FK to avoid circular dependency
alter table profiles
  add constraint fk_profiles_home_theater
  foreign key (home_theater_id) references theaters(id) on delete set null;

-- Bootstrap profile on new auth user (e.g., GitHub OAuth display name)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  display_name text;
begin
  display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'user_name',
    new.email,
    'New user'
  );

  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, display_name, new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path to 'public';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Security hardening: repo-visible RLS and policy definitions for auth-sensitive tables.
create or replace function public.is_active_member_of_theater(p_theater_id uuid)
returns boolean
language sql
stable security definer
set search_path to 'public'
as $function$
  select exists (
    select 1
    from public.theater_memberships m
    where m.user_id = auth.uid()
      and m.status = 'active'::membership_status
      and m.theater_id = p_theater_id
  );
$function$;

create or replace function public.is_theater_staff(p_theater_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select exists (
    select 1
    from public.theater_memberships m
    where m.theater_id = p_theater_id
      and m.user_id = auth.uid()
      and m.status = 'active'::membership_status
      and (
        'admin'::theater_role = any(m.roles)
        or 'manager'::theater_role = any(m.roles)
        or 'staff'::theater_role = any(m.roles)
      )
  );
$function$;

create or replace function public.is_show_producer(p_show_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select exists (
    select 1
    from public.show_roles r
    where r.show_id = p_show_id
      and r.user_id = auth.uid()
      and r.role = 'producer'::show_role
  );
$function$;

create or replace function public.can_view_profile(
  p_profile_id uuid,
  p_visibility profile_visibility
)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    auth.uid() = p_profile_id
    or p_visibility = 'public'::profile_visibility
    or (
      p_visibility = 'theater_only'::profile_visibility
      and exists (
        select 1
        from public.theater_memberships mine
        join public.theater_memberships theirs
          on theirs.theater_id = mine.theater_id
        where mine.user_id = auth.uid()
          and mine.status = 'active'::membership_status
          and theirs.user_id = p_profile_id
          and theirs.status = 'active'::membership_status
      )
    );
$function$;

create or replace function public.can_view_show(p_show_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select exists (
    select 1
    from public.shows s
    where s.id = p_show_id
      and (
        (s.status = 'approved'::show_status and s.is_public_listed = true)
        or public.is_show_producer(s.id)
        or public.is_theater_staff(s.theater_id)
        or exists (
          select 1
          from public.show_cast c
          where c.show_id = s.id
            and c.user_id = auth.uid()
            and c.status in (
              'pending'::show_cast_status,
              'accepted'::show_cast_status
            )
        )
      )
  );
$function$;

create or replace function public.can_insert_show_role(
  p_show_id uuid,
  p_user_id uuid,
  p_role show_role
)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    (
      p_user_id = auth.uid()
      and p_role = 'producer'::show_role
      and exists (
        select 1
        from public.shows s
        where s.id = p_show_id
          and s.created_by_user_id = auth.uid()
      )
    )
    or exists (
      select 1
      from public.shows s
      where s.id = p_show_id
        and public.is_theater_staff(s.theater_id)
    );
$function$;

create or replace function public.can_insert_show_cast(
  p_show_id uuid,
  p_user_id uuid,
  p_source show_cast_source,
  p_status show_cast_status
)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    (
      public.is_show_producer(p_show_id)
      and p_source = 'invited'::show_cast_source
      and p_status = 'pending'::show_cast_status
    )
    or (
      p_user_id = auth.uid()
      and p_source = 'requested'::show_cast_source
      and p_status = 'pending'::show_cast_status
      and exists (
        select 1
        from public.shows s
        where s.id = p_show_id
          and not public.is_show_producer(s.id)
          and (
            s.casting_mode = 'public_casting'::casting_mode
            or (
              s.casting_mode = 'theater_casting'::casting_mode
              and public.is_active_member_of_theater(s.theater_id)
            )
          )
      )
    );
$function$;

create or replace function public.can_update_show_cast(
  p_show_id uuid,
  p_user_id uuid,
  p_source show_cast_source,
  p_status show_cast_status,
  p_program_order integer,
  p_note text
)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    public.is_show_producer(p_show_id)
    or exists (
      select 1
      from public.show_cast existing
      where existing.show_id = p_show_id
        and existing.user_id = auth.uid()
        and p_user_id = auth.uid()
        and existing.program_order is not distinct from p_program_order
        and existing.note is not distinct from p_note
        and existing.source = p_source
        and (
          (
            existing.source = 'invited'::show_cast_source
            and existing.status = 'pending'::show_cast_status
            and p_status in (
              'accepted'::show_cast_status,
              'declined'::show_cast_status
            )
          )
          or (
            existing.source = 'requested'::show_cast_source
            and existing.status = 'pending'::show_cast_status
            and p_status = 'withdrawn'::show_cast_status
          )
          or (
            existing.status = 'accepted'::show_cast_status
            and p_status = 'withdrawn'::show_cast_status
          )
        )
    );
$function$;

-- Direct authenticated inserts into show_review_events stay staff-scoped.
-- Producer review submissions are expected to be recorded by an authorized
-- server-side workflow after producer permissions are checked.

alter table public.profiles enable row level security;
alter table public.theaters enable row level security;
alter table public.theater_memberships enable row level security;
alter table public.shows enable row level security;
alter table public.show_roles enable row level security;
alter table public.show_occurrences enable row level security;
alter table public.show_cast enable row level security;
alter table public.show_review_events enable row level security;
alter table public.notifications enable row level security;
alter table public.email_outbox enable row level security;

drop policy if exists "profiles_select_visible" on public.profiles;
create policy "profiles_select_visible"
on public.profiles
for select
to authenticated, anon
using (public.can_view_profile(id, visibility));

drop policy if exists "theaters_select_public" on public.theaters;
create policy "theaters_select_public"
on public.theaters
for select
to authenticated, anon
using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "theater_memberships_select_visible" on public.theater_memberships;
create policy "theater_memberships_select_visible"
on public.theater_memberships
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_theater_staff(theater_id)
  or (
    status = 'active'::membership_status
    and public.is_active_member_of_theater(theater_id)
  )
);

drop policy if exists "shows_select_visible" on public.shows;
create policy "shows_select_visible"
on public.shows
for select
to authenticated, anon
using (public.can_view_show(id));

drop policy if exists "shows_insert_active_member" on public.shows;
create policy "shows_insert_active_member"
on public.shows
for insert
to authenticated
with check (
  created_by_user_id = auth.uid()
  and public.is_active_member_of_theater(theater_id)
);

drop policy if exists "shows_update_staff_or_producer" on public.shows;
create policy "shows_update_staff_or_producer"
on public.shows
for update
to authenticated
using (
  public.is_show_producer(id)
  or public.is_theater_staff(theater_id)
)
with check (
  public.is_show_producer(id)
  or public.is_theater_staff(theater_id)
);

drop policy if exists "show_roles_select_visible" on public.show_roles;
create policy "show_roles_select_visible"
on public.show_roles
for select
to authenticated, anon
using (
  public.can_view_show(show_id)
  or user_id = auth.uid()
);

drop policy if exists "show_roles_insert_staff_or_producer" on public.show_roles;
create policy "show_roles_insert_staff_or_producer"
on public.show_roles
for insert
to authenticated
with check (public.can_insert_show_role(show_id, user_id, role));

drop policy if exists "show_occurrences_select_visible" on public.show_occurrences;
create policy "show_occurrences_select_visible"
on public.show_occurrences
for select
to authenticated, anon
using (public.can_view_show(show_id));

drop policy if exists "show_occurrences_mutate_staff_or_producer" on public.show_occurrences;
create policy "show_occurrences_mutate_staff_or_producer"
on public.show_occurrences
for all
to authenticated
using (
  public.is_show_producer(show_id)
  or exists (
    select 1
    from public.shows s
    where s.id = show_id
      and public.is_theater_staff(s.theater_id)
  )
)
with check (
  public.is_show_producer(show_id)
  or exists (
    select 1
    from public.shows s
    where s.id = show_id
      and public.is_theater_staff(s.theater_id)
  )
);

drop policy if exists "show_cast_select_visible" on public.show_cast;
create policy "show_cast_select_visible"
on public.show_cast
for select
to authenticated, anon
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.shows s
    where s.id = show_id
      and (
        public.is_show_producer(s.id)
        or public.is_theater_staff(s.theater_id)
        or (
          s.status = 'approved'::show_status
          and s.is_public_listed = true
          and show_cast.status = 'accepted'::show_cast_status
        )
        or (
          show_cast.status in (
            'accepted'::show_cast_status,
            'pending'::show_cast_status
          )
          and exists (
            select 1
            from public.show_cast mine
            where mine.show_id = show_cast.show_id
              and mine.user_id = auth.uid()
              and (
                mine.status = 'accepted'::show_cast_status
                or (mine.status = 'pending'::show_cast_status and mine.source = 'invited'::show_cast_source)
              )
          )
        )
      )
  )
);

drop policy if exists "show_cast_insert_self_or_producer" on public.show_cast;
create policy "show_cast_insert_self_or_producer"
on public.show_cast
for insert
to authenticated
with check (public.can_insert_show_cast(show_id, user_id, source, status));

drop policy if exists "show_cast_update_self_or_producer" on public.show_cast;
create policy "show_cast_update_self_or_producer"
on public.show_cast
for update
to authenticated
using (
  user_id = auth.uid()
  or public.is_show_producer(show_id)
)
with check (
  public.can_update_show_cast(
    show_id,
    user_id,
    source,
    status,
    program_order,
    note
  )
);

drop policy if exists "show_review_events_select_visible" on public.show_review_events;
create policy "show_review_events_select_visible"
on public.show_review_events
for select
to authenticated
using (public.can_view_show(show_id));

drop policy if exists "show_review_events_insert_staff" on public.show_review_events;
create policy "show_review_events_insert_staff"
on public.show_review_events
for insert
to authenticated
with check (
  actor_user_id = auth.uid()
  and exists (
    select 1
    from public.shows s
    where s.id = show_id
      and public.is_theater_staff(s.theater_id)
  )
);

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "email_outbox_select_own" on public.email_outbox;
create policy "email_outbox_select_own"
on public.email_outbox
for select
to authenticated
using (user_id = auth.uid());
