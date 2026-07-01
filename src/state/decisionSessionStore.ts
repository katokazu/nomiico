import { create } from "zustand";

import type { CandidateFilter, DecisionMode, Restaurant, SwipeResult } from "@/domain/models";

/**
 * 決定セッション中の一時UI状態 (docs/patterns/implementation-patterns.md #データ取得状態管理)。
 * 永続化はdecisionRepository側。ここではswipeキューの進行など画面をまたぐ一時状態のみ持つ。
 */
interface DecisionSessionState {
  sessionId: string | null;
  mode: DecisionMode | null;
  filter: CandidateFilter;
  queue: Restaurant[];
  keptIds: string[];
  rejectedIds: string[];
  start: (sessionId: string, mode: DecisionMode, filter: CandidateFilter, queue: Restaurant[]) => void;
  swipe: (restaurantId: string, result: SwipeResult) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  mode: null,
  filter: {},
  queue: [],
  keptIds: [],
  rejectedIds: [],
} satisfies Omit<DecisionSessionState, "start" | "swipe" | "reset">;

export const useDecisionSessionStore = create<DecisionSessionState>((set) => ({
  ...initialState,
  start: (sessionId, mode, filter, queue) =>
    set({ sessionId, mode, filter, queue, keptIds: [], rejectedIds: [] }),
  swipe: (restaurantId, result) =>
    set((state) => ({
      queue: state.queue.filter((restaurant) => restaurant.id !== restaurantId),
      keptIds: result === "kept" ? [...state.keptIds, restaurantId] : state.keptIds,
      rejectedIds:
        result === "rejected" ? [...state.rejectedIds, restaurantId] : state.rejectedIds,
    })),
  reset: () => set(initialState),
}));
