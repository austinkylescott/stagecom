import type { StageButtonTone } from "~/utils/stageButtonTone";

export type AppShellRailItem = {
  id: string;
  label: string;
  shortLabel?: string;
  icon: string;
  tone: StageButtonTone;
  to?: string;
  active?: boolean;
};

export type AppShellRouteKind =
  | "callsheet"
  | "profile"
  | "notifications"
  | "theater"
  | "admin"
  | "event"
  | "event-new"
  | "other";

export const resolveAppShellRouteKind = (path: string): AppShellRouteKind => {
  if (path === "/callsheet") return "callsheet";
  if (path.startsWith("/profile")) return "profile";
  if (path.startsWith("/notifications")) return "notifications";
  if (path === "/theaters") return "theater";
  if (/^\/[^/]+\/new$/.test(path)) return "event-new";
  if (/^\/[^/]+\/admin$/.test(path)) return "admin";
  if (/^\/[^/]+\/[^/]+$/.test(path)) return "event";
  if (/^\/[^/]+$/.test(path)) return "theater";
  return "other";
};
