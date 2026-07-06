"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import { achievements, experience, projects, skillGroups } from "@/data/resume";

// "Next.js 15" -> "next.js", "React 19" -> "react"
const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s+\d+(\.\d+)*$/, "")
    .trim();

// umbrella skills inherit evidence from the tech built on top of them
const ALIASES: Record<string, string[]> = {
  javascript: ["react", "node.js", "next.js", "react native", "express"],
  python: ["fastapi"],
  sql: ["postgresql", "mysql"],
  kubernetes: ["gke"],
  "google cloud": ["gke"],
};

const keysFor = (skill: string) => {
  const key = normalize(skill);
  return [key, ...(ALIASES[key] ?? [])];
};

// skill -> places it was actually used, derived from experience + project stacks
const evidenceFor = (skill: string): string[] => {
  const keys = keysFor(skill);
  const places: string[] = [];
  for (const job of experience) {
    if (job.stack.some((t) => keys.includes(normalize(t))))
      places.push(job.company);
  }
  for (const project of projects) {
    if (project.stack.some((t) => keys.includes(normalize(t))))
      places.push(project.name);
  }
  return places;
};

// version-style value: proven at work > shipped in a project > familiar
const versionFor = (skill: string): string => {
  const keys = keysFor(skill);
  if (experience.some((j) => j.stack.some((t) => keys.includes(normalize(t)))))
    return "^prod";
  if (projects.some((p) => p.stack.some((t) => keys.includes(normalize(t)))))
    return "^shipped";
  return "^familiar";
};

const jsonKey = (title: string) => title.toLowerCase().replace(/[^a-z]+/g, "-");

// "Saval AI (by Xansr Technologies)" -> "Saval AI"
const shortName = (place: string) => place.split(" (")[0];

const ghostComment = (skill: string): string => {
  const places = evidenceFor(skill).map(shortName);
  if (places.length === 0) return "// personal projects & coursework";
  const shown = places.slice(0, 2).join(" · ");
  const rest = places.length - 2;
  return `// ${shown}${rest > 0 ? ` +${rest}` : ""}`;
};

export default function SkillsSection() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <Section id="skills" eyebrow="03 · skills" title="skills.json">
      <Reveal>
        <div className="glass-card overflow-hidden rounded-2xl border border-edge">
          {/* editor title bar */}
          <div className="flex items-center gap-2 border-b border-edge px-4 py-2.5">
            <span aria-hidden className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span aria-hidden className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span aria-hidden className="h-3 w-3 rounded-full bg-[#28c840]" />
            <p className="flex-1 text-center font-mono text-xs text-muted">
              ~/akshit/skills.json
            </p>
          </div>

          {/* file body */}
          <div className="px-5 py-4 font-mono text-sm leading-7 sm:px-8 sm:py-6">
            <p className="text-muted">{"{"}</p>
            <div className="sm:columns-2 sm:gap-10">
              {skillGroups.map((group) => (
                <div key={group.title} className="break-inside-avoid pl-4">
                  <p>
                    <span className="text-accent-2">
                      &quot;{jsonKey(group.title)}&quot;
                    </span>
                    <span className="text-muted">: {"{"}</span>
                  </p>
                  {group.skills.map((skill) => (
                    <p
                      key={skill}
                      onMouseEnter={() => setHovered(skill)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setHovered(skill)}
                      className={`-mx-2 cursor-default rounded px-2 pl-6 transition-colors ${
                        hovered === skill
                          ? "bg-accent/10"
                          : "hover:bg-accent/5"
                      }`}
                    >
                      <span className="text-foreground">
                        &quot;{normalize(skill)}&quot;
                      </span>
                      <span className="text-muted">: </span>
                      <span className="text-accent">
                        &quot;{versionFor(skill)}&quot;
                      </span>
                      <span className="text-muted">,</span>
                      {hovered === skill && (
                        <span className="ghost-comment text-muted">
                          {" "}
                          {ghostComment(skill)}
                        </span>
                      )}
                    </p>
                  ))}
                  <p className="text-muted">{"},"}</p>
                </div>
              ))}
            </div>
            <p className="text-muted">{"}"}</p>
          </div>

          {/* editor status bar */}
          <div className="border-t border-edge px-5 py-2.5 font-mono text-xs sm:px-8">
            <p className="text-muted">
              hover a dependency to see where it&apos;s used
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-6">
        <div className="glass-card rounded-2xl border border-edge p-6">
          <h3 className="font-mono text-sm text-accent">Beyond the job</h3>
          <ul className="mt-4 space-y-2">
            {achievements.map((achievement) => (
              <li key={achievement.text} className="flex gap-3 text-muted">
                <span aria-hidden className="mt-1 text-accent">
                  ▸
                </span>
                <span className="leading-relaxed">
                  {achievement.text}
                  {achievement.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-chip ml-2 inline-block rounded-full border border-edge px-2.5 py-0.5 font-mono text-xs text-accent transition-colors hover:border-accent/50"
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Section>
  );
}
