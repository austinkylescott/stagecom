import { computed, ref, type Ref } from "vue";
import { useHomeTheaterMutation } from "~/composables/useHomeTheaterMutation";
import { useMembershipToggle } from "~/composables/useMembershipToggle";

type TheaterRelationshipTarget = {
  id: string;
  slug: string;
  name?: string | null;
};

export const useTheaterRelationship = ({
  theater,
  isMember,
  isHome,
}: {
  theater: Ref<TheaterRelationshipTarget | null>;
  isMember: Ref<boolean>;
  isHome: Ref<boolean>;
}) => {
  const { toggleMembership } = useMembershipToggle();
  const { saveHome } = useHomeTheaterMutation();
  const relationshipLoading = ref(false);

  const followLabel = computed(() =>
    isMember.value ? "Unfollow" : "Follow",
  );

  const homeLabel = computed(() =>
    isHome.value ? "Home theater" : "Set home",
  );

  const passiveRelationshipLabel = computed(() => {
    if (isHome.value && isMember.value) {
      return "Following + home theater";
    }

    if (isHome.value) {
      return "Home theater";
    }

    if (isMember.value) {
      return "Following";
    }

    return null;
  });

  const handleFollowToggle = async () => {
    if (!theater.value) return;

    relationshipLoading.value = true;
    try {
      await toggleMembership(
        {
          id: theater.value.id,
          slug: theater.value.slug,
          name: theater.value.name ?? undefined,
        },
        isMember.value ? "leave" : "join",
      );

      if (isMember.value && isHome.value) {
        await saveHome(null);
      }
    } finally {
      relationshipLoading.value = false;
    }
  };

  const handleHomeToggle = async () => {
    if (!theater.value) return;
    if (!isMember.value && !isHome.value) return;

    relationshipLoading.value = true;
    try {
      if (isHome.value) {
        await saveHome(theater.value.id, false);
      } else {
        await saveHome(theater.value.id, true);
      }
    } finally {
      relationshipLoading.value = false;
    }
  };

  return {
    followLabel,
    handleFollowToggle,
    handleHomeToggle,
    homeLabel,
    passiveRelationshipLabel,
    relationshipLoading,
  };
};
