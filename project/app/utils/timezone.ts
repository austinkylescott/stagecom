export const DEFAULT_TIMEZONE = "UTC";

export const isValidTimeZone = (value: string | null | undefined) => {
  if (!value) return false;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

export const normalizeTimeZone = (value: string | null | undefined) =>
  isValidTimeZone(value) ? value : DEFAULT_TIMEZONE;

export const getTimeZoneDateKey = (
  value: string | null | undefined,
  timeZone: string,
) => {
  if (!value) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: normalizeTimeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return year && month && day ? `${year}-${month}-${day}` : "";
};
