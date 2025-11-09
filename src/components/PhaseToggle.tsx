// components/PhaseToggle.tsx
"use client";
import { useTurnStore } from "@/state/turnStore";

export default function PhaseToggle() {
  const { phase, setPhase } = useTurnStore();
  const next = phase === "deploy" ? "attack" : "deploy";

  return (
    <div className="absolute top-5 right-5 z-50">
      <button
        onClick={() => setPhase(next)}
        className="px-4 py-2 bg-blue-600/70 hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg backdrop-blur-md"
      >
        PHASE: {phase.toUpperCase()}
      </button>
    </div>
  );
}
