import type { Enums } from "~/types/database.types";

export const staffRoles: Enums<"theater_role">[] = ["admin", "manager", "staff"];

export const hasStaffRole = (
  roles: Enums<"theater_role">[] | null | undefined,
) => (roles || []).some((role) => staffRoles.includes(role));
