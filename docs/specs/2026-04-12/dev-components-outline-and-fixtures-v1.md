# Dev Components Outline And Fixtures v1

## Status

Draft

## Summary

This document turns the `/dev/components` requirement into an implementation outline for the redesign.

It defines:

- the page information architecture
- the fixture groups the page should use
- the demo coverage expected for each major system area

Use this alongside `feature-spec-dev-components-reference-v1.md` when rebuilding the page.

## Page Structure

The redesigned `/dev/components` page should be organized in this order:

### 1. Page intro

Purpose:

- explain what the page is for
- explain that the page uses deterministic demo fixtures
- explain that it is the fastest way to review the implemented system

Include:

- page title
- short usage note
- quick index or jump links to major sections

### 2. Foundations

Show:

- color tokens
- typography styles
- surface/elevation examples
- spacing rhythm examples if those become explicit in the system
- iconography and motion notes if those become first-class

Purpose:

- make the design language legible before showing components

### 3. Primitives

Show each durable primitive in a bounded, repeatable demo block.

Expected groups:

- buttons and action triggers
- form controls
- badges and status indicators
- menus and dropdowns
- drawers, modals, popovers, tooltips
- shell/navigation primitives if the rebuild keeps them

Each primitive block should show:

- canonical variants
- active/selected states where relevant
- disabled state where relevant
- error/loading state where relevant
- one or two real product examples

### 4. Composite sections

Show reusable product modules that will appear across pages.

Expected groups:

- shell header bands
- summary cards
- entity identity blocks
- list rows
- inbox rows
- alerts and notices
- schedule modules
- settings groups
- empty states

Each composite block should show:

- intended use
- one representative “default” example
- any important alternate or empty state

### 5. Page-pattern excerpts

Show bounded excerpts for the major product surfaces.

Required excerpts:

- callsheet workspace
- theater overview
- theater admin
- event overview
- event creation
- notifications
- profile
- theater collection

Each excerpt should demonstrate structure, not full page fidelity.

### 6. Contract states

A dedicated section for state coverage that is easy to scan.

Required state groups:

- loading
- empty
- success
- error
- permission-sensitive views
- role-sensitive views

This section should make it obvious whether the system handles non-happy-path states coherently.

### 7. Fixture notes

Optional footer or appendix area for:

- fixture naming rules
- known temporary placeholders
- migration notes during the redesign period

## Fixture Strategy

The page should use explicit fixture groups rather than ad hoc local sample arrays scattered through the file.

Recommended fixture groups:

- `foundationFixtures`
- `theaterFixtures`
- `eventFixtures`
- `scheduleFixtures`
- `notificationFixtures`
- `profileFixtures`
- `stateFixtures`

The exact implementation can change, but the data should be grouped by product domain so the page stays maintainable.

## Fixture Rules

### Deterministic dates

Use fixed date anchors.

Recommended pattern:

- choose one fixed reference week
- choose one fixed reference month
- derive all schedule examples from those anchors

Do not use:

- `new Date()`-driven examples for core demos
- “today” logic that changes what the reference page means over time

### Stable entities

Use a small repeatable set of named demo entities:

- 2-3 theaters
- several events of different types
- a small set of producers, performers, and members
- a small set of notifications across read/unread and actor contexts

### State-first fixtures

Fixtures should make states easy to demo, not just happy-path content.

Include examples for:

- no results
- validation error
- operation success
- pending approval
- role-specific permissions
- cast-related state changes

## Coverage Inventory

The rebuild should be able to check off these coverage areas:

### Foundations

- token palette
- typography
- surfaces
- elevations/shadows

### Primitive inventory

- action buttons
- text inputs
- textareas
- selects
- badges/chips
- menus
- dialog/drawer surfaces
- nav triggers

### Composite inventory

- app shell header or equivalent
- summary/stat cards
- list rows
- schedule cards
- event identity block
- theater identity block
- inbox item
- empty state
- alert/notice module

### Page-pattern inventory

- callsheet excerpt
- theater collection excerpt
- theater overview excerpt
- theater admin excerpt
- event overview excerpt
- event creation excerpt
- notifications excerpt
- profile excerpt

### State inventory

- loading
- empty
- success
- error
- member view
- producer view
- theater admin view

## Acceptance Criteria

- The implementation team can rebuild `/dev/components` from this outline without inventing page coverage on the fly.
- Fixtures are organized and reusable instead of being embedded as one-off local blobs.
- The page structure supports quick scanning from foundations to feature excerpts.
- The coverage inventory matches the redesigned product surface map.
