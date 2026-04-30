<script setup lang="ts">
withDefaults(defineProps<{
  lines?: number;
  compact?: boolean;
}>(), {
  lines: 1,
  compact: false,
});
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="index in lines"
      :key="index"
      class="relative overflow-hidden border-2 border-(--stage-ink) bg-[repeating-linear-gradient(135deg,var(--stage-ink)_0_10px,var(--stage-paper-muted)_10px_20px)]"
      :class="compact ? 'h-5' : 'h-6'"
      :style="{
        width:
          lines === 1
            ? '100%'
            : index === lines
              ? '68%'
              : '100%',
      }"
    >
      <div class="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,rgba(245,239,226,0.45)_35%,transparent_70%)]" />
    </div>
  </div>
</template>
