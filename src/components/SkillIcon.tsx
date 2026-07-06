import type { CSSProperties } from "react";
import {
  siAndroidstudio,
  siApachekafka,
  siC,
  siClaude,
  siClerk,
  siConvex,
  siCplusplus,
  siCursor,
  siDigitalocean,
  siDocker,
  siExpo,
  siExpress,
  siFastapi,
  siFigma,
  siFirebase,
  siGit,
  siGithubactions,
  siGo,
  siGooglechrome,
  siGooglecloud,
  siGooglegemini,
  siGreensock,
  siJavascript,
  siKubernetes,
  siLangchain,
  siMinio,
  siMongodb,
  siMysql,
  siNetlify,
  siNextdotjs,
  siNodedotjs,
  siNx,
  siOpenjdk,
  siPostgresql,
  siPostman,
  siPython,
  siRazorpay,
  siReact,
  siRedis,
  siRedux,
  siSocketdotio,
  siSpring,
  siSpringboot,
  siSqlalchemy,
  siStripe,
  siSwagger,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
  siVercel,
  siVite,
  siWebpack,
  siXcode,
} from "simple-icons";

type Icon = { path: string; hex: string };

// Normalized skill name -> brand icon. Skills without an entry (AWS, OpenAI,
// Zustand, Liveblocks… removed from or missing in simple-icons) render as
// plain text.
const MAP: Record<string, Icon> = {
  typescript: siTypescript,
  javascript: siJavascript,
  java: siOpenjdk,
  python: siPython,
  go: siGo,
  "c++": siCplusplus,
  c: siC,
  react: siReact,
  "react native": siReact,
  "react 19": siReact,
  "next.js": siNextdotjs,
  expo: siExpo,
  "node.js": siNodedotjs,
  express: siExpress,
  "spring boot": siSpringboot,
  "spring ai": siSpring,
  fastapi: siFastapi,
  "socket.io": siSocketdotio,
  vite: siVite,
  "tailwind css": siTailwindcss,
  "three.js": siThreedotjs,
  gsap: siGreensock,
  redux: siRedux,
  postgresql: siPostgresql,
  pgvector: siPostgresql,
  mongodb: siMongodb,
  mysql: siMysql,
  redis: siRedis,
  firebase: siFirebase,
  "google cloud": siGooglecloud,
  gke: siGooglecloud,
  docker: siDocker,
  kubernetes: siKubernetes,
  kafka: siApachekafka,
  "github actions": siGithubactions,
  vercel: siVercel,
  netlify: siNetlify,
  digitalocean: siDigitalocean,
  minio: siMinio,
  git: siGit,
  "claude code": siClaude,
  cursor: siCursor,
  xcode: siXcode,
  "android studio": siAndroidstudio,
  "figma mcp": siFigma,
  postman: siPostman,
  webpack: siWebpack,
  nx: siNx,
  "micro-frontends": siWebpack,
  convex: siConvex,
  clerk: siClerk,
  razorpay: siRazorpay,
  "chrome extension api": siGooglechrome,
  gemini: siGooglegemini,
  langchain: siLangchain,
  sqlalchemy: siSqlalchemy,
  swagger: siSwagger,
  stripe: siStripe,
};

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s+\d+(\.\d+)*$/, "")
    .trim();

const luma = (hex: string) => {
  const n = parseInt(hex, 16);
  return (
    (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) /
    255
  );
};

export default function SkillIcon({
  name,
  size = 14,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const icon = MAP[normalize(name)];
  if (!icon) return null;
  // near-black brand marks (Next.js, Vercel, Express…) get the theme
  // foreground on dark modes via the .si-invert CSS rule
  const invert = luma(icon.hex) < 0.22;
  return (
    <span
      aria-hidden
      className={`skill-icon ${invert ? "si-invert" : ""} ${className}`}
      style={{ "--brand": `#${icon.hex}` } as CSSProperties}
    >
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
        <path d={icon.path} />
      </svg>
    </span>
  );
}
