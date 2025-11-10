"use client";

import { useCombatStore } from "@/state/combatStore";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function MarchModal() {
  const marchPrompt = useCombatStore((s) => s.marchPrompt);
  const moveTroops = useCombatStore((s) => s.moveTroops);
  const closeMarchPrompt = useCombatStore((s) => s.closeMarchPrompt);

  const [amount, setAmount] = useState(0);

  if (!marchPrompt.isOpen || !marchPrompt.from || !marchPrompt.to) {
    return null;
  }

  const max = marchPrompt.maxMovable ?? 1;

  function handleMarch() {
    if (amount <= 0) return;
    moveTroops(amount);
    setAmount(0);
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-zinc-900/90 border border-yellow-400/40 rounded-xl p-8 text-center shadow-2xl w-[400px]"
        >
          <h2 className="text-xl font-bold text-yellow-300 mb-2 uppercase tracking-wide">
            March Troops
          </h2>
          <p className="text-white/80 mb-6 text-sm">
            Move troops from{" "}
            <span className="font-bold text-yellow-400">
              {marchPrompt.from}
            </span>{" "}
            →{" "}
            <span className="font-bold text-yellow-400">{marchPrompt.to}</span>
          </p>

          <input
            type="range"
            min={1}
            max={max}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-yellow-400"
          />
          <p className="text-yellow-200 mt-2">{amount} troops selected</p>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={closeMarchPrompt}
              className="px-5 py-2 bg-zinc-700 text-white rounded-md hover:bg-zinc-600"
            >
              Cancel
            </button>
            <button
              onClick={handleMarch}
              disabled={amount <= 0}
              className="px-5 py-2 bg-yellow-500 text-black font-bold rounded-md hover:bg-yellow-400"
            >
              March
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
