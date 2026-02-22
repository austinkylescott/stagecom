import { defineQueryOptions, useQuery } from "@pinia/colada";
import { computed } from "vue";
import type { Ref } from "vue";
import { useRequestHeaders } from "#app";
import { queryKeys } from "~/composables/queryKeys";

type TheaterDetails = {
  theater: {
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    street: string | null;
    city: string | null;
    state_region: string | null;
    postal_code: string | null;
    country: string | null;
  };
  membership: {
    status: string | null;
    roles: string[];
    isHome: boolean;
  };
  permissions: {
    canReview: boolean;
  };
  stats: {
    memberCount: number;
    totalShows: number;
    pendingReviewCount: number;
    publicShowCount: number;
  };
  shows: {
    public: {
      id: string;
      title: string;
      description: string | null;
      startsAt: string | null;
    }[];
  };
};

type Params = { slug: string };

const theaterDetailsQueryOptions = defineQueryOptions<Params, TheaterDetails>(
  (params) =>
    ({
      key: queryKeys.theater(params?.slug || ""),
      query: () => {
        const headers = import.meta.server
          ? useRequestHeaders(["cookie"])
          : undefined;
        return $fetch<TheaterDetails>(`/api/theaters/${params?.slug}`, {
          headers,
          credentials: "include",
        });
      },
      enabled: Boolean(params?.slug),
      staleTime: 20_000,
    }) as const,
);

export const useTheaterDetails = (slug: Ref<string>) => {
  const params = computed<Params>(() => ({ slug: slug.value }));
  const query = useQuery(theaterDetailsQueryOptions, params);
  return { ...query };
};
