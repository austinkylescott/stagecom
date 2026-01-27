-- Seed/demo data for Stagecom
-- Assumes 001-init.sql has run and auth.users contains at least a few users.

-- Example users (profiles) tied to auth.users ids (replace with real auth IDs)
-- You can replace these UUIDs with values from your Supabase auth.users table.
with u as (
  select
    '11111111-1111-1111-1111-111111111111'::uuid as id,
    'Alice Director' as name,
    'America/New_York' as tz
  union all
  select '22222222-2222-2222-2222-222222222222', 'Ben Producer', 'America/Chicago'
  union all
  select '33333333-3333-3333-3333-333333333333', 'Casey Performer', 'America/Los_Angeles'
)
insert into profiles (id, display_name, timezone)
select id, name, tz from u
on conflict (id) do update set display_name = excluded.display_name, timezone = excluded.timezone;

-- Theater
insert into theaters (id, name, slug, timezone)
values (
  'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  'Downtown Improv Co',
  'downtown-improv',
  'America/Chicago'
) on conflict (id) do nothing;

-- Memberships
insert into theater_memberships (theater_id, user_id, role, status) values
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'manager', 'active'),
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '22222222-2222-2222-2222-222222222222', 'staff', 'active'),
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '33333333-3333-3333-3333-333333333333', 'member', 'active')
on conflict do nothing;

-- Show
insert into shows (id, theater_id, created_by_user_id, status, title, description, casting_mode, cast_min, cast_max, is_public_listed, on_sale_at)
values (
  'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  '11111111-1111-1111-1111-111111111111',
  'approved',
  'Friday Night Laughs',
  'Weekly improv showcase',
  'direct_invite',
  4,
  8,
  true,
  now() + interval '3 days'
) on conflict (id) do nothing;

-- Show roles (producer)
insert into show_roles (show_id, user_id, role)
values (
  'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  '11111111-1111-1111-1111-111111111111',
  'producer'
) on conflict do nothing;

-- Occurrence
insert into show_occurrences (id, show_id, starts_at, ends_at)
values (
  'ccccccc1-cccc-cccc-cccc-ccccccccccc1',
  'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  date_trunc('week', now()) + interval '5 days' + time '20:00',
  date_trunc('week', now()) + interval '5 days' + time '21:30'
) on conflict (id) do nothing;

-- Cast
insert into show_cast (show_id, user_id, source, status, program_order)
values
  ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '22222222-2222-2222-2222-222222222222', 'invited', 'accepted', 1),
  ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '33333333-3333-3333-3333-333333333333', 'invited', 'pending', 2)
on conflict do nothing;

-- Review events
insert into show_review_events (id, show_id, action, actor_user_id, note)
values (
  'ddddddd1-dddd-dddd-dddd-ddddddddddd1',
  'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  'approved',
  '11111111-1111-1111-1111-111111111111',
  'Auto-approved seed data'
) on conflict (id) do nothing;

-- Notifications
insert into notifications (id, user_id, type, entity_type, entity_id, payload, dedupe_key)
values (
  'eeeeeee1-eeee-eeee-eeee-eeeeeeeeeee1',
  '33333333-3333-3333-3333-333333333333',
  'show_invite',
  'cast',
  'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  '{"message": "You are invited"}',
  'show_invite_demo_1'
) on conflict (id) do nothing;

-- Email outbox
insert into email_outbox (id, user_id, template, payload, status)
values (
  'fffffff1-ffff-ffff-ffff-fffffffffff1',
  '33333333-3333-3333-3333-333333333333',
  'invite_email',
  '{"subject": "You\u2019re invited"}',
  'queued'
) on conflict (id) do nothing;
