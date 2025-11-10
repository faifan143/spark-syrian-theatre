"use client";

import { useGameStore } from "@/state/gameStore";
import { useTurnStore } from "@/state/turnStore";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function WarHUD() {
  const activeFaction = useTurnStore((s) => s.activeFaction);
  const phase = useTurnStore((s) => s.phase);
  const timeLeft = useTurnStore((s) => s.timeLeft);
  const tick = useTurnStore((s) => s.tick);
  const endPhase = useTurnStore((s) => s.endPhase);
  const endTurn = useTurnStore((s) => s.endTurn);
  const carryPool = useTurnStore((s) => s.reinforcements[activeFaction] ?? 0);

  const faction = useGameStore((s) => s.factions[activeFaction]);
  const provinces = useGameStore((s) => s.provinces);

  // compute the current turn’s gained breakdown (base+bonus)
  const { base, bonus, owned } = useMemo(() => {
    const ownedCount = Object.values(provinces).filter(
      (p) => p.owner === activeFaction
    ).length;
    return { base: 3, bonus: Math.floor(ownedCount / 3), owned: ownedCount };
  }, [provinces, activeFaction]);

  useEffect(() => {
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [tick]);

  const colors: Record<string, string> = {
    regime: "#dc2626",
    rebels: "#16a34a",
    alliance: "#3b82f6",
    sdf: "#f59e0b",
    axis: "#94a3b8",
    isis: "#1f2937",
  };
  const color = colors[activeFaction] ?? "#64748b";

  const [confirmVisible, setConfirmVisible] = useState(false);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-40">
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/40" />
      </div>

      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="max-w-7xl w-full px-8 py-6 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-5">
            <div
              className="relative w-16 h-16 rounded-xl overflow-hidden border-2 shadow-2xl"
              style={{
                borderColor: color,
                boxShadow: `0 0 20px ${color}80, inset 0 0 10px rgba(0,0,0,0.5)`,
              }}
            >
              <Image
                src={faction.portrait}
                alt={faction.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-white tracking-wider uppercase">
                {faction.name}
              </h2>
              <Image src={faction.flag} alt="flag" width={35} height={35} />
            </div>

            {/* Reinforcement HUD */}
            {phase === "deploy" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="ml-6 bg-zinc-900/70 border border-yellow-400/40 rounded-lg px-4 py-2 text-sm text-yellow-300 font-semibold shadow-[0_0_10px_rgba(250,204,21,0.3)]"
              >
                <div>
                  🪖 Reinforcements:{" "}
                  <span className="text-yellow-400 text-lg font-bold">
                    {carryPool}
                  </span>
                </div>
                <div className="text-[12px] text-yellow-200/70 mt-0.5">
                  +{base} base + +{bonus} from {owned} provinces
                </div>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 0.7 }}
            transition={{ duration: 0.6 }}
            className="relative flex items-center justify-center w-[120px] h-[120px]"
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: `0 0 30px ${
                  timeLeft < 15 ? "#f87171" : "#22d3ee"
                }50, inset 0 0 10px rgba(255,255,255,0.05)`,
                border: `2px solid ${timeLeft < 15 ? "#f87171" : "#22d3ee"}80`,
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-4xl font-extrabold font-mono ${
                  timeLeft < 10 ? "text-red-400 animate-pulse" : "text-cyan-300"
                } drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]`}
              >
                {timeLeft}
              </span>
              <span className="text-[11px] font-semibold text-cyan-200/70 uppercase tracking-[0.15em] mt-1">
                Time Left
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* bottom phase controller */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-2"
        >
          <motion.h2
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white font-extrabold text-base uppercase tracking-[0.15em]"
            style={{ textShadow: `0 0 10px ${color}` }}
          >
            {phase === "deploy"
              ? "Deploy"
              : phase === "attack"
              ? "Attack"
              : "End"}
          </motion.h2>

          <div className="flex items-center gap-1">
            {["deploy", "attack", "end"].map((p) => (
              <motion.div
                key={p}
                initial={{ opacity: 0.3, scale: 0.9 }}
                animate={{
                  opacity: p === phase ? 1 : 0.25,
                  scale: p === phase ? 1.05 : 1,
                }}
                transition={{ duration: 0.4 }}
                className={`h-1.5 w-10 rounded-full ${
                  p === phase
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-[0_0_8px_rgba(250,204,21,0.7)]"
                    : "bg-zinc-600"
                }`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() =>
              phase === "end" ? setConfirmVisible(true) : endPhase()
            }
            className="mt-2 px-6 py-2 rounded-full text-black font-extrabold text-sm uppercase tracking-widest
               bg-gradient-to-b from-yellow-400 to-yellow-600 border border-yellow-300/40"
          >
            {phase !== "end" ? "Next Phase" : "End Turn"}
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {confirmVisible && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-zinc-900/90 border-2 border-yellow-400/40 rounded-2xl p-8 text-center shadow-2xl w-[400px]"
            >
              <AlertTriangle className="mx-auto text-yellow-400 mb-4 w-12 h-12 animate-pulse" />
              <h2 className="text-2xl font-bold text-yellow-300 uppercase mb-2">
                End Turn?
              </h2>
              <p className="text-sm text-white/80 mb-6">
                Are you sure you want to end your turn? All remaining actions
                will be skipped.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setConfirmVisible(false)}
                  className="px-5 py-2 rounded-md bg-zinc-700 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setConfirmVisible(false);
                    endTurn();
                  }}
                  className="px-5 py-2 rounded-md bg-yellow-500 text-black font-bold"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
