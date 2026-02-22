export const queryKeys = {
  theaters: (params?: {
    search: string;
    sort: "name_asc" | "recent" | "next_show";
    page: number;
    pageSize: number;
  }) => ["theaters", params] as const,

  theater: (slug: string) => ["theater", { slug }] as const,

  theaterReview: (slug: string) => ["theater-review", { slug }] as const,

  theaterPrefix: () => ["theater"] as const,

  theaterReviewPrefix: () => ["theater-review"] as const,

  homeTheater: () => ["home-theater"] as const,

  memberShows: () => ["member-shows"] as const,

  performers: () => ["performers"] as const,

  profile: (userId: string) => ["profile", { userId }] as const,
};
