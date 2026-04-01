export const isValidTimeZone = (value: string | null | undefined) => {
  if (!value) return false;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
};
