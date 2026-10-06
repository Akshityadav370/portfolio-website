import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { SceneKind } from "@/components/workshop/MachineScene";

/** A small, procedural scene: no model downloads or external textures. */
export function createWorkshopScene(
  host: HTMLElement,
  kind: SceneKind,
  onContextLost: () => void,
) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(6.8, 5.2, 8.6);
  camera.lookAt(0, 0.25, 0);
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xe7efff, 0x382010, 2));
  const keyLight = new THREE.DirectionalLight(0xffdfb5, 5);
  keyLight.position.set(2, 6, 4);
  scene.add(keyLight);
  const rim = new THREE.DirectionalLight(0xb5c5ec, 3);
  rim.position.set(-4, 3, -2);
  scene.add(rim);
  const glow = new THREE.PointLight(0xff752b, 9, 7, 2);
  glow.position.set(0, 1.5, 0);
  scene.add(glow);

  const metal = new THREE.MeshStandardMaterial({
    color: 0x96948f,
    metalness: 0.87,
    roughness: 0.32,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x272a2b,
    metalness: 0.7,
    roughness: 0.37,
  });
  const copper = new THREE.MeshStandardMaterial({
    color: 0xc7824b,
    metalness: 0.8,
    roughness: 0.3,
  });
  const orange = new THREE.MeshStandardMaterial({
    color: 0xff863e,
    emissive: 0xf86420,
    emissiveIntensity: 0.7,
    metalness: 0.4,
    roughness: 0.35,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xa7b5ac,
    metalness: 0.25,
    roughness: 0.15,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const cream = new THREE.MeshStandardMaterial({
    color: 0xeee7d5,
    metalness: 0.18,
    roughness: 0.45,
  });
  const model = new THREE.Group();
  model.rotation.y = -0.3;
  scene.add(model);
  const layers: { group: THREE.Group; assembled: number; exploded: number }[] =
    [];
  const animated: THREE.Object3D[] = [];
  const signalPaths: THREE.CatmullRomCurve3[] = [];
  const signals: THREE.Mesh[] = [];

  function box(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    material: THREE.Material,
  ) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  function slab(
    parent: THREE.Object3D,
    w: number,
    d: number,
    h: number,
    y: number,
    material: THREE.Material,
    radius = 0.17,
  ) {
    const s = new THREE.Shape();
    const x = -w / 2,
      z = -d / 2,
      r = radius;
    s.moveTo(x + r, z);
    s.lineTo(x + w - r, z);
    s.quadraticCurveTo(x + w, z, x + w, z + r);
    s.lineTo(x + w, z + d - r);
    s.quadraticCurveTo(x + w, z + d, x + w - r, z + d);
    s.lineTo(x + r, z + d);
    s.quadraticCurveTo(x, z + d, x, z + d - r);
    s.lineTo(x, z + r);
    s.quadraticCurveTo(x, z, x + r, z);
    const geometry = new THREE.ExtrudeGeometry(s, {
      depth: h,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.035,
      bevelThickness: 0.025,
      curveSegments: 5,
    });
    geometry.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = y;
    parent.add(mesh);
    return mesh;
  }

  function cylinder(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    radius: number,
    h: number,
    material: THREE.Material,
  ) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, h, 20),
      material,
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  function trace(
    parent: THREE.Object3D,
    coords: number[][],
    material: THREE.Material,
    radius = 0.012,
    moving = false,
  ) {
    const points = coords.map(
      (p) => new THREE.Vector3(...(p as [number, number, number])),
    );
    const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.05);
    parent.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(curve, 24, radius, 5, false),
        material,
      ),
    );
    if (moving) {
      const signal = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 10, 8),
        orange,
      );
      parent.add(signal);
      signals.push(signal);
      signalPaths.push(curve);
    }
  }

  function bolts(parent: THREE.Object3D, y: number, w: number, d: number) {
    for (const x of [-w / 2 + 0.18, w / 2 - 0.18])
      for (const z of [-d / 2 + 0.18, d / 2 - 0.18]) {
        cylinder(parent, x, y, z, 0.065, 0.055, metal);
        box(parent, x, y + 0.031, z, 0.073, 0.008, 0.013, dark);
      }
  }

  function addLayer(assembled: number, exploded: number) {
    const group = new THREE.Group();
    group.position.y = exploded;
    model.add(group);
    layers.push({ group, assembled, exploded });
    return group;
  }

  function board(parent: THREE.Object3D, size = 2.9) {
    slab(parent, size, size * 0.78, 0.1, 0, dark);
    bolts(parent, 0.14, size, size * 0.78);
    for (let i = 0; i < 9; i++) {
      const z = -0.85 + i * 0.2;
      trace(
        parent,
        [
          [-size / 2 + 0.1, 0.13, z],
          [-0.9, 0.13, z],
          [-0.55, 0.13, z * 0.6],
          [0, 0.13, z * 0.6],
        ],
        copper,
        0.009,
      );
      box(parent, size / 2 - 0.2, 0.16, z, 0.17, 0.06, 0.09, copper);
    }
    for (const x of [-0.85, 0.85])
      for (const z of [-0.64, 0.64]) {
        box(parent, x, 0.2, z, 0.34, 0.16, 0.22, dark);
        for (let i = 0; i < 4; i++)
          box(parent, x - 0.14 + i * 0.09, 0.15, z, 0.03, 0.03, 0.32, metal);
      }
  }

  function makeA(parent: THREE.Object3D, y: number) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.8, 0);
    shape.lineTo(-0.22, 1.6);
    shape.lineTo(0.23, 1.6);
    shape.lineTo(0.82, 0);
    shape.lineTo(0.4, 0);
    shape.lineTo(0.27, 0.4);
    shape.lineTo(-0.27, 0.4);
    shape.lineTo(-0.41, 0);
    shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-0.16, 0.74);
    hole.lineTo(0.16, 0.74);
    hole.lineTo(0, 1.25);
    hole.closePath();
    shape.holes.push(hole);
    const mesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.27,
        bevelEnabled: true,
        bevelThickness: 0.045,
        bevelSize: 0.045,
        bevelSegments: 3,
      }),
      copper,
    );
    mesh.position.set(0, y, -0.1);
    parent.add(mesh);
  }

  if (kind === "assembly") {
    const base = addLayer(-1.35, -1.65);
    slab(base, 3.3, 2.7, 0.24, 0, dark);
    slab(base, 3.2, 2.6, 0.035, 0.25, copper);
    bolts(base, 0.3, 3.3, 2.7);
    for (let i = 0; i < 13; i++)
      box(base, -1.05 + i * 0.17, 0.1, 1.36, 0.07, 0.07, 0.03, copper);
    const circuits = addLayer(-1.01, -0.86);
    board(circuits);
    slab(circuits, 0.9, 0.9, 0.1, 0.15, copper, 0.05);
    const computing = addLayer(-0.69, 0.04);
    slab(computing, 2.55, 2.08, 0.045, 0, glass);
    slab(computing, 0.95, 0.95, 0.22, 0.07, dark, 0.07);
    for (let i = 0; i < 10; i++)
      box(computing, -0.45 + i * 0.1, 0.37, 0, 0.043, 0.2, 0.87, copper);
    for (let i = 0; i < 4; i++)
      cylinder(computing, -0.92 + i * 0.24, 0.1, 0.75, 0.038, 0.04, orange);
    const top = addLayer(-0.09, 1.08);
    slab(top, 2.38, 1.94, 0.09, 0, metal);
    bolts(top, 0.13, 2.38, 1.94);
    makeA(top, 0.14);
    for (const x of [-1.34, 1.34])
      for (const z of [-1.02, 1.02]) {
        cylinder(model, x, -0.35, z, 0.028, 2.55, copper);
        cylinder(model, x, -1.4, z, 0.075, 0.3, dark);
      }
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.014, 8, 64),
      orange,
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.72;
    model.add(ring);
  } else if (kind === "builder") {
    model.position.y = -0.45;
    slab(model, 3.9, 3, 0.15, -0.7, dark);
    bolts(model, -0.5, 3.9, 3);
    const positions = [
      [-1.3, -0.6],
      [0, -0.6],
      [1.3, -0.6],
      [-1.3, 0.75],
      [0, 0.75],
      [1.3, 0.75],
    ];
    positions.forEach(([x, z], i) => {
      const node = new THREE.Group();
      node.position.set(x, -0.5, z);
      model.add(node);
      slab(node, 0.85, 0.85, 0.12, 0, copper, 0.06);
      for (let level = 0; level < (i === 1 ? 4 : 2); level++) {
        slab(
          node,
          0.7,
          0.7,
          0.1,
          0.2 + level * 0.2,
          i === 1 ? metal : dark,
          0.04,
        );
        cylinder(node, 0.21, 0.32 + level * 0.2, 0.21, 0.025, 0.018, orange);
      }
      if (i < 5)
        trace(
          model,
          [
            [x, -0.46, z],
            [x, -0.46, 0.08],
            [positions[i + 1][0], -0.46, 0.08],
            [positions[i + 1][0], -0.46, positions[i + 1][1]],
          ],
          copper,
          0.014,
          true,
        );
    });
    const window = new THREE.Group();
    window.position.set(0, 1.08, -0.48);
    model.add(window);
    box(window, 0, 0.35, 0, 2.5, 1.35, 0.1, dark);
    box(window, 0, 0.35, 0.06, 2.35, 1.2, 0.015, glass);
    for (let i = 0; i < 3; i++)
      box(
        window,
        -0.7 + i * 0.15,
        0.88,
        0.08,
        0.06,
        0.06,
        0.025,
        i ? metal : orange,
      );
    for (let i = 0; i < 5; i++)
      box(
        window,
        -0.22 + (i % 2) * 0.15,
        0.65 - i * 0.17,
        0.09,
        1.3 - (i % 3) * 0.27,
        0.042,
        0.01,
        i === 2 ? orange : copper,
      );
  } else if (kind === "delivery") {
    slab(model, 3.7, 3.1, 0.2, -0.8, dark);
    for (let x = -1; x <= 1; x += 2)
      for (let z = -1; z <= 1; z += 2) {
        const h = x === z ? 1.4 : 0.8;
        box(
          model,
          x,
          -0.58 + h / 2,
          z * 0.88,
          0.8,
          h,
          0.75,
          x === 1 ? copper : metal,
        );
        for (let row = 0; row < Math.floor(h / 0.25); row++)
          for (let col = 0; col < 3; col++)
            box(
              model,
              x - 0.24 + col * 0.24,
              -0.4 + row * 0.24,
              z * 0.88 + 0.38,
              0.09,
              0.09,
              0.01,
              orange,
            );
      }
    trace(
      model,
      [
        [-1.6, -0.56, 0],
        [0, -0.56, 0],
        [0, -0.56, 1.3],
      ],
      orange,
      0.023,
      true,
    );
    trace(
      model,
      [
        [1.6, -0.56, 0],
        [0, -0.56, 0],
        [0, -0.56, -1.3],
      ],
      copper,
      0.023,
      true,
    );
    const pin = new THREE.Mesh(new THREE.OctahedronGeometry(0.23), orange);
    pin.position.set(1, 1.3, -0.88);
    model.add(pin);
    animated.push(pin);
  } else if (kind === "canvas" || kind === "browser") {
    for (let i = 0; i < 3; i++) {
      const panel = new THREE.Group();
      panel.position.set((i - 1) * 0.55, (i - 1) * 0.36, (1 - i) * 0.65);
      panel.rotation.y = -0.12;
      model.add(panel);
      box(panel, 0, 0, 0, 2.7, 1.9, 0.07, i === 2 ? glass : dark);
      box(panel, 0, 0.82, 0.05, 2.6, 0.16, 0.03, metal);
      for (let dot = 0; dot < 3; dot++) {
        const circle = new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 10, 8),
          dot ? copper : orange,
        );
        circle.position.set(-1.1 + dot * 0.14, 0.83, 0.075);
        panel.add(circle);
      }
      if (kind === "canvas") {
        box(panel, -0.48, 0.1, 0.07, 0.7, 0.5, 0.05, copper);
        box(panel, 0.51, -0.33, 0.07, 0.6, 0.5, 0.05, cream);
        trace(
          panel,
          [
            [-0.48, -0.2, 0.12],
            [0, -0.35, 0.12],
            [0.25, -0.33, 0.12],
          ],
          orange,
        );
        const cursor = new THREE.Mesh(
          new THREE.ConeGeometry(0.1, 0.28, 3),
          orange,
        );
        cursor.position.set(0.6, 0.3, 0.2);
        cursor.rotation.z = 0.6;
        panel.add(cursor);
        animated.push(cursor);
      } else {
        for (let row = 0; row < 4; row++) {
          box(panel, -0.97, 0.48 - row * 0.3, 0.1, 0.12, 0.12, 0.03, orange);
          box(
            panel,
            -0.1,
            0.48 - row * 0.3,
            0.08,
            1.3 - (row % 2) * 0.3,
            0.04,
            0.02,
            copper,
          );
        }
      }
    }
  } else {
    slab(model, 3, 2.7, 0.13, -1.5, dark);
    function branch(
      x: number,
      y: number,
      z: number,
      depth: number,
      spread: number,
    ) {
      const sphere = new THREE.Mesh(
        new THREE.IcosahedronGeometry(depth ? 0.12 : 0.17, 1),
        depth ? copper : orange,
      );
      sphere.position.set(x, y, z);
      model.add(sphere);
      if (!depth) return;
      for (const dir of [-1, 1]) {
        const nextX = x + dir * spread,
          nextY = y + 0.82,
          nextZ = z + dir * 0.28;
        trace(
          model,
          [
            [x, y, z],
            [x, y + 0.35, z],
            [nextX, nextY, nextZ],
          ],
          copper,
          0.025,
          true,
        );
        branch(nextX, nextY, nextZ, depth - 1, spread * 0.52);
      }
    }
    branch(0, -1.35, 0, 3, 0.85);
  }

  if (kind !== "assembly") model.scale.setScalar(1.18);

  // A soft procedural contact shadow avoids texture requests and shadow-map cost.
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(0,0,0,.6)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 6),
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.85;
  scene.add(shadow);

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  let visible = false,
    paused = false,
    disposed = false,
    lost = false,
    exploded = true;
  let frame = 0,
    time = 0,
    previous = 0,
    pointerX = 0,
    pointerY = 0;
  let scrollProgress = 0;

  function render(now = 0) {
    frame = 0;
    if (disposed || lost) return;
    const moving = !motion.matches && !paused;
    const dt = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    if (moving) time += dt;
    const factor = moving ? 0.065 : 1;
    const targetY =
      -0.3 + (moving ? pointerX * 0.3 + Math.sin(time * 0.2) * 0.08 : 0);
    model.rotation.y += (targetY - model.rotation.y) * factor;
    model.rotation.x +=
      ((moving ? pointerY * 0.09 : 0) - model.rotation.x) * factor;
    layers.forEach(({ group, assembled, exploded: separated }) => {
      const target = exploded
        ? separated +
          (moving ? scrollProgress * (separated - assembled) * 0.18 : 0)
        : assembled;
      group.position.y += (target - group.position.y) * factor;
    });
    animated.forEach((object, i) => {
      object.rotation.y = time * 0.5 + i;
    });
    signals.forEach((signal, i) =>
      signal.position.copy(
        signalPaths[i].getPoint((time * 0.14 + i * 0.18) % 1),
      ),
    );
    renderer.render(scene, camera);
    if (visible && !document.hidden && moving)
      frame = requestAnimationFrame(render);
  }

  function requestRender() {
    if (!frame && !disposed && !lost) frame = requestAnimationFrame(render);
  }
  function resize() {
    const width = host.clientWidth,
      height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    // Preserve the entire assembly on narrow screens.
    camera.fov = camera.aspect < 0.9 ? 43 : 34;
    camera.updateProjectionMatrix();
    requestRender();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      previous = performance.now();
      requestRender();
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  visibilityObserver.observe(host);
  function onPointer(event: PointerEvent) {
    if (!finePointer.matches || motion.matches || paused) return;
    const rect = host.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - 0.5;
    pointerY = (event.clientY - rect.top) / rect.height - 0.5;
  }
  function onLeave() {
    pointerX = pointerY = 0;
  }
  function onScroll() {
    if (visible && kind === "assembly")
      scrollProgress = Math.min(
        1,
        Math.max(0, -host.getBoundingClientRect().top / host.clientHeight),
      );
  }
  function onVisibility() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden && visible) {
      previous = performance.now();
      requestRender();
    }
  }
  function onMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    requestRender();
  }
  function onLost(event: Event) {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    onContextLost();
  }
  host.addEventListener("pointermove", onPointer);
  host.addEventListener("pointerleave", onLeave);
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  motion.addEventListener("change", onMotion);
  renderer.domElement.addEventListener("webglcontextlost", onLost);
  resize();

  return {
    setExploded(value: boolean) {
      exploded = value;
      requestRender();
    },
    setPaused(value: boolean) {
      paused = value;
      cancelAnimationFrame(frame);
      frame = 0;
      previous = performance.now();
      requestRender();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onMotion);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>([
        metal,
        dark,
        copper,
        orange,
        glass,
        cream,
      ]);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          (Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((m) => materials.add(m));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      shadowTexture.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
