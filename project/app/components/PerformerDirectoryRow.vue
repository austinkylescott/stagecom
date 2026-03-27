<script setup lang="ts">
import type { PerformersResponse } from "~/queries/people";

type PerformerProfile = PerformersResponse["profiles"][number];

const props = defineProps<{
  performer: PerformerProfile;
  sharedTheaterCount: number;
}>();

const displayName = computed(
  () => props.performer.display_name?.trim() || "Unnamed performer",
);

const sharedTheaterLabel = computed(() => {
  const count = props.sharedTheaterCount;

  return `${count} shared theater${count === 1 ? "" : "s"}`;
});

const actionUi = {
  base: "rounded-full",
} as const;

const cardUi = {
  root: "h-full rounded-2xl",
  body: "space-y-4 p-4",
} as const;

const comingSoonText = "Feature coming soon";
</script>

<template>
  <UCard :ui="cardUi">
    <div class="flex min-w-0 items-start gap-3">
      <UAvatar
        :src="performer.avatar_url"
        :text="displayName[0] || 'P'"
        size="sm"
      />
      <div class="min-w-0 flex-1 space-y-2">
        <p class="truncate text-sm font-semibold text-slate-900">
          {{ displayName }}
        </p>
        <UBadge size="xs" color="primary" variant="soft">
          {{ sharedTheaterLabel }}
        </UBadge>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <UTooltip :text="comingSoonText">
        <span class="inline-flex">
          <UButton
            size="xs"
            color="primary"
            variant="soft"
            icon="i-heroicons-plus-circle"
            disabled
            :ui="actionUi"
          >
            Invite
          </UButton>
        </span>
      </UTooltip>
      <UTooltip :text="comingSoonText">
        <span class="inline-flex">
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-user-circle"
            disabled
            :ui="actionUi"
          >
            Profile
          </UButton>
        </span>
      </UTooltip>
    </div>
  </UCard>
</template>
