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
