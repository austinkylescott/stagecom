<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import {
  useNotificationsBell,
  useMarkRead,
} from "~/composables/useNotifications";
import {
  stageButtonToneClasses,
  type StageButtonTone,
} from "~/utils/stageButtonTone";
import { formatNotification } from "~/utils/notifications";

type NotificationDropdownItem = DropdownMenuItem & {
  unread?: boolean;
};

const { data, unreadCount } = useNotificationsBell();
const { mutateAsync: markRead } = useMarkRead();

const notifications = computed(() => data.value?.notifications ?? []);

const markAllRead = () => markRead({ all: true });

const latestNotificationToneClass = computed(() => {
  const latestType = notifications.value[0]?.type;

  if (!latestType) return "bg-(--stage-paper-strong)";
  if (latestType.startsWith("cast.")) return "bg-(--stage-performer-soft)";
  if (["show.submitted_for_review", "show.approved"].includes(latestType)) {
    return "bg-(--stage-theater-soft)";
  }

  return "bg-(--stage-paper-strong)";
});

const notificationButtonTone = computed<StageButtonTone>(() => {
  const latestType = notifications.value[0]?.type;

  if (!latestType) return "neutral";
  if (latestType.startsWith("cast.")) return "performer";
  if (["show.submitted_for_review", "show.approved"].includes(latestType)) {
    return "theater";
  }

  return "neutral";
});

const notificationItems = computed<NotificationDropdownItem[][]>(() => [
  notifications.value.map((notification) => {
    const formatted = formatNotification(notification.type, notification.payload);

    return {
      label: formatted.text,
      description: new Date(notification.created_at).toLocaleDateString(),
      to: formatted.href ?? "/notifications",
      icon: "i-heroicons-bell",
      unread: !notification.read_at,
      onSelect: () => {
        if (!notification.read_at) {
          return markRead({ ids: [notification.id] });
        }
      },
    } satisfies DropdownMenuItem;
  }),
]);
</script>

<template>
  <AppHeaderDropdown
    :items="notificationItems"
    :header-tone-class="latestNotificationToneClass"
  >
    <template #default="{ open }">
    <UButton
      color="neutral"
      variant="ghost"
      :class="['relative', stageButtonToneClasses(notificationButtonTone, open)]"
    >
      <UIcon name="i-heroicons-bell" class="size-5" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center border border-(--stage-ink) bg-(--stage-performer) px-0.5 text-[10px] font-medium text-(--stage-cream)"
      >
        {{ unreadCount > 9 ? "9+" : unreadCount }}
      </span>
    </UButton>
    </template>

    <template #header>
      <p class="text-sm font-medium text-(--stage-ink)">Notifications</p>
    </template>

    <template #header-actions>
      <div class="flex gap-3">
        <button
          v-if="unreadCount > 0"
          class="text-xs font-semibold text-(--stage-ink) underline underline-offset-2"
          @click="markAllRead"
        >
          Mark all read
        </button>
        <NuxtLink
          to="/notifications"
          class="text-xs font-semibold text-(--stage-ink) underline underline-offset-2"
        >
          See all
        </NuxtLink>
      </div>
    </template>

    <template #content-bottom>
      <div
        v-if="!notifications.length"
        class="px-3 py-6 text-center text-sm stage-muted"
      >
        No notifications yet.
      </div>
    </template>

    <template #item-leading="{ item }">
      <span
        class="mt-1.5 size-2 shrink-0 border border-(--stage-ink)"
        :class="item.unread ? 'bg-(--stage-performer)' : 'bg-transparent'"
      />
    </template>

    <template #item-label="{ item }">
      <span :class="item.unread ? 'font-medium text-(--stage-ink)' : 'stage-muted'">
        {{ item.label }}
      </span>
    </template>

    <template #item-description="{ item }">
      {{ item.description }}
    </template>
  </AppHeaderDropdown>
</template>
