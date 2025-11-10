import { create } from "zustand";
import { FactionId, useGameStore } from "./gameStore";

export type CombatResult = "attacker" | "defender" | null;

type Roll = {
  attacker: number | null;
  defender: number | null;
};

interface MarchPromptState {
  isOpen: boolean;
  from: string | null;
  to: string | null;
  maxMovable: number;
}

export interface CombatState {
  isOpen: boolean;
  attackerId: string | null;
  defenderId: string | null;
  rolling: boolean;
  lastRoll: Roll;
  result: CombatResult;

  marchPrompt: MarchPromptState;
  getSnapshot: () => {
    attacker?: { id: string; owner: FactionId; armies: number };
    defender?: { id: string; owner: FactionId; armies: number };
    attackerFactionColor?: string;
    defenderFactionColor?: string;
  };
  openCombat: (attackerId: string, defenderId: string) => void;
  closeCombat: () => void;
  rollDice: () => void;

  openMarchPrompt: (from: string, to: string, maxMovable: number) => void;
  closeMarchPrompt: () => void;
  moveTroops: (amount: number) => void;
}

export const useCombatStore = create<CombatState>((set, get) => ({
  isOpen: false,
  attackerId: null,
  defenderId: null,
  rolling: false,
  lastRoll: { attacker: null, defender: null },
  result: null,

  marchPrompt: {
    isOpen: false,
    from: null,
    to: null,
    maxMovable: 0,
  },

  // 📊 Snapshot of current combat state
  getSnapshot: () => {
    const { attackerId, defenderId } = get();
    const { provinces, factions } = useGameStore.getState();
    const a = attackerId ? provinces[attackerId] : undefined;
    const d = defenderId ? provinces[defenderId] : undefined;
    return {
      attacker: a ? { id: a.id, owner: a.owner, armies: a.armies } : undefined,
      defender: d ? { id: d.id, owner: d.owner, armies: d.armies } : undefined,
      attackerFactionColor: a ? factions[a.owner].color : undefined,
      defenderFactionColor: d ? factions[d.owner].color : undefined,
    };
  },

  // ⚔️ Open a combat session
  openCombat: (attackerId, defenderId) =>
    set({
      isOpen: true,
      attackerId,
      defenderId,
      rolling: false,
      lastRoll: { attacker: null, defender: null },
      result: null,
    }),

  // ❌ Close combat modal
  closeCombat: () =>
    set({
      isOpen: false,
      attackerId: null,
      defenderId: null,
      rolling: false,
      lastRoll: { attacker: null, defender: null },
      result: null,
    }),

  // 🎲 Roll + Auto Resolve Immediately
  rollDice: () => {
    if (!get().isOpen) return;

    const { attackerId, defenderId } = get();
    if (!attackerId || !defenderId) return;

    const { provinces } = useGameStore.getState();
    const A = provinces[attackerId];
    const D = provinces[defenderId];
    if (!A || !D) return;

    // 🚫 Prevent attacks with only 1 army
    if (A.armies <= 1) {
      console.warn("🚫 Cannot attack with only 1 troop!");
      set({ result: null, lastRoll: { attacker: null, defender: null } });
      return;
    }

    // Continue normal rolling logic...
    set({ rolling: true });

    setTimeout(() => {
      const attackerRoll = 1 + Math.floor(Math.random() * 6);
      const defenderRoll = 1 + Math.floor(Math.random() * 6);

      set({
        lastRoll: { attacker: attackerRoll, defender: defenderRoll },
        rolling: false,
      });

      let result: CombatResult = null;
      let newAttackerArmies = A.armies;
      let newDefenderArmies = D.armies;
      let newOwner = D.owner;

      if (attackerRoll > defenderRoll) {
        newDefenderArmies = Math.max(0, D.armies - 1);
        result = "attacker";
      } else {
        newAttackerArmies = Math.max(0, A.armies - 1);
        result = "defender";
      }

      // 🏳️ Capture if wiped out
      if (newDefenderArmies <= 0) {
        newOwner = A.owner;
        newDefenderArmies = 0;
        const movable = Math.max(0, newAttackerArmies - 1);

        setTimeout(() => {
          set({
            marchPrompt: {
              isOpen: true,
              from: attackerId,
              to: defenderId,
              maxMovable: movable,
            },
          });
        }, 800);
      }

      useGameStore.setState((s) => ({
        provinces: {
          ...s.provinces,
          [attackerId]: { ...A, armies: newAttackerArmies },
          [defenderId]: {
            ...D,
            owner: newOwner,
            armies: newDefenderArmies,
          },
        },
      }));

      set({ result });
    }, 800);
  },

  // 🚶 March modal open
  openMarchPrompt: (from, to, maxMovable) =>
    set({
      marchPrompt: { isOpen: true, from, to, maxMovable },
    }),

  // 🚫 March modal close
  closeMarchPrompt: () =>
    set({
      marchPrompt: { isOpen: false, from: null, to: null, maxMovable: 0 },
    }),

  // 🧍 Move troops between provinces
  moveTroops: (amount) => {
    const { from, to } = get().marchPrompt;
    if (!from || !to) return;

    const { provinces } = useGameStore.getState();
    const A = provinces[from];
    const D = provinces[to];
    if (!A || !D) return;

    const move = Math.min(amount, Math.max(0, A.armies - 1));
    useGameStore.setState((s) => ({
      provinces: {
        ...s.provinces,
        [from]: { ...A, armies: A.armies - move },
        [to]: { ...D, armies: D.armies + move },
      },
    }));

    set({
      marchPrompt: { isOpen: false, from: null, to: null, maxMovable: 0 },
    });
  },
}));
