import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { MINGLE_ROOMS, POIS, type Obstacle } from "./rules";

export function buildWorld(scene: THREE.Scene, isDisposed: () => boolean) {
  const root = new THREE.Group();
  scene.add(root);
  const dynamic = new THREE.Group();
  scene.add(dynamic);
  const obstacles: Obstacle[] = [];
  const textures: THREE.Texture[] = [];
  const mat = (color: number) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.83 });
  const palette = {
    pink: mat(0xe8a2b6),
    rose: mat(0xdb3369),
    mint: mat(0xa4cfbd),
    teal: mat(0x297d72),
    blue: mat(0x91bfcd),
    cream: mat(0xf3e5c9),
    yellow: mat(0xf3cb77),
    dark: mat(0x23423f),
    black: mat(0x20232d),
    skin: mat(0xe9ba93),
    sand: mat(0xdacc9b),
    wood: mat(0x796149),
    white: mat(0xfbf2de),
  };
  type Mat = THREE.Material;
  function box(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    m: Mat,
    solid = false,
  ) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    if (solid)
      obstacles.push({ x, z, w, d, bottom: y - h / 2, top: y + h / 2 });
    return mesh;
  }
  function sphere(
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    r: number,
    m: Mat,
  ) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 10), m);
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
    r: number,
    h: number,
    m: Mat,
    rt = r,
  ) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, r, h, 20), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function tube(parent: THREE.Object3D, points: number[][], m: Mat, r = 0.06) {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...(p as [number, number, number]))),
    );
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, r, 6, false),
      m,
    );
    parent.add(mesh);
    return mesh;
  }
  function sign(
    parent: THREE.Object3D,
    text: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    bg = "#173d3b",
    fg = "#f9ebd1",
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
    const update = (value: string) => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1024, 256);
      ctx.strokeStyle = fg;
      ctx.lineWidth = 3;
      ctx.strokeRect(12, 12, 1000, 232);
      ctx.fillStyle = fg;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 180px sans-serif";
      const measured = ctx.measureText(value).width;
      ctx.font = `bold ${Math.min(value.length <= 4 ? 200 : 180, (180 * 920) / Math.max(1, measured))}px sans-serif`;
      ctx.fillText(value, 512, 133);
      texture.needsUpdate = true;
    };
    update(text);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: texture }),
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return { mesh, update };
  }
  function character(
    parent: THREE.Object3D,
    x: number,
    z: number,
    guard = false,
    scale = 1,
  ) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.scale.setScalar(scale);
    parent.add(group);
    const suit = guard ? palette.rose : palette.teal;
    box(group, 0, 1.02, 0, 0.55, 0.66, 0.32, suit);
    const head = sphere(
      group,
      0,
      1.62,
      0,
      0.25,
      guard ? palette.rose : palette.skin,
    );
    const arms: THREE.Group[] = [],
      legs: THREE.Group[] = [];
    for (const direction of [-1, 1]) {
      const leg = new THREE.Group();
      leg.position.set(direction * 0.15, 0.74, 0);
      group.add(leg);
      box(leg, 0, -0.35, 0, 0.23, 0.65, 0.23, suit);
      box(leg, 0, -0.69, 0.055, 0.25, 0.12, 0.38, palette.white);
      legs.push(leg);
      const arm = new THREE.Group();
      arm.position.set(direction * 0.38, 1.29, 0);
      group.add(arm);
      box(arm, 0, -0.28, 0, 0.19, 0.6, 0.22, suit);
      sphere(arm, 0, -0.59, 0, 0.105, guard ? palette.black : palette.skin);
      arms.push(arm);
      box(group, direction * 0.2, 1.03, 0.17, 0.04, 0.58, 0.018, palette.white);
    }
    if (guard) {
      const mask = sphere(group, 0, 1.62, 0.18, 0.18, palette.black);
      mask.scale.z = 0.35;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.075, 0.011, 6, 24),
        palette.white,
      );
      ring.position.set(0, 1.64, 0.257);
      group.add(ring);
    } else {
      const hair = sphere(head, 0, 0.13, -0.04, 0.23, palette.black);
      hair.scale.y = 0.55;
      for (const x of [-0.08, 0.08])
        sphere(group, x, 1.63, 0.238, 0.02, palette.black);
      sign(group, "370", 0.13, 1.17, 0.17, 0.19, 0.08, "#ebecd5", "#234b41");
      const number = sign(
        group,
        "370",
        0,
        1.1,
        -0.17,
        0.39,
        0.2,
        "#297d72",
        "#e8efdb",
      );
      number.mesh.rotation.y = Math.PI;
    }
    return {
      group,
      arms,
      animate(
        time: number,
        moving: boolean,
        airborne: boolean,
        pose?: { speed: number; vertical: number; landing: number; dt: number },
      ) {
        const speed = pose?.speed ?? 4.5;
        const step = moving
          ? Math.sin(time * 11) * Math.min(0.82, 0.2 + speed * 0.1)
          : 0;
        const falling = airborne && (pose?.vertical ?? 0) < 0;
        const crouch = pose?.landing ? Math.min(0.4, pose.landing * 2) : 0;
        const blend = pose ? 1 - Math.exp(-pose.dt * 18) : 1;
        const angles = [
          airborne ? (falling ? 0.25 : -0.65) : step + crouch,
          airborne ? (falling ? 0.35 : 0.45) : -step + crouch,
        ];
        for (let i = 0; i < 2; i++) {
          legs[i].rotation.x += (angles[i] - legs[i].rotation.x) * blend;
          const arm = airborne
            ? falling
              ? -0.9
              : -0.5
            : (i === 0 ? -step : step) * 0.75;
          arms[i].rotation.x += (arm - arms[i].rotation.x) * blend;
          arms[i].rotation.z +=
            ((falling ? (i === 0 ? -0.35 : 0.35) : 0) - arms[i].rotation.z) *
            blend;
        }
      },
    };
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(92, 106), palette.mint);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.06, 5);
  floor.receiveShadow = true;
  root.add(floor);
  // Walkways tie every destination to the same physical compound.
  box(root, 0, -0.015, 5, 6, 0.04, 96, palette.cream);
  for (const z of [-4, 25, 49])
    box(root, 0, -0.01, z, 82, 0.04, 4, palette.cream);
  for (const x of [-28, 25])
    box(root, x, -0.015, 13, 4, 0.04, 73, palette.cream);
  for (let i = -40; i < 54; i += 4) {
    box(root, -2.85, 0.014, i, 0.07, 0.018, 1.4, palette.rose);
    box(root, 2.85, 0.014, i, 0.07, 0.018, 1.4, palette.rose);
  }
  for (const x of [-45, 45]) box(root, x, 3, 5, 1, 6, 105, palette.pink, true);
  box(root, 0, 3, -46, 91, 6, 1, palette.blue, true);
  box(root, 0, 3, 57, 91, 6, 1, palette.blue, true);
  // The dormitory has a real north/south passage through its middle.
  box(root, -8, 3, 0, 0.4, 6, 12, palette.blue, true);
  box(root, 8, 3, 0, 0.4, 6, 12, palette.pink, true);
  for (const x of [-5, 5]) box(root, x, 3, -6, 6, 6, 0.4, palette.pink, true);
  box(root, 0, 5.5, -6, 4, 1, 0.4, palette.pink, true);
  sign(root, "THE DORMITORY", 0, 4.7, -5.76, 5.5, 1);
  sign(root, "WELCOME, PLAYER 370", 0, 2.2, -0.9, 3, 0.68);
  box(root, 0, 0.55, -1, 3, 1.1, 0.6, palette.dark, true);
  for (const x of [-5.5, 5.5])
    for (const z of [-3.4, 1.1]) {
      for (const dx of [-0.7, 0.7])
        for (const dz of [-1.45, 1.45])
          cylinder(root, x + dx, 2.4, z + dz, 0.045, 4.8, palette.dark);
      for (let level = 0; level < 3; level++) {
        box(root, x, 0.45 + level * 1.5, z, 1.5, 0.14, 3, palette.dark);
        box(root, x, 0.6 + level * 1.5, z, 1.4, 0.2, 2.9, palette.cream);
        box(
          root,
          x,
          0.75 + level * 1.5,
          z + 0.4,
          1.35,
          0.08,
          2.05,
          palette.teal,
        );
        box(root, x, 0.8 + level * 1.5, z - 1, 1, 0.17, 0.6, palette.white);
      }
      obstacles.push({ x, z, w: 1.6, d: 3, bottom: 0, top: 4.8 });
    }
  character(root, -6, 4, true);
  character(root, 6, 4, true);
  // Staircase: twenty traversable steps and an elevated career landing.
  for (let i = 0; i < 20; i++)
    box(
      root,
      0,
      (i + 1) * 0.105,
      -10.3 - i * 0.6,
      4.8,
      (i + 1) * 0.21,
      0.61,
      i % 2 ? palette.pink : palette.cream,
    );
  box(root, 0, 2.1, -24.5, 4.8, 4.2, 5, palette.pink);
  for (const x of [-2.7, 2.7]) {
    box(root, x, 2.2, -18.3, 0.25, 4.4, 17.5, palette.blue, true);
    tube(
      root,
      [
        [x, 1.3, -10],
        [x, 5.5, -22],
        [x, 5.5, -27],
      ],
      palette.cream,
      0.06,
    );
  }
  box(root, 0, 6.2, -27.5, 10, 4, 0.4, palette.pink, true);
  sign(root, "EVERY LEVEL COUNTS", 0, 6.5, -27.2, 6, 1.1);
  for (const x of [-6.5, 6.5]) {
    box(root, x, 3, -24, 3.5, 6, 7, palette.mint, true);
    for (let i = 0; i < 8; i++)
      box(root, x, 3.2 + i * 0.23, -20.7 - i * 0.7, 3, 0.2, 1, palette.yellow);
  }
  sign(root, "EXPERIENCE  /  2023—NOW", 0, 5.1, -25.5, 3.7, 0.65);
  function building(x: number, z: number, title: string, color: Mat) {
    box(root, x, 3, z - 6, 17, 6, 0.35, color, true);
    for (const dx of [-8.5, 8.5])
      box(root, x + dx, 3, z, 0.35, 6, 12, color, true);
    for (const dx of [-5.5, 5.5])
      box(root, x + dx, 2.5, z + 6, 6, 5, 0.35, color, true);
    box(root, x, 5.5, z + 6, 17, 1, 0.45, color, true);
    sign(root, title, x, 5.48, z + 6.24, 8, 1.0);
    box(root, x, 0.018, z, 16.7, 0.035, 11.7, palette.cream);
  }
  building(25, -15, "THE CONTROL ROOM", palette.blue);
  for (let i = 0; i < 5; i++) {
    const x = 19 + i * 3;
    box(root, x, 2.35, -19, 2.4, 1.65, 0.35, palette.dark, true);
    sign(
      root,
      ["AI BUILDER", "DINEDASH", "MYMIRO", "LIFENODE", "STORY ENGINE"][i],
      x,
      2.4,
      -18.8,
      2.1,
      1.2,
      "#193e3f",
      "#b6f0cb",
    );
    box(root, x, 0.8, -18, 2.65, 1.6, 1.5, palette.dark, true);
  }
  building(25, 13, "THE EQUIPMENT ROOM", palette.mint);
  for (const x of [19, 22, 28, 31]) {
    box(root, x, 1.7, 8, 2.1, 3.4, 1, palette.teal, true);
    sign(
      root,
      ["WEB", "MOBILE", "BACKEND", "AI"][[19, 22, 28, 31].indexOf(x)],
      x,
      2.4,
      8.52,
      1.7,
      0.4,
    );
    for (let i = 0; i < 3; i++)
      box(root, x, 1 + i * 0.5, 8.52, 1.5, 0.06, 0.02, palette.cream);
  }
  sign(root, "TOOLS WITH A TRACK RECORD", 25, 2.5, 10, 4, 0.8);
  // Red Light arena, walkable end to end.
  box(root, -28, 0.025, -23, 19, 0.05, 32, palette.sand);
  for (const x of [-38, -18])
    box(root, x, 2.3, -23, 0.35, 4.6, 32, palette.blue, true);
  box(root, -28, 2.8, -39, 20, 5.6, 0.4, palette.blue, true);
  for (const x of [-34.6, -21.4])
    box(root, x, 2.3, -7, 7, 4.6, 0.4, palette.pink, true);
  sign(root, "RED LIGHT, GREEN LIGHT", -36, 4.0, -6.7, 6, 1);
  for (let i = 0; i < 6; i++)
    box(root, -35.5 + i * 3, 0.061, -23, 0.035, 0.012, 27, palette.cream);
  box(root, -28, 0.069, -34, 18, 0.014, 0.13, palette.rose);
  box(root, -28, 0.069, -11, 18, 0.014, 0.13, palette.white);
  cylinder(root, -28, 3.4, -38, 0.25, 6.8, palette.wood, 0.12);
  tube(
    root,
    [
      [-28, 5, -38],
      [-30, 6.3, -38],
      [-32, 6.6, -37.6],
    ],
    palette.wood,
    0.12,
  );
  tube(
    root,
    [
      [-28, 4, -38],
      [-26, 6, -38],
      [-24, 6.4, -38],
    ],
    palette.wood,
    0.12,
  );
  const doll = new THREE.Group();
  doll.position.set(-28, 0, -36.7);
  dynamic.add(doll);
  for (const x of [-0.38, 0.38]) {
    box(doll, x, 0.65, 0, 0.35, 1.3, 0.4, palette.skin);
    box(doll, x, 0.18, 0.12, 0.46, 0.35, 0.68, palette.black);
    box(doll, x * 2.6, 2.9, 0, 0.28, 1.6, 0.32, palette.skin);
  }
  cylinder(doll, 0, 2.25, 0, 0.9, 1.9, palette.rose, 0.55);
  box(doll, 0, 3.4, 0, 1.3, 0.6, 0.65, palette.yellow);
  const dollHead = new THREE.Group();
  dollHead.position.y = 4.45;
  doll.add(dollHead);
  sphere(dollHead, 0, 0, 0, 0.75, palette.skin);
  sphere(dollHead, 0, 0.35, -0.1, 0.69, palette.black).scale.y = 0.65;
  for (const x of [-0.7, 0.7])
    sphere(dollHead, x, -0.05, -0.05, 0.26, palette.black);
  for (const x of [-0.24, 0.24])
    sphere(dollHead, x, 0.04, 0.7, 0.06, palette.black);
  const redSignal = sign(
    dynamic,
    "WAITING FOR PLAYERS",
    -28,
    8,
    -36.5,
    11,
    1.1,
  );
  const redTimer = sign(
    dynamic,
    "00:45",
    -28,
    6.3,
    -36.5,
    5.5,
    1.25,
    "#151d22",
    "#fff2cd",
  );
  // Two physical signal heads remain readable on either side of the doll.
  const trafficLights = [-31, -25].map((x) => {
    cylinder(dynamic, x, 1.7, -36, 0.09, 3.4, palette.black);
    box(dynamic, x, 4.25, -36, 0.95, 2.25, 0.5, palette.black);
    const lamps = [0xff3535, 0x50ff83].map((color, index) => {
      const material = new THREE.MeshBasicMaterial({
        color,
        toneMapped: false,
      });
      const lamp = sphere(dynamic, x, 4.8 - index * 1.1, -35.7, 0.35, material);
      lamp.scale.z = 0.4;
      return material;
    });
    return lamps;
  });
  function updateTrafficLights(stop: boolean) {
    for (const lamps of trafficLights) {
      lamps.forEach((lamp, index) => {
        const lit = index === (stop ? 0 : 1);
        lamp.color.setHex(lit ? (index === 0 ? 0xff3535 : 0x50ff83) : 0x25282a);
      });
    }
  }
  const armedGuards = [-36, -20].map((x) => {
    const guard = character(dynamic, x, -36, true);
    const rifle = new THREE.Group();
    rifle.position.set(0.15, 1.18, 0.2);
    guard.group.add(rifle);
    box(rifle, 0, 0, 0.14, 0.17, 0.16, 0.55, palette.black);
    box(rifle, 0, -0.02, -0.23, 0.13, 0.2, 0.27, palette.dark);
    box(rifle, 0, -0.18, 0.1, 0.09, 0.26, 0.13, palette.black).rotation.x =
      -0.25;
    const barrel = cylinder(rifle, 0, 0.025, 0.64, 0.035, 0.58, palette.black);
    barrel.rotation.x = Math.PI / 2;
    box(rifle, 0, 0.12, 0.34, 0.055, 0.1, 0.05, palette.black);
    const flash = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xffdd82 }),
    );
    flash.scale.set(0.7, 0.7, 1.8);
    flash.position.set(0, 0.025, 0.99);
    rifle.add(flash);
    flash.visible = false;
    const muzzle = new THREE.Object3D();
    muzzle.position.copy(flash.position);
    rifle.add(muzzle);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(6), 3),
    );
    const tracer = new THREE.Line(
      lineGeometry,
      new THREE.LineBasicMaterial({
        color: 0xffe4b0,
        transparent: true,
        opacity: 0.85,
      }),
    );
    tracer.frustumCulled = false;
    tracer.visible = false;
    dynamic.add(tracer);
    const bullet = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xffdf8a }),
    );
    bullet.visible = false;
    dynamic.add(bullet);
    const bloodMaterial = new THREE.MeshBasicMaterial({
      color: 0x9c1525,
      transparent: true,
    });
    const bloodGeometry = new THREE.SphereGeometry(0.055, 6, 4);
    const blood = Array.from({ length: 14 }, (_, j) => {
      const mesh = new THREE.Mesh(bloodGeometry, bloodMaterial);
      mesh.visible = false;
      dynamic.add(mesh);
      const angle = j * 2.39996;
      return {
        mesh,
        velocity: new THREE.Vector3(
          Math.cos(angle) * (0.5 + (j % 3) * 0.2),
          0.7 + (j % 4) * 0.25,
          Math.sin(angle) * 0.7,
        ),
      };
    });
    return {
      guard: guard.group,
      arms: guard.arms,
      rifle,
      flash,
      muzzle,
      tracer,
      bullet,
      blood,
      bloodMaterial,
      origin: new THREE.Vector3(),
      impact: new THREE.Vector3(),
      previousAge: -1,
    };
  });
  function updateElimination(
    target: THREE.Vector3,
    time: number,
    reduced: boolean,
  ) {
    for (let i = 0; i < armedGuards.length; i++) {
      const shot = armedGuards[i];
      const {
        guard,
        arms,
        rifle,
        flash,
        muzzle,
        tracer,
        bullet,
        blood,
        bloodMaterial,
        origin,
        impact,
      } = shot;
      const age = time - [0.16, 0.62][i];
      const firing = time >= 0 && age >= 0 && age < 0.18;
      const raise = time < 0 ? 0 : THREE.MathUtils.smoothstep(time, 0, 0.16);
      guard.rotation.y =
        time >= 0
          ? Math.atan2(target.x - guard.position.x, target.z - guard.position.z)
          : 0;
      arms.forEach((arm, j) => {
        arm.rotation.x = -raise * 1.35;
        arm.rotation.z = raise * (j === 0 ? -0.35 : 0.35);
      });
      rifle.rotation.x =
        (1 - raise) * 0.45 -
        (firing ? Math.sin((age / 0.18) * Math.PI) * 0.12 : 0);
      rifle.position.z =
        0.2 - (firing ? Math.sin((age / 0.18) * Math.PI) * 0.09 : 0);
      if (age >= 0 && shot.previousAge < 0) {
        guard.updateMatrixWorld(true);
        muzzle.getWorldPosition(origin);
        // Aim the second shot lower as the avatar falls.
        impact.set(target.x, target.y + (i === 0 ? 1 : 0.55), target.z);
      }
      flash.visible = firing && age < 0.08 && !reduced;
      const flight = age >= 0 && age < 0.12 && time >= 0;
      tracer.visible = bullet.visible = flight && !reduced;
      if (flight) {
        const fraction = THREE.MathUtils.clamp(age / 0.12, 0, 1);
        bullet.position.lerpVectors(origin, impact, fraction);
        const tail = new THREE.Vector3().lerpVectors(
          origin,
          impact,
          Math.max(0, fraction - 0.22),
        );
        const positions = tracer.geometry.getAttribute(
          "position",
        ) as THREE.BufferAttribute;
        positions.setXYZ(0, tail.x, tail.y, tail.z);
        positions.setXYZ(
          1,
          bullet.position.x,
          bullet.position.y,
          bullet.position.z,
        );
        positions.needsUpdate = true;
      }
      const hitAge = age - 0.12;
      bloodMaterial.opacity = Math.max(0, 1 - hitAge / 0.55);
      for (const { mesh, velocity } of blood) {
        mesh.visible = time >= 0 && hitAge >= 0 && hitAge < 0.55 && !reduced;
        if (mesh.visible) {
          mesh.position.copy(impact).addScaledVector(velocity, hitAge);
          mesh.position.y = Math.max(
            target.y + 0.05,
            mesh.position.y - 3 * hitAge * hitAge,
          );
          mesh.scale.setScalar(1 - hitAge * 0.7);
        }
      }
      shot.previousAge = age;
    }
  }
  // Mingle courtyard: four doors with physical numbered destinations.
  cylinder(root, -28, 0.04, 15, 10.4, 0.08, palette.pink);
  cylinder(root, -28, 0.09, 15, 6, 0.08, palette.yellow);
  const carousel = new THREE.Group();
  carousel.position.set(-28, 0, 15);
  dynamic.add(carousel);
  cylinder(carousel, 0, 0.16, 0, 5.8, 0.12, palette.mint);
  cylinder(carousel, 0, 2.1, 0, 0.17, 4.2, palette.cream);
  obstacles.push({ x: -28, z: 15, w: 0.4, d: 0.4, bottom: 0, top: 4.2 });
  const canopy = new THREE.Mesh(
    new THREE.ConeGeometry(4.7, 1.6, 12),
    palette.rose,
  );
  canopy.position.y = 4.8;
  root.add(canopy);
  canopy.position.x = -28;
  canopy.position.z = 15;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cylinder(
      carousel,
      Math.sin(a) * 4.8,
      1.8,
      Math.cos(a) * 4.8,
      0.055,
      3.6,
      palette.cream,
    );
  }
  for (const room of MINGLE_ROOMS) {
    box(root, room.x, 2, room.z - 1.8, 4, 4, 0.3, palette.blue, true);
    for (const dx of [-2, 2])
      box(root, room.x + dx, 2, room.z, 0.25, 4, 3.7, palette.mint, true);
    box(root, room.x, 3.8, room.z + 1.85, 4.2, 0.4, 0.3, palette.pink, true);
    sign(root, `${room.count} PLAYERS`, room.x, 3.35, room.z + 2.03, 3, 0.7);
    box(root, room.x, 0.04, room.z, 3.8, 0.08, 3.5, palette.cream);
    for (let i = 0; i < room.count - 1; i++) {
      const npc = character(
        root,
        room.x - 1.1 + i * 0.66,
        room.z - 0.8,
        false,
        0.65,
      );
      npc.group.position.y = 0.08;
    }
  }
  sign(root, "MINGLE / ROUND AND ROUND", -28, 5.6, 7.5, 9, 1.1);
  // Sky bridge, ramp, real pit, and movable rope checkpoint.
  box(root, 0, -2.8, 36, 10, 0.15, 19, palette.dark);
  box(root, 0, 1.85, 36.5, 3.8, 0.3, 19, palette.cream);
  for (let i = 0; i < 34; i++)
    box(root, 0, 2.014, 27.2 + i * 0.55, 3.7, 0.025, 0.028, palette.dark);
  for (let i = 0; i < 20; i++)
    box(
      root,
      0,
      (i + 1) * 0.05,
      50.875 - i * 0.25,
      3.8,
      (i + 1) * 0.1,
      0.26,
      palette.mint,
    );
  for (const x of [-2, 2]) {
    box(root, x, 2.7, 36.5, 0.15, 1.4, 19, palette.pink, true);
    for (let i = 0; i < 20; i++)
      box(root, x, 2.2, 27 + i, 0.08, 2, 0.08, palette.cream);
  }
  const ropeRig = new THREE.Group();
  ropeRig.position.set(0, 0, 42);
  dynamic.add(ropeRig);
  for (const x of [-3.5, 3.5]) {
    const npc = character(ropeRig, x, 0, true, 2.2);
    npc.group.position.y = 2;
    box(ropeRig, x, 1, 0, 2, 2, 2, palette.blue);
  }
  const rope = new THREE.Group();
  rope.position.y = 3.4;
  ropeRig.add(rope);
  tube(
    rope,
    [
      [-3.3, 0, 0],
      [-1.5, -1.2, 0],
      [0, -1.37, 0],
      [1.5, -1.2, 0],
      [3.3, 0, 0],
    ],
    palette.yellow,
    0.065,
  );
  const marker = new THREE.Mesh(
    new THREE.RingGeometry(0.6, 1.0, 32),
    new THREE.MeshBasicMaterial({ color: 0xff4c87, side: THREE.DoubleSide }),
  );
  marker.rotation.x = -Math.PI / 2;
  marker.position.y = 2.04;
  ropeRig.add(marker);
  sign(root, "JUMP ROPE / THE SKY BRIDGE", 0, 4.5, 51.5, 9, 1.1);
  // The exit is a contact destination, never a gate out of the experience.
  for (const x of [21, 29]) box(root, x, 3, 36, 0.8, 6, 3, palette.pink, true);
  box(root, 25, 6, 36, 9, 0.8, 3, palette.pink, true);
  sign(root, "THE NEXT CHAPTER", 25, 5.6, 37.6, 7, 1);
  box(root, 25, 0.035, 38, 9, 0.07, 8, palette.cream);
  sign(root, "LET’S BUILD SOMETHING", 25, 2.6, 35.5, 6, 0.9);
  for (const poi of POIS) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.9, 1.02, 32),
      new THREE.MeshBasicMaterial({
        color: 0xf0447d,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(poi.x, poi.y + 0.05, poi.z);
    root.add(ring);
  }
  // Distant playful skyline, lamps, and direction signs.
  for (let i = 0; i < 16; i++) {
    const x = -42 + i * 5.8;
    box(
      root,
      x,
      4 + (i % 4),
      -44,
      4,
      8 + (i % 4) * 2,
      3,
      [palette.pink, palette.blue, palette.mint][i % 3],
    );
  }
  for (const [x, z] of [
    [-10, 9],
    [10, 9],
    [-13, 25],
    [13, 25],
    [-12, -8],
    [12, -8],
    [18, 30],
  ]) {
    cylinder(root, x, 2, z, 0.08, 4, palette.dark);
    sphere(root, x, 4.1, z, 0.3, palette.cream);
  }
  sign(root, "← GAMES   /   WORK →", 9.8, 2.8, 9, 4.5, 0.7);
  cylinder(root, 9.8, 1.2, 8.95, 0.08, 2.4, palette.dark);
  // Merge static geometry by material to keep draw calls bounded.
  const cameraObstacles: Obstacle[] = [];
  function cameraBounds(object: THREE.Object3D) {
    object.updateWorldMatrix(true, true);
    object.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      o.geometry.computeBoundingBox();
      const bounds = o.geometry
        .boundingBox!.clone()
        .applyMatrix4(o.matrixWorld);
      const size = bounds.getSize(new THREE.Vector3()),
        center = bounds.getCenter(new THREE.Vector3());
      cameraObstacles.push({
        x: center.x,
        z: center.z,
        w: size.x,
        d: size.z,
        bottom: bounds.min.y,
        top: bounds.max.y,
      });
    });
  }
  cameraBounds(root);
  const movingCameraObstacles: Obstacle[] = [];
  function updateMovingCameraObstacles() {
    movingCameraObstacles.length = 0;
    // Conservative volumes for the doll and the two moving rope platforms.
    movingCameraObstacles.push({
      x: -28,
      z: -36.7,
      w: 2.3,
      d: 1.7,
      bottom: 0,
      top: 5.3,
    });
    for (const x of [-3.5, 3.5])
      movingCameraObstacles.push({
        x,
        z: ropeRig.position.z,
        w: 2,
        d: 2,
        bottom: 0,
        top: 6,
      });
    movingCameraObstacles.push({
      x: -28,
      z: 15,
      w: 0.34,
      d: 0.34,
      bottom: 0,
      top: 4.2,
    });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + carousel.rotation.y;
      movingCameraObstacles.push({
        x: -28 + Math.sin(angle) * 4.8,
        z: 15 + Math.cos(angle) * 4.8,
        w: 0.11,
        d: 0.11,
        bottom: 0,
        top: 3.6,
      });
    }
    return movingCameraObstacles;
  }
  root.updateMatrixWorld(true);
  const batches = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const oldMeshes: THREE.Mesh[] = [];
  root.traverse((object) => {
    if (object instanceof THREE.Mesh && !Array.isArray(object.material)) {
      const list = batches.get(object.material) ?? [];
      const geo = object.geometry.clone();
      geo.applyMatrix4(object.matrixWorld);
      list.push(geo);
      batches.set(object.material, list);
      oldMeshes.push(object);
    }
  });
  for (const mesh of oldMeshes) {
    mesh.removeFromParent();
    mesh.geometry.dispose();
  }
  for (const [material, geometries] of batches) {
    const merged = mergeGeometries(geometries, false);
    geometries.forEach((g) => g.dispose());
    if (merged) {
      const mesh = new THREE.Mesh(merged, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }
  }
  // Optional CC0 scenery loads after the core world is usable.
  const assetPromises = Object.entries({
    tree_oak: 6,
    tree_pineRoundA: 5,
    plant_bush: 1.2,
    rock_largeA: 1.5,
  })
    .map(async ([name, height], type) => {
      const gltf = await new GLTFLoader().loadAsync(
        `/models/nature/${name}.glb`,
      );
      if (isDisposed()) {
        disposeObject(gltf.scene);
        return;
      }
      const size = new THREE.Box3()
        .setFromObject(gltf.scene)
        .getSize(new THREE.Vector3());
      const scale = height / size.y;
      const points =
        type === 0
          ? [
              [-12, 2],
              [13, -29],
              [38, -4],
              [-41, 31],
              [36, 49],
              [-17, 40],
            ]
          : type === 1
            ? [
                [-40, -42],
                [39, -35],
                [-12, -35],
                [12, 49],
                [39, 26],
              ]
            : type === 2
              ? [
                  [-12, 3],
                  [-13, 1],
                  [13, 4],
                  [36, 6],
                  [38, 8],
                  [-40, 34],
                  [17, 44],
                ]
              : [
                  [-41, 42],
                  [39, -30],
                  [15, -35],
                  [38, 51],
                ];
      for (const [x, z] of points) {
        const model = gltf.scene.clone(true);
        model.scale.setScalar(scale);
        model.position.set(x, 0, z);
        model.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });
        scene.add(model);
        cameraBounds(model);
        if (type < 2)
          obstacles.push({ x, z, w: 1, d: 1, bottom: 0, top: height });
      }
    })
    .map((p) =>
      p.catch(() => {
        /* Core world does not depend on decorative assets. */
      }),
    );
  const player = character(dynamic, 0, 7);
  player.group.rotation.y = Math.PI;
  return {
    player,
    obstacles,
    cameraObstacles,
    updateMovingCameraObstacles,
    dollHead,
    redSignal,
    redTimer,
    updateElimination,
    updateTrafficLights,
    carousel,
    rope,
    ropeRig,
    assetPromises,
    textures,
  };
}
export function disposeObject(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>(),
    materials = new Set<THREE.Material>(),
    textures = new Set<THREE.Texture>();
  root.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      geometries.add(o.geometry);
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        materials.add(m);
        for (const value of Object.values(m))
          if (value instanceof THREE.Texture) textures.add(value);
      }
    }
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
}
