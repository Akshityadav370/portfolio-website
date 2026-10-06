/** Deterministic, frame-rate independent rules. No DOM or audio dependencies. */
export type Trial = "red-light" | "mingle" | "jump-rope";
export type TrialStatus = "ready" | "playing" | "paused" | "won" | "lost";
export type TrialPhase =
  "ready" | "green" | "warning" | "red" | "spinning" | "choose" | "jump";
export type TrialState = {
  kind: Trial;
  status: TrialStatus;
  phase: TrialPhase;
  elapsed: number;
  progress: number;
  round: number;
  phaseTime: number;
  target: number;
  selected: number[];
  jumpAt: number;
  nextRope: number;
  message: string;
};

export const TRIAL_DURATION = 35;
export function createTrial(kind: Trial): TrialState {
  return {
    kind,
    status: "ready",
    phase: "ready",
    elapsed: 0,
    progress: 0,
    round: 0,
    phaseTime: 0,
    target: 3,
    selected: [],
    jumpAt: -10,
    nextRope: 3.2,
    message: "Your round is waiting.",
  };
}
export function startTrial(kind: Trial): TrialState {
  return {
    ...createTrial(kind),
    status: "playing",
    phase:
      kind === "red-light" ? "green" : kind === "mingle" ? "spinning" : "jump",
    message:
      kind === "red-light"
        ? "Green light. Keep moving."
        : kind === "mingle"
          ? "The carousel is turning…"
          : "Watch the rope. Jump just before it arrives.",
  };
}
export function pauseTrial(state: TrialState): TrialState {
  return state.status === "playing"
    ? {
        ...state,
        status: "paused",
        message: "Take your time. The round is paused.",
      }
    : state;
}
export function resumeTrial(state: TrialState): TrialState {
  return state.status === "paused"
    ? {
        ...state,
        status: "playing",
        message:
          state.kind === "red-light"
            ? state.phase === "green"
              ? "Green light. Keep moving."
              : "Stay still. Wait for green."
            : state.kind === "mingle"
              ? state.phase === "choose"
                ? `Choose exactly ${state.target} players.`
                : "The carousel is turning…"
              : "Watch the rope. Jump just before it arrives.",
      }
    : state;
}
export function jump(state: TrialState): TrialState {
  return state.kind === "jump-rope" &&
    state.status === "playing" &&
    state.elapsed - state.jumpAt >= 0.85
    ? { ...state, jumpAt: state.elapsed }
    : state;
}
export function togglePlayer(state: TrialState, player: number): TrialState {
  if (
    state.kind !== "mingle" ||
    state.status !== "playing" ||
    state.phase !== "choose"
  )
    return state;
  return {
    ...state,
    selected: state.selected.includes(player)
      ? state.selected.filter((id) => id !== player)
      : [...state.selected, player],
  };
}
export function lockRoom(state: TrialState): TrialState {
  if (
    state.kind !== "mingle" ||
    state.status !== "playing" ||
    state.phase !== "choose"
  )
    return state;
  if (state.selected.length !== state.target)
    return {
      ...state,
      status: "lost",
      message: `The room needed ${state.target} players. Another round?`,
    };
  const round = state.round + 1;
  return {
    ...state,
    round,
    progress: round / 3,
    status: round === 3 ? "won" : "playing",
    phase: "spinning",
    phaseTime: 0,
    selected: [],
    target: [3, 2, 4][round] ?? 4,
    message:
      round === 3
        ? "Three rooms. Perfect company. Round cleared."
        : "Everyone made it. Back to the carousel.",
  };
}

export function advanceTrial(
  state: TrialState,
  delta: number,
  moving = false,
): TrialState {
  if (state.status !== "playing" || delta <= 0) return state;
  // Long stalls pause time rather than skipping an entire gameplay cue.
  const dt = Math.min(delta, 0.1);
  const next = {
    ...state,
    elapsed: state.elapsed + dt,
    phaseTime: state.phaseTime + dt,
  };
  if (next.elapsed >= TRIAL_DURATION)
    return {
      ...next,
      status: "lost",
      message: "Time’s up. There’s always another round.",
    };
  if (state.kind === "red-light") {
    if (state.phase === "green") {
      if (moving) next.progress = Math.min(1, state.progress + dt / 9);
      if (next.progress >= 1)
        return {
          ...next,
          status: "won",
          message: "Across the line. Round cleared, player.",
        };
      if (next.phaseTime >= 2.4 + (state.round % 3) * 0.35)
        return {
          ...next,
          phase: "warning",
          phaseTime: 0,
          message: "Turning around. Release now!",
        };
    } else if (state.phase === "warning" && next.phaseTime >= 0.65) {
      return {
        ...next,
        phase: "red",
        phaseTime: 0,
        message: "Red light. Stay perfectly still.",
      };
    } else if (state.phase === "red") {
      // The warning is the reaction window. Inputs during red lose the round.
      if (moving)
        return {
          ...next,
          status: "lost",
          message: "Movement detected. Take a breath and try again.",
        };
      if (next.phaseTime >= 1.55)
        return {
          ...next,
          phase: "green",
          phaseTime: 0,
          round: state.round + 1,
          message: "Green light. Keep moving.",
        };
    }
  } else if (state.kind === "mingle") {
    if (state.phase === "spinning" && next.phaseTime >= 3.4)
      return {
        ...next,
        phase: "choose",
        phaseTime: 0,
        message: `A room for ${state.target}. Select exactly ${state.target} players, then enter.`,
      };
    if (state.phase === "choose" && next.phaseTime >= 6.5)
      return {
        ...next,
        status: "lost",
        message: "The doors closed. Let’s give it another spin.",
      };
  } else if (next.elapsed >= state.nextRope) {
    const jumpAge = state.nextRope - state.jumpAt;
    if (jumpAge < 0.08 || jumpAge > 0.72)
      return {
        ...next,
        status: "lost",
        message:
          "The rope caught you. Try jumping a little before it reaches you.",
      };
    const round = state.round + 1;
    return {
      ...next,
      round,
      progress: round / 5,
      nextRope: state.nextRope + 2.5,
      status: round === 5 ? "won" : "playing",
      message:
        round === 5
          ? "Five clean jumps. Round cleared."
          : `${round} of 5. Find your rhythm.`,
    };
  }
  return next;
}
