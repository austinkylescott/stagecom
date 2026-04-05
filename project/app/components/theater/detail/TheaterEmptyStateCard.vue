<script setup lang="ts">
defineProps<{
  overline: string;
  title: string;
  description: string;
}>();
</script>

<template>
  <div
    class="border-3 border-dashed border-(--stage-ink) bg-stage-surface-paper px-5 py-6"
  >
    <p class="stage-overline">{{ overline }}</p>
    <h2 class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
      {{ title }}
    </h2>
    <p class="mt-3 max-w-2xl text-sm leading-7 stage-muted">
      {{ description }}
    </p>

    <div v-if="$slots.actions" class="mt-5 flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
