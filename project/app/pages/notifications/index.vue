<script setup lang="ts">
import { useRequestHeaders } from "#app";
import StageFeatureCard from "~/components/StageFeatureCard.vue";
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
  <div class="max-w-3xl space-y-8">
    <section class="stage-panel stage-texture overflow-hidden px-6 py-7 sm:px-8 sm:py-8">
      <div class="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span class="stage-kicker">Notifications</span>
          <h1 class="mt-4 stage-section-title">Updates that actually matter.</h1>
          <p class="mt-3 max-w-2xl text-lg leading-8 stage-muted">
            The homepage sells clear, actionable communication. This page should look like that promise carried through.
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
    </section>

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

    <div v-if="isLoading" class="stage-panel px-5 py-6 text-sm stage-muted">Loading...</div>

    <div v-else-if="!notifications.length" class="stage-panel px-5 py-6 text-sm stage-muted">
      No notifications here yet.
    </div>

    <div v-else class="space-y-3">
      <StageFeatureCard
        v-for="n in notifications"
        :key="n.id"
        as="NuxtLink"
        :title="n.read_at ? 'Seen update' : 'New update'"
        :subtitle="new Date(n.created_at).toLocaleString()"
        :tone="n.read_at ? 'bg-[var(--stage-paper-strong)]' : 'bg-[var(--stage-mint)]'"
        :to="formatNotification(n.type, n.payload).href ?? '#'"
        class="transition-transform hover:-translate-y-0.5"
        @click="!n.read_at && markRead({ ids: [n.id] })"
      >
        <div class="flex items-start gap-3">
          <span
            class="mt-1.5 size-2 shrink-0 border border-[var(--stage-ink)]"
            :class="n.read_at ? 'bg-[var(--stage-paper-strong)]' : 'bg-[var(--stage-coral)]'"
          />
          <div class="min-w-0 flex-1">
            <p class="text-sm" :class="n.read_at ? 'stage-muted' : 'font-medium text-[var(--stage-ink)]'">
              {{ formatNotification(n.type, n.payload).text }}
            </p>
          </div>
        </div>
      </StageFeatureCard>
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
