"use client";

import { useEffect, useRef } from "react";

export default function BackgroundFX() {
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = spotRef.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let active = false;

    const tick = () => {
      x += (targetX - x) * 0.14;
      y += (targetY - y) * 0.14;
      el.style.setProperty("--spot-x", `${x.toFixed(1)}px`);
      el.style.setProperty("--spot-y", `${y.toFixed(1)}px`);
      const settled =
        Math.abs(targetX - x) < 0.5 && Math.abs(targetY - y) < 0.5;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!active) {
        active = true;
        x = targetX;
        y = targetY;
        el.style.opacity = "1";
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="fx-layer">
      <div className="fx-aurora-mask">
        <div className="fx-aurora fx-aurora--a" />
        <div className="fx-aurora fx-aurora--b" />
        <div className="fx-aurora fx-aurora--c" />
      </div>
      <div className="fx-grid" />
      <div ref={spotRef} className="fx-spot" />
      <div className="fx-grain" />
    </div>
  );
}
