// Original deterministic foliage models; run with node scripts/build-scenery.mjs.
import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { writeFile, mkdir, readFile } from "node:fs/promises";
class FileReaderShim {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
}
globalThis.FileReader = FileReaderShim;
let seed = 370;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const out = new URL("../public/models/polished/", import.meta.url);
await mkdir(out, { recursive: true });
const bark = new THREE.MeshStandardMaterial({ color: 0x655443, roughness: 1 });
const leaves = [0x3c5735, 0x536e3d, 0x72824b].map(
  (color) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.85,
      side: THREE.DoubleSide,
    }),
);
function build(type) {
  const group = new THREE.Group(),
    branches = [],
    foliage = [[], [], []];
  function branch(a, b, r) {
    const direction = b.clone().sub(a);
    const g = new THREE.CylinderGeometry(
      r * 0.45,
      r,
      direction.length(),
      10,
      3,
    );
    g.applyQuaternion(
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize(),
      ),
    );
    g.translate(...a.clone().add(b).multiplyScalar(0.5));
    branches.push(g);
  }
  function leaf(p, size, index) {
    const shape = new THREE.Shape();
    shape.moveTo(0, -size);
    shape.quadraticCurveTo(size * 0.55, -size * 0.4, size * 0.3, size * 0.3);
    shape.quadraticCurveTo(size * 0.2, size * 0.8, 0, size);
    shape.quadraticCurveTo(-size * 0.5, size * 0.4, -size * 0.3, -size * 0.3);
    shape.quadraticCurveTo(-size * 0.3, -size * 0.6, 0, -size);
    const g = new THREE.ShapeGeometry(shape, 3);
    g.rotateX(rand() * Math.PI);
    g.rotateY(rand() * Math.PI * 2);
    g.rotateZ(rand() * Math.PI * 2);
    g.translate(p.x, p.y, p.z);
    foliage[index].push(g);
  }
  const height = type === "bush" ? 1.25 : type === "pine" ? 5.2 : 5.8;
  branch(
    new THREE.Vector3(),
    new THREE.Vector3(0.1, height * 0.9, 0),
    type === "bush" ? 0.09 : 0.22,
  );
  const count = type === "pine" ? 36 : type === "bush" ? 15 : 25;
  for (let i = 0; i < count; i++) {
    const a = i * 2.39996;
    const y =
      type === "pine"
        ? 0.6 + (i / count) * 4
        : type === "bush"
          ? 0.2 + rand() * 0.8
          : 2 + rand() * 3;
    const spread =
      type === "pine"
        ? (1 - y / height) * 1.8
        : type === "bush"
          ? 0.35 + rand() * 0.65
          : 0.6 + rand() * 1.4;
    const tip = new THREE.Vector3(
      Math.cos(a) * spread,
      y + (type === "pine" ? 0.2 : 0.5),
      Math.sin(a) * spread,
    );
    branch(
      new THREE.Vector3(0.05, y * 0.85, 0),
      tip,
      type === "bush" ? 0.03 : 0.06,
    );
    for (let j = 0; j < (type === "pine" ? 55 : 80); j++) {
      const p = tip
        .clone()
        .add(
          new THREE.Vector3(
            (rand() - 0.5) * (type === "bush" ? 0.7 : 1.2),
            (rand() - 0.5) * 0.8,
            (rand() - 0.5) * (type === "bush" ? 0.7 : 1.2),
          ),
        );
      leaf(p, type === "pine" ? 0.12 : 0.14 + rand() * 0.06, j % 3);
    }
  }
  for (const [geometries, material] of [
    [branches, bark],
    ...foliage.map((g, i) => [g, leaves[i]]),
  ]) {
    const merged = mergeGeometries(geometries.map((g) => g.toNonIndexed()));
    const mesh = new THREE.Mesh(merged, material);
    group.add(mesh);
    geometries.forEach((g) => g.dispose());
  }
  return group;
}
for (const type of ["oak", "pine", "bush"]) {
  const data = await new GLTFExporter().parseAsync(build(type), {
    binary: true,
  });
  await writeFile(new URL(type + ".glb", out), Buffer.from(data));
  console.log(type, Math.round(data.byteLength / 1024) + " KB");
}
// Repackage the downloaded CC0 source with embedded textures, no external runtime URLs.
const input = process.argv[2];
if (input) {
  const gltf = JSON.parse(await readFile(input + "/boulder.gltf", "utf8"));
  const chunks = [];
  let offset = 0;
  const add = (bytes) => {
    const start = offset;
    const padded = Buffer.alloc(Math.ceil(bytes.length / 4) * 4);
    bytes.copy(padded);
    chunks.push(padded);
    offset += padded.length;
    return start;
  };
  const data = await readFile(input + "/" + gltf.buffers[0].uri);
  add(data);
  for (const img of gltf.images) {
    const bytes = await readFile(input + "/" + img.uri);
    const start = add(bytes);
    img.bufferView = gltf.bufferViews.length;
    gltf.bufferViews.push({
      buffer: 0,
      byteOffset: start,
      byteLength: bytes.length,
    });
    img.mimeType = img.uri.endsWith(".png") ? "image/png" : "image/jpeg";
    delete img.uri;
  }
  gltf.buffers = [{ byteLength: offset }];
  const json = Buffer.from(JSON.stringify(gltf));
  const j = Buffer.alloc(Math.ceil(json.length / 4) * 4, 32);
  json.copy(j);
  const bin = Buffer.concat(chunks);
  const header = Buffer.alloc(20);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + j.length + bin.length, 8);
  header.writeUInt32LE(j.length, 12);
  header.writeUInt32LE(0x4e4f534a, 16);
  const bh = Buffer.alloc(8);
  bh.writeUInt32LE(bin.length, 0);
  bh.writeUInt32LE(0x004e4942, 4);
  await writeFile(
    new URL("boulder.glb", out),
    Buffer.concat([header, j, bh, bin]),
  );
  console.log("boulder", Math.round(bin.length / 1024) + " KB");
}
