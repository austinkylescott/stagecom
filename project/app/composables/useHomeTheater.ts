import { useQuery } from "@pinia/colada";
import { homeTheaterQueryOptions } from "~/queries/home";

export type { HomePayload } from "~/queries/home";

export const useHomeTheater = () => {
  const query = useQuery(homeTheaterQueryOptions);

  return { ...query };
};
