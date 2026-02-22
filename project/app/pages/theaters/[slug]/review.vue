<script setup lang="ts">
import { useMutation, useQueryCache } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";
import {
  type ReviewQueue,
  useTheaterReviewQueue,
} from "~/composables/useTheaterReviewQueue";
const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { data: initialReviewQueue } = await useAsyncData(() =>
  $fetch<ReviewQueue>(`/api/theaters/${slug.value}/review`, {
    headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
    credentials: "include",
  }),
);

const { data, isLoading, error } = useTheaterReviewQueue(
  slug,
  initialReviewQueue,
);

const message = ref("");
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
        key: queryKeys.theaterReview(slug.value || ""),
        exact: false,
      }),
      queryCache.invalidateQueries({
        key: queryKeys.theater(slug.value || ""),
        exact: false,
      }),
      queryCache.invalidateQueries({
        key: queryKeys.memberShows(),
        exact: true,
      }),
    ]);
  },
});

const reasons = [
  { label: "Missing description", value: "missing_description" },
  { label: "Schedule unclear", value: "schedule_unclear" },
  { label: "Casting incomplete", value: "casting_incomplete" },
  { label: "Content policy", value: "content_policy" },
  { label: "Other", value: "other" },
] as const;

const feedback = reactive<Record<string, { reason: string; note: string }>>({});

const getFeedback = (showId: string) => {
  if (!feedback[showId]) {
    feedback[showId] = { reason: reasons[0].value, note: "" };
  }
  return feedback[showId];
};

const updateStatus = async (
  showId: string,
  action: "approve" | "reject" | "changes_requested",
) => {
  message.value = "";
  const payload: Record<string, any> = { action };

  if (action === "changes_requested") {
    const fb = getFeedback(showId);
    payload.reason = fb.reason;
    payload.note = fb.note || null;
  }

  await updateStatusMutation.mutateAsync({
    showId,
    action,
    reason: payload.reason,
    note: payload.note,
  });
  if (action === "approve") message.value = "Approved";
  else if (action === "reject") message.value = "Rejected";
  else message.value = "Changes requested";
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Review queue</h1>
      <NuxtLink
        :to="`/theaters/${slug}/shows/new`"
        class="text-sm text-blue-700"
        >New show</NuxtLink
      >
    </div>
    <p v-if="message" class="text-sm text-emerald-600">{{ message }}</p>
    <p v-if="error" class="text-sm text-red-600">
      {{ error?.data?.message || error?.message }}
    </p>
    <UTable
      :rows="data?.shows || []"
      :loading="isLoading"
      :columns="[
        { key: 'title', label: 'Title' },
        { key: 'startsAt', label: 'Next occurrence' },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: 'Actions' },
      ]"
    >
      <template #startsAt-data="{ row }">
        <span>{{
          row.startsAt ? new Date(row.startsAt).toLocaleString() : "TBD"
        }}</span>
      </template>
      <template #actions-data="{ row }">
        <div class="space-y-2">
          <div class="flex gap-2 flex-wrap">
            <UButton
              size="xs"
              color="emerald"
              @click="updateStatus(row.id, 'approve')"
              >Approve</UButton
            >
            <UButton
              size="xs"
              color="red"
              variant="soft"
              @click="updateStatus(row.id, 'reject')"
              >Reject</UButton
            >
            <UButton
              size="xs"
              color="orange"
              variant="soft"
              @click="updateStatus(row.id, 'changes_requested')"
              >Needs work</UButton
            >
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <USelect
              size="xs"
              :options="reasons"
              option-attribute="label"
              value-attribute="value"
              v-model="getFeedback(row.id).reason"
            />
            <UInput
              size="xs"
              v-model="getFeedback(row.id).note"
              placeholder="Optional note"
            />
          </div>
        </div>
      </template>
    </UTable>
  </div>
</template>
