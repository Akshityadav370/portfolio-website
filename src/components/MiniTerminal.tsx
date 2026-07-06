"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/resume";

type Line = { kind: "cmd" | "out"; text: string };

const LINES: Line[] = [
  { kind: "cmd", text: "whoami" },
  { kind: "out", text: "akshit — full-stack engineer" },
  { kind: "cmd", text: "contact --open" },
  { kind: "out", text: `→ email   ${profile.email}` },
  { kind: "out", text: "→ github  @Akshityadav370" },
  { kind: "out", text: "→ status  open to full-stack roles" },
];

// Decorative terminal that types itself when scrolled into view and opens
// the real interactive Terminal on click.
export default function MiniTerminal() {
  const [progress, setProgress] = useState<{ line: number; chars: number }>({
    line: 0,
    chars: 0,
  });
  const [started, setStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await sleep(0);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        if (!cancelled) setProgress({ line: LINES.length, chars: 0 });
        return;
      }
      for (let line = 0; line < LINES.length && !cancelled; line++) {
        const current = LINES[line];
        if (current.kind === "cmd") {
          for (let c = 1; c <= current.text.length && !cancelled; c++) {
            setProgress({ line, chars: c });
            await sleep(55);
          }
          await sleep(300);
        } else {
          setProgress({ line, chars: current.text.length });
          await sleep(180);
        }
      }
      if (!cancelled) setProgress({ line: LINES.length, chars: 0 });
    })();
    return () => {
      cancelled = true;
    };
  }, [started]);

  const open = () => window.dispatchEvent(new Event("terminal:open"));

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      title="Open the interactive terminal"
      className="glass-card group w-full cursor-pointer overflow-hidden rounded-xl border border-edge text-left transition-colors hover:border-accent/40"
    >
      <div className="flex items-center gap-2 border-b border-edge px-4 py-2.5">
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <p className="flex-1 text-center font-mono text-xs text-muted">
          ~/contact — zsh
        </p>
      </div>
      <div className="min-h-44 px-4 py-3 font-mono text-xs leading-6 sm:text-sm">
        {LINES.slice(0, progress.line + 1).map((line, i) => {
          const done = i < progress.line;
          const text = done ? line.text : line.text.slice(0, progress.chars);
          if (!done && i === progress.line && progress.chars === 0) return null;
          return line.kind === "cmd" ? (
            <p key={i} className="text-foreground">
              <span className="text-accent">❯</span> {text}
              {!done && <span aria-hidden className="tw-caret ml-0.5" />}
            </p>
          ) : (
            <p key={i} className="text-muted">
              {text}
            </p>
          );
        })}
        {progress.line >= LINES.length && (
          <p className="text-foreground">
            <span className="text-accent">❯</span>{" "}
            <span aria-hidden className="tw-caret" />
          </p>
        )}
      </div>
      <div className="border-t border-edge px-4 py-2 font-mono text-xs text-muted transition-colors group-hover:text-accent">
        ▸ click to launch the interactive terminal
      </div>
    </div>
  );
}
