<script setup lang="ts">
withDefaults(
  defineProps<{
    overline: string;
    title: string;
    description?: string;
    descriptionClass?: string;
    overlineClass?: string;
    titleClass?: string;
  }>(),
  {
    description: undefined,
    descriptionClass: "max-w-3xl",
    overlineClass: "",
    titleClass: "",
  },
);
</script>

<template>
  <div class="flex flex-wrap items-end justify-between gap-3">
    <div class="min-w-0">
      <p class="stage-overline" :class="overlineClass">
        {{ overline }}
      </p>
      <h2
        class="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-(--stage-ink)"
        :class="titleClass"
      >
        {{ title }}
      </h2>
      <p
        v-if="description"
        class="mt-2 text-sm leading-7 stage-muted"
        :class="descriptionClass"
      >
        {{ description }}
      </p>
    </div>

    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
