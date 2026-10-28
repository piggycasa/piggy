/** Actual authored-GLB integration check. No browser, renderer, network or game
 * account is used. Run from any cwd: node scripts/visual-physics-check.mjs.
 * --quick reduces the deposit cycles and surface sampling for iteration.
 * Shading/appearance still requires the browser QA owned by the visual task. */
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createCoinSimulation } from '../src/coin-simulation.js';
import { createPiggyBurst } from '../src/piggy-burst.js';
import { createSolanaCoinMarkGeometry, SOLANA_MARKS_PER_COIN, SOLANA_MARK_FACE_Y } from '../src/solana-coin-mark.mjs';

const quick = process.argv.includes('--quick');
const radius = .17;
const coinScale = radius / .14;
const halfHeight = .023 * coinScale;
const slot = { x: -.618, y: 3.13, z: 0 };
const report = { ok: false, quick, model: 'public/models/piggy-bank-glass.glb', radius, halfHeight, slot: {}, burst: [], containment: [] };
const started = performance.now();
const bytes = await fs.readFile(new URL('../public/models/piggy-bank-glass.glb', import.meta.url));
const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
const wrapper = new THREE.Group();
wrapper.add(gltf.scene);
wrapper.rotation.y = Math.PI / 2;
wrapper.updateMatrixWorld(true);
const bounds = new THREE.Box3().setFromObject(wrapper);
const center = bounds.getCenter(new THREE.Vector3());
const normalizationScale = 3.8 / bounds.getSize(new THREE.Vector3()).x;
const normalization = new THREE.Matrix4().makeScale(normalizationScale, normalizationScale, normalizationScale)
  .setPosition(-center.x * normalizationScale, 1.9 - center.y * normalizationScale, -center.z * normalizationScale);
let body;
gltf.scene.traverse(object => {
  if (object.name !== 'Object_9') return;
  body = new THREE.Mesh(object.geometry.clone().applyMatrix4(object.matrixWorld).applyMatrix4(normalization), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
});
assert(body, 'The authored pig body must be present.');
const scene = new THREE.Scene();
const bank = new THREE.Group();
scene.add(bank);
bank.add(body);
body.updateMatrixWorld(true);
function geometryDigest(geometry) {
  const hash = createHash('sha256');
  for (const name of Object.keys(geometry.attributes).sort()) {
    const array = geometry.attributes[name].array;
    hash.update(name).update(new Uint8Array(array.buffer, array.byteOffset, array.byteLength));
  }
  if (geometry.index) {
    const array = geometry.index.array;
    hash.update(new Uint8Array(array.buffer, array.byteOffset, array.byteLength));
  }
  return hash.digest('hex');
}
const sourceDigest = geometryDigest(body.geometry);
const sourceMatrix = body.matrix.toArray();
const ray = new THREE.Raycaster();
const forward = new THREE.Vector3(0, 0, 1);
function insideAuthoredPig(point) {
  ray.set(point, forward);
  let previous = -1, crossings = 0;
  for (const hit of ray.intersectObject(body)) {
    if (Math.abs(hit.distance - previous) <= 1e-5) continue;
    previous = hit.distance;
    crossings++;
  }
  return crossings % 2 === 1;
}
const point = new THREE.Vector3();
const quaternion = new THREE.Quaternion();
function checkSettledContainment(simulation) {
  let outsideCenters = 0, outsideSurfaceSamples = 0;
  const samples = quick ? 6 : 12;
  for (const pose of simulation.getTransforms()) {
    if (pose.visible === false) continue;
    const position = new THREE.Vector3().copy(pose.position);
    if (!insideAuthoredPig(position)) outsideCenters++;
    quaternion.copy(pose.quaternion);
    for (const side of [-1, 1]) {
      for (let index = 0; index < samples; index++) {
        const angle = index * Math.PI * 2 / samples;
        point.set(Math.cos(angle) * radius, side * halfHeight, Math.sin(angle) * radius).applyQuaternion(quaternion).add(position);
        if (!insideAuthoredPig(point)) outsideSurfaceSamples++;
      }
    }
  }
  assert.equal(outsideCenters, 0, 'Settled centers escaped the authored glass cavity.');
  assert.equal(outsideSurfaceSamples, 0, 'Settled cylinder surfaces penetrate the authored glass.');
  return { outsideCenters, outsideSurfaceSamples, surfaceSamplesPerCoin: samples * 2 };
}
function snapshots(simulation) {
  return simulation.getTransforms().filter(pose => pose.visible !== false).map(pose => new THREE.Matrix4().compose(
    new THREE.Vector3().copy(pose.position), new THREE.Quaternion().copy(pose.quaternion), new THREE.Vector3(1, 1, 1),
  ));
}

// Exercise the real slot guide and authored shell, not a synthetic container.
const entrance = await createCoinSimulation({ shellMesh: body, maxCoins: 1, radius, halfHeight });
entrance.setCount(0);
entrance.step(0);
entrance.setCount(1);
entrance.deposit(1);
let slotFrames = 0;
for (let index = 0; index < 800; index++) {
  const active = entrance.step(1 / 90);
  const pose = entrance.getTransforms()[0];
  if (pose?.visible !== false && pose.position.y > slot.y - .19 && pose.position.y < slot.y + .25) {
    slotFrames++;
    assert(Math.abs(pose.position.x - slot.x) < 1e-5 && Math.abs(pose.position.z - slot.z) < 1e-5, 'The entering coin must remain aligned to the actual slot.');
    const normal = new THREE.Vector3(0, 1, 0).applyQuaternion(new THREE.Quaternion().copy(pose.quaternion));
    assert(Math.abs(normal.z) > .999, 'The coin must enter edge-on.');
    assert(halfHeight * 2 < .168, 'The physical thickness must fit the authored slot width.');
  }
  if (!active) break;
}
assert(slotFrames > 0, 'The incoming coin never traversed the slot.');
assert(entrance.getTransforms()[0].position.y < 1.5, 'The coin was caught above the cavity.');
report.slot = { edgeOnFrames: slotFrames, ...checkSettledContainment(entrance) };
entrance.dispose();

// Geometry below is a proxy at the actual coin dimensions. The test checks the
// actual burst's transforms, engraving offsets and immutable borrowed resources;
// it makes no claim about a WebGL material's appearance.
const coinGeometry = new THREE.CylinderGeometry(radius, radius, .042 * coinScale, 32);
const coinMaterial = new THREE.MeshStandardMaterial({ color: 0xd6aa48, metalness: 1, roughness: .28 });
const coinMarkGeometry = createSolanaCoinMarkGeometry({ coinScale });
const coinMarkMaterial = new THREE.MeshStandardMaterial();
for (const [capacity, count, reducedMotion] of [[180, 147, false], [110, 110, true]]) {
  const simulation = await createCoinSimulation({ shellMesh: body, maxCoins: capacity, radius, halfHeight, reducedMotion });
  simulation.setCount(count);
  simulation.step(0);
  const input = snapshots(simulation), inputBefore = input.map(matrix => matrix.toArray());
  const effect = createPiggyBurst({ body, bank, coinGeometry, coinMaterial, coinMarkGeometry, coinMarkMaterial, coinScale, maxCoins: capacity, reducedMotion });
  assert.equal(effect.start(input), true);
  assert.equal(effect.start(input), false, 'A payout must not start twice without reset.');
  const shards = effect.group.children.filter(mesh => mesh.name.startsWith('piggy-shell-shard'));
  assert.equal(shards.reduce((sum, mesh) => sum + mesh.geometry.attributes.position.count / 3, 0), 30208, 'Every authored body triangle must be retained in exactly one patch.');
  assert(shards.every(mesh => mesh.children.length === 0), 'Jagged triangle-edge overlays must be absent.');
  if (!reducedMotion) {
    effect.update(.7);
    assert(shards.every(mesh => !mesh.visible), 'The glass disassembly must fully fade before .7 seconds.');
    effect.update(3);
  }
  assert.equal(effect.update(.1), false, 'The effect must stop within3.6 seconds or immediately for reduced motion.');
  const coins = effect.group.getObjectByName('piggy-prize-burst-coins');
  const marks = effect.group.getObjectByName('piggy-prize-burst-sol-marks');
  const glints = effect.group.getObjectByName('jackpot-coin-glints');
  assert.equal(coins.count, count);
  assert.equal(marks.count, count * SOLANA_MARKS_PER_COIN, 'Every coin retains one complete official SOL emblem on each face.');
  assert.equal(glints.geometry.drawRange.count, 8);
  assert(Math.abs(coins.material.emissiveIntensity - .04) < 1e-10);
  assert(Math.abs(coins.material.envMapIntensity - 1) < 1e-10);
  const poses = [], heroes = [];
  const matrix = new THREE.Matrix4(), mark = new THREE.Matrix4(), inverse = new THREE.Matrix4();
  for (let index = 0; index < count; index++) {
    coins.getMatrixAt(index, matrix);
    assert(matrix.elements.every(Number.isFinite));
    const position = new THREE.Vector3().setFromMatrixPosition(matrix);
    poses.push({ position, matrix: matrix.clone() });
    if (position.y > 1.5) heroes.push(position);
    inverse.copy(matrix).invert();
    for (let side = 0; side < SOLANA_MARKS_PER_COIN; side++) {
      marks.getMatrixAt(index * SOLANA_MARKS_PER_COIN + side, mark);
      mark.premultiply(inverse);
      const offset = new THREE.Vector3().setFromMatrixPosition(mark);
      assert(Math.abs(offset.y - (side ? -1 : 1) * SOLANA_MARK_FACE_Y * coinScale) < 1e-6, 'A face engraving floats above or clips into its scaled coin.');
      assert(Math.abs(offset.x) < 1e-6 && Math.abs(offset.z) < 1e-6, 'The complete SOL emblem must stay centered on its coin face.');
      const outward = new THREE.Vector3(0,1,0).transformDirection(mark);
      assert(Math.abs(outward.y - (side ? -1 : 1)) < 1e-6, 'Each full emblem must face outward without a mirrored scale.');
      assert(mark.determinant() > 0, 'Coin emblems must use rotations, not a reflection.');
    }
  }
  assert.equal(heroes.length, 24);
  assert(Math.max(...heroes.map(point => point.y)) <= 3.21, 'The held prize arc rises into the feedback banner area.');
  assert(Math.min(...heroes.map(point => point.y)) >= 1.6, 'The lower hero arc merges with the treasure pile.');
  let minimumSpacing = Infinity;
  for (let a = 0; a < heroes.length; a++) for (let b = a + 1; b < heroes.length; b++) {
    minimumSpacing = Math.min(minimumSpacing, Math.hypot(heroes[a].x - heroes[b].x, heroes[a].y - heroes[b].y));
  }
  assert(minimumSpacing >= .4, 'Enlarged prize coins crowd together in the held arcs.');
  let maximumNdc = 0;
  for (const [width, height] of [[441, 381], [418, 218], [1400, 500], [750, 162]]) {
    const camera = new THREE.PerspectiveCamera(47, width / height, .1, 60);
    const vertical = THREE.MathUtils.degToRad(47), horizontal = 2 * Math.atan(Math.tan(vertical / 2) * width / height);
    const distance = Math.max(4.9 / (2 * Math.tan(vertical / 2)), 4.8 / (2 * Math.tan(horizontal / 2))) * 1.035;
    for (const yaw of [-.13, 0, .13]) for (const pitch of [-.045, 0, .045]) {
      const direction = new THREE.Vector3(0, 2.3, 8.5).normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
      direction.y += pitch;
      camera.position.copy(direction.normalize()).multiplyScalar(distance * .985).add(new THREE.Vector3(0, 1.9, 0));
      camera.lookAt(0, 1.9, 0);
      camera.updateMatrixWorld();
      for (const pose of poses) {
        // Check whole hero coin surfaces, not only center-point bounds.
        if (pose.position.y <= 1.5) continue;
        const faceNormal = new THREE.Vector3(0, 1, 0).transformDirection(pose.matrix);
        const toCamera = camera.position.clone().sub(pose.position).normalize();
        assert(faceNormal.dot(toCamera) > .8, 'A held hero coin turns its printed face away from the camera.');
        for (const side of [-1, 1]) for (let index = 0; index < 12; index++) {
          const angle = index * Math.PI / 6;
          point.set(Math.cos(angle) * radius, side * halfHeight, Math.sin(angle) * radius).applyMatrix4(pose.matrix).project(camera);
          maximumNdc = Math.max(maximumNdc, Math.abs(point.x), Math.abs(point.y));
          assert(Math.abs(point.x) < .95 && Math.abs(point.y) < .95, 'A held prize coin is clipped at an audited stage aspect ratio.');
        }
      }
    }
  }
  assert.deepEqual(input.map(matrix => matrix.toArray()), inputBefore, 'Payout animation mutated the live coin matrices.');
  assert.equal(coinMaterial.roughness, .28, 'Borrowed regular coin material was modified.');
  effect.reset();
  assert.equal(effect.group.visible, false);
  assert.equal(effect.start(input), true);
  effect.dispose();
  assert(!bank.children.includes(effect.group));
  report.burst.push({ capacity, reducedMotion, heroCoins: heroes.length, lowerPileCoins: count - heroes.length, glints: 8, minimumSpacing, maximumNdc });
  simulation.dispose();
}

// Actual rigid-body stress: physical coins are repeatedly recycled through the
// authored slot at the visual cap. Every final cylinder is sampled against the
// actual GLB by ray crossing, in addition to active-frame cavity bounds.
for (const capacity of [110, 180]) {
  const simulation = await createCoinSimulation({ shellMesh: body, maxCoins: capacity, radius, halfHeight });
  let desired = capacity, minimumY = Infinity, maximumY = -Infinity, frames = 0;
  simulation.setCount(desired);
  simulation.step(0);
  const checkpoints = [checkSettledContainment(simulation)];
  const cycles = quick ? 1 : 3;
  for (let cycle = 0; cycle < cycles; cycle++) {
    desired += 12;
    simulation.setCount(desired);
    simulation.deposit(12);
    for (let index = 0; index < 800; index++) {
      const active = simulation.step(1 / 90);
      frames++;
      for (const pose of simulation.getTransforms()) {
        if (pose.visible === false) continue;
        assert(Object.values(pose.position).every(Number.isFinite));
        minimumY = Math.min(minimumY, pose.position.y);
        maximumY = Math.max(maximumY, pose.position.y);
        assert(pose.position.y >= .649, 'A coin escaped below the interior floor.');
        assert(Math.abs(pose.position.x) < 2.1 && Math.abs(pose.position.z) < 1.8, 'A coin escaped the side cavity bounds.');
      }
      if (!active) break;
    }
    checkpoints.push(checkSettledContainment(simulation));
  }
  assert.equal(simulation.count, capacity, 'Recycled deposits must never add duplicate visual coins.');
  report.containment.push({ capacity, cycles, frames, minimumY, maximumY, checkpoints });
  simulation.dispose();
}
assert.equal(geometryDigest(body.geometry), sourceDigest, 'Physics or payout mutated the authored body geometry.');
assert.deepEqual(body.matrix.toArray(), sourceMatrix, 'Physics or payout mutated the authored body transform.');
for (const resource of [coinGeometry, coinMaterial, coinMarkGeometry, coinMarkMaterial, body.geometry, body.material]) resource.dispose();
gltf.scene.traverse(object => {
  if (!object.isMesh) return;
  object.geometry.dispose();
  for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
});
report.ok = true;
report.elapsedMs = Math.round(performance.now() - started);
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
