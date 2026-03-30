<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  badge?: string;
}>();
</script>

<template>
  <div class="relative">
    <div class="absolute -right-4 -top-4 size-full border-4 border-[var(--stage-ink)] bg-[var(--stage-performer)]" />
    <div class="absolute -right-2 -top-2 size-full border-4 border-[var(--stage-ink)] bg-[var(--stage-theater)]" />

    <div class="relative border-4 border-[var(--stage-ink)] bg-[var(--stage-cream)] p-6 md:p-8">
      <div class="mb-6 flex items-center justify-between border-b-2 border-[var(--stage-ink)] pb-4">
        <div class="flex items-center gap-3">
          <slot name="icon">
            <div class="size-10 border-2 border-[var(--stage-ink)] bg-[var(--stage-event)]" />
          </slot>
          <div>
            <div class="font-bold text-[var(--stage-ink)]">{{ title }}</div>
            <div class="text-sm stage-muted">{{ subtitle }}</div>
          </div>
        </div>

        <slot name="badge">
          <span
            v-if="badge"
            class="border-2 border-[var(--stage-ink)] bg-[var(--stage-theater)] px-2 py-1 text-xs font-bold uppercase text-[var(--stage-ink)]"
          >
            {{ badge }}
          </span>
        </slot>
      </div>

      <slot />
    </div>

    <slot name="left-callout" />
    <slot name="right-callout" />
  </div>
</template>
