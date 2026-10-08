import { experience, projects, profile, education } from "@/data/resume";
import { groundAt, type ZoneId } from "./rules";
export type Exhibit = {
  id: string;
  zone: ZoneId;
  x: number;
  y: number;
  z: number;
  title: string;
  label: string;
  text: string;
  kind:
    "locker" | "archive" | "screen" | "case" | "phone" | "dossier" | "beacon";
  index?: number;
  tools?: string[];
};
export const EXHIBITS: Exhibit[] = [
  {
    id: "astra-beacon",
    zone: "contact",
    x: 33,
    y: 0,
    z: 44,
    title: "Activate the Astra beacon",
    label: "GPT 6 ASTRA",
    text: "Built with love using GPT 6 Astra",
    kind: "beacon",
  },
  {
    id: "player-locker",
    zone: "dormitory",
    x: -4,
    y: 0,
    z: 2,
    title: "Meet the builder",
    label: "MEET AKSHIT",
    text: profile.intro,
    kind: "locker",
  },
  ...experience.map((job, index): Exhibit => {
    const z = [-24, -20, -16, -12][index];
    return {
      id: `archive-${index}`,
      zone: "career",
      x: 1.65,
      y: groundAt(0, z),
      z,
      title: `Open ${job.company} archive`,
      label: job.company,
      text: `${job.period} · ${job.role}. ${job.summary}`,
      kind: "archive",
      index,
    };
  }),
  ...projects.map((project, index): Exhibit => ({
    id: `feed-${index}`,
    zone: "projects",
    x: 19 + index * 3,
    y: 0,
    z: -16.5,
    title: `Power on ${project.name}`,
    label: project.name,
    text: project.description,
    kind: "screen",
    index,
  })),
  ...[
    { label: "WEB", tools: ["React", "Next.js", "TypeScript"], x: 19 },
    { label: "MOBILE", tools: ["React Native", "Expo"], x: 22 },
    {
      label: "BACKEND",
      tools: ["Spring Boot", "FastAPI", "PostgreSQL"],
      x: 28,
    },
    { label: "AI", tools: ["Spring AI", "LangChain", "OpenAI API"], x: 31 },
  ].map((kit): Exhibit => ({
    id: `kit-${kit.label}`,
    zone: "skills",
    x: kit.x,
    y: 0,
    z: 11,
    title: `Open ${kit.label.toLowerCase()} equipment case`,
    label: `${kit.label} TOOLKIT`,
    text: kit.tools.join(" · "),
    tools: kit.tools,
    kind: "case",
  })),
  {
    id: "contact-phone",
    zone: "contact",
    x: 23.5,
    y: 0,
    z: 40,
    title: "Pick up the desk phone",
    label: "LET’S TALK",
    text: profile.email,
    kind: "phone",
  },
  {
    id: "contact-dossier",
    zone: "contact",
    x: 26.5,
    y: 0,
    z: 40,
    title: "Read my résumé",
    label: "MY RÉSUMÉ",
    text: `${education.degree} · ${education.school}. Explore the résumé or connect online.`,
    kind: "dossier",
  },
];
export function nearestExhibit(position: { x: number; y: number; z: number }) {
  return (
    EXHIBITS.filter(
      (e) =>
        Math.abs(e.y - position.y) < 1.6 &&
        Math.hypot(e.x - position.x, e.z - position.z) < 2.65,
    ).sort(
      (a, b) =>
        Math.hypot(a.x - position.x, a.z - position.z) -
        Math.hypot(b.x - position.x, b.z - position.z),
    )[0] ?? null
  );
}
export function projectsForTools(tools: string[]) {
  return projects.filter((project) =>
    project.stack.some((tool) => tools.includes(tool)),
  );
}
