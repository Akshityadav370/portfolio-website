"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { profile } from "@/data/resume";
import { DARK_THEMES, LIGHT_THEMES } from "@/data/themes";
import { setMode, setThemeByName } from "@/lib/theme";

const links = [
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

function subscribeHtmlAttrs(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-mode"],
  });
  return () => observer.disconnect();
}

const useCurrentTheme = () =>
  useSyncExternalStore(
    subscribeHtmlAttrs,
    () => document.documentElement.dataset.theme ?? "deep-space",
    () => null,
  );

const useCurrentMode = () =>
  useSyncExternalStore(
    subscribeHtmlAttrs,
    () => document.documentElement.dataset.mode ?? "dark",
    () => null,
  );

/* Swatch: data-theme re-resolves --accent/--accent-2 to that theme's colors */
function Swatch({ theme }: { theme: string }) {
  return (
    <span
      aria-hidden
      data-theme={theme}
      className="h-3.5 w-3.5 shrink-0 rounded-full border border-edge"
      style={{
        background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
      }}
    />
  );
}

function ThemeDropdown() {
  const theme = useCurrentTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!theme) return null;

  const pick = (name: string) => {
    setThemeByName(name);
    setOpen(false);
  };

  const group = (label: string, pool: readonly string[]) => (
    <div>
      <p className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-widest text-muted uppercase">
        {label}
      </p>
      {pool.map((name) => (
        <button
          key={name}
          type="button"
          role="menuitemradio"
          aria-checked={theme === name}
          onClick={() => pick(name)}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left font-mono text-xs transition-colors ${
            theme === name
              ? "bg-accent/15 text-accent"
              : "text-muted hover:bg-accent/5 hover:text-foreground"
          }`}
        >
          <Swatch theme={name} />
          {name}
          {theme === name && <span className="ml-auto">✓</span>}
        </button>
      ))}
    </div>
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Change theme"
        className="glass-chip flex h-8 items-center gap-2 rounded-full border border-edge px-3 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent"
      >
        <Swatch theme={theme} />
        <span className="hidden sm:inline">{theme}</span>
        <span
          aria-hidden
          className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="glass absolute right-0 top-11 z-50 max-h-[70vh] w-56 overflow-y-auto rounded-xl p-1.5"
        >
          {group("dark", DARK_THEMES)}
          {group("light", LIGHT_THEMES)}
        </div>
      )}
    </div>
  );
}

function ModeToggle() {
  const mode = useCurrentMode();
  if (!mode) return null;
  const next = mode === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setMode(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="glass-chip flex h-8 w-8 items-center justify-center rounded-full border border-edge text-sm text-muted transition-colors hover:border-accent/40 hover:text-accent"
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
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
      <nav
        className={`glass mx-auto flex h-14 max-w-5xl items-center justify-between rounded-2xl px-4 transition-shadow sm:px-5 ${
          scrolled ? "shadow-2xl" : ""
        }`}
      >
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
        <div className="flex items-center gap-2.5">
          <ThemeDropdown />
          <ModeToggle />
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-chip rounded-full border border-accent/40 px-4 py-1.5 text-sm text-accent transition-colors hover:bg-accent/10"
          >
            Resume
          </a>
        </div>
      </nav>
    </header>
  );
}
