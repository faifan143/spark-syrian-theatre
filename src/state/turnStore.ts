import { create } from "zustand";
import { useGameStore, FactionId } from "./gameStore";

export type TurnPhase = "deploy" | "attack" | "end";

interface TurnState {
  activeFaction: FactionId;
  phase: TurnPhase;
  timeLeft: number;
  reinforcements: Record<FactionId, number>;
  factionsOrder: FactionId[];
  turnCount: number;

  startTurn: () => void;
  endPhase: () => void;
  endTurn: () => void;
  tick: () => void;
  canControl: (f: FactionId) => boolean;
  useTroop: (count?: number) => void;
  getCurrentTroops: () => number;
}

export const useTurnStore = create<TurnState>((set, get) => ({
  activeFaction: "regime",
  phase: "deploy",
  timeLeft: 60,
  reinforcements: {
    regime: 0,
    alliance: 0,
    sdf: 0,
    isis: 0,
    rebels: 0,
    axis: 0,
    neutral: 0,
  },
  factionsOrder: [],
  turnCount: 1,

  startTurn: () => {
    const { provinces } = useGameStore.getState();
    const { reinforcements, activeFaction } = get();

    // figure out play order from who actually owns anything
    const occupied = Object.values(provinces).reduce((acc, p) => {
      if (p.owner !== "neutral" && !acc.includes(p.owner)) acc.push(p.owner);
      return acc;
    }, [] as FactionId[]);
    if (occupied.length === 0) return;

    const next =
      activeFaction && occupied.includes(activeFaction)
        ? occupied[(occupied.indexOf(activeFaction) + 1) % occupied.length]
        : occupied[0];

    // compute new reinforcements for "next"
    const owned = Object.values(provinces).filter(
      (p) => p.owner === next
    ).length;
    const base = 3;
    const bonus = Math.floor(owned / 3);
    const gained = base + bonus;

    // carry leftovers for THIS faction only
    const carry = reinforcements[next] ?? 0;
    const pool = carry + gained;

    set({
      activeFaction: next,
      phase: "deploy",
      timeLeft: 60,
      reinforcements: { ...reinforcements, [next]: pool },
      factionsOrder: occupied,
      turnCount: get().turnCount + 1,
    });
  },

  endPhase: () => {
    const cur = get().phase;
    if (cur === "deploy") set({ phase: "attack" });
    else if (cur === "attack") set({ phase: "end" });
  },

  endTurn: () => {
    // force going through phases in order
    const { phase, endPhase } = get();
    if (phase !== "end") {
      endPhase();
      return;
    }
    get().startTurn();
  },

  tick: () => {
    const { timeLeft, endTurn } = get();
    if (timeLeft <= 0) endTurn();
    else set({ timeLeft: timeLeft - 1 });
  },

  canControl: (f) => get().activeFaction === f,

  useTroop: (count = 1) => {
    const { activeFaction, reinforcements } = get();
    const avail = Math.max(0, (reinforcements[activeFaction] ?? 0) - count);
    set({
      reinforcements: { ...reinforcements, [activeFaction]: avail },
    });
  },

  getCurrentTroops: () => {
    const { activeFaction, reinforcements } = get();
    return reinforcements[activeFaction] ?? 0;
  },
}));
