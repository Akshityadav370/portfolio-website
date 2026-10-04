# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences land here roughly equally, and the site has to work for both at once:

- **Recruiters/hiring managers screening candidates.** Deciding whether to move Akshit to a conversation. Job = fast, credible signal in a 30-second skim.
- **Technical interviewers/engineering peers.** Digging into actual project depth, code, and architecture decisions before or after talking to him. Job = verify engineering judgment, not just breadth.

## Product Purpose

Personal portfolio for an active job search targeting **full-stack roles** — not "frontend engineer" positioning, despite his current title being SDE1-Frontend at Zotok AI. Success means recruiters and technical interviewers both come away with a credible, verifiable read on his range and craft, leading to real conversations.

## Positioning

**Full-stack + AI-native range** is the headline claim: 2.5+ years shipping across web, mobile, backend, and LLM-powered products end to end (React micro-frontends, Spring Boot microservices, real-time apps, RAG/LLM tooling) — range a frontend-only or backend-only competing portfolio couldn't truthfully copy.

This supersedes the historical "speed as proof-of-craft" framing. The current playable miniature-world design leads with full-stack/AI-native range, while engineering quality remains supporting evidence. See the current-design notes in `CLAUDE.md`.

## Operating Context

- Portfolio is public and always-on; auto-deploys on push to `main` via Vercel.
- Content is not hand-authored per page — everything renders from `src/data/resume.ts` (profile, experience, projects, skills, achievements, education). Editing product content means editing that file, not markup.
- Akshit edits `resume.ts` / `layout.tsx` directly between work sessions — his latest wording is authoritative and should never be silently reverted.
- Currently employed full-time at Zotok AI while conducting this search.

## Current presentation

The user approved a Squid Game-inspired miniature portfolio on a separate branch, preserving the prior workshop design at `703dd5f` on `feat/3d-workshop-portfolio`. Visitors can explore the invitation, player record, career staircase, control room, optional games, equipment room, and contact chapter. Mini-games never gate résumé or project access. Music remains owner-supplied; generated cues are opt-in and all gameplay cues have visual equivalents.

## Capabilities and Constraints

- Next.js static export (`output: "export"`) — no server runtime. This blocks any feature needing a backend (Spotify "last played" card, anonymous WhatsApp messaging) until a migration decision is made; both are backlog, not started.
- Deployed on Vercel under the `xansr` team scope — deliberate choice, not to be second-guessed.
- Visual dependencies: `simple-icons` and `three` (with `@types/three` for development). The 3D scene module loads near the viewport; motion uses CSS and requestAnimationFrame, with offscreen/hidden-tab suspension and reduced-motion support.
- `lovable.iakshit.space` project link is HTTP-only (no TLS on that GKE ingress yet) — a known, real gap; don't paper over it by hiding or relabeling the link.
- `www.iakshit.space` CNAME had resolution issues at launch — unresolved, needs checking against Namecheap.

## Brand Commitments

- **Honest framing is non-negotiable:** Zotok performance wins were team efforts — always "collaborated on / helped cut," never solo claims.
- **Full-stack positioning over frontend positioning**, even though the current job title says "Frontend."
- Identity: Akshit Yadav Aesham · GitHub `Akshityadav370` · LinkedIn `akshit-yadav` · coding-profile username `bucephalus370` (LeetCode/GfG) + Naukri Code360 UUID profile.
- Claims need receipts: skills should show where they were used; achievements link to certificates/proof, not asserted alone.

## Evidence on Hand

- Resume (Google Drive link) in `profile.resumeUrl`.
- Mentorship certificates (DSA, WebDev) linked from `achievements`.
- 500+ DSA problems solved, linked via LeetCode/GfG/Code360 profiles.
- 5 real projects with GitHub links (Lovable Clone, DineDash, MyMiro, LifeNode, Choose Your Own Adventure); 2 have live demos.
- No testimonials, case studies, press, or third-party endorsements exist — future work must not fabricate any.

## Product Principles

1. **Full-stack + AI-native range is the headline claim** — every surface should read as "ships across web, mobile, backend, and LLM products," not as a frontend specialist's portfolio.
2. **Craft remains evidence, not just narrative.** The 3D presentation uses progressive enhancement: readable HTML first, deferred procedural scenes, bounded pixel density, and a static fallback. Engineering quality still backs up the range claim.
3. **Every claim needs a receipt.** Skills point to where they were used, achievements link to proof, performance wins are attributed honestly to teams, not claimed solo.
4. **Serve two reading depths on the same surface.** A recruiter's 30-second skim and an engineer's 10-minute deep-dive both need to succeed without separate paths.
5. **The site is a living artifact, not a fixed launch.** Content changes between sessions (Akshit edits `resume.ts` directly) — new work should build on his latest state, not assume the last-known snapshot is current.
