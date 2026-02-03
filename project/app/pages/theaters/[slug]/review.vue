<script setup lang="ts">
const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { data, refresh, pending, error } = useAsyncData(
  () =>
    $fetch<{
      shows: {
        id: string;
        title: string;
        status: string;
        startsAt: string | null;
      }[];
    }>(`/api/theaters/${slug.value}/review`, {
      credentials: "include",
    }),
  { watch: [slug], server: false },
);

const message = ref("");

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

  await $fetch(`/api/shows/${showId}/status`, {
    method: "POST",
    credentials: "include",
    body: payload,
  });
  if (action === "approve") message.value = "Approved";
  else if (action === "reject") message.value = "Rejected";
  else message.value = "Changes requested";
  await refresh();
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
      :loading="pending"
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
