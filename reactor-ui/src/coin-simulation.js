import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

let rapierReady;
const FIXED_STEP = 1 / 90;
const SLOT = { x: -.618, y: 3.13, z: 0 };

// A repeatable seed makes refreshes preserve the same initial prize pile.
function randomSource(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Rigid-body coins inside the authored pig mesh. Coordinates are in the bank's
 * local space, so the complete bank can be moved without disturbing the pile.
 *
 * setCount is absolute. Call deposit immediately after setCount for a purchase;
 * the next step reconciles both calls once, rather than adding duplicate coins.
 */
export async function createCoinSimulation({
  shellMesh,
  radius = .14,
  halfHeight = .023,
  maxCoins = 180,
  seed = 0x50494747,
  onImpact,
  reducedMotion = false,
} = {}) {
  if (!shellMesh?.geometry?.getAttribute('position')) {
    throw new TypeError('Coin simulation needs the normalized bank shell mesh.');
  }
  rapierReady ??= RAPIER.init();
  await rapierReady;

  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  const events = new RAPIER.EventQueue(true);
  const colliderEntries = new Map();
  world.timestep = FIXED_STEP;
  world.integrationParameters.numSolverIterations = 8;
  world.integrationParameters.maxCcdSubsteps = 2;
  const capacity = Math.max(1, Math.min(220, Math.floor(maxCoins)));
  const source = shellMesh.geometry;
  const position = source.getAttribute('position');
  const vertices = new Float32Array(position.count * 3);
  const point = new THREE.Vector3();
  shellMesh.updateMatrix();
  for (let i = 0; i < position.count; i++) {
    point.fromBufferAttribute(position, i).applyMatrix4(shellMesh.matrix);
    vertices.set([point.x, point.y, point.z], i * 3);
  }
  const indices = source.index
    ? Uint32Array.from(source.index.array)
    : Uint32Array.from({ length: position.count }, (_, index) => index);
  // The lower source surface includes foot recesses. Replace that portion
  // physically with the interior bowl; retaining both would create opposing
  // contact normals for coins squeezed between the belly and its solid base.
  const upperIndices = [];
  for (let i = 0; i < indices.length; i += 3) {
    if (vertices[indices[i] * 3 + 1] > 1.15
      && vertices[indices[i + 1] * 3 + 1] > 1.15
      && vertices[indices[i + 2] * 3 + 1] > 1.15) {
      upperIndices.push(indices[i], indices[i + 1], indices[i + 2]);
    }
  }
  const shellCollider = RAPIER.ColliderDesc.trimesh(vertices, Uint32Array.from(upperIndices),
    RAPIER.TriMeshFlags.FIX_INTERNAL_EDGES_TWO_SIDED)
    .setFriction(.45).setRestitution(.08);
  world.createCollider(shellCollider);

  // The source's underside includes deep foot pockets and is only a thin
  // surface. The physical cavity stays above those pockets: a shallow curved
  // interior bowl, a thick solid base, and side walls prevent any coin from
  // appearing underneath a leg or tunnelling through a zero-thickness triangle.
  const segments = 16, floorWidth = 2.5, floorDepth = 2.1;
  const heights = new Float32Array((segments + 1) ** 2);
  for (let x = 0; x <= segments; x++) {
    for (let z = 0; z <= segments; z++) {
      const normalizedX = (x / segments - .5) * 2;
      const normalizedZ = (z / segments - .5) * 2;
      heights[x * (segments + 1) + z] = .65 + .26 * normalizedX ** 4 + .23 * normalizedZ ** 4;
    }
  }
  world.createCollider(RAPIER.ColliderDesc.heightfield(segments, segments, heights,
    { x: floorWidth, y: 1, z: floorDepth }, RAPIER.HeightFieldFlags.FIX_INTERNAL_EDGES)
    .setFriction(.52).setRestitution(.08).setContactSkin(.004));
  world.createCollider(RAPIER.ColliderDesc.cuboid(1.45, .3, 1.25)
    .setTranslation(0, .35, 0).setFriction(.6).setContactSkin(.004));
  for (const x of [-1.29, 1.29]) {
    world.createCollider(RAPIER.ColliderDesc.cuboid(.12, .66, 1.22)
      .setTranslation(x, 1.24, 0).setFriction(.4).setContactSkin(.004));
  }
  for (const z of [-1.09, 1.09]) {
    world.createCollider(RAPIER.ColliderDesc.cuboid(1.42, .66, .12)
      .setTranslation(0, 1.24, z).setFriction(.4).setContactSkin(.004));
  }

  let random = randomSource(seed);
  let desired = 0;
  let reconciledAbsolute = 0;
  let pendingDeposits = 0;
  let initialized = false;
  let reset = false;
  let disposed = false;
  let accumulator = 0;
  let simulatedTime = 0;
  let active = false;
  let quietFrames = 0;
  let stillTime = 0;
  let latestRelease = 0;
  let entries = [];
  let transforms = [];
  const edgeRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  const spinEuler = new THREE.Euler();
  const spinQuaternion = new THREE.Quaternion();

  function initialPosition(index) {
    const column = index % 6;
    const row = Math.floor(index / 6) % 5;
    const layer = Math.floor(index / 30);
    return {
      x: (column - 2.5) * .36 + (random() - .5) * .018,
      y: .98 + layer * .36 + random() * .015,
      z: (row - 2) * .36 + (random() - .5) * .018,
    };
  }

  function makeBody(entry, incoming) {
    const at = incoming
      ? { x: SLOT.x, y: SLOT.y + .65, z: SLOT.z }
      : initialPosition(entry.index);
    spinEuler.set(random() * Math.PI, random() * Math.PI * 2, random() * Math.PI);
    spinQuaternion.setFromEuler(spinEuler);
    const rotation = incoming ? edgeRotation : spinQuaternion;
    const desc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(at.x, at.y, at.z)
      .setRotation(rotation)
      .setLinearDamping(.2)
      .setAngularDamping(.35)
      .setCanSleep(true)
      .setCcdEnabled(true);
    const body = entry.body ?? world.createRigidBody(desc);
    if (!entry.body) {
      const collider = world.createCollider(RAPIER.ColliderDesc.cylinder(halfHeight, radius)
        .setMass(.025).setFriction(.52).setRestitution(.15)
        .setActiveEvents(incoming ? RAPIER.ActiveEvents.COLLISION_EVENTS : 0), body);
      entry.collider = collider;
      colliderEntries.set(collider.handle, entry);
    } else {
      body.setEnabled(true);
      body.setTranslation(at, true);
      body.setRotation(rotation, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      entry.collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
    }
    if (incoming) body.setLinvel({ x: 0, y: -.6, z: 0 }, true);
    entry.body = body;
    entry.pendingRelease = false;
    entry.entering = incoming;
    entry.releasedAt = simulatedTime;
    if (incoming) latestRelease = simulatedTime;
    entry.impactReported = !incoming;
    entry.transform.visible = true;
    return body;
  }

  function makeEntry(index, releaseAt = null) {
    const transform = {
      position: { x: 0, y: 0, z: 0 },
      quaternion: { x: 0, y: 0, z: 0, w: 1 },
      visible: releaseAt === null,
    };
    const entry = { index, releaseAt, body: null, entering: false, transform };
    entries.push(entry);
    transforms.push(transform);
    if (releaseAt === null) makeBody(entry, false);
    return entry;
  }

  function updateTransforms() {
    for (const entry of entries) {
      if (!entry.body || entry.pendingRelease) continue;
      const at = entry.body.translation();
      const rotation = entry.body.rotation();
      Object.assign(entry.transform.position, at);
      Object.assign(entry.transform.quaternion, rotation);
    }
  }

  function removeEntry(entry) {
    if (entry.body) {
      colliderEntries.delete(entry.collider.handle);
      world.removeRigidBody(entry.body);
    }
  }

  function advance(allowEffects) {
    simulatedTime += FIXED_STEP;
    for (const entry of entries) {
      if ((!entry.body || entry.pendingRelease) && entry.releaseAt <= simulatedTime) makeBody(entry, true);
      if (!entry.body || entry.pendingRelease) continue;
      const at = entry.body.translation();
      if (entry.entering) {
        if (at.y > SLOT.y - .19) {
          // The slot is only 0.168 units wide. Guide the coin edge-on until its
          // centre clears the glass, then let normal rigid-body motion take over.
          entry.body.setRotation(edgeRotation, false);
          entry.body.setAngvel({ x: 0, y: 0, z: 0 }, false);
          const velocity = entry.body.linvel();
          entry.body.setLinvel({ x: 0, y: velocity.y, z: 0 }, false);
        } else {
          entry.entering = false;
          entry.body.setAngvel({ x: (random() - .5) * 4, y: (random() - .5) * 3, z: (random() - .5) * 3 }, true);
          entry.body.setLinvel({ x: (random() - .5) * 1.1, y: entry.body.linvel().y, z: (random() - .5) * .9 }, true);
        }
      }
      // Recover a numerical escape without ever displaying a coin outside the
      // bank. This is a backstop for a dropped tab or a pathological contact.
      if (at.y < .14 || Math.abs(at.x) > 2.1 || Math.abs(at.z) > 1.8) {
        entry.body.setTranslation({ x: -.2 + (random() - .5) * .5, y: 1.8, z: (random() - .5) * .5 }, true);
        entry.body.setLinvel({ x: 0, y: -.3, z: 0 }, true);
      }
    }
    world.step(events);
    // Resolve any residual thin-cylinder penetration before transforms reach
    // the renderer. This is a contact projection on the physical cavity, not
    // a later escape/respawn animation; the pile can never show through a leg.
    for (const entry of entries) {
      if (!entry.body || entry.pendingRelease || entry.entering) continue;
      const at = entry.body.translation();
      if (at.y > 1.65) continue;
      const q = entry.body.rotation();
      const axisX = 2 * (q.x * q.y - q.z * q.w);
      const axisY = 1 - 2 * (q.x * q.x + q.z * q.z);
      const axisZ = 2 * (q.y * q.z + q.x * q.w);
      const support = axis => halfHeight * Math.abs(axis) + radius * Math.sqrt(Math.max(0, 1 - axis * axis));
      const x = THREE.MathUtils.clamp(at.x, -1.17 + support(axisX), 1.17 - support(axisX));
      const z = THREE.MathUtils.clamp(at.z, -.97 + support(axisZ), .97 - support(axisZ));
      const floor = .65 + .26 * (x / 1.25) ** 4 + .23 * (z / 1.05) ** 4;
      const y = Math.max(at.y, floor + support(axisY) - .001);
      if (x !== at.x || y !== at.y || z !== at.z) {
        entry.body.setTranslation({ x, y, z }, false);
        const velocity = entry.body.linvel();
        entry.body.setLinvel({
          x: x === at.x ? velocity.x : 0,
          y: y === at.y ? velocity.y : Math.max(0, velocity.y),
          z: z === at.z ? velocity.z : 0,
        }, false);
      }
    }
    events.drainCollisionEvents((first, second, started) => {
      if (!allowEffects || !started) return;
      for (const handle of [first, second]) {
        const entry = colliderEntries.get(handle);
        if (!entry || entry.impactReported || entry.entering) continue;
        const at = entry.body.translation();
        // Ignore contact with the entrance lip. One genuine collision inside
        // the bank produces one impact event for this newly purchased coin.
        if (at.y >= SLOT.y - .45) continue;
        entry.impactReported = true;
        onImpact?.({ position: { x: at.x, y: at.y, z: at.z } });
      }
    });
  }

  function settleInitialPile() {
    // A fixed number of steps makes the initial scene deterministic. Initial
    // bodies begin separated inside the cavity and fall into a loose pile.
    for (let i = 0; i < 300; i++) advance(false);
    for (const entry of entries) entry.body?.sleep();
    updateTransforms();
    active = false;
  }

  function reconcile() {
    const target = Math.min(capacity, desired);
    // At the visual cap, reduced motion already has the complete settled pile.
    // A purchase only changes logical game totals; rebuilding 110+ rigid bodies
    // and repeating the warmup would produce no useful visual change.
    if (initialized && !reset && reducedMotion && pendingDeposits > 0
      && target === capacity && entries.length === capacity) {
      pendingDeposits = 0;
      reconciledAbsolute = desired;
      return;
    }
    if (!initialized || reset || (reducedMotion && pendingDeposits > 0)) {
      entries.forEach(removeEntry);
      entries = [];
      transforms = [];
      random = randomSource(seed);
      for (let i = 0; i < target; i++) makeEntry(i);
      settleInitialPile();
      initialized = true;
      reset = false;
      pendingDeposits = 0;
      reconciledAbsolute = desired;
      return;
    }
    const added = Math.max(0, target - entries.length);
    const animated = Math.min(pendingDeposits, added);
    const staticAdded = added - animated;
    for (let i = 0; i < staticAdded; i++) makeEntry(entries.length);
    if (staticAdded) settleInitialPile();
    for (let i = 0; i < animated; i++) makeEntry(entries.length, simulatedTime + i * .105);

    // Once the displayed pile reaches its cap, recycle an equal number of
    // settled coins. Purchases still pour into the bank; instance count stays
    // bounded and no second visual copy of a purchased coin is created.
    const overflowDrops = Math.min(Math.max(0, pendingDeposits - animated), entries.length, 12);
    if (overflowDrops && desired >= reconciledAbsolute) {
      for (let i = 0; i < overflowDrops; i++) {
        const recycled = entries.shift();
        transforms.shift();
        recycled.releaseAt = simulatedTime + (animated + i) * .105;
        recycled.pendingRelease = true;
        recycled.transform.visible = false;
        recycled.body?.setEnabled(false);
        entries.push(recycled);
        transforms.push(recycled.transform);
      }
    }
    if (animated || overflowDrops) { active = true; quietFrames = 0; stillTime = 0; }
    pendingDeposits = 0;
    reconciledAbsolute = desired;
  }

  return {
    setCount(value) {
      if (disposed) return;
      const next = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
      if (next < desired) { reset = true; pendingDeposits = 0; }
      desired = next;
    },
    deposit(value) {
      if (disposed) return;
      pendingDeposits = Math.min(12, pendingDeposits + Math.max(0, Math.floor(Number(value) || 0)));
    },
    step(delta = 1 / 60) {
      if (disposed) return false;
      reconcile();
      if (!active) return false;
      accumulator += Math.min(.05, Math.max(0, Number(delta) || 0));
      for (let count = 0; accumulator >= FIXED_STEP && count < 5; count++) {
        advance(true);
        accumulator -= FIXED_STEP;
      }
      updateTransforms();
      const pending = entries.some(entry => !entry.body || entry.pendingRelease);
      const awake = entries.some(entry => entry.body && !entry.body.isSleeping());
      const slow = entries.every(entry => {
        if (!entry.body || entry.pendingRelease) return false;
        const linear = entry.body.linvel(), angular = entry.body.angvel();
        return linear.x ** 2 + linear.y ** 2 + linear.z ** 2 < .0036
          && angular.x ** 2 + angular.y ** 2 + angular.z ** 2 < .16;
      });
      stillTime = !pending && slow ? stillTime + Math.min(.05, Math.max(0, delta)) : 0;
      // Thin cylinders can retain imperceptible contact jitter. Stop rendering
      // when settled, with a final timeout for pathological rocking contacts.
      if (!pending && (stillTime > .5 || simulatedTime - latestRelease > 6.5)) {
        for (const entry of entries) entry.body?.sleep();
        active = false;
        return false;
      }
      quietFrames = pending || awake ? 0 : quietFrames + 1;
      active = quietFrames < 2;
      return active;
    },
    getTransforms() { return transforms; },
    get count() { return entries.length; },
    dispose() {
      if (disposed) return;
      disposed = true;
      events.free();
      world.free();
      colliderEntries.clear();
      entries = [];
      transforms = [];
    },
  };
}
