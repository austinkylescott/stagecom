<script setup lang="ts">
import type { TheaterPresentedEvent } from "~/composables/useTheaterPublicEvents";
import TheaterEventHeaderChips from "~/components/theater/detail/TheaterEventHeaderChips.vue";
import TheaterEventSummary from "~/components/theater/detail/TheaterEventSummary.vue";
import TheaterPeopleSummary from "~/components/theater/detail/TheaterPeopleSummary.vue";

const props = withDefaults(
  defineProps<{
    sectionLabel: string;
    loading?: boolean;
    event: TheaterPresentedEvent | null;
    labelToneClass?: string;
    emphasizedEventTypeLabel?: string;
    posterSrc?: string | null;
    posterAlt?: string;
    artworkToneClass?: string;
    surfaceTone?: "theater" | "event" | "performer" | "paper";
    emptyTitle: string;
    emptyDescription: string;
    emptyCta: {
      label: string;
      to: string;
      icon: string;
    };
  }>(),
  {
    loading: false,
    labelToneClass: "",
    emphasizedEventTypeLabel: undefined,
    posterSrc: null,
    posterAlt: undefined,
    artworkToneClass: undefined,
    surfaceTone: "theater",
  },
);

const actionLabel = computed(() => {
  if (!props.event) return props.emptyCta.label;
  return props.event.eventType === "show" ? "Open show" : "Open event";
});

const resolvedPosterAlt = computed(() => {
  if (props.posterAlt) return props.posterAlt;
  return props.event
    ? `${props.event.title} poster placeholder`
    : "Upcoming poster placeholder";
});

const resolvedEventTypeLabel = computed(() => {
  if (!props.event) return "";
  return props.emphasizedEventTypeLabel ?? props.event.eventTypeLabel;
});

const surfaceToneClass = computed(() => {
  switch (props.surfaceTone) {
    case "event":
      return "bg-stage-surface-event";
    case "performer":
      return "bg-stage-surface-performer";
    case "paper":
      return "bg-stage-surface-paper";
    case "theater":
    default:
      return "bg-stage-surface-theater";
  }
});
</script>

<template>
  <article
    class="flex min-h-56 h-full flex-col border-2 border-(--stage-ink) px-4 py-4 sm:px-5"
    :class="surfaceToneClass"
  >
    <template v-if="event && (posterSrc || artworkToneClass)">
      <div class="grid h-full grid-cols-[clamp(7.5rem,28%,9.5rem)_minmax(0,1fr)] grid-rows-[auto_auto_auto_1fr] gap-x-4 gap-y-4">
        <div class="col-start-2 row-start-1">
          <TheaterEventHeaderChips
            :event-tone-class="labelToneClass || event.eventToneClass"
            :event-type-label="resolvedEventTypeLabel"
            :date-time-label="event.dateTimeLabel"
          />
        </div>

        <div class="col-start-1 row-start-2 row-end-5 self-start">
          <div
            class="relative w-full max-w-full overflow-hidden border-2 border-(--stage-ink) bg-(--stage-paper-strong)"
            :class="[posterSrc ? '' : artworkToneClass]"
            style="aspect-ratio: 1080 / 1350;"
          >
            <img
              v-if="posterSrc"
              :src="posterSrc"
              :alt="resolvedPosterAlt"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,247,239,0.24),transparent_38%),linear-gradient(180deg,transparent,rgba(43,41,38,0.34))]"
            />
            <div class="relative flex h-full flex-col justify-between p-2">
              <span
                class="text-[8px] font-black uppercase tracking-[0.18em]"
                :class="
                  posterSrc
                    ? 'text-stage-ink/70'
                    : 'text-stage-cream/80'
                "
              >
                {{ event.eventTypeLabel }}
              </span>
            </div>
            <div
              v-if="posterSrc"
              class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(43,41,38,0.02),rgba(43,41,38,0.26))]"
            />
          </div>
        </div>

        <div class="col-start-2 row-start-2 space-y-3">
          <NuxtLink :to="event.eventPath" class="block">
            <h2 class="font-display text-3xl uppercase leading-[0.94] tracking-[0.06em] text-(--stage-ink)">
              {{ event.title }}
            </h2>
          </NuxtLink>

          <p class="text-sm leading-7 text-stage-ink/80">
            {{ event.summaryDescription }}
          </p>
        </div>

        <div class="col-start-2 row-start-3 space-y-3 text-sm leading-6 text-stage-ink/80">
          <TheaterPeopleSummary
            label="Producer"
            :people="event.producers"
            empty-text="Producer unassigned"
            :overflow-after="1"
          />
          <TheaterPeopleSummary
            v-if="event.eventType === 'show'"
            label="Cast"
            :people="event.cast"
            empty-text="No cast posted yet"
            :overflow-after="3"
          />
        </div>

        <div class="col-start-2 row-start-4 mt-auto border-t-2 border-stage-ink/15 pt-3">
          <StageButton
            size="xs"
            variant="ghost"
            tone="neutral"
            :to="event.eventPath"
          >
            {{ actionLabel }}
          </StageButton>
        </div>
      </div>
    </template>

    <template v-else-if="loading">
      <div class="space-y-3">
        <p class="stage-overline text-stage-ink/60">
          {{ sectionLabel }}
        </p>
        <div class="h-6 w-28 animate-pulse rounded bg-stage-surface-skeleton-strong" />
        <div class="h-10 w-3/4 animate-pulse rounded bg-stage-surface-skeleton-strong" />
        <div class="h-4 w-full animate-pulse rounded bg-stage-surface-skeleton-soft" />
        <div class="h-4 w-5/6 animate-pulse rounded bg-stage-surface-skeleton-soft" />
      </div>

      <div class="mt-auto border-t-2 border-stage-ink/15 pt-3">
        <div class="h-8 w-32 animate-pulse rounded bg-stage-surface-skeleton-strong" />
      </div>
    </template>

    <template v-else-if="event">
      <TheaterEventHeaderChips
        :event-tone-class="labelToneClass || event.eventToneClass"
        :event-type-label="resolvedEventTypeLabel"
        :date-time-label="event.dateTimeLabel"
      />

      <div class="mt-5 flex min-w-0 flex-1 flex-col gap-5">
        <TheaterEventSummary
          :event="event"
          :action-label="actionLabel"
          :show-cast="event.eventType === 'show'"
          title-tag="h2"
          title-class="font-display text-3xl uppercase leading-[0.94] tracking-[0.06em] text-(--stage-ink)"
          description-class="text-sm leading-7 text-stage-ink/80"
          meta-class="space-y-3 text-sm leading-6 text-stage-ink/80"
          action-wrapper-class="mt-auto border-t-2 border-stage-ink/15 pt-3"
        />
      </div>
    </template>

    <template v-else>
      <div class="space-y-3">
        <h2
          class="font-display text-3xl uppercase leading-[0.94] tracking-[0.06em] text-(--stage-ink)"
        >
          {{ emptyTitle }}
        </h2>
        <p class="text-sm leading-7 text-stage-ink/80">
          {{ emptyDescription }}
        </p>
      </div>

      <div class="mt-auto border-t-2 border-stage-ink/15 pt-3">
        <StageButton
          size="xs"
          variant="ghost"
          tone="neutral"
          :to="emptyCta.to"
          :icon="emptyCta.icon"
        >
          {{ emptyCta.label }}
        </StageButton>
      </div>
    </template>
  </article>
</template>
