"use client";

import { useState } from "react";
import { experience, projects, skillGroups } from "@/data/resume";
import SkillIcon from "@/components/SkillIcon";

const normalize = (value: string) =>
  value.toLowerCase().replace(/\s+\d+(\.\d+)*$/, "");
const aliases: Record<string, string[]> = {
  javascript: ["react", "node.js", "next.js", "react native"],
  python: ["fastapi"],
  sql: ["postgresql", "mysql"],
  kubernetes: ["gke"],
  "google cloud": ["gke"],
  redux: ["redux toolkit"],
};

export default function CapabilityMap() {
  const [selected, setSelected] = useState("React");
  const key = normalize(selected);
  const keys = [key, ...(aliases[key] ?? [])];
  const jobs = experience.filter((job) =>
    job.stack.some((tech) => keys.includes(normalize(tech))),
  );
  const work = projects.filter((project) =>
    project.stack.some((tech) => keys.includes(normalize(tech))),
  );
  const level = jobs.length
    ? "USED IN PRODUCTION"
    : work.length
      ? "SHIPPED IN A PROJECT"
      : "FAMILIAR / EXPLORING";

  return (
    <div className="capability-layout">
      <div className="capability-groups">
        {skillGroups.map((group, index) => (
          <div className="capability-group" key={group.title}>
            <h3>
              <span>0{index + 1}</span>
              {group.title}
            </h3>
            <div>
              {group.skills.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  aria-pressed={skill === selected}
                  aria-controls="skill-evidence"
                  onClick={() => setSelected(skill)}
                >
                  <SkillIcon name={skill} size={15} />
                  {skill}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <aside
        className="skill-evidence"
        id="skill-evidence"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="micro-label">COMPONENT INSPECTOR</p>
        <div className="skill-specimen" aria-hidden="true">
          <div className="specimen-orbit" />
          <div className="specimen-chip">
            <SkillIcon name={selected} size={48} />
          </div>
          <span>↖</span>
        </div>
        <p className="evidence-level">
          <i />
          {level}
        </p>
        <h3>{selected}</h3>
        <p className="evidence-intro">
          {jobs.length || work.length
            ? "Part of the things I’ve built."
            : "Part of my learning toolkit. Production or project evidence isn’t listed yet."}
        </p>
        <ul>
          {jobs.map((job) => (
            <li key={job.company}>
              <span>WORK</span>
              {job.company}
            </li>
          ))}
          {work.map((project) => (
            <li key={project.name}>
              <span>PROJECT</span>
              {project.name}
            </li>
          ))}
        </ul>
        <p className="inspector-tip">
          Select a component to see where it’s used.
        </p>
      </aside>
    </div>
  );
}
