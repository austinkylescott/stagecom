# Feature Spec: Dev Components Reference v1

## Status

Draft

## Summary

`/dev/components` is a permanent internal reference page for the implemented Stagecom design system.

It is both:

- the fastest way to review the full system in one place
- the default demo and testing ground for durable UI primitives, composites, and important page-pattern excerpts

This page is not the source of design direction. It is the living reference for the system after decisions are made.

## Goals

- Give a complete overview of the implemented design system in one route.
- Make every durable component and important design decision visible and demoable.
- Provide deterministic sample states that do not break when the real date changes.
- Help validate coverage, consistency, and regressions during the redesign and after it.

## Non-Goals

- Do not turn `/dev/components` into a second product app.
- Do not use it to invent design direction ad hoc.
- Do not wire the core examples to live backend data.

## Page Job

When someone opens `/dev/components`, they should be able to answer:

- what the current design system looks like
- which components and patterns exist
- how they behave in different states
- whether the system feels coherent across the app

## Required Coverage

### 1. Foundation

Show the system foundations clearly:

- color tokens
- typography styles
- spacing or surface rhythm examples where relevant
- iconography or motion guidance if those become part of the system contract

### 2. Primitives

Show every durable primitive with meaningful states and variants:

- buttons and action triggers
- form controls
- badges, chips, and status indicators
- menus, drawers, modals, tooltips, popovers
- shell/navigation primitives if the redesign keeps them as discrete components

Each primitive section should make it obvious:

- what the component is for
- which variants are canonical
- which states are part of the contract

### 3. Composite sections

Show the reusable composites that pages are built from, such as:

- shell headers or workspace bands
- list rows
- summary cards
- hero/identity blocks
- schedule modules
- inbox rows
- settings groups
- empty states
- alerts and notice blocks

These excerpts should be representative, not just visual fragments.

### 4. Page-pattern excerpts

Include excerpts or bounded previews for the most important page systems:

- callsheet / schedule workspace
- theater overview
- theater admin
- event overview
- event creation
- notifications
- profile

The goal is not to re-render every full page, but to show enough structure to confirm the system holds together.

### 5. Contract states

Where relevant, demo:

- default
- active / selected
- loading
- empty
- success
- error
- permission-sensitive or role-sensitive states when those materially change the UI

## Data Rules

### Deterministic sample data

Use fixed sample data that remains understandable regardless of the current date.

Examples:

- fixed reference weeks or months for schedule modules
- fixed theaters, events, producers, cast members, and notifications
- fixed empty/loading/error examples

### No live dependency for core examples

Core demos should not require:

- live backend data
- current production dates
- auth state
- environment-specific setup

If a live-backed example is ever useful, it must be clearly separate from the core deterministic reference coverage.

## Content Structure

The page should be organized so a reviewer can scan from system-wide foundations to feature-specific examples.

Recommended order:

1. intro / usage guidance
2. foundations
3. primitives
4. composite sections
5. page-pattern excerpts
6. contract states and edge cases
7. migration or implementation notes if needed

## Maintenance Rules

- When a durable component is added or materially changed, update `/dev/components` in the same change.
- When a component is removed from the system, remove or replace its demo coverage.
- Keep the page curated. It should show the real system, not abandoned experiments.
- Prefer stable demo fixtures over expanding one-off examples.

Use `docs/specs/2026-04-12/dev-components-outline-and-fixtures-v1.md` for the concrete section order, fixture strategy, and coverage inventory.

## Acceptance Criteria

- A reviewer can understand the whole design system from `/dev/components` without opening production pages.
- Every durable primitive and important composite has demo coverage.
- Important state variations are visible.
- Demo data stays useful even as the real date moves forward.
- The page reads like a coherent system overview, not a pile of disconnected component tiles.
