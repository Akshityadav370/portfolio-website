import Reveal from "@/components/Reveal";
import Typewriter from "@/components/Typewriter";
import { heroFacts, profile } from "@/data/resume";

export default function Hero() {
  return (
    <section className="relative">
      <div className="relative mx-auto flex min-h-svh max-w-5xl flex-col justify-center px-6 pt-[min(6rem,10svh)] pb-[min(4rem,6svh)]">
        <Reveal>
          <p className="font-mono text-sm text-muted">
            <span className="text-accent">❯</span> {profile.role} @{" "}
            {profile.company} · {profile.location}
          </p>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
            {/* flex-centered, not baseline flow — keeps non-Latin fallback glyphs (nearly a third of the greetings) from jiggling the caret */}
            <span className="flex min-h-[1.2em] items-center text-accent">
              <Typewriter />
            </span>
            <span className="mt-2 block">I&apos;m Akshit.</span>
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
            {profile.intro}
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-9 flex flex-wrap gap-3">
            {heroFacts.map((fact) => (
              <div
                key={fact.label}
                className="group glass-card rounded-xl border border-edge px-4 py-3 transition-colors duration-300 hover:border-accent/40"
              >
                <p className="font-mono text-lg font-semibold text-accent transition-[text-shadow] duration-300 group-hover:[text-shadow:0_0_12px_color-mix(in_srgb,var(--accent)_60%,transparent)]">
                  {fact.value}
                </p>
                <p className="mt-0.5 text-xs text-muted">{fact.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={400}>
          <div className="mt-11 flex flex-wrap items-center gap-4">
            <a
              href="#experience"
              className="btn-gradient rounded-full px-7 py-3.5 text-base font-semibold text-background transition-shadow duration-300 hover:shadow-[0_10px_30px_-8px_color-mix(in_srgb,var(--accent)_55%,transparent)]"
            >
              See the work
            </a>
            <a
              href="#contact"
              className="glass-chip rounded-full border border-edge px-7 py-3.5 text-base text-foreground transition-colors hover:border-accent/40 hover:text-accent"
            >
              Get in touch
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
