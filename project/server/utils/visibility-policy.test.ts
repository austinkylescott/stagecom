import { describe, expect, it } from "vitest";
import {
  canRequestToJoinShow,
  canViewNotifications,
  canViewPerformerAffiliation,
  canViewPerformerProfile,
  canViewShow,
  canViewTheaterReview,
  type ShowVisibility,
  type ShowVisibilityViewer,
} from "./visibility-policy";

const publicShow: ShowVisibility = {
  status: "approved",
  isPublicListed: true,
  castingMode: "public_casting",
};

const draftShow: ShowVisibility = {
  status: "draft",
  isPublicListed: false,
  castingMode: "theater_casting",
};

const anonymousViewer: ShowVisibilityViewer = {
  userId: null,
  isProducer: false,
  isTheaterStaff: false,
  isShowStaff: false,
  isActiveTheaterMember: false,
  viewerCast: null,
};

describe("visibility-policy", () => {
  it("allows theater review for active oversight roles only", () => {
    expect(
      canViewTheaterReview({
        userId: "user-1",
        theaterMembershipStatus: "active",
        theaterRoles: ["admin"],
      }),
    ).toBe(true);

    expect(
      canViewTheaterReview({
        userId: "user-1",
        theaterMembershipStatus: "active",
        theaterRoles: ["member"],
      }),
    ).toBe(false);

    expect(
      canViewTheaterReview({
        userId: "user-1",
        theaterMembershipStatus: "inactive",
        theaterRoles: ["manager"],
      }),
    ).toBe(false);
  });

  it("treats non-public shows as relationship or oversight visibility", () => {
    expect(canViewShow(draftShow, anonymousViewer)).toBe(false);

    expect(
      canViewShow(draftShow, {
        ...anonymousViewer,
        userId: "cast-user",
        viewerCast: {
          status: "accepted",
          source: "invited",
        },
      }),
    ).toBe(true);

    expect(
      canViewShow(draftShow, {
        ...anonymousViewer,
        userId: "staff-user",
        isTheaterStaff: true,
      }),
    ).toBe(true);
  });

  it("allows join requests only when casting mode and relationship permit it", () => {
    expect(
      canRequestToJoinShow(publicShow, {
        ...anonymousViewer,
        userId: "user-1",
      }),
    ).toBe(true);

    expect(
      canRequestToJoinShow(draftShow, {
        ...anonymousViewer,
        userId: "user-1",
      }),
    ).toBe(false);

    expect(
      canRequestToJoinShow(draftShow, {
        ...anonymousViewer,
        userId: "user-1",
        isActiveTheaterMember: true,
      }),
    ).toBe(true);
  });

  it("applies performer profile visibility by self, public, and shared theater", () => {
    expect(
      canViewPerformerProfile({
        viewerUserId: null,
        performerUserId: "performer-1",
        visibility: "public",
        sharedTheaterIds: new Set(),
      }),
    ).toBe(true);

    expect(
      canViewPerformerProfile({
        viewerUserId: "viewer-1",
        performerUserId: "performer-1",
        visibility: "theater_only",
        sharedTheaterIds: new Set(),
      }),
    ).toBe(false);

    expect(
      canViewPerformerProfile({
        viewerUserId: "viewer-1",
        performerUserId: "performer-1",
        visibility: "theater_only",
        sharedTheaterIds: new Set(["theater-1"]),
      }),
    ).toBe(true);

    expect(
      canViewPerformerProfile({
        viewerUserId: "performer-1",
        performerUserId: "performer-1",
        visibility: "private",
        sharedTheaterIds: new Set(),
      }),
    ).toBe(true);
  });

  it("keeps performer affiliations shared-theater-only unless viewing self", () => {
    expect(
      canViewPerformerAffiliation({
        viewerUserId: "viewer-1",
        performerUserId: "performer-1",
        affiliationTheaterId: "theater-1",
        sharedTheaterIds: new Set(),
      }),
    ).toBe(false);

    expect(
      canViewPerformerAffiliation({
        viewerUserId: "viewer-1",
        performerUserId: "performer-1",
        affiliationTheaterId: "theater-1",
        sharedTheaterIds: new Set(["theater-1"]),
      }),
    ).toBe(true);

    expect(
      canViewPerformerAffiliation({
        viewerUserId: "performer-1",
        performerUserId: "performer-1",
        affiliationTheaterId: "theater-1",
        sharedTheaterIds: new Set(),
      }),
    ).toBe(true);
  });

  it("keeps notifications self-only", () => {
    expect(canViewNotifications("user-1", "user-1")).toBe(true);
    expect(canViewNotifications("user-1", "user-2")).toBe(false);
  });
});
