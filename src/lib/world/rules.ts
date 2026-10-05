/** Browser-independent world layout, collision and spatial game rules. */
export type ZoneId =
  | "dormitory"
  | "career"
  | "projects"
  | "skills"
  | "red-light"
  | "mingle"
  | "jump-rope"
  | "contact";
export type GameId = "red-light" | "mingle" | "jump-rope";
export type Point = { x: number; z: number };
export type Body = Point & { y: number; vy: number; grounded: boolean };
export type Obstacle = {
  x: number;
  z: number;
  w: number;
  d: number;
  bottom: number;
  top: number;
};
export const ZONES: {
  id: ZoneId;
  name: string;
  subtitle: string;
  x: number;
  z: number;
  spawn: Point;
  yaw: number;
  game?: GameId;
}[] = [
  {
    id: "dormitory",
    name: "The dormitory",
    subtitle: "Meet Akshit · player file",
    x: 0,
    z: 0,
    spawn: { x: 0, z: 7 },
    yaw: 0,
  },
  {
    id: "career",
    name: "The staircase",
    subtitle: "Experience · every level counts",
    x: 0,
    z: -24,
    spawn: { x: 0, z: -10 },
    yaw: 0,
  },
  {
    id: "projects",
    name: "The control room",
    subtitle: "Five projects · inspect the work",
    x: 25,
    z: -15,
    spawn: { x: 25, z: -8 },
    yaw: 0,
  },
  {
    id: "skills",
    name: "The equipment room",
    subtitle: "Skills · tools with evidence",
    x: 25,
    z: 13,
    spawn: { x: 25, z: 20 },
    yaw: 0,
  },
  {
    id: "red-light",
    name: "Red light, green light",
    subtitle: "Walk on green. Freeze on red.",
    x: -28,
    z: -22,
    spawn: { x: -28, z: -6 },
    yaw: 0,
    game: "red-light",
  },
  {
    id: "mingle",
    name: "The carousel",
    subtitle: "Hear the number. Find the room.",
    x: -28,
    z: 15,
    spawn: { x: -28, z: 28 },
    yaw: 0,
    game: "mingle",
  },
  {
    id: "jump-rope",
    name: "The sky bridge",
    subtitle: "Follow the rope. Time your jumps.",
    x: 0,
    z: 36,
    spawn: { x: 0, z: 51 },
    yaw: 0,
    game: "jump-rope",
  },
  {
    id: "contact",
    name: "The next chapter",
    subtitle: "Email · résumé · social links",
    x: 25,
    z: 38,
    spawn: { x: 25, z: 45 },
    yaw: 0,
  },
];
export const POIS: {
  zone: ZoneId;
  x: number;
  z: number;
  y: number;
  title: string;
}[] = [
  { zone: "dormitory", x: 0, z: 0, y: 0, title: "Open player file" },
  { zone: "career", x: 0, z: -24, y: 4.2, title: "Read the career chapters" },
  { zone: "projects", x: 25, z: -15, y: 0, title: "Inspect the project feeds" },
  { zone: "skills", x: 25, z: 13, y: 0, title: "Inspect the equipment" },
  {
    zone: "red-light",
    x: -28,
    z: -9,
    y: 0,
    title: "Enter Red Light, Green Light",
  },
  { zone: "mingle", x: -28, z: 25, y: 0, title: "Enter Mingle" },
  { zone: "jump-rope", x: 0, z: 49, y: 0, title: "Enter Jump Rope" },
  {
    zone: "contact",
    x: 25,
    z: 38,
    y: 0,
    title: "Let’s build something together",
  },
];
export const MINGLE_ROOMS = [
  { count: 2, x: -35, z: 9 },
  { count: 3, x: -21, z: 9 },
  { count: 4, x: -35, z: 21 },
  { count: 5, x: -21, z: 21 },
];
export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
export function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
export function groundAt(x: number, z: number): number {
  // Career staircase: a ramp under the visible steps, with a raised landing.
  if (Math.abs(x) < 2.5 && z <= -10 && z >= -27)
    return z < -22 ? 4.2 : ((-10 - z) / 12) * 4.2;
  // Bridge access ramp, deck, and pit. The rest of the compound is level.
  if (Math.abs(x) < 1.9 && z >= 46 && z <= 51) return ((51 - z) / 5) * 2;
  if (Math.abs(x) < 1.9 && z >= 27 && z < 46) return 2;
  if (Math.abs(x) < 5 && z > 27 && z < 46) return -4;
  return 0;
}
export const PLAYER_RADIUS = 0.32;
export const PLAYER_HEIGHT = 1.85;
function overlaps(x: number, z: number, o: Obstacle) {
  const nx = clamp(x, o.x - o.w / 2, o.x + o.w / 2);
  const nz = clamp(z, o.z - o.d / 2, o.z + o.d / 2);
  return (x - nx) ** 2 + (z - nz) ** 2 < PLAYER_RADIUS ** 2 - 1e-8;
}
export function moveBody(
  body: Body,
  dx: number,
  dz: number,
  dt: number,
  obstacles: Obstacle[],
  jump = false,
): Body {
  const next = { ...body };
  const wasGrounded = body.grounded;
  if (jump && next.grounded) {
    next.vy = 6.2;
    next.grounded = false;
  }
  const step = next.grounded ? 0.32 : 0.015;
  const blocked = (x: number, z: number) =>
    obstacles.some(
      (o) =>
        overlaps(x, z, o) &&
        next.y + PLAYER_HEIGHT > o.bottom + 0.001 &&
        next.y + step < o.top - 0.001,
    );
  const support = (x: number, z: number) => {
    let floor = groundAt(x, z);
    for (const o of obstacles)
      if (overlaps(x, z, o) && o.top <= next.y + step + 0.001)
        floor = Math.max(floor, o.top);
    return floor;
  };
  // Subdivide displacement so a sprint or a delayed frame cannot cross a thin wall.
  const slices = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.1));
  for (let i = 0; i < slices; i++) {
    const x = clamp(next.x + dx / slices, -43, 43);
    if (!blocked(x, next.z) && support(x, next.z) <= next.y + step) next.x = x;
    const z = clamp(next.z + dz / slices, -43, 54);
    if (!blocked(next.x, z) && support(next.x, z) <= next.y + step) next.z = z;
    if (next.grounded) {
      const floor = support(next.x, next.z);
      if (Math.abs(floor - next.y) <= 0.32) next.y = floor;
    }
  }
  let floor = support(next.x, next.z);
  const oldY = next.y;
  next.vy = Math.max(-22, next.vy - 17 * dt);
  next.y += next.vy * dt;
  for (const o of obstacles) {
    if (!overlaps(next.x, next.z, o)) continue;
    if (
      next.vy > 0 &&
      oldY + PLAYER_HEIGHT <= o.bottom + 0.001 &&
      next.y + PLAYER_HEIGHT >= o.bottom
    ) {
      next.y = o.bottom - PLAYER_HEIGHT;
      next.vy = 0;
    }
    if (next.vy <= 0 && oldY >= o.top - 0.001 && next.y <= o.top)
      floor = Math.max(floor, o.top);
  }
  if (
    next.y <= floor ||
    (wasGrounded && !jump && next.vy <= 0 && oldY - floor <= 0.2)
  ) {
    next.y = floor;
    next.vy = 0;
    next.grounded = true;
  } else next.grounded = false;
  return next;
}
export type Motion = {
  vx: number;
  vz: number;
  coyote: number;
  buffer: number;
  impact: number;
};
export function createMotion(): Motion {
  return { vx: 0, vz: 0, coyote: 0, buffer: 0, impact: 0 };
}
/** Ground acceleration, braking, limited air steering, jump buffering and coyote time. */
export function stepMotion(
  body: Body,
  motion: Motion,
  input: {
    x: number;
    z: number;
    speed: number;
    jump: boolean;
    brake?: boolean;
  },
  dt: number,
  obstacles: Obstacle[],
) {
  const next = { ...motion, impact: 0 };
  next.coyote = body.grounded ? 0.09 : Math.max(0, next.coyote - dt);
  next.buffer = input.jump ? 0.12 : Math.max(0, next.buffer - dt);
  const magnitude = Math.hypot(input.x, input.z);
  const scale = input.speed / Math.max(1, magnitude);
  const tx = input.x * scale,
    tz = input.z * scale;
  const change = Math.hypot(tx - next.vx, tz - next.vz);
  const acceleration = body.grounded ? (magnitude > 0.01 ? 30 : 42) : 10;
  const ratio = change > 0 ? Math.min(1, (acceleration * dt) / change) : 0;
  next.vx += (tx - next.vx) * ratio;
  next.vz += (tz - next.vz) * ratio;
  if (input.brake) {
    next.vx = 0;
    next.vz = 0;
    next.buffer = 0;
  }
  const jumping = next.buffer > 0 && next.coyote > 0;
  if (jumping) {
    next.buffer = 0;
    next.coyote = 0;
  }
  const updated = moveBody(
    jumping ? { ...body, grounded: true } : body,
    next.vx * dt,
    next.vz * dt,
    dt,
    obstacles,
    jumping,
  );
  if (Math.abs(updated.x - body.x - next.vx * dt) > 0.001) next.vx = 0;
  if (Math.abs(updated.z - body.z - next.vz * dt) > 0.001) next.vz = 0;
  if (!body.grounded && updated.grounded) next.impact = Math.abs(body.vy);
  return { body: updated, motion: next };
}
export type SpatialTrial = {
  kind: GameId;
  status: "playing" | "won" | "lost";
  phase: "green" | "warning" | "red" | "spinning" | "choose" | "rope";
  elapsed: number;
  phaseTime: number;
  round: number;
  target: number;
  progress: number;
  nextCrossing: number;
  message: string;
};
export function startSpatialTrial(kind: GameId): SpatialTrial {
  return {
    kind,
    status: "playing",
    phase:
      kind === "red-light" ? "green" : kind === "mingle" ? "spinning" : "rope",
    elapsed: 0,
    phaseTime: 0,
    round: 0,
    target: 3,
    progress: 0,
    nextCrossing: 3.6,
    message:
      kind === "red-light"
        ? "Walk to the finish on green. Release movement when she turns."
        : kind === "mingle"
          ? "Stay on the carousel. When the music stops, walk into the numbered room."
          : "Follow the glowing marker. Jump just before the rope reaches you.",
  };
}
export function ropeZ(round: number) {
  return 42 - round * 3;
}
export function stepSpatialTrial(
  state: SpatialTrial,
  delta: number,
  body: Body,
  moved: number,
): SpatialTrial {
  if (state.status !== "playing") return state;
  const dt = clamp(delta, 0, 0.05),
    next = {
      ...state,
      elapsed: state.elapsed + dt,
      phaseTime: state.phaseTime + dt,
    };
  if (next.elapsed > 65)
    return {
      ...next,
      status: "lost",
      message: "Time’s up. Your next attempt is waiting.",
    };
  if (state.kind === "red-light") {
    next.progress = clamp((-11 - body.z) / 23, 0, 1);
    if (state.phase === "red" && moved > 0.005)
      return {
        ...next,
        status: "lost",
        message: "Movement detected. Freeze completely when the light is red.",
      };
    if (next.progress >= 1)
      return {
        ...next,
        status: "won",
        message: "Across the line. Well played, 370.",
      };
    if (
      state.phase === "green" &&
      next.phaseTime > 3.4 + (state.round % 2) * 0.5
    )
      return {
        ...next,
        phase: "warning",
        phaseTime: 0,
        message: "She’s turning. Stop now!",
      };
    if (state.phase === "warning" && next.phaseTime > 0.8)
      return {
        ...next,
        phase: "red",
        phaseTime: 0,
        message: "Red light. Don’t move.",
      };
    if (state.phase === "red" && next.phaseTime > 2)
      return {
        ...next,
        phase: "green",
        phaseTime: 0,
        round: state.round + 1,
        message: "Green light. Go!",
      };
  } else if (state.kind === "mingle") {
    if (state.phase === "spinning" && next.phaseTime > 4.5)
      return {
        ...next,
        phase: "choose",
        phaseTime: 0,
        message: `A room for ${state.target}. Walk through the door marked ${state.target}.`,
      };
    if (state.phase === "choose") {
      const room = MINGLE_ROOMS.find((r) => distance(body, r) < 1.55);
      if (room) {
        if (room.count !== state.target)
          return {
            ...next,
            status: "lost",
            message: `That room holds ${room.count}. You needed ${state.target}. Try another round.`,
          };
        const round = state.round + 1;
        return {
          ...next,
          round,
          progress: round / 3,
          target: [3, 2, 4][round] ?? 4,
          status: round === 3 ? "won" : "playing",
          phase: "spinning",
          phaseTime: 0,
          message:
            round === 3
              ? "Three rooms. Your whole team made it."
              : "The doors open. Back to the carousel!",
        };
      }
      if (next.phaseTime > 10)
        return {
          ...next,
          status: "lost",
          message: "The doors closed. Follow the numbered marker next time.",
        };
    }
  } else if (next.elapsed >= state.nextCrossing) {
    if (Math.abs(body.z - ropeZ(state.round)) > 1.6)
      return {
        ...next,
        status: "lost",
        message: "Move to the glowing marker before the rope arrives.",
      };
    if (body.y - groundAt(body.x, body.z) < 0.32)
      return {
        ...next,
        status: "lost",
        message:
          "The rope caught you. Jump just before the countdown reaches zero.",
      };
    const round = state.round + 1;
    return {
      ...next,
      round,
      progress: round / 5,
      nextCrossing: state.nextCrossing + 3.6,
      status: round === 5 ? "won" : "playing",
      message:
        round === 5
          ? "Five clean jumps. You made it across."
          : "Nice jump. Walk to the next glowing marker.",
    };
  }
  return next;
}
