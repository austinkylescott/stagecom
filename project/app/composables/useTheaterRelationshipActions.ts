import type { DropdownMenuItem } from "@nuxt/ui";
import { computed, type Ref } from "vue";
import { useHomeTheaterState } from "~/composables/useHomeTheaterState";
import { useTheaterRelationship } from "~/composables/useTheaterRelationship";
import type { TheaterDetails } from "~/queries/theaters";
import {
  toEventCreatePath,
  toTheaterAdminPath,
  toTheaterPath,
} from "~/utils/routes";

type TheaterTarget = TheaterDetails["theater"] | null;

export const useTheaterRelationshipActions = ({
  slug,
  theater,
  membership,
  canReview,
}: {
  slug: Ref<string>;
  theater: Ref<TheaterTarget>;
  membership: Ref<TheaterDetails["membership"] | null>;
  canReview: Ref<boolean>;
}) => {
  const { homeIds } = useHomeTheaterState();

  const isMember = computed(() => membership.value?.status === "active");
  const isHome = computed(
    () =>
      membership.value?.isHome ||
      homeIds.value.includes(theater.value?.id || "") ||
      false,
  );

  const theaterTarget = computed(() =>
    theater.value
      ? {
          id: theater.value.id,
          slug: theater.value.slug,
          name: theater.value.name,
        }
      : null,
  );

  const {
    handleFollowToggle,
    handleHomeToggle,
    passiveRelationshipLabel,
    relationshipLoading,
  } = useTheaterRelationship({
    theater: theaterTarget,
    isMember,
    isHome,
  });

  const theaterActionsMenuItems = computed<DropdownMenuItem[][]>(() => {
    const items: DropdownMenuItem[][] = [
      [
        {
          label: "Theater schedule",
          icon: "i-heroicons-calendar-days",
          to: toTheaterPath(slug.value),
        },
      ],
    ];

    if (isMember.value) {
      items[0]?.push({
        label: "Create an event",
        icon: "i-heroicons-plus",
        to: toEventCreatePath(slug.value),
      });
    }

    if (canReview.value) {
      items[0]?.push({
        label: "Theater admin",
        icon: "i-heroicons-shield-check",
        to: toTheaterAdminPath(slug.value),
      });
    }

    items.push([
      {
        label: isMember.value ? "Leave theater" : "Join theater",
        icon: isMember.value
          ? "i-heroicons-minus-circle"
          : "i-heroicons-plus-circle",
        disabled: relationshipLoading.value || !theater.value,
        onSelect: handleFollowToggle,
      },
      {
        label: isHome.value ? "Remove home theater" : "Make home theater",
        icon: "i-heroicons-home",
        disabled:
          relationshipLoading.value || !theater.value || (!isMember.value && !isHome.value),
        onSelect: handleHomeToggle,
      },
    ]);

    return items;
  });

  return {
    handleFollowToggle,
    handleHomeToggle,
    isHome,
    isMember,
    passiveRelationshipLabel,
    relationshipLoading,
    theaterActionsMenuItems,
  };
};
