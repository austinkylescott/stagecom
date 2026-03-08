import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { H3Event } from "h3";

type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

type SupabaseAuthClient = {
  auth: {
    getUser: () => Promise<{ data: { user: AuthUser | null } }>;
  };
};

export const getOptionalUser = async (
  event: H3Event,
  supabase?: SupabaseAuthClient,
): Promise<AuthUser | null> => {
  const serverUser = await serverSupabaseUser(event);
  if (serverUser?.id) {
    return serverUser as AuthUser;
  }

  const client = supabase ?? (await serverSupabaseClient(event));

  return client.auth
    .getUser()
    .then((result) => result.data.user)
    .catch(() => null);
};

export const requireUser = async (
  event: H3Event,
  supabase?: SupabaseAuthClient,
): Promise<AuthUser> => {
  const user = await getOptionalUser(event, supabase);
  if (!user?.id) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  return user;
};

export const getOptionalUserId = async (
  event: H3Event,
  supabase?: SupabaseAuthClient,
): Promise<string | null> => {
  const user = await getOptionalUser(event, supabase);
  return user?.id ?? null;
};

export const requireUserId = async (
  event: H3Event,
  supabase?: SupabaseAuthClient,
): Promise<string> => {
  const user = await requireUser(event, supabase);
  return user.id;
};
