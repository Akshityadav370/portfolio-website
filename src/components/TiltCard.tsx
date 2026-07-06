"use client";

import { useRef } from "react";

const MAX_TILT_DEG = 6;

// Card that tilts toward the cursor with a moving glare highlight
// (see .tilt-card in globals.css). Hover-only, so touch devices skip it;
// disabled for reduced-motion users.
export default function TiltCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const reduced = useRef<boolean | null>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduced.current === null) {
      reduced.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    }
    if (reduced.current) return;

    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--rx", `${(-py * MAX_TILT_DEG).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * MAX_TILT_DEG).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const onMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <article
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`tilt-card ${className}`}
    >
      {children}
    </article>
  );
}
