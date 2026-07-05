import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import { projects } from "@/data/resume";

export default function ProjectsSection() {
  return (
    <Section id="projects" eyebrow="02 · projects" title="What I've built">
      <div className="space-y-6">
        {projects.map((project) => (
          <Reveal key={project.name}>
            <article className="rounded-2xl border border-edge bg-surface p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-xl font-semibold">{project.name}</h3>
                <p className="font-mono text-sm text-accent">{project.tag}</p>
              </div>
              <p className="mt-3 max-w-2xl leading-relaxed text-muted">
                {project.description}
              </p>
              <ul className="mt-6 space-y-3">
                {project.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3 text-muted">
                    <span aria-hidden className="mt-1 text-accent">
                      ▸
                    </span>
                    <span className="leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
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
