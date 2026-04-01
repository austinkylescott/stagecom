# Tailwind Canonical Class Audit

Date: 2026-04-01

## Goal

Find repo-wide Tailwind `suggestCanonicalClasses` candidates that follow the `utility-[var(--token)]` pattern and can be rewritten to the canonical `utility-(--token)` form without changing the rendered result.

This pass is documentation only. No source files were changed. No Playwright verification has been run yet.

## Scope And Method

- Scanned `project/app/**/*.{vue,ts,js,css}`.
- Matched only classes whose arbitrary value is exactly `var(--token)`.
- Excluded arbitrary values that are not canonical var-token rewrites, such as:
  - `bg-[rgba(...)]`
  - `text-[11px]`
  - `shadow-[...]`
  - `placeholder:text-[color:...]`
  - `supports-[...]`

Scan basis used for the audit:

```bash
ruby -e 'files=Dir["project/app/**/*.{vue,ts,js,css}"]; pat=/(?<!\w)([!\w:\/.\-]*?(?:[A-Za-z-]+)-\[var\(--[^\]]+\)\])/; rows=[]; files.sort.each do |f| File.readlines(f, chomp: true).each_with_index do |line,i| line.to_enum(:scan, pat).map{Regexp.last_match[1]}.each{|m| rows << [m,f,i+1]} end end; puts "hits=#{rows.size}"; puts "unique_classes=#{rows.map(&:first).uniq.size}"; puts "files=#{rows.map{|r| r[1]}.uniq.size}"'
```

## Summary

- Total candidate occurrences: `616`
- Unique canonicalizable class forms: `61`
- Files containing candidates: `34`
- Scope is entirely under `project/app/`

Canonical rewrite examples:

- `border-[var(--stage-ink)]` -> `border-(--stage-ink)`
- `bg-[var(--stage-paper)]` -> `bg-(--stage-paper)`
- `text-[var(--stage-ink)]` -> `text-(--stage-ink)`
- `hover:text-[var(--stage-gold)]` -> `hover:text-(--stage-gold)`
- `focus-visible:outline-[var(--stage-theater)]` -> `focus-visible:outline-(--stage-theater)`
- `!border-[var(--stage-cream)]` -> `!border-(--stage-cream)`

## Token Distribution

- `stage-ink`: 293 hits
- `stage-cream`: 87 hits
- `stage-paper-strong`: 40 hits
- `stage-theater`: 36 hits
- `stage-paper-muted`: 30 hits
- `stage-event`: 29 hits
- `stage-coral`: 28 hits
- `stage-gold`: 25 hits
- `stage-performer`: 18 hits
- `stage-performer-soft`: 9 hits
- `stage-theater-soft`: 7 hits
- `stage-mint`: 5 hits
- `stage-paper`: 5 hits
- `stage-event-soft`: 3 hits
- `stage-ink-soft`: 1 hit

## Per-File Hit Counts

- `project/app/pages/index.vue`: 187
- `project/app/app.config.ts`: 59
- `project/app/pages/theaters/[slug]/shows/[id].vue`: 53
- `project/app/pages/review/index.vue`: 29
- `project/app/utils/stageButtonTone.ts`: 27
- `project/app/components/TheaterDashboardSection.vue`: 26
- `project/app/pages/theaters/[slug]/calendar.vue`: 24
- `project/app/pages/shows/index.vue`: 23
- `project/app/pages/theaters/[slug]/index.vue`: 20
- `project/app/components/AppNav.vue`: 17
- `project/app/components/AppFooter.vue`: 16
- `project/app/components/AppNotificationsBell.vue`: 13
- `project/app/components/StageStackedBoard.vue`: 13
- `project/app/pages/notifications/index.vue`: 10
- `project/app/components/AppAccountMenu.vue`: 9
- `project/app/components/AppHeaderDropdown.vue`: 9
- `project/app/pages/theaters/[slug]/review.vue`: 9
- `project/app/components/HomeTheaterHero.vue`: 8
- `project/app/pages/theaters/[slug]/admin.vue`: 8
- `project/app/pages/theaters/[slug]/shows/[id]/program.vue`: 7
- `project/app/components/TheaterCard.vue`: 6
- `project/app/pages/profile.vue`: 5
- `project/app/pages/theaters/[slug]/shows/new.vue`: 5
- `project/app/components/ShowCastInviteSearchPanel.vue`: 4
- `project/app/components/ShowCastPanel.vue`: 4
- `project/app/components/ShowCastProducerList.vue`: 4
- `project/app/components/ShowCastInactiveSection.vue`: 3
- `project/app/components/ShowCastMemberSection.vue`: 3
- `project/app/components/StageFeatureCard.vue`: 3
- `project/app/pages/performers/index.vue`: 3
- `project/app/pages/theaters/browse.vue`: 3
- `project/app/pages/theaters/index.vue`: 3
- `project/app/components/TheaterList.vue`: 2
- `project/app/components/StageSection.vue`: 1

## Unique Rewrite Set

Each line below is a safe textual canonicalization target. Counts are occurrence counts, not file counts.

```text
border-[var(--stage-ink)] -> border-(--stage-ink)  [140]
text-[var(--stage-ink)] -> text-(--stage-ink)  [118]
text-[var(--stage-cream)] -> text-(--stage-cream)  [39]
bg-[var(--stage-cream)] -> bg-(--stage-cream)  [38]
bg-[var(--stage-paper-strong)] -> bg-(--stage-paper-strong)  [34]
text-[var(--stage-paper-muted)] -> text-(--stage-paper-muted)  [27]
bg-[var(--stage-theater)] -> bg-(--stage-theater)  [25]
bg-[var(--stage-ink)] -> bg-(--stage-ink)  [21]
bg-[var(--stage-coral)] -> bg-(--stage-coral)  [19]
bg-[var(--stage-event)] -> bg-(--stage-event)  [16]
bg-[var(--stage-gold)] -> bg-(--stage-gold)  [13]
bg-[var(--stage-performer)] -> bg-(--stage-performer)  [10]
hover:text-[var(--stage-gold)] -> hover:text-(--stage-gold)  [10]
ring-[var(--stage-ink)] -> ring-(--stage-ink)  [7]
bg-[var(--stage-performer-soft)] -> bg-(--stage-performer-soft)  [6]
bg-[var(--stage-mint)] -> bg-(--stage-mint)  [5]
active:bg-[var(--stage-event)] -> active:bg-(--stage-event)  [4]
active:bg-[var(--stage-performer)] -> active:bg-(--stage-performer)  [4]
active:bg-[var(--stage-theater)] -> active:bg-(--stage-theater)  [4]
active:text-[var(--stage-cream)] -> active:text-(--stage-cream)  [4]
border-[var(--stage-event)] -> border-(--stage-event)  [4]
hover:bg-[var(--stage-theater-soft)] -> hover:bg-(--stage-theater-soft)  [4]
bg-[var(--stage-paper-muted)] -> bg-(--stage-paper-muted)  [3]
focus:ring-[var(--stage-coral)] -> focus:ring-(--stage-coral)  [3]
hover:bg-[var(--stage-event-soft)] -> hover:bg-(--stage-event-soft)  [3]
hover:bg-[var(--stage-paper)] -> hover:bg-(--stage-paper)  [3]
hover:bg-[var(--stage-performer-soft)] -> hover:bg-(--stage-performer-soft)  [3]
text-[var(--stage-coral)] -> text-(--stage-coral)  [3]
:bg-[var(--stage-paper-strong)] -> :bg-(--stage-paper-strong)  [2]
:text-[var(--stage-ink)] -> :text-(--stage-ink)  [2]
active:bg-[var(--stage-paper-strong)] -> active:bg-(--stage-paper-strong)  [2]
bg-[var(--stage-paper)] -> bg-(--stage-paper)  [2]
bg-[var(--stage-theater-soft)] -> bg-(--stage-theater-soft)  [2]
border-[var(--stage-theater)] -> border-(--stage-theater)  [2]
decoration-[var(--stage-coral)] -> decoration-(--stage-coral)  [2]
hover:bg-[var(--stage-ink)] -> hover:bg-(--stage-ink)  [2]
hover:bg-[var(--stage-paper-strong)] -> hover:bg-(--stage-paper-strong)  [2]
hover:border-[var(--stage-gold)] -> hover:border-(--stage-gold)  [2]
hover:text-[var(--stage-cream)] -> hover:text-(--stage-cream)  [2]
hover:text-[var(--stage-theater)] -> hover:text-(--stage-theater)  [2]
text-[var(--stage-event)] -> text-(--stage-event)  [2]
!border-[var(--stage-cream)] -> !border-(--stage-cream)  [1]
!text-[var(--stage-cream)] -> !text-(--stage-cream)  [1]
border-[var(--stage-performer)] -> border-(--stage-performer)  [1]
focus-visible:outline-[var(--stage-event)] -> focus-visible:outline-(--stage-event)  [1]
focus-visible:outline-[var(--stage-ink)] -> focus-visible:outline-(--stage-ink)  [1]
focus-visible:outline-[var(--stage-performer)] -> focus-visible:outline-(--stage-performer)  [1]
focus-visible:outline-[var(--stage-theater)] -> focus-visible:outline-(--stage-theater)  [1]
focus-within:bg-[var(--stage-theater-soft)] -> focus-within:bg-(--stage-theater-soft)  [1]
group-hover:bg-[var(--stage-coral)] -> group-hover:bg-(--stage-coral)  [1]
group-hover:bg-[var(--stage-theater)] -> group-hover:bg-(--stage-theater)  [1]
group-hover:text-[var(--stage-cream)] -> group-hover:text-(--stage-cream)  [1]
hover:!bg-[var(--stage-cream)] -> hover:!bg-(--stage-cream)  [1]
hover:!text-[var(--stage-ink)] -> hover:!text-(--stage-ink)  [1]
hover:bg-[var(--stage-event)] -> hover:bg-(--stage-event)  [1]
hover:bg-[var(--stage-performer)] -> hover:bg-(--stage-performer)  [1]
hover:bg-[var(--stage-theater)] -> hover:bg-(--stage-theater)  [1]
hover:text-[var(--stage-event)] -> hover:text-(--stage-event)  [1]
hover:text-[var(--stage-ink)] -> hover:text-(--stage-ink)  [1]
hover:text-[var(--stage-performer)] -> hover:text-(--stage-performer)  [1]
text-[var(--stage-ink-soft)] -> text-(--stage-ink-soft)  [1]
```

## Notes For The Edit Pass

- The two `:`-prefixed forms are from `data-[highlighted]:...` class strings:
  - `data-[highlighted]:bg-[var(--stage-paper-strong)]`
  - `data-[highlighted]:text-[var(--stage-ink)]`
- When rewritten, those should become:
  - `data-[highlighted]:bg-(--stage-paper-strong)`
  - `data-[highlighted]:text-(--stage-ink)`
- No candidate in this report should change appearance. These are syntax-normalization rewrites only.
- Before/after Playwright capture should focus on the highest-density surfaces first:
  - home page
  - review queue
  - shows/calendar pages
  - theater show detail
  - nav/account/notification dropdowns

## Proposed Next Step

After approval:

1. Apply the canonical class rewrites only.
2. Use Playwright to capture before/after screenshots at desktop and mobile widths.
3. Compare for regressions before any commit discussion.

## Execution Results

Status: completed

- Canonicalizable `var(--token)` arbitrary-value class count before: `616`
- Canonicalizable `var(--token)` arbitrary-value class count after: `0`
- Files updated in `project/app/`: `34`

### Bundle Sizes

Baseline build:

- Client manifest: `30.79 kB` (`3.51 kB` gzip)
- Main client CSS entry: `221.35 kB` (`30.29 kB` gzip)
- Nitro total server output: `12 MB` (`2.86 MB` gzip)

After canonical rewrite pass:

- Client manifest: `30.79 kB` (`3.49 kB` gzip)
- Main client CSS entry: `220.91 kB` (`30.27 kB` gzip)
- Nitro total server output: `12 MB` (`2.86 MB` gzip)

Observed delta:

- Client manifest gzip: `-0.02 kB`
- Main client CSS: `-0.44 kB`
- Main client CSS gzip: `-0.02 kB`
- Nitro total server output: no reported change

### Playwright Artifacts

Captured before:

- `before-home-desktop.png`
- `before-home-mobile.png`

Captured after:

- `after-home-desktop.png`
- `after-home-mobile.png`

### Visual Check

- Homepage desktop before/after: no visible change in the Playwright captures
- Homepage mobile before/after: no visible change in the Playwright captures

### Build Notes

- Both baseline and after builds completed successfully.
- Existing build warnings remained unchanged:
  - unresolved `/fonts/Cubano.woff2` and `/fonts/Cubano.woff` at build time
  - Tailwind/Vite sourcemap warning during SSR build
  - unused external import warnings from Supabase packages during Nitro build
