import { useQuery } from "@pinia/colada";
import { computed, type Ref } from "vue";
import {
  homeTheaterDashboardQueryOptions,
  type HomeTheaterDashboardResponse,
} from "~/queries/home";

export type { HomeTheaterDashboardResponse } from "~/queries/home";

export const useHomeTheaterDashboard = (slug: Ref<string>) => {
  const params = computed(() => ({ slug: slug.value }));
  const queryOptions = computed(() => homeTheaterDashboardQueryOptions(params.value));

  const query = useQuery({
    key: () => queryOptions.value.key,
    query: (context) => queryOptions.value.query(context),
    enabled: () => import.meta.client && (queryOptions.value.enabled ?? true),
    staleTime: () => queryOptions.value.staleTime,
  });

  return { ...query };
};
