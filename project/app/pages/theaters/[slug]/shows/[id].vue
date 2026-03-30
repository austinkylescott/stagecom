<script setup lang="ts">
import { useRequestHeaders } from "#app";
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
  <div class="space-y-6">
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
              class="rounded-[1.15rem] border-[3px] border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.08)] p-4"
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
              class="rounded-[1.15rem] border-[3px] border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.08)] p-4"
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
              class="rounded-[1.15rem] border-[3px] border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.08)] p-4"
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
            class="rounded-[1rem] border-[3px] border-[var(--stage-gold)] bg-[rgba(234,165,66,0.14)] px-4 py-3 text-sm text-[var(--stage-cream)]"
          >
            Confirmed cast exceeds the current max. v1 allows this, but it should be reviewed.
          </p>
        </div>

        <div class="rounded-[1.4rem] border-[3px] border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.08)] p-5">
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
              class="rounded-[1rem] border-[2px] border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.08)] p-4 text-sm text-[var(--stage-paper-muted)]"
            >
              <span class="font-semibold text-[var(--stage-cream)]">Cast size:</span>
              {{ castCountSummary }}
            </div>
            <div
              v-if="show.ticketUrl"
              class="rounded-[1rem] border-[2px] border-[var(--stage-paper-muted)] bg-[rgba(251,247,239,0.08)] p-4 text-sm text-[var(--stage-paper-muted)]"
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

    <UCard v-if="show">
      <template #header>
        <div>
          <p class="stage-overline">Schedule</p>
          <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
            Occurrences
          </h2>
        </div>
      </template>
      <div v-if="!occurrences.length" class="text-sm stage-muted">
        No occurrences scheduled yet.
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="occ in occurrences"
          :key="occ.id"
          class="stage-list-card flex items-center justify-between gap-3 px-4 py-4 text-sm"
        >
          <span>{{ new Date(occ.starts_at).toLocaleString() }}</span>
          <div class="flex items-center gap-2">
            <span v-if="occ.ends_at" class="stage-muted">
              → {{ new Date(occ.ends_at).toLocaleString() }}
            </span>
            <UBadge
              v-if="occ.status !== 'scheduled'"
              size="xs"
              color="warning"
              variant="soft"
            >
              {{ occ.status }}
            </UBadge>
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-if="show">
      <template #header>
        <div>
          <p class="stage-overline">Cast</p>
          <h2 class="mt-2 font-display text-4xl uppercase tracking-[0.08em]">
            Lineup management
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
