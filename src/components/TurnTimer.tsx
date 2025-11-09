"use client";

import { useEffect } from "react";
import { useTurnStore } from "@/state/turnStore";

export default function TurnTimer() {
  const { currentFaction, turnTimer, tick, isRunning } = useTurnStore();

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  return (
    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50">
      <div className="px-5 py-2 rounded-lg bg-black/60 text-white text-center font-bold text-lg shadow-lg border border-white/10 backdrop-blur-md">
        <p className="text-sm text-gray-300">TURN</p>
        <p className="text-xl">
          {currentFaction.toUpperCase()} —{" "}
          <span className={turnTimer < 10 ? "text-red-400" : "text-green-300"}>
            {turnTimer}s
          </span>
        </p>
      </div>
    </div>
  );
}
