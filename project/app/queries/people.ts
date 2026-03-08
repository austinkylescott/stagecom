import { defineQueryOptions } from "@pinia/colada";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";

export type PerformersQueryParams = {
  search: string;
  page: number;
  pageSize: number;
};

export type PerformersResponse = {
  profiles: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    visibility: "public" | "theater_only" | "private";
  }[];
  memberships: {
    user_id: string;
    theater_id: string;
    status: "active";
  }[];
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
};

export const performersQueryOptions = defineQueryOptions<
  PerformersQueryParams,
  PerformersResponse
>(
  (params) =>
    ({
      key: queryKeys.performers({
        search: params?.search || "",
        page: params?.page || 1,
        pageSize: params?.pageSize || 24,
      }),
      query: async () => {
        const headers = import.meta.server
          ? useRequestHeaders(["cookie"])
          : undefined;

        return await $fetch<PerformersResponse>("/api/performers", {
          credentials: "include",
          headers,
          params: {
            search: params?.search || undefined,
            page: params?.page || 1,
            pageSize: params?.pageSize || 24,
          },
        });
      },
      staleTime: 30_000,
    }) as const,
);
