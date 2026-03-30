<script setup lang="ts">
import { useMutation, useQueryCache } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import StageFeatureCard from "~/components/StageFeatureCard.vue";
import { queryKeys } from "~/composables/queryKeys";
import {
  type ReviewQueue,
  useTheaterReviewQueue,
} from "~/composables/useTheaterReviewQueue";
const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { data: initialReviewQueue } = await useAsyncData(() =>
  $fetch<ReviewQueue>(`/api/theaters/${slug.value}/review`, {
    headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
    credentials: "include",
  }),
);

const { data, isLoading, error } = useTheaterReviewQueue(
  slug,
  initialReviewQueue,
);

const message = ref("");
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
        key: queryKeys.theaterReview(slug.value || ""),
        exact: false,
      }),
      queryCache.invalidateQueries({
        key: queryKeys.theater(slug.value || ""),
        exact: false,
      }),
      queryCache.invalidateQueries({
        key: queryKeys.memberShows(),
        exact: true,
      }),
    ]);
  },
});

const reasons = [
  { label: "Missing description", value: "missing_description" },
  { label: "Schedule unclear", value: "schedule_unclear" },
  { label: "Casting incomplete", value: "casting_incomplete" },
  { label: "Content policy", value: "content_policy" },
  { label: "Other", value: "other" },
] as const;

const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString() : "TBD";

const pendingCount = computed(
  () => data.value?.shows.filter((show) => show.status === "pending_review").length || 0,
);

const feedback = reactive<Record<string, { reason: string; note: string }>>({});

const getFeedback = (showId: string) => {
  if (!feedback[showId]) {
    feedback[showId] = { reason: reasons[0].value, note: "" };
  }
  return feedback[showId];
};

const updateStatus = async (
  showId: string,
  action: "approve" | "reject" | "changes_requested",
) => {
  message.value = "";
  const payload: Record<string, any> = { action };

  if (action === "changes_requested") {
    const fb = getFeedback(showId);
    payload.reason = fb.reason;
    payload.note = fb.note || null;
  }

  await updateStatusMutation.mutateAsync({
    showId,
    action,
    reason: payload.reason,
    note: payload.note,
  });
  if (action === "approve") message.value = "Approved";
  else if (action === "reject") message.value = "Rejected";
  else message.value = "Changes requested";
};
</script>

<template>
  <div class="space-y-8">
    <section class="stage-panel stage-texture overflow-hidden px-6 py-7 sm:px-8 sm:py-8">
      <div class="stage-page-grid stage-page-grid-rail items-start">
        <div class="space-y-5">
          <span class="stage-kicker">Theater review</span>
          <div>
            <h1 class="stage-section-title">Review queue for this theater.</h1>
            <p class="mt-3 max-w-3xl text-lg leading-8 stage-muted">
              Approvals should sit next to scheduling and show setup, not feel
              like a separate admin utility. This queue keeps producer action
              and theater oversight in the same visual system.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="stage-stat">
              <span class="stage-overline">Pending review</span>
              <span class="stage-stat-value">{{ pendingCount }}</span>
            </div>
            <div class="stage-stat">
              <span class="stage-overline">Queued shows</span>
              <span class="stage-stat-value">{{ data?.shows.length || 0 }}</span>
            </div>
            <div class="stage-stat">
              <span class="stage-overline">Quick action</span>
              <UButton
                class="mt-3"
                size="sm"
                :to="`/theaters/${slug}/shows/new`"
                icon="i-heroicons-plus"
              >
                New show
              </UButton>
            </div>
          </div>
        </div>

        <aside class="stage-panel-dark stage-grid-board p-5 sm:p-6">
          <p class="stage-overline text-[var(--stage-paper-muted)]">Queue guidance</p>
          <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-[var(--stage-cream)]">
            Review flow
          </h2>
          <div class="mt-4 space-y-3 text-sm leading-7 text-[var(--stage-paper-muted)]">
            <p>Approve when the public information is clear and the theater is ready to stand behind the listing.</p>
            <p>Request changes when lineup, schedule, or policy details still need correction.</p>
            <p>Reject only when the proposal should not move forward in its current form.</p>
          </div>
        </aside>
      </div>
    </section>

    <p v-if="message" class="text-sm text-emerald-600">{{ message }}</p>
    <p v-if="error" class="text-sm text-red-600">
      {{ error?.data?.message || error?.message }}
    </p>

    <section class="stage-panel p-5 sm:p-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="stage-overline">Queue ledger</p>
          <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
            Theater review items
          </h2>
        </div>
        <p class="text-sm stage-muted">
          {{ data?.shows.length || 0 }} item{{ data?.shows.length === 1 ? "" : "s" }}
        </p>
      </div>

      <div v-if="isLoading" class="mt-5 text-sm stage-muted">Loading review queue...</div>
      <div v-else class="mt-5 grid gap-4">
        <StageFeatureCard
          v-for="show in data?.shows || []"
          :key="show.id"
          title="Review Queue"
          subtitle="Theater approval workflow"
          tone="bg-[var(--stage-mint)]"
        >
          <div class="space-y-3 text-[var(--stage-ink)]">
            <div class="flex items-center justify-between gap-3 border-2 border-[rgba(43,41,38,0.1)] p-3">
              <div>
                <div class="text-sm font-medium">{{ show.title }}</div>
                <div class="text-xs stage-muted">{{ formatDateTime(show.startsAt) }}</div>
              </div>
              <div class="flex gap-1">
                <UButton
                  size="xs"
                  color="emerald"
                  @click="updateStatus(show.id, 'approve')"
                >
                  Approve
                </UButton>
                <UButton
                  size="xs"
                  variant="ghost"
                  :to="`/theaters/${slug}/shows/${show.id}`"
                >
                  Review
                </UButton>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton
                size="xs"
                color="red"
                variant="soft"
                @click="updateStatus(show.id, 'reject')"
              >
                Reject
              </UButton>
              <UButton
                size="xs"
                color="orange"
                variant="soft"
                @click="updateStatus(show.id, 'changes_requested')"
              >
                Needs work
              </UButton>
            </div>
            <div class="grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
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
                placeholder="Optional note"
              />
            </div>
            <div class="border-t-2 border-[rgba(43,41,38,0.1)] pt-3 text-center">
              <span class="text-sm stage-muted">
                <span class="font-bold text-[var(--stage-coral)]">{{ show.status === 'pending_review' ? 1 : 0 }}</span>
                {{ show.status === 'pending_review' ? ' item needs review' : ' item already processed' }}
              </span>
            </div>
          </div>
        </StageFeatureCard>
        <div v-if="!(data?.shows || []).length" class="text-sm stage-muted">
          Nothing to review yet.
        </div>
      </div>
    </section>
  </div>
</template>
