import { computed } from "vue";
import type { ComputedRef, Ref } from "vue";
import { useSearchQuery } from "~/composables/useSearchQuery";
import { useTheaterSearch } from "~/composables/useTheaterSearch";

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

  const { data, pending, error, refresh } = useTheaterSearch({
    search: debouncedSearch,
    sort,
    page,
  });

  const mutateMembership = (theater: any, isMember: boolean) => {
    if (!theater?.id || !data.value) return;

    const updatedAll =
      data.value.theaters?.map((t: any) =>
        t.id === theater.id ? { ...t, isMember } : t,
      ) ?? [];

    let updatedMine = data.value.myTheaters ?? [];
    if (isMember) {
      const alreadyThere = updatedMine.some((t: any) => t.id === theater.id);
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

    data.value = {
      ...data.value,
      theaters: updatedAll,
      myTheaters: updatedMine,
    };
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
    pending,
    error,
    refresh,
    myTheaters,
    allTheaters,
    totalPages,
    showPagination,
    mutateMembership,
  };
};
