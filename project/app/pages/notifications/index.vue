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
const actionNeededCount = computed(
  () =>
    notifications.value.filter((n) =>
      ["cast.invited", "show.submitted_for_review", "cast.requested"].includes(n.type),
    ).length,
);
const showDayCount = computed(
  () =>
    notifications.value.filter((n) => {
      const startsAt = n.payload?.startsAt;
      if (!startsAt) return false;
      const diff = new Date(startsAt).getTime() - Date.now();
      return diff >= 0 && diff <= 1000 * 60 * 60 * 24 * 2;
    }).length,
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

const notificationLabel = (type: string) => {
  if (type.startsWith("cast.")) return "Cast update";
  if (type.startsWith("show.")) return "Show update";
  return "Update";
};

const notificationTone = (type: string, readAt: string | null) => {
  if (readAt) return "bg-[var(--stage-paper-strong)]";
  if (["cast.invited", "cast.requested"].includes(type)) return "bg-[var(--stage-performer-soft)]";
  if (["show.submitted_for_review", "show.approved"].includes(type)) return "bg-[var(--stage-theater-soft)]";
  return "bg-[rgba(231,180,55,0.22)]";
};
</script>

<template>
  <div class="space-y-0">
    <StageSection outer-class="border-b-3 border-[var(--stage-ink)] bg-[var(--stage-cream)] stage-texture overflow-hidden" inner-class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div class="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span class="stage-kicker">Notifications</span>
          <h1 class="mt-4 stage-section-title">What changed, what needs you, what is next.</h1>
          <p class="mt-3 max-w-2xl text-lg leading-8 stage-muted">
            Notifications should help you act quickly, not make you read a feed line by line.
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
    </StageSection>

    <StageSection outer-class="border-b-3 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.52)]" inner-class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div class="mb-6 grid gap-3 sm:grid-cols-3">
        <div class="stage-stat">
          <span class="stage-overline">Unread</span>
          <span class="stage-stat-value">{{ unreadCount }}</span>
          <p class="mt-2 text-sm stage-muted">Still not acknowledged.</p>
        </div>
        <div class="stage-stat">
          <span class="stage-overline">Needs attention</span>
          <span class="stage-stat-value">{{ actionNeededCount }}</span>
          <p class="mt-2 text-sm stage-muted">Invites, requests, and review events.</p>
        </div>
        <div class="stage-stat">
          <span class="stage-overline">Soon</span>
          <span class="stage-stat-value">{{ showDayCount }}</span>
          <p class="mt-2 text-sm stage-muted">Updates tied to the next 48 hours.</p>
        </div>
      </div>

      <div class="mb-6 flex gap-2 flex-wrap">
        <UButton
          v-for="tab in tabs"
          :key="tab.value"
          size="sm"
          :color="filter === tab.value ? 'primary' : 'neutral'"
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
          :title="notificationLabel(n.type)"
          :subtitle="new Date(n.created_at).toLocaleString()"
          :tone="notificationTone(n.type, n.read_at)"
          :to="formatNotification(n.type, n.payload).href ?? '#'"
          class="transition-colors"
          @click="!n.read_at && markRead({ ids: [n.id] })"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex min-w-0 flex-1 items-start gap-3">
              <span
                class="mt-1.5 size-2 shrink-0 border border-[var(--stage-ink)]"
                :class="n.read_at ? 'bg-[var(--stage-paper-strong)]' : 'bg-[var(--stage-performer)]'"
              />
              <div class="min-w-0 flex-1">
                <div class="mb-2 flex flex-wrap items-center gap-2">
                  <UBadge
                    :color="n.type.startsWith('cast.') ? 'error' : n.type.startsWith('show.') ? 'primary' : 'warning'"
                    variant="soft"
                  >
                    {{ n.read_at ? "Seen" : "New" }}
                  </UBadge>
                  <span class="text-xs uppercase tracking-[0.16em] stage-muted">
                    {{ notificationLabel(n.type) }}
                  </span>
                </div>
                <p class="text-sm" :class="n.read_at ? 'stage-muted' : 'font-medium text-[var(--stage-ink)]'">
                  {{ formatNotification(n.type, n.payload).text }}
                </p>
                <p
                  v-if="n.payload?.startsAt"
                  class="mt-2 text-xs uppercase tracking-[0.16em] stage-muted"
                >
                  Related start: {{ new Date(n.payload.startsAt).toLocaleString() }}
                </p>
              </div>
            </div>
            <p class="shrink-0 text-xs uppercase tracking-[0.16em] stage-muted">
              {{ n.read_at ? "Read" : "Open" }}
            </p>
          </div>
        </StageFeatureCard>
      </div>

      <div class="pt-6">
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
    </StageSection>
  </div>
</template>
