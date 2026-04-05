<script setup lang="ts">
defineProps<{
  eventToneClass: string;
  eventTypeLabel: string;
  dateTimeLabel: string;
}>();
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span class="stage-chip" :class="eventToneClass">
      {{ eventTypeLabel }}
    </span>
    <span class="stage-chip bg-transparent">
      {{ dateTimeLabel }}
    </span>
  </div>
</template>
