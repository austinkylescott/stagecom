import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database.types";

export type CastEventType =
  | "cast.invited"
  | "cast.accepted"
  | "cast.declined"
  | "cast.withdrawn"
  | "cast.removed_by_producer";

export type ShowEventType = "show.approved" | "show.rejected";

type CastEventBase = {
  showId: string;
  showTitle: string;
  theaterSlug: string;
  actorName: string;
  recipientId: string;
};

type ShowEventBase = {
  showId: string;
  showTitle: string;
  theaterSlug: string;
  note?: string;
  recipientId: string;
};

export type NotifyEvent =
  | ({ type: CastEventType } & CastEventBase)
  | ({ type: ShowEventType } & ShowEventBase);

export const buildCastEvent = (
  type: CastEventType,
  base: CastEventBase,
): NotifyEvent => ({ type, ...base });

const EMAIL_TYPES = new Set<string>([
  "cast.invited",
  "show.approved",
  "show.rejected",
]);

const getServiceClient = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase service role env vars");
  return createClient<Database>(url, key);
};

export const emitEvent = async (event: NotifyEvent): Promise<void> => {
  const supabase = getServiceClient();
  const dedupeKey = `${event.type}:${event.showId}:${event.recipientId}`;

  const { error: notifError } = await supabase.from("notifications").upsert(
    {
      user_id: event.recipientId,
      type: event.type,
      entity_type: "show" as const,
      entity_id: event.showId,
      payload: { ...event },
      dedupe_key: dedupeKey,
    },
    { onConflict: "user_id,dedupe_key", ignoreDuplicates: true },
  );

  if (notifError) {
    console.error("[emitEvent] notification insert failed", notifError);
  }

  if (EMAIL_TYPES.has(event.type)) {
    const { error: emailError } = await supabase.from("email_outbox").upsert(
      {
        user_id: event.recipientId,
        template: event.type,
        payload: { ...event },
        dedupe_key: dedupeKey,
        status: "queued" as const,
      },
      { onConflict: "user_id,dedupe_key", ignoreDuplicates: true },
    );

    if (emailError) {
      console.error("[emitEvent] email_outbox insert failed", emailError);
    }
  }
};
