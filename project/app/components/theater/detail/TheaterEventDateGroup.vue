<script setup lang="ts">
import type { TheaterPresentedEventGroup } from "~/composables/useTheaterPublicEvents";
import TheaterEventHeaderChips from "~/components/theater/detail/TheaterEventHeaderChips.vue";
import TheaterEventSummary from "~/components/theater/detail/TheaterEventSummary.vue";

defineProps<{
  group: TheaterPresentedEventGroup;
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
      <div class="border-2 border-(--stage-ink) px-3 py-3 text-center">
        <p class="stage-overline">Date</p>
        <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
          {{ group.dateLabel }}
        </p>
      </div>

      <div class="min-w-0 divide-y-2 divide-stage-ink/10">
        <article
          v-for="(event, index) in group.items"
          :key="event.occurrenceId"
          class="transition-transform hover:translate-x-px hover:translate-y-px"
          :class="index === 0 ? 'pb-1' : 'pt-4 pb-1'"
        >
          <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div class="min-w-0">
              <TheaterEventHeaderChips
                :event-tone-class="event.eventToneClass"
                :event-type-label="event.eventTypeLabel"
                :date-time-label="event.dateTimeLabel"
              />

              <div class="mt-3">
                <TheaterEventSummary
                  :event="event"
                  action-label="Open event"
                  :show-cast="event.eventType === 'show'"
                  meta-class="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm leading-6 text-stage-ink/80"
                  action-wrapper-class="hidden"
                />
              </div>
            </div>

            <div class="flex items-start lg:justify-end">
              <StageButton
                size="xs"
                variant="ghost"
                tone="neutral"
                :to="event.eventPath"
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
