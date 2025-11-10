"use client";
import SeaBackground from "@/components/SeaBackground";
import SyrianMap from "@/components/SyrianMap";
import TurnHUD from "@/components/TurnHUD";
import { useTurnStore } from "@/state/turnStore";
import { useEffect } from "react";
import SeedInitial from "./seed-initial";
import CombatModal from "@/components/CombatModal";
import MarchModal from "@/components/MarchModal";

export default function Page() {
  const startTurn = useTurnStore((s) => s.startTurn);

  useEffect(() => {
    const { activeFaction } = useTurnStore.getState();
    if (!activeFaction) startTurn();
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <SeaBackground />
      <SeedInitial />
      <TurnHUD />
      <div className="absolute inset-0 flex items-center justify-center">
        <SyrianMap />
      </div>
      <CombatModal />
      <MarchModal />
    </main>
  );
}
