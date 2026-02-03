import { useToast } from "#imports";

type ToggleAction = "join" | "leave";

export const useMembershipToggle = () => {
  const toast = useToast?.();

  const toggleMembership = async (
    theater: { slug: string; name?: string; id?: string },
    action: ToggleAction,
  ) => {
    try {
      const result = await $fetch<{ status: string }>(
        `/api/theaters/${theater.slug}/membership`,
        {
          method: "POST",
          credentials: "include",
          body: { action },
        },
      );
      toast?.add({
        title: action === "join" ? "Followed" : "Unfollowed",
        color: action === "join" ? "primary" : "error",
      });
      return result;
    } catch (e: any) {
      toast?.add({
        title: "Action failed",
        description:
          e?.data?.statusMessage ||
          e?.data?.message ||
          e?.message ||
          "Unknown error",
        color: "error",
      });
      throw e;
    }
  };

  return { toggleMembership };
};
