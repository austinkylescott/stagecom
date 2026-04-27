export const slugifyText = (value: string, fallback = "item") => {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return base || fallback;
};

export const generateUniqueSlug = async ({
  baseValue,
  exists,
  fallback = "item",
}: {
  baseValue: string;
  exists: (candidate: string) => Promise<boolean>;
  fallback?: string;
}) => {
  const baseSlug = slugifyText(baseValue, fallback);

  let suffix = 1;
  let candidate = baseSlug;

  while (await exists(candidate)) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }

  return candidate;
};
