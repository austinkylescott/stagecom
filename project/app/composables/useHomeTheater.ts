import { defineQueryOptions, useQuery } from "@pinia/colada";
import { watch } from "vue";
import { useRequestHeaders } from "#app";
import { useHomeTheaterStore } from "~/stores/homeTheater";
import { queryKeys } from "~/composables/queryKeys";

type HomePayload = {
  theater: any | null;
  shows: any[];
  candidates?: any[];
};

const homeTheaterQueryOptions = defineQueryOptions<void, HomePayload>(
  () =>
    ({
      key: queryKeys.homeTheater(),
      query: async () => {
        try {
          return await $fetch<HomePayload>("/api/me/home-theater", {
            credentials: "include",
            headers: import.meta.server
              ? useRequestHeaders(["cookie"])
              : undefined,
          });
        } catch (err: any) {
          // Not authenticated: return a stable empty payload.
          if (err?.status === 401 || err?.statusCode === 401) {
            return { theater: null, shows: [], candidates: [] };
          }
          throw err;
        }
      },
      staleTime: 15_000,
    }) as const,
);

export const useHomeTheater = () => {
  const store = useHomeTheaterStore();
  const query = useQuery(homeTheaterQueryOptions);

  // Keep the store synced for any legacy consumers.
  watch(
    () => query.data.value,
    (value) => {
      if (value) store.setPayload(value);
    },
    { immediate: true },
  );

  return { ...query };
};
