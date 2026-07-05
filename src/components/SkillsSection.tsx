import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import { achievements, skillGroups } from "@/data/resume";

export default function SkillsSection() {
  return (
    <Section id="skills" eyebrow="03 · skills" title="What I work with">
      <div className="grid gap-6 sm:grid-cols-2">
        {skillGroups.map((group, i) => (
          <Reveal key={group.title} delay={i * 75}>
            <div className="h-full rounded-2xl border border-edge bg-surface p-6">
              <h3 className="font-mono text-sm text-accent">{group.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-edge px-3 py-1 text-sm text-muted"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-6">
        <div className="rounded-2xl border border-edge bg-surface p-6">
          <h3 className="font-mono text-sm text-accent">Beyond the job</h3>
          <ul className="mt-4 space-y-2">
            {achievements.map((achievement) => (
              <li key={achievement} className="flex gap-3 text-muted">
                <span aria-hidden className="mt-1 text-accent">
                  ▸
                </span>
                <span className="leading-relaxed">{achievement}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Section>
  );
}
