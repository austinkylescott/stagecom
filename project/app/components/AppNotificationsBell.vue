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
    <UButton color="gray" variant="ghost" class="relative">
      <UIcon name="i-heroicons-bell" class="w-5 h-5" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium"
      >
        {{ unreadCount > 9 ? "9+" : unreadCount }}
      </span>
    </UButton>

    <template #content>
      <div class="w-80">
        <div
          class="flex items-center justify-between px-3 py-2 border-b border-slate-100"
        >
          <p class="text-sm font-medium">Notifications</p>
          <div class="flex gap-3">
            <button
              v-if="unreadCount > 0"
              class="text-xs text-blue-600 hover:underline"
              @click="markAllRead"
            >
              Mark all read
            </button>
            <NuxtLink
              to="/notifications"
              class="text-xs text-slate-500 hover:underline"
            >
              See all
            </NuxtLink>
          </div>
        </div>

        <div
          v-if="!notifications.length"
          class="px-3 py-6 text-sm text-slate-500 text-center"
        >
          No notifications yet.
        </div>

        <div v-else>
          <NuxtLink
            v-for="n in notifications"
            :key="n.id"
            :to="formatNotification(n.type, n.payload).href ?? '/notifications'"
            class="flex items-start gap-2 px-3 py-2 hover:bg-slate-50 transition-colors"
            :class="{ 'bg-blue-50': !n.read_at }"
            @click="!n.read_at && markRead({ ids: [n.id] })"
          >
            <span
              class="mt-1.5 h-2 w-2 rounded-full shrink-0"
              :class="n.read_at ? 'bg-transparent' : 'bg-blue-500'"
            />
            <div class="flex-1 min-w-0">
              <p
                class="text-sm leading-snug"
                :class="n.read_at ? 'text-slate-500' : 'text-slate-900'"
              >
                {{ formatNotification(n.type, n.payload).text }}
              </p>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ new Date(n.created_at).toLocaleDateString() }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </template>
  </UPopover>
</template>
