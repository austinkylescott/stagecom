<script setup lang="ts">
import type { ShowCastMember } from "~/composables/useShowCast";

defineProps<{
  inviting: boolean;
  members: ShowCastMember[];
  inactiveStatusLabel: (member: ShowCastMember) => string;
}>();

const emit = defineEmits<{
  invite: [userId: string];
}>();
</script>

<template>
  <UCollapsible v-if="members.length">
    <UButton size="xs" variant="ghost" color="neutral">
      Show declined / withdrawn / removed ({{ members.length }})
    </UButton>
    <template #content>
      <div class="mt-2 space-y-1">
        <div
          v-for="member in members"
          :key="member.userId"
          class="flex items-center justify-between border-2 border-[var(--stage-ink)] bg-[var(--stage-cream)] px-3 py-2"
        >
          <div class="flex min-w-0 items-center gap-2">
            <UAvatar :text="member.displayName?.[0] ?? '?'" size="xs" />
            <div class="min-w-0">
              <p class="text-sm text-[var(--stage-ink)]">
                {{ member.displayName ?? member.userId }}
              </p>
              <p class="text-xs stage-muted">
                {{ inactiveStatusLabel(member) }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UBadge size="xs" color="neutral" variant="soft">
              {{ member.status }}
            </UBadge>
            <UButton
              size="xs"
              color="error"
              variant="soft"
              :loading="inviting"
              @click="emit('invite', member.userId)"
            >
              Invite again
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UCollapsible>
</template>
