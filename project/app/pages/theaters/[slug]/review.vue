<script setup lang="ts">
const route = useRoute();
const apiFetch = useApi();
const slug = computed(() => route.params.slug as string);

const { data, refresh, pending, error } = useAsyncData(
  () =>
    apiFetch<{
      shows: {
        id: string;
        title: string;
        status: string;
        startsAt: string | null;
      }[];
    }>(`/api/theaters/${slug.value}/review`),
  { watch: [slug], server: false },
);

const message = ref("");

const updateStatus = async (showId: string, action: "approve" | "reject") => {
  message.value = "";
  await apiFetch(`/api/shows/${showId}/status`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
  message.value = action === "approve" ? "Approved" : "Rejected";
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
        <div class="flex gap-2">
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
        </div>
      </template>
    </UTable>
  </div>
</template>
