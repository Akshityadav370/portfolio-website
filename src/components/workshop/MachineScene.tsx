"use client";

import { useEffect, useRef, useState } from "react";

export type SceneKind =
  "assembly" | "builder" | "delivery" | "canvas" | "browser" | "story";

export default function MachineScene({
  kind = "assembly",
  compact = false,
  assembled = false,
}: {
  kind?: SceneKind;
  compact?: boolean;
  assembled?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{
    setExploded: (value: boolean) => void;
    setPaused: (value: boolean) => void;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [exploded, setExploded] = useState(!assembled);
  const [paused, setPaused] = useState(false);

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
          const { createWorkshopScene } = await import("@/lib/workshop-scene");
          if (cancelled) return;
          const scene = createWorkshopScene(element, kind, () =>
            setFailed(true),
          );
          cleanup = scene.dispose;
          api.current = scene;
          scene.setExploded(!assembled);
          setReady(true);
        } catch {
          if (!cancelled) setFailed(true);
        }
      },
      { rootMargin: "150px" },
    );
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
      cleanup?.();
      api.current = null;
    };
  }, [kind, assembled]);

  return (
    <div className={`machine-scene ${compact ? "scene-compact" : ""}`}>
      <div className="scene-cross cross-top" aria-hidden="true">
        +
      </div>
      <div className="scene-cross cross-bottom" aria-hidden="true">
        +
      </div>
      <div className="scene-canvas" ref={host} aria-hidden="true" />
      {(!ready || failed) && (
        <div className="scene-fallback" aria-hidden="true">
          <div className="fallback-layer" />
          <div className="fallback-layer" />
          <div className="fallback-layer">
            <span>A</span>
          </div>
        </div>
      )}
      {!compact && (
        <>
          <span className="scene-annotation annotation-top">
            <i />
            01 / INTERFACE
          </span>
          <span className="scene-annotation annotation-bottom">
            <i />
            04 / INFRASTRUCTURE
          </span>
          <span className="scene-coordinate">
            SYS. A—01
            <br />
            17.3850° N / 78.4867° E
          </span>
        </>
      )}
      <div className="scene-controls">
        <span className="scene-hint">
          {failed ? "ASSEMBLY STUDY" : "INTERACTIVE STUDY"}
        </span>
        {ready && !failed && (
          <div>
            {kind === "assembly" && (
              <button
                type="button"
                aria-pressed={exploded}
                onClick={() => {
                  const next = !exploded;
                  setExploded(next);
                  api.current?.setExploded(next);
                }}
              >
                {exploded ? "Assemble ↙" : "Explode ↗"}
              </button>
            )}
            <button
              type="button"
              aria-pressed={paused}
              onClick={() => {
                const next = !paused;
                setPaused(next);
                api.current?.setPaused(next);
              }}
            >
              {paused ? "Play motion ▷" : "Pause motion Ⅱ"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
