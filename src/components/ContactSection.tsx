import Reveal from "@/components/Reveal";
import { profile } from "@/data/resume";

export default function ContactSection() {
  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
      <Reveal>
        <div className="rounded-3xl border border-edge bg-surface p-10 text-center sm:p-16">
          <p className="font-mono text-sm text-accent">04 · contact</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            <span className="text-gradient">Let&apos;s build something fast.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted">
            Open to full-stack and frontend roles. The quickest way to reach me
            is email — I usually reply within a day.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`mailto:${profile.email}`}
              className="btn-gradient rounded-full px-6 py-3 text-sm font-medium text-background"
            >
              {profile.email}
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-edge px-6 py-3 text-sm text-foreground transition-colors hover:border-accent/40 hover:text-accent"
            >
              GitHub
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-edge px-6 py-3 text-sm text-foreground transition-colors hover:border-accent/40 hover:text-accent"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </Reveal>
      <footer className="mt-12 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-muted">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p>Built with Next.js · zero animation libraries · statically exported</p>
      </footer>
    </section>
  );
}
