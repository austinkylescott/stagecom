<script setup lang="ts">
import type { TheaterDetails } from "~/composables/useTheaterDetails";

type TheaterShow = TheaterDetails["shows"]["public"][number];

const props = defineProps<{
  slug: string;
  show: TheaterShow;
  theaterName?: string | null;
  artworkToneClass: string;
  formatDate: (value: string | null) => string;
  formatTime: (value: string | null) => string;
  producerLabel: (event: TheaterShow) => string;
  castLabel: (event: TheaterShow) => string;
}>();

const showPath = computed(() => `/theaters/${props.slug}/shows/${props.show.id}`);
</script>

<template>
  <UCard
    class="h-full transition-transform hover:translate-x-px hover:translate-y-px"
    :ui="{
      root: 'stage-list-card h-full rounded-none',
      body: 'h-full p-4 sm:p-5',
    }"
  >
    <div class="flex h-full items-stretch gap-3 sm:gap-4">
      <div class="shrink-0 self-stretch">
        <div
          class="relative aspect-1080/1350 h-full w-24 overflow-hidden border-2 border-(--stage-ink) text-(--stage-cream) sm:w-28"
          :class="artworkToneClass"
        >
          <div
            class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,247,239,0.24),transparent_38%),linear-gradient(180deg,transparent,rgba(43,41,38,0.34))]"
          />
          <div class="relative flex h-full flex-col justify-between p-2">
            <span
              class="text-[8px] font-black uppercase tracking-[0.18em] text-[rgba(251,247,239,0.82)]"
            >
              Show
            </span>
          </div>
        </div>
      </div>

      <div class="flex min-w-0 flex-1 flex-col">
        <div class="flex flex-wrap items-center gap-2">
          <span class="stage-chip bg-(--stage-event)">
            {{ formatDate(show.startsAt) }}
          </span>
          <span class="stage-chip bg-[rgba(251,247,239,0.84)]">
            {{ formatTime(show.startsAt) }}
          </span>
        </div>

        <NuxtLink :to="showPath" class="mt-3 block">
          <h3 class="font-display text-3xl uppercase leading-[0.94] tracking-[0.06em]">
            {{ show.title }}
          </h3>
        </NuxtLink>
        <p class="mt-3 text-sm leading-7 stage-muted">
          {{
            show.description ||
            `Upcoming show at ${theaterName || "this theater"}.`
          }}
        </p>

        <div class="mt-4 space-y-3 text-sm leading-6 text-[rgba(43,41,38,0.78)]">
          <p>
            <span class="font-semibold text-(--stage-ink)">Producer:</span>
            {{ producerLabel(show) }}
          </p>
          <div>
            <span class="font-semibold text-(--stage-ink)">Cast:</span>
            <span class="ml-1">{{ castLabel(show) }}</span>
          </div>
        </div>

        <div class="mt-auto pt-5">
          <StageButton
            size="xs"
            variant="ghost"
            tone="neutral"
            :to="showPath"
          >
            Open show
          </StageButton>
        </div>
      </div>
    </div>
  </UCard>
</template>
