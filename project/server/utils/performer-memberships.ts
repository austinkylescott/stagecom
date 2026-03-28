import { canViewPerformerAffiliation } from "./visibility-policy";

type ActiveMembership = {
  user_id: string;
  theater_id: string;
  status: "active";
};

type FilterMembershipsInput = {
  memberships: ActiveMembership[];
  viewerUserId: string;
  sharedTheaterIds: Set<string>;
  requestedTheaterId?: string;
};

export const filterVisiblePerformerMemberships = ({
  memberships,
  viewerUserId,
  sharedTheaterIds,
  requestedTheaterId,
}: FilterMembershipsInput): ActiveMembership[] =>
  memberships.filter((membership) => {
    if (
      !canViewPerformerAffiliation({
        viewerUserId,
        performerUserId: membership.user_id,
        affiliationTheaterId: membership.theater_id,
        sharedTheaterIds,
      })
    ) {
      return false;
    }

    if (requestedTheaterId) {
      return membership.theater_id === requestedTheaterId;
    }

    return true;
  });
