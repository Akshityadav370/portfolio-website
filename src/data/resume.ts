export const profile = {
  name: "Akshit Yadav Aesham",
  role: "Software Development Engineer 1 - Frontend",
  company: "Zotok AI",
  location: "Hyderabad, India",
  email: "akshit07032001@gmail.com",
  site: "https://iakshit.space",
  // TODO: replace with your actual profile URLs
  github: "https://github.com/Akshityadav370",
  linkedin: "https://www.linkedin.com/in/akshityadav",
  resumeUrl:
    "https://drive.google.com/file/d/1IBRhWwx4GGoY4dewu2UbNS52AmsdZoeM/view?usp=sharing",
  tagline: "I build fast web, mobile & AI-powered products.",
  intro:
    "Full-stack engineer building across web, mobile, and AI — React micro-frontends and Spring Boot microservices, real-time apps, and LLM-powered products end to end.",
};

export const heroFacts = [
  { value: "2.5+ yrs", label: "shipping products" },
  { value: "web · mobile · AI", label: "across the stack" },
  { value: "500+", label: "DSA problems solved" },
];

export const education = {
  degree: "B.Tech — Computer Science & Engineering",
  school: "Sreyas Institute of Engineering & Technology",
  period: "2020 — 2024",
  score: "8.12 CGPA",
};

export type Experience = {
  role: string;
  company: string;
  period: string;
  mode: string;
  summary: string;
  highlights: string[];
  stack: string[];
};

export const experience: Experience[] = [
  {
    role: "Software Development Engineer 1 — Frontend",
    company: "Zotok AI",
    period: "Jan 2026 — Present",
    mode: "Onsite",
    summary:
      "Frontend performance work across a micro-frontend React application.",
    highlights: [
      "Collaborated on performance improvements that took initial page load from 25–30s to ~1.5s and cut build time by ~35%.",
      "Eliminated legacy React Native dependencies from a web-only codebase with web-native replacements and Webpack module aliases.",
      "Built a custom NX executor plugin to bypass NX's wrapped Webpack — unlocking full control over HMR, chunk splitting, and loaders.",
      "Fixed build mode from development to production across all deploy environments, enabling minification and dead-code removal.",
      "Rolled out route- and component-level lazy loading across all remote apps, helping cut the initial JS payload by over 50%.",
      "Revamped the Analytics Dashboard, Threads, and internal tools UI/UX using Claude Code and Figma MCP.",
    ],
    stack: ["React", "Webpack", "NX", "Micro-frontends", "TypeScript"],
  },
  {
    role: "Software Engineer",
    company: "Kognito Kube",
    period: "Nov 2025 — Dec 2025",
    mode: "Onsite",
    summary:
      "Short engagement shipping an offline-first mobile POC and client-facing web UI.",
    highlights: [
      "Built an offline-first React Native POC for Zoho Forms submissions with background sync and failure handling.",
      "Converted Figma designs into responsive web UI and handled major frontend API integrations for the MillionMakers client project using React and Redux.",
    ],
    stack: ["React Native", "React", "Redux"],
  },
  {
    role: "Software Engineer",
    company: "Saval AI (by Xansr Technologies)",
    period: "Jan 2024 — Oct 2025",
    mode: "Hybrid",
    summary:
      "Full-stack product work across mobile, web, and internal tooling.",
    highlights: [
      "Migrated the React Native Android app to iOS and shipped App Store in-app purchases with webhook-based validation on both platforms.",
      "Built 70–75% of the mobile app screens with React Native, Context API, RN Skia, and TanStack Query.",
      "Built internal tools (News Editor, Flashcards, Question Management, analytics, remote config) with Next.js and FastAPI.",
      "Processed ML datasets to improve AI model accuracy.",
      "Built interactive 3D websites and game prototypes with Three.js, GSAP, and TypeScript.",
    ],
    stack: ["React Native", "Next.js", "FastAPI", "Three.js", "GSAP"],
  },
  {
    role: "SDE Intern",
    company: "Byteridge",
    period: "Sep 2023 — Nov 2023",
    mode: "Remote",
    summary: "API work on an internal agile-planning product.",
    highlights: [
      "Built REST APIs with Next.js and TypeScript for a Scrum Planning Poker tool — documented with Swagger, tested with Postman.",
    ],
    stack: ["Next.js", "TypeScript", "Swagger", "Postman"],
  },
];

export type Project = {
  name: string;
  tag: string;
  description: string;
  highlights: string[];
  stack: string[];
  github?: string;
  live?: string;
};

export const projects: Project[] = [
  {
    name: "Lovable Clone",
    tag: "AI-Powered App Builder",
    github: "https://github.com/Akshityadav370/distributed-lovable-clone",
    live: "http://lovable.iakshit.space/",
    description:
      "A distributed, AI-native app builder: describe what you want, and an LLM coding assistant writes the code — streamed live.",
    highlights: [
      "Distributed backend of Spring Boot microservices — API Gateway, Auth/Billing, Workspace, AI, Discovery, Config — with Spring Cloud Gateway and Eureka.",
      "Spring AI LLM coding assistant with a custom RAG advisor for project-context injection and tool calling, streamed over SSE.",
      "Kafka + Saga pattern keeps file storage consistent across services — no distributed transactions.",
      "Nx monorepo frontend with domain-driven modules and a custom Radix UI + Tailwind component library.",
      "JWT auth with refresh-token rotation, Stripe billing, Dockerized and deployed to GKE via GitHub Actions.",
    ],
    stack: [
      "Java",
      "Spring Boot",
      "Spring AI",
      "Kafka",
      "PostgreSQL",
      "React",
      "TypeScript",
      "Nx",
      "Docker",
      "GKE",
    ],
  },
  {
    name: "DineDash",
    tag: "Food Delivery Platform",
    github: "https://github.com/Akshityadav370/DineDash",
    description:
      "Full-stack food delivery platform with multi-role authentication for customers, restaurants, and delivery partners.",
    highlights: [
      "Real-time order tracking and live notifications over Socket.io.",
      "Geolocation-based delivery assignment and tracking.",
      "Razorpay payment gateway integration with Firebase-backed auth.",
    ],
    stack: [
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "Socket.io",
      "Razorpay",
      "Firebase",
      "Tailwind CSS",
    ],
  },
  {
    name: "MyMiro",
    tag: "Collaborative Whiteboard",
    github: "https://github.com/Akshityadav370/mymiro",
    live: "https://mymiro.vercel.app",
    description:
      "Real-time collaborative whiteboard with live cursor tracking and canvas drawing tools — Miro, rebuilt.",
    highlights: [
      "Multi-user boards with live cursors and presence via Liveblocks.",
      "Layer management, undo/redo, and board organization.",
      "Convex for the realtime data layer, Clerk for multi-user auth.",
    ],
    stack: [
      "Next.js 15",
      "React 19",
      "TypeScript",
      "Convex",
      "Liveblocks",
      "Clerk",
      "Zustand",
    ],
  },
  {
    name: "LifeNode",
    tag: "AI Chrome Extension",
    github: "https://github.com/Akshityadav370/lifenode",
    description:
      "A Chrome extension that packs AI coding assistance, task management, and habit tracking into the browser.",
    highlights: [
      "Real-time AI chat powered by OpenAI and Gemini.",
      "LeetCode problem-solving integration for in-page coding help.",
      "Persistent local-first storage with IndexedDB.",
    ],
    stack: [
      "React",
      "TypeScript",
      "Chrome Extension API",
      "IndexedDB",
      "OpenAI API",
      "Gemini",
    ],
  },
  {
    name: "Choose Your Own Adventure",
    tag: "AI Storytelling Platform",
    github: "https://github.com/Akshityadav370/Choose-Your-Own-Adventure",
    description:
      "Interactive storytelling platform where LangChain and GPT-4 generate branching stories on the fly.",
    highlights: [
      "AI-generated dynamic stories with tree-based branching navigation.",
      "Asynchronous job processing for story generation.",
      "Session management with cookie-based authentication.",
    ],
    stack: [
      "React",
      "FastAPI",
      "SQLAlchemy",
      "PostgreSQL",
      "LangChain",
      "OpenAI GPT-4",
    ],
  },
];

export const skillGroups: { title: string; skills: string[] }[] = [
  {
    title: "Languages",
    skills: [
      "TypeScript",
      "JavaScript",
      "Java",
      "Python",
      "Go",
      "C++",
      "C",
      "SQL",
    ],
  },
  {
    title: "Frameworks",
    skills: [
      "React",
      "Next.js",
      "React Native",
      "Expo",
      "Node.js",
      "Express",
      "Spring Boot",
      "FastAPI",
      "Socket.IO",
      "Vite",
      "Tailwind CSS",
      "Three.js",
      "GSAP",
      "Zustand",
      "Redux",
    ],
  },
  {
    title: "Databases",
    skills: ["PostgreSQL", "pgvector", "MongoDB", "MySQL", "Redis", "Firebase"],
  },
  {
    title: "Cloud & DevOps",
    skills: [
      "AWS",
      "Google Cloud",
      "Docker",
      "Kubernetes",
      "GKE",
      "Kafka",
      "GitHub Actions",
      "Vercel",
      "Netlify",
      "DigitalOcean",
      "MinIO",
    ],
  },
  {
    title: "Tools",
    skills: [
      "Git",
      "Claude Code",
      "Cursor",
      "Codex",
      "Xcode",
      "Android Studio",
      "Figma MCP",
      "Postman",
    ],
  },
];

export const achievements = [
  "Mentored students on Coding Ninjas — DSA in Java and MERN-stack web development.",
  "Solved 500+ DSA problems across LeetCode, GeeksforGeeks, and Coding Ninjas.",
];
