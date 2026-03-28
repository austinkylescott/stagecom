import {
  canRequestToJoinShow,
  canViewFullCastState,
  canViewPendingCast,
  canViewShow,
  type ShowVisibilityViewer,
} from "./visibility-policy";

export type ShowAccessContext = ShowVisibilityViewer;

export const canViewerAccessShow = canViewShow;
export const canViewerRequestToJoinShow = canRequestToJoinShow;
export const canViewerSeePendingCast = canViewPendingCast;
export const canViewerSeeFullCastState = canViewFullCastState;
