"use client";

import { useEffect } from "react";
import { useGameStore, FactionId } from "@/state/gameStore";

export default function SeedInitial() {
  const setOwner = useGameStore((s) => s.setOwner);

  useEffect(() => {
    const initialOwnerships: Record<string, FactionId> = {
      Damascus: "regime",
      Rural_Damascus: "regime",
      Daraa: "regime",
      Quneitra: "regime",
      "As-Suwayda": "regime",

      Homs: "regime",
      Hama: "regime",

      Aleppo: "rebels",
      Idlib: "axis",
      Latakia: "regime",
      Tartus: "regime",

      "Ar-Raqqah": "sdf",
      "Deir_ez-zor": "regime",
      "Al-Hasakah": "sdf",
    };

    Object.entries(initialOwnerships).forEach(([id, owner]) => {
      setOwner(id, owner);
    });
  }, [setOwner]);

  return null;
}
