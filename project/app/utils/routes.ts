export const toCallsheetPath = () => "/callsheet";

export const toNotificationsPath = () => "/notifications";

export const toProfilePath = () => "/profile";

export const toTheatersPath = () => "/theaters";

export const toTheaterPath = (slug: string) => `/${slug}`;

export const toTheaterAdminPath = (slug: string) => `/${slug}/admin`;

export const toEventPath = (theaterSlug: string, eventSlug: string) =>
  `/${theaterSlug}/${eventSlug}`;

export const toEventCreatePath = (theaterSlug?: string | null) =>
  theaterSlug ? `/${theaterSlug}/new` : "/theaters";
