<script setup lang="ts">
import { useRequestHeaders } from "#app";
import StageFeatureCard from "~/components/StageFeatureCard.vue";
import {
  useShowDetail,
  useUpdateShowSettings,
  useUpdateShowStatus,
  type ShowDetailResponse,
} from "~/composables/useShowDetail";
import ShowCastPanel from "~/components/ShowCastPanel.vue";

const route = useRoute();
const slug = computed(() => route.params.slug as string);
const id = computed(() => route.params.id as string);

const { data: initialData } = await useAsyncData(
  () =>
    $fetch<ShowDetailResponse>(`/api/shows/${id.value}`, {
      headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
      credentials: "include",
    }),
  { server: true },
);

const { data, isLoading, error, refresh } = useShowDetail(id, initialData);
const user = useSupabaseUser();
const hasRefreshedAuthedDetail = ref(false);
const authDetailResolved = ref(import.meta.server);

watch(
  () => user.value?.id,
  async (userId) => {
    if (!import.meta.client) {
      return;
    }

    if (!userId) {
      authDetailResolved.value = true;
      return;
    }

    if (hasRefreshedAuthedDetail.value) {
      return;
    }

    hasRefreshedAuthedDetail.value = true;
    authDetailResolved.value = false;

    try {
      await refresh();
    } finally {
      authDetailResolved.value = true;
    }
  },
  { immediate: true },
);

const show = computed(() => data.value?.show ?? null);
const occurrences = computed(() => data.value?.occurrences ?? []);
const nextOccurrence = computed(() => occurrences.value[0] ?? null);
const producers = computed(() => data.value?.producers ?? []);
const staffAssignments = computed(() => data.value?.staffAssignments ?? []);
const cast = computed(() => data.value?.cast ?? []);
const viewerCast = computed(() => data.value?.viewerCast ?? null);
const isProducer = computed(() => data.value?.permissions.isProducer ?? false);
const isTheaterStaff = computed(
  () => data.value?.permissions.isTheaterStaff ?? false,
);
const isShowStaff = computed(() => data.value?.permissions.isShowStaff ?? false);
const canEditDraft = computed(() => data.value?.permissions.canEditDraft ?? false);
const canManagePublication = computed(
  () => data.value?.permissions.canManagePublication ?? false,
);
const canSeePendingCast = computed(
  () => data.value?.permissions.canSeePendingCast ?? false,
);
const acceptedCast = computed(() =>
  cast.value.filter((member) => member.status === "accepted"),
);
const confirmedCount = computed(() => acceptedCast.value.length);
const castRangeLabel = computed(() => {
  if (!show.value) return null;

  if (show.value.castMin !== null && show.value.castMax !== null) {
    if (show.value.castMin === show.value.castMax) {
      return `${show.value.castMax}`;
    }

    return `${show.value.castMin}-${show.value.castMax}`;
  }

  if (show.value.castMax !== null) {
    return `up to ${show.value.castMax}`;
  }

  if (show.value.castMin !== null) {
    return `${show.value.castMin}+`;
  }

  return null;
});
const castCountSummary = computed(() => {
  if (!castRangeLabel.value) {
    return `${confirmedCount.value} confirmed`;
  }

  return `${confirmedCount.value} confirmed / ${castRangeLabel.value}`;
});
const hasCastOverflow = computed(
  () =>
    show.value?.castMax !== null &&
    show.value?.castMax !== undefined &&
    confirmedCount.value > show.value.castMax,
);
const programLink = computed(() =>
  show.value ? `/theaters/${slug.value}/shows/${show.value.id}/program` : null,
);
const sortedProgramCast = computed(() =>
  acceptedCast.value.slice().sort((a, b) => {
    if (a.programOrder === null && b.programOrder === null) {
      return (a.displayName ?? a.userId).localeCompare(
        b.displayName ?? b.userId,
      );
    }
    if (a.programOrder === null) return 1;
    if (b.programOrder === null) return -1;
    if (a.programOrder !== b.programOrder)
      return a.programOrder - b.programOrder;
    return (a.displayName ?? a.userId).localeCompare(b.displayName ?? b.userId);
  }),
);
const pendingCast = computed(() =>
  cast.value.filter((member) => member.status === "pending"),
);
const declinedCast = computed(() =>
  cast.value.filter((member) =>
    ["declined", "withdrawn"].includes(member.status),
  ),
);
const inviteStatusClass = (status: string) => {
  if (status === "accepted") return "bg-(--stage-performer-soft)";
  if (status === "pending") return "bg-(--stage-paper-strong)";
  return "bg-(--stage-performer)";
};
const formatDateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString() : "TBD";

const updateShowStatus = useUpdateShowStatus(id, slug);
const updateShowSettings = useUpdateShowSettings(id);
const isUpdatingStatus = computed(() => updateShowStatus.isLoading.value);
const isUpdatingSettings = computed(() => updateShowSettings.isLoading.value);
const statusNotice = ref("");
const statusError = ref("");

const runStatusAction = async (
  action: "submit_for_review" | "cancel" | "reopen_draft",
) => {
  statusNotice.value = "";
  statusError.value = "";

  try {
    await updateShowStatus.mutateAsync({ action });

    if (action === "submit_for_review")
      statusNotice.value = "Submitted for review";
    else if (action === "cancel") statusNotice.value = "Show cancelled";
    else statusNotice.value = "Moved back to draft";

    await refresh();
  } catch (err: any) {
    statusError.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      "Action failed";
  }
};

const toggleCastFinalized = async () => {
  if (!show.value) return;

  statusNotice.value = "";
  statusError.value = "";

  try {
    await updateShowSettings.mutateAsync({
      isCastFinalized: !show.value.isCastFinalized,
    });
    statusNotice.value = show.value.isCastFinalized
      ? "Cast reopened"
      : "Cast finalized";
    await refresh();
  } catch (err: any) {
    statusError.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      "Action failed";
  }
};

const togglePublicListing = async () => {
  if (!show.value) return;

  statusNotice.value = "";
  statusError.value = "";

  try {
    await updateShowSettings.mutateAsync({
      isPublicListed: !show.value.isPublicListed,
    });
    statusNotice.value = show.value.isPublicListed
      ? "Event hidden from the public board"
      : "Event published to the public board";
    await refresh();
  } catch (err: any) {
    statusError.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      "Action failed";
  }
};

const canSubmitForReview = computed(
  () =>
    isProducer.value &&
    ["draft", "rejected"].includes(show.value?.status ?? ""),
);
const canCancelShow = computed(
  () =>
    isProducer.value &&
    ["draft", "pending_review", "approved", "rejected"].includes(
      show.value?.status ?? "",
    ),
);
const canReopenDraft = computed(
  () =>
    isProducer.value &&
    ["cancelled", "rejected"].includes(show.value?.status ?? ""),
);
const viewerRoleLabel = computed(() => {
  if (isProducer.value) return "Producer";
  if (isTheaterStaff.value) return "Theater staff";
  if (isShowStaff.value) return "Show staff";
  if (viewerCast.value?.status === "accepted") return "Confirmed performer";
  if (viewerCast.value?.status === "pending") {
    return viewerCast.value.source === "requested"
      ? "Pending request"
      : "Pending invite";
  }
  if (viewerCast.value?.status === "declined") return "Declined";
  if (viewerCast.value?.status === "withdrawn") return "Withdrawn";
  return "Viewer";
});
const showStateLabel = computed(() => {
  if (!show.value) return "";

  if (show.value.status === "pending_review") {
    return "Waiting on theater approval before public listing.";
  }
  if (show.value.status === "approved") {
    return show.value.isPublicListed
      ? "Approved and visible on the theater board."
      : "Approved, but not yet public.";
  }
  if (show.value.status === "draft") {
    return "Still in setup. Only authorized people should rely on this version.";
  }
  if (show.value.status === "rejected") {
    return "Needs producer changes before it should move forward.";
  }
  if (show.value.status === "cancelled") {
    return "Cancelled. Keep this page as a record, not an active plan.";
  }
  return "";
});
const viewerActionLabel = computed(() => {
  if (isProducer.value) {
    if (canSubmitForReview.value)
      return "Complete setup and submit this show for theater review.";
    if (!show.value?.isCastFinalized)
      return "Track responses, place performers, and finalize the cast when ready.";
    return "Use this page to monitor lineup, schedule, and show-day readiness.";
  }

  if (isTheaterStaff.value) {
    return show.value?.isPublicListed
      ? "The event is approved and public. Use the controls here to manage publication and operations."
      : "This event is approved for theater use, but it is not public yet.";
  }

  if (isShowStaff.value) {
    return "You are staffed on this event. Use this page as your working record for timing, cast, and show-day coordination.";
  }

  if (viewerCast.value?.status === "accepted") {
    return "You are in the lineup. Double-check the next occurrence and watch for show-day updates.";
  }

  if (viewerCast.value?.status === "pending") {
    return viewerCast.value.source === "requested"
      ? "Your request is pending producer review."
      : "Your invite is still awaiting a response.";
  }

  if (
    show.value?.status === "approved" &&
    show.value?.castingMode !== "direct_invite"
  ) {
    return "If you want in, use the cast panel below to request a spot.";
  }

  return "Review the details here before taking action on casting or attendance.";
});

const statusColors = {
  draft: "neutral",
  pending_review: "warning",
  approved: "primary",
  rejected: "error",
  cancelled: "neutral",
} as const;
</script>

<template>
  <div class="space-y-0">
    <StageSection
      outer-class="border-b-3 border-(--stage-ink) bg-(--stage-cream) stage-texture overflow-hidden"
      inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-2 text-sm stage-muted">
          <NuxtLink :to="`/theaters/${slug}`" class="stage-link">
            {{ show?.theaterName ?? slug }}
          </NuxtLink>
          <span>/</span>
          <span>{{ show?.title ?? "Show" }}</span>
        </div>

        <div v-if="error" class="stage-panel px-5 py-4 text-sm text-red-700">
          {{ error?.data?.message || error?.message }}
        </div>

        <div v-if="statusError" class="stage-panel px-5 py-4 text-sm text-red-700">
          {{ statusError }}
        </div>

        <div
          v-if="statusNotice"
          class="stage-panel px-5 py-4 text-sm text-emerald-700"
        >
          {{ statusNotice }}
        </div>

        <div v-if="isLoading && !show" class="stage-panel px-5 py-6 text-sm stage-muted">
          Loading show detail…
        </div>

        <section v-if="show" class="stage-panel-dark stage-grid-board p-6 sm:p-8">
          <div class="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div class="space-y-5">
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="space-y-2">
              <p class="stage-overline text-(--stage-paper-muted)">
                Show detail
              </p>
              <h1 class="font-display text-6xl uppercase tracking-widest">
                {{ show.title }}
              </h1>
              <p
                class="text-xs uppercase tracking-[0.18em] text-(--stage-paper-muted)"
              >
                {{ show.eventType }}
              </p>
            </div>
            <div class="flex items-center gap-2 flex-wrap justify-end">
              <UBadge color="error" variant="soft">
                {{ viewerRoleLabel }}
              </UBadge>
              <UBadge :color="statusColors[show.status]" variant="soft">
                {{ show.status }}
              </UBadge>
              <UBadge
                v-if="show.status === 'approved'"
                :color="show.isPublicListed ? 'primary' : 'neutral'"
                variant="soft"
              >
                {{ show.isPublicListed ? "Public" : "Private" }}
              </UBadge>
              <UBadge v-if="show.isCastFinalized" color="error" variant="soft">
                Cast finalized
              </UBadge>
            </div>
          </div>

          <p
            v-if="show.summary"
            class="max-w-3xl text-base font-semibold uppercase tracking-[0.14em] text-(--stage-gold)"
          >
            {{ show.summary }}
          </p>

          <p
            v-if="show.description"
            class="max-w-3xl text-lg leading-8 text-(--stage-paper-muted)"
          >
            {{ show.description }}
          </p>

          <div class="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <div class="stage-dark-inset p-4">
              <p class="stage-overline text-(--stage-paper-muted)">
                What matters now
              </p>
              <p class="mt-3 text-base leading-7 text-(--stage-cream)">
                {{ viewerActionLabel }}
              </p>
              <p class="mt-3 text-sm text-(--stage-paper-muted)">
                {{ showStateLabel }}
              </p>
            </div>
            <div class="stage-dark-inset p-4">
              <p class="stage-overline text-(--stage-paper-muted)">
                Next occurrence
              </p>
              <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                {{
                  nextOccurrence
                    ? formatDateTime(nextOccurrence.starts_at)
                    : "TBD"
                }}
              </p>
              <p class="mt-2 text-sm text-(--stage-paper-muted)">
                {{
                  nextOccurrence
                    ? nextOccurrence.status.replaceAll("_", " ")
                    : "No scheduled occurrence yet."
                }}
              </p>
            </div>
          </div>

          <div
            v-if="show.producerNote && (isProducer || isTheaterStaff)"
            class="stage-dark-inset p-4"
          >
            <p class="stage-overline text-(--stage-paper-muted)">Internal note</p>
            <p class="mt-3 text-sm leading-7 text-(--stage-cream)">
              {{ show.producerNote }}
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="stage-dark-inset p-4">
              <p class="stage-overline text-(--stage-paper-muted)">
                Cast count
              </p>
              <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                {{ confirmedCount }}
              </p>
              <p class="mt-2 text-sm text-(--stage-paper-muted)">
                {{
                  castRangeLabel ? `${castRangeLabel} target` : "No range set"
                }}
              </p>
            </div>
            <div class="stage-dark-inset p-4">
              <p class="stage-overline text-(--stage-paper-muted)">Producers</p>
              <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                {{ producers.length }}
              </p>
              <p class="mt-2 text-sm text-(--stage-paper-muted)">
                Operational owners on this show.
              </p>
            </div>
            <div class="stage-dark-inset p-4">
              <p class="stage-overline text-(--stage-paper-muted)">Schedule</p>
              <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                {{ occurrences.length }}
              </p>
              <p class="mt-2 text-sm text-(--stage-paper-muted)">
                Scheduled occurrence{{ occurrences.length === 1 ? "" : "s" }}.
              </p>
            </div>
          </div>

          <p
            v-if="hasCastOverflow"
            class="border-3 border-(--stage-event) bg-[rgba(231,180,55,0.14)] px-4 py-3 text-sm text-(--stage-cream)"
          >
            Confirmed cast exceeds the current max. v1 allows this, but it
            should be reviewed.
          </p>
        </div>

        <div class="stage-dark-inset p-5">
          <p class="stage-overline text-(--stage-paper-muted)">Show controls</p>

          <div class="mt-4 flex items-center gap-2 flex-wrap">
            <UButton
              v-if="programLink"
              size="sm"
              color="error"
              variant="soft"
              :to="programLink"
              icon="i-heroicons-queue-list"
            >
              Program view
            </UButton>
            <UButton
              v-if="canEditDraft"
              size="sm"
              color="neutral"
              variant="soft"
              :to="`/theaters/${slug}/shows/${show.id}/edit`"
            >
              Edit setup
            </UButton>
            <UButton
              v-if="canSubmitForReview"
              size="sm"
              color="warning"
              :loading="isUpdatingStatus"
              @click="runStatusAction('submit_for_review')"
            >
              Submit for review
            </UButton>
            <UButton
              v-if="isProducer"
              size="sm"
              :color="show.isCastFinalized ? 'neutral' : 'error'"
              variant="soft"
              :loading="isUpdatingSettings"
              @click="toggleCastFinalized"
            >
              {{ show.isCastFinalized ? "Reopen cast" : "Finalize cast" }}
            </UButton>
            <UButton
              v-if="canManagePublication && show.status === 'approved'"
              size="sm"
              :color="show.isPublicListed ? 'neutral' : 'primary'"
              variant="soft"
              :loading="isUpdatingSettings"
              @click="togglePublicListing"
            >
              {{ show.isPublicListed ? "Unpublish" : "Publish" }}
            </UButton>
            <UButton
              v-if="canReopenDraft"
              size="sm"
              color="neutral"
              variant="ghost"
              :loading="isUpdatingStatus"
              @click="runStatusAction('reopen_draft')"
            >
              Move to draft
            </UButton>
            <UButton
              v-if="canCancelShow"
              size="sm"
              color="error"
              variant="ghost"
              :loading="isUpdatingStatus"
              @click="runStatusAction('cancel')"
            >
              Cancel show
            </UButton>
          </div>

          <div class="mt-4 grid gap-3 md:grid-cols-2">
            <div
              class="stage-dark-inset p-4 text-sm text-(--stage-paper-muted)"
            >
              <span class="font-semibold text-(--stage-cream)">Cast size:</span>
              {{ castCountSummary }}
            </div>
            <div
              class="stage-dark-inset p-4 text-sm text-(--stage-paper-muted)"
            >
              <span class="font-semibold text-(--stage-cream)"
                >Casting mode:</span
              >
              {{ show.castingMode.replaceAll("_", " ") }}
            </div>
            <div
              v-if="show.ticketUrl"
              class="stage-dark-inset p-4 text-sm text-(--stage-paper-muted)"
            >
              <span class="font-semibold text-(--stage-cream)">Tickets:</span>
              <a
                :href="show.ticketUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="stage-link ml-2 text-(--stage-cream)"
              >
                External link
              </a>
            </div>
            <div
              v-if="show.onSaleAt"
              class="stage-dark-inset p-4 text-sm text-(--stage-paper-muted)"
            >
              <span class="font-semibold text-(--stage-cream)">On sale:</span>
              <span class="ml-2">{{ formatDateTime(show.onSaleAt) }}</span>
            </div>
          </div>
        </div>
          </div>
        </section>
      </div>
    </StageSection>

    <StageSection
      v-if="show"
      outer-class="border-b-3 border-(--stage-ink) bg-[rgba(251,247,239,0.52)]"
      inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <section class="stage-panel stage-dot-board p-5 sm:p-6">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="stage-overline">Operational view</p>
            <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
              Working cards
            </h2>
          </div>
          <p class="max-w-2xl text-sm stage-muted">
            Use these as quick summaries of setup, cast movement, and program
            order before you scroll into the detailed cast controls.
          </p>
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
          <StageFeatureCard
            title="Show Setup"
            subtitle="Clear ownership and casting controls"
            tone="bg-(--stage-gold)"
          >
            <div class="space-y-4 text-(--stage-ink)">
            <div
              class="flex items-center justify-between border-b-2 border-[rgba(43,41,38,0.16)] pb-3"
            >
              <div>
                <div class="font-bold">{{ show.title }}</div>
                <div class="text-sm stage-muted">
                  {{ formatDateTime(occurrences[0]?.starts_at) }}
                </div>
              </div>
              <span
                class="border-2 border-(--stage-ink) px-2 py-1 text-xs font-bold uppercase"
                :class="
                  show.status === 'approved'
                    ? 'bg-(--stage-theater)'
                    : show.status === 'pending_review'
                      ? 'bg-(--stage-gold)'
                      : 'bg-(--stage-paper-strong)'
                "
              >
                {{ show.status.replaceAll("_", " ") }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div
                class="border-2 border-(--stage-ink) bg-[rgba(43,41,38,0.04)] p-3"
              >
                <div class="text-xs font-semibold uppercase stage-muted">
                  Producer
                </div>
                <div class="font-medium">
                  {{ producers[0]?.displayName || "Unassigned" }}
                </div>
              </div>
              <div
                class="border-2 border-(--stage-ink) bg-[rgba(43,41,38,0.04)] p-3"
              >
                <div class="text-xs font-semibold uppercase stage-muted">
                  Casting
                </div>
                <div class="font-medium">
                  {{ show.castingMode.replaceAll("_", " ") }}
                </div>
              </div>
            </div>
            <div
              class="border-2 border-(--stage-ink) bg-[rgba(43,41,38,0.04)] p-3"
            >
              <div class="mb-2 text-xs font-semibold uppercase stage-muted">
                Cast Size
              </div>
              <div class="flex items-center gap-2">
                <div class="h-2 flex-1 bg-[rgba(43,41,38,0.12)]">
                  <div
                    class="h-full bg-(--stage-coral)"
                    :style="{
                      width: castRangeLabel
                        ? `${Math.min((confirmedCount / Math.max(show.castMax || confirmedCount || 1, 1)) * 100, 100)}%`
                        : '40%',
                    }"
                  />
                </div>
                <span class="text-sm font-bold">{{
                  castRangeLabel || "Open cast"
                }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <UButton
                v-if="canSubmitForReview"
                class="flex-1"
                size="sm"
                :loading="isUpdatingStatus"
                @click="runStatusAction('submit_for_review')"
              >
                Submit
              </UButton>
              <UButton
                v-if="isProducer"
                class="flex-1"
                size="sm"
                variant="ghost"
                :loading="isUpdatingSettings"
                @click="toggleCastFinalized"
              >
                {{ show.isCastFinalized ? "Reopen Cast" : "Finalize Cast" }}
              </UButton>
            </div>
          </div>
          </StageFeatureCard>

          <StageFeatureCard
            title="Public Listing"
            subtitle="What the public board can trust"
            tone="bg-(--stage-theater)"
          >
            <div class="space-y-4 text-(--stage-ink)">
              <div class="border-2 border-(--stage-ink) bg-[rgba(43,41,38,0.04)] p-3">
                <div class="text-xs font-semibold uppercase stage-muted">Summary</div>
                <div class="mt-2 font-medium">
                  {{ show.summary || "No public summary added yet." }}
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="border-2 border-(--stage-ink) bg-[rgba(43,41,38,0.04)] p-3">
                  <div class="text-xs font-semibold uppercase stage-muted">Poster</div>
                  <div class="mt-2 font-medium">
                    {{ show.posterUrl ? "Artwork linked" : "Placeholder" }}
                  </div>
                </div>
                <div class="border-2 border-(--stage-ink) bg-[rgba(43,41,38,0.04)] p-3">
                  <div class="text-xs font-semibold uppercase stage-muted">Visibility</div>
                  <div class="mt-2 font-medium">
                    {{ show.isPublicListed ? "Public board" : "Internal only" }}
                  </div>
                </div>
              </div>
              <p class="text-sm stage-muted">
                Approval and publication are separate. Theater staff can approve an event without making it visible to the public board.
              </p>
            </div>
          </StageFeatureCard>

        <StageFeatureCard
          title="Cast Invitations"
          subtitle="Track responses in real-time"
          tone="bg-(--stage-coral)"
        >
          <div class="space-y-3 text-(--stage-ink)">
            <div
              v-for="member in cast.slice(0, 5)"
              :key="member.userId"
              class="flex items-center justify-between border-2 border-(--stage-ink) bg-[rgba(43,41,38,0.04)] p-2"
            >
              <div class="flex items-center gap-3">
                <div
                  class="size-8 border-2 border-(--stage-ink) bg-(--stage-paper-strong)"
                />
                <span class="text-sm font-medium">{{
                  member.displayName ?? member.userId
                }}</span>
              </div>
              <div
                class="border-2 border-(--stage-ink) px-2 py-0.5 text-xs font-bold uppercase"
                :class="inviteStatusClass(member.status)"
              >
                {{ member.status }}
              </div>
            </div>
            <div
              class="mt-4 flex items-center justify-between border-t-2 border-[rgba(43,41,38,0.16)] pt-3"
            >
              <div class="text-sm stage-muted">
                <span class="font-bold text-(--stage-ink)">{{
                  confirmedCount
                }}</span>
                confirmed,
                <span class="font-bold text-(--stage-ink)">{{
                  pendingCast.length
                }}</span>
                pending
              </div>
              <UButton
                v-if="isProducer"
                size="xs"
                color="error"
                variant="ghost"
                to="#production-controls"
              >
                Manage Cast
              </UButton>
            </div>
          </div>
        </StageFeatureCard>

        <StageFeatureCard
          title="Lineup Order"
          subtitle="Program everyone can trust"
          tone="bg-(--stage-coral)"
        >
          <div class="space-y-2 text-(--stage-ink)">
            <div
              v-for="(member, index) in sortedProgramCast.slice(0, 4)"
              :key="member.userId"
              class="flex items-center gap-3 border-2 border-(--stage-ink) bg-[rgba(43,41,38,0.04)] p-2"
            >
              <div
                class="flex size-8 items-center justify-center border-2 border-(--stage-ink) bg-(--stage-ink) text-sm font-bold text-(--stage-cream)"
              >
                {{ member.programOrder ?? index + 1 }}
              </div>
              <div class="flex-1">
                <div class="text-sm font-medium">
                  {{ member.displayName ?? member.userId }}
                </div>
                <div class="text-xs stage-muted">
                  {{ member.note || "Performer" }}
                </div>
              </div>
              <div class="text-sm font-medium text-[rgba(43,41,38,0.7)]">
                {{
                  occurrences[index]?.starts_at
                    ? new Date(occurrences[index].starts_at).toLocaleTimeString(
                        [],
                        { hour: "numeric", minute: "2-digit" },
                      )
                    : "Slot"
                }}
              </div>
            </div>
            <div class="mt-4 flex items-center gap-2 text-sm stage-muted">
              <span
                class="size-4 border-2 border-(--stage-ink) bg-(--stage-paper-strong)"
              />
              <span
                >Estimated runtime:
                {{
                  occurrences.length
                    ? `${occurrences.length} scheduled block${occurrences.length === 1 ? "" : "s"}`
                    : "Not set"
                }}</span
              >
            </div>
            <UButton
              v-if="programLink"
              class="mt-2 w-full"
              size="sm"
              variant="ghost"
              :to="programLink"
            >
              Open Program View
            </UButton>
          </div>
          </StageFeatureCard>
        </div>

        <div v-if="staffAssignments.length" class="mt-6">
          <StageFeatureCard
            title="Show Staff"
            subtitle="Operations assignments for this event"
            tone="bg-(--stage-theater)"
          >
            <div class="grid gap-3 md:grid-cols-2">
              <div
                v-for="assignment in staffAssignments"
                :key="assignment.id"
                class="border-2 border-(--stage-ink) bg-[rgba(43,41,38,0.04)] p-3 text-(--stage-ink)"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="font-medium">
                    {{ assignment.displayName || assignment.userId }}
                  </div>
                  <span class="stage-chip bg-(--stage-theater) text-(--stage-ink)">
                    {{ assignment.assignmentType.replaceAll("_", " ") }}
                  </span>
                </div>
                <p v-if="assignment.note" class="mt-2 text-sm stage-muted">
                  {{ assignment.note }}
                </p>
              </div>
            </div>
          </StageFeatureCard>
        </div>
      </section>
    </StageSection>

    <StageSection
      v-if="show"
      outer-class="border-b-3 border-(--stage-ink) bg-[rgba(251,247,239,0.42)]"
      inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <UCard id="production-controls" class="stage-dot-board">
        <template #header>
          <StageSectionHeader
            overline="Production controls"
            title="Cast and invitation management"
            description="This is the operational panel for producers and eligible performers to manage requests, invites, and lineup movement."
            description-class="max-w-3xl"
          />
        </template>
        <ShowCastPanel
          v-if="data"
          :show-id="show.id"
          :theater-id="show.theaterId"
          :theater-slug="show.theaterSlug ?? ''"
          :producers="producers"
          :cast="cast"
          :viewer-cast="viewerCast"
          :is-producer="isProducer"
          :can-request-to-join="data.permissions.canRequestToJoin"
          :can-see-pending-cast="canSeePendingCast"
          :viewer-cast-resolved="authDetailResolved"
          :refresh-show="refresh"
        />
      </UCard>
    </StageSection>
  </div>
</template>
