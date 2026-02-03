export const useLocationFormatter = () => {
  const formatLocation = (loc?: {
    city?: string | null;
    state_region?: string | null;
    country?: string | null;
  }) => {
    const parts = [loc?.city, loc?.state_region, loc?.country].filter(Boolean);
    return parts.join(", ") || "Location TBD";
  };

  return { formatLocation };
};
