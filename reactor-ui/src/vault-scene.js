import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createTransmissionPass } from './transmission-pass.js';
import { createPiggyBurst } from './piggy-burst.js';
import { createSolanaCoinMarkGeometry, setSolanaCoinMarkMatrix, SOLANA_MARKS_PER_COIN } from './solana-coin-mark.mjs';

/** Artist mesh: tomgeurts / CC BY 4.0. Actual Drei glass shader and Rapier
 * rigid bodies. All model, HDR, fonts and physics code ship with the site. */
export function createVault(container) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 767px), (max-height: 500px) and (max-width: 1100px)').matches;
  const status = document.createElement('div');
  status.className = 'bank-load-status'; status.role = 'status';
  status.textContent = 'Preparing the prize bank…'; container.append(status);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, powerPreference: 'high-performance' });
  } catch {
    status.textContent = '3D preview unavailable. The game is ready to play.';
    return { setCoins() {}, deposit() {}, setEnded() {}, cancelPreview() {}, previewPayout() { return false; }, dispose() { status.remove(); } };
  }
  const canvas = renderer.domElement;
  canvas.className = 'vault-canvas'; canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none';
  container.prepend(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  const backdrop = new THREE.Color(0x4325f5);
  renderer.setClearColor(backdrop, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // A flat scene Color is a framebuffer clear, so Three never tone-maps it.
  // Use the same linear-to-sRGB pipeline for the clear and refracted background;
  // otherwise the refracted backdrop no longer matches the surrounding field.
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1;
  const scene = new THREE.Scene(); scene.background = backdrop;
  const camera = new THREE.PerspectiveCamera(47, 1, .1, 60);
  const resources = new Set();
  const track = resource => { resources.add(resource); return resource; };
  const bank = new THREE.Group(); scene.add(bank);
  let disposed = false, contextLost = false, ready = false, frame = 0;
  let physics, transmission, environmentTarget, burst, bodyMesh;
  const faceMeshes = [];
  let burstStarted = false, previewing = false, previewTimer;
  let desiredCoins = 0, pendingDeposit = 0, ended = false;
  let width = 1, height = 1, distance = 9, lastTime = 0;
  let pointerX = 0, pointerY = 0, viewX = 0, viewY = 0, impact = 0;
  const target = new THREE.Vector3(0, 1.9, 0);
  const viewDirection = new THREE.Vector3(0, 2.3, 8.5).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const frameBounds = new THREE.Box3(new THREE.Vector3(-1.9, .2, -1.4), new THREE.Vector3(1.9, 3.6, 1.4));
  const framePoint = new THREE.Vector3();
  const frameGeometries = [];
  const dummy = new THREE.Object3D(), offset = new THREE.Matrix4();

  // A neutral studio and white/cyan/pink rims describe the clear shell against
  // the saturated arcade field without turning it into an opaque pink object.
  const studio = new THREE.Scene(); studio.background = new THREE.Color(0x141044);
  const panels = new THREE.Group(); studio.add(panels);
  const panelGeometry = track(new THREE.PlaneGeometry(1, 1));
  function lightformer(intensity, position, scale, color = 0xffffff) {
    const mat = track(new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide, toneMapped: false }));
    const panel = new THREE.Mesh(panelGeometry, mat);
    panel.position.set(...position); panel.scale.set(...scale); panel.lookAt(0, 1.8, 0); panels.add(panel);
  }
  lightformer(4.2, [-3.7, 4.8, 4], [2.5, 4.2, 1], 0xf8f9ff);
  lightformer(4.5, [4, 3.1, -2.8], [1.25, 4.6, 1], 0x8ffaff);
  lightformer(.85, [0, 7, 0], [3.5, 2, 1], 0xede5ff);
  lightformer(3, [-3.5, 2.5, -4], [2.2, 4.8, 1], 0xff4d91);
  lightformer(1.6, [1.4, 2.8, 4.2], [.6, 4, 1], 0xff4d91);
  lightformer(2.2, [0, 3, -6], [5, 4, 1], 0xf8f9ff);
  lightformer(.7, [0, 1.8, 6], [4.5, 3.2, 1], 0xf8f9ff);
  lightformer(1.1, [-1.8, 6.2, 3.8], [.4, 3.2, 1], 0xf8f9ff);
  function captureEnvironment() {
    if (disposed) return;
    const generator = new THREE.PMREMGenerator(renderer);
    const next = generator.fromScene(studio, .04, .1, 100);
    const previous = environmentTarget;
    environmentTarget = next;
    scene.environment = next.texture; scene.environmentIntensity = 1;
    for (const resource of resources) {
      if (previous && resource.isMaterial && resource.envMap === previous.texture) {
        resource.envMap = next.texture; resource.needsUpdate = true;
      }
    }
    previous?.dispose();
    generator.dispose();
  }
  captureEnvironment();
  scene.add(new THREE.AmbientLight(0xf8f9ff, .24));
  const fill = new THREE.DirectionalLight(0xf8f9ff, 1.6); fill.position.set(0, 2.4, 6); scene.add(fill);
  const key = new THREE.DirectionalLight(0xf8f9ff, 1.4); key.position.set(-3, 5, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xc7d3ff, .65); rim.position.set(4, 3, -4); scene.add(rim);
  const exhibitTarget = new THREE.Object3D(); exhibitTarget.position.set(0, 1.2, 0); scene.add(exhibitTarget);
  const exhibitSpot = new THREE.SpotLight(0xf8f9ff, 18, 16, Math.PI / 7, .9, 2);
  exhibitSpot.position.set(-1.8, 7.8, 4.5); exhibitSpot.target = exhibitTarget; scene.add(exhibitSpot);
  const poolGeometry = track(new THREE.PlaneGeometry(6.5, 6.5));
  const poolMaterial = track(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { lightColor: { value: new THREE.Color(0x220e9c) } },
    vertexShader: 'varying vec2 poolUV; void main(){poolUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: `varying vec2 poolUV; uniform vec3 lightColor;
      void main(){float radius=length((poolUV-.5)*2.0);float a=exp(-radius*radius*6.0)*.20*(1.0-smoothstep(.65,1.0,radius));
        gl_FragColor=vec4(lightColor,a);
        #include <colorspace_fragment>
      }`,
  }));
  const lightPool = new THREE.Mesh(poolGeometry, poolMaterial);
  lightPool.rotation.x = -Math.PI / 2; lightPool.position.set(0, .12, 0); scene.add(lightPool);
  const faceMaterial = track(new THREE.MeshStandardMaterial({ color: 0x231525, metalness: .12, roughness: .24, side: THREE.DoubleSide }));
  const placeholder = track(new THREE.MeshBasicMaterial({ visible: false }));

  // Rounded edge coins have an actual bevel, rather than many shiny cylinders
  // stacked in columns. The physics module gives every coin a settled pose.
  const coinScale = .17 / .14;
  const profile = [
    new THREE.Vector2(0, -.021), new THREE.Vector2(.126, -.021),
    new THREE.Vector2(.137, -.015), new THREE.Vector2(.14, -.008),
    new THREE.Vector2(.14, .008), new THREE.Vector2(.137, .015),
    new THREE.Vector2(.126, .021), new THREE.Vector2(0, .021),
  ];
  profile.forEach(point => point.multiplyScalar(coinScale));
  const coinGeometry = track(new THREE.LatheGeometry(profile, mobile ? 32 : 48));
  const coinMaterial = track(new THREE.MeshStandardMaterial({ color: 0xffcb3f, metalness: 1, roughness: .26, envMap: scene.environment, envMapIntensity: 1.1 }));
  const markMaterial = track(new THREE.MeshStandardMaterial({ color: 0x65401d, metalness: .9, roughness: .4, envMap: scene.environment, envMapIntensity: .65 }));
  const markGeometry = track(createSolanaCoinMarkGeometry({ coinScale }));
  const maxCoins = mobile ? 110 : 180;
  const coins = new THREE.InstancedMesh(coinGeometry, coinMaterial, maxCoins);
  const marks = new THREE.InstancedMesh(markGeometry, markMaterial, maxCoins * SOLANA_MARKS_PER_COIN);
  for (const object of [coins, marks]) {
    object.count = 0; object.frustumCulled = false;
    object.instanceMatrix.setUsage(THREE.DynamicDrawUsage); bank.add(object);
  }
  function syncCoins() {
    if (!physics) return;
    let count = 0;
    for (const pose of physics.getTransforms()) {
      if (pose.visible === false) continue;
      dummy.position.copy(pose.position); dummy.quaternion.copy(pose.quaternion); dummy.scale.setScalar(1); dummy.updateMatrix();
      coins.setMatrixAt(count, dummy.matrix);
      for (let side = 0; side < SOLANA_MARKS_PER_COIN; side++) {
        setSolanaCoinMarkMatrix(offset, dummy.matrix, side, coinScale);
        marks.setMatrixAt(count * SOLANA_MARKS_PER_COIN + side, offset);
      }
      count++;
    }
    coins.count = count; marks.count = count * SOLANA_MARKS_PER_COIN;
    for (const object of [coins, marks]) object.instanceMatrix.needsUpdate = true;
  }
  function setCoins(value) {
    const next = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    if (next === desiredCoins) return;
    desiredCoins = next;
    physics?.setCount(desiredCoins); requestFrame();
  }
  function deposit(value) {
    cancelPreview();
    const count = Math.max(0, Math.floor(Number(value) || 0));
    if (physics) physics.deposit(count); else pendingDeposit += count;
    if (!reduced) impact = 1;
    requestFrame();
  }
  function beginBurst() {
    if (!burst || !physics || burstStarted) return;
    // Reconcile a saved/expired round before snapshotting the visible pile.
    physics.step(0); syncCoins();
    const snapshots = [];
    for (let i = 0; i < coins.count; i++) {
      const matrix = new THREE.Matrix4(); coins.getMatrixAt(i, matrix); snapshots.push(matrix);
    }
    burst.start(snapshots);
    burstStarted = true;
    // A round may have been idle for minutes. Start this visual clock now,
    // independently of the bounded physics timestep used for falling coins.
    lastTime = 0;
    bodyMesh.visible = false;
    faceMeshes.forEach(mesh => { mesh.visible = false; });
    coins.visible = marks.visible = false;
    impact = 0;
  }
  function setEnded(value) {
    if (ended === Boolean(value)) return;
    ended = Boolean(value);
    if (ended) {
      clearTimeout(previewTimer);
      if (previewing) { burst?.reset(); burstStarted = false; }
      previewing = false; beginBurst();
    }
    else {
      burst?.reset(); burstStarted = false;
      if (bodyMesh) bodyMesh.visible = true;
      faceMeshes.forEach(mesh => { mesh.visible = true; });
      coins.visible = marks.visible = true;
    }
    requestFrame();
  }
  function cancelPreview() {
    clearTimeout(previewTimer);
    if (!previewing) return;
    previewing = false;
    if (disposed || ended) return;
    burst?.reset(); burstStarted = false;
    if (bodyMesh) bodyMesh.visible = true;
    faceMeshes.forEach(mesh => { mesh.visible = true; });
    coins.visible = marks.visible = true; requestFrame();
  }
  function previewPayout() {
    if (!ready || ended || previewing || !burst || !coins.count) return false;
    previewing = true; beginBurst(); requestFrame();
    previewTimer = setTimeout(cancelPreview, 4_400);
    return true;
  }
  function placeCamera() {
    const direction = viewDirection.clone().applyAxisAngle(up, viewX * .13);
    direction.y += viewY * .045;
    camera.position.copy(direction.normalize()).multiplyScalar(distance * (1 - impact * .015)).add(target);
    camera.lookAt(target); camera.updateMatrixWorld();
  }
  function resize() {
    if (disposed) return;
    width = Math.max(1, container.clientWidth); height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height, false); camera.aspect = width / height;
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const halfWidth = halfHeight * camera.aspect;
    const right = new THREE.Vector3().crossVectors(up, viewDirection).normalize();
    const cameraUp = new THREE.Vector3().crossVectors(viewDirection, right).normalize();
    // Fit the authored vertices, including the nose and tail, to 90% of the
    // limiting canvas dimension. A bounding box includes empty space at its
    // near corners and makes this round model look unnecessarily small.
    distance = 0;
    const fitPoint = () => {
      framePoint.sub(target);
      const depth = framePoint.dot(viewDirection);
      distance = Math.max(distance,
        depth + Math.abs(framePoint.dot(right)) / (halfWidth * .9),
        depth + Math.abs(framePoint.dot(cameraUp)) / (halfHeight * .9));
    };
    if (frameGeometries.length) {
      for (const geometry of frameGeometries) {
        const positions = geometry.getAttribute('position');
        for (let index = 0; index < positions.count; index++) {
          framePoint.fromBufferAttribute(positions, index); fitPoint();
        }
      }
    } else {
      for (let corner = 0; corner < 8; corner++) {
        framePoint.set(
          corner & 1 ? frameBounds.max.x : frameBounds.min.x,
          corner & 2 ? frameBounds.max.y : frameBounds.min.y,
          corner & 4 ? frameBounds.max.z : frameBounds.min.z,
        ); fitPoint();
      }
    }
    camera.updateProjectionMatrix(); placeCamera();
    transmission?.resize(width, height); requestFrame();
  }
  function render(time) {
    frame = 0;
    if (disposed || contextLost) return;
    const elapsed = lastTime ? Math.max(0, (time - lastTime) / 1000) : 1 / 60;
    const delta = Math.min(.05, elapsed); lastTime = time;
    const showingPayout = ended || previewing;
    const active = !showingPayout && (physics?.step(delta) ?? false);
    if (physics && !showingPayout) syncCoins();
    const bursting = burst?.update(elapsed) ?? false;
    const ease = 1 - Math.exp(-delta * 6);
    viewX += (pointerX - viewX) * ease; viewY += (pointerY - viewY) * ease;
    impact *= Math.exp(-delta * 4); if (impact < .001) impact = 0;
    placeCamera();
    if (transmission && !showingPayout) transmission.render(); else renderer.render(scene, camera);
    if (active || bursting || impact || Math.abs(pointerX - viewX) + Math.abs(pointerY - viewY) > .001) requestFrame();
  }
  function requestFrame() { if (!frame && !disposed && !contextLost) frame = requestAnimationFrame(render); }
  const observer = new ResizeObserver(resize); observer.observe(container);
  const onPointerMove = event => {
    if (reduced || event.pointerType !== 'mouse') return;
    const box = container.getBoundingClientRect();
    pointerX = (event.clientX - box.left) / box.width * 2 - 1;
    pointerY = (event.clientY - box.top) / box.height * 2 - 1; requestFrame();
  };
  const onPointerLeave = () => { pointerX = pointerY = 0; requestFrame(); };
  const onContextLost = event => { event.preventDefault(); contextLost = true; cancelAnimationFrame(frame); frame = 0; };
  const onContextRestored = () => { contextLost = false; captureEnvironment(); resize(); };
  container.addEventListener('pointermove', onPointerMove); container.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('webglcontextlost', onContextLost); canvas.addEventListener('webglcontextrestored', onContextRestored);
  resize();

  (async () => {
    try {
      const gltf = await new GLTFLoader().loadAsync('/models/piggy-bank-glass.glb');
      if (disposed) {
        gltf.scene.traverse(object => { if (object.isMesh) { object.geometry.dispose(); object.material.dispose(); } }); return;
      }
      const model = gltf.scene;
      const wrapper = new THREE.Group(); wrapper.add(model); wrapper.rotation.y = Math.PI / 2; wrapper.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(wrapper), center = bounds.getCenter(new THREE.Vector3());
      const scale = 3.8 / bounds.getSize(new THREE.Vector3()).x;
      const normalization = new THREE.Matrix4().makeScale(scale, scale, scale).setPosition(-center.x * scale, 1.9 - center.y * scale, -center.z * scale);
      let body;
      frameBounds.makeEmpty();
      const sourceMaterials = new Set(), sourceGeometries = new Set();
      model.traverse(object => {
        if (!object.isMesh) return;
        const geo = track(object.geometry.clone().applyMatrix4(object.matrixWorld).applyMatrix4(normalization));
        geo.computeBoundingBox(); geo.computeBoundingSphere();
        frameBounds.union(geo.boundingBox);
        frameGeometries.push(geo);
        const imported = new THREE.Mesh(geo, object.name === 'Object_9' ? placeholder : faceMaterial); bank.add(imported);
        if (object.name === 'Object_9') body = imported;
        else faceMeshes.push(imported);
        sourceGeometries.add(object.geometry);
        for (const mat of Array.isArray(object.material) ? object.material : [object.material]) sourceMaterials.add(mat);
      });
      sourceGeometries.forEach(value => value.dispose()); sourceMaterials.forEach(value => value.dispose());
      if (!body) throw new Error('Model body is missing.');
      bodyMesh = body;
      bank.updateMatrixWorld(true);
      transmission = createTransmissionPass({ renderer, scene, camera, body });
      // Neutral transmission keeps the saturated gold readable. A faint cool
      // surface reflection separates the clear shell from the arcade field.
      transmission.material.color.set(0xffffff);
      transmission.material._transmission = .97;
      transmission.material.attenuationColor.set(0xffffff);
      transmission.material.attenuationDistance = Infinity;
      transmission.material.roughness = mobile ? .016 : .011;
      transmission.material.thickness = .055;
      transmission.material.ior = 1.46;
      transmission.material.envMapIntensity = 1.1;
      const compileTransmission = transmission.material.onBeforeCompile;
      transmission.material.onBeforeCompile = (shader, renderer) => {
        compileTransmission(shader, renderer);
        shader.fragmentShader = shader.fragmentShader.replace(
          'totalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );',
          'totalDiffuse = mix( totalDiffuse * vec3(0.93, 0.95, 1.0), transmission.rgb, material.transmission );',
        );
      };
      transmission.material.customProgramCacheKey = () => 'piggy-arcade-clear-v1';
      resize();
      const { createCoinSimulation } = await import('./coin-simulation.js');
      physics = await createCoinSimulation({ shellMesh: body, maxCoins, radius: .17, halfHeight: .023 * coinScale, reducedMotion: reduced, onImpact: () => { if (!reduced) impact = Math.max(impact, .3); } });
      if (disposed) { physics.dispose(); return; }
      physics.setCount(desiredCoins);
      if (pendingDeposit) physics.deposit(pendingDeposit);
      pendingDeposit = 0;
      burst = createPiggyBurst({ body, bank, coinGeometry, coinMaterial, coinMarkGeometry: markGeometry, coinMarkMaterial: markMaterial, coinScale, maxCoins, reducedMotion: reduced });
      if (ended) beginBurst();
      ready = true; status.remove(); container.classList.add('model-ready'); requestFrame();
    } catch (error) {
      if (!disposed) { status.textContent = 'Prize bank could not load. The game is ready to play.'; status.classList.add('load-error'); console.error('Prize bank:', error); }
    }
  })();
  return {
    setCoins, deposit, setEnded, cancelPreview, previewPayout,
    dispose() {
      if (disposed) return;
      disposed = true; clearTimeout(previewTimer); cancelAnimationFrame(frame); observer.disconnect();
      container.removeEventListener('pointermove', onPointerMove); container.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('webglcontextlost', onContextLost); canvas.removeEventListener('webglcontextrestored', onContextRestored);
      burst?.dispose(); physics?.dispose(); transmission?.dispose(); environmentTarget?.dispose();
      resources.forEach(resource => resource.dispose()); renderer.dispose(); canvas.remove(); status.remove(); container.classList.remove('model-ready');
    },
  };
}
