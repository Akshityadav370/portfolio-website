"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  profile,
  experience,
  projects,
  skillGroups,
  heroFacts,
  education,
} from "@/data/resume";
import { ZONES, type GameId, type ZoneId } from "@/lib/world/rules";
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
      "Stop when she turns. Moving on red ends the round.",
      "Cross the far line before 65 seconds.",
    ],
  },
  mingle: {
    title: "Find your people.",
    description: "The carousel stops. A number appears. Find that room.",
    steps: [
      "Wait on the carousel while the music plays.",
      "When it stops, walk through the door with the matching number.",
      "You have 10 seconds to choose. Complete three rounds.",
    ],
  },
  "jump-rope": {
    title: "A little leap of faith.",
    description: "A narrow bridge. A swinging rope. Five well-timed jumps.",
    steps: [
      "Walk onto the pink marker in front of you.",
      "Press Space or Jump just before the countdown reaches zero.",
      "After each jump, move to the next marker. Clear five crossings.",
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
function Dossier({ zone }: { zone: ZoneId }) {
  if (zone === "career")
    return (
      <>
        <p className="world-kicker">02 / THE STAIRCASE</p>
        <h2>Every step counts.</h2>
        {experience.map((job, i) => (
          <article key={job.company} className="world-record">
            <small>
              LEVEL {experience.length - i} · {job.period}
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
        <p className="world-kicker">03 / THE CONTROL ROOM</p>
        <h2>Behind the screens.</h2>
        <p>Open a feed to inspect the work.</p>
        {projects.map((project, i) => (
          <details className="world-record" key={project.name} open={i === 0}>
            <summary>
              <span>FEED 0{i + 1}</span>
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
        <p className="world-kicker">04 / THE EQUIPMENT ROOM</p>
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
        <p className="world-kicker">08 / THE NEXT CHAPTER</p>
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
      <p className="world-kicker">01 / THE DORMITORY · PARTICIPANT RECORD</p>
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
      aria-label="Compound map. North is up."
    >
      <rect x="-46" y="-47" width="92" height="106" rx="5" fill="#244540" />
      <path
        d="M0 -42V53 M-40 -4H40 M-40 25H40 M-40 49H40 M-28 -40V45 M25 -35V49"
        stroke="#64847b"
        strokeWidth="3"
        fill="none"
      />
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
          {!trial && (
            <div className="world-objective">
              <span className="world-kicker">YOUR NEXT CHAPTER</span>
              <h1>Make yourself at home.</h1>
              <p>
                Follow the pink markers. Discover the person behind the player.
              </p>
              <small>
                {snapshot?.discovered.length ?? 0} / 8 PLACES DISCOVERED
              </small>
            </div>
          )}
          {trial && (
            <section
              className={`world-trial-hud phase-${trial.phase}`}
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
                    ? "TRY AGAIN"
                    : trial.kind === "red-light"
                      ? trial.phase === "green"
                        ? "GREEN LIGHT"
                        : trial.phase === "warning"
                          ? "STOP NOW"
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
                  ? `${Math.floor(trial.progress * 100)}% ACROSS · ${Math.ceil(65 - trial.elapsed)}s LEFT`
                  : trial.kind === "mingle"
                    ? `ROUND ${Math.min(trial.round + 1, 3)} / 3 · ${Math.ceil((trial.phase === "spinning" ? 4.5 : 10) - trial.phaseTime)}s`
                    : `${trial.round} / 5 CROSSINGS`}
              </small>
              {trial.status !== "playing" && (
                <button
                  className="world-primary"
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
            aria-label="Open compound map"
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
              <kbd>DRAG</kbd> Look
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
        <Modal title="An invitation to Player 370’s world">
          <div className="world-invitation">
            <p className="world-kicker">
              AN INTERACTIVE PORTFOLIO BY AKSHIT YADAV
            </p>
            <div
              className="world-invite-card"
              aria-label="Kraft invitation card with circle triangle and square"
            >
              <span>○ △ □</span>
              <small>AN INVITATION TO PLAY.</small>
            </div>
            <h1>
              Your story
              <br />
              starts here.
            </h1>
            <p>
              Walk into a world of curious work and familiar games.
              <br />
              Eight places. Three trials. One engineer.
            </p>
            {failed ? (
              <>
                <p>The 3D world couldn’t start on this device.</p>
                <a className="world-primary" href="/portfolio">
                  Open the portfolio ↗
                </a>
              </>
            ) : (
              <>
                <button
                  disabled={!ready}
                  className="world-primary"
                  onClick={enter}
                >
                  {ready ? "Enter the world ↗" : "Preparing your world…"}
                </button>
                <div className="world-invite-options">
                  <button onClick={changeSound} aria-pressed={sound}>
                    {sound ? "♫ Sound enabled" : "♫ Enable game sound"}
                  </button>
                  <a href="/portfolio">Just show me the work</a>
                </div>
                <small>
                  WASD TO WALK · DRAG TO LOOK · E TO INTERACT
                  <br />
                  Touch controls available on mobile
                </small>
              </>
            )}
          </div>
        </Modal>
      )}
      {screen === "map" && !failed && (
        <Modal title="Compound map" close={enter}>
          <p className="world-kicker">
            FIELD GUIDE / {snapshot?.discovered.length ?? 0} OF 8 DISCOVERED
          </p>
          <h2>A world to wander.</h2>
          <p>
            Walk between locations, or choose a destination to travel there.
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
          <p>Your game is paused. Come back whenever you’re ready.</p>
          <button className="world-primary" onClick={enter}>
            Back to the world ↗
          </button>
          <div className="world-settings">
            <button onClick={changeSound}>
              {sound ? "Turn sound off" : "Turn sound on"}
            </button>
            <label>
              Music volume{" "}
              <input
                aria-label="Music volume"
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
            <a href="/portfolio">Read the full portfolio ↗</a>
          </div>
          <p className="world-help">
            WASD / arrows to walk · Drag to look · Scroll to zoom · Space to
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
          title={ZONES.find((z) => z.id === selected)?.name ?? "Player file"}
          close={enter}
        >
          <Dossier zone={selected} />
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
