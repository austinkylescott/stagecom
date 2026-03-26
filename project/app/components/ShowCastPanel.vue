<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import type { Enums } from "~/types/database.types";
import {
  useInviteCast,
  usePatchCast,
  useRequestCast,
} from "~/composables/useShowDetail";
import { useShowCast } from "~/composables/useShowCast";
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

type Producer = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
};

const props = defineProps<{
  showId: string;
  theaterId: string;
  theaterSlug: string;
  producers: Producer[];
  cast: CastMember[];
  viewerCast: CastMember | null;
  isProducer: boolean;
  canRequestToJoin: boolean;
  canSeePendingCast: boolean;
  viewerCastResolved: boolean;
  refreshShow?: () => Promise<unknown> | unknown;
}>();

const showId = computed(() => props.showId);
const { mutateAsync: invite, isLoading: inviting } = useInviteCast(showId);
const { mutateAsync: requestCast, isLoading: requesting } = useRequestCast(showId);
const { mutateAsync: patchCast, isLoading: patching } = usePatchCast(showId);

const sortMode = ref<"status" | "name">("status");

const compareByName = (a: { displayName: string | null; userId: string }, b: {
  displayName: string | null;
  userId: string;
}) =>
  (a.displayName ?? a.userId).localeCompare(b.displayName ?? b.userId);

const sortedProducers = computed(() =>
  props.producers.slice().sort(compareByName),
);
const showCast = useShowCast({
  cast: computed(() => props.cast),
  viewerCast: computed(() => props.viewerCast),
  canSeePendingCast: computed(() => props.canSeePendingCast),
  sortMode,
});
const accepted = showCast.confirmedCast;
const pendingRequests = showCast.pendingRequests;
const pendingInvites = showCast.pendingInvites;
const inactive = showCast.inactiveCast;

const user = useSupabaseUser();
const myUserId = computed(() => user.value?.id);
const serverMyCast = computed(() =>
  props.viewerCast ?? props.cast.find((c) => c.userId === myUserId.value),
);
const localRequestPending = ref(false);
const myCast = computed(() => {
  if (serverMyCast.value) {
    return serverMyCast.value;
  }

  if (!localRequestPending.value || !myUserId.value) {
    return undefined;
  }

  return {
    userId: myUserId.value,
    source: "requested" as const,
    status: "pending" as const,
    programOrder: null,
    note: null,
    displayName: null,
    avatarUrl: null,
  };
});
const canSubmitRequest = computed(() => {
  if (!myCast.value) return true;
  return ["declined", "withdrawn"].includes(myCast.value.status);
});
const hasPendingRequest = computed(
  () =>
    localRequestPending.value ||
    (myCast.value?.status === "pending" && myCast.value.source === "requested"),
);
const canShowRequestPanel = computed(
  () => !props.isProducer && props.canRequestToJoin,
);
const canShowRequestButton = computed(
  () => props.viewerCastResolved && canSubmitRequest.value && !hasPendingRequest.value,
);

watch(
  serverMyCast,
  (member) => {
    if (member?.status === "pending" && member.source === "requested") {
      localRequestPending.value = false;
      return;
    }

    if (member && !["declined", "withdrawn"].includes(member.status)) {
      localRequestPending.value = false;
    }
  },
  { immediate: true },
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
      [...props.cast, ...(props.viewerCast ? [props.viewerCast] : [])]
        .filter((c) => c.status === "pending" || c.status === "accepted")
        .map((c) => c.userId),
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
  await props.refreshShow?.();
};

const submitRequest = async () => {
  localRequestPending.value = true;

  try {
    await requestCast();
  } catch (error: any) {
    const status =
      error?.statusCode ?? error?.status ?? error?.response?.status;
    const message =
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      "";

    if (
      status === 409 &&
      typeof message === "string" &&
      message.includes("active cast entry")
    ) {
      return;
    }

    localRequestPending.value = false;
    throw error;
  } finally {
    await props.refreshShow?.();
  }
};

const handlePatch = async (
  action: "accept" | "approve" | "decline" | "withdraw" | "remove",
  targetUserId?: string,
) => {
  await patchCast({ action, targetUserId });
  await props.refreshShow?.();
};

const inactiveStatusLabel = (member: CastMember) => {
  if (member.status === "declined") return "Declined by performer";
  if (member.status === "withdrawn") {
    return member.source === "requested"
      ? "Request withdrawn by performer"
      : "Withdrew from cast";
  }
  return "Removed by producer";
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div v-if="sortedProducers.length" class="space-y-2">
        <p class="text-sm font-semibold text-slate-700">
          Producer{{ sortedProducers.length > 1 ? "s" : "" }}
        </p>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="producer in sortedProducers"
            :key="producer.userId"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"
          >
            <UAvatar :text="producer.displayName?.[0] ?? '?'" size="xs" />
            <span class="text-sm font-medium text-slate-700">
              {{ producer.displayName ?? producer.userId }}
            </span>
            <UBadge size="xs" color="gray" variant="soft">producer</UBadge>
          </div>
        </div>
      </div>

      <div
        v-if="isProducer"
        class="flex items-center gap-2"
      >
        <span class="text-xs font-medium uppercase tracking-wide text-slate-500">
          Sort
        </span>
        <USelect
          v-model="sortMode"
          size="sm"
          :items="[
            { label: 'By status', value: 'status' },
            { label: 'A-Z', value: 'name' },
          ]"
          class="min-w-32"
        />
      </div>
    </div>

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

    <div v-if="pendingRequests.length" class="space-y-2">
      <p class="text-sm font-semibold text-slate-700">
        {{ isProducer ? "Requests" : "Pending requests" }}
        ({{ pendingRequests.length }})
      </p>
      <div
        v-for="member in pendingRequests"
        :key="member.userId"
        class="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
      >
        <div class="flex items-center gap-2">
          <UAvatar :text="member.displayName?.[0] ?? '?'" size="xs" />
          <span class="text-sm">{{ member.displayName ?? member.userId }}</span>
          <UBadge size="xs" color="blue" variant="soft">requested</UBadge>
        </div>
        <div v-if="isProducer" class="flex gap-2">
          <UButton
            size="xs"
            color="primary"
            variant="soft"
            :loading="patching"
            @click="handlePatch('approve', member.userId)"
          >
            Approve
          </UButton>
          <UButton
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

    <div v-if="pendingInvites.length" class="space-y-2">
      <p class="text-sm font-semibold text-slate-700">
        Pending invites ({{ pendingInvites.length }})
      </p>
      <div
        v-for="member in pendingInvites"
        :key="member.userId"
        class="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
      >
        <div class="flex items-center gap-2">
          <UAvatar :text="member.displayName?.[0] ?? '?'" size="xs" />
          <span class="text-sm">{{ member.displayName ?? member.userId }}</span>
          <UBadge size="xs" color="orange" variant="soft">pending</UBadge>
        </div>
        <div v-if="isProducer" class="flex gap-2">
          <UButton
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
      v-if="myCast?.status === 'pending' && myCast.source === 'invited'"
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

    <div
      v-if="canShowRequestPanel"
      class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 space-y-2"
    >
      <p class="text-sm font-medium text-blue-800">
        This show is open for cast requests.
      </p>
      <p v-if="hasPendingRequest" class="text-sm text-blue-700">
        Your request to join is pending review.
      </p>
      <UButton
        v-if="canShowRequestButton"
        size="sm"
        color="primary"
        :loading="requesting"
        @click="submitRequest"
      >
        {{ myCast ? "Request again" : "Request to join" }}
      </UButton>
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
            class="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
          >
            <div class="flex items-center gap-2 min-w-0">
              <UAvatar :text="member.displayName?.[0] ?? '?'" size="xs" />
              <div class="min-w-0">
                <p class="text-sm text-slate-700">
                  {{ member.displayName ?? member.userId }}
                </p>
                <p class="text-xs text-slate-500">
                  {{ inactiveStatusLabel(member) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <UBadge size="xs" color="gray" variant="soft">{{
                member.status
              }}</UBadge>
              <UButton
                size="xs"
                color="primary"
                variant="soft"
                :loading="inviting"
                @click="inviteUser(member.userId)"
              >
                Invite again
              </UButton>
            </div>
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
