import type {
  NotificationsResponse,
  NotificationItem,
} from "~/queries/notifications";
import type {
  MemberShowsResponse,
  ShowDetailResponse,
  ShowScheduleResponse,
} from "~/queries/shows";
import type {
  ReviewQueue,
  TheaterDetails,
  TheaterUpcomingResponse,
  TheatersResponse,
} from "~/queries/theaters";
import type { ProfileRow } from "~/queries/users";

const now = new Date("2026-10-13T18:00:00.000Z");

const isoWithOffset = (days: number, hours: number) => {
  const next = new Date(now);
  next.setUTCDate(next.getUTCDate() + days);
  next.setUTCHours(hours, 0, 0, 0);
  return next.toISOString();
};

const makeNotification = (
  id: string,
  type: string,
  entityId: string,
  createdAt: string,
  payload: NotificationItem["payload"],
): NotificationItem => ({
  id,
  type,
  entity_type: "show",
  entity_id: entityId,
  payload,
  dedupe_key: `${type}:${id}`,
  read_at: null,
  created_at: createdAt,
});

export const demoProfile: ProfileRow = {
  id: "demo-user",
  display_name: "Mira Lee",
  avatar_url: null,
  timezone: "America/Chicago",
  handle: "mira-lee",
  pronouns: "she/her",
  bio: "Stage manager, producer, and performer keeping The Empty Box moving on time.",
  city: "Chicago",
  visibility: "theater_only",
  fieldVisibility: {
    displayName: "theater_only",
    handle: "public",
    pronouns: "theater_only",
    city: "theater_only",
    bio: "theater_only",
  },
  contactLinks: {
    email: {
      source: "auth",
      visibility: "private",
    },
    phone: {
      value: null,
      visibility: "private",
    },
  },
  shareableContacts: {
    email: {
      value: "mira@example.com",
      visibility: "private",
    },
    phone: {
      value: null,
      visibility: "private",
    },
  },
};

export const demoMemberShows: MemberShowsResponse = {
  shows: [
    {
      id: "show-unscripted-tragedy",
      slug: "the-unscripted-tragedy",
      title: "The Unscripted Tragedy",
      description:
        "Nightly long-form improv focusing on dramatic irony. Full cast required for pre-show physical warm-ups.",
      status: "approved",
      eventType: "show",
      theaterId: "theater-empty-box",
      theaterName: "The Empty Box",
      theaterSlug: "the-empty-box",
      nextStartsAt: isoWithOffset(0, 19),
    },
    {
      id: "show-directors-workshop",
      slug: "directors-workshop-silences",
      title: "Director's Workshop: Silences",
      description: "Exploring the power of pauses in comedic timing.",
      status: "approved",
      eventType: "workshop",
      theaterId: "theater-empty-box",
      theaterName: "The Empty Box",
      theaterSlug: "the-empty-box",
      nextStartsAt: isoWithOffset(1, 14),
    },
  ],
};

export const demoSchedule: ShowScheduleResponse = {
  items: [
    {
      occurrenceId: "occ-1",
      startsAt: isoWithOffset(0, 19),
      endsAt: isoWithOffset(0, 21),
      occurrenceStatus: "scheduled",
      show: {
        id: "show-unscripted-tragedy",
        slug: "the-unscripted-tragedy",
        title: "The Unscripted Tragedy",
        status: "approved",
        eventType: "show",
        theaterId: "theater-empty-box",
        theaterName: "The Empty Box",
        theaterSlug: "the-empty-box",
      },
      viewerRelationships: ["producer", "cast", "theater_member", "home_theater"],
    },
    {
      occurrenceId: "occ-2",
      startsAt: isoWithOffset(1, 14),
      endsAt: isoWithOffset(1, 16),
      occurrenceStatus: "scheduled",
      show: {
        id: "show-directors-workshop",
        slug: "directors-workshop-silences",
        title: "Director's Workshop: Silences",
        status: "approved",
        eventType: "workshop",
        theaterId: "theater-empty-box",
        theaterName: "The Empty Box",
        theaterSlug: "the-empty-box",
      },
      viewerRelationships: ["theater_member"],
    },
    {
      occurrenceId: "occ-3",
      startsAt: isoWithOffset(2, 10),
      endsAt: isoWithOffset(2, 13),
      occurrenceStatus: "scheduled",
      show: {
        id: "show-maintenance",
        slug: "theater-maintenance-rigging",
        title: "Theater Maintenance & Rigging",
        status: "approved",
        eventType: "meeting",
        theaterId: "theater-empty-box",
        theaterName: "The Empty Box",
        theaterSlug: "the-empty-box",
      },
      viewerRelationships: ["theater_member"],
    },
  ],
  filters: {
    theaters: [{ label: "The Empty Box", value: "the-empty-box" }],
    eventTypes: [
      { label: "Show", value: "show" },
      { label: "Workshop", value: "workshop" },
      { label: "Meeting", value: "meeting" },
    ],
    statuses: [{ label: "Approved", value: "approved" }],
  },
};

export const demoNotifications: NotificationsResponse = {
  notifications: [
    makeNotification(
      "note-1",
      "props.missing",
      "show-unscripted-tragedy",
      isoWithOffset(0, 16),
      {
        title: "Missing Props",
        message: "Vase for Scene 3 not returned to stock. Check backstage bin.",
      },
    ),
    makeNotification(
      "note-2",
      "script.uploaded",
      "show-night-train",
      isoWithOffset(0, 13),
      {
        title: "New Script Upload",
        message: "'The Night Train' drafts now in the digital locker.",
      },
    ),
    makeNotification(
      "note-3",
      "cast.invited",
      "show-herald",
      isoWithOffset(0, 11),
      {
        title: "Cast Invite",
        message: "Three new ensemble invites are waiting for response.",
      },
    ),
  ],
  total: 3,
  totalPages: 1,
  page: 1,
  pageSize: 30,
};

export const demoTheaters: TheatersResponse = {
  theaters: [
    {
      id: "theater-brass-beacon",
      name: "The Brass Beacon",
      slug: "the-brass-beacon",
      tagline: "Historic long-form home for ensemble work.",
      city: "Chicago",
      state_region: "IL",
      country: "USA",
      isMember: true,
    },
    {
      id: "theater-basement-lab",
      name: "The Basement Lab",
      slug: "the-basement-lab",
      tagline: "Experimental black-box for risk-heavy shows.",
      city: "Chicago",
      state_region: "IL",
      country: "USA",
      isMember: false,
    },
    {
      id: "theater-comedy-loft",
      name: "Comedy Loft",
      slug: "comedy-loft",
      tagline: "Grassroots venue for community troupes.",
      city: "Chicago",
      state_region: "IL",
      country: "USA",
      isMember: false,
    },
  ],
  myTheaters: [
    {
      id: "theater-empty-box",
      name: "The Empty Box",
      slug: "the-empty-box",
      tagline: "Gritty improv and experimental performance space.",
      city: "Chicago",
      state_region: "IL",
      country: "USA",
      isMember: true,
      isHome: true,
    },
  ],
  totalPages: 1,
};

export const demoTheaterDetails: TheaterDetails = {
  boardSettings: {
    upcomingOtherEventsLimit: 4,
    upcomingShowsLimit: 4,
  },
  dashboard: {
    upNextOtherEvent: null,
    upNextShow: null,
  },
  membership: {
    status: "active",
    roles: ["manager"],
    isHome: true,
  },
  permissions: {
    canCreateShow: true,
    canReview: true,
  },
  programming: {
    nextThirtyDays: [],
    upcomingShows: [],
  },
  stats: {
    memberCount: 42,
    totalShows: 118,
    pendingReviewCount: 3,
    publicShowCount: 84,
    upcomingPublicOccurrenceCount: 6,
    visibleNextThirtyDaysCount: 9,
  },
  theater: {
    id: "theater-empty-box",
    name: "The Empty Box",
    slug: "the-empty-box",
    tagline: "Long-form narratives and risky comedic experiments.",
    timezone: "America/Chicago",
    street: "412 N. Wells St, Suite 2",
    city: "Chicago",
    state_region: "IL",
    postal_code: "60654",
    country: "USA",
    website_url: "https://stagecom.example/the-empty-box",
    logo_url: null,
  },
};

export const demoTheaterUpcoming: TheaterUpcomingResponse = {
  shows: [
    {
      occurrenceId: "theater-occ-1",
      startsAt: isoWithOffset(0, 20),
      endsAt: isoWithOffset(0, 22),
      occurrenceStatus: "scheduled",
      show: {
        id: "show-herald",
        slug: "the-herald",
        title: "The Herald",
        description:
          "An exploration of a single suggestion through three distinct worlds.",
        status: "approved",
        eventType: "show",
        ticketUrl: "https://tickets.example/the-herald",
        theaterId: "theater-empty-box",
        theaterName: "The Empty Box",
        theaterSlug: "the-empty-box",
      },
      producers: [{ userId: "demo-user", displayName: "Mira Lee", avatarUrl: null }],
      cast: [
        { userId: "cast-1", displayName: "Marcus T.", avatarUrl: null },
        { userId: "cast-2", displayName: "Sarah J.", avatarUrl: null },
      ],
    },
    {
      occurrenceId: "theater-occ-2",
      startsAt: isoWithOffset(0, 22),
      endsAt: isoWithOffset(0, 23),
      occurrenceStatus: "scheduled",
      show: {
        id: "show-jam",
        slug: "late-night-jam",
        title: "Late Night Jam",
        description: "Put your name in the bucket. Anyone can play.",
        status: "approved",
        eventType: "show",
        ticketUrl: null,
        theaterId: "theater-empty-box",
        theaterName: "The Empty Box",
        theaterSlug: "the-empty-box",
      },
      producers: [{ userId: "producer-2", displayName: "Dani Cruz", avatarUrl: null }],
      cast: [],
    },
  ],
  otherEvents: [
    {
      occurrenceId: "theater-occ-3",
      startsAt: isoWithOffset(6, 18),
      endsAt: isoWithOffset(6, 20),
      occurrenceStatus: "scheduled",
      show: {
        id: "class-1",
        slug: "the-first-step",
        title: "The First Step",
        description: "Level 1 improv classes start next Monday.",
        status: "approved",
        eventType: "workshop",
        ticketUrl: null,
        theaterId: "theater-empty-box",
        theaterName: "The Empty Box",
        theaterSlug: "the-empty-box",
      },
      producers: [{ userId: "teacher-1", displayName: "Alex Rowan", avatarUrl: null }],
      cast: [],
    },
  ],
};

export const demoReviewQueue: ReviewQueue = {
  shows: [
    {
      id: "review-1",
      title: "Midnight Sketch Gauntlet",
      status: "pending_review",
      startsAt: isoWithOffset(4, 21),
    },
    {
      id: "review-2",
      title: "Workshop: Character Heat",
      status: "pending_review",
      startsAt: isoWithOffset(7, 18),
    },
  ],
};

export const demoShowDetail: ShowDetailResponse = {
  show: {
    id: "show-herald",
    slug: "the-herald",
    title: "The Herald",
    summary: "A flagship long-form residency built from one audience suggestion.",
    description:
      "The Empty Box house team builds a full evening around a single suggestion, moving through three connected worlds with a rotating five-person cast.",
    producerNote: "All cast should arrive by 7:15 for notes and line check.",
    posterUrl: null,
    status: "approved",
    eventType: "show",
    castingMode: "invite_only",
    castMin: 5,
    castMax: 7,
    isCastFinalized: true,
    isPublicListed: true,
    ticketUrl: "https://tickets.example/the-herald",
    onSaleAt: isoWithOffset(-5, 17),
    theaterId: "theater-empty-box",
    theaterName: "The Empty Box",
    theaterSlug: "the-empty-box",
  },
  occurrences: [
    {
      id: "show-herald-occ-1",
      starts_at: isoWithOffset(0, 20),
      ends_at: isoWithOffset(0, 22),
      status: "scheduled",
    },
  ],
  producers: [{ userId: "demo-user", displayName: "Mira Lee", avatarUrl: null }],
  staffAssignments: [
    {
      id: "staff-1",
      userId: "staff-1",
      assignmentType: "stage_manager",
      status: "confirmed",
      note: "Preset complete by 7:30.",
      displayName: "John Sterling",
      avatarUrl: null,
    },
  ],
  cast: [
    {
      userId: "cast-1",
      source: "producer_invite",
      status: "accepted",
      programOrder: 1,
      note: null,
      displayName: "Marcus T.",
      avatarUrl: null,
    },
    {
      userId: "cast-2",
      source: "producer_invite",
      status: "accepted",
      programOrder: 2,
      note: null,
      displayName: "Sarah J.",
      avatarUrl: null,
    },
  ],
  viewerCast: {
    userId: "cast-1",
    source: "producer_invite",
    status: "accepted",
    programOrder: 1,
    note: null,
    displayName: "Marcus T.",
    avatarUrl: null,
  },
  permissions: {
    isProducer: true,
    isTheaterStaff: true,
    isShowStaff: true,
    canEditDraft: false,
    canManagePublication: true,
    canRequestToJoin: false,
    canSeePendingCast: true,
  },
};

export const demoCompany = [
  { initials: "JS", name: "John Sterling", role: "Lead Improviser", state: "ready" },
  { initials: "ML", name: "Mira Lee", role: "Stage Manager", state: "warning" },
  { initials: "DA", name: "David Aris", role: "Light Design", state: "idle" },
];
