<script setup lang="ts">
import { useHomeTheaterDashboard } from "~/composables/useHomeTheaterDashboard";
import type { HomeTheaterSummary } from "~/queries/home";

const props = defineProps<{
  entry: HomeTheaterSummary;
}>();

const emit = defineEmits<{
  (e: "remove-home", theaterId: string): void;
}>();

const formatLocation = (theater: HomeTheaterSummary["theater"]) =>
  [theater.city, theater.state_region, theater.country].filter(Boolean).join(", ");

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: props.entry.theater.timezone || "UTC",
  }).format(new Date(value));

const relationshipLabel = computed(() =>
  props.entry.membership.isHome ? "Member + home theater" : "Member",
);

const removeHome = () => emit("remove-home", props.entry.theater.id);

const slug = computed(() => props.entry.theater.slug);
const { data, isLoading } = useHomeTheaterDashboard(slug);
const dashboard = computed(() => ({
  nextThirtyDaysCount: data.value?.dashboard.nextThirtyDaysCount ?? 0,
  pendingReviewCount: data.value?.dashboard.pendingReviewCount ?? 0,
  upNextOtherEvent: data.value?.dashboard.upNextOtherEvent ?? null,
  upNextShow: data.value?.dashboard.upNextShow ?? null,
}));
</script>

<template>
  <UCard
    :ui="{
      root: 'rounded-none border-3 border-(--stage-ink) bg-[rgba(251,247,239,0.92)] shadow-[6px_6px_0_0_var(--stage-ink)]',
      header: 'p-5 sm:p-6',
      body: 'p-5 pt-0 sm:p-6 sm:pt-0',
    }"
  >
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="stage-chip bg-(--stage-theater) text-(--stage-ink)">
              {{ relationshipLabel }}
            </span>
            <span
              v-if="entry.permissions.canReview"
              class="stage-chip bg-(--stage-paper-strong) text-(--stage-ink)"
            >
              Oversight
            </span>
          </div>

          <div>
            <h2 class="font-display text-4xl uppercase tracking-[0.08em] text-(--stage-ink)">
              {{ entry.theater.name }}
            </h2>
            <p class="mt-2 text-sm leading-6 stage-muted">
              {{ formatLocation(entry.theater) || "Location not listed yet." }}
            </p>
            <p v-if="entry.theater.tagline" class="mt-2 text-sm leading-6 text-[rgba(43,41,38,0.82)]">
              {{ entry.theater.tagline }}
            </p>
          </div>
        </div>

        <div class="grid min-w-44 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div class="stage-stat bg-[rgba(130,191,182,0.26)]">
            <span class="stage-overline">Next 30 days</span>
            <span class="stage-stat-value">
              {{ isLoading ? "..." : dashboard.nextThirtyDaysCount }}
            </span>
            <p class="mt-2 text-sm stage-muted">Visible event rows on this theater board.</p>
          </div>
          <div class="stage-stat bg-[rgba(234,165,66,0.18)]">
            <span class="stage-overline">Review queue</span>
            <span class="stage-stat-value">
              {{ isLoading ? "..." : dashboard.pendingReviewCount }}
            </span>
            <p class="mt-2 text-sm stage-muted">Pending items when your role allows oversight.</p>
          </div>
        </div>
      </div>
    </template>

    <div class="grid gap-4 xl:grid-cols-2">
      <article class="border-2 border-(--stage-ink) bg-[rgba(234,165,66,0.18)] p-4">
        <p class="stage-overline">Up next show</p>
        <template v-if="isLoading">
          <div class="mt-3 space-y-3">
            <div class="h-8 w-3/4 animate-pulse rounded bg-[rgba(43,41,38,0.12)]" />
            <div class="h-4 w-32 animate-pulse rounded bg-[rgba(43,41,38,0.12)]" />
            <div class="h-4 w-full animate-pulse rounded bg-[rgba(43,41,38,0.08)]" />
          </div>
        </template>
        <template v-else-if="dashboard.upNextShow">
          <h3 class="mt-3 font-display text-3xl uppercase tracking-[0.06em]">
            {{ dashboard.upNextShow.show.title }}
          </h3>
          <p class="mt-3 text-sm font-semibold text-(--stage-ink)">
            {{ formatDateTime(dashboard.upNextShow.startsAt) }}
          </p>
          <p class="mt-2 text-sm stage-muted">
            {{ dashboard.upNextShow.show.description || "Next visible show programming for this theater." }}
          </p>
        </template>
        <p v-else class="mt-3 text-sm stage-muted">
          No visible show is scheduled yet.
        </p>
      </article>

      <article class="border-2 border-(--stage-ink) bg-[rgba(130,191,182,0.2)] p-4">
        <p class="stage-overline">Up next other event</p>
        <template v-if="isLoading">
          <div class="mt-3 space-y-3">
            <div class="h-8 w-3/4 animate-pulse rounded bg-[rgba(43,41,38,0.12)]" />
            <div class="h-4 w-32 animate-pulse rounded bg-[rgba(43,41,38,0.12)]" />
            <div class="h-4 w-full animate-pulse rounded bg-[rgba(43,41,38,0.08)]" />
          </div>
        </template>
        <template v-else-if="dashboard.upNextOtherEvent">
          <h3 class="mt-3 font-display text-3xl uppercase tracking-[0.06em]">
            {{ dashboard.upNextOtherEvent.show.title }}
          </h3>
          <p class="mt-3 text-sm font-semibold text-(--stage-ink)">
            {{ formatDateTime(dashboard.upNextOtherEvent.startsAt) }}
          </p>
          <p class="mt-2 text-sm stage-muted">
            {{ dashboard.upNextOtherEvent.show.description || "Next visible non-show programming for this theater." }}
          </p>
        </template>
        <p v-else class="mt-3 text-sm stage-muted">
          No non-show event is scheduled yet.
        </p>
      </article>
    </div>

    <div class="mt-5 flex flex-wrap gap-2">
      <StageButton variant="ghost" tone="theater" :to="`/theaters/${entry.theater.slug}`">
        Open theater
      </StageButton>
      <StageButton
        variant="ghost"
        tone="event"
        :to="`/theaters/${entry.theater.slug}/calendar`"
        icon="i-heroicons-calendar-days"
      >
        Full calendar
      </StageButton>
      <StageButton
        v-if="entry.permissions.canCreateShow"
        variant="ghost"
        tone="event"
        :to="`/theaters/${entry.theater.slug}/shows/new`"
        icon="i-heroicons-plus"
      >
        Create event
      </StageButton>
      <StageButton
        v-if="entry.permissions.canReview"
        variant="ghost"
        tone="theater"
        :to="`/theaters/${entry.theater.slug}/admin`"
        icon="i-heroicons-shield-check"
      >
        Theater admin
      </StageButton>
      <StageButton
        variant="ghost"
        tone="neutral"
        icon="i-heroicons-home"
        @click="removeHome"
      >
        Remove home
      </StageButton>
    </div>
  </UCard>
</template>
