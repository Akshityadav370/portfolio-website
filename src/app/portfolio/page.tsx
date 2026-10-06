import Link from "next/link";
import {
  profile,
  projects,
  experience,
  skillGroups,
  education,
} from "@/data/resume";
import CopyEmailButton from "@/components/CopyEmailButton";
import styles from "./portfolio.module.css";

export default function Portfolio() {
  return (
    <main className={styles.page}>
      <a className={styles.skip} href="#work">
        Skip to work
      </a>
      <header className={styles.header}>
        <a href="#about" className={styles.wordmark}>
          AKSHIT<span> / 370</span>
        </a>
        <nav aria-label="Portfolio navigation">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#contact">Contact</a>
          <Link href="/" prefetch={false}>
            3D world ↗
          </Link>
        </nav>
      </header>
      <section id="about" className={styles.hero}>
        <p className={styles.eyebrow}>
          FULL-STACK ENGINEER · {profile.location}
        </p>
        <h1>
          Akshit Yadav.
          <br />
          <span>Web. Mobile. AI.</span>
        </h1>
        <p className={styles.intro}>{profile.intro}</p>
        <p className={styles.current}>
          {profile.role} at <strong>{profile.company}</strong>
        </p>
        <div className={styles.links}>
          <a className={styles.primary} href="#work">
            See my work ↘
          </a>
          <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
            Résumé ↗
          </a>
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </div>
      </section>
      <section id="work" className={styles.section}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>01 / SELECTED WORK</p>
          <h2>Things I’ve built.</h2>
        </div>
        <div className={styles.projects}>
          {projects.map((project, i) => (
            <article className={styles.project} key={project.name}>
              <span className={styles.number}>
                {String(i + 1).padStart(2, "0")} / {project.tag}
              </span>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <p className={styles.stack}>
                {project.stack.slice(0, 5).join(" · ")}
              </p>
              <div className={styles.links}>
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${project.name} source code`}
                  >
                    Source ↗
                  </a>
                )}
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${project.name} live demo`}
                  >
                    Live demo ↗
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="experience" className={styles.section}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>02 / EXPERIENCE</p>
          <h2>Where I’ve worked.</h2>
        </div>
        {experience.map((job) => (
          <article key={`${job.company}-${job.role}`} className={styles.job}>
            <p className={styles.period}>{job.period}</p>
            <div>
              <h3>{job.company}</h3>
              <p className={styles.role}>{job.role}</p>
              <p>{job.summary}</p>
            </div>
          </article>
        ))}
      </section>
      <section id="skills" className={styles.section}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>03 / TOOLKIT</p>
          <h2>What I work with.</h2>
        </div>
        <div className={styles.skills}>
          {skillGroups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <p>{group.skills.slice(0, 8).join(" · ")}</p>
            </div>
          ))}
        </div>
      </section>
      <section id="contact" className={`${styles.section} ${styles.contact}`}>
        <p className={styles.eyebrow}>04 / CONTACT</p>
        <h2>Have something in mind?</h2>
        <div className={styles.links}>
          <a className={styles.email} href={`mailto:${profile.email}`}>
            {profile.email} ↗
          </a>
          <CopyEmailButton email={profile.email} />
        </div>
        <div className={styles.links}>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
          <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
            Résumé ↗
          </a>
          <Link href="/" prefetch={false}>
            Explore the 3D world ↗
          </Link>
        </div>
      </section>
      <footer className={styles.footer}>
        <span>{profile.name}</span>
        <span>
          {education.degree} · {education.school}
        </span>
      </footer>
    </main>
  );
}
