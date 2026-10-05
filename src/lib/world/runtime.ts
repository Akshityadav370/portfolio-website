import * as THREE from "three";
import {
  cameraClearance,
  cameraDistance,
  damp,
  dampAngle,
  movementReference,
  chaseMemory,
  chaseYaw,
} from "./camera";
import { buildWorld, disposeObject } from "./assets";
import { createWorldAudio } from "./audio";
import {
  clamp,
  distance,
  groundAt,
  createMotion,
  advancePhysics,
  springStep,
  stepMotion,
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
    wantedYaw = 0,
    wantedPitch = 0.39,
    sensitivity = 1,
    jumpRequested = false,
    drag = false,
    lastX = 0,
    lastY = 0;
  let body: Body = { x: 0, z: 7, y: 0, vy: 0, grounded: true },
    trial: SpatialTrial | null = null;
  let motion = createMotion();
  let accumulator = 0,
    previousBody = { ...body },
    rotationVelocity = 0,
    lean = 0,
    bank = 0;
  const visualPosition = new THREE.Vector3();
  let activePointer: number | null = null;
  let followCamera = true,
    chase = { hold: 0, moving: 0 };
  let movementFrame = { yaw: 0, x: 0, z: 0 };
  let leadX = 0,
    leadZ = 0,
    framingDistance = 7.5;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const lookTarget = new THREE.Vector3();
  let joystick = { x: 0, y: 0 };
  const keys = new Set<string>(),
    discovered = new Set<ZoneId>();
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
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
  world.player.group.rotation.order = "YXZ";
  void Promise.all(world.assetPromises).then(() => {
    renderNeeded = true;
  });
  const target = new THREE.Vector3(),
    desired = new THREE.Vector3();
  let boom = zoom,
    targetHeight = body.y + 1.3,
    walkTime = 0,
    landing = 0;
  const playerMaterials: THREE.Material[] = [];
  world.player.group.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      const clone = (m: THREE.Material) => {
        const own = m.clone();
        playerMaterials.push(own);
        return own;
      };
      o.material = Array.isArray(o.material)
        ? o.material.map(clone)
        : clone(o.material);
    }
  });
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
    yaw = wantedYaw = zone.yaw;
    movementFrame = { yaw, x: 0, z: 0 };
    chase = { hold: 0, moving: 0 };
    leadX = leadZ = 0;
    world.player.group.rotation.y = zone.yaw + Math.PI;
    motion = createMotion();
    accumulator = 0;
    previousBody = { ...body };
    rotationVelocity = 0;
    wantedPitch = 0.39;
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
        "KeyC",
        "ShiftLeft",
        "ShiftRight",
      ].includes(e.code)
    ) {
      e.preventDefault();
      keys.add(e.code);
      if (e.code === "Space" && !e.repeat) jumpRequested = true;
      if (e.code === "KeyE" && !e.repeat) interact();
      if (e.code === "KeyC" && !e.repeat) recenter();
    }
  };
  const keyup = (e: KeyboardEvent) => keys.delete(e.code);
  const down = (e: PointerEvent) => {
    if (paused || activePointer !== null || e.button !== 0) return;
    activePointer = e.pointerId;
    host.focus({ preventScroll: true });
    drag = true;
    chase.hold = 1.6;
    lastX = e.clientX;
    lastY = e.clientY;
    host.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (!drag || paused || e.pointerId !== activePointer) return;
    chase.hold = 1.6;
    wantedYaw -= (e.clientX - lastX) * 0.005 * sensitivity;
    wantedPitch = clamp(
      wantedPitch + (e.clientY - lastY) * 0.004 * sensitivity,
      0.08,
      1.15,
    );
    lastX = e.clientX;
    lastY = e.clientY;
  };
  const up = (e: PointerEvent) => {
    if (e.pointerId !== activePointer) return;
    drag = false;
    activePointer = null;
    chase.hold = 1.6;
  };
  function recenter() {
    wantedYaw = world.player.group.rotation.y - Math.PI;
    wantedPitch = 0.39;
    chase = { hold: 0.6, moving: 0 };
    renderNeeded = true;
  }
  const wheel = (e: WheelEvent) => {
    e.preventDefault();
    zoom = clamp(zoom + e.deltaY * 0.006, 3.5, 12);
  };
  const blur = () => {
    keys.clear();
    joystick = { x: 0, y: 0 };
    drag = false;
    activePointer = null;
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
      movementFrame = movementReference(movementFrame, yaw, x, z);
      const controlYaw = followCamera ? movementFrame.yaw : yaw;
      const speed =
        trial?.kind === "red-light"
          ? 4.5
          : keys.has("ShiftLeft") || keys.has("ShiftRight")
            ? 6.5
            : 4.5;
      const old = body;
      previousBody = { ...body };
      const riding =
        trial?.kind === "mingle" &&
        trial.status === "playing" &&
        trial.phase === "spinning";
      if (riding) world.carousel.rotation.y += dt * 0.6;
      const result = stepMotion(
        body,
        motion,
        {
          x: Math.cos(controlYaw) * x - Math.sin(controlYaw) * z,
          z: -Math.sin(controlYaw) * x - Math.cos(controlYaw) * z,
          speed,
          jump: jumpRequested,
          surface: riding
            ? { x: -28, z: 15, radius: 5.8, speed: 0.6 }
            : undefined,
          brake:
            !!trial &&
            (trial.status !== "playing" || trial.phase === "warning"),
        },
        dt,
        world.obstacles,
      );
      body = result.body;
      motion = result.motion;
      landing = Math.max(landing, Math.min(0.13, motion.impact * 0.012));
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
      const relativeSpeed = Math.hypot(motion.vx, motion.vz);
      if (relativeSpeed > 0.08) {
        const current = world.player.group.rotation.y;
        const angle = Math.atan2(motion.vx, motion.vz);
        const target =
          current +
          Math.atan2(Math.sin(angle - current), Math.cos(angle - current));
        const spring = springStep(
          current,
          target,
          rotationVelocity,
          24,
          0.5,
          dt,
        );
        world.player.group.rotation.y = spring.position;
        rotationVelocity = spring.velocity;
      } else {
        rotationVelocity *= Math.exp(-14 * dt);
        if (riding && body.grounded) world.player.group.rotation.y += dt * 0.6;
      }
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
        ) {
          body = { x: -28, z: 17, y: groundAt(-28, 17), vy: 0, grounded: true };
          motion = createMotion();
          previousBody = { ...body };
          rotationVelocity = 0;
          cameraFirst = true;
        }
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
    const travelSpeed = Math.hypot(motion.vx, motion.vz);
    if (!paused && !hidden) chase = chaseMemory(chase, travelSpeed, drag, dt);
    const autoFollowing =
      followCamera &&
      !paused &&
      !hidden &&
      !drag &&
      chase.hold <= 0 &&
      chase.moving > 0.24;
    if (autoFollowing) {
      yaw = chaseYaw(yaw, motion.vx, motion.vz, dt);
      wantedYaw = yaw;
      const travelPitch = trial?.kind === "jump-rope" ? 0.48 : 0.36;
      wantedPitch = damp(wantedPitch, travelPitch, 1.8, dt);
    } else yaw = dampAngle(yaw, wantedYaw, 18, dt);
    pitch = damp(pitch, wantedPitch, 12, dt);
    const clock = advancePhysics(
      accumulator,
      paused || hidden ? 0 : dt,
      simulate,
    );
    accumulator = clock.remainder;
    visualPosition.set(
      THREE.MathUtils.lerp(previousBody.x, body.x, clock.alpha),
      THREE.MathUtils.lerp(previousBody.y, body.y, clock.alpha),
      THREE.MathUtils.lerp(previousBody.z, body.z, clock.alpha),
    );
    world.player.group.position.copy(visualPosition);
    world.player.group.position.y += 0.05;
    const speed = Math.hypot(motion.vx, motion.vz);
    walkTime += (speed * dt) / 4.5;
    world.player.animate(walkTime, speed > 0.08, !body.grounded, {
      speed,
      vertical: body.vy,
      landing: motion.recovery,
      dt,
    });
    const facing = world.player.group.rotation.y;
    const forwardAcceleration =
      (motion.ax * Math.sin(facing) + motion.az * Math.cos(facing)) * 120;
    lean = damp(
      lean,
      body.grounded
        ? clamp(speed * 0.016 + forwardAcceleration * 0.005, -0.09, 0.17)
        : -0.04,
      10,
      dt,
    );
    bank = damp(
      bank,
      clamp(-rotationVelocity * 120 * speed * 0.014, -0.18, 0.18),
      12,
      dt,
    );
    world.player.group.rotation.x = lean;
    world.player.group.rotation.z = bank;
    landing = damp(landing, 0, 12, dt);
    world.player.group.scale.set(
      1 + landing * 0.2,
      1 - landing,
      1 + landing * 0.2,
    );
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
    if (trial?.kind === "jump-rope") {
      world.ropeRig.position.z = ropeZ(Math.min(trial.round, 4));
      world.rope.rotation.x =
        (-(trial.nextCrossing - trial.elapsed) / 3.6) * Math.PI * 2;
    }
    // Smooth the vertical follow over stairs without letting the pivot sink into the terrain.
    targetHeight = cameraFirst
      ? visualPosition.y + 1.3
      : Math.max(
          visualPosition.y + 0.85,
          damp(
            targetHeight,
            visualPosition.y + 1.3,
            body.grounded ? 12 : 9,
            dt,
          ),
        );
    target.set(visualPosition.x, targetHeight, visualPosition.z);
    desired.set(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch),
    );
    const indoors =
      (Math.abs(body.x) < 8 && Math.abs(body.z) < 6) ||
      (Math.abs(body.x - 25) < 8 &&
        (Math.abs(body.z + 15) < 6 || Math.abs(body.z - 13) < 6));
    const runAmount = reducedMotion ? 0 : clamp((speed - 4.5) / 2, 0, 1);
    const wantedDistance = indoors
      ? Math.min(zoom, 6.2)
      : zoom + runAmount * 0.7;
    framingDistance = cameraFirst
      ? wantedDistance
      : damp(framingDistance, wantedDistance, 3, dt);
    const fov = damp(camera.fov, 58 + (!indoors ? runAmount * 3 : 0), 3, dt);
    if (Math.abs(fov - camera.fov) > 0.001) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    const staticClearance = cameraClearance(
      target,
      desired,
      framingDistance,
      world.cameraObstacles,
    );
    const clearance = cameraClearance(
      target,
      desired,
      staticClearance,
      world.updateMovingCameraObstacles(),
    );
    boom = cameraFirst ? clearance : cameraDistance(boom, clearance, dt);
    camera.position.copy(target).addScaledVector(desired, boom);
    // The boom is recast every frame; no position lerp can drag the camera through a wall.
    // Frame a little more of the path ahead without moving the collision pivot.
    const anticipation = autoFollowing && !reducedMotion ? 0.1 : 0;
    leadX = damp(leadX, motion.vx * anticipation, 4, dt);
    leadZ = damp(leadZ, motion.vz * anticipation, 4, dt);
    lookTarget.copy(target);
    lookTarget.x += leadX;
    lookTarget.z += leadZ;
    camera.lookAt(lookTarget);
    cameraFirst = false;
    const fade = THREE.MathUtils.smoothstep(boom, 0.35, 1.25);
    for (const material of playerMaterials) {
      material.opacity = fade;
      material.transparent = fade < 1;
      material.depthWrite = fade > 0.5;
    }
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
    recenter,
    setCameraFollow(value: boolean) {
      followCamera = value;
      movementFrame = { yaw, x: 0, z: 0 };
      chase = { hold: 0, moving: 0 };
      wantedYaw = yaw;
      renderNeeded = true;
    },
    setCameraSensitivity(value: number) {
      sensitivity = clamp(value, 0.4, 2);
    },
    setCameraDistance(value: number) {
      zoom = clamp(value, 3.5, 12);
      renderNeeded = true;
    },
    setPaused(value: boolean) {
      paused = value;
      renderNeeded = true;
      keys.clear();
      movementFrame = { yaw, x: 0, z: 0 };
      chase.moving = 0;
      joystick = { x: 0, y: 0 };
      jumpRequested = false;
      motion = { ...motion, vx: 0, vz: 0, ax: 0, az: 0, buffer: 0 };
      accumulator = 0;
      previousBody = { ...body };
      drag = false;
      activePointer = null;
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
      yaw = wantedYaw = 0;
      movementFrame = { yaw, x: 0, z: 0 };
      chase = { hold: 0, moving: 0 };
      leadX = leadZ = 0;
      wantedPitch = kind === "jump-rope" ? 0.48 : 0.39;
      motion = createMotion();
      accumulator = 0;
      previousBody = { ...body };
      rotationVelocity = 0;
      world.player.group.rotation.y = Math.PI;
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
