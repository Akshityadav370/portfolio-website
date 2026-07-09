"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import SkillIcon from "@/components/SkillIcon";
import { projects, type Project } from "@/data/resume";

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function LiveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

// "Choose Your Own Adventure" -> "choose-your-own-adventure.md"
const fileName = (project: Project) =>
  `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;

export default function ProjectsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = projects[activeIndex];

  return (
    <Section id="projects" eyebrow="02 · projects" title="ls ~/projects">
      <Reveal>
        <div className="glass-card overflow-hidden rounded-2xl border border-edge">
          {/* editor title bar */}
          <div className="flex items-center gap-2 border-b border-edge px-4 py-2.5">
            <span aria-hidden className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span aria-hidden className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span aria-hidden className="h-3 w-3 rounded-full bg-[#28c840]" />
            <p className="flex-1 text-center font-mono text-xs text-muted">
              ~/akshit/projects — code
            </p>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* explorer sidebar (horizontal file strip on mobile) */}
            <aside className="border-b border-edge md:w-60 md:shrink-0 md:border-r md:border-b-0">
              <p className="hidden px-4 pt-3 pb-1 font-mono text-[10px] tracking-widest text-muted uppercase md:block">
                explorer
              </p>
              <p className="hidden px-4 py-1 font-mono text-xs text-foreground md:block">
                ▾ projects/
              </p>
              <div
                role="tablist"
                aria-label="Project files"
                className="flex overflow-x-auto md:block md:pb-3"
              >
                {projects.map((project, i) => (
                  <button
                    key={project.name}
                    type="button"
                    role="tab"
                    aria-selected={i === activeIndex}
                    onClick={() => setActiveIndex(i)}
                    className={`flex shrink-0 items-center gap-2 px-4 py-2 text-left font-mono text-xs transition-colors md:w-full md:truncate md:py-1.5 md:pl-7 ${
                      i === activeIndex
                        ? "bg-accent/10 text-accent"
                        : project.featured
                          ? "text-foreground hover:bg-accent/5"
                          : "text-muted hover:bg-accent/5 hover:text-foreground"
                    }`}
                  >
                    <SkillIcon name={project.stack[0]} size={12} />
                    {fileName(project)}
                    {project.featured && (
                      <span
                        aria-hidden
                        title="Featured project"
                        className="animate-pulse text-accent motion-reduce:animate-none"
                      >
                        ★
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </aside>

            {/* editor pane */}
            <div className="min-w-0 flex-1">
              {/* open-file tab */}
              <div className="flex items-center border-b border-edge">
                <p className="flex items-center gap-2 border-r border-edge border-b-2 border-b-accent px-4 py-2 font-mono text-xs text-foreground">
                  <SkillIcon name={active.stack[0]} size={12} />
                  {fileName(active)}
                  {active.featured && (
                    <span aria-hidden className="text-accent">
                      ★
                    </span>
                  )}
                  <span aria-hidden className="text-muted">
                    ×
                  </span>
                </p>
              </div>

              {/* rendered "markdown" */}
              <div className="min-h-[26rem] px-5 py-5 sm:px-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="flex flex-wrap items-center gap-3 text-2xl font-semibold">
                      <span>
                        <span aria-hidden className="mr-2 text-muted">
                          #
                        </span>
                        {active.name}
                      </span>
                      {active.featured && (
                        <span className="glass-chip rounded-full border border-accent/40 px-2.5 py-1 font-mono text-[10px] font-normal text-accent">
                          ★ featured
                        </span>
                      )}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-accent">
                      <span aria-hidden className="mr-2 text-muted">
                        &gt;
                      </span>
                      {active.tag}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {active.github && (
                      <a
                        href={active.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${active.name} source on GitHub`}
                        title="View source on GitHub"
                        className="glass-chip flex h-9 w-9 items-center justify-center rounded-full border border-edge text-muted transition-colors hover:border-accent/50 hover:text-accent"
                      >
                        <GitHubIcon />
                      </a>
                    )}
                    {active.live && (
                      <a
                        href={active.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${active.name} live demo`}
                        title="Open live demo"
                        className="glass-chip flex h-9 w-9 items-center justify-center rounded-full border border-edge text-muted transition-colors hover:border-accent/50 hover:text-accent"
                      >
                        <LiveIcon />
                      </a>
                    )}
                  </div>
                </div>

                <p className="mt-4 max-w-2xl leading-relaxed text-muted">
                  {active.description}
                </p>

                <p className="mt-6 font-mono text-sm text-foreground">
                  <span aria-hidden className="mr-2 text-muted">
                    ##
                  </span>
                  highlights
                </p>
                <ul className="mt-3 space-y-2.5">
                  {active.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex max-w-2xl gap-3 text-sm text-muted"
                    >
                      <span aria-hidden className="mt-0.5 text-accent">
                        -
                      </span>
                      <span className="leading-relaxed">{highlight}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-6 font-mono text-sm text-foreground">
                  <span aria-hidden className="mr-2 text-muted">
                    ##
                  </span>
                  stack
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {active.stack.map((tech) => (
                    <span
                      key={tech}
                      className="glass-chip inline-flex items-center gap-1.5 rounded-full border border-edge px-3 py-1 font-mono text-xs text-muted"
                    >
                      <SkillIcon name={tech} size={12} />
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* status bar */}
              <div className="flex items-center justify-between border-t border-edge px-5 py-2 font-mono text-[11px] text-muted sm:px-8">
                <p>
                  {activeIndex + 1} of {projects.length} projects ·{" "}
                  {active.stack.length} deps
                </p>
                <p>markdown · utf-8 · lf</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
