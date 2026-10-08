"use client";

export default function InvitationCard({
  animate = true,
}: {
  animate?: boolean;
}) {
  return (
    <div className="world-invite-stage">
      <div
        className={
          "world-invite-card" + (animate ? " world-invite-arriving" : "")
        }
        role="img"
        aria-label="Kraft invitation card with circle, triangle, and square"
      >
        <div className="world-invite-symbols" aria-hidden="true">
          <span>○</span>
          <span>△</span>
          <span>□</span>
        </div>
        <small>CURIOSITY IS YOUR ENTRY FEE.</small>
      </div>
    </div>
  );
}
