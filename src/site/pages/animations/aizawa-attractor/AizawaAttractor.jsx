import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import usePageMeta from "../../../../utils/usePageMeta";
import "./AizawaAttractor.css";

const VERTEX_SHADER = `
attribute float lineDistance;
varying vec3 vPos;
varying float vDistance;

void main() {
    vPos = position;
    vDistance = lineDistance;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAGMENT_SHADER = `
uniform float time;
uniform float phase;
uniform float gain;

varying vec3 vPos;
varying float vDistance;

vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.00, 0.33, 0.67);
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    float height = clamp((vPos.y + 19.0) / 43.0, 0.0, 1.0);
    float radial = length(vPos.xz) * 0.02;

    float microCell = fract(vDistance * 300.0 - time * 0.5);
    float microBreak = smoothstep(0.1, 0.3, microCell) * (1.0 - smoothstep(0.7, 0.9, microCell));

    float dashCell = fract(vDistance * 20.0 - time * 0.1 + phase);
    float dash = smoothstep(0.0, 0.1, dashCell) * (1.0 - smoothstep(0.8, 0.9, dashCell));

    float mask = mix(1.0, dash * microBreak, 0.8);
    if (mask < 0.05) discard;

    float cometA = fract(vDistance * 12.0 - time * 0.6 + phase);
    float cometB = fract(vDistance * 25.0 - time * 0.9 + phase * 1.5);

    float packetA = pow(1.0 - abs(cometA - 0.5) * 2.0, 12.0);
    float packetB = pow(1.0 - abs(cometB - 0.5) * 2.0, 24.0);

    float wave = pow(sin(vDistance * 40.0 - time * 2.0) * 0.5 + 0.5, 2.0);

    vec3 baseColor = palette(height - time * 0.05 + phase * 0.2);
    vec3 coreGlow = vec3(1.0, 1.0, 1.0);
    vec3 cyanAccent = vec3(0.0, 0.9, 1.0);
    vec3 magentaAccent = vec3(1.0, 0.2, 0.8);

    vec3 color = baseColor * (0.3 + wave * 0.5);
    color += cyanAccent * packetA * 2.0;
    color += magentaAccent * packetB * 2.5;
    color += coreGlow * pow(packetA + packetB, 2.0) * 1.5;

    color *= gain;

    float alpha = mask * (0.5 + wave * 0.3 + packetA + packetB);
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
}
`;

const BASE_VERTEX_SHADER = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const BASE_FRAGMENT_SHADER = `
uniform float time;
varying vec2 vUv;

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float r = length(uv);
    float angle = atan(uv.y, uv.x);

    if (r > 1.0) discard;

    float rings = fract(r * 15.0 - time * 0.2);
    float ringLines = smoothstep(0.85, 0.95, rings);

    float rays = fract(angle * 6.0 / 3.14159);
    float rayLines = smoothstep(0.95, 1.0, rays) + smoothstep(0.05, 0.0, rays);

    float sweep = mod(angle - time * 1.5, 6.28318) / 6.28318;
    sweep = pow(1.0 - sweep, 6.0);

    float edge = smoothstep(0.9, 1.0, r);
    float centerGlow = exp(-r * 5.0);

    vec3 cyan = vec3(0.0, 0.8, 1.0);
    vec3 blue = vec3(0.1, 0.3, 0.8);

    vec3 color = cyan * (ringLines * 0.2 + rayLines * 0.1 * r) * (1.0 - r);
    color += cyan * sweep * 0.5 * (1.0 - r);
    color += blue * centerGlow * 0.8;
    color += cyan * edge * 0.5;

    float alpha = (ringLines * 0.3 + rayLines * 0.2 + sweep * 0.6 + centerGlow + edge) * (1.0 - r * 0.8);
    gl_FragColor = vec4(color, alpha * 0.8);
}
`;

const CONFIG = {
  points: 120000,
  burnIn: 3000,
  dt: 0.0045,
  scale: 16.0,
  a: 0.95,
  b: 0.7,
  c: 0.6,
  d: 3.5,
  e: 0.25,
  f: 0.1,
};

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const lerp = (a, b, t) => a + (b - a) * t;

const AizawaAttractor = () => {
  usePageMeta({
    title: "Aizawa Attractor",
    description:
      "An interactive 3D holographic Aizawa attractor built with Three.js and WebGL shaders.",
    keywords:
      "aizawa attractor, three.js, webgl, shader, chaos, creative coding, 3d, animation",
  });
  const stageRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const width = stage.clientWidth;
    const height = stage.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0515, 0.006);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, -10, 20);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    stage.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.target.set(0, 4, 0);
    controls.maxDistance = 150;
    controls.minDistance = 20;

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.6,
      0.5,
      0.2,
    );
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const derivatives = (x, y, z) => ({
      dx: (z - CONFIG.b) * x - CONFIG.d * y,
      dy: CONFIG.d * x + (z - CONFIG.b) * y,
      dz:
        CONFIG.c +
        CONFIG.a * z -
        (z * z * z) / 3.0 -
        (x * x + y * y) * (1.0 + CONFIG.e * z) +
        CONFIG.f * z * x * x * x,
    });

    const rk4Step = (state) => {
      const dt = CONFIG.dt;
      const k1 = derivatives(state.x, state.y, state.z);
      const k2 = derivatives(
        state.x + k1.dx * dt * 0.5,
        state.y + k1.dy * dt * 0.5,
        state.z + k1.dz * dt * 0.5,
      );
      const k3 = derivatives(
        state.x + k2.dx * dt * 0.5,
        state.y + k2.dy * dt * 0.5,
        state.z + k2.dz * dt * 0.5,
      );
      const k4 = derivatives(
        state.x + k3.dx * dt,
        state.y + k3.dy * dt,
        state.z + k3.dz * dt,
      );
      state.x += (dt / 6.0) * (k1.dx + 2.0 * k2.dx + 2.0 * k3.dx + k4.dx);
      state.y += (dt / 6.0) * (k1.dy + 2.0 * k2.dy + 2.0 * k3.dy + k4.dy);
      state.z += (dt / 6.0) * (k1.dz + 2.0 * k2.dz + 2.0 * k3.dz + k4.dz);
    };

    const generateGeometry = () => {
      const positions = new Float32Array(CONFIG.points * 3);
      const lineDistances = new Float32Array(CONFIG.points);
      const state = { x: 0.1, y: 0.0, z: 0.0 };

      for (let i = 0; i < CONFIG.burnIn; i++) rk4Step(state);

      for (let i = 0; i < CONFIG.points; i++) {
        rk4Step(state);
        positions[i * 3] = state.x * CONFIG.scale;
        positions[i * 3 + 1] = state.z * CONFIG.scale;
        positions[i * 3 + 2] = state.y * CONFIG.scale;
        lineDistances[i] = i / CONFIG.points;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute(
        "lineDistance",
        new THREE.BufferAttribute(lineDistances, 1),
      );
      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox.getCenter(center);
      geometry.translate(-center.x, -center.y + 6, -center.z);

      return geometry;
    };

    const attractorGeo = generateGeometry();

    const createMaterial = (phase, gain) =>
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, phase: { value: phase }, gain: { value: gain } },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      });

    const attractorGroup = new THREE.Group();
    scene.add(attractorGroup);

    const lines = [
      new THREE.Line(attractorGeo, createMaterial(0.0, 1.2)),
      new THREE.Line(attractorGeo, createMaterial(0.3, 0.6)),
      new THREE.Line(attractorGeo, createMaterial(0.6, 0.4)),
    ];
    lines[1].scale.setScalar(1.01);
    lines[1].rotation.y = 0.01;
    lines[2].scale.setScalar(0.99);
    lines[2].rotation.x = -0.01;
    lines.forEach((l) => attractorGroup.add(l));

    const baseMaterial = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: BASE_VERTEX_SHADER,
      fragmentShader: BASE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const baseDisk = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), baseMaterial);
    baseDisk.rotation.x = -Math.PI / 2;
    baseDisk.position.y = -18;
    scene.add(baseDisk);

    const pCount = 1500;
    const pPos = new Float32Array(pCount * 3);
    const pSizes = new Float32Array(pCount);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 200;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 200;
      pSizes[i] = Math.random() * 2;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute("size", new THREE.BufferAttribute(pSizes, 1));
    const pMat = new THREE.PointsMaterial({
      color: 0x00eaff,
      size: 0.5,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const uiContainer = stage.querySelector(".aizawa-formula");
    const loadingEl = stage.querySelector(".aizawa-loading");

    const onMouseMove = (e) => {
      if (!uiContainer) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * -20;
      uiContainer.__target = { x, y };
    };
    document.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let animationId = null;

    const animate = () => {
      animationId = window.requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      lines.forEach((l) => {
        l.material.uniforms.time.value = time;
      });
      baseMaterial.uniforms.time.value = time;

      attractorGroup.rotation.y = Math.sin(time * 0.2) * 0.2;
      attractorGroup.position.y = Math.sin(time * 0.5) * 1.5;

      particles.rotation.y = time * 0.02;
      particles.rotation.z = time * 0.01;

      if (uiContainer && uiContainer.__target) {
        const t = uiContainer.__target;
        const current = uiContainer.__current || { x: 0, y: 0 };
        current.x = lerp(current.x, t.x, 0.08);
        current.y = lerp(current.y, t.y, 0.08);
        uiContainer.__current = current;
        uiContainer.style.transform = `translateY(${current.y * 0.2}px) rotateX(${
          current.y
        }deg) rotateY(${current.x}deg)`;
      }

      controls.update();
      composer.render();
    };

    let introTimers = [];
    const startSequence = () => {
      const from = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
      const to = { x: 0, y: 15, z: 80 };
      let start = null;
      const tweenCamera = (ts) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / 3500, 1);
        const e = easeInOutCubic(p);
        camera.position.set(
          lerp(from.x, to.x, e),
          lerp(from.y, to.y, e),
          lerp(from.z, to.z, e),
        );
        if (p < 1) window.requestAnimationFrame(tweenCamera);
      };
      window.requestAnimationFrame(tweenCamera);

      if (loadingEl) {
        loadingEl.style.transition = "opacity 0.5s ease";
        loadingEl.style.opacity = "0";
        const rm = window.setTimeout(() => loadingEl.remove(), 550);
        introTimers.push(rm);
      }
      if (uiContainer) {
        uiContainer.style.transition = "opacity 1.5s ease 1.5s, transform 1.5s ease 1.5s";
        uiContainer.style.opacity = "1";
      }
    };
    const startTimer = window.setTimeout(startSequence, 1500);
    introTimers.push(startTimer);

    animate();

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouseMove);
      introTimers.forEach((id) => window.clearTimeout(id));
      if (renderer.domElement.parentNode === stage) {
        stage.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
      attractorGeo.dispose();
      pGeo.dispose();
      pMat.dispose();
      lines.forEach((l) => l.material.dispose());
      baseMaterial.dispose();
    };
  }, []);

  return (
    <div className="aizawa-attractor-page" ref={stageRef}>
      <div className="aizawa-scanlines" />
      <div className="aizawa-loading">
        <div className="aizawa-loader-ring" />
        <span>INITIALIZING SEQUENCE</span>
      </div>
      <div className="aizawa-formula">
        <span className="aizawa-corner aizawa-corner-tl" />
        <span className="aizawa-corner aizawa-corner-tr" />
        <span className="aizawa-corner aizawa-corner-bl" />
        <span className="aizawa-corner aizawa-corner-br" />
        <div className="aizawa-scanner-line" />
        <div className="aizawa-title">Aizawa System</div>
        <div className="aizawa-param-tag">Holographic Manifold</div>
        <div className="aizawa-equation">
          <span className="aizawa-var">dx</span>
          <span className="aizawa-op">/</span>
          <span className="aizawa-var">dt</span>
          <span className="aizawa-op">=</span>
          <span className="aizawa-op">(</span>
          <span className="aizawa-var">z</span>
          <span className="aizawa-op">-</span>
          <span className="aizawa-const">b</span>
          <span className="aizawa-op">)</span>
          <span className="aizawa-var">x</span>
          <span className="aizawa-op">-</span>
          <span className="aizawa-const">d</span>
          <span className="aizawa-var">y</span>
        </div>
        <div className="aizawa-equation">
          <span className="aizawa-var">dy</span>
          <span className="aizawa-op">/</span>
          <span className="aizawa-var">dt</span>
          <span className="aizawa-op">=</span>
          <span className="aizawa-const">d</span>
          <span className="aizawa-var">x</span>
          <span className="aizawa-op">+</span>
          <span className="aizawa-op">(</span>
          <span className="aizawa-var">z</span>
          <span className="aizawa-op">-</span>
          <span className="aizawa-const">b</span>
          <span className="aizawa-op">)</span>
          <span className="aizawa-var">y</span>
        </div>
        <div className="aizawa-equation">
          <span className="aizawa-var">dz</span>
          <span className="aizawa-op">/</span>
          <span className="aizawa-var">dt</span>
          <span className="aizawa-op">=</span>
          <span className="aizawa-const">c</span>
          <span className="aizawa-op">+</span>
          <span className="aizawa-const">a</span>
          <span className="aizawa-var">z</span>
          <span className="aizawa-op">-</span>
          <span className="aizawa-var">z</span>
          <span className="aizawa-op">/</span>
          <span className="aizawa-const">3</span>
          <span className="aizawa-op">-</span>
          <span className="aizawa-op">(</span>
          <span className="aizawa-var">x</span>
          <span className="aizawa-op">+</span>
          <span className="aizawa-var">y</span>
          <span className="aizawa-op">)</span>
          <span className="aizawa-op">(</span>
          <span className="aizawa-const">1</span>
          <span className="aizawa-op">+</span>
          <span className="aizawa-const">e</span>
          <span className="aizawa-var">z</span>
          <span className="aizawa-op">)</span>
        </div>
      </div>
    </div>
  );
};

export default AizawaAttractor;