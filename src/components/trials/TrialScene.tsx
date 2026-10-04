"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { TrialState } from "@/lib/trials-engine";

export type SetKind =
  "compound" | "stairs" | "red-light" | "mingle" | "jump-rope";

export default function TrialScene({
  kind = "compound",
  stateRef,
}: {
  kind?: SetKind;
  stateRef?: RefObject<TrialState>;
}) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ rotate: () => void } | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    let started = false;
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        try {
          const { createTrialScene } = await import("@/lib/trials-scene");
          if (cancelled) return;
          const scene = createTrialScene(
            element,
            kind,
            () => stateRef?.current,
            () => setFailed(true),
          );
          api.current = scene;
          cleanup = scene.dispose;
          setReady(true);
        } catch {
          if (!cancelled) setFailed(true);
        }
      },
      { rootMargin: "100px" },
    );
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
      cleanup?.();
      api.current = null;
    };
  }, [kind, stateRef]);
  return (
    <div className={`trial-scene set-${kind}`}>
      <div className="trial-scene-host" ref={host} aria-hidden="true" />
      {(!ready || failed) && (
        <div className="trial-scene-fallback" aria-hidden="true">
          <div className="fallback-stair step-one" />
          <div className="fallback-stair step-two" />
          <div className="fallback-stair step-three" />
          <span>○ △ □</span>
        </div>
      )}
      {!stateRef && ready && !failed && (
        <button
          className="rotate-set"
          onClick={() => api.current?.rotate()}
          aria-label="Rotate the miniature set"
        >
          ↻ <span>ROTATE THE SET</span>
        </button>
      )}
    </div>
  );
}
