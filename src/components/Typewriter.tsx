"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const GREETINGS = [
  "Hello",
  "नमस्ते",
  "Hola",
  "Bonjour",
  "こんにちは",
  "Ciao",
  "안녕하세요",
  "Hallo",
  "Olá",
  "你好",
];

const TYPE_MS = 110;
const ERASE_MS = 55;
const HOLD_MS = 1800;
const GAP_MS = 400;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

export default function Typewriter() {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [erasing, setErasing] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const word = GREETINGS[wordIndex];
    const delay = erasing
      ? text === ""
        ? GAP_MS
        : ERASE_MS
      : text === word
        ? HOLD_MS
        : TYPE_MS;

    const timer = setTimeout(() => {
      if (erasing) {
        if (text === "") {
          setErasing(false);
          setWordIndex((wordIndex + 1) % GREETINGS.length);
        } else {
          setText(text.slice(0, -1));
        }
      } else {
        if (text === word) {
          setErasing(true);
        } else {
          setText(word.slice(0, text.length + 1));
        }
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [text, erasing, wordIndex, reduced]);

  return (
    <span aria-label="Hello">
      <span aria-hidden className="text-gradient">
        {reduced ? GREETINGS[0] : text}
      </span>
      <span aria-hidden className="tw-caret" />
    </span>
  );
}
