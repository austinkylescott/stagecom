import { defineQueryOptions } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";
import type { NotificationPayload } from "~/utils/notifications";

export type NotificationItem = {
  id: string;
  type: string;
  entity_type: string;
  entity_id: string;
  payload: NotificationPayload | null;
  dedupe_key: string;
  read_at: string | null;
  created_at: string;
};

export type NotificationsResponse = {
  notifications: NotificationItem[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

export type NotificationsBellResponse = {
  notifications: NotificationItem[];
};

export type NotificationsPageParams = {
  filter: string;
  page: number;
};

export const notificationsBellQueryOptions = defineQueryOptions<
  void,
  NotificationsBellResponse
>(() => {
  const headers = import.meta.server
    ? useRequestHeaders(["cookie"])
    : undefined;

  return {
    key: queryKeys.notifications(),
    query: () =>
      $fetch<NotificationsBellResponse>("/api/notifications", {
        credentials: "include",
        headers,
        params: { filter: "all", page: 1, pageSize: 5 },
      }),
    staleTime: 10_000,
  } as const;
});

export const notificationsPageQueryOptions = defineQueryOptions<
  NotificationsPageParams,
  NotificationsResponse
>((params) => {
  const headers = import.meta.server
    ? useRequestHeaders(["cookie"])
    : undefined;

  return {
    key: queryKeys.notificationsPage({
      filter: params?.filter ?? "all",
      page: params?.page ?? 1,
    }),
    query: () =>
      $fetch<NotificationsResponse>("/api/notifications", {
        credentials: "include",
        headers,
        params: {
          filter: params?.filter ?? "all",
          page: params?.page ?? 1,
          pageSize: 30,
        },
      }),
    staleTime: 30_000,
  } as const;
});
