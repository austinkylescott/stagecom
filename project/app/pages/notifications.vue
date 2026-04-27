<script setup lang="ts">
import { useQuery, useQueryCache } from "@pinia/colada";
import { notificationsPageQueryOptions } from "~/queries/notifications";
import { formatNotification } from "~/utils/notifications";
import { demoNotifications } from "~/utils/stitchDemo";
import { queryKeys } from "~/composables/queryKeys";

definePageMeta({
  layout: "app",
  middleware: "auth",
});

const filter = ref<"all" | "my_shows" | "other">("all");
const params = computed(() => ({ filter: filter.value, page: 1 }));
const { data } = useQuery(notificationsPageQueryOptions, params);

const notifications = computed(() =>
  data.value?.notifications?.length ? data.value : demoNotifications,
);
const isMarkingRead = ref(false);
const queryCache = useQueryCache();

const markAllRead = async () => {
  isMarkingRead.value = true;

  try {
    await $fetch("/api/notifications/read", {
      method: "POST",
      credentials: "include",
      body: { all: true },
    });

    await Promise.all([
      queryCache.invalidateQueries({
        key: queryKeys.notifications(),
        exact: false,
      }),
      queryCache.invalidateQueries({
        key: queryKeys.notificationsPage({ filter: filter.value, page: 1 }),
        exact: true,
      }),
    ]);
  } finally {
    isMarkingRead.value = false;
  }
};

const tabs = [
  { label: "All", value: "all" },
  { label: "My Shows", value: "my_shows" },
  { label: "Other", value: "other" },
] as const;
</script>

<template>
  <div class="bg-(--stage-cream) p-6 md:p-10">
    <header class="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="stitch-display text-5xl font-black md:text-7xl">Notifications</h1>
        <p class="mt-2 text-lg font-bold text-(--stage-ink)/70">Operational alerts, invites, approvals, and show changes.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="stitch-border px-4 py-2 text-xs font-black uppercase"
          :class="filter === tab.value ? 'bg-(--stage-theater)' : 'bg-(--stage-paper)'"
          @click="filter = tab.value"
        >
          {{ tab.label }}
        </button>
        <button
          class="stitch-border bg-(--stage-paper) px-4 py-2 text-xs font-black uppercase disabled:opacity-60"
          :disabled="isMarkingRead"
          @click="markAllRead"
        >
          {{ isMarkingRead ? "Marking..." : "Mark All Read" }}
        </button>
      </div>
    </header>

    <section class="stitch-border-heavy bg-(--stage-paper) stitch-shadow-lg">
      <div class="border-b-[4px] border-(--stage-ink) bg-(--stage-performer) p-5">
        <h2 class="stitch-display text-2xl font-black">Inbound System</h2>
      </div>

      <div>
        <article
          v-for="notification in notifications.notifications"
          :key="notification.id"
          class="grid gap-4 border-b border-(--stage-ink)/10 p-5 md:grid-cols-[10rem_1fr_auto] md:items-start"
        >
          <div class="text-xs font-black uppercase tracking-[0.18em] text-(--stage-ink)/60">
            {{ notification.type.replaceAll('.', ' ') }}
          </div>
          <div>
            <NuxtLink
              v-if="formatNotification(notification.type, notification.payload).href"
              :to="formatNotification(notification.type, notification.payload).href!"
              class="text-lg font-bold underline underline-offset-4"
            >
              {{ formatNotification(notification.type, notification.payload).text }}
            </NuxtLink>
            <p v-else class="text-lg font-bold">
              {{ formatNotification(notification.type, notification.payload).text }}
            </p>
            <p class="mt-1 text-sm text-(--stage-ink)/70">
              {{ notification.payload?.note || "Tracked through the Stagecom notification service." }}
            </p>
          </div>
          <div class="text-sm font-black uppercase text-(--stage-ink)/60">
            {{ new Date(notification.created_at).toLocaleDateString() }}
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
