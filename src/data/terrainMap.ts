export type TerrainType =
  | "mountain"
  | "desert"
  | "urban"
  | "plains"
  | "forest"
  | "coastal";

export const provinceTerrains: Record<string, TerrainType> = {
  Aleppo: "urban",
  Idlib: "mountain",
  Latakia: "coastal",
  Tartus: "coastal",
  Hama: "plains",
  Homs: "plains",
  Damascus: "urban",
  Rural_Damascus: "mountain",
  Daraa: "plains",
  Quneitra: "plains",
  "As-Suwayda": "mountain",
  "Ar-Raqqah": "desert",
  "Deir_ez-zor": "desert",
  "Al-Hasakah": "plains",
};
