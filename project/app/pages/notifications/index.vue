<script setup lang="ts">
import { useRequestHeaders } from "#app";
import {
  useNotificationsPage,
  useMarkRead,
} from "~/composables/useNotifications";
import { formatNotification } from "~/utils/notifications";
import type { NotificationsResponse } from "~/queries/notifications";

const filter = ref<"all" | "my_shows" | "other">("all");
const page = ref(1);

const params = computed(() => ({ filter: filter.value, page: page.value }));

const { data: initialData } = await useAsyncData(() =>
  $fetch<NotificationsResponse>("/api/notifications", {
    headers: import.meta.server ? useRequestHeaders(["cookie"]) : undefined,
    credentials: "include",
    params: { filter: "all", page: 1, pageSize: 30 },
  }),
);

const { data, isLoading } = useNotificationsPage(params, initialData);
const { mutateAsync: markRead } = useMarkRead();

const notifications = computed(() => data.value?.notifications ?? []);
const totalPages = computed(() => data.value?.totalPages ?? 1);
const unreadCount = computed(
  () => notifications.value.filter((n) => !n.read_at).length,
);

const tabs = [
  { label: "All notifications", value: "all" as const },
  { label: "My shows", value: "my_shows" as const },
  { label: "Other", value: "other" as const },
];

const switchFilter = (value: "all" | "my_shows" | "other") => {
  filter.value = value;
  page.value = 1;
};

const markAllRead = () => markRead({ all: true });
</script>

<template>
  <div class="space-y-6 max-w-2xl">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Notifications</h1>
        <p class="text-sm text-slate-600">
          Stay up to date on your shows and invites.
        </p>
      </div>
      <UButton
        v-if="unreadCount > 0"
        size="sm"
        variant="ghost"
        @click="markAllRead"
      >
        Mark all read
      </UButton>
    </div>

    <div class="flex gap-2 flex-wrap">
      <UButton
        v-for="tab in tabs"
        :key="tab.value"
        size="sm"
        :color="filter === tab.value ? 'primary' : 'gray'"
        :variant="filter === tab.value ? 'soft' : 'ghost'"
        @click="switchFilter(tab.value)"
      >
        {{ tab.label }}
      </UButton>
    </div>

    <div v-if="isLoading" class="text-sm text-slate-500">Loading...</div>

    <div v-else-if="!notifications.length" class="text-sm text-slate-500">
      No notifications here yet.
    </div>

    <div v-else class="space-y-1">
      <NuxtLink
        v-for="n in notifications"
        :key="n.id"
        :to="formatNotification(n.type, n.payload).href ?? '#'"
        class="flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors hover:bg-slate-50"
        :class="n.read_at ? 'border-slate-100' : 'border-blue-100 bg-blue-50'"
        @click="!n.read_at && markRead({ ids: [n.id] })"
      >
        <span
          class="mt-1.5 h-2 w-2 rounded-full flex-shrink-0"
          :class="n.read_at ? 'bg-transparent' : 'bg-blue-500'"
        />
        <div class="flex-1 min-w-0">
          <p
            class="text-sm"
            :class="n.read_at ? 'text-slate-500' : 'text-slate-900 font-medium'"
          >
            {{ formatNotification(n.type, n.payload).text }}
          </p>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ new Date(n.created_at).toLocaleString() }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <UPagination
      v-if="totalPages > 1"
      :page="page"
      :total="totalPages"
      :items-per-page="1"
      :disabled="isLoading"
      :show-controls="true"
      @update:page="(p) => (page = p)"
    />
  </div>
</template>
