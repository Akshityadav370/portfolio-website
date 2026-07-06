import {
  siCodingninjas,
  siGeeksforgeeks,
  siGithub,
  siLeetcode,
} from "simple-icons";
import Reveal from "@/components/Reveal";
import { codingProfiles, profile } from "@/data/resume";

function BrandIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d={path} />
    </svg>
  );
}

// simple-icons dropped LinkedIn (brand policy), so profileIcons only covers
// the coding platforms; LinkedIn keeps a hand-drawn path below.
const profileIcons: Record<string, string> = {
  LeetCode: siLeetcode.path,
  GeeksforGeeks: siGeeksforgeeks.path,
  "Coding Ninjas": siCodingninjas.path,
};

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

const iconLink =
  "flex h-12 w-12 items-center justify-center rounded-full border border-edge text-muted transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent";

export default function ContactSection() {
  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
      <Reveal>
        <div className="lift rounded-3xl border border-edge bg-surface p-10 text-center sm:p-16">
          <p className="font-mono text-sm text-accent">04 · contact</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            <span className="text-gradient">
              Let&apos;s build something fast.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted">
            Open to full-stack and frontend roles. The quickest way to reach me
            is email — I usually reply within a day.
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href={`mailto:${profile.email}`}
              className="btn-gradient rounded-full px-6 py-3 text-sm font-medium text-background"
            >
              {profile.email}
            </a>
          </div>

          {/* socials + coding profiles */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              title="GitHub"
              className={iconLink}
            >
              <BrandIcon path={siGithub.path} />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              title="LinkedIn"
              className={iconLink}
            >
              <LinkedInIcon />
            </a>
            {codingProfiles
              .filter((p) => p.url)
              .map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${p.name} profile`}
                  title={p.name}
                  className={iconLink}
                >
                  {profileIcons[p.name] ? (
                    <BrandIcon path={profileIcons[p.name]} />
                  ) : (
                    <span className="font-mono text-xs font-semibold">
                      {p.short}
                    </span>
                  )}
                </a>
              ))}
          </div>
          <p className="mt-4 font-mono text-xs text-muted">
            {profile.location}
          </p>
        </div>
      </Reveal>
      <footer className="mt-12 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-muted">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p>Built with Next.js · zero animation libraries · statically exported</p>
      </footer>
    </section>
  );
}
