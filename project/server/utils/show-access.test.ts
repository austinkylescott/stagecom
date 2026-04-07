import { describe, expect, it } from "vitest";
import {
  canViewerAccessShow,
  canViewerRequestToJoinShow,
  canViewerSeePendingCast,
  type ShowAccessContext,
} from "./show-access";
import type { ShowVisibility } from "./visibility-policy";

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

const anonymousViewer: ShowAccessContext = {
  userId: null,
  isProducer: false,
  isTheaterStaff: false,
  isShowStaff: false,
  isActiveTheaterMember: false,
  viewerCast: null,
};

describe("show-access", () => {
  it("allows anyone to access approved public shows", () => {
    expect(canViewerAccessShow(publicShow, anonymousViewer)).toBe(true);
  });

  it("blocks anonymous access to non-public shows", () => {
    expect(canViewerAccessShow(draftShow, anonymousViewer)).toBe(false);
  });

  it("allows producers to access non-public shows", () => {
    expect(
      canViewerAccessShow(draftShow, {
        ...anonymousViewer,
        userId: "user-1",
        isProducer: true,
      }),
    ).toBe(true);
  });

  it("allows invited or accepted cast to access non-public shows", () => {
    expect(
      canViewerAccessShow(draftShow, {
        ...anonymousViewer,
        userId: "user-1",
        viewerCast: {
          status: "pending",
          source: "invited",
        },
      }),
    ).toBe(true);
    expect(
      canViewerAccessShow(draftShow, {
        ...anonymousViewer,
        userId: "user-1",
        viewerCast: {
          status: "accepted",
          source: "requested",
        },
      }),
    ).toBe(true);
  });

  it("does not allow removed cast to access non-public shows", () => {
    expect(
      canViewerAccessShow(draftShow, {
        ...anonymousViewer,
        userId: "user-1",
        viewerCast: {
          status: "removed",
          source: "invited",
        },
      }),
    ).toBe(false);
  });

  it("only allows join requests when the viewer has an eligible relationship", () => {
    expect(
      canViewerRequestToJoinShow(publicShow, {
        ...anonymousViewer,
        userId: "user-1",
      }),
    ).toBe(true);
    expect(
      canViewerRequestToJoinShow(draftShow, {
        ...anonymousViewer,
        userId: "user-1",
      }),
    ).toBe(false);
    expect(
      canViewerRequestToJoinShow(draftShow, {
        ...anonymousViewer,
        userId: "user-1",
        isTheaterStaff: true,
        isActiveTheaterMember: true,
      }),
    ).toBe(true);
    expect(
      canViewerRequestToJoinShow(draftShow, {
        ...anonymousViewer,
        userId: "user-1",
        isActiveTheaterMember: true,
      }),
    ).toBe(true);
  });

  it("limits pending-cast visibility to producers, staff, accepted cast, and invited pending cast", () => {
    expect(
      canViewerSeePendingCast({
        ...anonymousViewer,
        userId: "user-1",
        viewerCast: {
          status: "pending",
          source: "invited",
        },
      }),
    ).toBe(true);
    expect(
      canViewerSeePendingCast({
        ...anonymousViewer,
        userId: "user-1",
        viewerCast: {
          status: "pending",
          source: "requested",
        },
      }),
    ).toBe(false);
  });
});
