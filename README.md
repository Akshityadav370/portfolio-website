# Akshit’s portfolio — Inside the Machine

A single-page full-stack engineering portfolio with a graphite and copper workshop aesthetic. Built with Next.js, React, Tailwind CSS, and Three.js; exported as a static site.

## Local development

```sh
npm install
npm run dev
```

Open http://localhost:3000. The existing Geist fonts are fetched by Next.js during development/build and self-hosted in the output.

## Content and presentation

- `src/data/resume.ts`: profile, work experience, projects, skills, education, and proof links.
- `src/app/page.tsx`: page composition and server-rendered content.
- `src/app/workshop.css`: active visual design and responsive layouts.
- `src/components/workshop/`: navigation, scene controls, project viewer, and skill evidence inspector.
- `src/lib/workshop-scene.ts`: procedural Three.js geometry, materials, lighting, motion, and cleanup. No external models or textures are required.

The hero assembly can be assembled/exploded. Each project has its own illustrative 3D scene. Scenes load near the viewport, cap pixel density, pause offscreen or in hidden tabs, respect reduced motion, and have manual pause controls. A static CSS assembly appears if WebGL is unavailable. Core content and links remain readable before JavaScript loads.

The previous IDE components remain in the repository but are no longer mounted. The active design uses one deliberate palette; the old rotating theme boot script is removed.

## Verification and production output

```sh
npm run lint
npx tsc --noEmit
npm run build
```

`npm run build` exports the site to `out/`. Existing Vercel deployment settings remain unchanged. See `PRODUCT.md` for positioning, content constraints, and deployment context.
