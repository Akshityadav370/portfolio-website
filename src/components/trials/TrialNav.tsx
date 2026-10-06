"use client";

import { useEffect, useState } from "react";
import { profile } from "@/data/resume";
import Symbols from "./Symbols";
import { SoundToggle } from "./TrialAudio";

const links = [
  ["player", "The player"],
  ["projects", "The work"],
  ["games", "The games"],
  ["contact", "The next chapter"],
];
export default function TrialNav() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="trial-header">
      <nav className="trial-container trial-nav" aria-label="Main navigation">
        <a
          href="#invitation"
          className="trial-brand"
          aria-label="Player 370 home"
        >
          <Symbols />
          <span>
            PLAYER<span>370</span>
          </span>
        </a>
        <div
          className={`trial-nav-links ${open ? "is-open" : ""}`}
          id="trial-navigation"
        >
          {links.map(([id, label]) => (
            <a href={`#${id}`} key={id} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </div>
        <div className="trial-nav-actions">
          <SoundToggle />
          <a
            className="trial-resume"
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Résumé ↗
          </a>
          <button
            className="trial-menu"
            aria-expanded={open}
            aria-controls="trial-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>
    </header>
  );
}
