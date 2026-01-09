# Product Requirements Document (PRD)
## Project: Stagecom

**Version:** 0.2 (Locked)  
**Owner:** Austin Scott  
**Last Updated:** Jan 2026

---

## 1. Product Overview

### 1.1 Problem Statement
Improv theaters and producers currently rely on a fragmented mix of spreadsheets, email threads, group texts, Discord servers, and social media to manage shows, performers, schedules, and communication.

This leads to:
- Missed or unclear lineup information
- Performers relying on personal contact info
- Producers spending excessive time coordinating logistics
- Theater managers lacking visibility into operations

There is no single, purpose-built tool that reflects how improv communities actually operate.

---

### 1.2 Solution Overview
Stagecom is a community management platform for theater ensembles that centralizes:

- Performer rosters and contextual roles
- Show and practice scheduling
- Lineup building and changes
- Notifications and show-day information
- Theater-level oversight and approvals

The system prioritizes clarity, privacy, and reduced off-platform coordination.

---

### 1.3 Users & Role Philosophy
Roles are **contextual**, not global.

#### Performer
- Participates in shows and practices
- May accept or decline assignments
- May be a producer for one show and a performer in another

#### Producer
- Owns a specific show or practice
- Responsible for scheduling, casting, and communication
- Automatically assigned when creating a show
- **Is not automatically part of the cast** (must be added explicitly if performing)

#### Theater Manager
- Oversees a theater
- Approves shows for public listing
- Assigns staff and producers
- Can override show-level decisions

#### Theater Staff
- Trusted representatives of the theater
- May approve shows or assist in operations
- Do not necessarily own shows

---

## 2. Non-Goals
Not core features for v1, but must be architecturally anticipated:

- Ticket sales & box office (via integrations such as Shopify, Squarespace, etc.)
- Marketing automation
- Payroll or payouts
- Audition marketplaces

Long-term goal:
Stagecom should become the **one-stop shop for putting a show on sale**, even if ticketing remains external.

---

## 3. Core Product Principles
1. Contextual roles over static titles
2. Reduce off-platform communication
3. Privacy by default
4. Clear show ownership
5. Theater trust signals matter
6. Opinionated defaults with escape hatches

---

## 4. Role & Permission Model

### Theater-level roles
- Manager
- Staff
- Member

### Show-level roles
- Producer
- Performer

A user may hold different roles per theater and per show.

---

## 5. MVP Feature Set
- Authentication & profiles
- Theater creation and membership
- Show and practice creation
- Approval workflow (review queue)
- Lineup management with cast size ranges
- Casting visibility modes (invite-only, theater casting, public casting)
- Invitations and accept/decline
- Notifications (in-app + email)
- Program / rundown view

---

## 6. Success Metrics
- Producers can staff a show without leaving Stagecom
- Performers clearly understand when and where they perform
- Theater staff can see what’s happening without micromanaging

---

## 7. Risks & Open Questions
- How granular permissions should be
- Approval friction vs flexibility
- Casting visibility defaults
- Ticketing integration depth

---

PRD v0.2 is locked.
