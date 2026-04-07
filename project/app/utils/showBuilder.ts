import type { CreateShowPayload, ShowDetailResponse } from "~/queries/shows";

export const showStaffAssignmentTypeOptions = [
  { label: "Front of house", value: "front_of_house" },
  { label: "Box office", value: "box_office" },
  { label: "Bar", value: "bar" },
  { label: "Tech", value: "tech" },
  { label: "Other", value: "other" },
] as const;

export type ShowBuilderOccurrence = {
  startsAt: string;
  endsAt: string;
};

export type ShowBuilderStaffAssignment = {
  userId: string;
  assignmentType: string;
  status: string;
  note: string;
};

export type ShowBuilderFormState = {
  title: string;
  summary: string;
  description: string;
  producerNote: string;
  posterUrl: string;
  eventType: string;
  castingMode: string;
  castMin: number | null;
  castMax: number | null;
  ticketUrl: string;
  onSaleAt: string;
  occurrences: ShowBuilderOccurrence[];
  staffAssignments: ShowBuilderStaffAssignment[];
};

export const createEmptyOccurrence = (): ShowBuilderOccurrence => ({
  startsAt: "",
  endsAt: "",
});

export const createEmptyStaffAssignment = (): ShowBuilderStaffAssignment => ({
  userId: "",
  assignmentType: "front_of_house",
  status: "assigned",
  note: "",
});

export const createEmptyShowBuilderForm = (): ShowBuilderFormState => ({
  title: "",
  summary: "",
  description: "",
  producerNote: "",
  posterUrl: "",
  eventType: "show",
  castingMode: "direct_invite",
  castMin: null,
  castMax: null,
  ticketUrl: "",
  onSaleAt: "",
  occurrences: [createEmptyOccurrence()],
  staffAssignments: [],
});

const toLocalDateTime = (value: string | null | undefined) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

export const populateShowBuilderForm = (
  form: ShowBuilderFormState,
  detail: ShowDetailResponse,
) => {
  form.title = detail.show.title ?? "";
  form.summary = detail.show.summary ?? "";
  form.description = detail.show.description ?? "";
  form.producerNote = detail.show.producerNote ?? "";
  form.posterUrl = detail.show.posterUrl ?? "";
  form.eventType = detail.show.eventType ?? "show";
  form.castingMode = detail.show.castingMode ?? "direct_invite";
  form.castMin = detail.show.castMin ?? null;
  form.castMax = detail.show.castMax ?? null;
  form.ticketUrl = detail.show.ticketUrl ?? "";
  form.onSaleAt = toLocalDateTime(detail.show.onSaleAt);
  form.occurrences =
    detail.occurrences.length > 0
      ? detail.occurrences.map((occurrence) => ({
          startsAt: toLocalDateTime(occurrence.starts_at),
          endsAt: toLocalDateTime(occurrence.ends_at),
        }))
      : [createEmptyOccurrence()];
  form.staffAssignments = detail.staffAssignments.map((assignment) => ({
    userId: assignment.userId,
    assignmentType: assignment.assignmentType,
    status: assignment.status,
    note: assignment.note ?? "",
  }));
};

export const toCreateShowPayload = (
  form: ShowBuilderFormState,
): CreateShowPayload => ({
  title: form.title.trim(),
  summary: form.summary.trim() || null,
  description: form.description.trim() || null,
  producerNote: form.producerNote.trim() || null,
  posterUrl: form.posterUrl.trim() || null,
  eventType: form.eventType,
  castingMode: form.castingMode,
  castMin: form.castMin,
  castMax: form.castMax,
  ticketUrl: form.ticketUrl.trim() || null,
  onSaleAt: form.onSaleAt || null,
  occurrences: form.occurrences
    .filter((occurrence) => occurrence.startsAt)
    .map((occurrence) => ({
      startsAt: occurrence.startsAt,
      endsAt: occurrence.endsAt || null,
    })),
  staffAssignments: form.staffAssignments
    .filter((assignment) => assignment.userId)
    .map((assignment) => ({
      userId: assignment.userId,
      assignmentType: assignment.assignmentType,
      status: assignment.status,
      note: assignment.note.trim() || null,
    })),
});
