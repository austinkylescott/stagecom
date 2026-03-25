# Current Feature

Show Detail Navigation And Producer Gating

## Status

Completed

## Goals

- Make show cards navigate to the show detail page when selected.
- Surface regular show details to viewers on the show page.
- Keep producer/admin controls hidden unless the current user is a producer for that specific show.
- Preserve the contextual role model from the PRD where producers are scoped per show and are not implied cast.

## Notes

- This feature maps to the locked MVP in `docs/PRD.md`, especially the contextual show-level producer role.
- The existing show detail API already computes `permissions.isProducer`; the UI should treat that as the gate for producer-only controls.
- Producers remain distinct from cast and are never assumed to be performers.
- Show detail now supports request-to-join flows, producer approval/removal actions, and producer-only inactive-cast management without collapsing producers into cast membership.
- Cast request notifications now support repeat request cycles and requester approval notifications through `emitEvent()`.
- Nuxt UI select usage was updated to the current prop API so dropdown options render correctly across the affected pages.

## History

- Project setup and boilerplate cleanup
- Casting requests for theater and public casting shows
- Show detail navigation from show listings with producer-only admin gating on the detail flow
- Expanded show cast workflow with request approval, reinvite handling, producer display, and notification fixes
- Updated Nuxt UI select props to restore dropdown option rendering
