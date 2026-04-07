# Google Stitch Brief

## Purpose

Use this brief as the source package for generating a full Stagecom UI concept in Google Stitch.

This is not a feature ideation prompt. It is a translation prompt:

- preserve the existing Stagecom product model
- preserve the existing authenticated app design language
- extend that language consistently across the full site
- do not invent new product areas that are outside the locked PRD

## What Stagecom Is

Stagecom is a community management platform for improv theaters.

It replaces the fragmented workflow currently spread across:

- spreadsheets
- email threads
- group texts
- Discord
- social media DMs

It centralizes:

- theater memberships and contextual roles
- show and event creation
- approval workflow
- cast invitations and responses
- lineup / program visibility
- notifications
- theater-level oversight

The product is operational, community-centered, and role-aware. It should not feel like a generic corporate project-management tool.

## Product Rules To Preserve

These rules are locked and must shape the UI:

- Roles are contextual, not global.
- A user may be a producer for one show and a performer in another.
- Producers are not automatically cast.
- Cast membership is explicit through `show_cast`.
- Privacy by default matters.
- Theater trust and approval flows matter.
- The app should reduce off-platform coordination.
- The system should feel clear, not bureaucratic.

## Primary User Types

### Performers

- need to know when and where they perform
- need clear accept / decline flows
- need visibility into lineups, invitations, and show-day information

### Producers

- own specific shows or events
- need to create events, manage casting, send invitations, and adjust lineups
- need operational clarity and strong ownership

### Theater Managers / Staff

- oversee theater activity
- need approval queues, trust signals, and visibility into operations
- should be able to review without micromanaging

## Current Visual Language

Stagecom already has a defined UI language. Stitch should extend it, not replace it.

### Overall Feel

- editorial + theatrical + operational
- flat, ink-framed controls
- cream-forward surfaces
- strong semantic accent colors
- expressive display typography for headings
- dense but readable operational layouts
- composed, intentional modules rather than soft generic cards

### Do Not Generate

- generic white SaaS dashboards
- glossy glassmorphism
- purple gradients
- ultra-rounded fintech UI
- sterile B2B admin panels
- dark-mode-first concepts
- interchangeable startup branding

### Color Semantics

These meanings are fixed and should stay consistent across the system:

- `theater` = mint blue `#82bfb6`
- `event` / `show` = amber `#eaa542`
- `performer` / `people` = coral red `#c76056`
- `ink` = `#2b2926`
- `paper` = `#f5efe2`
- `cream` = `#fbf7ef`

Use color semantically, not decoratively:

- theater-wide context, community, admin, approvals = mint
- schedules, shows, calendars, programming = amber
- performers, cast, identity, relationship actions = coral
- neutral support surfaces = cream / paper / ink

### Typography

- Display headings should feel poster-like, uppercase, and theatrical.
- Operational text should remain highly readable and scannable.
- Overlines, chips, and labels are structural, not decorative.

### Surface Language

- thick ink borders
- flat panels with strong edge definition
- selective use of inset shadows and offset shadows
- cream and paper surfaces are the default base
- louder accent surfaces should be purposeful, not everywhere

## Existing Source References

Treat these as the strongest current style references:

- `project/app/components/TheaterDashboardSection.vue`
- `project/app/components/AppNav.vue`
- `project/app/components/AppAccountMenu.vue`
- `project/app/components/AppHeaderDropdown.vue`

Supporting brand / palette reference:

- `project/app/pages/index.vue`

Theme token source:

- `project/app/assets/css/main.css`

## Design Objective For Stitch

Generate a complete, unified UI direction for both:

1. public marketing / discovery surfaces
2. authenticated application surfaces

The output should feel like one brand system with two operating modes:

- public: atmospheric, persuasive, community-facing
- app: operational, structured, dashboard-oriented

The authenticated app is the stricter source of truth. The public site can be more expressive, but it must still clearly belong to the same system.

## Required Screen Inventory

Generate a consistent system and representative layouts for these areas.

### Public Site

- homepage
- theaters directory / browse page
- theater public detail page
- public event / show detail page
- performer directory / browse page
- login
- signup

### Authenticated App

- app shell with nav, header, notifications, and account controls
- theater hub / theater list
- theater dashboard
- theater admin / approvals view
- show and event calendar / schedule
- show detail page
- show creation / edit flow
- cast management view
- invitations / responses view
- performer profile
- notifications center

### System-Level Deliverables

- desktop and mobile layouts
- navigation patterns
- cards / panels / table-like list patterns
- empty states
- approval and status badges
- forms
- dropdowns
- section headers
- list rows
- chips / tags

## Information Architecture Expectations

The design should clearly communicate these product groupings:

- Theaters
- Schedule
- Approvals
- People
- Account / profile

For authenticated navigation, the current primary sections are:

- Theaters
- Schedule
- Approvals
- People

## Behavioral Emphasis

The design should make these actions feel first-class:

- browse theaters
- create a show or event
- review and approve submitted shows
- invite performers
- accept or decline participation
- inspect lineups and program order
- understand upcoming events at a glance

## Content Tone

Voice should feel:

- community-aware
- practical
- theater-savvy
- confident
- clear

Avoid:

- corporate jargon
- startup cliché copy
- over-clever whimsy
- language that sounds like enterprise workforce software

## UX Constraints

- Operational screens should optimize for scanability first.
- Dense information is acceptable if clearly structured.
- Empty states should preserve the feeling that this is a live theater operations tool, not a blank CRUD app.
- Approval, trust, and relationship context should be visible without overwhelming the screen.
- Casting and lineup flows should feel explicit and unambiguous.
- Mobile layouts should remain fully usable for producers and performers on the go.

## Guardrails

Do not introduce designs that imply features outside the locked MVP, including:

- ticket checkout flows
- payroll / payouts
- marketing campaign builders
- audition marketplace systems
- broad social networking features

Ticketing can be represented as an external link / on-sale state, but not as an internal checkout product.

## Preferred Stitch Output

Ask Stitch to generate:

- a shared design system direction
- core color and typography tokens
- a reusable component vocabulary
- representative page designs for the screen inventory above
- responsive variants for the most important screens

## Copy-Paste Prompt For Stitch

Use the following prompt as the starting input:

```text
Design a complete, consistent UI system for Stagecom, a community management platform for improv theaters.

This product helps theaters, producers, and performers manage shows, practices, workshops, meetings, auditions, lineups, approvals, invitations, and notifications in one place. It replaces fragmented workflows currently spread across spreadsheets, email threads, group texts, Discord, and social media DMs.

Important product rules:
- Roles are contextual, not global.
- A user can be a producer for one show and a performer in another.
- Producers are not automatically part of the cast.
- Cast membership is always explicit.
- Privacy by default matters.
- Theater approval and trust signals matter.
- The goal is to reduce off-platform coordination.

Design tone:
- editorial, theatrical, operational
- cream-forward surfaces with thick ink borders
- expressive uppercase display typography for headlines
- readable, dense sans-serif UI text for operational content
- flat, framed controls instead of soft generic SaaS cards
- distinctive but disciplined, not whimsical or chaotic

Avoid:
- generic white SaaS dashboards
- purple gradients
- glassmorphism
- fintech-style pill UI
- corporate admin-panel aesthetics

Use these fixed semantic colors:
- theater/community/admin = mint blue #82bfb6
- shows/events/schedule = amber #eaa542
- performers/cast/people = coral red #c76056
- ink = #2b2926
- paper = #f5efe2
- cream = #fbf7ef

Generate a unified system for both public and authenticated surfaces.

Public surfaces:
- homepage
- theaters browse page
- theater public detail page
- public show / event detail page
- performer browse page
- login
- signup

Authenticated surfaces:
- application shell with navigation
- theater hub
- theater dashboard
- theater admin / approvals view
- show / event schedule
- show detail
- show creation / edit flow
- cast management
- invitations / responses
- performer profile
- notifications center

The authenticated app should feel more structured and operational. The public site can be more atmospheric and brand-forward, but it must clearly belong to the same visual system.

Optimize for:
- scanable operational layouts
- explicit relationship and approval status
- strong empty states
- reusable component patterns
- responsive desktop and mobile design

Do not invent features outside this scope such as ticket checkout, payroll, campaign builders, or broad social networking.
```

## Recommended Workflow

1. Feed Stitch this brief and the copy-paste prompt.
2. If Stitch supports multiple reference inputs, also provide screenshots of:
   - theater dashboard
   - top navigation
   - account dropdown
   - homepage hero
3. Ask Stitch for a system-first output before asking for polished final screens.
4. After the first pass, review for semantic color drift and generic SaaS patterns.
5. Then run a second pass focused on missing screens or weak areas.
