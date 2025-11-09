import { create } from "zustand";
import { useGameStore, FactionId } from "./gameStore";

export type TurnPhase = "deploy" | "attack" | "end";

interface TurnState {
  activeFaction: FactionId;
  phase: TurnPhase;
  timeLeft: number;
  troopsToDeploy: number;
  factionsOrder: FactionId[];
  startTurn: () => void;
  endPhase: () => void;
  endTurn: () => void;
  tick: () => void;
  canControl: (factionId: FactionId) => boolean;
}

export const useTurnStore = create<TurnState>((set, get) => ({
  activeFaction: "regime",
  phase: "deploy",
  timeLeft: 60,
  troopsToDeploy: 3,
  factionsOrder: [],

  startTurn: () => {
    const { provinces } = useGameStore.getState();

    const occupied = Object.values(provinces).reduce((acc, p) => {
      if (!acc.includes(p.owner) && p.owner !== "neutral") acc.push(p.owner);
      return acc;
    }, [] as FactionId[]);
    if (occupied.length === 0) return;

    const next = get().activeFaction
      ? occupied[(occupied.indexOf(get().activeFaction) + 1) % occupied.length]
      : occupied[0];

    set({
      activeFaction: next,
      phase: "deploy",
      timeLeft: 60,
      troopsToDeploy: 3,
      factionsOrder: occupied,
    });

    console.log(`🎯 Turn started for: ${next}`);
  },

  endPhase: () => {
    const phase = get().phase;
    if (phase === "deploy") set({ phase: "attack" });
    else if (phase === "attack") set({ phase: "end" });
  },

  endTurn: () => {
    get().startTurn(); // move to next faction automatically
  },

  tick: () => {
    const { timeLeft, endTurn } = get();
    if (timeLeft <= 0) {
      endTurn();
    } else {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  canControl: (factionId: FactionId) => {
    const { activeFaction } = get();
    return factionId === activeFaction;
  },
}));
