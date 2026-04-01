<script setup lang="ts">
import {
  useInviteCast,
  usePatchCast,
  useRequestCast,
} from "~/composables/useShowDetail";
import { useShowCast, type ShowCastMember } from "~/composables/useShowCast";

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
  cast: ShowCastMember[];
  viewerCast: ShowCastMember | null;
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
const programOrderDrafts = reactive<Record<string, number | null>>({});

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
  action:
    | "accept"
    | "approve"
    | "decline"
    | "withdraw"
    | "remove"
    | "set_program_order",
  targetUserId?: string,
  programOrder?: number | null,
) => {
  await patchCast({ action, targetUserId, programOrder });
  await props.refreshShow?.();
};

const getProgramOrderDraft = (member: ShowCastMember) => {
  if (!(member.userId in programOrderDrafts)) {
    programOrderDrafts[member.userId] = member.programOrder;
  }

  return programOrderDrafts[member.userId];
};

const setProgramOrderDraft = (member: ShowCastMember, value: string | number) => {
  const normalized = typeof value === "string" ? value.trim() : String(value);

  if (normalized === "") {
    programOrderDrafts[member.userId] = null;
    return;
  }

  const parsed = Number(normalized);
  programOrderDrafts[member.userId] = Number.isFinite(parsed) ? parsed : null;
};

const saveProgramOrder = async (member: ShowCastMember) => {
  await handlePatch(
    "set_program_order",
    member.userId,
    getProgramOrderDraft(member),
  );
};

const inactiveStatusLabel = (member: ShowCastMember) => {
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
      <ShowCastProducerList :producers="sortedProducers" />

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

    <ShowCastMemberSection title="Confirmed" :members="accepted">
      <template #actions="{ member }">
        <div v-if="isProducer" class="flex items-center gap-2">
          <UInput
            size="xs"
            type="number"
            min="1"
            class="w-20"
            :model-value="getProgramOrderDraft(member) ?? ''"
            @update:model-value="setProgramOrderDraft(member, $event)"
          />
          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            :loading="patching"
            @click="saveProgramOrder(member)"
          >
            Save slot
          </UButton>
        </div>
        <UButton
          v-if="member.userId === myUserId"
          size="xs"
          color="neutral"
          variant="ghost"
          :loading="patching"
          @click="handlePatch('withdraw')"
        >
          Withdraw
        </UButton>
        <UButton
          v-if="isProducer"
          size="xs"
          color="error"
          variant="ghost"
          :loading="patching"
          @click="handlePatch('remove', member.userId)"
        >
          Remove
        </UButton>
      </template>
    </ShowCastMemberSection>

    <ShowCastMemberSection
      :title="isProducer ? 'Requests' : 'Pending requests'"
      :members="pendingRequests"
      badge-label="requested"
      badge-color="error"
    >
      <template #actions="{ member }">
        <template v-if="isProducer">
          <UButton
            size="xs"
            color="error"
            variant="soft"
            :loading="patching"
            @click="handlePatch('approve', member.userId)"
          >
            Approve
          </UButton>
          <UButton
            size="xs"
            color="error"
            variant="ghost"
            :loading="patching"
            @click="handlePatch('remove', member.userId)"
          >
            Remove
          </UButton>
        </template>
      </template>
    </ShowCastMemberSection>

    <ShowCastMemberSection
      title="Pending invites"
      :members="pendingInvites"
      badge-label="pending"
      badge-color="warning"
    >
      <template #actions="{ member }">
        <template v-if="isProducer">
          <UButton
            size="xs"
            color="error"
            variant="ghost"
            :loading="patching"
            @click="handlePatch('remove', member.userId)"
          >
            Remove
          </UButton>
        </template>
      </template>
    </ShowCastMemberSection>

    <div
      v-if="myCast?.status === 'pending' && myCast.source === 'invited'"
      class="space-y-2 border-2 border-(--stage-ink) bg-[rgba(231,180,55,0.18)] px-4 py-3"
    >
      <p class="text-sm font-medium text-(--stage-ink)">
        You have a pending invite for this show.
      </p>
      <div class="flex gap-2">
        <UButton
          size="xs"
          color="warning"
          :loading="patching"
          @click="handlePatch('accept')"
        >
          Accept
        </UButton>
        <UButton
          size="xs"
          color="neutral"
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
      class="space-y-2 border-2 border-(--stage-ink) bg-[rgba(191,77,70,0.14)] px-4 py-3"
    >
      <p class="text-sm font-medium text-(--stage-ink)">
        This show is open for cast requests.
      </p>
      <p v-if="hasPendingRequest" class="text-sm stage-muted">
        Your request to join is pending review.
      </p>
      <UButton
        v-if="canShowRequestButton"
        size="sm"
        color="error"
        :loading="requesting"
        @click="submitRequest"
      >
        {{ myCast ? "Request again" : "Request to join" }}
      </UButton>
    </div>

    <ShowCastInactiveSection
      v-if="isProducer"
      :members="inactive"
      :inviting="inviting"
      :inactive-status-label="inactiveStatusLabel"
      @invite="inviteUser"
    />

    <ShowCastInviteSearchPanel
      v-if="isProducer"
      :theater-id="theaterId"
      :cast="cast"
      :viewer-cast="viewerCast"
      :inviting="inviting"
      @invite="inviteUser"
    />
  </div>
</template>
