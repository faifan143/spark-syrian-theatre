"use client";

import { useGameStore } from "@/state/gameStore";
import { useTurnStore } from "@/state/turnStore";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import FactionPopup from "./FactionPopup";

export default function SyrianMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgMarkup, setSvgMarkup] = useState("");
  const [activeProvince, setActiveProvince] = useState<string | null>(null);
  const [selectedAttacker, setSelectedAttacker] = useState<string | null>(null);
  const [canAttack, setCanAttack] = useState(false);

  const provinces = useGameStore((s) => s.provinces);
  const factions = useGameStore((s) => s.factions);

  // store currently selected attacker
  const selectedAttackerRef = useRef<string | null>(null);
  useEffect(() => {
    selectedAttackerRef.current = selectedAttacker;
  }, [selectedAttacker]);

  // 🔥 keep live refs of phase & faction
  const phaseRef = useRef(useTurnStore.getState().phase);
  const factionRef = useRef(useTurnStore.getState().activeFaction);

  useEffect(() => {
    const unsubPhase = useTurnStore.subscribe(
      (s) => (phaseRef.current = s.phase)
    );
    const unsubFaction = useTurnStore.subscribe(
      (s) => (factionRef.current = s.activeFaction)
    );
    return () => {
      unsubPhase();
      unsubFaction();
    };
  }, []);

  // 🎨 color palette
  const enhancedColors: Record<string, string> = {
    regime: "#C41E3A",
    alliance: "#1E3A8A",
    sdf: "#FCD34D",
    isis: "#1F2937",
    rebels: "#16A34A",
    axis: "#F5F5F5",
    neutral: "#9CA3AF",
  };

  const darken = (hex: string, amt = 35) =>
    `rgb(${hex
      .replace("#", "")
      .match(/.{1,2}/g)!
      .map((x) => parseInt(x, 16))
      .map((v) => Math.max(0, v - amt))
      .join(", ")})`;

  const lighten = (hex: string, amt = 40) =>
    `rgb(${hex
      .replace("#", "")
      .match(/.{1,2}/g)!
      .map((x) => parseInt(x, 16))
      .map((v) => Math.min(255, v + amt))
      .join(", ")})`;

  // 📥 load SVG once
  useEffect(() => {
    (async () => {
      const res = await fetch("/board/syria.svg", { cache: "no-cache" });
      if (!res.ok) return console.error("❌ Syria map SVG not found");
      setSvgMarkup(await res.text());
    })();
  }, []);

  // 🗺️ build map once (no phase dependency)
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
      .territory{cursor:pointer;transition:all .3s ease;stroke:#0b0b0e;stroke-width:2.5;stroke-linejoin:round}
      .territory:hover{fill:var(--lighter,#555);stroke-width:3}
      .territory.active{stroke:#fff;stroke-width:3.5;filter:drop-shadow(0 0 10px rgba(255,255,255,.7))}
      .label{pointer-events:none;fill:#fff;font:700 12px 'Segoe UI',sans-serif;text-anchor:middle;dominant-baseline:middle;paint-order:stroke;stroke:rgba(0,0,0,.8);stroke-width:1.2px}
      .army-group text{fill:#fff;font:700 13px 'Segoe UI',sans-serif;text-anchor:middle;dominant-baseline:middle}
      .float-text{font:700 12px 'Segoe UI',sans-serif;fill:#00ff99;pointer-events:none;animation:rise 1.2s ease-out forwards}
      @keyframes rise{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-25px)}}
      .attacker{stroke:#facc15;stroke-width:3.5;filter:drop-shadow(0 0 8px rgba(250,204,21,.8))}
    `;
    svg.prepend(style);

    const bbox = svg.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    while (svg.firstChild) g.appendChild(svg.firstChild);
    svg.appendChild(g);
    g.setAttribute("transform", `translate(${400 - cx}, ${294 - cy})`);

    // draw labels + counters once
    const init = useGameStore.getState().provinces;
    Object.entries(init).forEach(([id, p]) => {
      const path = g.querySelector(
        `#${CSS.escape(id)}`
      ) as SVGPathElement | null;
      if (!path) return;

      path.classList.add("territory");
      const base = enhancedColors[p.owner] ?? "#808080";
      path.setAttribute("fill", base);
      path.style.setProperty("--darker", darken(base));
      path.style.setProperty("--lighter", lighten(base));

      const b = path.getBBox();

      // label
      const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      label.textContent = id.replaceAll("_", " ");
      label.setAttribute("x", `${b.x + b.width / 2}`);
      label.setAttribute("y", `${b.y + b.height / 2 - 8}`);
      label.setAttribute("class", "label");
      svg.appendChild(label);

      // Enhanced counter group (high contrast + readability)
      const grp = document.createElementNS("http://www.w3.org/2000/svg", "g");
      grp.classList.add("army-group");
      grp.dataset.province = id;

      // background halo for contrast
      const bg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      bg.setAttribute("cx", `${b.x + b.width / 2}`);
      bg.setAttribute("cy", `${b.y + b.height / 2 + 18}`);
      bg.setAttribute("r", "15");
      bg.setAttribute("fill", "rgba(0,0,0,0.45)");
      bg.setAttribute("stroke", "rgba(255,255,255,0.15)");
      bg.setAttribute("stroke-width", "1.5");

      // main counter circle
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", `${b.x + b.width / 2}`);
      circle.setAttribute("cy", `${b.y + b.height / 2 + 18}`);
      circle.setAttribute("r", "11");
      circle.setAttribute("fill", base);
      circle.style.filter = "drop-shadow(0 0 4px rgba(0,0,0,0.6))";

      // text label — with stroke for contrast
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.textContent = String(p.armies ?? 0);
      text.setAttribute("x", `${b.x + b.width / 2}`);
      text.setAttribute("y", `${b.y + b.height / 2 + 18}`);
      text.setAttribute("font-weight", "900");
      text.setAttribute("font-size", "13px");
      text.setAttribute("fill", "#ffffff");
      text.setAttribute("stroke", "rgba(0,0,0,0.8)");
      text.setAttribute("stroke-width", "1.2");
      text.setAttribute("paint-order", "stroke fill");
      text.style.filter = "drop-shadow(0 0 4px rgba(0,0,0,0.4))";

      grp.appendChild(bg);
      grp.appendChild(circle);
      grp.appendChild(text);
      svg.appendChild(grp);
    });

    // 🖱️ Click handler (always uses latest refs)
    const onClick = (e: Event) => {
      const phase = phaseRef.current;
      const activeFaction = factionRef.current;
      const target = e.target as Element | null;
      const path = target?.closest(".territory") as SVGPathElement | null;
      if (!path) {
        // Clicked on sea or empty space — deselect attacker
        setSelectedAttacker(null);
        setActiveProvince(null);
        const svgEl = containerRef.current?.querySelector("svg");
        if (svgEl)
          svgEl
            .querySelectorAll(".territory")
            .forEach((el) => el.classList.remove("attacker"));
        toast.dismiss(); // remove any stale toasts
        return;
      }

      const id = path.id;
      const state = useGameStore.getState();
      const province = state.provinces[id];
      if (!province) return;

      // ---- DEPLOY ----
      if (phase === "deploy") {
        if (province.owner !== activeFaction) return;
        const turn = useTurnStore.getState();
        const available = turn.getCurrentTroops();
        if (available <= 0) {
          return;
        }

        useGameStore.setState((s) => ({
          provinces: {
            ...s.provinces,
            [id]: { ...s.provinces[id], armies: s.provinces[id].armies + 1 },
          },
        }));
        turn.useTroop(1);

        const b = (path as SVGGraphicsElement).getBBox();
        const ft = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        ft.textContent = "+1 🪖";
        ft.setAttribute("x", `${b.x + b.width / 2}`);
        ft.setAttribute("y", `${b.y + b.height / 2}`);
        ft.setAttribute("class", "float-text");
        svg.appendChild(ft);
        setTimeout(() => ft.remove(), 1200);
        return;
      }

      // ---- ATTACK ----
      if (phase === "attack") {
        if (province.owner === activeFaction) {
          setSelectedAttacker(id);
          setActiveProvince(null);
          setCanAttack(false);

          const svgEl = containerRef.current?.querySelector("svg");
          if (svgEl) {
            svgEl
              .querySelectorAll(".territory")
              .forEach((el) => el.classList.remove("attacker"));
            svgEl
              .querySelector(`#${CSS.escape(id)}`)
              ?.classList.add("attacker");
          }
          toast(`Attacker selected: ${id}`, { icon: "⚔️" });
          return;
        }

        const adjacency: Record<string, string[]> = {
          Damascus: ["Rural_Damascus"],
          Rural_Damascus: [
            "Damascus",
            "Homs",
            "Daraa",
            "Quneitra",
            "As-Suwayda",
          ],
          Daraa: ["Rural_Damascus", "Quneitra", "As-Suwayda"],
          Quneitra: ["Rural_Damascus", "Daraa"],
          "As-Suwayda": ["Rural_Damascus", "Daraa"],
          Homs: [
            "Rural_Damascus",
            "Hama",
            "Tartus",
            "Ar-Raqqah",
            "Deir_ez-zor",
          ],
          Hama: ["Homs", "Aleppo", "Idlib", "Latakia", "Tartus", "Ar-Raqqah"],
          Aleppo: ["Idlib", "Hama", "Ar-Raqqah"],
          Idlib: ["Hama", "Aleppo", "Latakia"],
          Latakia: ["Idlib", "Hama", "Tartus"],
          Tartus: ["Latakia", "Homs", "Hama"],
          "Ar-Raqqah": ["Aleppo", "Deir_ez-zor", "Al-Hasakah", "Homs", "Hama"],
          "Deir_ez-zor": ["Ar-Raqqah", "Al-Hasakah", "Homs"],
          "Al-Hasakah": ["Ar-Raqqah", "Deir_ez-zor"],
        };

        const attacker = selectedAttackerRef.current;
        if (attacker) {
          const valid =
            (adjacency[attacker] || []).includes(id) ||
            (adjacency[id] || []).includes(attacker);
          setCanAttack(valid);
          setActiveProvince(id);
        } else {
          setCanAttack(false);
          setActiveProvince(id);
        }
        return;
      }

      // ---- OTHER ----
      setActiveProvince(id);
    };

    svg.addEventListener("click", onClick, { passive: true });
    return () => svg.removeEventListener("click", onClick);

    // ✅ only rebuild when SVG markup changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgMarkup]);

  // 🎨 keep troop counters & province colors synced
  useEffect(() => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;
    Object.entries(provinces).forEach(([id, p]) => {
      const path = svg.querySelector(
        `#${CSS.escape(id)}`
      ) as SVGPathElement | null;
      const grp = svg.querySelector(
        `.army-group[data-province='${CSS.escape(id)}']`
      );
      if (!path || !grp) return;

      const col = enhancedColors[p.owner] ?? "#808080";
      path.setAttribute("fill", col);
      path.style.setProperty("--darker", darken(col));
      path.style.setProperty("--lighter", lighten(col));

      // ✅ update both circle and text color dynamically
      const circles = grp.querySelectorAll("circle");
      if (circles[1]) circles[1].setAttribute("fill", col); // inner colored circle

      const text = grp.querySelector("text");
      if (text) text.textContent = String(p.armies ?? 0);
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
        selectedAttacker={selectedAttacker}
        canAttack={canAttack}
      />
    </div>
  );
}
