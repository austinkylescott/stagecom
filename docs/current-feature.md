# Current Feature

Show Detail Navigation And Producer Gating

## Status

In Progress

## Goals

- Make show cards navigate to the show detail page when selected.
- Surface regular show details to viewers on the show page.
- Keep producer/admin controls hidden unless the current user is a producer for that specific show.
- Preserve the contextual role model from the PRD where producers are scoped per show and are not implied cast.

## Notes

- This feature maps to the locked MVP in `docs/PRD.md`, especially the contextual show-level producer role.
- The existing show detail API already computes `permissions.isProducer`; the UI should treat that as the gate for producer-only controls.
- Producers remain distinct from cast and are never assumed to be performers.

## History

- Project setup and boilerplate cleanup
- Casting requests for theater and public casting shows
- Show detail navigation from show listings with producer-only admin gating on the detail flow
