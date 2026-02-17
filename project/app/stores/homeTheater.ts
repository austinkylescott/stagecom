import { defineStore } from "pinia";

type HomePayload = {
  theater: any | null;
  shows: any[];
  candidates?: any[];
};

export const useHomeTheaterStore = defineStore("homeTheater", {
  state: () => ({
    theater: null as any | null,
    shows: [] as any[],
    candidates: [] as any[],
    lastFetched: 0,
  }),
  getters: {
    snapshot: (state): HomePayload => ({
      theater: state.theater,
      shows: state.shows,
      candidates: state.candidates,
    }),
    hasHome: (state) => Boolean((state.theater as any)?.id),
  },
  actions: {
    setPayload(payload: HomePayload) {
      this.theater = payload?.theater || null;
      this.shows = payload?.shows || [];
      this.candidates = payload?.candidates || [];
      this.lastFetched = Date.now();
    },
    clear() {
      this.setPayload({ theater: null, shows: [], candidates: [] });
    },
  },
});
