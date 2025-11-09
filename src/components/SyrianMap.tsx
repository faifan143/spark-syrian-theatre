// ==========================================
// SyrianMap.tsx
// ==========================================

"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/state/gameStore";
import FactionPopup from "./FactionPopup";
import { useTurnStore } from "@/state/turnStore";
import toast from "react-hot-toast";

export default function SyrianMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgMarkup, setSvgMarkup] = useState<string>("");
  const [activeProvince, setActiveProvince] = useState<string | null>(null);
  const { canControl } = useTurnStore();

  const provinces = useGameStore((s) => s.provinces);
  const factions = useGameStore((s) => s.factions);
  const cycleOwner = useGameStore((s) => s.cycleOwner);
  const addArmy = useGameStore((s) => s.addArmy);

  // Enhanced color mapping with better saturation and contrast
  const enhancedColors: Record<string, string> = {
    regime: "#C41E3A",
    alliance: "#1E3A8A",
    sdf: "#FCD34D",
    isis: "#1F2937",
    rebels: "#16A34A",
    axis: "#F5F5F5",
    neutral: "#9CA3AF",
  };

  function darkenColor(hex: string, amount = 35) {
    const [r, g, b] = hex
      .replace("#", "")
      .match(/.{1,2}/g)!
      .map((x) => parseInt(x, 16))
      .map((v) => Math.max(0, v - amount));
    return `rgb(${r}, ${g}, ${b})`;
  }

  function lightenColor(hex: string, amount = 40) {
    const [r, g, b] = hex
      .replace("#", "")
      .match(/.{1,2}/g)!
      .map((x) => parseInt(x, 16))
      .map((v) => Math.min(255, v + amount));
    return `rgb(${r}, ${g}, ${b})`;
  }

  useEffect(() => {
    (async () => {
      const res = await fetch("/board/syria.svg", { cache: "no-cache" });
      if (!res.ok) {
        console.error("❌ Syria map SVG not found");
        return;
      }
      setSvgMarkup(await res.text());
    })();
  }, []);

  useEffect(() => {
    if (!svgMarkup || !containerRef.current) return;

    const root = containerRef.current;
    root.innerHTML = svgMarkup;
    const svg = root.querySelector("svg");
    if (!svg) return;

    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    Object.assign(svg.style, {
      width: "100%",
      height: "auto",
      display: "block",
      overflow: "visible",
      background: "transparent",
    });

    const style = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style"
    );
    style.textContent = `
      .territory {
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        stroke: #0b0b0e;
        stroke-width: 2.5;
        stroke-linejoin: round;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      }
      .territory:hover {
        fill: var(--lighter, #555);
        stroke-width: 3;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
      }
      .territory.active {
        stroke: #FFF;
        stroke-width: 3.5;
        filter: drop-shadow(0 0 12px rgba(255,255,255,0.6)) drop-shadow(0 4px 8px rgba(0,0,0,0.5));
      }
      .label {
        pointer-events: none;
        user-select: none;
        fill: #fff;
        font: 700 12px 'Segoe UI', Montserrat, sans-serif;
        text-anchor: middle;
        dominant-baseline: middle;
        paint-order: stroke;
        stroke: rgba(0,0,0,0.8);
        stroke-width: 1.2px;
        letter-spacing: 0.3px;
        text-shadow: 0 2px 6px rgba(0,0,0,0.5);
      }
      .army-group {
        cursor: pointer;
        filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));
      }
      .army-group circle {
        stroke: rgba(0,0,0,0.9);
        stroke-width: 1.5px;
        transition: all 0.2s ease;
      }
      .army-group:hover circle {
        stroke-width: 2.5px;
        filter: brightness(1.1);
      }
      .army-group text {
        fill: #fff;
        font: 700 13px 'Segoe UI', Montserrat, sans-serif;
        text-anchor: middle;
        dominant-baseline: middle;
        pointer-events: none;
        font-weight: 900;
        letter-spacing: 0.5px;
        paint-order: stroke;
        stroke: rgba(0,0,0,0.6);
        stroke-width: 1px;
      }
      .army-group.highlight circle {
        filter: drop-shadow(0 0 8px rgba(255,255,255,0.7));
      }
    `;
    svg.prepend(style);

    const bbox = svg.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    while (svg.firstChild) g.appendChild(svg.firstChild);
    svg.appendChild(g);
    g.setAttribute("transform", `translate(${400 - cx}, ${294 - cy})`);

    const { provinces: initProvs, factions: initFactions } =
      useGameStore.getState();

    Object.entries(initProvs).forEach(([id, p]) => {
      const path = g.querySelector(
        `#${CSS.escape(id)}`
      ) as SVGPathElement | null;
      if (!path) return;

      path.classList.add("territory");

      // Use enhanced colors from mapping
      const factionId = p.owner as keyof typeof enhancedColors;
      const baseColor = enhancedColors[factionId] ?? "#808080";
      const darker = darkenColor(baseColor, 35);
      const lighter = lightenColor(baseColor, 40);

      path.setAttribute("fill", baseColor);
      path.style.setProperty("--darker", darker);
      path.style.setProperty("--lighter", lighter);

      const b = path.getBBox();

      // Province label with enhanced styling
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.textContent = id.replaceAll("_", " ");
      label.setAttribute("x", `${b.x + b.width / 2}`);
      label.setAttribute("y", `${b.y + b.height / 2 - 8}`);
      label.setAttribute("class", "label");
      svg.appendChild(label);

      // Enhanced Army counter with better visuals
      const armyGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      armyGroup.classList.add("army-group");
      armyGroup.dataset.province = id;

      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      const circleRadius = 12;
      const circleY = b.y + b.height / 2 + 18;

      circle.setAttribute("cx", `${b.x + b.width / 2}`);
      circle.setAttribute("cy", `${circleY}`);
      circle.setAttribute("r", `${circleRadius}`);
      circle.setAttribute("fill", baseColor);

      // Add background circle for better visibility
      const bgCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      bgCircle.setAttribute("cx", `${b.x + b.width / 2}`);
      bgCircle.setAttribute("cy", `${circleY}`);
      bgCircle.setAttribute("r", `${circleRadius + 2}`);
      bgCircle.setAttribute("fill", "rgba(0,0,0,0.2)");

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.textContent = String(p.armies ?? 0);
      text.setAttribute("x", `${b.x + b.width / 2}`);
      text.setAttribute("y", `${circleY}`);

      armyGroup.appendChild(bgCircle);
      armyGroup.appendChild(circle);
      armyGroup.appendChild(text);
      svg.appendChild(armyGroup);
    });

    const onClick = (e: Event) => {
      const target = e.target as Element | null;
      const path = target?.closest(".territory") as SVGPathElement | null;
      if (!path) return;

      const id = path.id;
      const province = useGameStore.getState().provinces[id];
      if (!province) return;

      // ✅ Always get latest state from the store at click time
      const { phase, activeFaction, troopsToDeploy, canControl } =
        useTurnStore.getState();

      // ✅ DEPLOY phase
      if (phase === "deploy") {
        if (!canControl(province.owner)) return;

        if (troopsToDeploy <= 0) {
          return;
        }

        addArmy(id, 1);
        useTurnStore.setState((s) => ({
          troopsToDeploy: Math.max(0, s.troopsToDeploy - 1),
        }));

        if (troopsToDeploy - 1 === 0)
          toast.success("All troops deployed. Proceed to ATTACK phase!");
        return;
      }

      // ✅ ATTACK phase
      if (phase === "attack") {
        if (province.owner === activeFaction) {
          setActiveProvince(null);
          return;
        }

        // enemy province → show popup
        toast("Preparing to attack...", {
          icon: "⚔️",
          style: { background: "#222", color: "#fff" },
        });
        setActiveProvince(id);
        return;
      }

      // ✅ END phase
      if (phase === "end") {
        setActiveProvince(null);
        return;
      }
    };

    svg.addEventListener("click", onClick, { passive: true });
    return () => svg.removeEventListener("click", onClick);
  }, [svgMarkup, cycleOwner, addArmy]);

  // update armies & colors dynamically
  useEffect(() => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    const { provinces: sProvs, factions: sFactions } = useGameStore.getState();

    Object.entries(sProvs).forEach(([id, p]) => {
      const path = svg.querySelector(
        `#${CSS.escape(id)}`
      ) as SVGPathElement | null;
      const armyGroup = svg.querySelector(
        `.army-group[data-province='${CSS.escape(id)}']`
      );
      if (!path || !armyGroup) return;

      const factionId = p.owner as keyof typeof enhancedColors;
      const color = enhancedColors[factionId] ?? "#808080";
      const darker = darkenColor(color, 35);
      const lighter = lightenColor(color, 40);

      path.setAttribute("fill", color);
      path.style.setProperty("--darker", darker);
      path.style.setProperty("--lighter", lighter);

      const bgCircle = armyGroup.querySelector(
        "circle:first-child"
      ) as SVGCircleElement | null;
      const circle = armyGroup.querySelector(
        "circle:last-of-type"
      ) as SVGCircleElement | null;
      const text = armyGroup.querySelector("text");

      if (bgCircle) bgCircle.setAttribute("fill", "rgba(0,0,0,0.2)");
      if (circle) circle.setAttribute("fill", color);
      if (text) {
        text.textContent = String(p.armies ?? 0);
        // Highlight if this province has many armies
        if (p.armies && p.armies > 5) {
          armyGroup.classList.add("highlight");
        } else {
          armyGroup.classList.remove("highlight");
        }
      }
    });

    svg.querySelectorAll(".territory.active").forEach((el) => {
      if (el.id !== activeProvince) el.classList.remove("active");
    });
    if (activeProvince) {
      svg
        .querySelector(`#${CSS.escape(activeProvince)}`)
        ?.classList.add("active");
    }
  }, [provinces, factions, activeProvince]);

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div
        ref={containerRef}
        style={{
          width: "45vw",
          height: "auto",
          maxHeight: "80vh",
          background: "transparent",
        }}
      />
      <FactionPopup
        provinceId={activeProvince}
        onClose={() => setActiveProvince(null)}
      />
    </div>
  );
}
