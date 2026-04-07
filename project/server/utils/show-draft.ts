import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "~/types/database.types";

export const SHOW_STAFF_ASSIGNMENT_TYPES = [
  "front_of_house",
  "box_office",
  "bar",
  "tech",
  "other",
] as const;

export const SHOW_STAFF_ASSIGNMENT_STATUSES = [
  "assigned",
  "confirmed",
  "cancelled",
] as const;

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const emptyToNull = (value: unknown) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  return value;
};

const normalizeDateInput = (value: unknown) => {
  const normalized = emptyToUndefined(value);
  if (normalized === undefined) return undefined;
  if (typeof normalized !== "string") return normalized;

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return normalized;

  return date.toISOString();
};

export const showOccurrenceInputSchema = z
  .object({
    startsAt: z.preprocess(normalizeDateInput, z.string().datetime()),
    endsAt: z
      .preprocess((value) => {
        const normalized = normalizeDateInput(value);
        return normalized === undefined ? null : normalized;
      }, z.string().datetime().nullable())
      .optional()
      .default(null),
  })
  .refine(
    (value) =>
      value.endsAt === null ||
      new Date(value.endsAt).getTime() > new Date(value.startsAt).getTime(),
    {
      message: "Occurrence end time must be after the start time",
      path: ["endsAt"],
    },
  );

export const showStaffAssignmentInputSchema = z.object({
  userId: z.string().uuid(),
  assignmentType: z.enum(SHOW_STAFF_ASSIGNMENT_TYPES),
  status: z.enum(SHOW_STAFF_ASSIGNMENT_STATUSES).optional().default("assigned"),
  note: z.preprocess(emptyToNull, z.string().trim().nullable()).optional(),
});

export const showDraftBodySchema = z
  .object({
    title: z.string().trim().min(1),
    summary: z.preprocess(emptyToNull, z.string().trim().nullable()).optional(),
    description: z
      .preprocess(emptyToNull, z.string().trim().nullable())
      .optional(),
    producerNote: z
      .preprocess(emptyToNull, z.string().trim().nullable())
      .optional(),
    posterUrl: z
      .preprocess(emptyToNull, z.string().trim().url().nullable())
      .optional(),
    castingMode: z.enum(["direct_invite", "theater_casting", "public_casting"]),
    eventType: z
      .enum(["show", "practice", "meeting", "audition", "workshop"])
      .optional()
      .default("show"),
    castMin: z
      .preprocess(emptyToNull, z.coerce.number().int().min(0).nullable())
      .optional(),
    castMax: z
      .preprocess(emptyToNull, z.coerce.number().int().min(0).nullable())
      .optional(),
    ticketUrl: z
      .preprocess(emptyToNull, z.string().trim().url().nullable())
      .optional(),
    onSaleAt: z
      .preprocess((value) => {
        const normalized = normalizeDateInput(value);
        return normalized === undefined ? null : normalized;
      }, z.string().datetime().nullable())
      .optional(),
    occurrences: z.array(showOccurrenceInputSchema).optional().default([]),
    staffAssignments: z
      .array(showStaffAssignmentInputSchema)
      .optional()
      .default([]),
  })
  .refine(
    (data) =>
      data.castMin === null ||
      data.castMin === undefined ||
      data.castMax === null ||
      data.castMax === undefined ||
      data.castMin <= data.castMax,
    {
      message: "Cast min cannot exceed cast max",
      path: ["castMax"],
    },
  );

export type ShowDraftBody = z.infer<typeof showDraftBodySchema>;

export const normalizeLegacyOccurrenceInput = (input: {
  occurrences?: ShowDraftBody["occurrences"];
  startsAt?: string | null;
  endsAt?: string | null;
}) => {
  if ((input.occurrences ?? []).length > 0) {
    return input.occurrences ?? [];
  }

  if (!input.startsAt) {
    return [];
  }

  return [
    {
      startsAt: new Date(input.startsAt).toISOString(),
      endsAt: input.endsAt ? new Date(input.endsAt).toISOString() : null,
    },
  ];
};

export const validateReviewReadiness = (input: ShowDraftBody) => {
  const issues: string[] = [];

  if (!input.summary?.trim()) {
    issues.push("Add a short summary for review");
  }

  if (!input.description?.trim()) {
    issues.push("Add a description for review");
  }

  if ((input.occurrences ?? []).length === 0) {
    issues.push("Add at least one occurrence before review");
  }

  return issues;
};

type ServiceClient = SupabaseClient<Database>;

export const replaceShowOccurrences = async ({
  occurrences,
  serviceSupabase,
  showId,
}: {
  occurrences: ShowDraftBody["occurrences"];
  serviceSupabase: ServiceClient;
  showId: string;
}) => {
  const { error: deleteError } = await serviceSupabase
    .from("show_occurrences")
    .delete()
    .eq("show_id", showId);

  if (deleteError) {
    throw createError({
      statusCode: 500,
      statusMessage: deleteError.message,
    });
  }

  if (occurrences.length === 0) {
    return;
  }

  const rows: TablesInsert<"show_occurrences">[] = occurrences.map(
    (occurrence) => ({
      show_id: showId,
      starts_at: occurrence.startsAt,
      ends_at: occurrence.endsAt ?? null,
      status: "scheduled",
    }),
  );

  const { error: insertError } = await serviceSupabase
    .from("show_occurrences")
    .insert(rows);

  if (insertError) {
    throw createError({
      statusCode: 500,
      statusMessage: insertError.message,
    });
  }
};

export const replaceShowStaffAssignments = async ({
  serviceSupabase,
  showId,
  staffAssignments,
}: {
  serviceSupabase: ServiceClient;
  showId: string;
  staffAssignments: ShowDraftBody["staffAssignments"];
}) => {
  const { error: deleteError } = await serviceSupabase
    .from("show_staff_assignments")
    .delete()
    .eq("show_id", showId);

  if (deleteError) {
    throw createError({
      statusCode: 500,
      statusMessage: deleteError.message,
    });
  }

  if (staffAssignments.length === 0) {
    return;
  }

  const rows: TablesInsert<"show_staff_assignments">[] = staffAssignments.map(
    (assignment) => ({
      show_id: showId,
      user_id: assignment.userId,
      assignment_type: assignment.assignmentType,
      status: assignment.status,
      note: assignment.note ?? null,
    }),
  );

  const { error: insertError } = await serviceSupabase
    .from("show_staff_assignments")
    .insert(rows);

  if (insertError) {
    throw createError({
      statusCode: 500,
      statusMessage: insertError.message,
    });
  }
};
