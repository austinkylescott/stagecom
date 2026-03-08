<script setup lang="ts">
import { useMutation, useQueryCache } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";
import {
  type ReviewInboxResponse,
  type ReviewInboxShow,
  useReviewInbox,
} from "~/composables/useReviewInbox";

const { data: initialReviewInbox } = await useAsyncData(() =>
  $fetch<ReviewInboxResponse>("/api/review", {
    headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
    credentials: "include",
  }),
);

const { data, isLoading, error } = useReviewInbox(initialReviewInbox);

const feedback = reactive<Record<string, { reason: string; note: string }>>({});
const notice = ref("");
const mutationError = ref("");

const reasons = [
  { label: "Missing description", value: "missing_description" },
  { label: "Schedule unclear", value: "schedule_unclear" },
  { label: "Casting incomplete", value: "casting_incomplete" },
  { label: "Content policy", value: "content_policy" },
  { label: "Other", value: "other" },
] as const;

const statusColors: Record<string, "gray" | "orange" | "emerald" | "red"> = {
  draft: "gray",
  pending_review: "orange",
  approved: "emerald",
  rejected: "red",
  cancelled: "gray",
};

const sortedShows = computed(
  () => (data.value?.shows || []) as ReviewInboxShow[],
);
const columns = [
  { id: "title", accessorKey: "title", header: "Title" },
  { id: "theaterName", accessorKey: "theaterName", header: "Theater" },
  { id: "eventType", accessorKey: "eventType", header: "Type" },
  { id: "status", accessorKey: "status", header: "Status" },
  {
    id: "nextStartsAt",
    accessorKey: "nextStartsAt",
    header: "Next occurrence",
  },
  { id: "actions", accessorKey: "id", header: "Actions" },
] as const;

const getFeedback = (showId: string) => {
  if (!feedback[showId]) {
    feedback[showId] = { reason: reasons[0].value, note: "" };
  }
  return feedback[showId];
};

const queryCache = useQueryCache();

const updateStatusMutation = useMutation<
  void,
  {
    showId: string;
    action: "approve" | "reject" | "changes_requested";
    reason?: string;
    note?: string;
  }
>({
  mutation: ({ showId, action, reason, note }) =>
    $fetch(`/api/shows/${showId}/status`, {
      method: "POST",
      credentials: "include",
      body: { action, reason, note },
    }),
  onSuccess: async () => {
    await Promise.all([
      queryCache.invalidateQueries({
        key: queryKeys.reviewInbox(),
        exact: true,
      }),
      queryCache.invalidateQueries({
        key: queryKeys.theaterReviewPrefix(),
        exact: false,
      }),
      queryCache.invalidateQueries({
        key: queryKeys.memberShows(),
        exact: true,
      }),
      queryCache.invalidateQueries({
        key: queryKeys.theaterPrefix(),
        exact: false,
      }),
    ]);
  },
});
const statusMutating = computed(() => updateStatusMutation.isLoading.value);

const updateStatus = async (
  showId: string,
  action: "approve" | "reject" | "changes_requested",
) => {
  notice.value = "";
  mutationError.value = "";

  let reason: string | undefined;
  let note: string | undefined;

  if (action === "changes_requested") {
    const fb = getFeedback(showId);
    reason = fb.reason;
    note = fb.note || undefined;
  }

  try {
    await updateStatusMutation.mutateAsync({
      showId,
      action,
      reason,
      note,
    });

    if (action === "approve") notice.value = "Show approved";
    else if (action === "reject") notice.value = "Show rejected";
    else notice.value = "Changes requested";
  } catch (err: any) {
    mutationError.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      "Action failed";
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Review</h1>
        <p class="text-sm text-slate-600">
          Shows you created plus pending review items from theaters where you
          have staff-level access.
        </p>
      </div>
    </div>

    <p v-if="notice" class="text-sm text-emerald-600">{{ notice }}</p>
    <p v-if="mutationError" class="text-sm text-red-600">{{ mutationError }}</p>
    <p v-if="error" class="text-sm text-red-600">
      {{ error?.data?.statusMessage || error?.data?.message || error?.message }}
    </p>

    <UCard>
      <UTable :data="sortedShows" :loading="isLoading" :columns="columns">
        <template #title-cell="{ row }">
          <div>
            <p class="font-medium">{{ row.original.title }}</p>
            <p v-if="row.original.createdByMe" class="text-xs text-slate-500">
              Created by you
            </p>
          </div>
        </template>

        <template #theaterName-cell="{ row }">
          <NuxtLink
            class="text-primary hover:underline"
            :to="`/theaters/${row.original.theaterSlug}`"
          >
            {{ row.original.theaterName }}
          </NuxtLink>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="statusColors[row.original.status] || 'neutral'"
            variant="soft"
          >
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #nextStartsAt-cell="{ row }">
          <span>
            {{
              row.original.nextStartsAt
                ? new Date(row.original.nextStartsAt).toLocaleString()
                : "TBD"
            }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <div
            v-if="
              row.original.canReview && row.original.status === 'pending_review'
            "
            class="space-y-2"
          >
            <div class="flex gap-2 flex-wrap">
              <UButton
                size="xs"
                color="emerald"
                :loading="statusMutating"
                @click="updateStatus(row.original.id, 'approve')"
              >
                Approve
              </UButton>
              <UButton
                size="xs"
                color="red"
                variant="soft"
                :loading="statusMutating"
                @click="updateStatus(row.original.id, 'reject')"
              >
                Reject
              </UButton>
              <UButton
                size="xs"
                color="orange"
                variant="soft"
                :loading="statusMutating"
                @click="updateStatus(row.original.id, 'changes_requested')"
              >
                Needs work
              </UButton>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <USelect
                size="xs"
                :options="reasons"
                option-attribute="label"
                value-attribute="value"
                v-model="getFeedback(row.original.id).reason"
              />
              <UInput
                size="xs"
                v-model="getFeedback(row.original.id).note"
                placeholder="Optional note"
              />
            </div>
          </div>
          <div v-else class="text-xs text-slate-500">No actions</div>
        </template>
      </UTable>

      <template #footer>
        <p
          v-if="!isLoading && sortedShows.length === 0"
          class="text-sm text-slate-600"
        >
          Nothing to review yet.
        </p>
      </template>
    </UCard>
  </div>
</template>
