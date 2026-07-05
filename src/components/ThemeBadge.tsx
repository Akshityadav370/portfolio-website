"use client";

import { useSyncExternalStore } from "react";
import { shuffleTheme } from "@/lib/theme";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

export default function ThemeBadge() {
  const theme = useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.theme ?? "deep-space",
    () => null,
  );

  if (!theme) return null;

  return (
    <button
      type="button"
      onClick={shuffleTheme}
      title="A new theme loads on every visit — click to try the next one"
      className="fixed bottom-4 left-4 z-50 hidden items-center gap-2 rounded-full border border-edge bg-surface/80 px-4 py-2 font-mono text-xs text-muted backdrop-blur-md transition-colors hover:border-accent/40 hover:text-accent sm:flex"
    >
      <span aria-hidden className="text-accent">
        ◐
      </span>
      {theme}
    </button>
  );
}
