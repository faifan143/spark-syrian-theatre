"use client";

import { useTurnStore } from "@/state/turnStore";
import { useEffect } from "react";

export default function TurnHUD() {
  const {
    activeFaction,
    phase,
    timeLeft,
    tick,
    endPhase,
    endTurn,
    troopsToDeploy,
  } = useTurnStore();

  useEffect(() => {
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [tick, activeFaction]);

  return (
    <div className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 text-white bg-black/40 backdrop-blur-sm text-sm font-bold z-50">
      <div>
        🎯 Current Faction:{" "}
        <span className="text-blue-300">{activeFaction}</span>
      </div>
      <div>
        Phase:{" "}
        <span className="text-yellow-300 uppercase tracking-wider">
          {phase}
        </span>
      </div>
      <div>
        ⏱️ Time: <span className="text-red-300">{timeLeft}s</span>
      </div>
      <div>
        {phase === "deploy" && (
          <span className="text-green-300">
            Troops left to deploy: {troopsToDeploy}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {phase !== "end" && (
          <button
            onClick={endPhase}
            className="bg-yellow-500 text-black px-3 py-1 rounded font-semibold"
          >
            Next Phase
          </button>
        )}
        {phase === "end" && (
          <button
            onClick={endTurn}
            className="bg-red-500 text-white px-3 py-1 rounded font-semibold"
          >
            End Turn
          </button>
        )}
      </div>
    </div>
  );
}
