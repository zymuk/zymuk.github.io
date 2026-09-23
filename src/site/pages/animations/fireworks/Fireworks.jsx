import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import usePageMeta from "../../../../utils/usePageMeta";
import "./Fireworks.css";

// Vertex/fragment shaders from the original demo (WebGL1 GLSL: attribute + varying).
const VERTEX_SHADER = `
        precision mediump float;
        attribute vec3 position;
        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        uniform float size;
        attribute float adjustSize;
        uniform vec3 cameraPosition;
        varying float distanceCamera;
        attribute vec3 velocity;
        attribute vec4 color;
        varying vec4 vColor;
        void main() {
            vColor = color;
            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * adjustSize * (100.0 / length(modelViewPosition.xyz));
            gl_Position = projectionMatrix * modelViewPosition;
        }
    `;

const FRAGMENT_SHADER = `
        precision mediump float;
        uniform sampler2D texture;
        uniform float uBrightness;
        uniform float uGlow;
        varying vec4 vColor;
        void main() {
            vec4 color = vec4(texture2D(texture, gl_PointCoord));
            vec3 glowColor = mix(color.rgb, vec3(1.0), uGlow);
            gl_FragColor = vec4(glowColor, color.a) * vColor * uBrightness;
        }
    `;

const TEXTURE_SIZE = 128.0;
const DEFAULT_PARTICLE_SIZE = 300;
const GRAVITY = new THREE.Vector3(0, -0.005, 0);

// Shared across every RawShaderMaterial: mutating their values brightens,
// darkens or adds white-hot glow to all firework particles immediately and
// also applies to newly launched ones.
const BRIGHTNESS = { value: 1 };
const GLOW = { value: 0 };

const getRandomNum = (max = 0, min = 0) =>
  Math.floor(Math.random() * (max + 1 - min)) + min;

// Replaces the simplex-noise CDN with a deterministic, dependency-free layered
// value "noise" so the rough ground still ripples without external libraries.
const groundNoise = (x, y, time) =>
  Math.sin(x * 0.01 + time * 0.0002) * Math.cos(y * 0.01 + time * 0.0002) * 3 +
  Math.sin(x * 0.02 + time * 0.00002) * Math.cos(y * 0.024 + time * 0.00004) * 2 +
  Math.sin(x * 0.037 + y * 0.029 + time * 0.00005) * 1.5 +
  Math.sin(x * 0.009 + y * 0.012 + time * 0.00003) * 1.5;

const Fireworks = () => {
  usePageMeta({
    title: "Fireworks",
    description:
      "A WebGL fireworks show: point-particle bursts explode above a rippling wireframe ground, draggable and auto-launching",
    keywords:
      "fireworks, three.js, webgl, points, particles, shader, creative coding, animation",
  });

  const stageRef = useRef(null);
  const [particleSize, setParticleSize] = useState(DEFAULT_PARTICLE_SIZE);
  const [autoLaunch, setAutoLaunch] = useState(true);
  const [paused, setPaused] = useState(false);
  const [brightness, setBrightness] = useState(BRIGHTNESS.value);
  const [glow, setGlow] = useState(GLOW.value);
  const particleSizeRef = useRef(DEFAULT_PARTICLE_SIZE);
  const autoLaunchRef = useRef(true);
  const pausedRef = useRef(false);
  const launchApiRef = useRef(null);

  const handleParticleSize = (event) => {
    const value = Number(event.target.value);
    setParticleSize(value);
    particleSizeRef.current = value;
  };

  const handleAutoLaunch = (event) => {
    setAutoLaunch(event.target.checked);
    autoLaunchRef.current = event.target.checked;
  };

  const handlePause = (event) => {
    setPaused(event.target.checked);
    pausedRef.current = event.target.checked;
  };

  const handleBrightness = (event) => {
    const value = Number(event.target.value);
    setBrightness(value);
    BRIGHTNESS.value = value;
  };

  const handleGlow = (event) => {
    const value = Number(event.target.value);
    setGlow(value);
    GLOW.value = value;
  };

  const handleLaunch = () => {
    if (launchApiRef.current) launchApiRef.current();
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let scene;
    let camera;
    let renderer;
    let orbitControls;
    let planeMesh;
    const fireworksInstances = [];

    const drawRadialGradation = (ctx, canvasRadius, canvasW, canvasH) => {
      ctx.save();
      const gradient = ctx.createRadialGradient(
        canvasRadius,
        canvasRadius,
        0,
        canvasRadius,
        canvasRadius,
        canvasRadius
      );
      gradient.addColorStop(0.0, "rgba(255,255,255,1.0)");
      gradient.addColorStop(0.5, "rgba(255,255,255,0.5)");
      gradient.addColorStop(1.0, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasW, canvasH);
      ctx.restore();
    };

    const getTexture = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const diameter = TEXTURE_SIZE;
      canvas.width = diameter;
      canvas.height = diameter;
      const canvasRadius = diameter / 2;

      if (ctx) {
        drawRadialGradation(ctx, canvasRadius, canvas.width, canvas.height);
      }
      const texture = new THREE.Texture(canvas);
      texture.type = THREE.FloatType;
      texture.needsUpdate = true;
      return texture;
    };

    const canvasTexture = getTexture();

    const getPointMesh = (num, vels, type) => {
      const bufferGeometry = new THREE.BufferGeometry();
      const vertices = [];
      const velocities = [];
      const colors = [];
      const adjustSizes = [];
      const masses = [];
      const colorType = Math.random() > 0.3 ? "single" : "multiple";
      const singleColor = getRandomNum(100, 20) * 0.01;
      const multipleColor = () => getRandomNum(100, 1) * 0.01;
      let rgbType;
      const rgbTypeDice = Math.random();
      if (rgbTypeDice > 0.66) {
        rgbType = "red";
      } else if (rgbTypeDice > 0.33) {
        rgbType = "green";
      } else {
        rgbType = "blue";
      }
      for (let i = 0; i < num; i++) {
        const pos = new THREE.Vector3(0, 0, 0);
        vertices.push(pos.x, pos.y, pos.z);
        velocities.push(vels[i].x, vels[i].y, vels[i].z);
        if (type === "seed") {
          const size = Math.pow(vels[i].y, 2) * 0.04 * (i === 0 ? 1.1 : 1);
          adjustSizes.push(size);
          masses.push(size * 0.017);
          colors.push(1.0, 1.0, 1.0, 1.0);
        } else {
          const size = getRandomNum(particleSizeRef.current, 10) * 0.001;
          adjustSizes.push(size);
          masses.push(size * 0.017);
          if (colorType === "multiple") {
            colors.push(multipleColor(), multipleColor(), multipleColor(), 1.0);
          } else {
            switch (rgbType) {
              case "red":
                colors.push(singleColor, 0.1, 0.1, 1.0);
                break;
              case "green":
                colors.push(0.1, singleColor, 0.1, 1.0);
                break;
              case "blue":
                colors.push(0.1, 0.1, singleColor, 1.0);
                break;
              default:
                colors.push(singleColor, 0.1, 0.1, 1.0);
            }
          }
        }
      }
      bufferGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3).setUsage(
          THREE.DynamicDrawUsage
        )
      );
      bufferGeometry.setAttribute(
        "velocity",
        new THREE.Float32BufferAttribute(velocities, 3).setUsage(
          THREE.DynamicDrawUsage
        )
      );
      bufferGeometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 4).setUsage(
          THREE.DynamicDrawUsage
        )
      );
      bufferGeometry.setAttribute(
        "adjustSize",
        new THREE.Float32BufferAttribute(adjustSizes, 1).setUsage(
          THREE.DynamicDrawUsage
        )
      );
      bufferGeometry.setAttribute(
        "mass",
        new THREE.Float32BufferAttribute(masses, 1).setUsage(
          THREE.DynamicDrawUsage
        )
      );
      const shaderMaterial = new THREE.RawShaderMaterial({
        uniforms: {
          size: { type: "f", value: TEXTURE_SIZE },
          texture: { type: "t", value: canvasTexture },
          uBrightness: BRIGHTNESS,
          uGlow: GLOW,
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
      });
      return new THREE.Points(bufferGeometry, shaderMaterial);
    };

    class ParticleMesh {
      constructor(num, vels, type) {
        this.particleNum = num;
        this.timerStartFading = 10;
        this.mesh = getPointMesh(num, vels, type);
      }
      update() {
        if (this.timerStartFading > 0) this.timerStartFading -= 0.3;
        const { position, velocity, color, mass } =
          this.mesh.geometry.attributes;
        const decrementRandom = () =>
          Math.random() > 0.5 ? 0.98 : 0.96;
        const decrementByVel = (v) =>
          Math.random() > 0.5 ? 0 : (1 - v) * 0.1;
        for (let i = 0; i < this.particleNum; i++) {
          const x = i * 3;
          const y = x + 1;
          const z = x + 2;
          velocity.array[y] += GRAVITY.y - mass.array[i];
          velocity.array[x] *= 0.998;
          velocity.array[z] *= 0.998;
          velocity.array[y] *= 0.998;
          position.array[x] += velocity.array[x];
          position.array[y] += velocity.array[y];
          position.array[z] += velocity.array[z];
          const a = i * 4 + 3;
          if (this.timerStartFading <= 0) {
            color.array[a] *= decrementRandom() - decrementByVel(color.array[a]);
            if (color.array[a] < 0.001) color.array[a] = 0;
          }
        }
        position.needsUpdate = true;
        velocity.needsUpdate = true;
        color.needsUpdate = true;
      }
      disposeAll() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
      }
    }

    class ParticleSeedMesh extends ParticleMesh {
      constructor(num, vels) {
        super(num, vels, "seed");
      }
      update() {
        const { position, velocity, color, mass } =
          this.mesh.geometry.attributes;
        const decrementRandom = () => (Math.random() > 0.3 ? 0.99 : 0.96);
        const decrementByVel = (v) =>
          Math.random() > 0.3 ? 0 : (1 - v) * 0.1;
        const shake = () => (Math.random() > 0.5 ? 0.05 : -0.05);
        const dice = () => Math.random() > 0.1;
        const seedFriction = 0.998 * 0.98;
        for (let i = 0; i < this.particleNum; i++) {
          const x = i * 3;
          const y = x + 1;
          const z = x + 2;
          velocity.array[y] += GRAVITY.y - mass.array[i];
          velocity.array[x] *= seedFriction;
          velocity.array[z] *= seedFriction;
          velocity.array[y] *= seedFriction;
          position.array[x] += velocity.array[x];
          position.array[y] += velocity.array[y];
          position.array[z] += velocity.array[z];
          if (dice()) position.array[x] += shake();
          if (dice()) position.array[z] += shake();
          const a = i * 4 + 3;
          color.array[a] *= decrementRandom() - decrementByVel(color.array[a]);
          if (color.array[a] < 0.001) color.array[a] = 0;
        }
        position.needsUpdate = true;
        velocity.needsUpdate = true;
        color.needsUpdate = true;
      }
    }

    class ParticleTailMesh extends ParticleMesh {
      constructor(num, vels) {
        super(num, vels, "trail");
      }
      update() {
        const { position, velocity, color, mass } =
          this.mesh.geometry.attributes;
        const decrementRandom = () => (Math.random() > 0.3 ? 0.98 : 0.95);
        const shake = () => (Math.random() > 0.5 ? 0.05 : -0.05);
        const dice = () => Math.random() > 0.2;
        for (let i = 0; i < this.particleNum; i++) {
          const x = i * 3;
          const y = x + 1;
          const z = x + 2;
          velocity.array[y] += GRAVITY.y - mass.array[i];
          velocity.array[x] *= 0.998;
          velocity.array[z] *= 0.998;
          velocity.array[y] *= 0.998;
          position.array[x] += velocity.array[x];
          position.array[y] += velocity.array[y];
          position.array[z] += velocity.array[z];
          if (dice()) position.array[x] += shake();
          if (dice()) position.array[z] += shake();
          const a = i * 4 + 3;
          color.array[a] *= decrementRandom();
          if (color.array[a] < 0.001) color.array[a] = 0;
        }
        position.needsUpdate = true;
        velocity.needsUpdate = true;
        color.needsUpdate = true;
      }
    }

    class BasicFireworks {
      constructor() {
        this.meshGroup = new THREE.Group();
        this.isExplode = false;
        const max = 400;
        const min = 150;
        this.petalsNum = getRandomNum(max, min);
        this.life = 150;
        this.flowerSizeRate = THREE.MathUtils.mapLinear(
          this.petalsNum,
          min,
          max,
          0.4,
          0.7
        );
        this.seed = this.getSeed();
        this.meshGroup.add(this.seed.mesh);
      }
      getSeed() {
        const num = 40;
        const vels = [];
        for (let i = 0; i < num; i++) {
          const vx = 0;
          const vy =
            i === 0
              ? Math.random() * 2.5 + 0.9
              : Math.random() * 2.0 + 0.4;
          const vz = 0;
          vels.push(new THREE.Vector3(vx, vy, vz));
        }
        const pm = new ParticleSeedMesh(num, vels);
        const x = Math.random() * 80 - 40;
        const y = -50;
        const z = Math.random() * 80 - 40;
        pm.mesh.position.set(x, y, z);
        return pm;
      }
      explode(pos) {
        this.isExplode = true;
        this.flower = this.getFlower(pos);
        this.meshGroup.add(this.flower.mesh);
        this.meshGroup.remove(this.seed.mesh);
        this.seed.disposeAll();
      }
      getFlower(pos) {
        const num = this.petalsNum;
        const vels = [];
        let radius;
        const dice = Math.random();

        if (dice > 0.5) {
          for (let i = 0; i < num; i++) {
            radius = getRandomNum(120, 60) * 0.01;
            const theta = THREE.MathUtils.degToRad(Math.random() * 180);
            const phi = THREE.MathUtils.degToRad(Math.random() * 360);
            const vx = Math.sin(theta) * Math.cos(phi) * radius;
            const vy = Math.sin(theta) * Math.sin(phi) * radius;
            const vz = Math.cos(theta) * radius;
            const vel = new THREE.Vector3(vx, vy, vz);
            vel.multiplyScalar(this.flowerSizeRate);
            vels.push(vel);
          }
        } else {
          const zStep = 180 / num;
          const trad = (360 * (Math.random() * 20 + 1)) / num;
          const xStep = trad;
          const yStep = trad;
          radius = getRandomNum(120, 60) * 0.01;
          for (let i = 0; i < num; i++) {
            const sphereRate = Math.sin(THREE.MathUtils.degToRad(zStep * i));
            const vz = Math.cos(THREE.MathUtils.degToRad(zStep * i)) * radius;
            const vx =
              Math.cos(THREE.MathUtils.degToRad(xStep * i)) *
              sphereRate *
              radius;
            const vy =
              Math.sin(THREE.MathUtils.degToRad(yStep * i)) *
              sphereRate *
              radius;
            const vel = new THREE.Vector3(vx, vy, vz);
            vel.multiplyScalar(this.flowerSizeRate);
            vels.push(vel);
          }
        }

        const particleMesh = new ParticleMesh(num, vels);
        particleMesh.mesh.position.set(pos.x, pos.y, pos.z);
        return particleMesh;
      }
      update() {
        if (!this.isExplode) {
          this.drawTail();
        } else {
          this.flower.update();
          if (this.life > 0) this.life -= 1;
        }
      }
      drawTail() {
        this.seed.update();
        const { position, velocity } = this.seed.mesh.geometry.attributes;
        let count = 0;
        for (let i = 1, l = velocity.array.length; i < l; i += 3) {
          if (velocity.array[i] > 0) count++;
        }

        if (count !== 0) return;
        const { x, y, z } = this.seed.mesh.position;
        const flowerPos = new THREE.Vector3(x, y, z);
        let highestPos = 0;
        let offsetPos;
        for (let i = 1, l = position.array.length; i < l; i += 3) {
          const p = position.array[i];
          if (p > highestPos) {
            highestPos = p;
            offsetPos = new THREE.Vector3(
              position.array[i - 1],
              p,
              position.array[i + 2]
            );
          }
        }
        flowerPos.add(offsetPos);
        this.explode(flowerPos);
      }
    }

    class RichFireworks extends BasicFireworks {
      constructor() {
        super();
        const max = 150;
        const min = 100;
        this.petalsNum = getRandomNum(max, min);
        this.flowerSizeRate = THREE.MathUtils.mapLinear(
          this.petalsNum,
          min,
          max,
          0.4,
          0.7
        );
        this.tailMeshGroup = new THREE.Group();
        this.tails = [];
      }
      explode(pos) {
        this.isExplode = true;
        this.flower = this.getFlower(pos);
        this.tails = this.getTail();
        this.meshGroup.add(this.flower.mesh);
        this.meshGroup.add(this.tailMeshGroup);
      }
      getTail() {
        const tails = [];
        const num = 20;
        const { color: petalColor } = this.flower.mesh.geometry.attributes;

        for (let i = 0; i < this.petalsNum; i++) {
          const vels = [];
          for (let j = 0; j < num; j++) {
            vels.push(new THREE.Vector3(0, 0, 0));
          }
          const tail = new ParticleTailMesh(num, vels);

          const r = i * 4;
          const g = r + 1;
          const b = r + 2;
          const a = r + 3;

          const petalR = petalColor.array[r];
          const petalG = petalColor.array[g];
          const petalB = petalColor.array[b];
          const petalA = petalColor.array[a];

          const { position, color } = tail.mesh.geometry.attributes;

          for (let k = 0; k < position.count; k++) {
            const kr = k * 4;
            color.array[kr] = petalR;
            color.array[kr + 1] = petalG;
            color.array[kr + 2] = petalB;
            color.array[kr + 3] = petalA;
          }

          const { x, y, z } = this.flower.mesh.position;
          tail.mesh.position.set(x, y, z);
          tails.push(tail);
          this.tailMeshGroup.add(tail.mesh);
        }
        return tails;
      }
      update() {
        if (!this.isExplode) {
          this.drawTail();
        } else {
          this.flower.update();

          const { position: flowerGeometry } =
            this.flower.mesh.geometry.attributes;

          for (let i = 0, l = this.tails.length; i < l; i++) {
            const tail = this.tails[i];
            tail.update();
            const x = i * 3;
            const flowerPos = new THREE.Vector3(
              flowerGeometry.array[x],
              flowerGeometry.array[x + 1],
              flowerGeometry.array[x + 2]
            );

            const { position, velocity } = tail.mesh.geometry.attributes;
            for (let k = 0; k < position.count; k++) {
              const kx = k * 3;
              const tailPos = new THREE.Vector3(
                position.array[kx],
                position.array[kx + 1],
                position.array[kx + 2]
              );
              const tailVel = new THREE.Vector3(
                velocity.array[kx],
                velocity.array[kx + 1],
                velocity.array[kx + 2]
              );
              const desiredVelocity = new THREE.Vector3().subVectors(
                flowerPos,
                tailPos
              );
              const steer = desiredVelocity.sub(tailVel);
              steer.normalize();
              steer.multiplyScalar(Math.random() * 0.0003 * this.life);
              velocity.array[kx] += steer.x;
              velocity.array[kx + 1] += steer.y;
              velocity.array[kx + 2] += steer.z;
            }
            velocity.needsUpdate = true;
          }

          if (this.life > 0) this.life -= 1.2;
        }
      }
    }

    const makeRoughGround = (mesh, time) => {
      const position = mesh.geometry.attributes.position;
      const array = position.array;
      for (let i = 0; i < array.length; i += 3) {
        const x = array[i];
        const y = array[i + 1];
        const distance =
          groundNoise(x * 0.01, y * 0.01, time) * 2 +
          groundNoise(x * 0.02, y * 0.012, time) * 1.5 +
          groundNoise(x * 0.037, y * 0.029, time) * 1.5;
        array[i + 2] = distance;
      }
      position.needsUpdate = true;
      mesh.geometry.computeVertexNormals();
    };

    const launchFireworks = () => {
      if (fireworksInstances.length > 5) return;
      const fw =
        Math.random() > 8 ? new BasicFireworks() : new RichFireworks();
      fireworksInstances.push(fw);
      scene.add(fw.meshGroup);
    };

    launchApiRef.current = launchFireworks;

    const autoLaunch = () => {
      if (!autoLaunchRef.current) return;
      if (Math.random() > 0.7) launchFireworks();
    };

    let animationId = null;

    const render = () => {
      animationId = window.requestAnimationFrame(render);

      if (!pausedRef.current) {
        orbitControls.update();
        makeRoughGround(planeMesh, Date.now());

        const explodedIndexList = [];
        for (let i = fireworksInstances.length - 1; i >= 0; i--) {
          const instance = fireworksInstances[i];
          instance.update();
          if (instance.isExplode) explodedIndexList.push(i);
        }

        for (let i = 0, l = explodedIndexList.length; i < l; i++) {
          const index = explodedIndexList[i];
          const instance = fireworksInstances[index];
          if (!instance) continue;

          instance.meshGroup.remove(instance.seed.mesh);
          instance.seed.disposeAll();
          if (instance.life <= 0) {
            scene.remove(instance.meshGroup);
            if (instance.tailMeshGroup) {
              instance.tails.forEach((v) => {
                v.disposeAll();
              });
            }
            instance.flower.disposeAll();
            fireworksInstances.splice(index, 1);
          }
        }
      }

      renderer.render(scene, camera);
    };

    const onResize = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const init = () => {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        45,
        stage.clientWidth / stage.clientHeight,
        0.1,
        2000
      );
      camera.position.set(0, -40, 170);
      camera.lookAt(scene.position);

      const canvas = document.createElement("canvas");
      // The original shaders use WebGL1 GLSL (attribute/varying), so request a
      // WebGL1 context explicitly and hand it to the renderer.
      const glContext = canvas.getContext("webgl", {
        antialias: true,
        alpha: true,
      });
      if (!glContext) return false;

      renderer = new THREE.WebGLRenderer({
        canvas,
        context: glContext,
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.setClearColor(new THREE.Color(0x000000), 0);
      renderer.setSize(stage.clientWidth, stage.clientHeight);
      renderer.shadowMap.enabled = true;

      orbitControls = new OrbitControls(camera, renderer.domElement);
      orbitControls.autoRotate = false;
      orbitControls.enableDamping = true;
      orbitControls.dampingFactor = 0.2;

      const ambientLight = new THREE.AmbientLight(0x666666);
      scene.add(ambientLight);

      const spotLight = new THREE.SpotLight(0xffffff);
      spotLight.distance = 2000;
      spotLight.position.set(-500, 1000, 0);
      spotLight.castShadow = true;
      scene.add(spotLight);

      const planeGeometry = new THREE.PlaneGeometry(200, 200, 10, 10);
      const planeMaterial = new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,
        wireframe: true,
      });

      planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
      planeMesh.receiveShadow = true;
      planeMesh.rotation.x = -0.5 * Math.PI;
      planeMesh.position.y = -50;
      scene.add(planeMesh);

      window.addEventListener("resize", onResize);

      const onClickCanvas = () => {
        if (autoLaunchRef.current) return;
        launchFireworks();
      };
      renderer.domElement.addEventListener("click", onClickCanvas);

      stage.appendChild(renderer.domElement);
      render();

      const autoLaunchId = window.setInterval(autoLaunch, 100);

      return () => {
        window.cancelAnimationFrame(animationId);
        window.removeEventListener("resize", onResize);
        renderer.domElement.removeEventListener("click", onClickCanvas);
        window.clearInterval(autoLaunchId);
        launchApiRef.current = null;

        fireworksInstances.forEach((instance) => {
          scene.remove(instance.meshGroup);
          if (instance.seed) instance.seed.disposeAll();
          if (instance.flower) instance.flower.disposeAll();
          if (instance.tails) {
            instance.tails.forEach((tail) => tail.disposeAll());
          }
        });
        fireworksInstances.length = 0;

        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) {
            material.forEach((m) => m.dispose());
          } else if (material) {
            material.dispose();
          }
        });

        if (renderer.domElement.parentNode === stage) {
          stage.removeChild(renderer.domElement);
        }
        renderer.dispose();
        orbitControls.dispose();
      };
    };

    const dispose = init();
    if (dispose === false) return undefined;
    return dispose;
  }, []);

  return (
    <div className="fireworks-page" ref={stageRef}>
      <div className="fireworks-hud">
        <div className="fireworks-eyebrow">THREE.js</div>
        <h1 className="fireworks-title">Fireworks</h1>
        <p className="fireworks-hint">
          {paused ? "Paused · " : ""}
          {autoLaunch ? "Auto-launching" : "Click the scene to launch"} · drag
          to orbit
        </p>
      </div>
      <div className="fireworks-controls">
        <div className="fireworks-controls-title">Controls</div>
        <label className="fireworks-control-row">
          <span>
            Particle size <b>{particleSize}</b>
          </span>
          <input
            type="range"
            min="100"
            max="600"
            step="10"
            value={particleSize}
            onChange={handleParticleSize}
            aria-label="Particle size"
          />
        </label>
        <label className="fireworks-control-row">
          <span>
            Brightness <b>{brightness.toFixed(1)}</b>
          </span>
          <input
            type="range"
            min="0.2"
            max="2"
            step="0.1"
            value={brightness}
            onChange={handleBrightness}
            aria-label="Brightness"
          />
        </label>
        <label className="fireworks-control-row">
          <span>
            Glow <b>{glow.toFixed(1)}</b>
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={glow}
            onChange={handleGlow}
            aria-label="Glow"
          />
        </label>
        <label className="fireworks-control-row fireworks-control-inline">
          <input
            type="checkbox"
            checked={autoLaunch}
            onChange={handleAutoLaunch}
          />
          Auto launch
        </label>
        <label className="fireworks-control-row fireworks-control-inline">
          <input type="checkbox" checked={paused} onChange={handlePause} />
          Pause
        </label>
        <button
          type="button"
          className="fireworks-launch-btn"
          onClick={handleLaunch}
        >
          Launch
        </button>
      </div>
    </div>
  );
};

export default Fireworks;