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
const producers = computed(() => data.value?.producers ?? []);
const cast = computed(() => data.value?.cast ?? []);
const viewerCast = computed(() => data.value?.viewerCast ?? null);
const isProducer = computed(() => data.value?.permissions.isProducer ?? false);
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
      return (a.displayName ?? a.userId).localeCompare(b.displayName ?? b.userId);
    }
    if (a.programOrder === null) return 1;
    if (b.programOrder === null) return -1;
    if (a.programOrder !== b.programOrder) return a.programOrder - b.programOrder;
    return (a.displayName ?? a.userId).localeCompare(b.displayName ?? b.userId);
  }),
);
const pendingCast = computed(() =>
  cast.value.filter((member) => member.status === "pending"),
);
const declinedCast = computed(() =>
  cast.value.filter((member) => ["declined", "withdrawn"].includes(member.status)),
);
const inviteStatusClass = (status: string) => {
  if (status === "accepted") return "bg-[var(--stage-mint)]";
  if (status === "pending") return "bg-[var(--stage-paper-strong)]";
  return "bg-[var(--stage-coral)]";
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
  action:
    | "submit_for_review"
    | "cancel"
    | "reopen_draft",
) => {
  statusNotice.value = "";
  statusError.value = "";

  try {
    await updateShowStatus.mutateAsync({ action });

    if (action === "submit_for_review") statusNotice.value = "Submitted for review";
    else if (action === "cancel") statusNotice.value = "Show cancelled";
    else statusNotice.value = "Moved back to draft";

    await refresh();
  } catch (err: any) {
    statusError.value =
      err?.data?.statusMessage || err?.data?.message || err?.message || "Action failed";
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
      err?.data?.statusMessage || err?.data?.message || err?.message || "Action failed";
  }
};

const canSubmitForReview = computed(
  () => isProducer.value && ["draft", "rejected"].includes(show.value?.status ?? ""),
);
const canCancelShow = computed(
  () =>
    isProducer.value &&
    ["draft", "pending_review", "approved", "rejected"].includes(show.value?.status ?? ""),
);
const canReopenDraft = computed(
  () =>
    isProducer.value &&
    ["cancelled", "rejected"].includes(show.value?.status ?? ""),
);

const statusColors = {
  draft: "neutral",
  pending_review: "warning",
  approved: "success",
  rejected: "error",
  cancelled: "neutral",
} as const;
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center gap-2 text-sm stage-muted">
      <NuxtLink :to="`/theaters/${slug}`" class="hover:underline">
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

    <div v-if="isLoading && !show" class="text-sm stage-muted">
      Loading...
    </div>

    <section v-if="show" class="stage-panel-dark stage-grid-board p-6 sm:p-8">
      <div class="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div class="space-y-5">
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="space-y-2">
              <p class="stage-overline text-[var(--stage-paper-muted)]">
                Show detail
              </p>
              <h1 class="font-display text-6xl uppercase tracking-[0.1em]">
                {{ show.title }}
              </h1>
              <p class="text-xs uppercase tracking-[0.18em] text-[var(--stage-paper-muted)]">
              {{ show.eventType }}
              </p>
            </div>
            <div class="flex items-center gap-2 flex-wrap justify-end">
              <UBadge :color="statusColors[show.status]" variant="soft">
                {{ show.status }}
              </UBadge>
              <UBadge
                v-if="show.isCastFinalized"
                color="primary"
                variant="soft"
              >
                Cast finalized
              </UBadge>
            </div>
          </div>

          <p
            v-if="show.description"
            class="max-w-3xl text-lg leading-8 text-[var(--stage-paper-muted)]"
          >
            {{ show.description }}
          </p>

          <div class="grid gap-3 sm:grid-cols-3">
            <div
              class="border-3 border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.08)] p-4"
            >
              <p class="stage-overline text-[var(--stage-paper-muted)]">
                Cast count
              </p>
              <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                {{ confirmedCount }}
              </p>
              <p class="mt-2 text-sm text-[var(--stage-paper-muted)]">
                {{ castRangeLabel ? `${castRangeLabel} target` : "No range set" }}
              </p>
            </div>
            <div
              class="border-3 border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.08)] p-4"
            >
              <p class="stage-overline text-[var(--stage-paper-muted)]">
                Producers
              </p>
              <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                {{ producers.length }}
              </p>
              <p class="mt-2 text-sm text-[var(--stage-paper-muted)]">
                Operational owners on this show.
              </p>
            </div>
            <div
              class="border-3 border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.08)] p-4"
            >
              <p class="stage-overline text-[var(--stage-paper-muted)]">
                Schedule
              </p>
              <p class="mt-2 font-display text-3xl uppercase tracking-[0.08em]">
                {{ occurrences.length }}
              </p>
              <p class="mt-2 text-sm text-[var(--stage-paper-muted)]">
                Scheduled occurrence{{ occurrences.length === 1 ? "" : "s" }}.
              </p>
            </div>
          </div>

          <p
            v-if="hasCastOverflow"
            class="border-3 border-[var(--stage-gold)] bg-[rgba(234,165,66,0.14)] px-4 py-3 text-sm text-[var(--stage-cream)]"
          >
            Confirmed cast exceeds the current max. v1 allows this, but it should be reviewed.
          </p>
        </div>

        <div class="border-3 border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.08)] p-5">
          <p class="stage-overline text-[var(--stage-paper-muted)]">
            Producer actions
          </p>

          <div class="mt-4 flex items-center gap-2 flex-wrap">
            <UButton
              v-if="programLink"
              size="sm"
              variant="soft"
              :to="programLink"
              icon="i-heroicons-queue-list"
            >
              Program view
            </UButton>
            <UButton
              v-if="canSubmitForReview"
              size="sm"
              color="primary"
              :loading="isUpdatingStatus"
              @click="runStatusAction('submit_for_review')"
            >
              Submit for review
            </UButton>
            <UButton
              v-if="isProducer"
              size="sm"
              :color="show.isCastFinalized ? 'neutral' : 'primary'"
              variant="soft"
              :loading="isUpdatingSettings"
              @click="toggleCastFinalized"
            >
              {{ show.isCastFinalized ? "Reopen cast" : "Finalize cast" }}
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
              class="border-2 border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.08)] p-4 text-sm text-[var(--stage-paper-muted)]"
            >
              <span class="font-semibold text-[var(--stage-cream)]">Cast size:</span>
              {{ castCountSummary }}
            </div>
            <div
              v-if="show.ticketUrl"
              class="border-2 border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.08)] p-4 text-sm text-[var(--stage-paper-muted)]"
            >
              <span class="font-semibold text-[var(--stage-cream)]">Tickets:</span>
              <a
                :href="show.ticketUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="stage-link ml-2 text-[var(--stage-cream)]"
              >
                External link
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="show" class="grid gap-6 lg:grid-cols-3">
      <StageFeatureCard
        title="Show Setup"
        subtitle="Clear ownership and casting controls"
        tone="bg-[var(--stage-mint)]"
      >
        <div class="space-y-4 text-[var(--stage-ink)]">
          <div class="flex items-center justify-between border-b-2 border-[rgba(43,41,38,0.1)] pb-3">
            <div>
              <div class="font-bold">{{ show.title }}</div>
              <div class="text-sm stage-muted">
                {{ formatDateTime(occurrences[0]?.starts_at) }}
              </div>
            </div>
            <span class="border-2 border-[var(--stage-ink)] px-2 py-1 text-xs font-bold uppercase" :class="show.status === 'approved' ? 'bg-[var(--stage-mint)]' : show.status === 'pending_review' ? 'bg-[var(--stage-gold)]' : 'bg-[var(--stage-paper-strong)]'">
              {{ show.status.replaceAll("_", " ") }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="border-2 border-[rgba(43,41,38,0.18)] p-3">
              <div class="text-xs font-semibold uppercase stage-muted">Producer</div>
              <div class="font-medium">{{ producers[0]?.displayName || "Unassigned" }}</div>
            </div>
            <div class="border-2 border-[rgba(43,41,38,0.18)] p-3">
              <div class="text-xs font-semibold uppercase stage-muted">Casting</div>
              <div class="font-medium">{{ show.castingMode.replaceAll("_", " ") }}</div>
            </div>
          </div>
          <div class="border-2 border-[rgba(43,41,38,0.18)] p-3">
            <div class="mb-2 text-xs font-semibold uppercase stage-muted">Cast Size</div>
            <div class="flex items-center gap-2">
              <div class="h-2 flex-1 bg-[rgba(43,41,38,0.12)]">
                <div class="h-full bg-[var(--stage-mint)]" :style="{ width: castRangeLabel ? `${Math.min((confirmedCount / Math.max(show.castMax || confirmedCount || 1, 1)) * 100, 100)}%` : '40%' }" />
              </div>
              <span class="text-sm font-bold">{{ castRangeLabel || "Open cast" }}</span>
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
        title="Cast Invitations"
        subtitle="Track responses in real-time"
        tone="bg-[var(--stage-gold)]"
      >
        <div class="space-y-3 text-[var(--stage-ink)]">
          <div
            v-for="member in cast.slice(0, 5)"
            :key="member.userId"
            class="flex items-center justify-between border-2 border-[rgba(43,41,38,0.1)] p-2"
          >
            <div class="flex items-center gap-3">
              <div class="size-8 border-2 border-[rgba(43,41,38,0.18)] bg-[var(--stage-paper-strong)]" />
              <span class="text-sm font-medium">{{ member.displayName ?? member.userId }}</span>
            </div>
            <div class="border-2 border-[var(--stage-ink)] px-2 py-0.5 text-xs font-bold uppercase" :class="inviteStatusClass(member.status)">
              {{ member.status }}
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between border-t-2 border-[rgba(43,41,38,0.1)] pt-3">
            <div class="text-sm stage-muted">
              <span class="font-bold text-[var(--stage-ink)]">{{ confirmedCount }}</span>
              confirmed,
              <span class="font-bold text-[var(--stage-ink)]">{{ pendingCast.length }}</span>
              pending
            </div>
            <UButton
              v-if="isProducer"
              size="xs"
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
        tone="bg-[var(--stage-coral)]"
      >
        <div class="space-y-2 text-[var(--stage-ink)]">
          <div
            v-for="(member, index) in sortedProgramCast.slice(0, 4)"
            :key="member.userId"
            class="flex items-center gap-3 border-2 border-[rgba(43,41,38,0.1)] p-2"
          >
            <div class="flex size-8 items-center justify-center border-2 border-[var(--stage-ink)] bg-[var(--stage-ink)] text-sm font-bold text-[var(--stage-cream)]">
              {{ member.programOrder ?? index + 1 }}
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium">{{ member.displayName ?? member.userId }}</div>
              <div class="text-xs stage-muted">{{ member.note || "Performer" }}</div>
            </div>
            <div class="text-sm font-medium text-[rgba(43,41,38,0.7)]">
              {{ occurrences[index]?.starts_at ? new Date(occurrences[index].starts_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : "Slot" }}
            </div>
          </div>
          <div class="mt-4 flex items-center gap-2 text-sm stage-muted">
            <span class="size-4 border-2 border-[var(--stage-ink)] bg-[var(--stage-paper-strong)]" />
            <span>Estimated runtime: {{ occurrences.length ? `${occurrences.length} scheduled block${occurrences.length === 1 ? '' : 's'}` : "Not set" }}</span>
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
    </section>

    <UCard v-if="show" id="production-controls">
      <template #header>
        <div>
          <p class="stage-overline">Production controls</p>
          <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
            Cast and invitation management
          </h2>
        </div>
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
  </div>
</template>
