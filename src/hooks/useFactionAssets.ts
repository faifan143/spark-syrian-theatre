import { useState, useEffect } from "react";

export interface FactionMeta {
  id: string;
  title: string;
  color: string;
  flag: string;
  portrait: string;
}

export function useFactionAssets() {
  const [factions, setFactions] = useState<Record<string, FactionMeta>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const factionIds = [
      "regime",
      "alliance",
      "sdf",
      "isis",
      "rebels",
      "axis",
      "neutral",
    ];

    async function loadAll() {
      const data: Record<string, FactionMeta> = {};
      for (const id of factionIds) {
        try {
          const res = await fetch(`/assets/factions/${id}/meta.json`);
          if (!res.ok) continue;
          const meta = (await res.json()) as FactionMeta;
          data[id] = meta;
        } catch (e) {
          console.warn(`⚠️ Missing meta.json for ${id}`, e);
        }
      }
      setFactions(data);
      setLoading(false);
    }

    loadAll();
  }, []);

  function getFaction(id: string): FactionMeta | undefined {
    return factions[id];
  }

  return { factions, getFaction, loading };
}
