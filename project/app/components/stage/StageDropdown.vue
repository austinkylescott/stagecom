<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const open = defineModel<boolean>("open", { default: false });

const props = withDefaults(defineProps<{
  items: DropdownMenuItem[][];
  content?: {
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
  };
  widthClass?: string;
  headerToneClass?: string;
  ui?: Record<string, string>;
}>(), {
  content: () => ({ side: "bottom", align: "end", sideOffset: 8 }),
  widthClass: "w-80",
  headerToneClass: "bg-(--stage-ink)",
  ui: () => ({}),
});

const resolvedUi = computed(() => ({
  ...props.ui,
  content: [props.widthClass, props.ui.content].filter(Boolean).join(" "),
}));
</script>

<template>
  <UDropdownMenu
    v-model:open="open"
    :items="items"
    :content="content"
    :ui="resolvedUi"
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
