"use client";

import { useEffect, useRef } from "react";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import { education, experience } from "@/data/resume";

// e.g. "Saval AI (by Xansr Technologies)" -> "saval"
const commitScope = (company: string) =>
  company.split(/[\s(]/)[0].toLowerCase();

// deterministic fake short-hash so entries feel like real commits
const commitHash = (seed: string) => {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
};

export default function ExperienceSection() {
  const listRef = useRef<HTMLOListElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  // Fill the branch line to the scroll position and mark the commit nearest
  // the reading line (40% of viewport height) as active.
  useEffect(() => {
    const list = listRef.current;
    const bar = progressRef.current;
    if (!list || !bar) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = list.getBoundingClientRect();
      const anchor = window.innerHeight * 0.4;
      const fill = Math.min(Math.max(anchor - rect.top, 0), rect.height);
      bar.style.height = `${fill.toFixed(1)}px`;

      const entries = list.querySelectorAll<HTMLElement>("[data-commit]");
      let active: HTMLElement | null = null;
      for (const el of entries) {
        if (el.getBoundingClientRect().top <= anchor) active = el;
      }
      for (const el of entries) {
        el.classList.toggle("is-active", el === active);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <Section id="experience" eyebrow="01 · experience" title="git log --career">
      <ol
        ref={listRef}
        className="relative ml-1.5 space-y-12 border-l border-edge pl-8"
      >
        <span ref={progressRef} aria-hidden className="timeline-progress" />
        {experience.map((job, i) => {
          const isHead = i === 0;
          return (
            <Reveal key={job.company} delay={i * 80}>
              <li data-commit className="commit-entry relative">
                {/* commit dot on the branch line */}
                <span
                  aria-hidden
                  className="absolute top-1 -left-[39.5px] flex h-3.5 w-3.5 items-center justify-center"
                >
                  {isHead && (
                    <span className="absolute h-full w-full animate-ping rounded-full bg-accent opacity-40 motion-reduce:animate-none" />
                  )}
                  <span
                    className={`commit-dot h-3.5 w-3.5 rounded-full ${
                      isHead
                        ? "bg-accent"
                        : "border-2 border-muted bg-background"
                    }`}
                  />
                </span>

                {isHead && (
                  <p className="mb-1 font-mono text-xs text-accent">
                    HEAD → main
                  </p>
                )}
                <p className="font-mono text-sm leading-relaxed">
                  <span className="text-accent">
                    feat({commitScope(job.company)}):
                  </span>{" "}
                  <span className="commit-title font-semibold text-foreground">
                    {job.role}
                  </span>
                </p>
                <p className="mt-1 font-mono text-xs text-muted">
                  {commitHash(job.company + job.period)} · {job.period} ·{" "}
                  {job.mode} · {job.company}
                </p>
                <p className="commit-summary mt-3 max-w-2xl leading-relaxed text-muted">
                  {job.summary}
                </p>

                <details open className="group mt-3">
                  <summary className="w-fit cursor-pointer list-none font-mono text-xs text-accent transition-opacity hover:opacity-80 [&::-webkit-details-marker]:hidden">
                    <span
                      aria-hidden
                      className="mr-1 inline-block transition-transform group-open:rotate-90"
                    >
                      ▸
                    </span>
                    git show · {job.highlights.length} changes
                  </summary>
                  <ul className="mt-4 space-y-2.5">
                    {job.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex max-w-2xl gap-3 text-sm text-muted"
                      >
                        <span aria-hidden className="mt-0.5 text-accent">
                          +
                        </span>
                        <span className="commit-highlight leading-relaxed">
                          {highlight}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-edge px-3 py-1 font-mono text-xs text-muted"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </details>
              </li>
            </Reveal>
          );
        })}

        {/* education as the initial release tag */}
        <Reveal delay={experience.length * 80}>
          <li data-commit className="commit-entry relative">
            <span
              aria-hidden
              className="absolute top-1 -left-[39.5px] h-3.5 w-3.5 rounded-sm border-2 border-accent-2 bg-background"
            />
            <p className="font-mono text-sm leading-relaxed">
              <span className="text-accent-2">tag: v1.0</span>{" "}
              <span className="font-semibold text-foreground">
                {education.degree}
              </span>
            </p>
            <p className="mt-1 font-mono text-xs text-muted">
              {education.period} · {education.score} · {education.school}
            </p>
          </li>
        </Reveal>
      </ol>
    </Section>
  );
}
