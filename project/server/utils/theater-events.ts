import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Enums, Tables } from "~/types/database.types";
import { hasStaffRole } from "./permissions";
import { canViewShow } from "./visibility-policy";

type ServiceSupabaseClient = SupabaseClient<Database>;

type TheaterRow = Pick<Tables<"theaters">, "id" | "name" | "slug">;

type MembershipContext = {
  roles: Enums<"theater_role">[];
  status: Enums<"membership_status"> | null;
  userId: string | null;
};

type ShowRow = Pick<
  Tables<"shows">,
  | "id"
  | "title"
  | "description"
  | "status"
  | "theater_id"
  | "event_type"
  | "casting_mode"
  | "is_public_listed"
  | "ticket_url"
>;

type EventTypeFilter = Enums<"event_type"> | "non_show";

type OccurrenceRow = Pick<
  Tables<"show_occurrences">,
  "id" | "show_id" | "starts_at" | "ends_at" | "status"
>;

type ShowRoleRow = Pick<Tables<"show_roles">, "show_id" | "role">;
type ShowCastVisibilityRow = Pick<
  Tables<"show_cast">,
  "show_id" | "source" | "status"
>;
type PersonRow = {
  show_id: string;
  user_id: string;
  profiles:
    | {
        display_name: string | null;
        avatar_url: string | null;
      }
    | {
        display_name: string | null;
        avatar_url: string | null;
      }[]
    | null;
};

export type TheaterEventPerson = {
  avatarUrl: string | null;
  displayName: string | null;
  userId: string;
};

export type TheaterEventItem = {
  cast: TheaterEventPerson[];
  endsAt: string | null;
  occurrenceId: string;
  occurrenceStatus: Enums<"show_occurrence_status">;
  producers: TheaterEventPerson[];
  show: {
    description: string | null;
    eventType: Enums<"event_type"> | null;
    id: string;
    status: Enums<"show_status">;
    theaterId: string;
    theaterName: string;
    theaterSlug: string;
    ticketUrl: string | null;
    title: string;
  };
  startsAt: string;
};

export type TheaterEventPeopleByShow = {
  castByShow: Map<string, TheaterEventPerson[]>;
  producersByShow: Map<string, TheaterEventPerson[]>;
};

export const titleCaseEnum = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const getVisibleTheaterShows = async ({
  membership,
  serviceSupabase,
  theaterId,
}: {
  membership: MembershipContext;
  serviceSupabase: ServiceSupabaseClient;
  theaterId: string;
}) => {
  const { data: shows, error: showError } = await serviceSupabase
    .from("shows")
    .select(
      "id,title,description,status,theater_id,event_type,casting_mode,is_public_listed,ticket_url",
    )
    .eq("theater_id", theaterId);

  if (showError) {
    throw createError({ statusCode: 500, statusMessage: showError.message });
  }

  const showRows = (shows as ShowRow[] | null | undefined) ?? [];
  return getVisibleTheaterShowsForRows({
    membership,
    serviceSupabase,
    shows: showRows,
  });
};

export const getTheaterShows = async ({
  eventType,
  serviceSupabase,
  theaterId,
}: {
  eventType?: EventTypeFilter;
  serviceSupabase: ServiceSupabaseClient;
  theaterId: string;
}) => {
  let showQuery = serviceSupabase
    .from("shows")
    .select(
      "id,title,description,status,theater_id,event_type,casting_mode,is_public_listed,ticket_url",
    )
    .eq("theater_id", theaterId);

  if (eventType === "non_show") {
    showQuery = showQuery.neq("event_type", "show");
  } else if (eventType) {
    showQuery = showQuery.eq("event_type", eventType);
  }

  const { data: shows, error: showError } = await showQuery;

  if (showError) {
    throw createError({ statusCode: 500, statusMessage: showError.message });
  }

  return (shows as ShowRow[] | null | undefined) ?? [];
};

export const getVisibleTheaterShowsForRows = async ({
  membership,
  serviceSupabase,
  shows,
}: {
  membership: MembershipContext;
  serviceSupabase: ServiceSupabaseClient;
  shows: ShowRow[];
}) => {
  if (!shows.length) {
    return [] satisfies ShowRow[];
  }

  let roleRows: ShowRoleRow[] = [];
  let castRows: ShowCastVisibilityRow[] = [];

  if (membership.userId) {
    const [
      { data: fetchedRoleRows, error: roleError },
      { data: fetchedCastRows, error: castError },
    ] = await Promise.all([
      serviceSupabase
        .from("show_roles")
        .select("show_id,role")
        .in(
          "show_id",
          shows.map((show) => show.id),
        )
        .eq("user_id", membership.userId),
      serviceSupabase
        .from("show_cast")
        .select("show_id,source,status")
        .in(
          "show_id",
          shows.map((show) => show.id),
        )
        .eq("user_id", membership.userId),
    ]);

    if (roleError) {
      throw createError({ statusCode: 500, statusMessage: roleError.message });
    }

    if (castError) {
      throw createError({ statusCode: 500, statusMessage: castError.message });
    }

    roleRows = (fetchedRoleRows as ShowRoleRow[] | null | undefined) ?? [];
    castRows =
      (fetchedCastRows as ShowCastVisibilityRow[] | null | undefined) ?? [];
  }

  const producerShowIds = new Set(
    roleRows.filter((row) => row.role === "producer").map((row) => row.show_id),
  );
  const castByShowId = new Map(castRows.map((row) => [row.show_id, row]));
  const isTheaterStaff =
    membership.status === "active" && hasStaffRole(membership.roles);

  return shows.filter((show) =>
    canViewShow(
      {
        status: show.status,
        isPublicListed: show.is_public_listed,
        castingMode: show.casting_mode,
      },
      {
        userId: membership.userId,
        isProducer: producerShowIds.has(show.id),
        isTheaterStaff,
        isActiveTheaterMember: membership.status === "active",
        viewerCast: castByShowId.get(show.id) ?? null,
      },
    ),
  );
};

export const getTheaterOccurrenceRows = async ({
  fromIso,
  limit,
  offset,
  serviceSupabase,
  shows,
  toIso,
}: {
  fromIso?: string;
  limit?: number;
  offset?: number;
  serviceSupabase: ServiceSupabaseClient;
  shows: ShowRow[];
  toIso?: string;
}) => {
  if (!shows.length) {
    return [] satisfies OccurrenceRow[];
  }

  let occurrenceQuery = serviceSupabase
    .from("show_occurrences")
    .select("id,show_id,starts_at,ends_at,status")
    .in(
      "show_id",
      shows.map((show) => show.id),
    )
    .order("starts_at", { ascending: true });

  if (fromIso) {
    occurrenceQuery = occurrenceQuery.gte("starts_at", fromIso);
  }

  if (toIso) {
    occurrenceQuery = occurrenceQuery.lt("starts_at", toIso);
  }

  if (limit) {
    occurrenceQuery = occurrenceQuery.limit(limit);
  }

  if (offset) {
    occurrenceQuery = occurrenceQuery.range(offset, offset + (limit ?? 1000) - 1);
  }

  const { data: occurrences, error: occurrenceError } = await occurrenceQuery;

  if (occurrenceError) {
    throw createError({
      statusCode: 500,
      statusMessage: occurrenceError.message,
    });
  }

  return (occurrences as OccurrenceRow[] | null | undefined) ?? [];
};

export const getTheaterEventPeopleByShow = async ({
  serviceSupabase,
  shows,
}: {
  serviceSupabase: ServiceSupabaseClient;
  shows: ShowRow[];
}) => {
  const producersByShow = new Map<string, TheaterEventPerson[]>();
  const castByShow = new Map<string, TheaterEventPerson[]>();

  if (!shows.length) {
    return {
      castByShow,
      producersByShow,
    } satisfies TheaterEventPeopleByShow;
  }

  const [
    { data: producerRows, error: producerError },
    { data: castRows, error: castError },
  ] = await Promise.all([
    serviceSupabase
      .from("show_roles")
      .select("show_id,user_id,profiles(display_name,avatar_url)")
      .in(
        "show_id",
        shows.map((show) => show.id),
      )
      .eq("role", "producer"),
    serviceSupabase
      .from("show_cast")
      .select("show_id,user_id,profiles(display_name,avatar_url)")
      .in(
        "show_id",
        shows.map((show) => show.id),
      )
      .eq("status", "accepted")
      .order("program_order", { ascending: true, nullsFirst: false }),
  ]);

  if (producerError) {
    throw createError({
      statusCode: 500,
      statusMessage: producerError.message,
    });
  }

  if (castError) {
    throw createError({
      statusCode: 500,
      statusMessage: castError.message,
    });
  }

  for (const row of (producerRows as PersonRow[] | null | undefined) ?? []) {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const items = producersByShow.get(row.show_id) ?? [];
    items.push({
      avatarUrl: profile?.avatar_url ?? null,
      displayName: profile?.display_name ?? null,
      userId: row.user_id,
    });
    producersByShow.set(row.show_id, items);
  }

  for (const row of (castRows as PersonRow[] | null | undefined) ?? []) {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const items = castByShow.get(row.show_id) ?? [];
    items.push({
      avatarUrl: profile?.avatar_url ?? null,
      displayName: profile?.display_name ?? null,
      userId: row.user_id,
    });
    castByShow.set(row.show_id, items);
  }

  return {
    castByShow,
    producersByShow,
  } satisfies TheaterEventPeopleByShow;
};

export const buildTheaterEventItems = ({
  includePeople = true,
  occurrences,
  peopleByShow,
  shows,
  theater,
}: {
  includePeople?: boolean;
  occurrences: OccurrenceRow[];
  peopleByShow?: TheaterEventPeopleByShow;
  shows: ShowRow[];
  theater: TheaterRow;
}) => {
  if (!occurrences.length) {
    return [] satisfies TheaterEventItem[];
  }

  const showById = new Map(shows.map((show) => [show.id, show]));
  const producersByShow = peopleByShow?.producersByShow ?? new Map();
  const castByShow = peopleByShow?.castByShow ?? new Map();

  return occurrences.flatMap((occurrence) => {
    const show = showById.get(occurrence.show_id);
    if (!show) {
      return [];
    }

    return [
      {
        cast: includePeople ? castByShow.get(show.id) ?? [] : [],
        endsAt: occurrence.ends_at,
        occurrenceId: occurrence.id,
        occurrenceStatus: occurrence.status,
        producers: includePeople ? producersByShow.get(show.id) ?? [] : [],
        show: {
          description: show.description,
          eventType: show.event_type,
          id: show.id,
          status: show.status,
          theaterId: theater.id,
          theaterName: theater.name,
          theaterSlug: theater.slug,
          ticketUrl: show.ticket_url,
          title: show.title,
        },
        startsAt: occurrence.starts_at,
      },
    ];
  });
};

export const getTheaterEventItems = async ({
  fromIso,
  includePeople = true,
  limit,
  serviceSupabase,
  shows,
  theater,
  toIso,
}: {
  fromIso?: string;
  includePeople?: boolean;
  limit?: number;
  serviceSupabase: ServiceSupabaseClient;
  shows: ShowRow[];
  theater: TheaterRow;
  toIso?: string;
}) => {
  if (!shows.length) {
    return [] satisfies TheaterEventItem[];
  }

  const occurrenceRows = await getTheaterOccurrenceRows({
    fromIso,
    limit,
    serviceSupabase,
    shows,
    toIso,
  });

  if (!occurrenceRows.length) {
    return [] satisfies TheaterEventItem[];
  }

  const peopleByShow = includePeople
    ? await getTheaterEventPeopleByShow({
        serviceSupabase,
        shows,
      })
    : undefined;

  return buildTheaterEventItems({
    includePeople,
    occurrences: occurrenceRows,
    peopleByShow,
    shows,
    theater,
  });
};
