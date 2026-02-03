export const useHomeTheater = () => {
  return useAsyncData(
    "home-theater",
    async () => {
      try {
        return await $fetch<{ theater: any; shows: any[]; candidates?: any[] }>(
          "/api/me/home-theater",
          {
            credentials: "include",
            headers: import.meta.server
              ? useRequestHeaders(["cookie"])
              : undefined,
          },
        );
      } catch (err: any) {
        // If not authenticated, fall back to an empty payload so SSR doesn't crash or mismatch.
        if (err?.status === 401 || err?.statusCode === 401) {
          return { theater: null, shows: [], candidates: [] };
        }
        throw err;
      }
    },
    {
      default: () => ({ theater: null, shows: [], candidates: [] }),
      server: false,
    },
  );
};
