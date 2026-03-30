<script setup lang="ts">
import { useRequestHeaders } from "#app";
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
</script>

<template>
  <div class="space-y-8">
    <section class="stage-panel-dark stage-grid-board p-6 sm:p-8">
      <div
        class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start"
      >
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
              class="rounded-[1.1rem] border-[3px] border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.1)] p-4"
            >
              <p class="stage-overline text-[var(--stage-paper-muted)]">
                Members
              </p>
              <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                {{ data?.stats.memberCount ?? 0 }}
              </p>
            </div>
            <div
              class="rounded-[1.1rem] border-[3px] border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.1)] p-4"
            >
              <p class="stage-overline text-[var(--stage-paper-muted)]">Shows</p>
              <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                {{ data?.stats.totalShows ?? 0 }}
              </p>
            </div>
            <div
              class="rounded-[1.1rem] border-[3px] border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.1)] p-4"
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

        <div
          class="rounded-[1.4rem] border-[3px] border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.08)] p-5"
        >
          <p class="stage-overline text-[var(--stage-paper-muted)]">
            Theater controls
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <TheaterFollowHomeButtons
              v-if="theater"
              :theater="theater"
              :is-member="isMember"
              :is-home="isHome"
              size="sm"
            />
            <UButton
              v-if="canReview"
              size="sm"
              color="warning"
              :to="`/theaters/${slug}/review`"
              icon="i-heroicons-inbox-stack"
            >
              Review queue
            </UButton>
            <UButton
              v-if="isMember"
              size="sm"
              color="success"
              :to="`/theaters/${slug}/shows/new`"
              icon="i-heroicons-plus"
            >
              New show
            </UButton>
          </div>

          <p class="mt-5 text-sm leading-7 text-[var(--stage-paper-muted)]">
            Public programming stays visible, while approvals and management
            stay scoped to the people responsible for this theater.
          </p>
        </div>
      </div>
    </section>

    <div v-if="error" class="stage-panel px-5 py-4 text-sm text-red-700">
      {{ error?.data?.message || error?.message }}
    </div>

    <section class="space-y-4">
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
        v-if="!isLoading && data?.shows.public?.length"
        class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <NuxtLink
          v-for="show in data?.shows.public"
          :key="show.id"
          :to="`/theaters/${slug}/shows/${show.id}`"
          class="block"
        >
          <article
            class="stage-list-card h-full p-5 transition-transform hover:-translate-y-1"
          >
            <div class="flex items-start justify-between gap-3">
              <h3 class="font-display text-4xl uppercase tracking-[0.08em]">
                {{ show.title }}
              </h3>
              <span class="stage-chip bg-[var(--stage-gold)]">
                Public
              </span>
            </div>
            <p class="mt-3 text-xs uppercase tracking-[0.14em] stage-muted">
              {{ show.eventType || "show" }}
            </p>
            <p v-if="show.description" class="mt-3 text-sm leading-7 stage-muted">
              {{ show.description }}
            </p>
            <p class="mt-4 text-sm font-semibold">
              Next:
              {{
                show.startsAt ? new Date(show.startsAt).toLocaleString() : "TBD"
              }}
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
    </section>
  </div>
</template>
