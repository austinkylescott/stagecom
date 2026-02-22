import { computed } from "vue";
import type { ComputedRef, Ref } from "vue";
import { useQueryCache } from "@pinia/colada";
import { useSearchQuery } from "~/composables/useSearchQuery";
import { useTheaterSearch } from "~/composables/useTheaterSearch";
import { queryKeys } from "~/composables/queryKeys";

type Theater = {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  city?: string | null;
  state_region?: string | null;
  country?: string | null;
  isMember?: boolean;
  isHome?: boolean;
};

export const useTheaterSearchPage = (homeId: ComputedRef<string | null>) => {
  const {
    searchInput: search,
    search: debouncedSearch,
    sort,
    page,
  } = useSearchQuery<"name_asc" | "recent" | "next_show">({
    initialSort: "name_asc",
    debounce: 300,
    maxWait: 800,
  });

  const { data, isLoading, error, refresh } = useTheaterSearch({
    search: debouncedSearch,
    sort,
    page,
  });

  const queryCache = useQueryCache();
  const mutateMembership = (theater: any, isMember: boolean) => {
    if (!theater?.id) return;

    queryCache.setQueriesData(
      { key: queryKeys.theaters(), exact: false },
      (previous: any) => {
        if (!previous) return previous;

        const updatedAll =
          previous.theaters?.map((t: any) =>
            t.id === theater.id ? { ...t, isMember } : t,
          ) ?? [];

        let updatedMine = previous.myTheaters ?? [];
        if (isMember) {
          const alreadyThere = updatedMine.some(
            (t: any) => t.id === theater.id,
          );
          if (!alreadyThere) {
            updatedMine = [{ ...theater, isMember: true }, ...updatedMine];
          } else {
            updatedMine = updatedMine.map((t: any) =>
              t.id === theater.id ? { ...t, isMember: true } : t,
            );
          }
        } else {
          updatedMine = updatedMine.filter((t: any) => t.id !== theater.id);
        }

        return {
          ...previous,
          theaters: updatedAll,
          myTheaters: updatedMine,
        };
      },
    );
  };

  const myTheaters: Ref<Theater[]> = computed(() =>
    (data.value?.myTheaters || []).map((t: any) => ({
      ...t,
      isMember: true,
      isHome: homeId.value === t.id,
    })),
  );

  const allTheaters: Ref<Theater[]> = computed(() =>
    (data.value?.theaters || []).map((t: any) => ({
      ...t,
      isHome: homeId.value === t.id,
    })),
  );

  const totalPages = computed(() => data.value?.totalPages ?? 1);
  const showPagination = computed(() => totalPages.value > 1);

  return {
    search,
    sort,
    page,
    data,
    isLoading,
    error,
    refresh,
    myTheaters,
    allTheaters,
    totalPages,
    showPagination,
    mutateMembership,
  };
};
