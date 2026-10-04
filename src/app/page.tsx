import {
  achievements,
  codingProfiles,
  education,
  experience,
  heroFacts,
  profile,
} from "@/data/resume";
import CopyEmailButton from "@/components/CopyEmailButton";
import CapabilityMap from "@/components/workshop/CapabilityMap";
import { TrialAudioProvider } from "@/components/trials/TrialAudio";
import TrialNav from "@/components/trials/TrialNav";
import Symbols from "@/components/trials/Symbols";
import Invitation from "@/components/trials/Invitation";
import TrialScene from "@/components/trials/TrialScene";
import GameArena from "@/components/trials/GameArena";
import ControlRoom from "@/components/trials/ControlRoom";
import { trialsAudio } from "@/data/trials-audio";

function Chapter({
  number,
  name,
  title,
  description,
}: {
  number: string;
  name: string;
  title: string;
  description: string;
}) {
  return (
    <div className="chapter-heading">
      <div>
        <p className="trial-eyebrow">
          <span className="chapter-number">{number}</span>
          {name}
        </p>
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <TrialAudioProvider>
      <div className="trials-world">
        <a className="trial-skip" href="#projects">
          Skip to portfolio
        </a>
        <TrialNav />
        <main>
          <section
            className="invitation-section trial-container"
            id="invitation"
            aria-labelledby="invitation-title"
          >
            <div className="invitation-topline">
              <span>
                <i />
                AN INTERACTIVE PORTFOLIO
              </span>
              <span>DESIGNED TO BE EXPLORED. BUILT TO BE PLAYED.</span>
            </div>
            <div className="invitation-layout">
              <div className="invitation-copy">
                <p className="trial-eyebrow">
                  A FAMILIAR WORLD. A DIFFERENT STORY.
                </p>
                <h1 id="invitation-title">
                  YOU’RE
                  <br />
                  <span>INVITED.</span>
                </h1>
                <p>
                  I’m Akshit. Full-stack engineer.
                  <br />
                  Curious builder. <strong>Player 370.</strong>
                </p>
                <p className="invitation-description">
                  Step inside my world of web, mobile, and AI.
                  <br />
                  There’s a little work. A little play. And a lot to discover.
                </p>
                <div className="invitation-actions">
                  <a className="trial-button pink-button" href="#player">
                    Accept the invitation <span>↗</span>
                  </a>
                  <a className="trial-text-link" href="#projects">
                    Just show me the work <span>→</span>
                  </a>
                </div>
                <div className="invitation-subtext">
                  <span className="status-dot" />
                  Open to full-stack opportunities
                  <span className="subtext-divider">/</span>Hyderabad, India
                </div>
              </div>
              <div className="invitation-art">
                <div className="set-top-label">
                  <span>THE WORLD OF PLAYER 370</span>
                  <span>SET / 001</span>
                </div>
                <TrialScene />
                <Invitation />
                <div className="set-floor-label">
                  <span>EVERY GREAT STORY STARTS WITH A CHOICE.</span>
                  <span>○ △ □</span>
                </div>
              </div>
            </div>
            <div className="invitation-bottom">
              <a href="#player">
                <span className="scroll-line" />
                SCROLL TO ENTER THE STORY
              </a>
              <span>SOUND MAKES IT BETTER. SILENCE WORKS TOO.</span>
              <a href="#games">
                3 MINI-GAMES INSIDE <span>↘</span>
              </a>
            </div>
          </section>
          <div className="story-strip">
            <div className="trial-container">
              <span>○ ONE PLAYER</span>
              <span>△ MANY POSSIBILITIES</span>
              <span>□ YOUR NEXT ENGINEER</span>
              <a href="#games">LET’S PLAY ↗</a>
            </div>
          </div>
          <section
            className="trial-section trial-container player-section"
            id="player"
          >
            <Chapter
              number="01"
              name="THE DORMITORY"
              title="Meet the player."
              description="Behind the number is a person who likes taking on interesting problems—and seeing them through."
            />
            <div className="player-layout">
              <div className="player-pass">
                <div className="pass-top">
                  <Symbols />
                  <span>PARTICIPANT RECORD</span>
                </div>
                <div className="pass-center">
                  <div className="player-avatar" aria-hidden="true">
                    <div className="avatar-head" />
                    <div className="avatar-body">
                      <span>370</span>
                    </div>
                  </div>
                  <div>
                    <span>PLAYER NUMBER</span>
                    <strong>370</strong>
                    <p>AKSHIT YADAV AESHAM</p>
                  </div>
                </div>
                <div className="pass-bottom">
                  <span>FULL-STACK / AI / MOBILE</span>
                  <span className="pass-barcode" aria-hidden="true" />
                </div>
              </div>
              <div className="player-profile">
                <p className="trial-eyebrow">THE PERSON BEHIND THE PORTFOLIO</p>
                <h3>
                  I build things.
                  <br />
                  Then make them better.
                </h3>
                <p>{profile.intro}</p>
                <p className="player-current">
                  Currently <strong>{profile.role}</strong> at{" "}
                  <strong>{profile.company}</strong>.
                </p>
                <div className="player-facts">
                  {heroFacts.map((fact) => (
                    <div key={fact.label}>
                      <strong>{fact.value}</strong>
                      <span>{fact.label}</span>
                    </div>
                  ))}
                </div>
                <a
                  className="trial-text-link"
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read the full player file <span>↗</span>
                </a>
              </div>
            </div>
          </section>
          <section className="journey-section" id="journey">
            <div className="trial-container trial-section">
              <Chapter
                number="02"
                name="THE STAIRCASE"
                title="Every step brought me here."
                description="Different teams, new challenges, and a few unexpected turns. This is the path so far."
              />
              <div className="journey-layout">
                <aside className="journey-set">
                  <TrialScene kind="stairs" />
                  <p className="trial-eyebrow">THE ONLY WAY IS THROUGH.</p>
                  <p>
                    Web. Mobile. Backend. AI.
                    <br />
                    Always another level to explore.
                  </p>
                </aside>
                <ol className="trial-career">
                  {experience.map((job, index) => (
                    <li key={job.company}>
                      <span className="career-level">
                        0{experience.length - index}
                      </span>
                      <div className="trial-career-meta">
                        <span>{job.period}</span>
                        <span>{index === 0 ? "CURRENT LEVEL" : job.mode}</span>
                      </div>
                      <h3>{job.company}</h3>
                      <p className="trial-career-role">{job.role}</p>
                      <p>{job.summary}</p>
                      <ul>
                        {job.highlights.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                      <div className="trial-stack">
                        {job.stack.map((tech) => (
                          <span key={tech}>{tech}</span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="trial-education">
                <span>LEVEL 00 / THE FOUNDATION</span>
                <div>
                  <h3>{education.degree}</h3>
                  <p>
                    {education.school} · {education.period}
                  </p>
                </div>
                <strong>{education.score}</strong>
              </div>
            </div>
          </section>
          <section className="trial-section trial-container" id="projects">
            <Chapter
              number="03"
              name="THE CONTROL ROOM"
              title="Watch the work unfold."
              description="Five projects. Five different challenges. Select a feed to look beyond the interface and into the engineering."
            />
            <ControlRoom />
          </section>
          <section className="games-section" id="games">
            <div className="trial-container trial-section">
              <Chapter
                number="04"
                name="THE PLAYGROUND"
                title="Your turn, player."
                description="A little detour from the usual portfolio. Three familiar games, reimagined in miniature. Play a round. Stay a while."
              />
              <GameArena />
            </div>
          </section>
          <section
            className="trial-section trial-container equipment-section"
            id="skills"
          >
            <Chapter
              number="05"
              name="THE EQUIPMENT ROOM"
              title="Choose your tools wisely."
              description="Every tool has a story. Pick one to see the teams and projects where I’ve put it to work."
            />
            <CapabilityMap />
            <div className="records-heading">
              <span className="trial-eyebrow">FROM THE PLAYER RECORDS</span>
              <span>PROOF, NOT JUST PROMISES.</span>
            </div>
            <div className="trial-records">
              {achievements.map((item, i) => (
                <article key={item.text}>
                  <span>RECORD / 00{i + 1}</span>
                  <p>{item.text}</p>
                  <div>
                    {item.links.map((link) => (
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
                  <b aria-hidden="true">{i ? "□" : "△"}</b>
                </article>
              ))}
            </div>
          </section>
          <section className="trial-contact" id="contact">
            <div className="trial-container contact-chapter">
              <div>
                <p className="trial-eyebrow">06 / THE NEXT CHAPTER</p>
                <h2>
                  LET’S MAKE
                  <br />
                  <span>SOMETHING</span>
                  <br />
                  WORTH PLAYING.
                </h2>
                <p>
                  Or something that makes everyday life a little better.
                  <br />
                  I’m open to full-stack opportunities and good conversations.
                </p>
                <div className="trial-contact-actions">
                  <a href={`mailto:${profile.email}`}>
                    {profile.email}
                    <span>↗</span>
                  </a>
                  <CopyEmailButton email={profile.email} />
                </div>
                <div className="trial-socials">
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
              <div className="exit-object" aria-hidden="true">
                <div className="exit-door">
                  <span>EXIT</span>
                  <div className="door-opening">
                    <Symbols />
                  </div>
                  <div className="door-leaf">
                    <i />
                  </div>
                </div>
                <p>THIS IS WHERE OUR STORY BEGINS.</p>
              </div>
            </div>
          </section>
        </main>
        <footer className="trial-footer trial-container">
          <a href="#invitation">
            <Symbols />
          </a>
          <div>
            <span>
              © {new Date().getFullYear()} {profile.name}
            </span>
            <p>A playful, unofficial tribute to Squid Game.</p>
          </div>
          <a href="#invitation">Back to the invitation ↑</a>
        </footer>
        {(trialsAudio.ambience || trialsAudio.carousel) && (
          <div className="audio-credits trial-container">
            {[trialsAudio.ambience, trialsAudio.carousel]
              .filter((track) => track !== null)
              .map((track) => (
                <p key={track.src}>
                  Music: {track.title} — {track.credit} ·{" "}
                  <a
                    href={track.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    License ↗
                  </a>
                </p>
              ))}
          </div>
        )}
      </div>
    </TrialAudioProvider>
  );
}
