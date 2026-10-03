import {
  achievements,
  codingProfiles,
  education,
  experience,
  heroFacts,
  profile,
} from "@/data/resume";
import CopyEmailButton from "@/components/CopyEmailButton";
import WorkshopNav from "@/components/workshop/WorkshopNav";
import MachineScene from "@/components/workshop/MachineScene";
import ProjectLab from "@/components/workshop/ProjectLab";
import CapabilityMap from "@/components/workshop/CapabilityMap";

function SectionHeading({
  number,
  label,
  title,
  description,
}: {
  number: string;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="workshop-section-heading">
      <div>
        <p className="section-kicker">
          <span>{number}</span>
          {label}
        </p>
        <h2>
          {title}
          <span>.</span>
        </h2>
      </div>
      <p>{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="workshop-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <WorkshopNav />
      <main id="main">
        <section
          className="workshop-hero workshop-container"
          id="home"
          aria-labelledby="hero-title"
        >
          <div className="hero-topline">
            <span>
              <i className="status-dot" />
              OPEN TO FULL-STACK OPPORTUNITIES
            </span>
            <span>HYDERABAD, INDIA · BUILDING EVERYWHERE</span>
          </div>
          <div className="hero-main">
            <div className="hero-copy">
              <p className="hero-intro">
                Hey, I’m Akshit <span aria-hidden="true">↗</span>
              </p>
              <h1 id="hero-title">
                Thoughtfully
                <br />
                built.
                <br />
                <span>Inside out.</span>
              </h1>
              <p className="hero-description">{profile.intro}</p>
              <div className="hero-actions">
                <a className="workshop-button primary" href="#projects">
                  Explore my work <span aria-hidden="true">↗</span>
                </a>
                <a className="text-link" href="#contact">
                  Let’s talk <span aria-hidden="true">↗</span>
                </a>
              </div>
              <p className="hero-current">
                <span className="tiny-cross" aria-hidden="true">
                  +
                </span>
                Currently {profile.role} at <strong>{profile.company}</strong>
              </p>
            </div>
            <div className="hero-art">
              <MachineScene />
              <div className="hero-art-caption">
                <span>THE ANATOMY OF A BUILDER</span>
                <span>FIG. 001</span>
              </div>
            </div>
          </div>
          <div className="hero-bottom">
            <div className="hero-facts">
              {heroFacts.map((fact) => (
                <div key={fact.label}>
                  <strong>{fact.value}</strong>
                  <span>{fact.label}</span>
                </div>
              ))}
            </div>
            <a href="#projects" className="scroll-cue">
              <span>SCROLL TO LOOK INSIDE</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>
        <div
          className="discipline-band"
          aria-label="Web, mobile, backend, artificial intelligence, infrastructure"
        >
          <div className="workshop-container">
            {[
              "WEB",
              "MOBILE",
              "BACKEND",
              "ARTIFICIAL INTELLIGENCE",
              "INFRASTRUCTURE",
            ].map((label) => (
              <span key={label}>
                <i aria-hidden="true">✳</i>
                {label}
              </span>
            ))}
          </div>
        </div>
        <section className="workshop-section workshop-container" id="projects">
          <SectionHeading
            number="01"
            label="SELECTED WORK"
            title="Ideas, made tangible"
            description="From a first thought to the last API call. A few things I’ve built, taken apart for a closer look."
          />
          <ProjectLab />
        </section>
        <section className="experience-section" id="experience">
          <div className="workshop-container workshop-section">
            <SectionHeading
              number="02"
              label="THE JOURNEY"
              title="Built along the way"
              description="Different teams. Different challenges. The same curiosity about how everything fits together."
            />
            <div className="career-layout">
              <aside className="career-aside">
                <div className="career-diagram" aria-hidden="true">
                  <div />
                  <div />
                  <div />
                  <span>↗</span>
                </div>
                <p className="micro-label">A CONTINUOUS WORK IN PROGRESS</p>
                <h3>
                  Better with
                  <br />
                  every iteration.
                </h3>
                <p>Web, mobile, services, and the systems that connect them.</p>
                <a
                  className="text-link"
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  The full résumé <span aria-hidden="true">↗</span>
                </a>
              </aside>
              <ol className="career-timeline">
                {experience.map((job, index) => (
                  <li className="career-stop" key={job.company}>
                    <span
                      className={`career-node ${index === 0 ? "is-current" : ""}`}
                      aria-hidden="true"
                    />
                    <div className="career-meta">
                      <span>{job.period}</span>
                      <span>{index === 0 ? "CURRENT CHAPTER" : job.mode}</span>
                    </div>
                    <h3>{job.company}</h3>
                    <p className="career-role">{job.role}</p>
                    <p className="career-summary">{job.summary}</p>
                    <ul>
                      {job.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                    <div className="stack-tags">
                      {job.stack.map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="education-row">
              <span className="education-icon" aria-hidden="true">
                ⌁
              </span>
              <div>
                <p className="micro-label">
                  THE FOUNDATION · {education.period}
                </p>
                <h3>{education.degree}</h3>
                <p>{education.school}</p>
              </div>
              <span className="education-score">{education.score}</span>
            </div>
          </div>
        </section>
        <section className="workshop-section workshop-container" id="skills">
          <SectionHeading
            number="03"
            label="UNDER THE HOOD"
            title="The parts I work with"
            description="A toolkit built through real work. Select a technology to see the projects and teams behind it."
          />
          <CapabilityMap />
          <div className="beyond-work">
            <p className="micro-label">BEYOND THE BUILD</p>
            <div>
              {achievements.map((achievement, index) => (
                <article key={achievement.text}>
                  <span className="achievement-symbol" aria-hidden="true">
                    {index === 0 ? "✳" : "⌘"}
                  </span>
                  <p>{achievement.text}</p>
                  <div>
                    {achievement.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label} ↗
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="contact-section" id="contact">
          <div className="workshop-container contact-inner">
            <div className="contact-copy">
              <p className="section-kicker">
                <span>04</span>THE NEXT CONNECTION
              </p>
              <h2>
                Good things start
                <br />
                with <em>a hello.</em>
              </h2>
              <p>
                Have something in mind? I’m open to full-stack opportunities and
                conversations about things worth building.
              </p>
              <div className="contact-actions">
                <a className="contact-email" href={`mailto:${profile.email}`}>
                  {profile.email}
                  <span aria-hidden="true">↗</span>
                </a>
                <CopyEmailButton email={profile.email} />
              </div>
              <div className="contact-socials">
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub ↗
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn ↗
                </a>
                {codingProfiles
                  .filter((item) => item.url)
                  .map((item) => (
                    <a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.name} ↗
                    </a>
                  ))}
              </div>
            </div>
            <div className="contact-art">
              <MachineScene compact assembled />
              <p className="micro-label">ALL THE PIECES. SOMETHING NEW.</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="workshop-footer workshop-container">
        <a href="#home" className="footer-identity">
          <span className="logo-symbol" aria-hidden="true">
            a<span>.</span>
          </span>
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
        </a>
        <span>MADE WITH CURIOSITY. BUILT WITH INTENT.</span>
        <a href="#home">Back to top ↑</a>
      </footer>
    </div>
  );
}
