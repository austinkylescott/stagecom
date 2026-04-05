<script setup lang="ts">
withDefaults(
  defineProps<{
    outerClass?: string;
    innerClass?: string;
    overline: string;
    title: string;
    description?: string;
    descriptionClass?: string;
    overlineClass?: string;
  }>(),
  {
    outerClass: "border-b-3 border-(--stage-ink) bg-(--stage-cream)",
    innerClass: "mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8",
    description: undefined,
    descriptionClass: undefined,
    overlineClass: undefined,
  },
);
</script>

<template>
  <StageSection :outer-class="outerClass" :inner-class="innerClass">
    <div class="space-y-5">
      <StageSectionHeader
        :overline="overline"
        :title="title"
        :description="description"
        :description-class="descriptionClass"
        :overline-class="overlineClass"
      >
        <template v-if="$slots.actions" #actions>
          <slot name="actions" />
        </template>
      </StageSectionHeader>

      <slot />
    </div>
  </StageSection>
</template>
