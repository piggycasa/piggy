import * as THREE from 'three';
import { MeshDiscardMaterial, MeshTransmissionMaterial } from '@pmndrs/vanilla';

/*!
 * @license MIT
 * Backside/front capture adapted from Poimandres' MeshTransmissionMaterial:
 * https://github.com/pmndrs/drei-vanilla/blob/main/.storybook/stories/MeshTransmissionMaterial.stories.ts
 * https://github.com/pmndrs/drei/blob/master/src/core/MeshTransmissionMaterial.tsx
 * Transmission shader by N8Programs, provided by @pmndrs/vanilla.
 *
 * Copyright (c) 2023 Poimandres
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Owns the glass material and two linear HDR capture targets, not the body mesh.
 * render() performs both captures AND the final scene render. Call it instead of
 * renderer.render(scene, camera), after updating the camera and scene objects.
 * resize() accepts CSS pixels; targets use the renderer's DPR without halving it.
 * resolution is an optional maximum target edge in physical pixels.
 */
export function createTransmissionPass({ renderer, scene, camera, body, resolution } = {}) {
  if (!renderer || !scene || !camera || !body?.isMesh) {
    throw new TypeError('createTransmissionPass needs renderer, scene, camera, and a body mesh.');
  }

  const mobile = typeof window !== 'undefined'
    && window.matchMedia('(max-width: 767px), (max-height: 500px) and (max-width: 1100px)').matches;
  const resolutionLimit = mobile ? 768 : 2048;
  const maxEdge = Number.isFinite(resolution) && resolution > 0
    ? Math.min(resolutionLimit, Math.max(256, Math.floor(resolution)))
    : resolutionLimit;
  const floatColor = renderer.extensions.has('EXT_color_buffer_float')
    || renderer.extensions.has('EXT_color_buffer_half_float');
  const samples = !mobile && renderer.capabilities.isWebGL2
    ? Math.min(4, renderer.capabilities.maxSamples || 0)
    : 0;
  const options = {
    type: floatColor ? THREE.HalfFloatType : THREE.UnsignedByteType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: false,
    depthBuffer: true,
    stencilBuffer: false,
    samples,
  };
  const back = new THREE.WebGLRenderTarget(1, 1, options);
  const front = new THREE.WebGLRenderTarget(1, 1, options);
  back.texture.colorSpace = THREE.LinearSRGBColorSpace;
  front.texture.colorSpace = THREE.LinearSRGBColorSpace;
  back.texture.name = 'prize-bank-backside-capture';
  front.texture.name = 'prize-bank-front-capture';
  const discard = new MeshDiscardMaterial();
  const originalMaterial = body.material;
  const material = new MeshTransmissionMaterial({
    samples: mobile ? 3 : 10,
    transmissionSampler: false,
    // Reserve native transmission=0 to avoid Three's built-in white-clear pass.
    transmission: 0,
    _transmission: 1,
    roughness: mobile ? .018 : .012,
    thickness: .055,
    chromaticAberration: .002,
    anisotropicBlur: 0,
    distortion: 0,
    temporalDistortion: 0,
    attenuationDistance: Infinity,
    attenuationColor: new THREE.Color('white'),
    buffer: front.texture,
  });
  material.name = 'prize-bank-poimandres-transmission';
  material.color.set('white');
  material.metalness = 0;
  material.ior = 1.45;
  material.opacity = 1;
  material.transparent = false;
  material.depthWrite = true;
  material.depthTest = true;
  material.side = THREE.FrontSide;
  // Three uses scene.environmentIntensity while envMap is null. Bind the map
  // explicitly so front/back reflection strengths actually remain independent
  // of the stronger environment lighting needed by the opaque gold coins.
  material.envMap = scene.environment;
  material.envMapIntensity = .45;
  material.clearcoat = 0;
  body.material = material;

  const drawingSize = new THREE.Vector2();
  const fallbackBackground = new THREE.Color('#2f2475');
  let disposed = false;
  let rendering = false;

  function resize(width, height) {
    if (disposed) return;
    let physicalWidth, physicalHeight;
    if (Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0) {
      const dpr = renderer.getPixelRatio();
      physicalWidth = width * dpr;
      physicalHeight = height * dpr;
    } else {
      renderer.getDrawingBufferSize(drawingSize);
      physicalWidth = drawingSize.x;
      physicalHeight = drawingSize.y;
    }
    const scale = Math.min(1, maxEdge / Math.max(physicalWidth, physicalHeight, 1));
    const targetWidth = Math.max(1, Math.round(physicalWidth * scale));
    const targetHeight = Math.max(1, Math.round(physicalHeight * scale));
    if (front.width === targetWidth && front.height === targetHeight) return;
    back.setSize(targetWidth, targetHeight);
    front.setSize(targetWidth, targetHeight);
  }

  function setSide(side) {
    if (material.side === side) return;
    material.side = side;
    // Front/back variants have different program keys. Three caches both.
    material.needsUpdate = true;
  }

  function render() {
    if (disposed || rendering || renderer.getContext().isContextLost()) return;
    // PMREM is replaced after loading/context restoration; never keep sampling
    // the old disposed environment target.
    if (material.envMap !== scene.environment) {
      material.envMap = scene.environment;
      material.needsUpdate = true;
    }
    rendering = true;
    const previousTarget = renderer.getRenderTarget();
    const previousFace = renderer.getActiveCubeFace();
    const previousMipmap = renderer.getActiveMipmapLevel();
    const previousTone = renderer.toneMapping;
    const previousBackground = scene.background;
    const previousSide = material.side;
    const previousThickness = material.thickness;
    const previousEnvironmentIntensity = material.envMapIntensity;
    const previousBodyMaterial = body.material;
    let captured = false;

    try {
      // Both captures contain linear radiance. The caller uses a consistent
      // final linear-to-sRGB conversion for the clear and refracted background.
      renderer.toneMapping = THREE.NoToneMapping;
      scene.background = previousBackground || fallbackBackground;
      body.material = discard;
      renderer.setRenderTarget(back);
      renderer.clear(true, true, true);
      renderer.render(scene, camera);

      // Include the rear glass wall in the scene sampled by the front wall.
      body.material = material;
      material.buffer = back.texture;
      material.thickness = .045;
      material.envMapIntensity = .2;
      setSide(THREE.BackSide);
      renderer.setRenderTarget(front);
      renderer.clear(true, true, true);
      renderer.render(scene, camera);
      captured = true;
    } finally {
      material.buffer = front.texture;
      material.thickness = previousThickness;
      material.envMapIntensity = previousEnvironmentIntensity;
      setSide(previousSide);
      body.material = previousBodyMaterial;
      scene.background = previousBackground;
      renderer.toneMapping = previousTone;
      renderer.setRenderTarget(previousTarget, previousFace, previousMipmap);
      rendering = false;
    }

    if (captured) renderer.render(scene, camera);
  }

  resize();
  return {
    material,
    render,
    resize,
    dispose() {
      if (disposed) return;
      disposed = true;
      if (body.material === material || body.material === discard) body.material = originalMaterial;
      back.dispose();
      front.dispose();
      discard.dispose();
      material.dispose();
    },
  };
}
