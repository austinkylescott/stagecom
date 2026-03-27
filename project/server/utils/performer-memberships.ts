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
    if (membership.user_id === viewerUserId) {
      return true;
    }

    if (requestedTheaterId) {
      return membership.theater_id === requestedTheaterId;
    }

    return sharedTheaterIds.has(membership.theater_id);
  });
