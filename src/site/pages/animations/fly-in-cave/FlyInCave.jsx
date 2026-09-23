import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import usePageMeta from "../../../../utils/usePageMeta";
import "./FlyInCave.css";

/* ── dependency-free 2D simplex noise (replaces the simplex-noise CDN) ── */
const NOISE_PERM = (() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  let s = 42;
  const rand = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 255; i > 0; i--) {
    const r = Math.floor(rand() * (i + 1));
    [p[i], p[r]] = [p[r], p[i]];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  return perm;
})();

const NOISE_GRAD = (hash, x, y) => {
  const h = hash & 7;
  return (h < 4 ? x : -x) + (h & 1 ? -y : y);
};

const createNoise2D = () => {
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;
  const perm = NOISE_PERM;
  return (xin, yin) => {
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * NOISE_GRAD(perm[ii + perm[jj]], x0, y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * NOISE_GRAD(perm[ii + i1 + perm[jj + j1]], x1, y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * NOISE_GRAD(perm[ii + 1 + perm[jj + 1]], x2, y2); }
    return 70 * (n0 + n1 + n2);
  };
};

/* ── helpers ── */
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const safeColor = (hex) => { try { return new THREE.Color(hex); } catch { return new THREE.Color("#000000"); } };

const DEFAULT_PARAMS = {
  speed: 6.0,
  showCeiling: true,
  scale: 30.0,
  heightMultiplier: 3.6,
  detailStrength: 0.27,
  valleyWidth: 25.0,
  flatShading: false,
  wireframe: false,
  bgColor: "#b6c2cc",
  fogDensity: 0.0104,
  groundColor: "#1a1a1a",
  ceilingColor: "#5e6a75",
  ambientInt: 0.6,
  camLightInt: 1.5,
};

const CHUNK_WIDTH = 250;
const CHUNK_LENGTH = 60;
const SEGMENTS_W = 100;
const SEGMENTS_L = 30;
const CHUNK_COUNT = 6;

const FlyInCave = () => {
  usePageMeta({
    title: "Fly In Cave",
    description:
      "A 3D cave flight simulation: tunnel generated from perlin-style noise with dynamic lighting, adjustable speed, camera light, and terrain controls.",
    keywords:
      "three.js, webgl, cave, tunnel, flight, simulation, animation, creative coding, webgl",
  });

  const stageRef = useRef(null);
  const paramsRef = useRef({ ...DEFAULT_PARAMS });
  const apiRef = useRef(null);
  const chunksRef = useRef([]);

  const [ui, setUi] = useState({ ...DEFAULT_PARAMS });

  const updateParam = (key, value) => {
    paramsRef.current[key] = value;
    setUi((prev) => ({ ...prev, [key]: value }));
  };

  const handleSpeed = (e) => updateParam("speed", Number(e.target.value));
  const handleShowCeiling = (e) => {
    updateParam("showCeiling", e.target.checked);
    apiRef.current?.setCeilingVisible(e.target.checked);
  };
  const handleFlatShading = (e) => {
    updateParam("flatShading", e.target.checked);
    apiRef.current?.setFlatShading(e.target.checked);
  };
  const handleWireframe = (e) => {
    updateParam("wireframe", e.target.checked);
    apiRef.current?.setWireframe(e.target.checked);
  };
  const handleTerrain = (key) => (e) => {
    updateParam(key, Number(e.target.value));
    apiRef.current?.rebuild();
  };
  const handleColor = (key) => (e) => {
    updateParam(key, e.target.value);
    apiRef.current?.applyColors();
  };
  const handleFogDensity = (e) => {
    updateParam("fogDensity", Number(e.target.value));
    apiRef.current?.applyColors();
  };
  const handleAmbientInt = (e) => {
    updateParam("ambientInt", Number(e.target.value));
    apiRef.current?.applyColors();
  };
  const handleCamLightInt = (e) => {
    updateParam("camLightInt", Number(e.target.value));
    apiRef.current?.applyColors();
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const params = paramsRef.current;
    const noise2D = createNoise2D();

    const width = stage.clientWidth;
    const height = stage.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      precision: "highp",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = safeColor(params.bgColor);
    scene.fog = new THREE.FogExp2(safeColor(params.bgColor), params.fogDensity);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 300);
    camera.position.set(0, 0, 40);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, params.ambientInt);
    scene.add(hemiLight);

    const camLight = new THREE.PointLight(0xffaa00, params.camLightInt, 120, 1.5);
    scene.add(camLight);

    const getElevation = (x, z, isTop) => {
      const offset = isTop ? 9999 : 0;
      let y = noise2D((x + offset) / params.scale, (z + offset) / params.scale) * params.heightMultiplier;
      const detailScale = params.scale * 0.4;
      y += noise2D((x + offset) / detailScale, (z + offset) / detailScale) * (params.heightMultiplier * params.detailStrength);
      const dist = Math.abs(x);
      y += Math.pow(dist / params.valleyWidth, 2.5);
      return y;
    };

    const updateChunk = (chunk) => {
      const zPosition = chunk.userData.index * -CHUNK_LENGTH;
      chunk.position.z = zPosition;
      const geoG = chunk.userData.meshGround.geometry;
      const posG = geoG.attributes.position;
      const geoC = chunk.userData.meshCeil.geometry;
      const posC = geoC.attributes.position;
      for (let i = 0; i < posG.count; i++) {
        const x = posG.getX(i);
        const localZ = posG.getZ(i);
        const worldZ = zPosition + localZ;
        posG.setY(i, -5 + getElevation(x, worldZ, false));
        posC.setY(i, 5 - getElevation(x, worldZ, true));
      }
      posG.needsUpdate = true;
      geoG.computeVertexNormals();
      posC.needsUpdate = true;
      geoC.computeVertexNormals();
    };

    const createChunk = (index) => {
      const geometry = new THREE.PlaneGeometry(CHUNK_WIDTH, CHUNK_LENGTH, SEGMENTS_W, SEGMENTS_L);
      geometry.rotateX(-Math.PI / 2);
      const matGround = new THREE.MeshStandardMaterial({
        color: params.groundColor,
        roughness: 0.9,
        flatShading: params.flatShading,
        wireframe: params.wireframe,
        side: THREE.DoubleSide,
        dithering: true,
      });
      const matCeil = new THREE.MeshStandardMaterial({
        color: params.ceilingColor,
        roughness: 0.9,
        flatShading: params.flatShading,
        wireframe: params.wireframe,
        side: THREE.DoubleSide,
        dithering: true,
      });
      const meshGround = new THREE.Mesh(geometry.clone(), matGround);
      const meshCeil = new THREE.Mesh(geometry.clone(), matCeil);
      meshCeil.visible = params.showCeiling;
      const group = new THREE.Group();
      group.add(meshGround);
      group.add(meshCeil);
      group.userData = { meshGround, meshCeil, index };
      return group;
    };

    const chunks = [];
    for (let i = 0; i < CHUNK_COUNT; i++) {
      const chunk = createChunk(i);
      updateChunk(chunk);
      chunks.push(chunk);
      scene.add(chunk);
    }
    chunksRef.current = chunks;

    const applyColors = () => {
      scene.background.set(params.bgColor);
      scene.fog.color.set(params.bgColor);
      scene.fog.density = params.fogDensity;
      hemiLight.intensity = params.ambientInt;
      camLight.intensity = params.camLightInt;
      chunks.forEach((c) => {
        c.userData.meshGround.material.color.set(params.groundColor);
        c.userData.meshCeil.material.color.set(params.ceilingColor);
      });
    };
    const setCeilingVisible = (v) => { chunks.forEach((c) => { c.userData.meshCeil.visible = v; }); };
    const setFlatShading = (v) => {
      chunks.forEach((c) => {
        c.userData.meshGround.material.flatShading = v;
        c.userData.meshGround.material.needsUpdate = true;
        c.userData.meshCeil.material.flatShading = v;
        c.userData.meshCeil.material.needsUpdate = true;
      });
      chunks.forEach((c) => updateChunk(c));
    };
    const setWireframe = (v) => {
      chunks.forEach((c) => {
        c.userData.meshGround.material.wireframe = v;
        c.userData.meshCeil.material.wireframe = v;
      });
    };
    const rebuild = () => chunks.forEach((c) => updateChunk(c));

    apiRef.current = { applyColors, setCeilingVisible, setFlatShading, setWireframe, rebuild };

    let animationId = null;
    let lastTime = 0;
    let elapsed = 0;

    const animate = () => {
      animationId = window.requestAnimationFrame(animate);
      const now = window.performance.now();
      if (lastTime === 0) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;
      elapsed += dt;

      camera.position.z -= params.speed * dt;
      camLight.position.copy(camera.position);

      let maxIndex = 0;
      chunks.forEach((c) => { if (c.userData.index > maxIndex) maxIndex = c.userData.index; });
      chunks.forEach((chunk) => {
        if (chunk.position.z > camera.position.z + CHUNK_LENGTH) {
          chunk.userData.index = maxIndex + 1;
          maxIndex++;
          updateChunk(chunk);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        const material = object.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else if (material) material.dispose();
      });
      if (renderer.domElement.parentNode === stage) stage.removeChild(renderer.domElement);
      renderer.dispose();
      apiRef.current = null;
      chunksRef.current = [];
    };
  }, []);

  return (
    <div className="fly-in-cave-page" ref={stageRef}>
      <div className="fly-in-cave-hud">
        <div className="fly-in-cave-eyebrow">THREE.js</div>
        <h1 className="fly-in-cave-title">Fly In Cave</h1>
        <p className="fly-in-cave-hint">Auto-flying cave tunnel · controls at bottom right</p>
      </div>

      <div className="fly-in-cave-controls">
        <div className="fly-in-cave-controls-title">Tunnel Controls</div>

        <div className="fly-in-cave-control-row">
          <b>Speed</b>
          <input type="range" min="0" max="50" step="0.5" value={ui.speed} aria-label="Speed" onChange={handleSpeed} />
          <span>{Number(ui.speed).toFixed(1)}</span>
        </div>

        <div className="fly-in-cave-control-inline">
          <label><input type="checkbox" checked={ui.showCeiling} aria-label="Show Ceiling" onChange={handleShowCeiling} /> Show Ceiling</label>
        </div>
        <div className="fly-in-cave-control-inline">
          <label><input type="checkbox" checked={ui.flatShading} aria-label="Flat Shading" onChange={handleFlatShading} /> Flat Shading</label>
        </div>
        <div className="fly-in-cave-control-inline">
          <label><input type="checkbox" checked={ui.wireframe} aria-label="Wireframe" onChange={handleWireframe} /> Wireframe</label>
        </div>

        <div className="fly-in-cave-control-row">
          <b>Noise Scale</b>
          <input type="range" min="10" max="150" step="1" value={ui.scale} aria-label="Noise Scale" onChange={handleTerrain("scale")} />
          <span>{Number(ui.scale).toFixed(0)}</span>
        </div>
        <div className="fly-in-cave-control-row">
          <b>Height</b>
          <input type="range" min="1" max="20" step="0.1" value={ui.heightMultiplier} aria-label="Height" onChange={handleTerrain("heightMultiplier")} />
          <span>{Number(ui.heightMultiplier).toFixed(1)}</span>
        </div>
        <div className="fly-in-cave-control-row">
          <b>Detail</b>
          <input type="range" min="0" max="1" step="0.01" value={ui.detailStrength} aria-label="Detail" onChange={handleTerrain("detailStrength")} />
          <span>{Number(ui.detailStrength).toFixed(2)}</span>
        </div>
        <div className="fly-in-cave-control-row">
          <b>Valley Width</b>
          <input type="range" min="5" max="50" step="0.5" value={ui.valleyWidth} aria-label="Valley Width" onChange={handleTerrain("valleyWidth")} />
          <span>{Number(ui.valleyWidth).toFixed(1)}</span>
        </div>

        <div className="fly-in-cave-control-row">
          <b>Background</b>
          <input type="color" value={ui.bgColor} aria-label="Background Color" onChange={handleColor("bgColor")} />
        </div>
        <div className="fly-in-cave-control-row">
          <b>Ground</b>
          <input type="color" value={ui.groundColor} aria-label="Ground Color" onChange={handleColor("groundColor")} />
        </div>
        <div className="fly-in-cave-control-row">
          <b>Ceiling</b>
          <input type="color" value={ui.ceilingColor} aria-label="Ceiling Color" onChange={handleColor("ceilingColor")} />
        </div>
        <div className="fly-in-cave-control-row">
          <b>Fog Density</b>
          <input type="range" min="0" max="0.1" step="0.0001" value={ui.fogDensity} aria-label="Fog Density" onChange={handleFogDensity} />
          <span>{Number(ui.fogDensity).toFixed(4)}</span>
        </div>
        <div className="fly-in-cave-control-row">
          <b>Light Intensity</b>
          <input type="range" min="0" max="3" step="0.1" value={ui.camLightInt} aria-label="Light Intensity" onChange={handleCamLightInt} />
          <span>{Number(ui.camLightInt).toFixed(1)}</span>
        </div>
        <div className="fly-in-cave-control-row">
          <b>Ambient</b>
          <input type="range" min="0" max="3" step="0.1" value={ui.ambientInt} aria-label="Ambient Intensity" onChange={handleAmbientInt} />
          <span>{Number(ui.ambientInt).toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default FlyInCave;
