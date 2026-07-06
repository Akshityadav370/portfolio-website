import Reveal from "@/components/Reveal";
import Typewriter from "@/components/Typewriter";
import { heroFacts, profile } from "@/data/resume";

export default function Hero() {
  return (
    <section className="relative">
      <div className="relative mx-auto flex min-h-svh max-w-5xl flex-col justify-center px-6 pt-24 pb-16">
        <Reveal>
          <p className="font-mono text-sm text-accent">
            {profile.role} @ {profile.company} · {profile.location}
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">
            <span className="block min-h-[1.2em] text-accent">
              <Typewriter />
            </span>
            <span className="mt-2 block">I&apos;m Akshit.</span>
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            {profile.intro}
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-8 flex flex-wrap gap-3">
            {heroFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-xl border border-edge bg-surface px-4 py-3"
              >
                <p className="font-mono text-lg font-semibold text-accent">
                  {fact.value}
                </p>
                <p className="mt-0.5 text-xs text-muted">{fact.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={400}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#experience"
              className="btn-gradient rounded-full px-6 py-3 text-sm font-medium text-background"
            >
              See the work
            </a>
            <a
              href="#contact"
              className="rounded-full border border-edge px-6 py-3 text-sm text-foreground transition-colors hover:border-accent/40 hover:text-accent"
            >
              Get in touch
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
