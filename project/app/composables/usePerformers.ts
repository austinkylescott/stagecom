import { useQuery } from "@pinia/colada";
import { performersQueryOptions, type PerformersResponse } from "~/queries/people";

export type { PerformersResponse } from "~/queries/people";

export const usePerformers = () => {
  const query = useQuery(performersQueryOptions);
  return { ...query };
};
