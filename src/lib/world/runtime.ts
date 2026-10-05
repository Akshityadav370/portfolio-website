import * as THREE from "three";
import { buildWorld, disposeObject } from "./assets";
import { createWorldAudio } from "./audio";
import {
  clamp,
  distance,
  groundAt,
  moveBody,
  POIS,
  ropeZ,
  startSpatialTrial,
  stepSpatialTrial,
  ZONES,
  type Body,
  type GameId,
  type SpatialTrial,
  type ZoneId,
} from "./rules";
export type Snapshot = {
  x: number;
  z: number;
  yaw: number;
  zone: ZoneId;
  nearby: (typeof POIS)[number] | null;
  discovered: ZoneId[];
  trial: SpatialTrial | null;
};
export function createWorld(
  host: HTMLDivElement,
  callbacks: {
    update: (s: Snapshot) => void;
    interact: (zone: ZoneId) => void;
    pause: () => void;
    ready: () => void;
    error: () => void;
  },
) {
  let renderNeeded = true;
  let disposed = false,
    paused = true,
    hidden = false,
    yaw = 0,
    pitch = 0.39,
    zoom = 7.5,
    jumpRequested = false,
    drag = false,
    lastX = 0,
    lastY = 0;
  let body: Body = { x: 0, z: 7, y: 0, vy: 0, grounded: true },
    trial: SpatialTrial | null = null;
  let joystick = { x: 0, y: 0 };
  const keys = new Set<string>(),
    discovered = new Set<ZoneId>();
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.domElement.setAttribute(
    "aria-label",
    "Third-person portfolio world. Use WASD to walk, drag to look, Space to jump, and E to interact.",
  );
  host.append(renderer.domElement);
  host.tabIndex = 0;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc8dcd8);
  scene.fog = new THREE.Fog(0xc8dcd8, 45, 115);
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 150);
  scene.add(new THREE.HemisphereLight(0xfff6df, 0x567b74, 2.4));
  const sun = new THREE.DirectionalLight(0xffeccf, 3);
  sun.position.set(-25, 48, 25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -55;
  sun.shadow.camera.right = 55;
  sun.shadow.camera.top = 60;
  sun.shadow.camera.bottom = -60;
  sun.shadow.camera.far = 130;
  sun.shadow.normalBias = 0.035;
  scene.add(sun);
  const world = buildWorld(scene, () => disposed),
    audio = createWorldAudio();
  void Promise.all(world.assetPromises).then(() => {
    renderNeeded = true;
  });
  const target = new THREE.Vector3(),
    desired = new THREE.Vector3(),
    ray = new THREE.Raycaster();
  let cameraFirst = true;
  let nearest: (typeof POIS)[number] | null = null,
    lastSound = "";
  function syncSound(force = false) {
    const key = `${trial?.kind}/${trial?.phase}/${trial?.status}/${paused}/${hidden}`;
    if (force || key !== lastSound) {
      lastSound = key;
      audio.sync(trial, paused || hidden);
    }
  }
  function teleport(id: ZoneId) {
    const zone = ZONES.find((z) => z.id === id)!;
    body = {
      ...zone.spawn,
      y: groundAt(zone.spawn.x, zone.spawn.z),
      vy: 0,
      grounded: true,
    };
    yaw = zone.yaw;
    cameraFirst = true;
    keys.clear();
    joystick = { x: 0, y: 0 };
    trial = null;
    syncSound();
    publish();
  }
  function interact() {
    if (!paused && !trial && nearest) callbacks.interact(nearest.zone);
  }
  function resize() {
    renderNeeded = true;
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  const keydown = (e: KeyboardEvent) => {
    if (paused || e.target !== host) return;
    if (
      [
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Space",
        "KeyE",
        "ShiftLeft",
        "ShiftRight",
      ].includes(e.code)
    ) {
      e.preventDefault();
      keys.add(e.code);
      if (e.code === "Space" && !e.repeat) jumpRequested = true;
      if (e.code === "KeyE" && !e.repeat) interact();
    }
  };
  const keyup = (e: KeyboardEvent) => keys.delete(e.code);
  const down = (e: PointerEvent) => {
    if (paused) return;
    host.focus({ preventScroll: true });
    drag = true;
    lastX = e.clientX;
    lastY = e.clientY;
    host.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (!drag || paused) return;
    yaw -= (e.clientX - lastX) * 0.005;
    pitch = clamp(pitch + (e.clientY - lastY) * 0.004, 0.08, 1.05);
    lastX = e.clientX;
    lastY = e.clientY;
  };
  const up = () => {
    drag = false;
  };
  const wheel = (e: WheelEvent) => {
    e.preventDefault();
    zoom = clamp(zoom + e.deltaY * 0.006, 3.5, 12);
  };
  const blur = () => {
    keys.clear();
    joystick = { x: 0, y: 0 };
    drag = false;
    if (!paused) callbacks.pause();
  };
  const visibility = () => {
    hidden = document.hidden;
    if (hidden) blur();
    syncSound();
  };
  const contextLost = (e: Event) => {
    e.preventDefault();
    paused = true;
    syncSound();
    callbacks.error();
  };
  host.addEventListener("keydown", keydown);
  window.addEventListener("keyup", keyup);
  host.addEventListener("pointerdown", down);
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerup", up);
  host.addEventListener("pointercancel", up);
  host.addEventListener("wheel", wheel, { passive: false });
  window.addEventListener("blur", blur);
  document.addEventListener("visibilitychange", visibility);
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  function publish() {
    const zone = [...ZONES].sort(
      (a, b) => distance(body, a) - distance(body, b),
    )[0];
    if (distance(body, zone) < 10) discovered.add(zone.id);
    nearest =
      POIS.find((p) => distance(body, p) < 3.1 && Math.abs(body.y - p.y) < 2) ??
      null;
    callbacks.update({
      x: body.x,
      z: body.z,
      yaw,
      zone: zone.id,
      nearby: nearest,
      discovered: [...discovered],
      trial: trial ? { ...trial } : null,
    });
  }
  let previous = performance.now(),
    lastPublish = 0,
    frame = 0,
    elapsed = 0,
    signal = "";
  function simulate(dt: number) {
    let moved = 0;
    if (!paused && !hidden) {
      let x =
        Number(keys.has("KeyD") || keys.has("ArrowRight")) -
        Number(keys.has("KeyA") || keys.has("ArrowLeft")) +
        joystick.x;
      let z =
        Number(keys.has("KeyW") || keys.has("ArrowUp")) -
        Number(keys.has("KeyS") || keys.has("ArrowDown")) -
        joystick.y;
      const length = Math.hypot(x, z);
      if (length > 1) {
        x /= length;
        z /= length;
      }
      if (trial && (trial.status !== "playing" || trial.phase === "warning")) {
        x = 0;
        z = 0;
      }
      const speed =
        trial?.kind === "red-light"
          ? 4.5
          : keys.has("ShiftLeft") || keys.has("ShiftRight")
            ? 6.5
            : 4.5;
      const dx = (Math.cos(yaw) * x - Math.sin(yaw) * z) * speed * dt,
        dz = (-Math.sin(yaw) * x - Math.cos(yaw) * z) * speed * dt;
      const old = body;
      body = moveBody(body, dx, dz, dt, world.obstacles, jumpRequested);
      jumpRequested = false;
      if (trial?.status === "playing") {
        if (trial.kind === "red-light") {
          body.x = clamp(body.x, -36, -20);
          body.z = clamp(body.z, -35, -10);
        }
        if (trial.kind === "jump-rope") {
          body.x = clamp(body.x, -1.5, 1.5);
          body.z = clamp(body.z, 28, 45);
        }
        if (trial.kind === "mingle" && trial.phase === "spinning") {
          const d = distance(body, { x: -28, z: 15 });
          if (d > 4) {
            body.x = -28 + ((body.x + 28) / d) * 4;
            body.z = 15 + ((body.z - 15) / d) * 4;
          }
        }
      }
      moved = distance(body, old);
      if (moved > 0.001)
        world.player.group.rotation.y = Math.atan2(
          body.x - old.x,
          body.z - old.z,
        );
      if (body.y < -2.5) {
        teleport("jump-rope");
      }
      if (trial) {
        const round = trial.round;
        trial = stepSpatialTrial(
          trial,
          dt,
          body,
          moved + Math.abs(body.y - old.y),
        );
        if (
          trial.kind === "mingle" &&
          trial.round !== round &&
          trial.status === "playing"
        )
          body = { x: -28, z: 17, y: 0, vy: 0, grounded: true };
        syncSound();
      }
    }
    return moved;
  }
  function tick(now: number) {
    if (disposed) return;
    frame = requestAnimationFrame(tick);
    const dt = Math.min((now - previous) / 1000, 0.15);
    previous = now;
    if ((paused || hidden) && !renderNeeded) return;
    renderNeeded = false;
    elapsed += dt;
    const steps = Math.max(1, Math.ceil(dt / 0.025));
    let moved = 0;
    for (let i = 0; i < steps; i++) moved += simulate(dt / steps);
    world.player.group.position.set(body.x, body.y + 0.05, body.z);
    world.player.animate(elapsed, moved > 0.001, !body.grounded);
    const red = trial?.kind === "red-light" ? trial.phase : "green";
    world.dollHead.rotation.y = THREE.MathUtils.lerp(
      world.dollHead.rotation.y,
      red === "green" ? Math.PI : 0,
      1 - Math.exp(-dt * 7),
    );
    if (signal !== red) {
      signal = red;
      world.redSignal.update(
        red === "red"
          ? "RED LIGHT"
          : red === "warning"
            ? "STOP · SHE IS TURNING"
            : "GREEN LIGHT",
      );
    }
    if (!paused && trial?.kind === "mingle" && trial.phase === "spinning")
      world.carousel.rotation.y += dt * 0.6;
    if (trial?.kind === "jump-rope") {
      world.ropeRig.position.z = ropeZ(Math.min(trial.round, 4));
      world.rope.rotation.x =
        (-(trial.nextCrossing - trial.elapsed) / 3.6) * Math.PI * 2;
    }
    target.set(body.x, body.y + 1.25, body.z);
    desired.set(
      Math.sin(yaw) * Math.cos(pitch) * zoom,
      Math.sin(pitch) * zoom,
      Math.cos(yaw) * Math.cos(pitch) * zoom,
    );
    ray.set(target, desired.clone().normalize());
    ray.far = zoom;
    const hit = ray.intersectObjects(world.cameraColliders, false)[0];
    if (hit) desired.setLength(Math.max(0.75, hit.distance - 0.3));
    desired.add(target);
    if (cameraFirst) {
      camera.position.copy(desired);
      cameraFirst = false;
    } else camera.position.lerp(desired, 1 - Math.exp(-dt * 12));
    camera.lookAt(target);
    renderer.render(scene, camera);
    if (now - lastPublish > 100) {
      publish();
      lastPublish = now;
    }
  }
  frame = requestAnimationFrame(tick);
  callbacks.ready();
  publish();
  return {
    teleport,
    interact,
    setPaused(value: boolean) {
      paused = value;
      renderNeeded = true;
      keys.clear();
      joystick = { x: 0, y: 0 };
      jumpRequested = false;
      syncSound();
      if (!value) host.focus({ preventScroll: true });
    },
    startGame(kind: GameId) {
      trial = startSpatialTrial(kind);
      const point =
        kind === "red-light"
          ? { x: -28, z: -11 }
          : kind === "mingle"
            ? { x: -28, z: 17 }
            : { x: 0, z: 44 };
      body = { ...point, y: groundAt(point.x, point.z), vy: 0, grounded: true };
      yaw = 0;
      cameraFirst = true;
      syncSound();
      publish();
    },
    leaveGame() {
      trial = null;
      syncSound();
      publish();
    },
    setJoystick(x: number, y: number) {
      joystick = { x, y };
    },
    jump() {
      jumpRequested = true;
    },
    setSound(value: boolean) {
      audio.setEnabled(value);
      syncSound(true);
    },
    setVolume(value: number) {
      audio.setVolume(value);
    },
    setQuality(low: boolean) {
      renderer.setPixelRatio(low ? 1 : Math.min(devicePixelRatio, 1.6));
      renderer.shadowMap.enabled = !low;
      resize();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      audio.dispose();
      host.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerup", up);
      host.removeEventListener("pointercancel", up);
      host.removeEventListener("wheel", wheel);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      disposeObject(scene);
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
export type WorldRuntime = ReturnType<typeof createWorld>;
