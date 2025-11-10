"use client";

import { useCombatStore } from "@/state/combatStore";
import { useGameStore } from "@/state/gameStore";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";

export default function CombatModal() {
  const {
    isOpen,
    closeCombat,
    getSnapshot,
    rolling,
    lastRoll,
    result,
    rollDice,
  } = useCombatStore();

  const { attacker, defender, attackerFactionColor, defenderFactionColor } =
    getSnapshot();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCombat();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCombat]);

  if (!isOpen || !attacker || !defender) return null;

  const aFaction = useGameStore.getState().factions[attacker.owner];
  const dFaction = useGameStore.getState().factions[defender.owner];

  return (
    <AnimatePresence>
      <motion.div
        key="combat"
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-[700px] max-w-[90vw] rounded-2xl bg-zinc-900/90 border border-white/10 shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
            <h2 className="text-xl font-bold uppercase tracking-widest text-white">
              Combat Engagement
            </h2>
            <button
              onClick={closeCombat}
              className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded-md"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 grid grid-cols-2 gap-6">
            <CombatSide
              label="Attacker"
              color={attackerFactionColor ?? "#22c55e"}
              faction={aFaction.name}
              portrait={aFaction.portrait}
              flag={aFaction.flag}
              armies={attacker.armies}
              die={lastRoll.attacker}
              rolling={rolling}
            />
            <CombatSide
              label="Defender"
              color={defenderFactionColor ?? "#ef4444"}
              faction={dFaction.name}
              portrait={dFaction.portrait}
              flag={dFaction.flag}
              armies={defender.armies}
              die={lastRoll.defender}
              rolling={rolling}
            />
          </div>

          {/* Controls */}
          <div className="px-6 pb-6 flex justify-between items-center">
            <motion.div
              key={result}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ResultBadge result={result} />
            </motion.div>
            <div className="flex gap-3">
              <button
                onClick={rollDice}
                disabled={rolling || attacker.armies <= 1}
                className={`px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-md uppercase tracking-wider ${
                  attacker.armies <= 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                🎲 Roll & Resolve
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function CombatSide({
  label,
  color,
  faction,
  portrait,
  flag,
  armies,
  die,
  rolling,
}: {
  label: string;
  color: string;
  faction: string;
  portrait: string;
  flag: string;
  armies: number;
  die: number | null;
  rolling: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="flex justify-between mb-2 text-sm text-white/70 uppercase tracking-widest">
        <span>{label}</span>
        <span>{faction}</span>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="relative w-12 h-12 rounded-lg overflow-hidden border-2"
          style={{ borderColor: color }}
        >
          <Image src={portrait} alt={faction} fill className="object-cover" />
        </div>
        <div className="text-white text-sm">
          Armies: <span className="font-bold">{armies}</span>
        </div>
        <Image src={flag} alt="flag" width={28} height={18} />
      </div>
      <motion.div
        animate={rolling ? { rotate: [0, 90, 180, 270, 360] } : { rotate: 0 }}
        transition={{ duration: 0.6 }}
        className="w-16 h-16 grid place-items-center rounded-lg bg-white text-black text-2xl font-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
        style={{
          boxShadow: `0 0 16px ${color}80, inset 0 2px 5px rgba(0,0,0,0.3)`,
        }}
      >
        {die ?? "•"}
      </motion.div>
    </div>
  );
}

function ResultBadge({ result }: { result: "attacker" | "defender" | null }) {
  if (!result)
    return (
      <span className="text-white/70 text-sm tracking-widest">
        Awaiting roll…
      </span>
    );
  return (
    <span
      className={`px-4 py-2 rounded-md font-bold uppercase tracking-widest ${
        result === "attacker"
          ? "bg-emerald-500 text-black"
          : "bg-rose-600 text-white"
      }`}
    >
      {result === "attacker" ? "Attacker Wins" : "Defender Holds"}
    </span>
  );
}
