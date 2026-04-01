<script setup lang="ts">
import type { ShowCastMember } from "~/composables/useShowCast";

defineProps<{
  title: string;
  members: ShowCastMember[];
  badgeLabel?: string;
  badgeColor?: "neutral" | "warning" | "primary" | "error";
}>();
</script>

<template>
  <div v-if="members.length" class="space-y-2">
    <p class="text-sm font-semibold text-(--stage-ink)">
      {{ title }} ({{ members.length }})
    </p>
    <div
      v-for="member in members"
      :key="member.userId"
      class="flex items-center justify-between border-2 border-(--stage-ink) bg-(--stage-cream) px-3 py-2"
    >
      <div class="flex items-center gap-2">
        <UAvatar :text="member.displayName?.[0] ?? '?'" size="xs" />
        <span class="text-sm font-medium">
          {{ member.displayName ?? member.userId }}
        </span>
        <UBadge
          v-if="badgeLabel"
          size="xs"
          :color="badgeColor ?? 'gray'"
          variant="soft"
        >
          {{ badgeLabel }}
        </UBadge>
      </div>
      <div class="flex gap-2">
        <slot name="actions" :member="member" />
      </div>
    </div>
  </div>
</template>
