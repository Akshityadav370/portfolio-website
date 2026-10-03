"use client";

import { useEffect, useState } from "react";
import { profile } from "@/data/resume";

const sections = ["projects", "experience", "skills", "contact"];

export default function WorkshopNav() {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: 0 },
    );
    document
      .querySelectorAll("main > section[id]")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <header className="workshop-header">
      <nav className="workshop-nav" aria-label="Main navigation">
        <a
          href="#home"
          className="workshop-logo"
          aria-label="Akshit — home"
          onClick={() => setOpen(false)}
        >
          <span className="logo-symbol" aria-hidden="true">
            a<span>.</span>
          </span>
          <span>
            AKSHIT<span className="logo-caption">ENGINEER & BUILDER</span>
          </span>
        </a>
        <div
          className={`workshop-nav-links ${open ? "is-open" : ""}`}
          id="section-navigation"
        >
          {sections.map((section) => (
            <a
              key={section}
              href={`#${section}`}
              aria-current={active === section ? "location" : undefined}
              onClick={() => setOpen(false)}
            >
              {section}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <a
            className="resume-link"
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Résumé <span aria-hidden="true">↗</span>
          </a>
          <button
            className="mobile-menu"
            aria-controls="section-navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? "Close −" : "Menu +"}
          </button>
        </div>
      </nav>
    </header>
  );
}
