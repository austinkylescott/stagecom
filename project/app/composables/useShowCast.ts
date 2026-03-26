import { computed, type MaybeRefOrGetter, toValue } from "vue";
import type { Enums } from "~/types/database.types";

export type ShowCastMember = {
  userId: string;
  source: Enums<"show_cast_source">;
  status: Enums<"show_cast_status">;
  programOrder: number | null;
  note: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

const statusOrder: Record<ShowCastMember["status"], number> = {
  accepted: 0,
  pending: 1,
  declined: 2,
  withdrawn: 3,
  removed: 4,
};

const compareByName = (
  a: Pick<ShowCastMember, "displayName" | "userId">,
  b: Pick<ShowCastMember, "displayName" | "userId">,
) => (a.displayName ?? a.userId).localeCompare(b.displayName ?? b.userId);

const compareCastMembers = (
  a: ShowCastMember,
  b: ShowCastMember,
  sortMode: "status" | "name",
) => {
  if (sortMode === "name") {
    return compareByName(a, b);
  }

  const statusDiff = statusOrder[a.status] - statusOrder[b.status];
  if (statusDiff !== 0) return statusDiff;

  if (a.programOrder !== null || b.programOrder !== null) {
    if (a.programOrder === null) return 1;
    if (b.programOrder === null) return -1;
    if (a.programOrder !== b.programOrder) return a.programOrder - b.programOrder;
  }

  if (a.source !== b.source) {
    return a.source.localeCompare(b.source);
  }

  return compareByName(a, b);
};

export const useShowCast = ({
  cast,
  viewerCast,
  canSeePendingCast,
  sortMode,
}: {
  cast: MaybeRefOrGetter<ShowCastMember[]>;
  viewerCast?: MaybeRefOrGetter<ShowCastMember | null | undefined>;
  canSeePendingCast?: MaybeRefOrGetter<boolean | undefined>;
  sortMode?: MaybeRefOrGetter<"status" | "name" | undefined>;
}) => {
  const resolvedSortMode = computed(() => toValue(sortMode) ?? "status");
  const resolvedCanSeePending = computed(() => toValue(canSeePendingCast) ?? false);
  const resolvedCast = computed(() => toValue(cast) ?? []);
  const resolvedViewerCast = computed(() => toValue(viewerCast) ?? null);

  const castByUserId = computed(() => {
    const map = new Map<string, ShowCastMember>();

    for (const member of resolvedCast.value) {
      map.set(member.userId, member);
    }

    if (resolvedViewerCast.value) {
      map.set(resolvedViewerCast.value.userId, resolvedViewerCast.value);
    }

    return map;
  });

  const visibleCast = computed(() => {
    const members = Array.from(castByUserId.value.values()).filter((member) => {
      if (member.status === "accepted") return true;
      return resolvedCanSeePending.value && member.status === "pending";
    });

    return members.sort((a, b) => compareCastMembers(a, b, resolvedSortMode.value));
  });

  const confirmedCast = computed(() =>
    visibleCast.value.filter((member) => member.status === "accepted"),
  );

  const pendingCast = computed(() =>
    visibleCast.value.filter((member) => member.status === "pending"),
  );

  const pendingRequests = computed(() =>
    pendingCast.value.filter((member) => member.source === "requested"),
  );

  const pendingInvites = computed(() =>
    pendingCast.value.filter((member) => member.source === "invited"),
  );

  const inactiveCast = computed(() =>
    Array.from(castByUserId.value.values())
      .filter((member) =>
        ["declined", "withdrawn", "removed"].includes(member.status),
      )
      .sort((a, b) => compareCastMembers(a, b, resolvedSortMode.value)),
  );

  return {
    visibleCast,
    confirmedCast,
    pendingCast,
    pendingRequests,
    pendingInvites,
    inactiveCast,
    viewerCast: resolvedViewerCast,
  };
};
