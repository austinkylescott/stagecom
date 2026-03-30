<script setup lang="ts">
import { useRequestHeaders } from "#app";
import {
  type MemberShowsResponse,
  type ShowItem,
  useMemberShows,
} from "~/composables/useMemberShows";

const { data: initialShows } = await useAsyncData(() =>
  $fetch<MemberShowsResponse>("/api/shows", {
    headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
    credentials: "include",
  }),
);

const { data, isLoading, error } = useMemberShows(initialShows);

const sortedShows = computed(() =>
  (data.value?.shows || []).slice().sort((a, b) => {
    if (!a.nextStartsAt) return 1;
    if (!b.nextStartsAt) return -1;
    return (
      new Date(a.nextStartsAt).getTime() - new Date(b.nextStartsAt).getTime()
    );
  }),
);

const firstTheaterSlug = computed(
  () => data.value?.shows?.[0]?.theaterSlug || "",
);
const newShowLink = computed(() =>
  firstTheaterSlug.value
    ? `/theaters/${firstTheaterSlug.value}/shows/new`
    : "/theaters",
);
const showDetailLink = (show: ShowItem) =>
  `/theaters/${show.theaterSlug}/shows/${show.id}`;

const today = new Date();
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
const monthDays = computed(() => {
  const days = [];
  const month = monthStart.getMonth();
  let d = new Date(monthStart);
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
});

const occurrencesByDay = computed(() => {
  const map = new Map<string, ShowItem[]>();
  for (const show of data.value?.shows || []) {
    if (!show.nextStartsAt) continue;
    const key = new Date(show.nextStartsAt).toISOString().slice(0, 10);
    const arr = map.get(key) || [];
    arr.push(show);
    map.set(key, arr);
  }
  return map;
});

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
</script>

<template>
  <div class="space-y-0">
    <StageSection outer-class="border-b-3 border-[var(--stage-ink)] bg-[var(--stage-cream)]" inner-class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-[1.1fr_auto] lg:items-end">
        <div class="space-y-4">
          <span class="stage-kicker">Programming Board</span>
          <div>
            <h1 class="stage-section-title">Shows in motion.</h1>
            <p class="mt-3 max-w-3xl text-lg leading-8 stage-muted">
              Upcoming shows for theaters you're a member of. Calendar highlights
              the next occurrence per show.
            </p>
          </div>
        </div>
        <div class="lg:justify-self-end">
          <UButton color="primary" icon="i-heroicons-plus" :to="newShowLink">
            New show
          </UButton>
        </div>
      </div>
    </StageSection>

    <StageSection outer-class="border-b-3 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.5)]" inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div v-if="error" class="mb-6 stage-panel px-5 py-4 text-sm text-red-700">
        {{ error?.data?.message || error?.message }}
      </div>

      <div class="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <UCard>
        <template #header>
          <div>
            <p class="stage-overline">Upcoming</p>
            <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
              Active lineup
            </h2>
          </div>
        </template>

        <div v-if="isLoading" class="text-sm stage-muted">Loading...</div>
        <div
          v-else-if="sortedShows.length === 0"
          class="border-2 border-dashed border-[var(--stage-ink)] bg-[rgba(251,247,239,0.7)] px-4 py-6 text-sm stage-muted"
        >
          No shows yet. Join or create a theater, then add a show.
        </div>
        <div v-else class="space-y-3">
          <NuxtLink
            v-for="show in sortedShows"
            :key="show.id"
            :to="showDetailLink(show)"
            class="stage-list-card block p-5"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-display text-4xl uppercase tracking-[0.08em]">
                  {{ show.title }}
                </p>
                <p class="mt-2 text-xs uppercase tracking-[0.14em] stage-muted">
                  {{ show.theaterName }} · {{ show.eventType || "show" }}
                </p>
              </div>
              <UBadge :color="show.status === 'approved' ? 'success' : 'neutral'">
                {{ show.status }}
              </UBadge>
            </div>
            <p class="mt-3 text-sm leading-7 stage-muted line-clamp-2">
              {{ show.description }}
            </p>
            <div class="mt-4 flex flex-wrap items-center gap-2">
              <span class="stage-chip bg-[var(--stage-paper-strong)]">
                Next
              </span>
              <p class="text-sm font-semibold">
              Next:
              {{
                show.nextStartsAt
                  ? new Date(show.nextStartsAt).toLocaleString()
                  : "TBD"
              }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div>
            <p class="stage-overline">This month</p>
            <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
              Calendar
            </h2>
          </div>
        </template>
        <div class="grid grid-cols-7 gap-2 text-xs">
          <div
            class="text-center stage-overline stage-muted"
            v-for="d in weekdayLabels"
            :key="d"
          >
            {{ d }}
          </div>
          <div
            v-for="day in monthDays"
            :key="day.toISOString()"
            class="flex min-h-24 flex-col gap-1 border-2 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.8)] p-2"
          >
            <div class="font-semibold">{{ day.getDate() }}</div>
            <div class="flex flex-col gap-1">
              <template
                v-for="occ in occurrencesByDay.get(
                  day.toISOString().slice(0, 10),
                ) || []"
                :key="occ.id"
              >
                <NuxtLink
                  :to="showDetailLink(occ)"
                  class="focus:outline-none"
                >
                  <UBadge
                    size="xs"
                    color="secondary"
                    variant="soft"
                    class="truncate cursor-pointer"
                  >
                    {{ occ.title }}
                  </UBadge>
                </NuxtLink>
              </template>
            </div>
          </div>
        </div>
      </UCard>
      </div>
    </StageSection>
  </div>
</template>
