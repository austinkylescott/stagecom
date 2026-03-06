import { useMutation, useQueryCache } from "@pinia/colada";
import type { FetchError } from "ofetch";
import {
  type CreateShowInput,
  invalidateShowRelatedQueries,
} from "~/queries/shows";

export const useCreateShow = (slug: string) => {
  const queryCache = useQueryCache();

  return useMutation<void, CreateShowInput>({
    mutation: ({ submitForReview, payload }) =>
      $fetch(`/api/theaters/${slug}/shows`, {
        method: "POST",
        body: { ...payload, submitForReview },
        credentials: "include",
      }),
    onSuccess: () => invalidateShowRelatedQueries(queryCache, slug),
  });
};

export type CreateShowError = FetchError<any> | Error;
