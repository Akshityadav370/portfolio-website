"use client";

import { useState } from "react";
import { projects } from "@/data/resume";
import MachineScene, { type SceneKind } from "./MachineScene";

const studies: { kind: SceneKind; label: string; flow: string[] }[] = [
  {
    kind: "builder",
    label: "FROM PROMPT TO PRODUCT",
    flow: ["Prompt", "AI + services", "Workspace"],
  },
  {
    kind: "delivery",
    label: "A CITY, CONNECTED",
    flow: ["Order", "Restaurant", "Delivery"],
  },
  {
    kind: "canvas",
    label: "IDEAS IN SYNC",
    flow: ["Create", "Collaborate", "Sync"],
  },
  {
    kind: "browser",
    label: "A LITTLE MORE SUPERPOWER",
    flow: ["Browser", "AI assistant", "Your workflow"],
  },
  {
    kind: "story",
    label: "EVERY CHOICE, A NEW WORLD",
    flow: ["Prompt", "Generate", "Choose a path"],
  },
];

export default function ProjectLab() {
  const [selected, setSelected] = useState(0);
  const project = projects[selected];
  const study = studies[selected];

  return (
    <div className="project-lab">
      <div className="project-selector" aria-label="Choose a project">
        {projects.map((item, index) => (
          <button
            key={item.name}
            type="button"
            aria-pressed={index === selected}
            aria-controls="project-detail"
            onClick={() => setSelected(index)}
          >
            <span className="project-index">0{index + 1}</span>
            {item.name}
            <span className="project-selector-arrow" aria-hidden="true">
              ↗
            </span>
          </button>
        ))}
      </div>
      <div className="project-detail" id="project-detail">
        <div className="project-visual" key={study.kind}>
          <div className="project-visual-heading">
            <span>EXPERIMENT / 0{selected + 1}</span>
            <span>{study.label}</span>
          </div>
          <MachineScene kind={study.kind} compact />
          <div className="project-flow" aria-label="Illustrative project flow">
            {study.flow.map((step, i) => (
              <span key={step}>
                {step}
                {i < study.flow.length - 1 && <b aria-hidden="true">→</b>}
              </span>
            ))}
          </div>
          <p className="study-note">A spatial sketch of how it works.</p>
        </div>
        <article
          className="project-info"
          key={project.name}
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="project-category">
            <span>{project.tag}</span>
            {project.featured && <span className="featured-tag">FEATURED</span>}
          </div>
          <h3>
            {project.name}
            <span>.</span>
          </h3>
          <p className="project-description">{project.description}</p>
          <ul className="project-highlights">
            {project.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="stack-tags">
            {project.stack.map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
          <div className="project-links">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                View source <span aria-hidden="true">↗</span>
              </a>
            )}
            {project.live && (
              <a
                className="project-live"
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
              >
                Live project <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
