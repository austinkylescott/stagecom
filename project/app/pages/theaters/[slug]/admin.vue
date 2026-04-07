<script setup lang="ts">
import { useMutation, useQueryCache } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";
import {
  type TheaterDetails,
  useTheaterDetails,
} from "~/composables/useTheaterDetails";
import {
  type ReviewQueue,
  useTheaterReviewQueue,
} from "~/composables/useTheaterReviewQueue";
import {
  MAX_THEATER_UPCOMING_ITEMS_LIMIT,
  MIN_THEATER_UPCOMING_ITEMS_LIMIT,
} from "~~/shared/theater-board-settings";

const route = useRoute();
const slug = computed(() => route.params.slug as string);
const queryCache = useQueryCache();
const toast = useToast();

const { data: initialTheater } = await useAsyncData(
  `theater-admin-${slug.value}`,
  () =>
    $fetch<TheaterDetails>(`/api/theaters/${slug.value}`, {
      headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
      credentials: "include",
    }),
  { server: true },
);

const { data, isLoading, error } = useTheaterDetails(slug, initialTheater);
const canReview = computed(() => data.value?.permissions?.canReview ?? false);

const { data: initialQueue } = await useAsyncData(
  `theater-admin-review-${slug.value}`,
  () => {
    if (!initialTheater.value?.permissions?.canReview) return null;

    return $fetch<ReviewQueue>(`/api/theaters/${slug.value}/review`, {
      headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
      credentials: "include",
    });
  },
  { server: true },
);

const reviewSlug = computed(() => (canReview.value ? slug.value : ""));

const { data: reviewQueue, isLoading: reviewLoading } = useTheaterReviewQueue(
  reviewSlug,
  computed(() => initialQueue.value || undefined),
);

const reviewPreview = computed(() => (reviewQueue.value?.shows || []).slice(0, 5));
const boardSettingsForm = reactive({
  upcomingOtherEventsLimit: MIN_THEATER_UPCOMING_ITEMS_LIMIT,
  upcomingShowsLimit: MIN_THEATER_UPCOMING_ITEMS_LIMIT,
});

watch(
  () => data.value?.boardSettings,
  (settings) => {
    if (!settings) return;

    boardSettingsForm.upcomingOtherEventsLimit =
      settings.upcomingOtherEventsLimit;
    boardSettingsForm.upcomingShowsLimit = settings.upcomingShowsLimit;
  },
  { immediate: true },
);

const boardSettingsMutation = useMutation<
  { boardSettings: TheaterDetails["boardSettings"] },
  TheaterDetails["boardSettings"]
>({
  mutation: (payload) =>
    $fetch(`/api/theaters/${slug.value}/settings`, {
      body: payload,
      credentials: "include",
      method: "PATCH",
    }),
  onSuccess: async (response) => {
    boardSettingsForm.upcomingOtherEventsLimit =
      response.boardSettings.upcomingOtherEventsLimit;
    boardSettingsForm.upcomingShowsLimit =
      response.boardSettings.upcomingShowsLimit;

    await queryCache.invalidateQueries({
      key: queryKeys.theaterPrefix(),
      exact: false,
    });

    toast?.add({
      title: "Theater board updated",
      description: "Upcoming show and event counts now match the board settings.",
      color: "success",
    });
  },
  onError: (error: any) => {
    toast?.add({
      title: "Unable to save board settings",
      description:
        error?.data?.statusMessage ||
        error?.data?.message ||
        error?.message ||
        "Unknown error",
      color: "error",
    });
  },
});

const boardSettingsSaving = computed(() => boardSettingsMutation.isLoading.value);

const saveBoardSettings = async () => {
  const upcomingShowsLimit = Math.min(
    MAX_THEATER_UPCOMING_ITEMS_LIMIT,
    Math.max(
      MIN_THEATER_UPCOMING_ITEMS_LIMIT,
      Number(boardSettingsForm.upcomingShowsLimit) ||
        MIN_THEATER_UPCOMING_ITEMS_LIMIT,
    ),
  );
  const upcomingOtherEventsLimit = Math.min(
    MAX_THEATER_UPCOMING_ITEMS_LIMIT,
    Math.max(
      MIN_THEATER_UPCOMING_ITEMS_LIMIT,
      Number(boardSettingsForm.upcomingOtherEventsLimit) ||
        MIN_THEATER_UPCOMING_ITEMS_LIMIT,
    ),
  );

  boardSettingsForm.upcomingShowsLimit = upcomingShowsLimit;
  boardSettingsForm.upcomingOtherEventsLimit = upcomingOtherEventsLimit;

  await boardSettingsMutation.mutateAsync({
    upcomingOtherEventsLimit,
    upcomingShowsLimit,
  });
};

const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString() : "TBD";
</script>

<template>
  <div class="space-y-0">
    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-(--stage-cream)"
      inner-class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
    >
      <div v-if="!canReview" class="stage-panel p-6 sm:p-8">
        <p class="stage-overline">Theater admin</p>
        <h1 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
          Oversight access required
        </h1>
        <p class="mt-3 max-w-2xl text-sm leading-7 stage-muted">
          This page is for theater managers, staff, and other oversight roles.
          The member-facing theater page stays separate so regular users can
          orient around upcoming programming without back-office controls mixed in.
        </p>
        <div class="mt-5 flex flex-wrap gap-2">
          <UButton :to="`/theaters/${slug}`">
            Return to theater page
          </UButton>
          <UButton variant="ghost" to="/review">
            Open approvals
          </UButton>
        </div>
      </div>

      <template v-else>
        <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div class="space-y-5">
            <div class="flex flex-wrap items-center gap-2">
              <span class="stage-kicker">Theater admin</span>
              <span class="stage-chip bg-(--stage-gold) text-(--stage-ink)">
                Oversight
              </span>
            </div>

            <div>
              <h1 class="stage-section-title">
                {{ data?.theater.name || slug }} operations
              </h1>
              <p class="mt-3 max-w-3xl text-lg leading-8 stage-muted">
                Keep theater-wide review work, community visibility, and top-down
                operating signals here so the main theater page can stay member-facing.
              </p>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div class="stage-stat">
                <span class="stage-overline">Pending review</span>
                <span class="stage-stat-value">{{ data?.stats.pendingReviewCount ?? 0 }}</span>
              </div>
              <div class="stage-stat">
                <span class="stage-overline">All shows</span>
                <span class="stage-stat-value">{{ data?.stats.totalShows ?? 0 }}</span>
              </div>
              <div class="stage-stat">
                <span class="stage-overline">Public listings</span>
                <span class="stage-stat-value">{{ data?.stats.publicShowCount ?? 0 }}</span>
              </div>
              <div class="stage-stat">
                <span class="stage-overline">Members</span>
                <span class="stage-stat-value">{{ data?.stats.memberCount ?? 0 }}</span>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton :to="`/theaters/${slug}/review`" icon="i-heroicons-inbox-stack">
                Open review queue
              </UButton>
              <UButton
                variant="ghost"
                :to="`/theaters/${slug}/shows/new`"
                icon="i-heroicons-plus"
              >
                Propose event
              </UButton>
              <UButton
                variant="ghost"
                :to="`/theaters/${slug}`"
                icon="i-heroicons-building-library"
              >
                Theater page
              </UButton>
            </div>
          </div>

        <aside class="grid gap-4">
          <section class="stage-panel p-5 sm:p-6">
            <p class="stage-overline">Board settings</p>
            <h2 class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
              Control theater board volume
            </h2>
            <p class="mt-3 text-sm leading-7 stage-muted">
              These totals shape how much programming the theater page fetches and
              displays. The first show and first non-show event land in the dashboard;
              the remaining items appear in the sections below.
            </p>

            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <UFormField
                label="Upcoming shows"
                :description="`Total visible on the board, including the dashboard card. ${MIN_THEATER_UPCOMING_ITEMS_LIMIT}-${MAX_THEATER_UPCOMING_ITEMS_LIMIT}.`"
              >
                <UInput
                  v-model.number="boardSettingsForm.upcomingShowsLimit"
                  type="number"
                  :min="MIN_THEATER_UPCOMING_ITEMS_LIMIT"
                  :max="MAX_THEATER_UPCOMING_ITEMS_LIMIT"
                />
              </UFormField>

              <UFormField
                label="Upcoming non-show events"
                :description="`Total visible on the board, including the dashboard card. ${MIN_THEATER_UPCOMING_ITEMS_LIMIT}-${MAX_THEATER_UPCOMING_ITEMS_LIMIT}.`"
              >
                <UInput
                  v-model.number="boardSettingsForm.upcomingOtherEventsLimit"
                  type="number"
                  :min="MIN_THEATER_UPCOMING_ITEMS_LIMIT"
                  :max="MAX_THEATER_UPCOMING_ITEMS_LIMIT"
                />
              </UFormField>
            </div>

            <div class="mt-5 flex flex-wrap items-center gap-3">
              <UButton
                :loading="boardSettingsSaving"
                icon="i-heroicons-check"
                @click="saveBoardSettings"
              >
                Save board settings
              </UButton>
              <p class="text-xs stage-muted">
                Smaller totals reduce the amount of upcoming theater data the page fetches.
              </p>
            </div>
          </section>

          <section class="stage-panel p-5 sm:p-6">
            <p class="stage-overline">Admin focus</p>
              <h2 class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                What needs attention now
              </h2>
              <div class="mt-4 space-y-3 text-sm leading-7 stage-muted">
                <p>Review keeps public listings trustworthy.</p>
                <p>Show volume and public listings tell you how visible the theater feels from the outside.</p>
                <p>Member count is the quickest proxy for how much community context this theater is carrying.</p>
              </div>
            </section>

            <section class="stage-panel p-5 sm:p-6">
              <p class="stage-overline">Cross-theater handoff</p>
              <h2 class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                Keep queue work moving
              </h2>
              <p class="mt-3 text-sm leading-7 stage-muted">
                Theater-specific admin lives here. Cross-theater approvals still flow through the shared approvals route when you need the bigger picture.
              </p>
              <div class="mt-4">
                <UButton block variant="ghost" to="/review">
                  Open shared approvals
                </UButton>
              </div>
            </section>
          </aside>
        </div>
      </template>
    </StageSection>

    <StageSection
      v-if="canReview"
      outer-class="border-b-3 border-(--stage-ink) bg-[rgba(251,247,239,0.52)]"
      inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <div v-if="error" class="mb-6 stage-panel px-5 py-4 text-sm text-red-700">
        {{ error?.data?.message || error?.message }}
      </div>

      <div class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section class="stage-panel p-5 sm:p-6">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="stage-overline">Queue preview</p>
              <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
                Pending theater review
              </h2>
            </div>
            <p v-if="isLoading || reviewLoading" class="text-sm stage-muted">
              Loading…
            </p>
          </div>

          <div v-if="reviewPreview.length" class="mt-5 grid gap-3">
            <NuxtLink
              v-for="show in reviewPreview"
              :key="show.id"
              :to="`/theaters/${slug}/shows/${show.id}`"
              class="block"
            >
              <article class="stage-list-card p-4">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-(--stage-ink)">
                      {{ show.title }}
                    </p>
                    <p class="mt-1 text-xs stage-muted">
                      {{ formatDateTime(show.startsAt) }}
                    </p>
                  </div>
                  <span class="stage-chip bg-(--stage-gold)">
                    {{ show.status.replace(/_/g, " ") }}
                  </span>
                </div>
              </article>
            </NuxtLink>
          </div>

          <div
            v-else-if="!reviewLoading"
            class="mt-5 border-2 border-dashed border-(--stage-ink) px-4 py-6 text-sm stage-muted"
          >
            Nothing is waiting for theater review right now.
          </div>

          <div class="mt-5">
            <UButton :to="`/theaters/${slug}/review`" icon="i-heroicons-arrow-right">
              Open full review queue
            </UButton>
          </div>
        </section>

        <aside class="grid gap-4">
          <section class="stage-panel p-5 sm:p-6">
            <p class="stage-overline">Community snapshot</p>
            <h2 class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
              Theater scale
            </h2>
            <div class="mt-4 grid gap-3">
              <div class="stage-stat">
                <span class="stage-overline">Members</span>
                <span class="stage-stat-value">{{ data?.stats.memberCount ?? 0 }}</span>
              </div>
              <div class="stage-stat">
                <span class="stage-overline">Total shows</span>
                <span class="stage-stat-value">{{ data?.stats.totalShows ?? 0 }}</span>
              </div>
              <div class="stage-stat">
                <span class="stage-overline">Public listings</span>
                <span class="stage-stat-value">{{ data?.stats.publicShowCount ?? 0 }}</span>
              </div>
            </div>
          </section>

          <section class="stage-panel p-5 sm:p-6">
            <p class="stage-overline">Admin routes</p>
            <h2 class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
              Key surfaces
            </h2>
            <div class="mt-4 grid gap-3">
              <UButton block variant="ghost" :to="`/theaters/${slug}`">
                Member-facing theater page
              </UButton>
              <UButton block variant="ghost" :to="`/theaters/${slug}/review`">
                Theater review queue
              </UButton>
              <UButton block variant="ghost" :to="`/theaters/${slug}/shows/new`">
                Create theater show
              </UButton>
            </div>
          </section>
        </aside>
      </div>
    </StageSection>
  </div>
</template>
