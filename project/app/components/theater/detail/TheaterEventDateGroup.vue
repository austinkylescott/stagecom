<script setup lang="ts">
import type { TheaterDetails } from "~/composables/useTheaterDetails";

type PublicEvent = TheaterDetails["shows"]["public"][number];

defineProps<{
  slug: string;
  theaterName?: string | null;
  group: {
    dateKey: string;
    dateLabel: string;
    items: PublicEvent[];
  };
  formatDateTime: (value: string | null) => string;
  eventTypeLabel: (value: PublicEvent["eventType"]) => string;
  eventToneClass: (event: PublicEvent) => string;
  producerLabel: (event: PublicEvent) => string;
  castLabel: (event: PublicEvent) => string;
}>();
</script>

<template>
  <UCard
    :ui="{
      root: 'stage-list-card rounded-none',
      body: 'p-4 sm:p-5',
    }"
  >
    <div class="grid gap-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-start">
      <div
        class="border-2 border-(--stage-ink) bg-[rgba(251,247,239,0.78)] px-3 py-3 text-center"
      >
        <p class="stage-overline">Date</p>
        <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
          {{ group.dateLabel }}
        </p>
      </div>

      <div class="min-w-0 divide-y-2 divide-[rgba(43,41,38,0.12)]">
        <article
          v-for="(event, index) in group.items"
          :key="event.id"
          class="transition-transform hover:translate-x-px hover:translate-y-px"
          :class="index === 0 ? 'pb-1' : 'pt-4 pb-1'"
        >
          <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="stage-chip" :class="eventToneClass(event)">
                  {{ eventTypeLabel(event.eventType) }}
                </span>
                <span class="stage-chip bg-[rgba(251,247,239,0.84)]">
                  {{ formatDateTime(event.startsAt) }}
                </span>
              </div>

              <NuxtLink
                :to="`/theaters/${slug}/shows/${event.id}`"
                class="mt-3 block"
              >
                <h3 class="font-display text-3xl uppercase leading-[0.94] tracking-[0.06em]">
                  {{ event.title }}
                </h3>
              </NuxtLink>
              <p class="mt-3 text-sm leading-7 stage-muted">
                {{
                  event.description ||
                  `Upcoming ${eventTypeLabel(event.eventType).toLowerCase()} at ${theaterName || "this theater"}.`
                }}
              </p>

              <div
                class="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm leading-6 text-[rgba(43,41,38,0.78)]"
              >
                <span>
                  <span class="font-semibold text-(--stage-ink)">Producer:</span>
                  {{ producerLabel(event) }}
                </span>
                <span v-if="event.eventType === 'show'">
                  <span class="font-semibold text-(--stage-ink)">Cast:</span>
                  {{ castLabel(event) }}
                </span>
              </div>
            </div>

            <div class="flex items-start lg:justify-end">
              <StageButton
                size="xs"
                variant="ghost"
                tone="neutral"
                :to="`/theaters/${slug}/shows/${event.id}`"
              >
                Open event
              </StageButton>
            </div>
          </div>
        </article>
      </div>
    </div>
  </UCard>
</template>
