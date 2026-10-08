"use client";

import { useEffect, useRef, useState } from "react";

const QUOTES = [
  {
    lines: [
      "Life is not a game",
      "that you finish & win;",
      "Life is a game that you",
    ],
    ending: "play & enjoy",
  },
  {
    lines: ["Everyone we meet is fighting", "a battle we know nothing about,"],
    ending: "Be kind; Always",
  },
];
type OpeningQuote = (typeof QUOTES)[number];
const CHARACTER_DELAY_MS = 55;

export default function OpeningScene({
  onComplete,
}: {
  onComplete: (skipped: boolean) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const selectedQuote = useRef<OpeningQuote | null>(null);
  const [quote, setQuote] = useState<OpeningQuote | null>(null);
  const [letters, setLetters] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    selectedQuote.current ??= QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const selected = selectedQuote.current;
    const element = dialog.current;
    element?.showModal();
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Let each thought settle, with an extra beat before the final line.
    const revealTimes: number[] = [];
    let time = 550;
    [...selected.lines, selected.ending].forEach((line, index) => {
      if (index) time += index === selected.lines.length ? 650 : 280;
      for (const character of line) {
        time += CHARACTER_DELAY_MS;
        if (character === ";" || character === ",") time += 160;
        revealTimes.push(time);
      }
    });
    const typingDuration = reduced ? 0 : time;
    const holdDuration = reduced ? 3000 : 1800;
    const fadeDuration = reduced ? 0 : 900;
    let frame = 0,
      elapsed = 0;
    let previous = performance.now();
    function tick(now: number) {
      setQuote(selected);
      if (!document.hidden) elapsed += Math.min(now - previous, 100);
      previous = now;
      setLetters(
        reduced
          ? revealTimes.length
          : revealTimes.filter((at) => at <= elapsed).length,
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

  const lines = quote ? [...quote.lines, quote.ending] : [];
  const fullText = lines.join(" ");
  function renderLine(line: string, lineIndex: number) {
    let offset = lines.slice(0, lineIndex).join("").length;
    return line.split(/(\s+)/).map((word, wordIndex) => (
      <span
        className={
          "world-opening-word" +
          (word === "Always" ? " world-opening-accent" : "")
        }
        key={wordIndex}
      >
        {Array.from(word).map((character, index) => {
          const visible = offset++ < letters;
          return (
            <span key={index} className={visible ? "is-revealed" : ""}>
              {character}
            </span>
          );
        })}
      </span>
    ));
  }
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
      <div className="world-opening-atmosphere" aria-hidden="true" />
      <header className="world-opening-masthead" aria-hidden="true">
        <span>AKSHIT YADAV</span>
        <span>AN INTERACTIVE PORTFOLIO</span>
      </header>
      <div className="world-opening-content">
        <p className="world-opening-label">
          <span /> PROLOGUE <span className="world-opening-symbols">○ △ □</span>
        </p>
        <h1 aria-label={fullText || "An opening thought"}>
          {lines.map((line, index) => (
            <span
              key={index}
              aria-hidden="true"
              className={
                index === lines.length - 1
                  ? "world-opening-line world-opening-ending"
                  : "world-opening-line"
              }
            >
              {renderLine(line, index)}
            </span>
          ))}
        </h1>
        <div className="world-opening-rule" aria-hidden="true">
          <span
            style={{
              transform:
                "scaleX(" +
                (fullText ? letters / lines.join("").length : 0) +
                ")",
            }}
          />
        </div>
        <p className="world-opening-credit">
          EVERY STORY BEGINS WITH A LITTLE CURIOSITY.
        </p>
      </div>
      <div className="world-opening-actions">
        <a href="/portfolio">Just the portfolio ↗</a>
        <button autoFocus onClick={() => onComplete(true)}>
          Skip intro <span aria-hidden="true">→</span>
        </button>
      </div>
    </dialog>
  );
}
