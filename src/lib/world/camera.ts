import type { Obstacle } from "./rules";
export type Vector = { x: number; y: number; z: number };
export const damp = (from: number, to: number, speed: number, dt: number) =>
  from + (to - from) * (1 - Math.exp(-speed * dt));
export function dampAngle(from: number, to: number, speed: number, dt: number) {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + delta * (1 - Math.exp(-speed * dt));
}
/** Segment against expanded boxes: the camera has volume, including its near plane. */
export function cameraClearance(
  origin: Vector,
  direction: Vector,
  distance: number,
  obstacles: Obstacle[],
  radius = 0.24,
) {
  let limit = distance;
  for (const o of obstacles) {
    const min = [
      o.x - o.w / 2 - radius,
      o.bottom - radius,
      o.z - o.d / 2 - radius,
    ];
    const max = [
      o.x + o.w / 2 + radius,
      o.top + radius,
      o.z + o.d / 2 + radius,
    ];
    const start = [origin.x, origin.y, origin.z],
      dir = [direction.x, direction.y, direction.z];
    let near = 0,
      far = limit;
    for (let axis = 0; axis < 3; axis++) {
      if (Math.abs(dir[axis]) < 1e-8) {
        if (start[axis] < min[axis] || start[axis] > max[axis]) {
          far = -1;
          break;
        }
      } else {
        const a = (min[axis] - start[axis]) / dir[axis],
          b = (max[axis] - start[axis]) / dir[axis];
        near = Math.max(near, Math.min(a, b));
        far = Math.min(far, Math.max(a, b));
      }
    }
    if (near <= far && far >= 0)
      limit = Math.min(limit, Math.max(0.08, near - 0.04));
  }
  return limit;
}
export function cameraDistance(current: number, clearance: number, dt: number) {
  // Pull in immediately; ease back only after the obstruction clears.
  return clearance < current ? clearance : damp(current, clearance, 3.5, dt);
}

export type MovementReference = { yaw: number; x: number; z: number };
/** Latch a camera-relative heading for one input gesture. Auto-follow must not steer the player. */
export function movementReference(
  previous: MovementReference,
  yaw: number,
  x: number,
  z: number,
): MovementReference {
  const length = Math.hypot(x, z),
    oldLength = Math.hypot(previous.x, previous.z);
  if (length < 0.12) return { yaw, x: 0, z: 0 };
  const nx = x / length,
    nz = z / length;
  const changed = oldLength < 0.12 || nx * previous.x + nz * previous.z < 0.965;
  return changed ? { yaw, x: nx, z: nz } : previous;
}
export type ChaseMemory = { hold: number; moving: number };
export function chaseMemory(
  previous: ChaseMemory,
  speed: number,
  dragging: boolean,
  dt: number,
): ChaseMemory {
  return {
    hold: dragging ? 1.6 : Math.max(0, previous.hold - dt),
    moving: speed > 0.65 ? previous.moving + dt : 0,
  };
}
/** Rate-limited chase pan. A U-turn takes an arc instead of flipping the view. */
export function chaseYaw(yaw: number, vx: number, vz: number, dt: number) {
  if (Math.hypot(vx, vz) < 0.65) return yaw;
  const behind = Math.atan2(-vx, -vz);
  const difference = Math.atan2(Math.sin(behind - yaw), Math.cos(behind - yaw));
  const turn = difference * (1 - Math.exp(-2.8 * dt));
  const limit = (Math.hypot(vx, vz) > 5 ? 2.5 : 2) * dt;
  return yaw + Math.max(-limit, Math.min(limit, turn));
}
