import * as THREE from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";

export type AvatarPose = {
  speed: number;
  vertical: number;
  landing: number;
  dt: number;
};

/** Adapt the supplied Tommy rig; gameplay owns translation, heading and death. */
export function createPlayerAvatar(gltf: GLTF) {
  const model = gltf.scene;
  const bones: THREE.Bone[] = [];
  model.traverse((object) => {
    if (object instanceof THREE.Bone) bones.push(object);
    if (object instanceof THREE.Mesh) {
      object.castShadow = true;
      object.receiveShadow = true;
      // Animated limbs can leave the bounds calculated at load time.
      object.frustumCulled = false;
    }
  });
  const hips = bones.find((bone) => /Hips/.test(bone.name));
  const source = gltf.animations[0];
  if (!hips || !source)
    throw new Error("Tommy model is missing its rig or walk clip");
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model, true);
  const height = bounds.max.y - bounds.min.y;
  const visual = new THREE.Group();
  visual.name = "Tommy Vercetti";
  const scale = 1.8 / height;
  visual.scale.setScalar(scale);
  model.position.add(
    new THREE.Vector3(
      -(bounds.min.x + bounds.max.x) / 2,
      -bounds.min.y,
      -(bounds.min.z + bounds.max.z) / 2,
    ),
  );
  visual.add(model);

  // The first 36 frames are a full stride; the rest of the source turns around.
  const walk = THREE.AnimationUtils.subclip(source, "walk", 0, 37, 30);
  walk.duration = 1.2;
  for (const track of walk.tracks) {
    const width = track.getValueSize();
    // Close the stride seamlessly.
    track.values.set(track.values.slice(0, width), track.values.length - width);
    if (track.name === hips.name + ".position") {
      let mean = 0;
      for (let i = 1; i < track.values.length; i += 3) mean += track.values[i];
      mean /= track.values.length / 3;
      for (let i = 0; i < track.values.length; i += 3) {
        track.values[i] = hips.position.x;
        track.values[i + 1] = hips.position.y + track.values[i + 1] - mean;
        track.values[i + 2] = hips.position.z;
      }
    }
  }

  // Pose offsets are expressed in the model's upright coordinates, then
  // transformed into each bone parent's axes (Mixamo arms have rotated axes).
  const rest = new Map(bones.map((bone) => [bone, bone.quaternion.clone()]));
  const parentRotation = new Map(
    bones.map((bone) => [
      bone,
      bone.parent!.getWorldQuaternion(new THREE.Quaternion()).invert(),
    ]),
  );
  function poseClip(name: string, airborne: boolean, falling = false) {
    const tracks: THREE.KeyframeTrack[] = [];
    for (const bone of bones) {
      const q = rest.get(bone)!.clone();
      let x = 0,
        z = 0;
      if (/LeftArm_/.test(bone.name)) z = airborne ? -0.85 : -1.38;
      if (/RightArm_/.test(bone.name)) z = airborne ? 0.85 : 1.38;
      if (airborne) {
        if (/UpLeg/.test(bone.name)) x = falling ? -0.12 : -0.48;
        if (/(Left|Right)Leg_/.test(bone.name)) x = falling ? 0.25 : 0.85;
        if (/ForeArm/.test(bone.name)) x = -0.3;
      }
      for (const [axis, angle] of [
        [new THREE.Vector3(0, 0, 1), z],
        [new THREE.Vector3(1, 0, 0), x],
      ] as const) {
        axis.applyQuaternion(parentRotation.get(bone)!);
        q.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, angle));
      }
      tracks.push(
        new THREE.QuaternionKeyframeTrack(
          bone.name + ".quaternion",
          [0, 1],
          [...q.toArray(), ...q.toArray()],
        ),
      );
      const p = bone.position.toArray();
      tracks.push(
        new THREE.VectorKeyframeTrack(
          bone.name + ".position",
          [0, 1],
          [...p, ...p],
        ),
      );
    }
    return new THREE.AnimationClip(name, 1, tracks);
  }
  const mixer = new THREE.AnimationMixer(model);
  const actions = [
    poseClip("idle", false),
    walk,
    poseClip("jump", true),
    poseClip("fall", true, true),
  ].map((clip, index) =>
    mixer
      .clipAction(clip)
      .setEffectiveWeight(index === 0 ? 1 : 0)
      .play(),
  );
  mixer.update(0);
  visual.updateMatrixWorld(true);
  return {
    visual,
    animate(
      _time: number,
      moving: boolean,
      airborne: boolean,
      pose?: AvatarPose,
    ) {
      const dt = Math.min(pose?.dt ?? 0, 0.05);
      const state = airborne
        ? (pose?.vertical ?? 0) < 0
          ? 3
          : 2
        : moving
          ? 1
          : 0;
      const blend = 1 - Math.exp(-dt * 14);
      actions.forEach((action, index) => {
        action.setEffectiveWeight(
          THREE.MathUtils.lerp(
            action.getEffectiveWeight(),
            index === state ? 1 : 0,
            blend,
          ),
        );
      });
      actions[1].setEffectiveTimeScale(
        THREE.MathUtils.clamp((pose?.speed ?? 0) / 1.8, 0.6, 2.8),
      );
      mixer.update(dt);
    },
    dispose() {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
    },
  };
}
