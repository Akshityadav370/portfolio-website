import * as THREE from "three";
import type { SetKind } from "@/components/trials/TrialScene";
import type { TrialState } from "./trials-engine";

/** Miniature sets built entirely from geometry, with no external asset requests. */
export function createTrialScene(
  host: HTMLElement,
  kind: SetKind,
  getState: () => TrialState | undefined,
  onLost: () => void,
) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 70);
  const isSet = kind === "compound" || kind === "stairs";
  camera.position.set(isSet ? 10 : 9, isSet ? 9 : 8, isSet ? 12 : 12);
  const target = new THREE.Vector3(0, isSet ? 1.55 : 0.7, 0);
  camera.lookAt(target);
  scene.add(new THREE.HemisphereLight(0xdafaff, 0x364e49, 2.8));
  const key = new THREE.DirectionalLight(0xffe9cf, 4);
  key.position.set(-3, 11, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -7;
  key.shadow.camera.right = key.shadow.camera.top = 7;
  key.shadow.normalBias = 0.04;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff84bc, 1.2);
  rim.position.set(5, 7, -5);
  scene.add(rim);
  const world = new THREE.Group();
  scene.add(world);
  const material = (color: number, roughness = 0.78) =>
    new THREE.MeshStandardMaterial({ color, roughness });
  const pink = material(0xe987a4),
    rose = material(0xc8275d),
    mint = material(0x80beb0),
    teal = material(0x27776e),
    cream = material(0xe9dcbd),
    blue = material(0x92bdce),
    yellow = material(0xe9bb64),
    dark = material(0x152d30),
    black = material(0x171a24),
    white = material(0xf9ecd8),
    skin = material(0xe2b98c),
    sand = material(0xd6bf84),
    orange = material(0xde762e),
    wood = material(0x665042);
  const materials = [
    pink,
    rose,
    mint,
    teal,
    cream,
    blue,
    yellow,
    dark,
    black,
    white,
    skin,
    sand,
    orange,
    wood,
  ];
  const textures: THREE.Texture[] = [];

  function box(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
  ) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function sphere(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    radius: number,
    mat: THREE.Material,
  ) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 12), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function cylinder(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    radius: number,
    height: number,
    mat: THREE.Material,
    top = radius,
  ) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(top, radius, height, 24),
      mat,
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function line(
    parent: THREE.Object3D,
    points: number[][],
    mat: THREE.Material,
    radius = 0.026,
  ) {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...(p as [number, number, number]))),
    );
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 32, radius, 7, false),
      mat,
    );
    parent.add(mesh);
    return mesh;
  }
  function label(
    parent: THREE.Object3D,
    text: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    color = "#f2edda",
    background = "#183d3c",
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = color;
    ctx.font = "bold 62px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 66);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
    const mat = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  function doorway(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    color: THREE.Material,
    number: string,
  ) {
    box(parent, x, y + 0.6, z, 0.85, 1.2, 0.09, color);
    box(parent, x, y + 0.53, z + 0.06, 0.64, 1.03, 0.05, dark);
    label(parent, number, x, y + 1.04, z + 0.1, 0.48, 0.15);
  }
  function figure(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    guard = false,
    scale = 1,
  ) {
    const person = new THREE.Group();
    person.position.set(x, y, z);
    person.scale.setScalar(scale);
    parent.add(person);
    const coat = guard ? rose : teal;
    cylinder(person, 0, 0.43, 0, 0.18, 0.4, coat, 0.15);
    const head = sphere(person, 0, 0.79, 0, 0.18, guard ? rose : skin);
    if (guard) {
      const mask = sphere(person, 0, 0.8, 0.135, 0.133, black);
      mask.scale.z = 0.42;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.055, 0.009, 5, 24),
        white,
      );
      ring.position.set(0, 0.81, 0.195);
      person.add(ring);
    } else {
      const hair = sphere(head, 0, 0.095, -0.025, 0.158, black);
      hair.scale.y = 0.55;
      box(person, -0.075, 0.46, 0.163, 0.025, 0.29, 0.025, white);
      box(person, 0.07, 0.51, 0.163, 0.09, 0.065, 0.025, white);
    }
    for (const dir of [-1, 1]) {
      box(person, dir * 0.09, 0.13, 0, 0.13, 0.26, 0.14, coat);
      box(person, dir * 0.09, 0.025, 0.045, 0.14, 0.06, 0.23, white);
      const arm = box(person, dir * 0.22, 0.42, 0, 0.1, 0.36, 0.11, coat);
      arm.rotation.z = dir * 0.08;
    }
    return person;
  }
  function stairs(
    x: number,
    y: number,
    z: number,
    rotation: number,
    mat: THREE.Material,
    count = 9,
  ) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.rotation.y = rotation;
    world.add(group);
    for (let i = 0; i < count; i++) {
      box(group, 0, (i + 1) * 0.12, -i * 0.22, 1.05, (i + 1) * 0.24, 0.23, mat);
      for (const side of [-1, 1])
        box(
          group,
          side * 0.52,
          (i + 1) * 0.24 + 0.26,
          -i * 0.22,
          0.035,
          0.52,
          0.035,
          cream,
        );
    }
    for (const side of [-1, 1])
      line(
        group,
        [
          [side * 0.52, 0.77, 0.05],
          [side * 0.52, count * 0.24 + 0.55, -(count - 1) * 0.22],
        ],
        cream,
        0.035,
      );
  }
  function bunk(x: number, z: number, rotation: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    world.add(group);
    for (const dx of [-0.45, 0.45])
      for (const dz of [-0.83, 0.83])
        cylinder(group, dx, 1.25, dz, 0.04, 2.5, dark);
    for (let level = 0; level < 3; level++) {
      box(group, 0, 0.2 + level * 0.83, 0, 0.95, 0.1, 1.8, dark);
      box(group, 0, 0.3 + level * 0.83, 0, 0.86, 0.12, 1.69, cream);
      box(group, 0, 0.38 + level * 0.83, -0.56, 0.62, 0.08, 0.36, white);
      box(group, 0, 0.38 + level * 0.83, 0.25, 0.84, 0.06, 1.1, mint);
      for (const z of [-0.82, 0.82])
        box(group, 0, 0.65 + level * 0.83, z, 0.92, 0.04, 0.04, dark);
    }
  }
  let dollHead: THREE.Group | undefined,
    player: THREE.Group | undefined,
    carousel: THREE.Group | undefined,
    rope: THREE.Group | undefined;
  const crew: THREE.Group[] = [];
  if (isSet) {
    box(world, 0, -0.3, 0, 7.5, 0.6, 6.2, dark);
    box(world, 0, 0.025, 0, 7.35, 0.1, 6.05, mint);
    // Open dollhouse section: dormitory left, impossible stairs right.
    box(world, 0, 2.25, -2.85, 7.35, 4.5, 0.22, pink);
    box(world, -3.57, 1.6, -0.75, 0.22, 3.2, 4.15, blue);
    box(world, 2.35, 1.08, -1.65, 2.5, 2.15, 2.2, mint);
    box(world, 1.15, 3.12, -2.22, 4.55, 0.18, 1.1, yellow);
    doorway(world, -2.55, 0.08, -2.71, rose, "370");
    doorway(world, 1.3, 3.24, -2.71, blue, "01");
    doorway(world, 2.66, 2.2, -0.49, pink, "02");
    stairs(1.35, 0.09, 2.08, 0, pink);
    stairs(-0.3, 1.08, -1.58, -Math.PI / 2, blue);
    box(world, -0.26, 1.08, -1.62, 1.1, 0.2, 1.0, blue);
    box(world, 1.35, 2.26, 0.16, 1.2, 0.16, 1.2, pink);
    for (let i = 0; i < 9; i++)
      box(world, -0.8 + i * 0.5, 3.56, -1.67, 0.035, 0.75, 0.035, cream);
    box(world, 1.2, 3.94, -1.67, 4.1, 0.055, 0.06, cream);
    bunk(-2.5, -0.6, 0);
    bunk(-1.18, -0.65, 0);
    for (const x of [-2.8, -1.8, -0.8])
      for (const z of [1.05, 2.05]) figure(world, x, 0.09, z, false, 0.7);
    figure(world, 2.8, 0.09, 2.1, true, 1.17);
    figure(world, 1.3, 3.24, -2.32, true, 0.8);
    label(world, "THE DORMITORY", -1.65, 3.91, -2.72, 2.6, 0.45);
    label(world, "370", 0, -0.28, 3.12, 0.65, 0.25, "#f29fb6", "#142e30");
    // Warm fluorescent strips and visible architectural detail.
    box(world, -2.3, 3.24, -2.64, 1.8, 0.08, 0.16, white);
    for (let i = 0; i < 5; i++)
      box(world, 3.73, 0.12 + i * 0.19, 0.5, 0.06, 0.045, 1.2, rose);
    if (kind === "stairs") world.rotation.y = -0.4;
  } else if (kind === "red-light") {
    box(world, 0, -0.18, 0, 7, 0.35, 6.5, cream);
    box(world, 0, 0.01, 0, 6.9, 0.05, 6.4, sand);
    box(world, 0, 1.5, -3.15, 6.9, 3, 0.15, blue);
    for (const x of [-2.5, 0, 2.4]) {
      sphere(world, x, 2.6, -3.02, 0.31, white).scale.set(1.7, 0.6, 0.15);
    }
    for (let i = 0; i < 6; i++)
      box(world, -2.6 + i * 1.02, 0.045, 0.8, 0.018, 0.012, 3.85, cream);
    box(world, 0, 0.06, -1.18, 6.4, 0.02, 0.075, rose);
    box(world, 0, 0.06, 2.65, 6.4, 0.02, 0.075, white);
    cylinder(world, 0, 1.7, -2.65, 0.16, 3.4, wood, 0.11);
    line(
      world,
      [
        [0, 2.6, -2.65],
        [-0.8, 3.2, -2.6],
        [-1.4, 3.25, -2.5],
      ],
      wood,
      0.07,
    );
    line(
      world,
      [
        [0, 2.35, -2.65],
        [0.8, 3, -2.6],
        [1.5, 3.45, -2.5],
      ],
      wood,
      0.07,
    );
    const doll = new THREE.Group();
    doll.position.set(0, 0.05, -2);
    world.add(doll);
    cylinder(doll, 0, 1.12, 0, 0.42, 0.95, orange, 0.24);
    box(doll, 0, 1.59, 0, 0.59, 0.38, 0.33, yellow);
    for (const side of [-1, 1]) {
      box(doll, side * 0.16, 0.35, 0, 0.17, 0.7, 0.19, skin);
      box(doll, side * 0.16, 0.08, 0.1, 0.24, 0.16, 0.37, black);
      box(doll, side * 0.4, 1.2, 0, 0.14, 0.78, 0.16, skin);
    }
    dollHead = new THREE.Group();
    dollHead.position.y = 2.06;
    doll.add(dollHead);
    sphere(dollHead, 0, 0, 0, 0.37, skin);
    sphere(dollHead, 0, 0.16, -0.05, 0.34, black).scale.y = 0.7;
    sphere(dollHead, -0.34, -0.02, -0.04, 0.15, black);
    sphere(dollHead, 0.34, -0.02, -0.04, 0.15, black);
    for (const x of [-0.12, 0.12])
      sphere(dollHead, x, 0.03, 0.342, 0.032, black);
    player = figure(world, 0.5, 0.055, 2.38, false, 0.9);
    for (const x of [-2.45, 2.45]) figure(world, x, 0.04, -2.38, true, 0.9);
    for (const x of [-1.5, -0.5, 1.5]) figure(world, x, 0.05, 2.5, false, 0.75);
  } else if (kind === "mingle") {
    cylinder(world, 0, -0.2, 0, 3.7, 0.4, rose);
    cylinder(world, 0, 0.04, 0, 3.5, 0.08, pink);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const room = new THREE.Group();
      room.position.set(Math.sin(angle) * 3.2, 0.08, Math.cos(angle) * 3.2);
      room.rotation.y = angle + Math.PI;
      world.add(room);
      if (i > 1 && i < 7) {
        box(room, 0, 0.8, 0, 1.05, 1.6, 0.3, [mint, blue, yellow, pink][i % 4]);
        doorway(room, 0, 0, 0.2, rose, `0${i}`);
      }
    }
    carousel = new THREE.Group();
    carousel.position.y = 0.1;
    world.add(carousel);
    cylinder(carousel, 0, 0.13, 0, 2.1, 0.26, yellow);
    cylinder(carousel, 0, 0.28, 0, 1.92, 0.04, mint);
    cylinder(carousel, 0, 1.0, 0, 0.11, 1.5, cream);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.6, 10), rose);
    roof.position.y = 2.1;
    carousel.add(roof);
    cylinder(carousel, 0, 1.81, 0, 1.4, 0.1, yellow);
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const member = figure(
        carousel,
        Math.sin(angle) * 1.25,
        0.31,
        Math.cos(angle) * 1.25,
        false,
        0.9,
      );
      member.rotation.y = angle;
      crew.push(member);
    }
  } else {
    box(world, -2.8, -0.45, 0, 1.5, 0.9, 3, pink);
    box(world, 2.8, -0.45, 0, 1.5, 0.9, 3, blue);
    box(world, 0, -0.12, 0, 6, 0.24, 1.2, cream);
    for (let i = 0; i < 18; i++)
      box(world, -2.5 + i * 0.3, 0.014, 0, 0.025, 0.015, 1.17, dark);
    figure(world, -2.8, 0, 0, true, 1.6);
    figure(world, 2.8, 0, 0, true, 1.6);
    rope = new THREE.Group();
    rope.position.y = 1.3;
    world.add(rope);
    line(
      rope,
      [
        [-2.65, 0, 0],
        [-1.5, -0.9, 0],
        [0, -1.28, 0],
        [1.5, -0.9, 0],
        [2.65, 0, 0],
      ],
      yellow,
      0.045,
    );
    player = figure(world, 0, 0.02, 0, false, 1);
    label(world, "FINISH", 2.83, 0.45, 1.51, 0.95, 0.3);
  }
  // Soft grounding shadow, with transparency into the surrounding page.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.ShadowMaterial({ opacity: 0.22 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.62;
  ground.receiveShadow = true;
  scene.add(ground);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0,
    disposed = false,
    visible = false,
    lost = false;
  let yaw = 0,
    desiredYaw = 0,
    pointer = 0;
  const initialYaw = world.rotation.y;
  let lastFrame = 0;
  let lastDrawnState: TrialState | undefined;
  let dirty = true,
    carouselAngle = 0,
    previousElapsed = 0;
  function draw(now = 0) {
    frame = 0;
    if (disposed || lost || !visible || document.hidden) return;
    const state = getState();
    if (now - lastFrame < 30) {
      frame = requestAnimationFrame(draw);
      return;
    }
    lastFrame = now;
    // Ready/paused scenes do not continually redraw their WebGL canvas.
    if (
      !dirty &&
      state === lastDrawnState &&
      Math.abs(desiredYaw + pointer - yaw) < 0.001
    ) {
      if (state) frame = requestAnimationFrame(draw);
      return;
    }
    dirty = false;
    lastDrawnState = state;
    yaw += (desiredYaw + pointer - yaw) * (reduced.matches ? 1 : 0.12);
    world.rotation.y = initialYaw + yaw;
    if (state) {
      const t = state.elapsed;
      if (dollHead)
        dollHead.rotation.y =
          state.phase === "green" || state.phase === "ready" ? Math.PI : 0;
      if (kind === "red-light" && player)
        player.position.z = 2.38 - state.progress * 3.9;
      if (carousel) {
        if (t < previousElapsed) carouselAngle = 0;
        if (state.phase === "spinning")
          carouselAngle += Math.max(0, t - previousElapsed) * 0.55;
        previousElapsed = t;
        carousel.rotation.y = reduced.matches ? 0 : carouselAngle;
        crew.forEach(
          (person, i) =>
            (person.position.y = state.selected.includes(i) ? 0.6 : 0.31),
        );
      }
      if (rope) {
        rope.rotation.x = (-(state.nextRope - t) / 2.5) * Math.PI * 2;
        if (player) {
          const age = t - state.jumpAt;
          player.position.y =
            age >= 0 && age <= 0.85
              ? 0.02 + Math.sin((age / 0.85) * Math.PI) * 1.05
              : 0.02;
        }
      }
    }
    renderer.render(scene, camera);
    if (state || Math.abs(desiredYaw + pointer - yaw) > 0.001)
      frame = requestAnimationFrame(draw);
  }
  function requestDraw() {
    dirty = true;
    if (!frame && visible && !disposed) frame = requestAnimationFrame(draw);
  }
  function resize() {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.95 ? (isSet ? 43 : 41) : isSet ? 34 : 31;
    camera.updateProjectionMatrix();
    requestDraw();
  }
  const sizes = new ResizeObserver(resize);
  sizes.observe(host);
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestDraw();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  visibility.observe(host);
  function move(event: PointerEvent) {
    if (!isSet || reduced.matches || event.pointerType !== "mouse") return;
    const rect = host.getBoundingClientRect();
    pointer = ((event.clientX - rect.left) / rect.width - 0.5) * 0.12;
    requestDraw();
  }
  function leave() {
    pointer = 0;
    requestDraw();
  }
  function onVisibility() {
    cancelAnimationFrame(frame);
    frame = 0;
    requestDraw();
  }
  function onContextLost(event: Event) {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    onLost();
  }
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener("change", requestDraw);
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);
  resize();
  return {
    rotate() {
      desiredYaw += Math.PI / 4;
      requestDraw();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      sizes.disconnect();
      visibility.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", requestDraw);
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        onContextLost,
      );
      const geometries = new Set<THREE.BufferGeometry>();
      const usedMaterials = new Set<THREE.Material>(materials);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          (Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((m) => usedMaterials.add(m));
        }
      });
      geometries.forEach((g) => g.dispose());
      usedMaterials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      key.shadow.map?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
