"use client";

import { useEffect, useState } from "react";

type Stats = { loadMs: number; jsKb: number };

export default function PerfHud() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const measure = () => {
      const [nav] = performance.getEntriesByType(
        "navigation",
      ) as PerformanceNavigationTiming[];
      if (!nav || nav.loadEventEnd === 0) return false;

      const jsBytes = performance
        .getEntriesByType("resource")
        .filter((r) => r.name.endsWith(".js") || r.name.includes(".js?"))
        .reduce(
          (sum, r) => sum + (r as PerformanceResourceTiming).transferSize,
          0,
        );

      setStats({
        loadMs: Math.round(nav.loadEventEnd - nav.startTime),
        jsKb: Math.round(jsBytes / 1024),
      });
      return true;
    };

    if (measure()) return;
    const onLoad = () => setTimeout(measure, 0);
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  if (!stats) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 hidden items-center gap-2 rounded-full border border-edge bg-surface/80 px-4 py-2 font-mono text-xs text-muted backdrop-blur-md sm:flex"
      title="Measured live on your device via the Performance API"
    >
      <span className="text-accent">⚡</span>
      <span>
        loaded in{" "}
        <span className="text-foreground">
          {stats.loadMs < 1000
            ? `${stats.loadMs}ms`
            : `${(stats.loadMs / 1000).toFixed(1)}s`}
        </span>
        {stats.jsKb > 0 && (
          <>
            {" · "}
            <span className="text-foreground">{stats.jsKb}kb</span> JS
          </>
        )}
      </span>
    </div>
  );
}
