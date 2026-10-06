"use client";

import { useState } from "react";
import { projects } from "@/data/resume";

const paths = [
  ["PROMPT", "GATEWAY", "AI SERVICE", "WORKSPACE"],
  ["CUSTOMER", "RESTAURANT", "DELIVERY", "SOCKET.IO"],
  ["CANVAS", "PRESENCE", "LIVEBLOCKS", "CONVEX"],
  ["BROWSER", "AI CHAT", "TASKS", "INDEXEDDB"],
  ["STORY", "CHOICE", "LANGCHAIN", "NEW WORLD"],
];
export default function ControlRoom() {
  const [selected, setSelected] = useState(0);
  const project = projects[selected];
  return (
    <div className="control-room">
      <div className="monitor-bank" aria-label="Select a project feed">
        {projects.map((item, i) => (
          <button
            type="button"
            key={item.name}
            aria-pressed={selected === i}
            aria-controls="project-file"
            onClick={() => setSelected(i)}
          >
            <span className="monitor-label">
              CAM 0{i + 1}
              <i />
            </span>
            <span className="monitor-glyph" aria-hidden="true">
              {["⌘", "⌖", "▧", "◈", "⑂"][i]}
            </span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      <div className="project-file" id="project-file">
        <div className="project-monitor">
          <div className="monitor-heading">
            <span>
              <i />
              FEED 0{selected + 1} / SYSTEM OVERVIEW
            </span>
            <span>REC ●</span>
          </div>
          <div
            className="system-map"
            aria-label="Illustrative project components"
          >
            {paths[selected].map((label, i) => (
              <div key={label}>
                <span>0{i + 1}</span>
                <strong>{label}</strong>
                <i aria-hidden="true">{i < 3 ? "↓" : "○"}</i>
              </div>
            ))}
          </div>
          <div className="monitor-footer">
            <span>AKSHIT / ENGINEERING ARCHIVE</span>
            <span>{String(selected + 1).padStart(3, "0")}</span>
          </div>
        </div>
        <article className="project-dossier" key={project.name}>
          <p className="trial-eyebrow">
            {project.tag}
            {project.featured && <span>FEATURED</span>}
          </p>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <ul>
            {project.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="trial-stack">
            {project.stack.map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
          <div className="dossier-links">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                Inspect the code ↗
              </a>
            )}
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener noreferrer">
                Open live project ↗
              </a>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
