import type { TheaterDetails } from "~/queries/theaters";

export type TheaterAlert = {
  id: string;
  title: string;
  description: string;
  posted: string;
  expires: string;
};

type TheaterIdentity = TheaterDetails["theater"] | null | undefined;

export const getTheaterFullAddress = (theater: TheaterIdentity) => {
  const parts = [
    theater?.street,
    theater?.city,
    theater?.state_region,
    theater?.postal_code,
    theater?.country,
  ].filter(Boolean);

  return parts.join(", ") || "Address not posted";
};

export const getTheaterInitials = (name: string | null | undefined) => {
  const trimmed = name?.trim();
  if (!trimmed) return "?";

  const words = trimmed.split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
};
