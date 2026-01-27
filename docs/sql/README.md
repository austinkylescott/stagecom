# Stagecom SQL

- `001-init.sql` — drops and recreates core tables/enums/triggers per `docs/data-model.md`.
- `002-seed.sql` — optional demo seed data; replace UUIDs with your Supabase auth user IDs.

## Usage

### Local psql
```
psql "$DATABASE_URL" -f docs/sql/001-init.sql
psql "$DATABASE_URL" -f docs/sql/002-seed.sql
```

### Supabase SQL editor
Paste the file contents into the SQL editor and run. Make sure `auth.users` contains matching IDs before seeding.

### Rebuilding from scratch
Running `001-init.sql` will drop existing tables/enums (dev-safe). For production, convert to migrations and remove the blanket drops.
