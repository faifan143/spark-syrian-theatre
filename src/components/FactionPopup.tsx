// ==========================================
// FactionPopup.tsx (SOFTER COLORS)
// ==========================================

"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useGameStore } from "@/state/gameStore";
import { Zap, Sword, Shield, AlertTriangle } from "lucide-react";
import { useTurnStore } from "@/state/turnStore";
import toast from "react-hot-toast";

interface FactionPopupProps {
  provinceId: string | null;
  onClose: () => void;
}

export default function FactionPopup({
  provinceId,
  onClose,
}: FactionPopupProps) {
  const factions = useGameStore((s) => s.factions);
  const { activeFaction: currentFaction, phase, canControl } = useTurnStore();
  const attackProvince = useGameStore((s) => s.attackProvince);

  const province = useGameStore((s) =>
    provinceId ? s.provinces[provinceId] : null
  );

  if (!provinceId || !province) return null;

  const faction = factions[province.owner];
  const armies = province.armies ?? 0;

  // Softer, more eye-relieving colors
  const factionColors: Record<
    string,
    { bg: string; border: string; text: string }
  > = {
    regime: { bg: "#5C1A1A", border: "#E07070", text: "#FFFFFF" },
    alliance: { bg: "#1A2E4A", border: "#6B8FD9", text: "#FFFFFF" },
    sdf: { bg: "#6B6B1A", border: "#D4D46B", text: "#FFFFFF" },
    isis: { bg: "#2A2A2A", border: "#5A5A5A", text: "#FFFFFF" },
    rebels: { bg: "#1A4A1A", border: "#6BC76B", text: "#FFFFFF" },
    axis: { bg: "#C9C9C9", border: "#888888", text: "#000000" },
    neutral: { bg: "#5A5A5A", border: "#808080", text: "#FFFFFF" },
  };

  const colors = factionColors[province.owner] || factionColors.neutral;

  return (
    <AnimatePresence>
      <motion.div
        key={provinceId}
        initial={{ opacity: 0, scale: 0.6, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.6, y: 50 }}
        transition={{
          duration: 0.3,
          type: "spring",
          stiffness: 400,
          damping: 40,
        }}
        style={{
          position: "fixed",
          bottom: "30px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          width: "360px",
        }}
      >
        {/* MAIN CARD */}
        <div
          style={{
            backgroundColor: colors.bg,
            border: `5px solid ${colors.border}`,
            borderRadius: "10px",
            boxShadow:
              "0 10px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.2)",
            overflow: "hidden",
            fontFamily: "'Arial', sans-serif",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.4)",
              padding: "12px 16px",
              borderBottom: `2px solid ${colors.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  color: colors.text,
                  fontSize: "20px",
                  fontWeight: "900",
                  margin: "0 0 2px 0",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {province.id.replaceAll("_", " ")}
              </h2>
              <p
                style={{
                  color: colors.text,
                  fontSize: "9px",
                  fontWeight: "bold",
                  margin: "0",
                  opacity: 0.8,
                  letterSpacing: "0.5px",
                }}
              >
                TERRITORY CONTROLLED
              </p>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: colors.border,
                border: `2px solid ${colors.text}`,
                borderRadius: "5px",
                color: colors.text,
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ✕
            </motion.button>
          </div>

          {/* CONTENT */}
          <div
            style={{
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* FACTION INFO ROW */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "10px",
                backgroundColor: "rgba(0,0,0,0.3)",
                padding: "12px",
                borderRadius: "6px",
                border: `2px solid ${colors.border}`,
                alignItems: "center",
              }}
            >
              {/* PORTRAIT */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    position: "relative",
                    width: "50px",
                    height: "50px",
                    border: `2px solid ${colors.border}`,
                    borderRadius: "4px",
                    overflow: "hidden",
                    boxShadow: "0 3px 6px rgba(0,0,0,0.5)",
                  }}
                >
                  <Image
                    src={faction.portrait}
                    alt="leader"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
              {/* FACTION NAME */}
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    color: colors.text,
                    fontSize: "22px",
                    fontWeight: "900",
                    margin: "0",
                    lineHeight: "1.1",
                  }}
                >
                  {faction.name}
                </p>
              </div>
            </motion.div>

            {/* ARMIES SECTION */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{
                backgroundColor: "rgba(0,0,0,0.3)",
                padding: "14px",
                borderRadius: "6px",
                border: `3px solid ${colors.border}`,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: colors.text,
                  fontSize: "8px",
                  fontWeight: "bold",
                  margin: "0 0 8px 0",
                  opacity: 0.8,
                  letterSpacing: "1px",
                }}
              >
                ARMIES
              </p>

              <motion.div
                key={armies}
                animate={{ scale: [0.7, 1.2, 1] }}
                transition={{ duration: 0.4 }}
                style={{
                  color: colors.text,
                  fontSize: "48px",
                  fontWeight: "900",
                  margin: "0",
                  textShadow: `0 4px 8px rgba(0,0,0,0.5)`,
                }}
              >
                {armies}
              </motion.div>

              {/* ARMY BARS */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "4px",
                  marginTop: "8px",
                  flexWrap: "wrap",
                }}
              >
                {Array.from({ length: Math.min(armies, 10) }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{
                      delay: i * 0.05,
                      type: "spring",
                      stiffness: 200,
                    }}
                    style={{
                      width: "3px",
                      height: "14px",
                      backgroundColor: colors.border,
                      borderRadius: "2px",
                      boxShadow: `0 2px 4px rgba(0,0,0,0.5)`,
                      transformOrigin: "bottom",
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* STATUS GRID */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {/* STRENGTH */}
              <div
                style={{
                  backgroundColor: "rgba(0,0,0,0.3)",
                  padding: "10px",
                  borderRadius: "5px",
                  border: `1.5px solid ${colors.border}`,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <p
                  style={{
                    color: colors.text,
                    fontSize: "8px",
                    fontWeight: "bold",
                    margin: "0",
                    opacity: 0.8,
                    letterSpacing: "0.5px",
                  }}
                >
                  STRENGTH
                </p>

                {/* Icon */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "24px",
                  }}
                >
                  {armies > 10 ? (
                    <Zap size={22} color={colors.border} strokeWidth={2.5} />
                  ) : armies > 6 ? (
                    <Sword size={22} color={colors.border} strokeWidth={2} />
                  ) : armies > 2 ? (
                    <Shield size={22} color={colors.border} strokeWidth={2} />
                  ) : (
                    <AlertTriangle
                      size={22}
                      color={colors.border}
                      strokeWidth={2}
                    />
                  )}
                </div>

                {/* Strength Level Text */}
                <p
                  style={{
                    color: colors.border,
                    fontSize: "10px",
                    fontWeight: "900",
                    margin: "0",
                    letterSpacing: "0.5px",
                  }}
                >
                  {armies > 10
                    ? "FORMIDABLE"
                    : armies > 6
                    ? "STRONG"
                    : armies > 2
                    ? "DEFENDED"
                    : "WEAK"}
                </p>

                {/* Strength Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: "3px",
                    border: `1px solid ${colors.border}`,
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min((armies / 12) * 100, 100)}%`,
                    }}
                    transition={{ duration: 0.6, type: "spring" }}
                    style={{
                      height: "100%",
                      backgroundColor: colors.border,
                      borderRadius: "2px",
                    }}
                  />
                </div>
              </div>

              {/* CONTROL */}
              <div
                style={{
                  backgroundColor: "rgba(0,0,0,0.3)",
                  padding: "10px",
                  borderRadius: "5px",
                  border: `1.5px solid ${colors.border}`,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <p
                  style={{
                    color: colors.text,
                    fontSize: "8px",
                    fontWeight: "bold",
                    margin: "0",
                    opacity: 0.8,
                    letterSpacing: "0.5px",
                  }}
                >
                  FLAG
                </p>
                {/* FLAG */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div
                    style={{
                      position: "relative",
                      width: "50px",
                      height: "36px",
                      border: `2px solid ${colors.border}`,
                      borderRadius: "4px",
                      overflow: "hidden",
                      boxShadow: "0 3px 6px rgba(0,0,0,0.5)",
                    }}
                  >
                    <Image
                      src={faction.flag}
                      alt="flag"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
            {/* ⚔️ ATTACK BUTTON — only visible if it’s your turn and in Attack phase */}
            {phase === "attack" &&
              canControl(currentFaction) &&
              province.owner !== currentFaction && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const state = useGameStore.getState();
                    const attackerEntry = Object.entries(state.provinces).find(
                      ([, p]) =>
                        p.owner === currentFaction &&
                        p.armies >= state.provinces[province.id].armies &&
                        state.provinces[p.id] &&
                        {
                          Damascus: [
                            "Rural_Damascus",
                            "Daraa",
                            "Homs",
                            "Quneitra",
                          ],
                          Rural_Damascus: [
                            "Damascus",
                            "Homs",
                            "Daraa",
                            "As-Suwayda",
                          ],
                          Daraa: ["Rural_Damascus", "Quneitra", "As-Suwayda"],
                          Quneitra: ["Damascus", "Daraa"],
                          "As-Suwayda": ["Rural_Damascus", "Daraa"],
                          Homs: ["Rural_Damascus", "Hama", "Tartus"],
                          Hama: ["Homs", "Aleppo", "Idlib"],
                          Aleppo: ["Idlib", "Hama", "Ar-Raqqah"],
                          Idlib: ["Hama", "Aleppo", "Latakia"],
                          Latakia: ["Idlib", "Hama", "Tartus"],
                          Tartus: ["Latakia", "Homs"],
                          "Ar-Raqqah": ["Aleppo", "Deir_ez-zor", "Al-Hasakah"],
                          "Deir_ez-zor": ["Ar-Raqqah", "Al-Hasakah"],
                          "Al-Hasakah": ["Ar-Raqqah", "Deir_ez-zor"],
                        }[p.id]?.includes(province.id)
                    );

                    if (!attackerEntry) {
                      toast.error(
                        "You must attack from an adjacent territory with equal or greater troops!"
                      );

                      return;
                    }

                    const attacker = attackerEntry[0];
                    attackProvince(attacker, province.id);
                    onClose();
                  }}
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: colors.border,
                    color: colors.text,
                    fontWeight: 900,
                    fontSize: "16px",
                    borderRadius: "6px",
                    border: `2px solid ${colors.text}`,
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  ⚔️ ATTACK
                </motion.button>
              )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
