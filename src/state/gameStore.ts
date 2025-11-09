import { create } from "zustand";

export type FactionId =
  | "regime"
  | "alliance"
  | "sdf"
  | "isis"
  | "rebels"
  | "axis"
  | "neutral";

export interface FactionData {
  name: string;
  color: string;
  flag: string;
  portrait: string;
}

export interface ProvinceState {
  id: string;
  owner: FactionId;
  armies: number;
}

interface GameState {
  factions: Record<FactionId, FactionData>;
  provinces: Record<string, ProvinceState>;
  setOwner: (provinceId: string, owner: FactionId) => void;
  cycleOwner: (provinceId: string) => void;
  attackProvince: (attackerId: string, defenderId: string) => void;
  addArmy: (provinceId: string, amount?: number) => void;
}

const FACTION_ORDER: FactionId[] = [
  "regime",
  "alliance",
  "sdf",
  "isis",
  "rebels",
  "axis",
  "neutral",
];

export const useGameStore = create<GameState>((set, get) => ({
  factions: {
    regime: {
      name: "Assad Regime",
      color: "#8B0000",
      flag: "/assets/factions/regime/flag.jpg",
      portrait: "/assets/factions/regime/portrait.jpg",
    },
    alliance: {
      name: "Alliance (Iran/Russia)",
      color: "#0033FF",
      flag: "/assets/factions/alliance/flag.jpg",
      portrait: "/assets/factions/alliance/portrait.jpeg",
    },
    sdf: {
      name: "Syrian Democratic Forces",
      color: "#FFD700",
      flag: "/assets/factions/sdf/flag.png",
      portrait: "/assets/factions/sdf/portrait.jpg",
    },
    isis: {
      name: "ISIS",
      color: "#000000",
      flag: "/assets/factions/isis/flag.png",
      portrait: "/assets/factions/isis/portrait.jpg",
    },
    rebels: {
      name: "Free Rebels",
      color: "#008000",
      flag: "/assets/factions/rebels/flag.svg",
      portrait: "/assets/factions/rebels/portrait.jpeg",
    },
    axis: {
      name: "Axis (HTS/Turkey)",
      color: "#FFFFFF",
      flag: "/assets/factions/axis/flag.png",
      portrait: "/assets/factions/axis/portrait.png",
    },
    neutral: {
      name: "Neutral / Contested",
      color: "#808080",
      flag: "/assets/factions/neutral/flag.png",
      portrait: "/assets/factions/neutral/portrait.jpg",
    },
  },

  provinces: {},

  setOwner: (id, owner) =>
    set((s) => ({
      provinces: {
        ...s.provinces,
        [id]: { id, owner, armies: s.provinces[id]?.armies ?? 0 },
      },
    })),

  attackProvince: (attackerId: string, defenderId: string) =>
    set((s) => {
      const attacker = s.provinces[attackerId];
      const defender = s.provinces[defenderId];
      if (!attacker || !defender) return s;

      // 🧩 adjacency rules (define once)
      const adjacency: Record<string, string[]> = {
        Damascus: ["Rural_Damascus", "Daraa", "Homs", "Quneitra"],
        Rural_Damascus: ["Damascus", "Homs", "Daraa", "As-Suwayda"],
        Daraa: ["Rural_Damascus", "Quneitra", "As-Suwayda"],
        Quneitra: ["Damascus", "Daraa"],
        "As-Suwayda": ["Rural_Damascus", "Daraa"],
        Homs: ["Rural_Damascus", "Hama", "Tartus"],
        Hama: ["Homs", "Aleppo", "Idlib"],
        Aleppo: ["Idlib", "Hama", "Ar-Raqqah"],
        Idlib: ["Hama", "Aleppo", "Latakia"],
        Latakia: ["Idlib", "Hama", "Tartus"],
        Tartus: ["Latakia", "Homs"],
        "Ar-Raqqah": ["Aleppo", "Deir_ez-zor", "Al-Hasakah"],
        "Deir_ez-zor": ["Ar-Raqqah", "Al-Hasakah"],
        "Al-Hasakah": ["Ar-Raqqah", "Deir_ez-zor"],
      };

      // ❌ must be adjacent
      if (!adjacency[attackerId]?.includes(defenderId)) {
        console.warn("🚫 Attack not allowed — not adjacent!");
        return s;
      }

      // ❌ must have enough troops
      if (attacker.armies <= 1 || attacker.armies < defender.armies) {
        console.warn("🚫 Not enough armies to attack!");
        return s;
      }

      // 🎲 Probabilistic combat (like real Risk)
      const attackPower = attacker.armies + Math.random() * 3;
      const defendPower = defender.armies + Math.random() * 3;

      let newAttackerArmies = attacker.armies;
      let newDefenderArmies = defender.armies;
      let newOwner = defender.owner;

      if (attackPower > defendPower) {
        // attacker wins (but loses troops)
        const loss = Math.floor(Math.random() * 2) + 1; // 1–2 loss
        newAttackerArmies = Math.max(1, attacker.armies - loss);
        newDefenderArmies = 0;
        newOwner = attacker.owner;
      } else {
        // defender wins (attacker loses)
        const loss = Math.floor(Math.random() * 2) + 1;
        newAttackerArmies = Math.max(0, attacker.armies - loss);
        newDefenderArmies = Math.max(1, defender.armies - 1);
      }

      return {
        provinces: {
          ...s.provinces,
          [attackerId]: { ...attacker, armies: newAttackerArmies },
          [defenderId]: {
            ...defender,
            armies: newDefenderArmies,
            owner: newOwner,
          },
        },
      };
    }),

  cycleOwner: (id) => {
    const s = get();
    const current = s.provinces[id]?.owner ?? "neutral";
    const idx = FACTION_ORDER.indexOf(current);
    const next = FACTION_ORDER[(idx + 1) % FACTION_ORDER.length];
    s.setOwner(id, next);
  },

  addArmy: (id, amount = 1) =>
    set((s) => {
      const current = s.provinces[id];
      if (!current) return s;
      return {
        provinces: {
          ...s.provinces,
          [id]: {
            ...current,
            armies: Math.max(0, current.armies + amount),
          },
        },
      };
    }),
}));
