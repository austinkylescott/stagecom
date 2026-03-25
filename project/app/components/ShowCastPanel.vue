<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import type { Enums } from "~/types/database.types";
import { useInviteCast, usePatchCast } from "~/composables/useShowDetail";
import { usePerformers } from "~/composables/usePerformers";

type CastMember = {
  userId: string;
  source: Enums<"show_cast_source">;
  status: Enums<"show_cast_status">;
  programOrder: number | null;
  note: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

const props = defineProps<{
  showId: string;
  theaterId: string;
  theaterSlug: string;
  cast: CastMember[];
  isProducer: boolean;
}>();

const showId = computed(() => props.showId);
const { mutateAsync: invite, isLoading: inviting } = useInviteCast(showId);
const { mutateAsync: patchCast, isLoading: patching } = usePatchCast(showId);

const accepted = computed(() =>
  props.cast.filter((c) => c.status === "accepted"),
);
const pending = computed(() =>
  props.cast.filter((c) => c.status === "pending"),
);
const inactive = computed(() =>
  props.cast.filter((c) =>
    ["declined", "withdrawn", "removed"].includes(c.status),
  ),
);

const user = useSupabaseUser();
const myUserId = computed(() => user.value?.id);
const myCast = computed(() =>
  props.cast.find((c) => c.userId === myUserId.value),
);

const searchInput = ref("");
const search = ref("");
const page = ref(1);
const scopeAll = ref(false);

watchDebounced(
  searchInput,
  (v) => {
    search.value = v.trim();
    page.value = 1;
  },
  { debounce: 300, maxWait: 800 },
);

const theaterIdRef = computed(() =>
  scopeAll.value ? undefined : props.theaterId,
);

const { data: performerData, isLoading: searchLoading } = usePerformers({
  search,
  page,
  theaterId: theaterIdRef,
});

const alreadyCastIds = computed(
  () =>
    new Set(
      props.cast.filter((c) => c.status !== "removed").map((c) => c.userId),
    ),
);

const filteredResults = computed(() => {
  const profiles = performerData.value?.profiles ?? [];
  const memberships = performerData.value?.memberships ?? [];
  const memberSet = new Set(
    memberships
      .filter((m) => m.theater_id === props.theaterId)
      .map((m) => m.user_id),
  );

  return profiles.map((p) => ({
    ...p,
    isMember: memberSet.has(p.id),
    alreadyCast: alreadyCastIds.value.has(p.id),
  }));
});

const inviteUser = async (userId: string) => {
  await invite({ userId });
};

const handlePatch = async (
  action: "accept" | "decline" | "withdraw" | "remove",
  targetUserId?: string,
) => {
  await patchCast({ action, targetUserId });
};
</script>

<template>
  <div class="space-y-6">
    <div v-if="accepted.length" class="space-y-2">
      <p class="text-sm font-semibold text-slate-700">
        Confirmed ({{ accepted.length }})
      </p>
      <div
        v-for="member in accepted"
        :key="member.userId"
        class="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
      >
        <div class="flex items-center gap-2">
          <UAvatar :text="member.displayName?.[0] ?? '?'" size="xs" />
          <span class="text-sm font-medium">
            {{ member.displayName ?? member.userId }}
          </span>
        </div>
        <div class="flex gap-2">
          <UButton
            v-if="member.userId === myUserId"
            size="xs"
            color="gray"
            variant="ghost"
            :loading="patching"
            @click="handlePatch('withdraw')"
          >
            Withdraw
          </UButton>
          <UButton
            v-if="isProducer"
            size="xs"
            color="red"
            variant="ghost"
            :loading="patching"
            @click="handlePatch('remove', member.userId)"
          >
            Remove
          </UButton>
        </div>
      </div>
    </div>

    <div v-if="isProducer && pending.length" class="space-y-2">
      <p class="text-sm font-semibold text-slate-700">
        Pending ({{ pending.length }})
      </p>
      <div
        v-for="member in pending"
        :key="member.userId"
        class="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
      >
        <div class="flex items-center gap-2">
          <UAvatar :text="member.displayName?.[0] ?? '?'" size="xs" />
          <span class="text-sm">{{ member.displayName ?? member.userId }}</span>
          <UBadge size="xs" color="orange" variant="soft">pending</UBadge>
        </div>
        <div class="flex gap-2">
          <UButton
            v-if="isProducer"
            size="xs"
            color="red"
            variant="ghost"
            :loading="patching"
            @click="handlePatch('remove', member.userId)"
          >
            Remove
          </UButton>
        </div>
      </div>
    </div>

    <div
      v-if="myCast?.status === 'pending'"
      class="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 space-y-2"
    >
      <p class="text-sm font-medium text-orange-800">
        You have a pending invite for this show.
      </p>
      <div class="flex gap-2">
        <UButton
          size="xs"
          color="primary"
          :loading="patching"
          @click="handlePatch('accept')"
        >
          Accept
        </UButton>
        <UButton
          size="xs"
          color="gray"
          variant="ghost"
          :loading="patching"
          @click="handlePatch('decline')"
        >
          Decline
        </UButton>
      </div>
    </div>

    <UCollapsible v-if="isProducer && inactive.length">
      <UButton size="xs" variant="ghost" color="gray">
        Show declined / withdrawn / removed ({{ inactive.length }})
      </UButton>
      <template #content>
        <div class="space-y-1 mt-2">
          <div
            v-for="member in inactive"
            :key="member.userId"
            class="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-slate-500"
          >
            <span class="text-sm">{{
              member.displayName ?? member.userId
            }}</span>
            <UBadge size="xs" color="gray" variant="soft">{{
              member.status
            }}</UBadge>
          </div>
        </div>
      </template>
    </UCollapsible>

    <div v-if="isProducer" class="space-y-3 pt-4 border-t border-slate-200">
      <p class="text-sm font-semibold text-slate-700">Invite a performer</p>
      <div class="flex gap-2 flex-wrap items-center">
        <UInput
          v-model="searchInput"
          placeholder="Search by name..."
          icon="i-heroicons-magnifying-glass"
          class="flex-1 min-w-48"
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
            @click="inviteUser(profile.id)"
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
          <button class="underline text-blue-600" @click="scopeAll = true">
            Search all performers
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
