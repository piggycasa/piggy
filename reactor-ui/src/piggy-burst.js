import * as THREE from 'three';
import { setSolanaCoinMarkMatrix, SOLANA_MARKS_PER_COIN } from './solana-coin-mark.mjs';

/**
 * Settlement-only visual effect. Shards retain triangles from tomgeurts'
 * Piggy Bank Glass, CC BY 4.0; attribution: /asset-credits.html.
 *
 * The helper adds its group to bank. Coin input is an array of bank-local
 * Matrix4 snapshots or { position, quaternion, scale?, visible? } records.
 * The owner hides/restores the intact body, face details and regular coins.
 * No source geometry, instance matrix, game state or physics body is modified.
 * update takes seconds, owns no animation loop, and returns false after 3.6s.
 */
export function createPiggyBurst({
  body,
  bank,
  coinGeometry,
  coinMaterial,
  coinMarkGeometry,
  coinMarkMaterial,
  maxCoins = 160,
  coinScale = 1,
  reducedMotion = false,
} = {}) {
  if (!body?.isMesh || !body.geometry?.getAttribute('position') || !bank?.isObject3D) {
    throw new TypeError('createPiggyBurst needs the source body mesh and bank group.');
  }
  if (!coinGeometry?.isBufferGeometry || !coinMaterial) {
    throw new TypeError('createPiggyBurst needs coin geometry and material.');
  }
  if ((coinMarkGeometry || coinMarkMaterial) && (!coinMarkGeometry?.isBufferGeometry || !coinMarkMaterial)) {
    throw new TypeError('Burst coin marks need both geometry and material.');
  }

  const capacity = Number.isFinite(maxCoins) ? Math.max(1, Math.min(192, Math.floor(maxCoins))) : 160;
  const markScale = Number.isFinite(coinScale) && coinScale > 0 ? coinScale : 1;
  const sectors = capacity <= 110 ? 4 : 6;
  const duration = 3.6;
  const group = new THREE.Group();
  group.name = 'piggy-settlement-burst';
  group.visible = false;
  bank.add(group);

  const shardMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: .12,
    transmission: 0,
    transparent: true,
    opacity: .12,
    depthWrite: false,
    side: THREE.DoubleSide,
    clearcoat: .1,
    clearcoatRoughness: .12,
    envMapIntensity: .45,
  });
  shardMaterial.forceSinglePass = true;
  const ownedGeometries = [];
  const shards = [];
  const point = new THREE.Vector3();
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();

  // Bake only into a temporary clone: source triangles retain their authored
  // curves and normals, including any transforms between body and bank.
  bank.updateWorldMatrix(true, false);
  body.updateWorldMatrix(true, false);
  const relative = new THREE.Matrix4().copy(bank.matrixWorld).invert().multiply(body.matrixWorld);
  let source = body.geometry.clone().applyMatrix4(relative);
  if (source.index) {
    const expanded = source.toNonIndexed();
    source.dispose();
    source = expanded;
  }
  if (!source.getAttribute('normal')) source.computeVertexNormals();
  source.computeBoundingBox();
  source.boundingBox.getCenter(center);
  source.boundingBox.getSize(size);
  const floor = source.boundingBox.min.y - size.y * .055;
  const positions = source.getAttribute('position');
  const normals = source.getAttribute('normal');
  const buckets = Array.from({ length: sectors * 3 }, () => ({ positions: [], normals: [] }));

  // Every source triangle belongs to exactly one angular/height patch. These
  // are pieces of the actual pig shell, not unrelated particle planes.
  for (let index = 0; index + 2 < positions.count; index += 3) {
    point.set(0, 0, 0);
    for (let corner = 0; corner < 3; corner++) {
      point.x += positions.getX(index + corner) / 3;
      point.y += positions.getY(index + corner) / 3;
      point.z += positions.getZ(index + corner) / 3;
    }
    const angle = Math.atan2(point.z - center.z, point.x - center.x) + Math.PI;
    const sector = Math.min(sectors - 1, Math.floor(angle / (Math.PI * 2) * sectors));
    const band = Math.min(2, Math.max(0, Math.floor((point.y - source.boundingBox.min.y) / Math.max(size.y, .001) * 3)));
    const bucket = buckets[band * sectors + sector];
    for (let corner = 0; corner < 3; corner++) {
      const vertex = index + corner;
      bucket.positions.push(positions.getX(vertex), positions.getY(vertex), positions.getZ(vertex));
      bucket.normals.push(normals.getX(vertex), normals.getY(vertex), normals.getZ(vertex));
    }
  }
  source.dispose();

  function noise(index, salt) {
    const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
    return value - Math.floor(value);
  }

  buckets.forEach((bucket, index) => {
    if (!bucket.positions.length) return;
    const origin = new THREE.Vector3();
    for (let vertex = 0; vertex < bucket.positions.length; vertex += 3) {
      origin.x += bucket.positions[vertex];
      origin.y += bucket.positions[vertex + 1];
      origin.z += bucket.positions[vertex + 2];
    }
    origin.multiplyScalar(3 / bucket.positions.length);
    for (let vertex = 0; vertex < bucket.positions.length; vertex += 3) {
      bucket.positions[vertex] -= origin.x;
      bucket.positions[vertex + 1] -= origin.y;
      bucket.positions[vertex + 2] -= origin.z;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(bucket.positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(bucket.normals, 3));
    geometry.computeBoundingSphere();
    ownedGeometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, shardMaterial);
    mesh.position.copy(origin);
    mesh.name = `piggy-shell-shard-${index}`;
    group.add(mesh);
    const radial = new THREE.Vector3(origin.x - center.x, 0, origin.z - center.z);
    if (radial.lengthSq() < .001) radial.set(Math.cos(index * 2.4), 0, Math.sin(index * 2.4));
    radial.normalize();
    const axis = new THREE.Vector3(noise(index, 1) - .5, noise(index, 2) - .5, noise(index, 3) - .5).normalize();
    shards.push({
      mesh,
      origin,
      radial,
      axis,
      speed: .35 + noise(index, 4) * .25,
      lift: .25 + noise(index, 5) * .35,
      spin: (noise(index, 6) - .5) * .8,
    });
  });

  const materialList = Array.isArray(coinMaterial) ? coinMaterial : [coinMaterial];
  const coinMaterials = materialList.map(material => {
    const clone = material.clone();
    if (clone.emissive) clone.emissive.set(0xffb629);
    clone.emissiveIntensity = .04;
    clone.roughness = .26;
    clone.envMapIntensity = 1;
    return clone;
  });
  const markMaterials = coinMarkMaterial
    ? (Array.isArray(coinMarkMaterial) ? coinMarkMaterial : [coinMarkMaterial]).map(material => material.clone())
    : [];
  const burstCoins = new THREE.InstancedMesh(
    coinGeometry,
    Array.isArray(coinMaterial) ? coinMaterials : coinMaterials[0],
    capacity,
  );
  burstCoins.name = 'piggy-prize-burst-coins';
  burstCoins.count = 0;
  burstCoins.frustumCulled = false;
  burstCoins.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(burstCoins);
  // Retain the complete official Solana emblem on both sides of each coin.
  // Geometry stays owned by the caller; only these material clones are ours.
  const burstMarks = coinMarkGeometry ? new THREE.InstancedMesh(
    coinMarkGeometry,
    Array.isArray(coinMarkMaterial) ? markMaterials : markMaterials[0],
    capacity * SOLANA_MARKS_PER_COIN,
  ) : null;
  if (burstMarks) {
    burstMarks.name = 'piggy-prize-burst-sol-marks';
    burstMarks.count = 0;
    burstMarks.frustumCulled = false;
    burstMarks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(burstMarks);
  }

  const dummy = new THREE.Object3D();
  const matrix = new THREE.Matrix4();
  const spin = new THREE.Quaternion();
  const face = new THREE.Quaternion();
  const faceEuler = new THREE.Euler();
  const markOffset = new THREE.Matrix4();
  const glintPositions = new Float32Array(capacity * 3);
  const glintSeeds = new Float32Array(capacity);
  for (let i = 0; i < capacity; i++) glintSeeds[i] = noise(i, 28);
  const glintGeometry = new THREE.BufferGeometry();
  glintGeometry.setAttribute('position', new THREE.BufferAttribute(glintPositions, 3).setUsage(THREE.DynamicDrawUsage));
  glintGeometry.setAttribute('seed', new THREE.BufferAttribute(glintSeeds, 1));
  const glintMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { elapsed: { value: 0 }, radiance: { value: reducedMotion ? .15 : 0 }, gold: { value: new THREE.Color(0xffe2a0) } },
    vertexShader: `attribute float seed; uniform float elapsed; varying float sparkle;
      void main(){ vec4 view=modelViewMatrix*vec4(position,1.0);
        sparkle=0.35+0.65*pow(0.5+0.5*sin(elapsed*8.0+seed*37.0),5.0);
        gl_PointSize=clamp((1.0+seed)*78.0/-view.z,4.0,18.0);
        gl_Position=projectionMatrix*view; }`,
    fragmentShader: `uniform vec3 gold; uniform float radiance; varying float sparkle;
      void main(){ vec2 p=abs(gl_PointCoord-0.5);
        float core=exp(-dot(p,p)*80.0);
        float x=pow(max(0.0,1.0-p.x*15.0),2.0)*pow(max(0.0,1.0-p.y*2.0),3.0);
        float y=pow(max(0.0,1.0-p.y*15.0),2.0)*pow(max(0.0,1.0-p.x*2.0),3.0);
        float alpha=min(1.0,core+x+y)*sparkle*radiance;
        if(alpha<0.015)discard;
        gl_FragColor=vec4(gold,alpha);
        #include <colorspace_fragment>
      }`,
  });
  const glints = new THREE.Points(glintGeometry, glintMaterial);
  glints.frustumCulled = false;
  glints.name = 'jackpot-coin-glints';
  group.add(glints);
  const prizeLight = new THREE.PointLight(0xffd272, 0, 9, 2);
  prizeLight.position.copy(center).add(new THREE.Vector3(0, 1.3, 2));
  group.add(prizeLight);
  let coinStates = [];
  let elapsed = 0;
  let started = false;
  let disposed = false;

  function syncEnvironment() {
    let ancestor = bank;
    while (ancestor.parent) ancestor = ancestor.parent;
    const bodyMaterial = Array.isArray(body.material) ? body.material[0] : body.material;
    const environment = ancestor.isScene ? ancestor.environment : bodyMaterial?.envMap || null;
    for (const material of [shardMaterial, ...coinMaterials, ...markMaterials]) {
      if (material.envMap === environment) continue;
      material.envMap = environment;
      material.needsUpdate = true;
    }
  }

  function snapshot(input) {
    if (input?.visible === false) return null;
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3(1, 1, 1);
    if (input?.elements?.length === 16) {
      if (!input.elements.every(Number.isFinite)) return null;
      matrix.fromArray(input.elements).decompose(position, quaternion, scale);
    } else if (input?.position && input?.quaternion) {
      position.copy(input.position);
      quaternion.copy(input.quaternion);
      if (Number.isFinite(input.scale)) scale.setScalar(input.scale);
      else if (input.scale) scale.copy(input.scale);
    } else return null;
    if (![position.x, position.y, position.z, quaternion.x, quaternion.y, quaternion.z, quaternion.w, scale.x, scale.y, scale.z].every(Number.isFinite)) return null;
    quaternion.normalize();
    return { position, quaternion, scale };
  }

  function placeCoins(time) {
    coinStates.forEach((coin, index) => {
      dummy.position.copy(coin.position);
      dummy.quaternion.copy(coin.quaternion);
      dummy.scale.copy(coin.scale);
      const progress = reducedMotion ? 1 : THREE.MathUtils.clamp((time - coin.delay) / (duration - coin.delay), 0, 1);
      const travel = 1 - (1 - progress) ** 2.7;
      dummy.position.lerp(coin.destination, travel);
      // A few separated prize coins lead the celebration. The rest lift
      // briefly and return to the lower treasure pile instead of crowding one
      // dense horizontal band at the top of the bank.
      dummy.position.y += Math.sin(progress * Math.PI) * coin.arcHeight;
      dummy.position.x += Math.sin(progress * Math.PI) * coin.sway;
      dummy.position.z += Math.sin(progress * Math.PI) * .25;
      spin.setFromAxisAngle(coin.axis, coin.spin * Math.sin(progress * Math.PI * .5));
      dummy.quaternion.multiply(spin);
      const faceProgress = THREE.MathUtils.smoothstep(progress, .55, 1);
      if (coin.hero) {
        // Local-Y roll keeps the printed face toward the camera. Limit the
        // roll so the SOL bars read as an engraving, not random black stripes.
        face.setFromEuler(faceEuler.set(Math.PI / 2 - .18, coin.faceAngle, 0));
        dummy.quaternion.slerp(face, faceProgress);
      } else {
        dummy.quaternion.slerp(coin.quaternion, faceProgress);
      }
      dummy.updateMatrix();
      burstCoins.setMatrixAt(index, dummy.matrix);
      if (burstMarks) {
        for (let side = 0; side < SOLANA_MARKS_PER_COIN; side++) {
          setSolanaCoinMarkMatrix(markOffset, dummy.matrix, side, markScale);
          burstMarks.setMatrixAt(index * SOLANA_MARKS_PER_COIN + side, markOffset);
        }
      }
      if (coin.glintIndex >= 0) {
        const glint = coin.glintIndex * 3;
        glintPositions[glint] = dummy.position.x;
        glintPositions[glint + 1] = dummy.position.y + .06;
        glintPositions[glint + 2] = dummy.position.z + .18;
      }
    });
    burstCoins.count = coinStates.length;
    burstCoins.instanceMatrix.needsUpdate = true;
    if (burstMarks) {
      burstMarks.count = coinStates.length * SOLANA_MARKS_PER_COIN;
      burstMarks.instanceMatrix.needsUpdate = true;
    }
    glintGeometry.setDrawRange(0, Math.min(8, coinStates.filter(coin => coin.hero).length));
    glintGeometry.attributes.position.needsUpdate = true;
    glintMaterial.uniforms.elapsed.value = time;
    const pulse = Math.sin(Math.min(1, time / duration) * Math.PI);
    const reveal = THREE.MathUtils.smoothstep(time, .25, .9);
    glintMaterial.uniforms.radiance.value = reducedMotion ? .15 : reveal * (.28 + .4 * pulse);
    for (const material of coinMaterials) {
      material.emissiveIntensity = reducedMotion ? .04 : .04 + .24 * pulse;
      material.envMapIntensity = reducedMotion ? 1 : 1 + .15 * pulse;
    }
    prizeLight.intensity = reducedMotion ? .3 : .3 + 1.5 * pulse;
  }

  function placeShards(time) {
    const fade = reducedMotion ? 0 : THREE.MathUtils.smoothstep(time, .12, .65);
    shards.forEach(shard => {
      const mesh = shard.mesh;
      mesh.visible = reducedMotion || fade < 1;
      mesh.position.copy(shard.origin);
      mesh.quaternion.identity();
      if (reducedMotion) {
        mesh.position.addScaledVector(shard.radial, Math.min(size.x, size.z) * .035);
        mesh.position.y += shard.origin.y > center.y ? .06 : -.02;
        mesh.quaternion.setFromAxisAngle(shard.axis, .04);
        return;
      }
      const travel = (1 - Math.exp(-4 * time)) / 4;
      mesh.position.addScaledVector(shard.radial, shard.speed * travel);
      mesh.position.y = Math.max(floor + .1, shard.origin.y + shard.lift * time - .8 * time * time);
      mesh.quaternion.setFromAxisAngle(shard.axis, shard.spin * Math.min(time, .65));
    });
    // Real shell patches dissolve quickly. No sharp triangulation lines or
    // opaque plates remain behind the held golden prize composition.
    shardMaterial.opacity = reducedMotion ? .06 : THREE.MathUtils.lerp(.12, 0, fade);
  }

  function start(coinTransforms = []) {
    if (disposed || started) return false;
    if (!Array.isArray(coinTransforms)) throw new TypeError('Burst coin transforms must be an array of snapshots.');
    started = true;
    elapsed = 0;
    coinStates = [];
    for (const input of coinTransforms) {
      if (coinStates.length >= capacity) break;
      const coin = snapshot(input);
      if (!coin) continue;
      const index = coinStates.length;
      coin.delay = noise(index, 24) * .35;
      coin.sway = (noise(index, 25) - .5) * .32;
      coin.arcHeight = .55 + noise(index, 9) * .3;
      coin.axis = new THREE.Vector3(noise(index, 11) - .5, noise(index, 12) - .5, noise(index, 13) - .5).normalize();
      coin.spin = (noise(index, 14) - .5) * 12;
      coin.faceAngle = (noise(index, 15) - .5) * .8;
      coin.hero = false;
      coin.glintIndex = -1;
      // Keep a genuine loose pile, retaining each source coin's settled pose.
      coin.destination = coin.position.clone();
      coin.destination.x = center.x + (coin.position.x - center.x) * .96;
      coin.destination.z = center.z + (coin.position.z - center.z) * .9 + .18;
      coinStates.push(coin);
    }
    const heroCount = Math.min(24, coinStates.length);
    const outerCount = Math.ceil(heroCount * 13 / 24);
    const innerCount = heroCount - outerCount;
    // Equal arc length, not equal angles: ellipse endpoints otherwise bunch
    // together. These two lanes leave >.40 between .34-wide hero coin faces.
    const arcLanes = [
      { radiusX: 2.05, radiusY: 1.4, span: 1.4, baseY: -.1, depth: .5 },
      { radiusX: 1.78, radiusY: 1.15, span: 1.32, baseY: -.55, depth: .75 },
    ].map(lane => {
      const points = [];
      let length = 0;
      for (let step = 0; step <= 128; step++) {
        const angle = -lane.span + step * lane.span * 2 / 128;
        const point = new THREE.Vector2(Math.sin(angle) * lane.radiusX, Math.cos(angle) * lane.radiusY);
        if (points.length) length += point.distanceTo(points[points.length - 1].point);
        points.push({ point, length });
      }
      return { ...lane, points, length };
    });
    function pointOnArc(lane, index, count) {
      if (count <= 1) return new THREE.Vector2(0, lane.radiusY);
      const distance = lane.length * index / (count - 1);
      const next = lane.points.findIndex(sample => sample.length >= distance);
      if (next <= 0) return lane.points[0].point.clone();
      const a = lane.points[next - 1], b = lane.points[next];
      return a.point.clone().lerp(b.point, (distance - a.length) / (b.length - a.length));
    }
    const glintCount = Math.min(8, heroCount);
    const glintRanks = new Map(Array.from({ length: glintCount }, (_, index) => [Math.floor(index * heroCount / glintCount), index]));
    for (let rank = 0; rank < heroCount; rank++) {
      const coin = coinStates[Math.floor(rank * coinStates.length / heroCount)];
      const outer = rank < outerCount;
      const rowCount = outer ? outerCount : innerCount;
      const rowIndex = outer ? rank : rank - outerCount;
      const lane = arcLanes[outer ? 0 : 1];
      const arcPoint = pointOnArc(lane, rowIndex, rowCount);
      coin.hero = true;
      coin.glintIndex = glintRanks.get(rank) ?? -1;
      coin.arcHeight = .22 + noise(rank, 10) * .12;
      coin.sway = (noise(rank, 25) - .5) * .5;
      coin.destination.set(
        center.x + arcPoint.x,
        center.y + lane.baseY + arcPoint.y,
        center.z + lane.depth + (rank % 2 ? -.025 : .025),
      );
    }
    syncEnvironment();
    group.visible = true;
    placeShards(0);
    placeCoins(0);
    return true;
  }

  function update(delta) {
    if (disposed || !started) return false;
    syncEnvironment();
    if (reducedMotion || elapsed >= duration) return false;
    elapsed = Math.min(duration, elapsed + (Number.isFinite(delta) ? Math.max(0, delta) : 0));
    placeShards(elapsed);
    placeCoins(elapsed);
    return elapsed < duration;
  }

  function reset() {
    if (disposed) return;
    started = false;
    elapsed = 0;
    coinStates = [];
    group.visible = false;
    burstCoins.count = 0;
    if (burstMarks) burstMarks.count = 0;
    glintGeometry.setDrawRange(0, 0);
    prizeLight.intensity = 0;
    glintMaterial.uniforms.radiance.value = 0;
    shardMaterial.opacity = .12;
  }

  return {
    group,
    start,
    update,
    reset,
    dispose() {
      if (disposed) return;
      reset();
      disposed = true;
      group.removeFromParent();
      ownedGeometries.forEach(geometry => geometry.dispose());
      shardMaterial.dispose();
      coinMaterials.forEach(material => material.dispose());
      markMaterials.forEach(material => material.dispose());
      glintGeometry.dispose(); glintMaterial.dispose();
      burstCoins.dispose();
      burstMarks?.dispose();
    },
  };
}
