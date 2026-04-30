import type { Enums } from "~/types/database.types";
import type { ProfileFieldVisibility } from "~~/shared/profile";
import { hasStaffRole } from "./permissions";

export type VisibilityScope =
  | "public"
  | "authenticated"
  | "theater_only"
  | "relationship"
  | "oversight_only"
  | "self_only";

export type ShowVisibility = {
  status: Enums<"show_status">;
  isPublicListed: boolean;
  castingMode: Enums<"casting_mode">;
};

export type ViewerCastState = {
  status: Enums<"show_cast_status">;
  source: Enums<"show_cast_source">;
} | null;

export type ShowVisibilityViewer = {
  userId: string | null;
  isProducer: boolean;
  isTheaterStaff: boolean;
  isShowStaff: boolean;
  isActiveTheaterMember: boolean;
  viewerCast: ViewerCastState;
};

export type TheaterVisibilityViewer = {
  userId: string | null;
  theaterMembershipStatus?: Enums<"membership_status"> | null;
  theaterRoles?: Enums<"theater_role">[] | null;
};

export type PerformerProfileVisibilityInput = {
  viewerUserId: string | null;
  performerUserId: string;
  visibility?: Enums<"profile_visibility"> | null;
  fieldVisibility?: ProfileFieldVisibility | null;
  sharedTheaterIds: Set<string>;
};

export type PerformerAffiliationVisibilityInput = {
  viewerUserId: string | null;
  performerUserId: string;
  affiliationTheaterId: string;
  sharedTheaterIds: Set<string>;
};

export const isPublicShow = (show: ShowVisibility) =>
  show.status === "approved" && show.isPublicListed;

export const hasOversightAccess = (
  roles: Enums<"theater_role">[] | null | undefined,
) => hasStaffRole(roles);

export const canViewTheaterOperations = (
  viewer: TheaterVisibilityViewer,
) =>
  viewer.userId !== null &&
  viewer.theaterMembershipStatus === "active" &&
  hasOversightAccess(viewer.theaterRoles);

export const canViewTheaterReview = canViewTheaterOperations;

export const canViewShow = (
  show: ShowVisibility,
  viewer: ShowVisibilityViewer,
) => {
  if (isPublicShow(show)) {
    return true;
  }

  if (!viewer.userId) {
    return false;
  }

  if (viewer.isProducer || viewer.isTheaterStaff || viewer.isShowStaff) {
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

export const canViewAcceptedCast = (
  show: ShowVisibility,
  viewer: ShowVisibilityViewer,
) => canViewShow(show, viewer);

export const canViewPendingCast = (viewer: ShowVisibilityViewer) =>
  viewer.isProducer ||
  viewer.isTheaterStaff ||
  viewer.isShowStaff ||
  viewer.viewerCast?.status === "accepted" ||
  (viewer.viewerCast?.status === "pending" &&
    viewer.viewerCast.source === "invited");

export const canViewFullCastState = (viewer: ShowVisibilityViewer) =>
  viewer.isProducer || viewer.isTheaterStaff || viewer.isShowStaff;

export const canRequestToJoinShow = (
  show: ShowVisibility,
  viewer: ShowVisibilityViewer,
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

export const canViewPerformerProfile = ({
  fieldVisibility,
  viewerUserId,
  performerUserId,
  visibility,
  sharedTheaterIds,
}: PerformerProfileVisibilityInput) => {
  if (viewerUserId === performerUserId) {
    return true;
  }

  const discoverability = canViewProfileField({
    viewerUserId,
    performerUserId,
    visibility: visibility ?? "private",
    sharedTheaterIds,
  });

  if (!discoverability) {
    return false;
  }

  if (fieldVisibility) {
    return Object.values(fieldVisibility).some((fieldVisibilityValue) =>
      canViewProfileField({
        viewerUserId,
        performerUserId,
        visibility: fieldVisibilityValue,
        sharedTheaterIds,
      }),
    );
  }

  return true;
};

export const canViewProfileField = ({
  viewerUserId,
  performerUserId,
  visibility,
  sharedTheaterIds,
}: {
  viewerUserId: string | null;
  performerUserId: string;
  visibility: Enums<"profile_visibility">;
  sharedTheaterIds: Set<string>;
}) => {
  if (viewerUserId === performerUserId) {
    return true;
  }

  if (visibility === "public") {
    return true;
  }

  if (visibility === "theater_only") {
    return sharedTheaterIds.size > 0;
  }

  return false;
};

export const canViewPerformerAffiliation = ({
  viewerUserId,
  performerUserId,
  affiliationTheaterId,
  sharedTheaterIds,
}: PerformerAffiliationVisibilityInput) =>
  viewerUserId === performerUserId ||
  sharedTheaterIds.has(affiliationTheaterId);

export const canViewNotifications = (
  viewerUserId: string | null,
  recipientUserId: string,
) => viewerUserId === recipientUserId;

export const shouldHideResourceExistence = (
  surface:
    | "show"
    | "theater_review"
    | "review_inbox"
    | "performer_profile"
    | "performer_affiliation"
    | "notification",
) => {
  switch (surface) {
    case "show":
    case "theater_review":
    case "review_inbox":
    case "performer_profile":
    case "performer_affiliation":
    case "notification":
      return false;
    default:
      return false;
  }
};
