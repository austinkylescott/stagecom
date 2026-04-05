<script setup lang="ts">
import type { TheaterPresentedEvent } from "~/composables/useTheaterPublicEvents";
import TheaterPeopleSummary from "~/components/theater/detail/TheaterPeopleSummary.vue";

withDefaults(
  defineProps<{
    event: TheaterPresentedEvent;
    actionLabel: string;
    actionTo?: string;
    showCast?: boolean;
    titleTag?: string;
    titleClass?: string;
    descriptionClass?: string;
    metaClass?: string;
    actionWrapperClass?: string;
  }>(),
  {
    actionTo: undefined,
    showCast: false,
    titleTag: "h3",
    titleClass:
      "font-display text-3xl uppercase leading-[0.94] tracking-[0.06em]",
    descriptionClass: "text-sm leading-7 stage-muted",
    metaClass: "space-y-3 text-sm leading-6 text-stage-ink/80",
    actionWrapperClass: "border-t-2 border-stage-ink/15 pt-3",
  },
);
</script>

<template>
  <div class="space-y-3">
    <NuxtLink :to="event.eventPath" class="block">
      <component :is="titleTag" :class="titleClass">
        {{ event.title }}
      </component>
    </NuxtLink>

    <p :class="descriptionClass">
      {{ event.summaryDescription }}
    </p>
  </div>

  <div :class="metaClass">
    <TheaterPeopleSummary
      label="Producer"
      :people="event.producers"
      empty-text="Producer unassigned"
      :overflow-after="1"
    />
    <TheaterPeopleSummary
      v-if="showCast"
      label="Cast"
      :people="event.cast"
      empty-text="No cast posted yet"
      :overflow-after="3"
    />
  </div>

  <div :class="actionWrapperClass">
    <StageButton
      size="xs"
      variant="ghost"
      tone="neutral"
      :to="actionTo || event.eventPath"
    >
      {{ actionLabel }}
    </StageButton>
  </div>
</template>
