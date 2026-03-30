<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: string;
    outerClass?: string;
    innerClass?: string;
  }>(),
  {
    as: "section",
    outerClass: "border-b-3 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.6)]",
    innerClass: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
  },
);
</script>

<template>
  <component :is="as" :class="outerClass">
    <div :class="innerClass">
      <slot />
    </div>
  </component>
</template>
