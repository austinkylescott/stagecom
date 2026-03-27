import type { Enums } from "~/types/database.types";

export type ShowVisibility = {
  status: Enums<"show_status">;
  isPublicListed: boolean;
  castingMode: Enums<"casting_mode">;
};

export type ViewerCastState = {
  status: Enums<"show_cast_status">;
  source: Enums<"show_cast_source">;
} | null;

export type ShowAccessContext = {
  userId: string | null;
  isProducer: boolean;
  isTheaterStaff: boolean;
  isActiveTheaterMember: boolean;
  viewerCast: ViewerCastState;
};

export const canViewerAccessShow = (
  show: ShowVisibility,
  viewer: ShowAccessContext,
) => {
  if (show.status === "approved" && show.isPublicListed) {
    return true;
  }

  if (!viewer.userId) {
    return false;
  }

  if (viewer.isProducer || viewer.isTheaterStaff) {
    return true;
  }

  if (!viewer.viewerCast) {
    return false;
  }

  return (
    viewer.viewerCast.status === "accepted" ||
    viewer.viewerCast.status === "pending"
  );
};

export const canViewerRequestToJoinShow = (
  show: ShowVisibility,
  viewer: ShowAccessContext,
) => {
  if (!viewer.userId || viewer.isProducer) {
    return false;
  }

  if (
    viewer.viewerCast &&
    viewer.viewerCast.status !== "declined" &&
    viewer.viewerCast.status !== "withdrawn"
  ) {
    return false;
  }

  if (show.castingMode === "direct_invite") {
    return false;
  }

  return (
    show.castingMode === "public_casting" ||
    (show.castingMode === "theater_casting" && viewer.isActiveTheaterMember)
  );
};

export const canViewerSeePendingCast = (
  viewer: ShowAccessContext,
) =>
  viewer.isProducer ||
  viewer.isTheaterStaff ||
  viewer.viewerCast?.status === "accepted" ||
  (viewer.viewerCast?.status === "pending" &&
    viewer.viewerCast?.source === "invited");

export const canViewerSeeFullCastState = (viewer: ShowAccessContext) =>
  viewer.isProducer || viewer.isTheaterStaff;
