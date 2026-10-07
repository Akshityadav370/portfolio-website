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
// Connected paths shared by the scenery and maps; junctions stay outside walls.
export const WORLD_PATHS: {
  points: [number, number][];
  district: "work" | "games" | "shared";
}[] = [
  {
    points: [
      [0, -10],
      [0, 10],
    ],
    district: "shared",
  },
  {
    points: [
      [-12, 10],
      [12, 10],
    ],
    district: "shared",
  },
  {
    points: [
      [12, -8],
      [12, 49],
      [0, 49],
    ],
    district: "work",
  },
  {
    points: [
      [0, -8],
      [25, -8],
      [25, -12],
    ],
    district: "work",
  },
  {
    points: [
      [12, 23],
      [25, 23],
      [25, 20],
    ],
    district: "work",
  },
  {
    points: [
      [12, 45],
      [33, 45],
    ],
    district: "work",
  },
  {
    points: [
      [25, 45],
      [25, 41],
    ],
    district: "work",
  },
  {
    points: [
      [-12, -4],
      [-12, 49],
      [0, 49],
    ],
    district: "games",
  },
  {
    points: [
      [-12, -4],
      [-28, -4],
      [-28, -9],
    ],
    district: "games",
  },
  {
    points: [
      [-12, 29],
      [-28, 29],
      [-28, 25],
    ],
    district: "games",
  },
];
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
    name: "Base Camp",
    subtitle: "About me · meet the builder behind the keyboard",
    x: 0,
    z: 0,
    spawn: { x: 0, z: 7 },
    yaw: 0,
  },
  {
    id: "career",
    name: "Level-Up Log",
    subtitle: "Experience · lessons earned, one role at a time",
    x: 0,
    z: -24,
    spawn: { x: 0, z: -10 },
    yaw: 0,
  },
  {
    id: "projects",
    name: "Build Lab",
    subtitle: "Projects · ideas that made it out of my head",
    x: 25,
    z: -15,
    spawn: { x: 25, z: -8 },
    yaw: 0,
  },
  {
    id: "skills",
    name: "Toolkit",
    subtitle: "Skills · the tools I turn to when things get interesting",
    x: 25,
    z: 13,
    spawn: { x: 25, z: 20 },
    yaw: 0,
  },
  {
    id: "red-light",
    name: "Red Light, Green Light",
    subtitle: "Walk on green. Freeze on red.",
    x: -28,
    z: -22,
    spawn: { x: -28, z: -6 },
    yaw: 0,
    game: "red-light",
  },
  {
    id: "mingle",
    name: "Mingle",
    subtitle: "Hear the number. Find the room.",
    x: -28,
    z: 15,
    spawn: { x: -28, z: 28 },
    yaw: 0,
    game: "mingle",
  },
  {
    id: "jump-rope",
    name: "Jump Rope",
    subtitle: "Follow the rope. Time your jumps.",
    x: 0,
    z: 36,
    spawn: { x: 0, z: 51 },
    yaw: 0,
    game: "jump-rope",
  },
  {
    id: "contact",
    name: "Let’s Talk",
    subtitle: "Contact · good conversations start with hello",
    x: 25,
    z: 38,
    spawn: { x: 25, z: 45 },
    yaw: 0,
  },
];
/** Shared by map headings, dossier labels, and physical wayfinding signs. */
export function zoneLabel(id: ZoneId) {
  const index = ZONES.findIndex((zone) => zone.id === id);
  return (
    String(index + 1).padStart(2, "0") + " / " + ZONES[index].name.toUpperCase()
  );
}
export const POIS: {
  zone: ZoneId;
  x: number;
  z: number;
  y: number;
  title: string;
}[] = [
  { zone: "dormitory", x: 0, z: 0, y: 0, title: "Meet Akshit" },
  { zone: "career", x: 0, z: -24, y: 4.2, title: "Explore my experience" },
  { zone: "projects", x: 25, z: -15, y: 0, title: "Explore my projects" },
  { zone: "skills", x: 25, z: 13, y: 0, title: "Explore my skills" },
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
  const carouselRadius = Math.hypot(x + 28, z - 15);
  if (carouselRadius < 5.8) return 0.22;
  if (carouselRadius < 10.4) return 0.08;
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
/** Adapted from Sketchbook FunctionLibrary.spring (MIT, swift502).
 * See public/licenses/Sketchbook-MIT.txt and docs/sketchbook-physics.md.
 * Sketchbook integrates a spring per fixed frame; these coefficients are tuned for 120 Hz.
 */
export function springStep(
  position: number,
  target: number,
  velocity: number,
  mass: number,
  damping: number,
  dt: number,
) {
  const steps = Math.max(1, Math.ceil(dt * 120));
  const h = (dt * 120) / steps;
  for (let i = 0; i < steps; i++) {
    velocity += ((target - position) / mass) * h;
    velocity *= Math.pow(damping, h);
    position += velocity * h;
  }
  return { position, velocity };
}
export const PHYSICS_STEP = 1 / 120;
/** Fixed physics clock, based on Sketchbook SimulatorBase's accumulator/cache pattern. */
export function advancePhysics(
  remainder: number,
  delta: number,
  step: (dt: number) => void,
) {
  let pending = remainder + clamp(delta, 0, 0.15),
    count = 0;
  while (pending + 1e-10 >= PHYSICS_STEP && count < 18) {
    step(PHYSICS_STEP);
    pending = Math.max(0, pending - PHYSICS_STEP);
    count++;
  }
  return {
    remainder: pending,
    alpha: clamp(pending / PHYSICS_STEP, 0, 1),
    steps: count,
  };
}
export type Locomotion = "idle" | "walk" | "run" | "jump" | "fall" | "land";
export type MovingSurface = {
  x: number;
  z: number;
  radius: number;
  speed: number;
};
/** Surface velocity at a contact point: angular velocity cross relative position. */
export function surfaceVelocity(body: Point, surface?: MovingSurface): Point {
  if (!surface || distance(body, surface) > surface.radius)
    return { x: 0, z: 0 };
  return {
    x: surface.speed * (body.z - surface.z),
    z: -surface.speed * (body.x - surface.x),
  };
}
export type Motion = {
  vx: number;
  vz: number;
  coyote: number;
  buffer: number;
  impact: number;
  ax: number;
  az: number;
  state: Locomotion;
  recovery: number;
  supportX: number;
  supportZ: number;
};
export function createMotion(): Motion {
  return {
    vx: 0,
    vz: 0,
    coyote: 0,
    buffer: 0,
    impact: 0,
    ax: 0,
    az: 0,
    state: "idle",
    recovery: 0,
    supportX: 0,
    supportZ: 0,
  };
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
    surface?: MovingSurface;
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
  if (body.grounded) {
    const moving = magnitude > 0.01;
    const sx = springStep(
      next.vx,
      tx,
      next.ax,
      moving ? 18 : 5,
      moving ? 0.55 : 0.45,
      dt,
    );
    const sz = springStep(
      next.vz,
      tz,
      next.az,
      moving ? 18 : 5,
      moving ? 0.55 : 0.45,
      dt,
    );
    next.vx = sx.position;
    next.ax = sx.velocity;
    next.vz = sz.position;
    next.az = sz.velocity;
    if (!moving && Math.hypot(next.vx, next.vz) < 0.015) {
      next.vx = next.vz = next.ax = next.az = 0;
    }
  } else {
    // Like Sketchbook's Falling state: preserve takeoff momentum, add limited steering.
    const maximum = Math.max(input.speed, Math.hypot(next.vx, next.vz));
    next.vx =
      next.vx * Math.exp(-0.08 * dt) +
      (input.x / Math.max(1, magnitude)) * 4 * dt;
    next.vz =
      next.vz * Math.exp(-0.08 * dt) +
      (input.z / Math.max(1, magnitude)) * 4 * dt;
    const speed = Math.hypot(next.vx, next.vz);
    if (speed > maximum) {
      next.vx *= maximum / speed;
      next.vz *= maximum / speed;
    }
    next.ax = next.az = 0;
  }
  if (input.brake) {
    next.vx = next.ax = 0;
    next.vz = next.az = 0;
    next.buffer = 0;
  }
  const jumping = next.buffer > 0 && next.coyote > 0;
  if (jumping) {
    next.buffer = 0;
    next.coyote = 0;
  }
  const surface = body.grounded
    ? surfaceVelocity(body, input.surface)
    : { x: 0, z: 0 };
  // Keep running speed consistent along slopes instead of adding free vertical speed.
  const gx =
    (groundAt(body.x + 0.05, body.z) - groundAt(body.x - 0.05, body.z)) / 0.1;
  const gz =
    (groundAt(body.x, body.z + 0.05) - groundAt(body.x, body.z - 0.05)) / 0.1;
  const horizontal = Math.hypot(next.vx, next.vz);
  const rise = gx * next.vx + gz * next.vz;
  const slopeScale =
    body.grounded && Math.abs(gx) < 1 && Math.abs(gz) < 1 && horizontal > 0.01
      ? horizontal / Math.hypot(horizontal, rise)
      : 1;
  if (jumping) {
    next.vx += surface.x;
    next.vz += surface.z;
  }
  const carryX = jumping ? 0 : surface.x,
    carryZ = jumping ? 0 : surface.z;
  const dx = (next.vx * slopeScale + carryX) * dt,
    dz = (next.vz * slopeScale + carryZ) * dt;
  const updated = moveBody(
    jumping ? { ...body, grounded: true } : body,
    dx,
    dz,
    dt,
    obstacles,
    jumping,
  );
  if (Math.abs(updated.x - body.x - dx) > 0.001) {
    next.vx = 0;
    next.ax = 0;
  }
  if (Math.abs(updated.z - body.z - dz) > 0.001) {
    next.vz = 0;
    next.az = 0;
  }
  next.recovery = Math.max(0, next.recovery - dt);
  if (!body.grounded && updated.grounded) {
    next.impact = Math.abs(body.vy);
    next.recovery = next.impact > 9 ? 0.26 : 0.1;
    // Once grounded, remove the inherited platform component before applying it anew.
    const contact = surfaceVelocity(updated, input.surface);
    next.vx -= contact.x;
    next.vz -= contact.z;
    next.supportX = next.supportZ = 0;
  }
  if (jumping) {
    next.supportX = surface.x;
    next.supportZ = surface.z;
  } else if (body.grounded && !updated.grounded) {
    next.vx += surface.x;
    next.vz += surface.z;
    next.supportX = surface.x;
    next.supportZ = surface.z;
  }
  next.state = !updated.grounded
    ? updated.vy > 0
      ? "jump"
      : "fall"
    : next.recovery > 0
      ? "land"
      : Math.hypot(next.vx, next.vz) > 0.08
        ? Math.hypot(next.vx, next.vz) > 5
          ? "run"
          : "walk"
        : "idle";
  return { body: updated, motion: next };
}
export const RED_LIGHT_TIME_LIMIT = 45;
/** Seeded schedules keep tests reproducible; the browser supplies a fresh seed per attempt. */
export function redLightTiming(
  seed: number,
  phase: "green" | "warning" | "red",
) {
  let rng = seed >>> 0 || 0x370;
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  rng >>>= 0;
  const random = rng / 4294967296;
  const phaseDuration =
    phase === "green"
      ? 1 + random
      : phase === "warning"
        ? 0.85 + random * 0.2
        : 1 + random * 1.3;
  return { rng, phaseDuration };
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
  rng: number;
  phaseDuration: number;
};
export function startSpatialTrial(kind: GameId, seed = 0x370): SpatialTrial {
  return {
    kind,
    ...redLightTiming(seed, "green"),
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
        ? "45 seconds. Move on green. Stop when the red lamp lights up."
        : kind === "mingle"
          ? "Stay on the carousel. When the music stops, walk into the numbered room."
          : "Follow the glowing marker. Jump just before the rope reaches you.",
  };
}
export function ropeZ(round: number) {
  return 42 - round * 3;
}
export const ROPE_PERIOD = 3.6;
export const ROPE_RADIUS = 0.065;
export function ropeSag(x: number) {
  return -1.37 * (1 - (x / 3.3) ** 2);
}
export function ropeAngle(elapsed: number, crossing: number) {
  return ((elapsed - crossing) / ROPE_PERIOD) * Math.PI * 2;
}
export function eliminationDelay(kind?: GameId) {
  return kind === "mingle" || kind === "red-light" ? 1.4 : 0;
}
/** Sample the same rope curve used by the renderer against the player's vertical capsule. */
export function ropeTouchesPlayer(body: Body, round: number, angle: number) {
  for (let i = 0; i <= 80; i++) {
    const x = -3.3 + (6.6 * i) / 80;
    const sag = ropeSag(x);
    const y = 3.4 + sag * Math.cos(angle);
    const z = ropeZ(round) + sag * Math.sin(angle);
    const nearestY = clamp(
      y,
      body.y + PLAYER_RADIUS,
      body.y + PLAYER_HEIGHT - PLAYER_RADIUS,
    );
    if (
      Math.hypot(x - body.x, y - nearestY, z - body.z) <=
      PLAYER_RADIUS + ROPE_RADIUS + 0.01
    )
      return true;
  }
  return false;
}
export function stepSpatialTrial(
  state: SpatialTrial,
  delta: number,
  body: Body,
  moved: number,
  previousBody: Body = body,
): SpatialTrial {
  if (state.status !== "playing") return state;
  const dt = clamp(delta, 0, 0.05),
    next = {
      ...state,
      elapsed: state.elapsed + dt,
      phaseTime: state.phaseTime + dt,
    };
  if (
    state.kind !== "jump-rope" &&
    next.elapsed >= (state.kind === "red-light" ? RED_LIGHT_TIME_LIMIT : 65)
  )
    return {
      ...next,
      status: "lost",
      message: "Time’s up. Your next attempt is waiting.",
    };
  if (state.kind === "red-light") {
    next.progress = clamp((-11 - body.z) / 23, 0, 1);
    if (state.phase === "red" && moved > 0.0001)
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
    if (state.phaseTime + dt >= state.phaseDuration) {
      const phase =
        state.phase === "green"
          ? "warning"
          : state.phase === "warning"
            ? "red"
            : "green";
      return {
        ...next,
        ...redLightTiming(state.rng, phase),
        phase,
        phaseTime: 0,
        round: state.round + (phase === "green" ? 1 : 0),
        message:
          phase === "warning"
            ? "Red light! Stop while she turns toward you."
            : phase === "red"
              ? "She is watching. Hold still until the green light."
              : "Green light. Move! Her next turn is unpredictable.",
      };
    }
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
  } else {
    // Substeps also catch contact between rendered frames or during a fast jump.
    for (let i = 0; i <= 4; i++) {
      const fraction = i / 4;
      const sample = {
        ...body,
        x: previousBody.x + (body.x - previousBody.x) * fraction,
        y: previousBody.y + (body.y - previousBody.y) * fraction,
        z: previousBody.z + (body.z - previousBody.z) * fraction,
      };
      if (
        ropeTouchesPlayer(
          sample,
          state.round,
          ropeAngle(state.elapsed + dt * fraction, state.nextCrossing),
        )
      ) {
        return {
          ...next,
          status: "lost",
          message: "The rope touched you. Watch its swing and jump clear.",
        };
      }
    }
    if (next.elapsed >= state.nextCrossing) {
      const cleared =
        Math.abs(body.z - ropeZ(state.round)) <= 0.85 &&
        Math.abs(body.x) <= 1.5 &&
        body.y - groundAt(body.x, body.z) > 0.32;
      const round = state.round + Number(cleared);
      return {
        ...next,
        round,
        progress: round / 5,
        nextCrossing: state.nextCrossing + ROPE_PERIOD,
        status: round === 5 ? "won" : "playing",
        message:
          round === 5
            ? "Five clean jumps. You made it across."
            : cleared
              ? "Nice jump. Walk to the next glowing marker."
              : "You are clear of the rope. Move to the marker for the next pass.",
      };
    }
  }
  return next;
}
