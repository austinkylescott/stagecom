import { watchDebounced } from "@vueuse/core";
import { ref, watch } from "vue";

type UseSearchQueryOptions<TSort extends string> = {
  initialSearch?: string;
  initialSort: TSort;
  initialPage?: number;
  debounce?: number;
  maxWait?: number;
};

export const useSearchQuery = <TSort extends string>(
  options: UseSearchQueryOptions<TSort>,
) => {
  const {
    initialSearch = "",
    initialSort,
    initialPage = 1,
    debounce = 300,
    maxWait = 800,
  } = options;

  const searchInput = ref(initialSearch);
  const search = ref(initialSearch.trim());
  const sort = ref<TSort>(initialSort);
  const page = ref(initialPage);

  watchDebounced(
    searchInput,
    (value) => {
      search.value = value.trim();
      page.value = 1;
    },
    { debounce, maxWait },
  );

  watch(sort, () => {
    page.value = 1;
  });

  return {
    searchInput,
    search,
    sort,
    page,
  };
};
