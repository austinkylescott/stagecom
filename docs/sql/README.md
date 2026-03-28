# Stagecom SQL

- `001-init.sql` — drops and recreates core tables/enums/triggers per `docs/data/data-model.md`.
- `002-seed.sql` — legacy one-off demo seed data; useful as a reference, but the config-driven workflow below is the preferred mock-data path now.
- `003-event-type-migration.sql` — converts legacy `shows.is_practice` to `shows.event_type` and removes `is_practice`.
- `project/scripts/mock-data.mjs` — generates deterministic mock SQL from a JSON config with real auth user IDs.

## Usage

### Local psql
```
PGHOST="$DB_HOST" PGPORT="$DB_PORT" PGDATABASE="$DB_NAME" PGUSER="$DB_USER" PGPASSWORD="$DB_PASSWORD" psql -f docs/sql/001-init.sql
PGHOST="$DB_HOST" PGPORT="$DB_PORT" PGDATABASE="$DB_NAME" PGUSER="$DB_USER" PGPASSWORD="$DB_PASSWORD" psql -f docs/sql/002-seed.sql
# Optional for existing databases that still have shows.is_practice:
PGHOST="$DB_HOST" PGPORT="$DB_PORT" PGDATABASE="$DB_NAME" PGUSER="$DB_USER" PGPASSWORD="$DB_PASSWORD" psql -f docs/sql/003-event-type-migration.sql
```

### Project scripts

Run commands from `project/`.

```bash
npm run db:audit:live
npm run auth:seed:mock -- --config ./mock-data.config.json --out ./mock-data.resolved.json
npm run db:seed:mock:full -- ./mock-data.config.json
npm run db:reset
npm run db:seed:mock -- ./mock-data.config.json
npm run db:rebuild:mock -- ./mock-data.config.json
```

These project scripts use the repo’s Node Postgres client and no longer require `psql` to be installed locally.
The auth seed script uses `SUPABASE_SERVICE_ROLE_KEY` and writes a resolved config file with real auth user IDs.

### Preferred mock-data workflow

Run commands from `project/`.

```bash
cp ./mock-data.config.example.json ./mock-data.config.json
# Replace the example user IDs with real Supabase auth.users IDs first.

npm run mock-data:generate -- --config ./mock-data.config.json --out ./tmp/mock-data.sql
npm run db:seed:mock -- ./mock-data.config.json
npm run db:reset
npm run db:rebuild:mock -- ./mock-data.config.json
```

`db:reset` and `db:trash` both wipe and recreate the schema from `docs/sql/001-init.sql`.

See `docs/data/mock-data-workflow.md` for the config shape and workflow details.

The project scripts now prefer split DB env vars (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL`) and only fall back to `DATABASE_URL`.

### Supabase SQL editor
Paste the file contents into the SQL editor and run. Make sure `auth.users` contains matching IDs before seeding.

### Rebuilding from scratch
Running `001-init.sql` will drop existing tables/enums (dev-safe). For production, convert to migrations and remove the blanket drops.
