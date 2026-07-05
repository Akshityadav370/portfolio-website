import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import { experience } from "@/data/resume";

export default function ExperienceSection() {
  return (
    <Section id="experience" eyebrow="01 · experience" title="Where I've worked">
      <div className="space-y-6">
        {experience.map((job, i) => (
          <Reveal key={job.company} delay={i * 100}>
            <article className="rounded-2xl border border-edge bg-surface p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h3 className="text-xl font-semibold">{job.role}</h3>
                  <p className="mt-1 text-accent">{job.company}</p>
                </div>
                <p className="font-mono text-sm text-muted">
                  {job.period} · {job.mode}
                </p>
              </div>
              <ul className="mt-6 space-y-3">
                {job.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3 text-muted">
                    <span aria-hidden className="mt-1 text-accent">
                      ▸
                    </span>
                    <span className="leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                {job.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-edge px-3 py-1 font-mono text-xs text-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
