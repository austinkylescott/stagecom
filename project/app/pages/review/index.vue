<script setup lang="ts">
import { useMutation, useQueryCache } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";
import {
  type ReviewInboxResponse,
  type ReviewInboxShow,
  useReviewInbox,
} from "~/composables/useReviewInbox";

const { data: initialReviewInbox } = await useAsyncData(() =>
  $fetch<ReviewInboxResponse>("/api/review", {
    headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
    credentials: "include",
  }),
);

const { data, isLoading, error } = useReviewInbox(initialReviewInbox);

const feedback = reactive<Record<string, { reason: string; note: string }>>({});
const notice = ref("");
const mutationError = ref("");

const reasons = [
  { label: "Missing description", value: "missing_description" },
  { label: "Schedule unclear", value: "schedule_unclear" },
  { label: "Casting incomplete", value: "casting_incomplete" },
  { label: "Content policy", value: "content_policy" },
  { label: "Other", value: "other" },
] as const;

const statusColors: Record<string, "gray" | "orange" | "emerald" | "red"> = {
  draft: "gray",
  pending_review: "orange",
  approved: "emerald",
  rejected: "red",
  cancelled: "gray",
};

const sortedShows = computed(() =>
  ((data.value?.shows || []) as ReviewInboxShow[]).slice().sort((a, b) => {
    if (!a.nextStartsAt) return 1;
    if (!b.nextStartsAt) return -1;
    return (
      new Date(a.nextStartsAt).getTime() - new Date(b.nextStartsAt).getTime()
    );
  }),
);

const activeFilter = ref<"needs_action" | "created" | "all">("needs_action");

const theaterCount = computed(
  () => new Set(sortedShows.value.map((show) => show.theaterId)).size,
);
const needsActionShows = computed(() =>
  sortedShows.value.filter(
    (show) => show.canReview && show.status === "pending_review",
  ),
);
const createdShows = computed(() =>
  sortedShows.value.filter((show) => show.createdByMe),
);
const upcomingShows = computed(() =>
  sortedShows.value.filter((show) => show.nextStartsAt).slice(0, 3),
);
const visibleShows = computed(() => {
  if (activeFilter.value === "needs_action") return needsActionShows.value;
  if (activeFilter.value === "created") return createdShows.value;
  return sortedShows.value;
});
const pendingApprovalCount = computed(
  () => sortedShows.value.filter((show) => show.status === "pending_review").length,
);
const createdPendingCount = computed(
  () =>
    sortedShows.value.filter(
      (show) => show.createdByMe && show.status === "pending_review",
    ).length,
);

const statusTone = (status: string) => {
  if (status === "pending_review") return "bg-(--stage-event)";
  if (status === "approved") return "bg-(--stage-theater)";
  if (status === "rejected") return "bg-(--stage-paper-muted)";
  return "bg-(--stage-event)";
};

const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString() : "TBD";

const reviewTableUi = {
  root: "stage-data-table",
  thead: "bg-(--stage-paper-strong)",
  th: "px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-(--stage-ink)",
  td: "px-4 py-4 align-top text-sm text-(--stage-ink)",
  tr: "border-b border-[rgba(43,41,38,0.12)] last:border-b-0",
};

const columns = [
  { id: "title", accessorKey: "title", header: "Title" },
  { id: "theaterName", accessorKey: "theaterName", header: "Theater" },
  { id: "eventType", accessorKey: "eventType", header: "Type" },
  { id: "status", accessorKey: "status", header: "Status" },
  {
    id: "nextStartsAt",
    accessorKey: "nextStartsAt",
    header: "Next occurrence",
  },
  { id: "actions", accessorKey: "id", header: "Actions" },
] as const;

const getFeedback = (showId: string) => {
  if (!feedback[showId]) {
    feedback[showId] = { reason: reasons[0].value, note: "" };
  }
  return feedback[showId];
};

const queryCache = useQueryCache();

const updateStatusMutation = useMutation<
  void,
  {
    showId: string;
    action: "approve" | "reject" | "changes_requested";
    reason?: string;
    note?: string;
  }
>({
  mutation: ({ showId, action, reason, note }) =>
    $fetch(`/api/shows/${showId}/status`, {
      method: "POST",
      credentials: "include",
      body: { action, reason, note },
    }),
  onSuccess: async () => {
    await Promise.all([
      queryCache.invalidateQueries({
        key: queryKeys.reviewInbox(),
        exact: true,
      }),
      queryCache.invalidateQueries({
        key: queryKeys.theaterReviewPrefix(),
        exact: false,
      }),
      queryCache.invalidateQueries({
        key: queryKeys.memberShows(),
        exact: true,
      }),
      queryCache.invalidateQueries({
        key: queryKeys.memberShowsSchedulePrefix(),
        exact: false,
      }),
      queryCache.invalidateQueries({
        key: queryKeys.theaterPrefix(),
        exact: false,
      }),
    ]);
  },
});
const statusMutating = computed(() => updateStatusMutation.isLoading.value);

const updateStatus = async (
  showId: string,
  action: "approve" | "reject" | "changes_requested",
) => {
  notice.value = "";
  mutationError.value = "";

  let reason: string | undefined;
  let note: string | undefined;

  if (action === "changes_requested") {
    const fb = getFeedback(showId);
    reason = fb.reason;
    note = fb.note || undefined;
  }

  try {
    await updateStatusMutation.mutateAsync({
      showId,
      action,
      reason,
      note,
    });

    if (action === "approve") notice.value = "Show approved";
    else if (action === "reject") notice.value = "Show rejected";
    else notice.value = "Changes requested";
  } catch (err: any) {
    mutationError.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      "Action failed";
  }
};
</script>

<template>
  <div class="space-y-0">
    <StageSection outer-class="border-b-3 border-(--stage-ink) bg-(--stage-cream) stage-texture overflow-hidden" inner-class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div class="stage-page-grid stage-page-grid-rail items-start">
        <div class="space-y-5">
          <span class="stage-kicker">Review board</span>
          <div>
            <h1 class="stage-section-title">Approvals that explain what is blocked.</h1>
            <p class="mt-3 max-w-3xl text-lg leading-8 stage-muted">
              Use this board to see what needs theater approval, what you are still shepherding, and what can move forward right now.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="stage-stat">
              <span class="stage-overline">Needs action</span>
              <span class="stage-stat-value">{{ needsActionShows.length }}</span>
              <p class="mt-2 text-sm stage-muted">Pending theater decisions</p>
            </div>
            <div class="stage-stat">
              <span class="stage-overline">Created by you</span>
              <span class="stage-stat-value">{{ createdShows.length }}</span>
              <p class="mt-2 text-sm stage-muted">Shows you are actively shepherding</p>
            </div>
            <div class="stage-stat">
              <span class="stage-overline">Theaters</span>
              <span class="stage-stat-value">{{ theaterCount }}</span>
              <p class="mt-2 text-sm stage-muted">Communities represented in this inbox</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              :variant="activeFilter === 'needs_action' ? 'soft' : 'ghost'"
              :class="activeFilter === 'needs_action' ? 'bg-(--stage-theater)' : ''"
              @click="activeFilter = 'needs_action'"
            >
              Needs action
            </UButton>
            <UButton
              :variant="activeFilter === 'created' ? 'soft' : 'ghost'"
              :class="activeFilter === 'created' ? 'bg-(--stage-event)' : ''"
              @click="activeFilter = 'created'"
            >
              Created by you
            </UButton>
            <UButton
              :variant="activeFilter === 'all' ? 'soft' : 'ghost'"
              :class="activeFilter === 'all' ? 'bg-(--stage-paper-strong)' : ''"
              @click="activeFilter = 'all'"
            >
              Full queue
            </UButton>
          </div>
        </div>

        <aside class="stage-panel-dark stage-grid-board p-5 sm:p-6">
          <div class="flex items-center justify-between gap-3 border-b-2 border-[rgba(251,247,239,0.2)] pb-4">
            <div>
              <p class="stage-overline text-(--stage-paper-muted)">Tonight's shows</p>
              <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-(--stage-cream)">
                Live board
              </h2>
            </div>
            <span class="stage-chip bg-(--stage-theater) text-(--stage-ink)">
              {{ upcomingShows.length }} upcoming
            </span>
          </div>

          <div class="mt-4 space-y-3">
            <div
              v-for="show in upcomingShows"
              :key="show.id"
              class="border-3 border-[rgba(251,247,239,0.2)] bg-[rgba(251,247,239,0.08)] p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-display text-3xl uppercase tracking-[0.08em] text-(--stage-cream)">
                    {{ show.title }}
                  </p>
                  <p class="mt-2 text-xs uppercase tracking-[0.16em] text-(--stage-paper-muted)">
                    {{ show.theaterName }}
                  </p>
                </div>
                <span class="stage-chip text-(--stage-ink)" :class="statusTone(show.status)">
                  {{ show.status.replaceAll('_', ' ') }}
                </span>
              </div>
              <p class="mt-3 text-sm leading-7 text-(--stage-paper-muted)">
                {{ formatDateTime(show.nextStartsAt) }}
              </p>
            </div>

            <div
              v-if="!upcomingShows.length && !isLoading"
              class="border-3 border-dashed border-[rgba(251,247,239,0.3)] px-4 py-6 text-sm text-(--stage-paper-muted)"
            >
              No upcoming shows in this queue yet.
            </div>
          </div>
        </aside>
      </div>
    </StageSection>

    <StageSection outer-class="border-b-3 border-(--stage-ink) bg-[rgba(251,247,239,0.52)]" inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div class="mb-6 space-y-2">
        <p v-if="notice" class="text-sm text-emerald-600">{{ notice }}</p>
        <p v-if="mutationError" class="text-sm text-red-600">{{ mutationError }}</p>
        <p v-if="error" class="text-sm text-red-600">
          {{ error?.data?.statusMessage || error?.data?.message || error?.message }}
        </p>
      </div>

      <section class="stage-page-grid stage-page-grid-rail">
      <div class="space-y-4">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="stage-overline">Working set</p>
            <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
              Active review items
            </h2>
          </div>
          <p class="text-sm stage-muted">
            {{ visibleShows.length }} item{{ visibleShows.length === 1 ? "" : "s" }}
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
          <div class="stage-stat">
            <span class="stage-overline">Awaiting approval</span>
            <span class="stage-stat-value">{{ pendingApprovalCount }}</span>
            <p class="mt-2 text-sm stage-muted">Across all visible theaters.</p>
          </div>
          <div class="stage-stat">
            <span class="stage-overline">Your pending shows</span>
            <span class="stage-stat-value">{{ createdPendingCount }}</span>
            <p class="mt-2 text-sm stage-muted">Still blocked on review.</p>
          </div>
          <div class="stage-stat">
            <span class="stage-overline">Checklist</span>
            <p class="mt-3 text-sm leading-6 stage-muted">
              Verify title, description, schedule, and whether the listing is ready for the theater to stand behind publicly.
            </p>
          </div>
        </div>

        <div
          v-if="isLoading"
          class="stage-panel px-5 py-6 text-sm stage-muted"
        >
          Loading review queue...
        </div>

        <div
          v-else-if="!visibleShows.length"
          class="stage-panel px-5 py-6 text-sm stage-muted"
        >
          Nothing in this view yet.
        </div>

        <div v-else class="grid gap-4">
          <article
            v-for="show in visibleShows"
            :key="show.id"
            class="border-4 border-[rgba(43,41,38,0.16)] bg-(--stage-cream)"
          >
            <div class="border-b-4 border-(--stage-ink) bg-(--stage-theater) px-4 py-3">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h3 class="font-bold text-(--stage-ink)">{{ show.title }}</h3>
                  <p class="text-sm text-[rgba(43,41,38,0.7)]">
                    {{ show.theaterName }} · {{ show.eventType || "show" }}
                  </p>
                </div>
                <span class="text-xl text-[rgba(43,41,38,0.55)]">⋯</span>
              </div>
            </div>

            <div class="space-y-3 p-4 text-(--stage-ink)">
              <div class="flex flex-wrap items-center gap-2">
                <UBadge
                  :color="statusColors[show.status] || 'neutral'"
                  variant="soft"
                >
                  {{ show.status.replaceAll('_', ' ') }}
                </UBadge>
                <UBadge
                  v-if="show.canReview && show.status === 'pending_review'"
                  color="warning"
                  variant="soft"
                >
                  Needs theater decision
                </UBadge>
                <UBadge
                  v-else-if="show.createdByMe"
                  color="neutral"
                  variant="soft"
                >
                  Tracked by you
                </UBadge>
              </div>
              <div class="flex items-center justify-between gap-3 border-2 border-[rgba(43,41,38,0.1)] p-3">
                <div>
                  <div class="text-sm font-medium">{{ show.title }}</div>
                  <div class="text-xs stage-muted">by {{ show.createdByMe ? "you" : show.theaterName }}</div>
                </div>
                <div class="flex gap-1">
                  <UButton
                    v-if="show.canReview && show.status === 'pending_review'"
                    size="xs"
                    color="primary"
                    :loading="statusMutating"
                    @click="updateStatus(show.id, 'approve')"
                  >
                    Approve
                  </UButton>
                  <UButton
                    size="xs"
                    variant="ghost"
                    :to="`/theaters/${show.theaterSlug}/shows/${show.id}`"
                  >
                    Review
                  </UButton>
                </div>
              </div>
              <div v-if="show.description" class="border-2 border-[rgba(43,41,38,0.1)] p-3 text-sm stage-muted">
                {{ show.description }}
              </div>
              <div class="flex items-center justify-between border-2 border-[rgba(43,41,38,0.1)] p-3">
                <span class="text-sm stage-muted">Next occurrence</span>
                <span class="text-sm font-bold">{{ formatDateTime(show.nextStartsAt) }}</span>
              </div>
              <div class="border-2 border-[rgba(43,41,38,0.1)] p-3 text-sm stage-muted">
                {{
                  show.canReview && show.status === 'pending_review'
                    ? 'Decision needed: confirm the listing is clear enough for public theater backing.'
                    : show.createdByMe
                      ? 'Tracked here because you created this show and may need to respond to review outcomes.'
                      : 'Tracked here because it belongs to a theater you help oversee.'
                }}
              </div>
              <div v-if="show.canReview && show.status === 'pending_review'" class="grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
                <USelect
                  size="sm"
                  :items="reasons"
                  label-key="label"
                  value-key="value"
                  v-model="getFeedback(show.id).reason"
                />
                <UInput
                  size="sm"
                  v-model="getFeedback(show.id).note"
                  placeholder="Optional note for the producer"
                />
              </div>
              <div class="text-center">
                <span class="text-sm stage-muted">
                  <span class="font-bold" :class="show.canReview && show.status === 'pending_review' ? 'text-(--stage-coral)' : 'text-(--stage-ink)'">1</span>
                  {{ show.canReview && show.status === 'pending_review' ? ' item needs review' : ' item tracked' }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div class="space-y-4">
        <section class="stage-panel p-5 sm:p-6">
          <p class="stage-overline">Queue rules</p>
          <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
            What matters here
          </h2>
          <div class="mt-4 space-y-3 text-sm leading-7 stage-muted">
            <p>Approve when the title, description, and schedule are clean enough for a public theater board.</p>
            <p>Request changes when the producer needs to clarify logistics, lineup readiness, or policy concerns.</p>
            <p>Reject only when the proposal should not proceed in its current form.</p>
          </div>
        </section>

        <section class="stage-panel p-5 sm:p-6">
          <p class="stage-overline">Ledger</p>
          <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
            Full queue
          </h2>
          <div class="mt-4">
            <UTable
              :data="sortedShows"
              :loading="isLoading"
              :columns="columns"
              :ui="reviewTableUi"
            >
        <template #title-cell="{ row }">
          <div>
            <p class="font-medium">{{ row.original.title }}</p>
            <p v-if="row.original.createdByMe" class="text-xs stage-muted">
              Created by you
            </p>
          </div>
        </template>

        <template #theaterName-cell="{ row }">
          <NuxtLink
            class="text-primary hover:underline"
            :to="`/theaters/${row.original.theaterSlug}`"
          >
            {{ row.original.theaterName }}
          </NuxtLink>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="statusColors[row.original.status] || 'neutral'"
            variant="soft"
          >
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #nextStartsAt-cell="{ row }">
          <span>
            {{
              row.original.nextStartsAt
                ? new Date(row.original.nextStartsAt).toLocaleString()
                : "TBD"
            }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <div
            v-if="
              row.original.canReview && row.original.status === 'pending_review'
            "
            class="space-y-2"
          >
            <div class="flex gap-2 flex-wrap">
              <UButton
                size="xs"
                color="primary"
                :loading="statusMutating"
                @click="updateStatus(row.original.id, 'approve')"
              >
                Approve
              </UButton>
              <UButton
                size="xs"
                color="error"
                variant="soft"
                :loading="statusMutating"
                @click="updateStatus(row.original.id, 'reject')"
              >
                Reject
              </UButton>
              <UButton
                size="xs"
                color="warning"
                variant="soft"
                :loading="statusMutating"
                @click="updateStatus(row.original.id, 'changes_requested')"
              >
                Needs work
              </UButton>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <USelect
                size="xs"
                :items="reasons"
                label-key="label"
                value-key="value"
                v-model="getFeedback(row.original.id).reason"
              />
              <UInput
                size="xs"
                v-model="getFeedback(row.original.id).note"
                placeholder="Optional note"
              />
            </div>
          </div>
          <div v-else class="text-xs stage-muted">No actions</div>
        </template>
      </UTable>
          </div>
          <p
            v-if="!isLoading && sortedShows.length === 0"
            class="mt-4 text-sm stage-muted"
          >
            Nothing to review yet.
          </p>
        </section>
      </div>
      </section>
    </StageSection>
  </div>
</template>
