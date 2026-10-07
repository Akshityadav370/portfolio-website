"use client";

import { useEffect, useRef, useState } from "react";

const QUOTE =
  "Dream big. Start small.\nBreak a few things.\nBuild something worth coming back to.";

const CHARACTER_DELAY_MS = 55;

export default function OpeningScene({
  onComplete,
}: {
  onComplete: (skipped: boolean) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [letters, setLetters] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const typingDuration = reduced ? 0 : QUOTE.length * CHARACTER_DELAY_MS;
    const holdDuration = reduced ? 2200 : 1200;
    const fadeDuration = reduced ? 0 : 650;
    let frame = 0;
    let elapsed = 0;
    let previous = performance.now();
    function tick(now: number) {
      // Don't consume the opening while the visitor is in another tab.
      if (!document.hidden) elapsed += Math.min(now - previous, 100);
      previous = now;
      setLetters(
        reduced
          ? QUOTE.length
          : Math.min(QUOTE.length, Math.floor(elapsed / CHARACTER_DELAY_MS)),
      );
      setLeaving(elapsed >= typingDuration + holdDuration);
      if (elapsed >= typingDuration + holdDuration + fadeDuration) {
        onComplete(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      element?.close();
    };
  }, [onComplete]);
  return (
    <dialog
      ref={dialog}
      className={"world-opening" + (leaving ? " world-opening-leaving" : "")}
      aria-label="An opening thought"
      onCancel={(event) => {
        event.preventDefault();
        onComplete(true);
      }}
    >
      <div className="world-opening-content">
        <p className="world-opening-label">BEFORE WE BEGIN</p>
        <h1 aria-label={QUOTE}>
          <span className="world-opening-spacer" aria-hidden="true">
            {QUOTE}
          </span>
          <span className="world-opening-type" aria-hidden="true">
            {QUOTE.slice(0, letters)}
            <span className="world-opening-cursor">▍</span>
          </span>
        </h1>
        <p className="world-opening-credit">
          A LITTLE CURIOSITY GOES A LONG WAY.
        </p>
      </div>
      <div className="world-opening-actions">
        <a href="/portfolio">Just the portfolio ↗</a>
        <button autoFocus onClick={() => onComplete(true)}>
          Skip intro →
        </button>
      </div>
    </dialog>
  );
}
