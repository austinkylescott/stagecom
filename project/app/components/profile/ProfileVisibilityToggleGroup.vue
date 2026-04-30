<script setup lang="ts">
import { computed } from "vue";
import type { ProfileVisibility } from "~~/shared/profile";

type VisibilityPreset = ProfileVisibility | "custom";

const model = defineModel<ProfileVisibility>({ required: true });

const props = withDefaults(defineProps<{
  disabled?: boolean;
  mode?: "compact" | "expanded";
  showCustom?: boolean;
  customActive?: boolean;
}>(), {
  mode: "compact",
  showCustom: false,
  customActive: false,
});

const emit = defineEmits<{
  selectCustom: [];
}>();

const options = [
  {
    value: "public",
    label: "Public",
    tooltip: "Visible to anyone",
    description: "People across Stagecom can encounter this.",
    icon: "i-lucide-globe",
    color: "primary",
  },
  {
    value: "theater_only",
    label: "Theater only",
    tooltip: "Visible to shared theater members",
    description: "Only people who share a theater with you can encounter this.",
    icon: "i-lucide-users",
    color: "warning",
  },
  {
    value: "private",
    label: "Private",
    tooltip: "Visible only to you",
    description: "Only you can see this. You remain fully functional in the app.",
    icon: "i-lucide-lock",
    color: "neutral",
  },
] as const satisfies Array<{
  value: ProfileVisibility;
  label: string;
  tooltip: string;
  description: string;
  icon: string;
  color: "primary" | "warning" | "neutral";
}>;

const expandedOptions = computed(() =>
  props.showCustom
    ? [
        ...options,
        {
          value: "custom" as const,
          label: "Custom",
          tooltip: "Keep your field-level mix",
          description: "Your field toggles are mixed. Choose another option to sync them.",
          icon: "i-lucide-sliders-horizontal",
          color: "neutral" as const,
        },
      ]
    : options,
);

const isActive = (value: VisibilityPreset) =>
  value === "custom" ? props.customActive : model.value === value;

const selectOption = (value: VisibilityPreset) => {
  if (value === "custom") {
    emit("selectCustom");
    return;
  }

  model.value = value;
};
</script>

<template>
  <div
    v-if="props.mode === 'expanded'"
    class="grid gap-2 md:grid-cols-4"
  >
    <UButton
      v-for="option in expandedOptions"
      :key="option.value"
      type="button"
      :title="option.tooltip"
      :icon="option.icon"
      :color="option.color"
      :variant="isActive(option.value) ? 'solid' : 'outline'"
      size="lg"
      class="min-h-20 justify-start px-4 py-3 text-left"
      :disabled="disabled"
      :aria-pressed="isActive(option.value)"
      @click="selectOption(option.value)"
    >
      <div class="space-y-1">
        <p class="text-sm font-semibold uppercase tracking-[0.16em]">
          {{ option.label }}
        </p>
        <p class="text-xs leading-5 opacity-90">
          {{ option.description }}
        </p>
      </div>
    </UButton>
  </div>

  <UFieldGroup
    v-else
    class="w-auto rounded-none border-2 border-(--stage-ink)"
  >
    <UButton
      v-for="option in options"
      :key="option.value"
      type="button"
      :aria-label="option.label"
      :title="option.tooltip"
      :icon="option.icon"
      :color="option.color"
      :variant="model === option.value ? 'solid' : 'outline'"
      size="sm"
      class="-ml-[2px] min-h-11 min-w-11 justify-center first:ml-0"
      :disabled="disabled"
      :aria-pressed="model === option.value"
      @click="model = option.value"
    />
  </UFieldGroup>
</template>
