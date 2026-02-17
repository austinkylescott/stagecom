import { useHomeTheaterStore } from "~/stores/homeTheater";

export const useHomeTheater = () => {
  const store = useHomeTheaterStore();

  return useAsyncData(
    "home-theater",
    async () => {
      try {
        const payload = await $fetch<{
          theater: any;
          shows: any[];
          candidates?: any[];
        }>("/api/me/home-theater", {
          credentials: "include",
          headers: import.meta.server
            ? useRequestHeaders(["cookie"])
            : undefined,
        });

        store.setPayload(payload);
        return payload;
      } catch (err: any) {
        // If not authenticated, fall back to an empty payload so SSR doesn't crash or mismatch.
        if (err?.status === 401 || err?.statusCode === 401) {
          const empty = { theater: null, shows: [], candidates: [] };
          store.setPayload(empty);
          return empty;
        }
        throw err;
      }
    },
    {
      default: () => store.snapshot,
      server: false,
      // We still revalidate on navigation, but start with the last snapshot to avoid flicker.
      lazy: false,
    },
  );
};
