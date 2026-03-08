import { useMutation, useQueryCache } from "@pinia/colada";
import {
  applyOptimisticHomeTheaterUpdate,
  invalidateHomeTheaterRelatedQueries,
  rollbackHomeTheaterUpdate,
  saveHomeTheater,
  type HomePayload,
  type SaveHomeInput,
} from "~/queries/home";

export const useHomeTheaterMutation = () => {
  const queryCache = useQueryCache();

  const mutation = useMutation<
    void,
    SaveHomeInput,
    unknown,
    { previous?: HomePayload }
  >({
    mutation: saveHomeTheater,
    onMutate: ({ theaterId }) => ({
      previous: applyOptimisticHomeTheaterUpdate(queryCache, theaterId),
    }),
    onSuccess: () => invalidateHomeTheaterRelatedQueries(queryCache),
    onError: (_err, _vars, ctx) => {
      rollbackHomeTheaterUpdate(queryCache, ctx?.previous);
    },
  });

  const saveHome = async (theaterId: string | null) => {
    await mutation.mutateAsync({ theaterId });
  };

  return { saveHome };
};
