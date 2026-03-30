<script setup lang="ts">
import {
  useNotificationsBell,
  useMarkRead,
} from "~/composables/useNotifications";
import { formatNotification } from "~/utils/notifications";

const { data, unreadCount } = useNotificationsBell();
const { mutateAsync: markRead } = useMarkRead();

const notifications = computed(() => data.value?.notifications ?? []);

const markAllRead = () => markRead({ all: true });
</script>

<template>
  <UPopover :content="{ side: 'bottom', align: 'end', sideOffset: 8 }">
    <UButton color="neutral" variant="ghost" class="relative">
      <UIcon name="i-heroicons-bell" class="size-5" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center border border-[var(--stage-ink)] bg-[var(--stage-performer)] px-0.5 text-[10px] font-medium text-[var(--stage-cream)]"
      >
        {{ unreadCount > 9 ? "9+" : unreadCount }}
      </span>
    </UButton>

    <template #content>
      <div class="w-80 border-3 border-[var(--stage-ink)] bg-[var(--stage-cream)] shadow-[8px_8px_0_0_var(--stage-ink)]">
        <div
          class="flex items-center justify-between border-b-3 border-[var(--stage-ink)] bg-[var(--stage-theater)] px-3 py-2"
        >
          <p class="text-sm font-medium text-[var(--stage-ink)]">Notifications</p>
          <div class="flex gap-3">
            <button
              v-if="unreadCount > 0"
              class="text-xs font-semibold text-[var(--stage-ink)] underline underline-offset-2"
              @click="markAllRead"
            >
              Mark all read
            </button>
            <NuxtLink
              to="/notifications"
              class="text-xs font-semibold text-[var(--stage-ink)] underline underline-offset-2"
            >
              See all
            </NuxtLink>
          </div>
        </div>

        <div
          v-if="!notifications.length"
          class="px-3 py-6 text-center text-sm stage-muted"
        >
          No notifications yet.
        </div>

        <div v-else>
          <NuxtLink
            v-for="n in notifications"
            :key="n.id"
            :to="formatNotification(n.type, n.payload).href ?? '/notifications'"
            class="flex items-start gap-2 border-b border-[rgba(43,41,38,0.12)] px-3 py-2 transition-colors hover:bg-[var(--stage-paper-strong)]"
            :class="{ 'bg-[rgba(94,144,217,0.14)]': !n.read_at }"
            @click="!n.read_at && markRead({ ids: [n.id] })"
          >
            <span
              class="mt-1.5 size-2 shrink-0 border border-[var(--stage-ink)]"
              :class="n.read_at ? 'bg-transparent' : 'bg-[var(--stage-performer)]'"
            />
            <div class="flex-1 min-w-0">
              <p
                class="text-sm leading-snug"
                :class="n.read_at ? 'stage-muted' : 'text-[var(--stage-ink)] font-medium'"
              >
                {{ formatNotification(n.type, n.payload).text }}
              </p>
              <p class="mt-0.5 text-xs stage-muted">
                {{ new Date(n.created_at).toLocaleDateString() }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </template>
  </UPopover>
</template>
