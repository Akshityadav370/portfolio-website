import TiltCard from "@/components/TiltCard";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import { projects, type Project } from "@/data/resume";

function Chips({ stack, limit }: { stack: string[]; limit?: number }) {
  const shown = limit ? stack.slice(0, limit) : stack;
  const rest = stack.length - shown.length;
  return (
    <div className="mt-auto flex flex-wrap gap-2 pt-5">
      {shown.map((tech) => (
        <span
          key={tech}
          className="glass-chip rounded-full border border-edge px-3 py-1 font-mono text-xs text-muted"
        >
          {tech}
        </span>
      ))}
      {rest > 0 && (
        <span className="glass-chip rounded-full border border-edge px-3 py-1 font-mono text-xs text-muted">
          +{rest}
        </span>
      )}
    </div>
  );
}

function Highlights({ items, limit }: { items: string[]; limit: number }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.slice(0, limit).map((highlight) => (
        <li key={highlight} className="flex gap-3 text-sm text-muted">
          <span aria-hidden className="mt-0.5 text-accent">
            ▸
          </span>
          <span className="leading-relaxed">{highlight}</span>
        </li>
      ))}
    </ul>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function LiveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function CardLinks({ project }: { project: Project }) {
  if (!project.github && !project.live) return null;
  return (
    <div className="mt-1 flex shrink-0 items-center gap-3">
      {project.github && (
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${project.name} source on GitHub`}
          title="View source on GitHub"
          className="text-muted transition-colors hover:text-accent"
        >
          <GitHubIcon />
        </a>
      )}
      {project.live && (
        <a
          href={project.live}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${project.name} live demo`}
          title="Open live demo"
          className="text-muted transition-colors hover:text-accent"
        >
          <LiveIcon />
        </a>
      )}
    </div>
  );
}

function CardHeader({ project }: { project: Project }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-xl font-semibold">{project.name}</h3>
        <p className="font-mono text-xs text-accent">{project.tag}</p>
      </div>
      <CardLinks project={project} />
    </div>
  );
}

export default function ProjectsSection() {
  const [flagship, dinedash, mymiro, lifenode, cyoa] = projects;

  return (
    <Section id="projects" eyebrow="02 · projects" title="What I've built">
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Flagship — 2 cols × 2 rows */}
        <Reveal className="lg:col-span-2 lg:row-span-2">
          <TiltCard className="flex h-full flex-col p-7 sm:p-9">
            <p className="font-mono text-xs text-muted">featured</p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-2xl font-semibold sm:text-3xl">
                  {flagship.name}
                </h3>
                <p className="font-mono text-sm text-accent">{flagship.tag}</p>
              </div>
              <CardLinks project={flagship} />
            </div>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">
              {flagship.description}
            </p>
            <Highlights items={flagship.highlights} limit={5} />
            <Chips stack={flagship.stack} />
          </TiltCard>
        </Reveal>

        {/* Right column, stacked */}
        <Reveal delay={100}>
          <TiltCard className="flex h-full flex-col p-6">
            <CardHeader project={dinedash} />
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {dinedash.description}
            </p>
            <Chips stack={dinedash.stack} limit={4} />
          </TiltCard>
        </Reveal>
        <Reveal delay={200}>
          <TiltCard className="flex h-full flex-col p-6">
            <CardHeader project={mymiro} />
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {mymiro.description}
            </p>
            <Chips stack={mymiro.stack} limit={4} />
          </TiltCard>
        </Reveal>

        {/* Bottom row: small + wide */}
        <Reveal delay={100}>
          <TiltCard className="flex h-full flex-col p-6">
            <CardHeader project={lifenode} />
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {lifenode.description}
            </p>
            <Chips stack={lifenode.stack} limit={4} />
          </TiltCard>
        </Reveal>
        <Reveal delay={200} className="lg:col-span-2">
          <TiltCard className="flex h-full flex-col p-6 sm:p-7">
            <CardHeader project={cyoa} />
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              {cyoa.description}
            </p>
            <Highlights items={cyoa.highlights} limit={2} />
            <Chips stack={cyoa.stack} limit={6} />
          </TiltCard>
        </Reveal>
      </div>
    </Section>
  );
}
