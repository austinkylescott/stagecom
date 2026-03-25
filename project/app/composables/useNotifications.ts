import { useQuery, useMutation, useQueryCache } from "@pinia/colada";
import { computed } from "vue";
import type { Ref } from "vue";
import {
  notificationsBellQueryOptions,
  notificationsPageQueryOptions,
  type NotificationsPageParams,
  type NotificationsResponse,
} from "~/queries/notifications";
import { queryKeys } from "~/composables/queryKeys";

export const useNotificationsBell = () => {
  const query = useQuery(notificationsBellQueryOptions);
  const unreadCount = computed(
    () =>
      (query.data.value?.notifications ?? []).filter((n) => !n.read_at).length,
  );
  return { ...query, unreadCount };
};

export const useNotificationsPage = (
  params: Ref<NotificationsPageParams>,
  initialData?: Ref<NotificationsResponse | null | undefined>,
) => {
  const queryOptions = computed(() =>
    notificationsPageQueryOptions(params.value),
  );

  const query = useQuery({
    key: () => queryOptions.value.key,
    query: (context) => queryOptions.value.query(context),
    staleTime: () => queryOptions.value.staleTime,
    initialData: () => initialData?.value ?? undefined,
  });

  return { ...query };
};

export const useMarkRead = () => {
  const queryCache = useQueryCache();

  return useMutation<void, { ids?: string[]; all?: boolean }>({
    mutation: (body) =>
      $fetch("/api/notifications/read", {
        method: "POST",
        credentials: "include",
        body,
      }),
    onSuccess: () => {
      queryCache.invalidateQueries({
        key: queryKeys.notifications(),
        exact: true,
      });
      queryCache.invalidateQueries({
        key: queryKeys.notificationsPage({ filter: "all", page: 1 }),
        exact: false,
      });
    },
  });
};
