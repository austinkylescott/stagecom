import { ref } from "vue";
import type { ComputedRef } from "vue";

type ToggleAction = "join" | "leave";

type TheaterLike = {
  id?: string;
  slug?: string;
  name?: string;
  isMember?: boolean;
};

type ManagerOptions = {
  hasHome: ComputedRef<boolean>;
  homeId: ComputedRef<string | null>;
  toggleMembership: (
    theater: TheaterLike,
    action: ToggleAction,
  ) => Promise<any>;
  setHome: (theaterId: string | null) => Promise<void>;
  refreshAll?: () => Promise<void>;
  mutateMembership?: (theater: TheaterLike, isMember: boolean) => void;
};

export const useTheaterMembershipManager = (opts: ManagerOptions) => {
  const membershipBusyIds = ref<Set<string>>(new Set());
  const homeBusyIds = ref<Set<string>>(new Set());
  const showHomeModal = ref(false);
  const pendingHomeTheater = ref<TheaterLike | null>(null);
  const showLeaveHomeModal = ref(false);
  const pendingLeaveTheater = ref<TheaterLike | null>(null);
  const settingHome = ref(false);
  const leavingHome = ref(false);

  const refreshAll = opts.refreshAll ?? (async () => {});

  const openHomePrompt = (theater: TheaterLike) => {
    pendingHomeTheater.value = theater;
    showHomeModal.value = true;
  };

  const openLeaveHomePrompt = (theater: TheaterLike) => {
    pendingLeaveTheater.value = theater;
    showLeaveHomeModal.value = true;
  };

  const handleToggle = async (action: ToggleAction, theater: TheaterLike) => {
    if (!theater?.id) return;
    if (action === "leave" && opts.homeId.value === theater.id) {
      openLeaveHomePrompt(theater);
      return;
    }
    const next = new Set(membershipBusyIds.value);
    next.add(theater.id);
    membershipBusyIds.value = next;

    try {
      await opts.toggleMembership(theater, action);
      opts.mutateMembership?.(theater, action === "join");
      await refreshAll();
      if (action === "join" && !opts.hasHome.value) openHomePrompt(theater);
    } finally {
      const after = new Set(membershipBusyIds.value);
      after.delete(theater.id);
      membershipBusyIds.value = after;
    }
  };

  const handleHome = async (action: "set" | "clear", theater: TheaterLike) => {
    if (!theater?.id) return;

    const homeBusy = new Set(homeBusyIds.value);
    homeBusy.add(theater.id);
    homeBusyIds.value = homeBusy;

    const needsJoin = action === "set" && !theater.isMember;
    if (needsJoin) {
      const mb = new Set(membershipBusyIds.value);
      mb.add(theater.id);
      membershipBusyIds.value = mb;
    }

    try {
      if (action === "set") {
        if (needsJoin) {
          await opts.toggleMembership(theater, "join");
          opts.mutateMembership?.(theater, true);
        }
        await opts.setHome(theater.id);
      } else if (action === "clear" && opts.homeId.value === theater.id) {
        await opts.setHome(null);
      }
    } finally {
      const afterHome = new Set(homeBusyIds.value);
      afterHome.delete(theater.id);
      homeBusyIds.value = afterHome;

      if (needsJoin) {
        const afterMember = new Set(membershipBusyIds.value);
        afterMember.delete(theater.id);
        membershipBusyIds.value = afterMember;
      }
    }
  };

  const confirmHomeChoice = async (makeHome: boolean) => {
    if (!pendingHomeTheater.value) {
      showHomeModal.value = false;
      return;
    }
    settingHome.value = true;
    try {
      if (makeHome) {
        await opts.setHome(pendingHomeTheater.value.id || null);
      }
    } finally {
      settingHome.value = false;
      showHomeModal.value = false;
      pendingHomeTheater.value = null;
    }
  };

  const confirmLeaveHome = async () => {
    if (!pendingLeaveTheater.value?.id) {
      showLeaveHomeModal.value = false;
      return;
    }
    leavingHome.value = true;
    try {
      const theater = pendingLeaveTheater.value;
      await opts.toggleMembership(theater, "leave");
      opts.mutateMembership?.(theater, false);
      await opts.setHome(null);
    } finally {
      leavingHome.value = false;
      showLeaveHomeModal.value = false;
      pendingLeaveTheater.value = null;
    }
  };

  const cancelLeaveHome = () => {
    showLeaveHomeModal.value = false;
    pendingLeaveTheater.value = null;
  };

  return {
    membershipBusyIds,
    homeBusyIds,
    showHomeModal,
    pendingHomeTheater,
    showLeaveHomeModal,
    pendingLeaveTheater,
    settingHome,
    leavingHome,
    openHomePrompt,
    openLeaveHomePrompt,
    handleToggle,
    handleHome,
    confirmHomeChoice,
    confirmLeaveHome,
    cancelLeaveHome,
  };
};
