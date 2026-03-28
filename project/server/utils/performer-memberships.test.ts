import { describe, expect, it } from "vitest";
import { filterVisiblePerformerMemberships } from "./performer-memberships";

const memberships = [
  { user_id: "viewer", theater_id: "a", status: "active" as const },
  { user_id: "viewer", theater_id: "b", status: "active" as const },
  { user_id: "other-1", theater_id: "a", status: "active" as const },
  { user_id: "other-1", theater_id: "c", status: "active" as const },
  { user_id: "other-2", theater_id: "d", status: "active" as const },
];

describe("performer-memberships", () => {
  it("keeps self memberships plus memberships in shared theaters", () => {
    expect(
      filterVisiblePerformerMemberships({
        memberships,
        viewerUserId: "viewer",
        sharedTheaterIds: new Set(["a", "b"]),
      }),
    ).toEqual([
      { user_id: "viewer", theater_id: "a", status: "active" },
      { user_id: "viewer", theater_id: "b", status: "active" },
      { user_id: "other-1", theater_id: "a", status: "active" },
    ]);
  });

  it("restricts to the requested theater when a theater filter is present", () => {
    expect(
      filterVisiblePerformerMemberships({
        memberships,
        viewerUserId: "viewer",
        sharedTheaterIds: new Set(["a", "b"]),
        requestedTheaterId: "a",
      }),
    ).toEqual([
      { user_id: "viewer", theater_id: "a", status: "active" },
      { user_id: "other-1", theater_id: "a", status: "active" },
    ]);
  });

  it("does not reveal requested-theater affiliations when the viewer shares no theater", () => {
    expect(
      filterVisiblePerformerMemberships({
        memberships,
        viewerUserId: "viewer",
        sharedTheaterIds: new Set(),
        requestedTheaterId: "a",
      }),
    ).toEqual([
      { user_id: "viewer", theater_id: "a", status: "active" },
    ]);
  });
});
