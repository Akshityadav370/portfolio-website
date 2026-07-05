"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { profile } from "@/data/resume";
import { setMode } from "@/lib/theme";

const links = [
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

function subscribeMode(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-mode"],
  });
  return () => observer.disconnect();
}

function ModeToggle() {
  const mode = useSyncExternalStore(
    subscribeMode,
    () => document.documentElement.dataset.mode ?? "dark",
    () => null,
  );

  if (!mode) return null;
  const next = mode === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-edge text-sm text-muted transition-colors hover:border-accent/40 hover:text-accent"
    >
      {mode === "dark" ? "☀" : "☾"}
    </button>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors ${
        scrolled
          ? "border-b border-edge bg-background/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("terminal:open"))}
          title="Open the terminal"
          className="cursor-pointer font-mono text-sm font-semibold text-foreground"
        >
          <span className="text-accent">~/</span>akshit
          <span aria-hidden className="tw-caret ml-1 align-middle" />
        </button>
        <div className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-accent/40 px-4 py-1.5 text-sm text-accent transition-colors hover:bg-accent/10"
          >
            Resume
          </a>
        </div>
      </nav>
    </header>
  );
}
