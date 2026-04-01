<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const open = ref(false);

const props = withDefaults(defineProps<{
  items: DropdownMenuItem[][];
  content?: {
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
  };
  widthClass?: string;
  headerToneClass?: string;
}>(), {
  content: () => ({ side: "bottom", align: "end", sideOffset: 8 }),
  widthClass: "w-80",
  headerToneClass: "bg-(--stage-ink)",
});
</script>

<template>
  <UDropdownMenu
    v-model:open="open"
    :items="items"
    :content="content"
    :ui="{
      content: `${widthClass} rounded-none border-3 border-(--stage-ink) bg-(--stage-cream) p-0 shadow-[8px_8px_0_0_var(--stage-ink)]`,
      viewport: 'p-0',
      group: 'p-0',
      item: 'rounded-none border-b border-[rgba(43,41,38,0.12)] px-3 py-3 last:border-b-0 data-[highlighted]:bg-(--stage-paper-strong) data-[highlighted]:text-(--stage-ink)',
      itemLeadingIcon: 'size-4 text-(--stage-ink)',
      itemLabel: 'text-sm font-medium text-(--stage-ink)',
      itemDescription: 'mt-0.5 text-xs stage-muted',
      itemWrapper: 'gap-0'
    }"
  >
    <slot :open="open" />

    <template #content-top>
      <div
        class="flex items-center justify-between border-b-3 border-(--stage-ink) px-3 py-2 text-(--stage-ink)"
        :class="headerToneClass"
      >
        <slot name="header" />
        <slot name="header-actions" />
      </div>
    </template>

    <template #content-bottom>
      <slot name="content-bottom" />
    </template>

    <template #item-leading="slotProps">
      <slot name="item-leading" v-bind="slotProps" />
    </template>

    <template #item-label="slotProps">
      <slot name="item-label" v-bind="slotProps" />
    </template>

    <template #item-description="slotProps">
      <slot name="item-description" v-bind="slotProps" />
    </template>
  </UDropdownMenu>
</template>
