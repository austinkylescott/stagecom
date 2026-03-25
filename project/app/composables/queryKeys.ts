export const queryKeys = {
  theaters: (params?: {
    search: string;
    sort: "name_asc" | "recent";
    page: number;
    pageSize: number;
  }) => (params ? (["theaters", params] as const) : (["theaters"] as const)),

  theater: (slug: string) => ["theater", { slug }] as const,

  theaterReview: (slug: string) => ["theater-review", { slug }] as const,

  theaterPrefix: () => ["theater"] as const,

  theaterReviewPrefix: () => ["theater-review"] as const,

  reviewInbox: () => ["review-inbox"] as const,

  homeTheater: () => ["home-theater"] as const,

  memberShows: () => ["member-shows"] as const,

  performers: (params?: {
    search: string;
    page: number;
    pageSize: number;
    theaterId?: string;
  }) =>
    params ? (["performers", params] as const) : (["performers"] as const),

  profile: (userId: string) => ["profile", { userId }] as const,

  showDetail: (id: string) => ["show-detail", { id }] as const,

  notifications: () => ["notifications"] as const,

  notificationsPage: (params: { filter: string; page: number }) =>
    ["notifications-page", params] as const,
};
