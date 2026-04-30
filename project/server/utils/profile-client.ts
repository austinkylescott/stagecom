import { getServiceRoleClient } from "~~/server/utils/service-role";

export const getProfileClient = <T>(fallbackClient: T): T => {
  try {
    return getServiceRoleClient() as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Missing Supabase service role env vars")) {
      return fallbackClient;
    }

    throw error;
  }
};
