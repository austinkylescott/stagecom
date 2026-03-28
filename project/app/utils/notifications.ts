export type NotificationPayload = {
  showId?: string;
  showTitle?: string;
  theaterSlug?: string;
  actorName?: string;
  note?: string;
  occurrenceId?: string;
  startsAt?: string;
};

export type FormattedNotification = {
  text: string;
  href: string | null;
};

export const formatNotification = (
  type: string,
  payload: NotificationPayload | null,
): FormattedNotification => {
  const p = payload ?? {};
  const href =
    p.theaterSlug && p.showId
      ? `/theaters/${p.theaterSlug}/shows/${p.showId}`
      : null;

  const show = p.showTitle ? `"${p.showTitle}"` : "a show";
  const actor = p.actorName ?? "Someone";

  const text = (() => {
    switch (type) {
      case "show.submitted_for_review":
        return `${show} was submitted for review`;
      case "cast.invited":
        return `${actor} invited you to perform in ${show}`;
      case "cast.requested":
        return `${actor} requested to perform in ${show}`;
      case "cast.request_approved":
        return `${actor} approved your request to perform in ${show}`;
      case "cast.accepted":
        return `${actor} accepted their invite to ${show}`;
      case "cast.declined":
        return `${actor} declined their invite to ${show}`;
      case "cast.withdrawn":
        return `${actor} withdrew from ${show}`;
      case "cast.removed_by_producer":
        return `You were removed from the cast of ${show}`;
      case "show.approved":
        return `${show} was approved`;
      case "show.rejected":
        return `${show} was rejected${p.note ? `: ${p.note}` : ""}`;
      default:
        return `New notification for ${show}`;
    }
  })();

  return { text, href };
};
