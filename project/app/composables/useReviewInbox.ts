import { useQuery } from "@pinia/colada";
import type { Ref } from "vue";
import {
  reviewInboxQueryOptions,
  type ReviewInboxResponse,
} from "~/queries/review";

export type { ReviewInboxResponse, ReviewInboxShow } from "~/queries/review";

export const useReviewInbox = (
  initialData?: Ref<ReviewInboxResponse | null | undefined>,
) => {
  const query = useQuery({
    ...reviewInboxQueryOptions(),
    initialData: () => initialData?.value ?? undefined,
  });
  return { ...query };
};
