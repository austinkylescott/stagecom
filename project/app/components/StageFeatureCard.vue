<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  tone: string;
  as?: string;
}>();
</script>

<template>
  <component
    :is="as || 'article'"
    class="stage-article-card"
  >
    <div class="border-b-4 border-[var(--stage-ink)] px-4 py-3" :class="tone">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="font-bold text-[var(--stage-ink)]">{{ title }}</h3>
          <p class="text-sm text-[rgba(43,41,38,0.7)]">{{ subtitle }}</p>
        </div>
        <slot name="header-aside">
          <span class="text-xl text-[rgba(43,41,38,0.55)]">⋯</span>
        </slot>
      </div>
    </div>

    <div class="p-4 text-[var(--stage-ink)]">
      <slot />
    </div>
  </component>
</template>
