"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  advanceTrial,
  createTrial,
  jump,
  lockRoom,
  pauseTrial,
  resumeTrial,
  startTrial,
  togglePlayer,
  TRIAL_DURATION,
  type Trial,
  type TrialState,
} from "@/lib/trials-engine";
import TrialScene from "./TrialScene";
import { useTrialAudio } from "./TrialAudio";

const games: {
  kind: Trial;
  name: string;
  symbol: string;
  description: string;
  instruction: string;
}[] = [
  {
    kind: "red-light",
    name: "Red light. Green light.",
    symbol: "○",
    description: "A familiar playground. A very particular set of rules.",
    instruction:
      "Hold the move button (or Space) on green. Release when the doll starts turning. Reach the line before 35 seconds.",
  },
  {
    kind: "mingle",
    name: "Mingle.",
    symbol: "△",
    description: "A little music. A little chaos. Find your people.",
    instruction:
      "When the carousel stops, select exactly the announced number of players and enter the room. Clear three rooms.",
  },
  {
    kind: "jump-rope",
    name: "Jump rope.",
    symbol: "□",
    description: "Take a breath. Find the rhythm. Make the leap.",
    instruction:
      "Tap Jump (or Space) just before the rope reaches you. Watch the countdown and clear five jumps. The timing window is generous.",
  },
];

export default function GameArena() {
  const [kind, setKind] = useState<Trial>("red-light");
  const [hud, setHud] = useState(() => createTrial("red-light"));
  const [cleared, setCleared] = useState<Trial[]>([]);
  const stateRef = useRef<TrialState>(createTrial("red-light"));
  const moving = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const { cue, setCarousel } = useTrialAudio();
  const game = games.find((item) => item.kind === kind)!;

  const publish = useCallback(
    (next: TrialState) => {
      const old = stateRef.current;
      stateRef.current = next;
      if (next.status === "won" && old.status !== "won") {
        cue("win");
        setCleared((items) =>
          items.includes(next.kind) ? items : [...items, next.kind],
        );
      } else if (next.status === "lost" && old.status !== "lost") cue("lose");
      else if (next.phase !== old.phase && next.status === "playing") {
        if (
          next.phase === "green" ||
          next.phase === "warning" ||
          next.phase === "red"
        )
          cue(next.phase);
        else if (next.phase === "choose") cue("room");
      }
      setHud(next);
    },
    [cue],
  );

  const pause = useCallback(() => {
    moving.current = false;
    publish(pauseTrial(stateRef.current));
  }, [publish]);
  useEffect(() => {
    let frame = 0,
      previous = performance.now(),
      lastHud = 0,
      cancelled = false;
    const tick = (now: number) => {
      if (cancelled) return;
      const current = stateRef.current;
      const next = advanceTrial(
        current,
        (now - previous) / 1000,
        moving.current,
      );
      previous = now;
      if (next !== current) {
        if (
          now - lastHud > 60 ||
          next.phase !== current.phase ||
          next.status !== current.status ||
          next.round !== current.round
        ) {
          publish(next);
          lastHud = now;
        } else stateRef.current = next;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const release = () => {
      moving.current = false;
    };
    const keyup = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "Enter") release();
    };
    const hidden = () => {
      if (document.hidden) pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) pause();
      },
      { threshold: 0.2 },
    );
    if (panel.current) observer.observe(panel.current);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [pause, publish]);

  useEffect(() => {
    setCarousel(
      hud.kind === "mingle" &&
        hud.status === "playing" &&
        hud.phase === "spinning",
    );
    return () => setCarousel(false);
  }, [hud.kind, hud.phase, hud.status, setCarousel]);

  const selectGame = (next: Trial) => {
    moving.current = false;
    setKind(next);
    publish(createTrial(next));
  };
  const doJump = () => {
    const next = jump(stateRef.current);
    if (next !== stateRef.current) {
      publish(next);
      cue("jump");
    }
  };
  const focusControls = () => {
    requestAnimationFrame(() => {
      panel.current
        ?.querySelector<HTMLButtonElement>("[data-game-action]")
        ?.focus({ preventScroll: true });
    });
  };
  const isActive = hud.status === "playing";
  const eta = Math.max(0, hud.nextRope - hud.elapsed);
  const signal =
    kind === "red-light"
      ? hud.phase === "green"
        ? "GREEN LIGHT"
        : hud.phase === "warning"
          ? "RELEASE NOW"
          : hud.phase === "red"
            ? "RED LIGHT"
            : "READY WHEN YOU ARE"
      : kind === "mingle"
        ? hud.phase === "choose"
          ? `A ROOM FOR ${hud.target}`
          : "ROUND AND ROUND"
        : isActive && eta < 0.7
          ? "JUMP NOW"
          : "FIND YOUR RHYTHM";

  return (
    <div className="game-arena" ref={panel}>
      <div className="game-tabs" aria-label="Choose a mini-game">
        {games.map((item, i) => (
          <button
            type="button"
            key={item.kind}
            aria-pressed={kind === item.kind}
            onClick={() => selectGame(item.kind)}
          >
            <span>{item.symbol}</span>
            <div>
              <small>ROUND 0{i + 1}</small>
              {item.name}
            </div>
            {cleared.includes(item.kind) && <b aria-label="Round cleared">✓</b>}
          </button>
        ))}
      </div>
      <div className={`arena-body phase-${hud.phase}`}>
        <div className="arena-stage">
          <div className="arena-topline">
            <span>
              <i />
              LIVE FROM THE PLAYGROUND
            </span>
            <span>PLAYER 370</span>
          </div>
          <TrialScene key={kind} kind={kind} stateRef={stateRef} />
          <div className="arena-scene-bottom">
            <span>YOUR PROGRESS</span>
            <div
              className="arena-progress"
              role="progressbar"
              aria-label="Round progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(hud.progress * 100)}
            >
              <i style={{ width: `${hud.progress * 100}%` }} />
            </div>
            <span>{Math.round(hud.progress * 100)}%</span>
          </div>
        </div>
        <div className="arena-console">
          <p className="trial-eyebrow">THE RULES ARE SIMPLE</p>
          <h3>{game.name}</h3>
          <p>{game.instruction}</p>
          <div className="arena-readout">
            <div>
              <small>TIME REMAINING</small>
              <strong>
                00:
                {String(Math.ceil(TRIAL_DURATION - hud.elapsed)).padStart(
                  2,
                  "0",
                )}
              </strong>
            </div>
            <div>
              <small>{kind === "red-light" ? "DISTANCE" : "CLEARED"}</small>
              <strong>
                {kind === "red-light"
                  ? `${Math.round(hud.progress * 100)}%`
                  : `${hud.round} / ${kind === "mingle" ? 3 : 5}`}
              </strong>
            </div>
          </div>
          <div className="arena-signal">
            <i />
            <span>
              {hud.status === "paused"
                ? "ROUND PAUSED"
                : hud.status === "won"
                  ? "ROUND CLEARED"
                  : hud.status === "lost"
                    ? "ANOTHER CHANCE?"
                    : signal}
            </span>
          </div>
          <p className="arena-message" role="status" aria-live="polite">
            {hud.message}
          </p>
          {kind === "mingle" && isActive && hud.phase === "choose" && (
            <div className="mingle-choices">
              <div
                className="mingle-players"
                aria-label={`Choose ${hud.target} players`}
              >
                {[0, 1, 2, 3, 4].map((id) => (
                  <button
                    type="button"
                    key={id}
                    aria-label={`Player ${id + 1}`}
                    aria-pressed={hud.selected.includes(id)}
                    onClick={() => publish(togglePlayer(stateRef.current, id))}
                  >
                    <span aria-hidden="true">♟</span>
                    <small>00{id + 1}</small>
                  </button>
                ))}
              </div>
              <button
                className="trial-button pink-button"
                type="button"
                onClick={() => publish(lockRoom(stateRef.current))}
              >
                Enter room · {hud.selected.length} selected →
              </button>
            </div>
          )}
          {isActive && kind === "red-light" && (
            <button
              type="button"
              className="trial-button hold-button"
              data-game-action
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.focus();
                event.currentTarget.setPointerCapture(event.pointerId);
                moving.current = true;
              }}
              onPointerUp={() => {
                moving.current = false;
              }}
              onPointerCancel={() => {
                moving.current = false;
              }}
              onLostPointerCapture={() => {
                moving.current = false;
              }}
              onBlur={() => {
                moving.current = false;
              }}
              onKeyDown={(event) => {
                if (event.code === "Space" || event.code === "Enter") {
                  event.preventDefault();
                  moving.current = true;
                }
              }}
              onKeyUp={(event) => {
                if (event.code === "Space" || event.code === "Enter") {
                  event.preventDefault();
                  moving.current = false;
                }
              }}
            >
              Hold to move <span>SPACE</span>
            </button>
          )}
          {isActive && kind === "jump-rope" && (
            <>
              <div className="rope-timing">
                <span>ROPE ARRIVES IN</span>
                <strong>{eta.toFixed(1)}s</strong>
              </div>
              <button
                type="button"
                className="trial-button pink-button"
                onClick={doJump}
                data-game-action
                onKeyDown={(event) => {
                  if (event.code === "Space" || event.code === "Enter") {
                    event.preventDefault();
                    if (!event.repeat) doJump();
                  }
                }}
              >
                Jump <span>SPACE</span>
              </button>
            </>
          )}
          {(hud.status === "ready" ||
            hud.status === "lost" ||
            hud.status === "won") && (
            <button
              className="trial-button pink-button"
              type="button"
              onClick={() => {
                moving.current = false;
                publish(startTrial(kind));
                cue("start");
                focusControls();
              }}
            >
              {hud.status === "ready" ? "Start the round" : "Play again"}
              <span>→</span>
            </button>
          )}
          {hud.status === "paused" && (
            <button
              type="button"
              className="trial-button pink-button"
              onClick={() => {
                publish(resumeTrial(stateRef.current));
                focusControls();
              }}
            >
              Resume round <span>→</span>
            </button>
          )}
          {isActive && (
            <button type="button" className="pause-round" onClick={pause}>
              Ⅱ Pause round
            </button>
          )}
          <a className="skip-game" href="#projects" onClick={pause}>
            Just here for the work? Skip the games ↗
          </a>
        </div>
      </div>
      <div className="arena-footnote">
        <span>NO ELIMINATIONS. JUST SECOND CHANCES.</span>
        <span>{cleared.length} / 3 ROUNDS CLEARED</span>
      </div>
    </div>
  );
}
