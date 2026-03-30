<script setup lang="ts">
import { useRequestHeaders } from "#app";
import StageStackedBoard from "~/components/StageStackedBoard.vue";
import { useLocationFormatter } from "~/composables/useLocationFormatter";
import TheaterFollowHomeButtons from "~/components/TheaterFollowHomeButtons.vue";
import { useHomeTheaterState } from "~/composables/useHomeTheaterState";
import {
  type TheaterDetails,
  useTheaterDetails,
} from "~/composables/useTheaterDetails";

const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { formatLocation } = useLocationFormatter();
const { homeId } = useHomeTheaterState();

// Fetch once during SSR so the first paint already has theater data.
const { data: initialTheater } = await useAsyncData(
  () =>
    $fetch<TheaterDetails>(`/api/theaters/${slug.value}`, {
      headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
      credentials: "include",
    }),
  { server: true },
);

const { data, isLoading, error } = useTheaterDetails(slug, initialTheater);

const theater = computed(() => data.value?.theater || null);
const membership = computed(() => data.value?.membership || null);
const isMember = computed(() => membership.value?.status === "active");
const isHome = computed(
  () => membership.value?.isHome || homeId.value === theater.value?.id || false,
);
const canReview = computed(() => data.value?.permissions?.canReview ?? false);
const publicShows = computed(() => data.value?.shows.public || []);
const nextShow = computed(() => publicShows.value[0] || null);
const publicBoardRows = computed(() =>
  publicShows.value.slice(0, 3).map((show, index) => ({
    ...show,
    marker: index + 1,
    tone:
      index === 0
        ? "bg-[var(--stage-mint)]"
        : index === 1
          ? "bg-[var(--stage-gold)]"
          : "bg-[var(--stage-paper-strong)]",
  })),
);
const theaterActionLink = computed(() => {
  if (canReview.value) return `/theaters/${slug.value}/review`;
  if (isMember.value) return `/theaters/${slug.value}/shows/new`;
  return "/theaters";
});
const theaterActionLabel = computed(() => {
  if (canReview.value) return "Open review queue";
  if (isMember.value) return "Create a show";
  return "Browse theaters";
});
const theaterActionIcon = computed(() => {
  if (canReview.value) return "i-heroicons-inbox-stack";
  if (isMember.value) return "i-heroicons-plus";
  return "i-heroicons-building-library";
});

const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString() : "TBD";
</script>

<template>
  <div class="space-y-8">
    <section class="stage-panel-dark stage-grid-board p-6 sm:p-8">
      <div class="stage-page-grid stage-page-grid-rail items-start">
        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="stage-kicker">Theater detail</span>
            <span
              v-if="isHome"
              class="stage-chip bg-[var(--stage-mint)] text-[var(--stage-ink)]"
            >
              Home theater
            </span>
          </div>
          <div>
            <h1 class="font-display text-6xl uppercase tracking-[0.1em]">
              {{ theater?.name || slug }}
            </h1>
            <p
              v-if="theater?.tagline"
              class="mt-3 max-w-2xl text-lg leading-8 text-[var(--stage-paper-muted)]"
            >
              {{ theater.tagline }}
            </p>
            <p class="mt-2 text-sm text-[var(--stage-paper-muted)]">
              {{ formatLocation(theater || undefined) }}
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div
              class="border-3 border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.1)] p-4"
            >
              <p class="stage-overline text-[var(--stage-paper-muted)]">
                Members
              </p>
              <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                {{ data?.stats.memberCount ?? 0 }}
              </p>
            </div>
            <div
              class="border-3 border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.1)] p-4"
            >
              <p class="stage-overline text-[var(--stage-paper-muted)]">Shows</p>
              <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                {{ data?.stats.totalShows ?? 0 }}
              </p>
            </div>
            <div
              class="border-3 border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.1)] p-4"
            >
              <p class="stage-overline text-[var(--stage-paper-muted)]">
                Review
              </p>
              <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                {{ canReview ? data?.stats.pendingReviewCount ?? 0 : "Staffed" }}
              </p>
            </div>
          </div>
        </div>

        <aside class="px-2 pt-2">
          <StageStackedBoard
            :title="theater?.name || 'Theater'"
            subtitle="Public board"
            badge="Live"
          >
            <div class="space-y-4">
              <div
                v-for="show in publicBoardRows"
                :key="show.id"
                class="flex items-center justify-between gap-3 border-2 border-[var(--stage-ink)] p-3 transition-colors hover:bg-[var(--stage-paper-strong)]"
              >
                <div class="flex items-center gap-3">
                  <div class="flex size-8 items-center justify-center border-2 border-[var(--stage-ink)] bg-[var(--stage-ink)] text-xs font-bold text-[var(--stage-cream)]">
                    {{ show.marker }}
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-[var(--stage-ink)]">
                      {{ show.title }}
                    </div>
                    <div class="text-xs stage-muted">
                      {{ formatDateTime(show.startsAt) }}
                    </div>
                  </div>
                </div>
                <span class="border-2 border-[var(--stage-ink)] px-2 py-0.5 text-xs font-bold uppercase text-[var(--stage-ink)]" :class="show.tone">
                  {{ show.eventType || "Show" }}
                </span>
              </div>

              <div
                v-if="!publicBoardRows.length && !isLoading"
                class="border-2 border-dashed border-[var(--stage-ink)] px-4 py-6 text-sm stage-muted"
              >
                This theater has not published any public programming yet.
              </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-2">
              <UButton
                size="sm"
                :to="theaterActionLink"
                :icon="theaterActionIcon"
              >
                {{ theaterActionLabel }}
              </UButton>
              <UButton
                v-if="canReview"
                size="sm"
                variant="ghost"
                :to="`/theaters/${slug}/shows/new`"
                icon="i-heroicons-plus"
              >
                New show
              </UButton>
            </div>
            <template #left-callout>
              <div class="absolute -left-5 top-1/4 border-2 border-[var(--stage-ink)] bg-[var(--stage-cream)] px-3 py-2 shadow-[4px_4px_0_0_var(--stage-ink)]">
                <div class="flex items-center gap-2">
                  <div class="size-3 bg-[var(--stage-gold)]" />
                  <span class="text-xs font-bold text-[var(--stage-ink)]">
                    {{ data?.stats.publicShowCount ?? 0 }} public listings
                  </span>
                </div>
              </div>
            </template>

            <template #right-callout>
              <div class="absolute -right-4 bottom-1/4 border-2 border-[var(--stage-ink)] bg-[var(--stage-cream)] px-3 py-2 shadow-[4px_4px_0_0_var(--stage-ink)]">
                <span class="text-xs font-bold text-[var(--stage-ink)]">
                  {{ canReview ? `${data?.stats.pendingReviewCount ?? 0} pending review` : isMember ? "Member access active" : "Public view" }}
                </span>
              </div>
            </template>
          </StageStackedBoard>
        </aside>
      </div>
    </section>

    <div v-if="error" class="stage-panel px-5 py-4 text-sm text-red-700">
      {{ error?.data?.message || error?.message }}
    </div>

    <section class="stage-page-grid stage-page-grid-rail">
      <div class="space-y-4">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p class="stage-overline">Public shows</p>
            <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
              Current programming
            </h2>
            <p class="mt-2 text-sm leading-7 stage-muted">
              Approved and publicly listed shows with their next occurrence.
            </p>
          </div>
          <p v-if="isLoading" class="text-sm stage-muted">Loading…</p>
        </div>

        <div
          v-if="!isLoading && publicShows.length"
          class="grid gap-4"
        >
          <NuxtLink
            v-for="show in publicShows"
            :key="show.id"
            :to="`/theaters/${slug}/shows/${show.id}`"
            class="block"
          >
            <article
              class="stage-list-card h-full p-5 transition-transform hover:-translate-y-1 sm:p-6"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="stage-chip bg-[var(--stage-gold)]">
                      Public
                    </span>
                    <span class="stage-chip bg-[var(--stage-paper-strong)]">
                      {{ show.eventType || "show" }}
                    </span>
                  </div>
                  <h3 class="mt-3 font-display text-4xl uppercase tracking-[0.08em]">
                    {{ show.title }}
                  </h3>
                </div>
                <div class="border-2 border-[var(--stage-ink)] bg-[var(--stage-cream)] px-3 py-2 text-right">
                  <p class="stage-overline">Next</p>
                  <p class="mt-2 text-sm font-semibold text-[var(--stage-ink)]">
                    {{ formatDateTime(show.startsAt) }}
                  </p>
                </div>
              </div>
              <p v-if="show.description" class="mt-4 text-sm leading-7 stage-muted">
                {{ show.description }}
              </p>
            </article>
          </NuxtLink>
        </div>
        <div
          v-else-if="!isLoading"
          class="stage-panel px-5 py-6 text-sm stage-muted"
        >
          No public shows yet.
        </div>
      </div>

      <div class="space-y-4">
        <section class="stage-panel p-5 sm:p-6">
          <p class="stage-overline">How this theater runs</p>
          <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
            Operating notes
          </h2>
          <div class="mt-4 space-y-3 text-sm leading-7 stage-muted">
            <p>Managers can maintain visibility and approvals without micromanaging every lineup choice.</p>
            <p>Producers keep show setup, cast communication, and review feedback attached to the actual theater context.</p>
            <p>Performers and audiences get a cleaner public board with clearer upcoming programming.</p>
          </div>
        </section>

        <section class="stage-panel p-5 sm:p-6">
          <p class="stage-overline">At a glance</p>
          <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
            Theater snapshot
          </h2>
          <div class="mt-4 grid gap-3">
            <div class="stage-stat">
              <span class="stage-overline">Public shows</span>
              <span class="stage-stat-value">{{ data?.stats.publicShowCount ?? 0 }}</span>
            </div>
            <div class="stage-stat">
              <span class="stage-overline">Pending review</span>
              <span class="stage-stat-value">{{ data?.stats.pendingReviewCount ?? 0 }}</span>
            </div>
            <div class="stage-stat">
              <span class="stage-overline">Members</span>
              <span class="stage-stat-value">{{ data?.stats.memberCount ?? 0 }}</span>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
