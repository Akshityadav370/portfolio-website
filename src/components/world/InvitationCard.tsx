"use client";

import { useEffect, useRef } from "react";

export default function InvitationCard() {
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let firstVisit = true;
    try {
      firstVisit = localStorage.getItem("portfolio-invitation-seen") !== "1";
      localStorage.setItem("portfolio-invitation-seen", "1");
    } catch {
      // The invitation still works when browser storage is unavailable.
    }
    if (firstVisit) card.current?.classList.add("world-invite-arriving");
  }, []);
  return (
    <div className="world-invite-stage">
      <div
        ref={card}
        className="world-invite-card"
        role="img"
        aria-label="Kraft invitation card with circle, triangle, and square"
      >
        <div className="world-invite-symbols" aria-hidden="true">
          <span>○</span>
          <span>△</span>
          <span>□</span>
        </div>
        <small>AN INVITATION TO PLAY.</small>
      </div>
    </div>
  );
}
