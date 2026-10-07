"use client";
import { projectsForTools, EXHIBITS } from "@/lib/world/exhibits";
import CopyEmailButton from "@/components/CopyEmailButton";
import InvitationCard from "./InvitationCard";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  profile,
  experience,
  projects,
  skillGroups,
  heroFacts,
  education,
} from "@/data/resume";
import {
  ZONES,
  zoneLabel,
  WORLD_PATHS,
  RED_LIGHT_TIME_LIMIT,
  eliminationDelay,
  type GameId,
  type ZoneId,
} from "@/lib/world/rules";
import type { Snapshot, WorldRuntime } from "@/lib/world/runtime";

type Screen = "invitation" | "world" | "map" | "pause" | "dossier" | "briefing";
const instructions: Record<
  GameId,
  { title: string; description: string; steps: string[] }
> = {
  "red-light": {
    title: "You know the rules.",
    description: "One field. One finish line. Keep your eyes on the signal.",
    steps: [
      "Walk forward on green. Your position on the field is your progress.",
      "Green lamp: move while she faces away. Red lamp: release movement as she turns.",
      "Cross within 45 seconds. You have a short grace period during her turn; freeze before she faces you.",
    ],
  },
  mingle: {
    title: "Find your people.",
    description: "The carousel stops. A number appears. Find that room.",
    steps: [
      "Wait on the carousel while the music plays.",
      "When it stops, find the highlighted number above a cubicle and enter it.",
      "You have 10 seconds to choose. A wrong room or missed deadline brings the guards. Complete three rounds.",
    ],
  },
  "jump-rope": {
    title: "A little leap of faith.",
    description: "A narrow bridge. A swinging rope. Five well-timed jumps.",
    steps: [
      "Walk onto the pink marker in front of you.",
      "Press Space or Jump just before the countdown reaches zero.",
      "Only touching the rope ends your attempt. Missed markers repeat; clear five crossings.",
    ],
  },
};
function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close?: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      className="world-dialog"
      ref={ref}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        close?.();
      }}
    >
      <div className="world-dialog-top">
        <span>○ △ □ &nbsp; PLAYER 370</span>
        {close && (
          <button onClick={close} aria-label="Close and return to world">
            Close ×
          </button>
        )}
      </div>
      {children}
    </dialog>
  );
}
function Dossier({ zone, index }: { zone: ZoneId; index?: number }) {
  if (zone === "career")
    return (
      <>
        <p className="world-kicker">{zoneLabel("career")}</p>
        <h2>Every step counts.</h2>
        {experience
          .filter((_, i) => index === undefined || i === index)
          .map((job, i) => (
            <article key={job.company} className="world-record">
              <small>
                LEVEL {experience.length - (index ?? i)} · {job.period}
              </small>
              <h3>{job.company}</h3>
              <p className="world-accent">{job.role}</p>
              <p>{job.summary}</p>
              <ul>
                {job.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <p className="world-stack">{job.stack.join(" / ")}</p>
            </article>
          ))}
        <article className="world-record">
          <h3>{education.degree}</h3>
          <p>
            {education.school} · {education.period} · {education.score}
          </p>
        </article>
      </>
    );
  if (zone === "projects")
    return (
      <>
        <p className="world-kicker">{zoneLabel("projects")}</p>
        <h2>Less “what if.” More “it works.”</h2>
        <p>A few ideas I stopped talking about and started building.</p>
        {projects
          .filter((_, i) => index === undefined || i === index)
          .map((project, i) => (
            <details className="world-record" key={project.name} open={i === 0}>
              <summary>
                <span>PROJECT 0{i + 1}</span>
                <h3>{project.name}</h3>
                <span>＋</span>
              </summary>
              <p>{project.description}</p>
              <ul>
                {project.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <p className="world-stack">{project.stack.join(" / ")}</p>
              <div className="world-link-row">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Explore source ↗
                  </a>
                )}
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live project ↗
                  </a>
                )}
              </div>
            </details>
          ))}
      </>
    );
  if (zone === "skills")
    return (
      <>
        <p className="world-kicker">{zoneLabel("skills")}</p>
        <h2>Tools for the next level.</h2>
        <p>The stack behind the web, mobile, and AI products.</p>
        <div className="world-skill-grid">
          {skillGroups.map((group) => (
            <article className="world-record" key={group.title}>
              <h3>{group.title}</h3>
              <div className="world-chips">
                {group.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </>
    );
  if (zone === "contact")
    return (
      <>
        <p className="world-kicker">{zoneLabel("contact")}</p>
        <h2>
          Let’s build
          <br />
          what comes next.
        </h2>
        <p>Have a product to build, a problem to solve, or a role in mind?</p>
        <a className="world-primary" href={`mailto:${profile.email}`}>
          Say hello ↗
        </a>
        <p>{profile.email}</p>
        <div className="world-link-row">
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn ↗
          </a>
          <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
            Résumé ↗
          </a>
        </div>
      </>
    );
  return (
    <>
      <p className="world-kicker">{zoneLabel("dormitory")}</p>
      <div className="world-player-number">
        370<span>AKSHIT YADAV AESHAM</span>
      </div>
      <h2>
        Engineer by trade.
        <br />
        Builder by instinct.
      </h2>
      <p>{profile.intro}</p>
      <p>
        Currently <strong>{profile.role}</strong> at{" "}
        <strong>{profile.company}</strong>. Based in {profile.location}.
      </p>
      <div className="world-facts">
        {heroFacts.map((f) => (
          <div key={f.label}>
            <strong>{f.value}</strong>
            <span>{f.label}</span>
          </div>
        ))}
      </div>
      <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
        Read the full résumé ↗
      </a>
    </>
  );
}
function MiniMap({
  snapshot,
  large = false,
  onTravel,
}: {
  snapshot: Snapshot | null;
  large?: boolean;
  onTravel?: (zone: ZoneId) => void;
}) {
  return (
    <svg
      className={large ? "world-map-large" : "world-minimap"}
      viewBox="-47 -49 94 110"
      role="img"
      aria-label="World map. North is up."
    >
      <rect x="-46" y="-47" width="92" height="106" rx="5" fill="#244540" />
      {WORLD_PATHS.map((route, index) => (
        <polyline
          key={index}
          points={route.points.map(([x, z]) => [x, z].join(",")).join(" ")}
          stroke={
            route.district === "games"
              ? "#bc6983"
              : route.district === "work"
                ? "#87bdb1"
                : "#e6dabb"
          }
          strokeWidth="2.5"
          fill="none"
        />
      ))}
      {ZONES.map((zone, i) => (
        <g
          key={zone.id}
          onClick={() => onTravel?.(zone.id)}
          className={onTravel ? "world-map-point" : ""}
        >
          <circle
            cx={zone.x}
            cy={zone.z}
            r={large ? 4 : 3}
            fill={
              snapshot?.discovered.includes(zone.id) ? "#ec477e" : "#e6dabb"
            }
          />
          {large && (
            <text
              x={zone.x}
              y={zone.z + 1.3}
              textAnchor="middle"
              fill="#183e36"
              fontSize="3.5"
              fontWeight="bold"
            >
              {i + 1}
            </text>
          )}
        </g>
      ))}
      <g>
        <title>Credits courtyard · beside Contact</title>
        <circle cx="33" cy="44" r="1.8" fill="#e8c879" />
        {large && (
          <text x="33" y="50" textAnchor="middle" fill="#e8c879" fontSize="2.4">
            CREDITS
          </text>
        )}
      </g>
      {snapshot && (
        <g
          transform={`translate(${snapshot.x} ${snapshot.z}) rotate(${(-snapshot.yaw * 180) / Math.PI})`}
        >
          <circle r="4" fill="#fff" opacity=".2" />
          <path d="M0 -3.5L2.5 2L0 1L-2.5 2Z" fill="white" />
        </g>
      )}
      <text x="39" y="-39" fill="#ecddc3" fontSize="4">
        N ↑
      </text>
    </svg>
  );
}
export default function WorldExperience() {
  const host = useRef<HTMLDivElement>(null),
    runtime = useRef<WorldRuntime | null>(null);
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [screen, setScreen] = useState<Screen>("invitation"),
    [snapshot, setSnapshot] = useState<Snapshot | null>(null),
    [selected, setSelected] = useState<ZoneId>("dormitory"),
    [sound, setSound] = useState(false),
    [low, setLow] = useState(false),
    [volume, setVolume] = useState(0.35),
    [cameraSensitivity, setCameraSensitivity] = useState(1),
    [cameraFollow, setCameraFollow] = useState(true),
    [stick, setStick] = useState({ x: 0, y: 0 });
  const screenRef = useRef<Screen>("invitation");
  useEffect(() => {
    let cancelled = false;
    import("@/lib/world/runtime")
      .then(({ createWorld }) => {
        if (cancelled || !host.current) return;
        try {
          runtime.current = createWorld(host.current, {
            update: setSnapshot,
            ready: () => setReady(true),
            error: () => setFailed(true),
            pause: () => setScreen((s) => (s === "world" ? "pause" : s)),
            interact: (zone) => {
              setSelected(zone);
              setScreen(
                ZONES.find((z) => z.id === zone)?.game ? "briefing" : "dossier",
              );
            },
          });
          if (window.matchMedia("(pointer: coarse)").matches) {
            runtime.current.setQuality(true);
            setLow(true);
          }
        } catch (error) {
          console.error("World initialization failed", error);
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      runtime.current?.dispose();
      runtime.current = null;
    };
  }, []);
  useEffect(() => {
    screenRef.current = screen;
    runtime.current?.setPaused(screen !== "world");
  }, [screen, ready]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.repeat || e.target instanceof HTMLInputElement) return;
      const current = screenRef.current;
      if (current === "world" && (e.code === "KeyM" || e.code === "Escape")) {
        e.preventDefault();
        setScreen(e.code === "KeyM" ? "map" : "pause");
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const enter = () => setScreen("world");
  const changeSound = () => {
    const value = !sound;
    setSound(value);
    runtime.current?.setSound(value);
    if (screen === "world") host.current?.focus();
  };
  const travel = (zone: ZoneId) => {
    runtime.current?.teleport(zone);
    enter();
  };
  const game = ZONES.find((z) => z.id === selected)?.game;
  const trial = snapshot?.trial;
  const activeZone = ZONES.find((z) => z.id === snapshot?.zone);
  const joystick = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let x = (e.clientX - rect.left - rect.width / 2) / 35,
      y = (e.clientY - rect.top - rect.height / 2) / 35;
    const d = Math.hypot(x, y);
    if (d > 1) {
      x /= d;
      y /= d;
    }
    setStick({ x, y });
    runtime.current?.setJoystick(x, y);
  };
  return (
    <main className="world-experience">
      <div
        ref={host}
        className="world-canvas"
        data-camera-yaw={snapshot?.yaw.toFixed(3)}
        data-player-x={snapshot?.x.toFixed(2)}
        data-player-z={snapshot?.z.toFixed(2)}
      />
      <a className="world-skip" href="/portfolio">
        Read the portfolio without playing
      </a>
      {screen === "world" && (
        <>
          <header className="world-hud-header">
            <div className="world-brand">
              <span>○ △ □</span>
              <strong>
                PLAYER <b>370</b>
              </strong>
            </div>
            <div className="world-location">
              <small>YOU ARE HERE</small>
              <span>{activeZone?.name}</span>
            </div>
            <nav aria-label="World controls">
              <a
                className="world-spa-link"
                href="/portfolio"
                aria-label="Open classic portfolio"
                title="Open classic portfolio (Esc releases the cursor)"
              >
                Classic portfolio ↗
              </a>
              <button onClick={() => setScreen("map")} aria-label="Open map">
                Map <kbd>M</kbd>
              </button>
              <button
                aria-label="Recenter camera"
                title="Recenter camera (C)"
                onClick={() => {
                  runtime.current?.recenter();
                  host.current?.focus();
                }}
              >
                ↺
              </button>
              <button onClick={changeSound} aria-pressed={sound}>
                {sound ? "Sound on" : "Sound off"}
              </button>
              <button
                onClick={() => setScreen("pause")}
                aria-label="Pause world"
              >
                Ⅱ
              </button>
            </nav>
          </header>
          {!trial && !snapshot?.exhibit && (
            <div className="world-objective">
              <span className="world-kicker">CURIOSITY LOOKS GOOD ON YOU</span>
              <h1>Follow your curiosity.</h1>
              <p>
                {snapshot?.zone === "dormitory"
                  ? "Base Camp is straight ahead — come say hello. Teal paths lead to work; pink paths to games. Press E to interact, or M for the map."
                  : "Explore the glowing markers here. Press E to interact. Follow teal paths for work, pink paths for games, or press M for the map."}
              </p>
              <small>
                {snapshot?.discovered.length ?? 0} / 8 PLACES DISCOVERED
              </small>
            </div>
          )}
          {!trial && snapshot?.exhibit && (
            <section
              className="world-exhibit-panel"
              aria-label="Interactive exhibit"
            >
              <div className="world-exhibit-top">
                <span>
                  DISCOVERED {snapshot.explored} / {EXHIBITS.length}
                </span>
                <button
                  onClick={() => runtime.current?.closeExhibit()}
                  aria-label="Close exhibit"
                >
                  ×
                </button>
              </div>
              <small>
                {snapshot.exhibit.kind === "screen"
                  ? "FEED ONLINE"
                  : snapshot.exhibit.kind === "phone"
                    ? "RECEIVER LIFTED"
                    : "OPENED"}
              </small>
              <h2>{snapshot.exhibit.label}</h2>
              <p>{snapshot.exhibit.text}</p>
              {snapshot.exhibit.kind === "beacon" && (
                <p>
                  A little thank-you to the tools behind this world. The
                  orbiting light wakes up when you activate it. Press E again to
                  let it rest.
                </p>
              )}
              {snapshot.exhibit.tools && (
                <div className="world-exhibit-projects">
                  <strong>Used in these projects</strong>
                  {projectsForTools(snapshot.exhibit.tools).map((project) => (
                    <a
                      key={project.name}
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {project.name} ↗
                    </a>
                  ))}
                  {projectsForTools(snapshot.exhibit.tools).length === 0 && (
                    <p>Visit the Level-Up Log to see these skills at work.</p>
                  )}
                </div>
              )}
              {snapshot.exhibit.kind === "screen" &&
                snapshot.exhibit.index !== undefined && (
                  <div className="world-link-row">
                    <a
                      href={projects[snapshot.exhibit.index].github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Source code ↗
                    </a>
                    {projects[snapshot.exhibit.index].live && (
                      <a
                        href={projects[snapshot.exhibit.index].live}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Live demo ↗
                      </a>
                    )}
                  </div>
                )}
              {snapshot.exhibit.kind === "phone" && (
                <div className="world-link-row">
                  <a href={`mailto:${profile.email}`}>Send an email ↗</a>
                  <CopyEmailButton email={profile.email} />
                </div>
              )}
              {snapshot.exhibit.kind === "dossier" && (
                <div className="world-link-row">
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open résumé ↗
                  </a>
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn ↗
                  </a>
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub ↗
                  </a>
                </div>
              )}
              <button
                className="world-primary"
                onClick={() => runtime.current?.inspectExhibit()}
              >
                Read more <kbd>F</kbd>
              </button>
              <small>Walk away to close · E toggles the object</small>
            </section>
          )}
          {trial && (
            <section
              className={`world-trial-hud game-${trial.kind} phase-${trial.phase}`}
              aria-label="Game status"
            >
              <div>
                <span>{ZONES.find((z) => z.id === trial.kind)?.name}</span>
                <button
                  onClick={() => {
                    runtime.current?.leaveGame();
                    host.current?.focus();
                  }}
                >
                  Leave game ×
                </button>
              </div>
              <strong>
                {trial.status === "won"
                  ? "ROUND COMPLETE"
                  : trial.status === "lost"
                    ? trial.kind === "red-light"
                      ? "ELIMINATED"
                      : "TRY AGAIN"
                    : trial.kind === "red-light"
                      ? trial.phase === "green"
                        ? "GREEN LIGHT"
                        : trial.phase === "warning"
                          ? "RED · STOP NOW"
                          : "RED LIGHT"
                      : trial.kind === "mingle"
                        ? trial.phase === "spinning"
                          ? "KEEP TO THE CAROUSEL"
                          : `FIND ROOM ${trial.target}`
                        : `JUMP IN ${Math.max(0, trial.nextCrossing - trial.elapsed).toFixed(1)}s`}
              </strong>
              <p>{trial.message}</p>
              <progress
                value={trial.progress}
                max="1"
                aria-label="Game progress"
              />
              <small>
                {trial.kind === "red-light"
                  ? `${Math.floor(trial.progress * 100)}% ACROSS · ${Math.max(0, Math.ceil(RED_LIGHT_TIME_LIMIT - trial.elapsed))}s LEFT`
                  : trial.kind === "mingle"
                    ? `ROUND ${Math.min(trial.round + 1, 3)} / 3 · ${Math.ceil((trial.phase === "spinning" ? 4.5 : 10) - trial.phaseTime)}s`
                    : `${trial.round} / 5 CROSSINGS`}
              </small>
              {trial.status !== "playing" && (
                <button
                  className="world-primary"
                  disabled={
                    snapshot.elimination >= 0 &&
                    snapshot.elimination < 1.2 + eliminationDelay(trial.kind)
                  }
                  onClick={() => {
                    runtime.current?.startGame(trial.kind);
                    host.current?.focus();
                  }}
                >
                  Play again ↗
                </button>
              )}
            </section>
          )}
          <button
            className="world-map-button"
            onClick={() => setScreen("map")}
            aria-label="Open world map"
          >
            <MiniMap snapshot={snapshot} />
            <span>COMPOUND / M</span>
          </button>
          {!trial && snapshot?.nearby && (
            <button
              className="world-interact"
              onClick={() => runtime.current?.interact()}
            >
              <kbd>E</kbd>
              {snapshot.nearby.title}
              <span>↗</span>
            </button>
          )}
          <div className="world-controls-legend">
            <span>
              <kbd>W A S D</kbd> Walk
            </span>
            <span>
              <kbd>MOUSE</kbd> Look · Click to capture
            </span>
            <span>
              <kbd>SPACE</kbd> Jump
            </span>
            <span>
              <kbd>SHIFT</kbd> Run
            </span>
          </div>
          <div className="world-touch">
            <div
              className="world-joystick"
              aria-label="Drag to move"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                joystick(e);
              }}
              onPointerMove={(e) => {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) joystick(e);
              }}
              onPointerUp={() => {
                setStick({ x: 0, y: 0 });
                runtime.current?.setJoystick(0, 0);
              }}
              onPointerCancel={() => {
                setStick({ x: 0, y: 0 });
                runtime.current?.setJoystick(0, 0);
              }}
            >
              <span
                style={{
                  transform: `translate(${stick.x * 30}px,${stick.y * 30}px)`,
                }}
              />
            </div>
            <button
              className="world-jump"
              onPointerDown={() => runtime.current?.jump()}
            >
              Jump ↑
            </button>
          </div>
        </>
      )}
      {(screen === "invitation" || failed) && (
        <Modal title="Welcome to Akshit’s world">
          <div className="world-invitation">
            <p className="world-kicker">
              AN INTERACTIVE PORTFOLIO BY AKSHIT YADAV
            </p>
            <InvitationCard />
            <h1>
              Build. Break.
              <br />
              Come back better.
            </h1>
            <aside
              className="world-invite-note"
              aria-label="A note from Akshit"
            >
              <span>A NOTE FROM AKSHIT</span>
              <p>
                Big dreams. Small commits. A few dramatic sighs.
                <br />I keep building anyway.
              </p>
            </aside>
            <div className="world-entry-choices">
              <button disabled={!ready || failed} onClick={enter}>
                <span>01 / TAKE THE SCENIC ROUTE</span>
                <strong>
                  {failed
                    ? "3D unavailable"
                    : ready
                      ? "Explore the 3D world ↗"
                      : "Preparing the 3D world…"}
                </strong>
                <small>
                  Meet the builder. Explore the work. Try not to get eliminated.
                </small>
              </button>
              <a href="/portfolio">
                <span>02 / GET TO KNOW ME</span>
                <strong>Read my portfolio ↗</strong>
                <small>
                  Projects, experience, and skills. No walking required.
                </small>
              </a>
            </div>
            {failed && (
              <p>
                The 3D world couldn’t start on this device. You can still read
                my classic portfolio.
              </p>
            )}
            <div className="world-invite-options">
              <button onClick={changeSound} aria-pressed={sound}>
                {sound ? "♫ Sound enabled" : "♫ Enable game sound"}
              </button>
            </div>
            <small>
              WASD TO WALK · MOUSE TO LOOK · E TO INTERACT
              <br />
              Touch controls available on mobile
            </small>
          </div>
        </Modal>
      )}
      {screen === "map" && !failed && (
        <Modal title="World map" close={enter}>
          <p className="world-kicker">
            YOUR EXPLORATION / {snapshot?.discovered.length ?? 0} OF 8
            DISCOVERED
          </p>
          <h2>Pick your next stop.</h2>
          <p>
            Teal paths connect the portfolio. Pink paths lead to the games.
            Numbers match the signs in the world. Choose any destination to
            travel there.
          </p>
          <div className="world-map-layout">
            <MiniMap snapshot={snapshot} large onTravel={travel} />
            <div className="world-destinations">
              {ZONES.map((zone, i) => (
                <button key={zone.id} onClick={() => travel(zone.id)}>
                  <b>0{i + 1}</b>
                  <span>
                    <strong>{zone.name}</strong>
                    <small>{zone.subtitle}</small>
                  </span>
                  <span>↗</span>
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
      {screen === "pause" && !failed && (
        <Modal title="World paused" close={enter}>
          <p className="world-kicker">TAKE A BREATHER</p>
          <h2>The world can wait.</h2>
          <p>
            {trial
              ? "Your round is paused. Resume playing, or leave the game and return to its entrance."
              : "The world is paused. Come back whenever you’re ready."}
          </p>
          <button className="world-primary" onClick={enter}>
            {trial ? "Resume game ↗" : "Back to the world ↗"}
          </button>
          <div className="world-settings">
            {trial && (
              <button
                onClick={() => {
                  runtime.current?.leaveGame();
                  enter();
                }}
              >
                Leave game &amp; explore ↗
              </button>
            )}
            <button onClick={changeSound}>
              {sound ? "Turn sound off" : "Turn sound on"}
            </button>
            <label>
              Sound volume{" "}
              <input
                aria-label="Sound volume"
                type="range"
                min="0"
                max="1"
                step=".05"
                value={volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  runtime.current?.setVolume(v);
                }}
              />
            </label>
            <button
              aria-pressed={low}
              onClick={() => {
                setLow(!low);
                runtime.current?.setQuality(!low);
              }}
            >
              {low ? "Graphics: light" : "Graphics: full"}
            </button>
            <button
              aria-pressed={cameraFollow}
              onClick={() => {
                setCameraFollow(!cameraFollow);
                runtime.current?.setCameraFollow(!cameraFollow);
              }}
            >
              {cameraFollow
                ? "Camera: follows movement"
                : "Camera: manual orbit"}
            </button>
            <label>
              Camera sensitivity{" "}
              <input
                aria-label="Camera sensitivity"
                type="range"
                min=".4"
                max="2"
                step=".1"
                value={cameraSensitivity}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setCameraSensitivity(value);
                  runtime.current?.setCameraSensitivity(value);
                }}
              />
            </label>
            <div className="world-camera-buttons">
              <button onClick={() => runtime.current?.setCameraDistance(4.5)}>
                Closer view
              </button>
              <button onClick={() => runtime.current?.setCameraDistance(9)}>
                Wider view
              </button>
            </div>
            <button onClick={() => setScreen("map")}>
              Open map / recover position
            </button>
            <a href="/portfolio">Open classic portfolio ↗</a>
          </div>
          <p className="world-help">
            Move your mouse to look around. Click the world to capture the
            cursor for continuous turning; Escape releases it and pauses. Touch
            players can drag the world to look. Automatic follow resumes after a
            short delay.
          </p>
          <p className="world-help">
            WASD / arrows to walk · Mouse to look · Scroll to zoom · Space to
            jump · Shift to run · E to interact · C to recenter camera · M for
            map · Esc to pause
          </p>
          <small>
            Scenery:{" "}
            <a
              href="https://kenney.nl/assets/nature-kit"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kenney Nature Kit (CC0)
            </a>
            {" · Physics adaptations: "}
            <a
              href="/licenses/Sketchbook-MIT.txt"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sketchbook (MIT)
            </a>
          </small>
        </Modal>
      )}
      {screen === "dossier" && !failed && (
        <Modal
          title={ZONES.find((z) => z.id === selected)?.name ?? "About Akshit"}
          close={enter}
        >
          {snapshot?.exhibit?.kind === "beacon" ? (
            <>
              <p className="world-kicker">THE ASTRA BEACON</p>
              <h2>Built with love using GPT 6 Astra</h2>
              <p>
                A small interactive signature for a world built around Akshit’s
                work, curiosity, and love of games.
              </p>
              <p>
                The exploration soundtrack is an original ambient composition.
                The textured boulder is a CC0 asset from Poly Haven.
              </p>
              <p>
                Tommy Vercetti model by jak218984, adapted with animation
                changes, under{" "}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC BY 4.0
                </a>
                .
              </p>
              <div className="world-link-row">
                <a
                  href="https://sketchfab.com/3d-models/tommy-vercetti-7316bd1cee854c31b55121b66b97045f"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Character credit · jak218984 ↗
                </a>
                <a
                  href="https://polyhaven.com/a/boulder_01"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Scenery credit · Poly Haven ↗
                </a>
                <a href="/portfolio">Explore the portfolio ↗</a>
              </div>
            </>
          ) : (
            <Dossier
              zone={selected}
              index={
                snapshot?.exhibit?.zone === selected
                  ? snapshot.exhibit.index
                  : undefined
              }
            />
          )}
        </Modal>
      )}
      {screen === "briefing" && game && !failed && (
        <Modal title={instructions[game].title} close={enter}>
          <p className="world-kicker">
            GAME BRIEFING / {ZONES.find((z) => z.id === selected)?.name}
          </p>
          <h2>{instructions[game].title}</h2>
          <p>{instructions[game].description}</p>
          <ol className="world-briefing">
            {instructions[game].steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <button
            className="world-primary"
            onClick={() => {
              runtime.current?.startGame(game);
              enter();
            }}
          >
            Enter the arena ↗
          </button>
          <button className="world-sound-option" onClick={changeSound}>
            {sound ? "♫ Music enabled" : "♫ Enable game music"}
          </button>
          <p className="world-help">
            All games are optional. The whole portfolio is yours to explore.
          </p>
        </Modal>
      )}
    </main>
  );
}
