<script setup lang="ts">
import { computed } from "vue";
import { useShowCastInviteSearch } from "~/composables/useShowCastInviteSearch";
import type { ShowCastMember } from "~/composables/useShowCast";

const props = defineProps<{
  theaterId: string;
  cast: ShowCastMember[];
  viewerCast: ShowCastMember | null;
  inviting: boolean;
}>();

const emit = defineEmits<{
  invite: [userId: string];
}>();

const { filteredResults, scopeAll, search, searchInput, searchLoading } =
  useShowCastInviteSearch({
    theaterId: computed(() => props.theaterId),
    cast: computed(() => props.cast),
    viewerCast: computed(() => props.viewerCast),
  });
</script>

<template>
  <div class="space-y-3 border-t border-slate-200 pt-4">
    <p class="text-sm font-semibold text-slate-700">Invite a performer</p>
    <div class="flex flex-wrap items-center gap-2">
      <UInput
        v-model="searchInput"
        placeholder="Search by name..."
        icon="i-heroicons-magnifying-glass"
        class="min-w-48 flex-1"
      />
      <UButton
        size="sm"
        :color="!scopeAll ? 'primary' : 'gray'"
        :variant="!scopeAll ? 'soft' : 'ghost'"
        @click="scopeAll = false"
      >
        Theater members
      </UButton>
      <UButton
        size="sm"
        :color="scopeAll ? 'primary' : 'gray'"
        :variant="scopeAll ? 'soft' : 'ghost'"
        @click="scopeAll = true"
      >
        All performers
      </UButton>
    </div>

    <div v-if="searchLoading" class="text-sm text-slate-500">
      Searching...
    </div>
    <div v-else class="space-y-1">
      <div
        v-for="profile in filteredResults"
        :key="profile.id"
        class="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
      >
        <div class="flex items-center gap-2">
          <UAvatar :text="profile.display_name?.[0] ?? '?'" size="xs" />
          <span class="text-sm">{{ profile.display_name }}</span>
          <UBadge
            v-if="!profile.isMember"
            size="xs"
            color="gray"
            variant="soft"
          >
            not a member
          </UBadge>
        </div>
        <UButton
          size="xs"
          color="primary"
          :disabled="profile.alreadyCast || inviting"
          :loading="inviting"
          @click="emit('invite', profile.id)"
        >
          {{ profile.alreadyCast ? "Invited" : "Invite" }}
        </UButton>
      </div>
      <p
        v-if="!filteredResults.length && search"
        class="text-sm text-slate-500"
      >
        No results for "{{ search }}".
      </p>
      <p
        v-if="!scopeAll && !filteredResults.length && !search"
        class="text-sm text-slate-500"
      >
        No theater members yet.
        <button class="text-blue-600 underline" @click="scopeAll = true">
          Search all performers
        </button>
      </p>
    </div>
  </div>
</template>
