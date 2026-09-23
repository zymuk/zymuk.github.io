import React, { useEffect, useRef } from "react";
import usePageMeta from "../../../../utils/usePageMeta";
import "./NotComets.css";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

const deepClone = (value) =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));

const STAR_TINTS = [
  "rgba(255,255,255,0.95)",
  "rgba(255,220,150,0.9)",
  "rgba(170,220,255,0.9)",
  "rgba(255,170,200,0.9)",
  "rgba(200,255,180,0.9)",
  "rgba(255,255,200,0.9)",
  "rgba(220,180,255,0.9)",
  "rgba(255,200,160,0.9)",
  "rgba(180,220,255,0.9)",
];

const NotComets = () => {
  usePageMeta({
    title: "Not Comets",
    description:
      "A drifting starfield around a glowing crystal terrain, with growing comet trails rendered on a pure Canvas 2D renderer.",
    keywords:
      "not comets, comets, particle, starfield, crystal, comet, canvas 2d, creative coding, animation, space",
  });
  const stageRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const makeGlowSprite = (tint) => {
      const size = 256;
      const sprite = document.createElement("canvas");
      sprite.width = size;
      sprite.height = size;
      const ctx = sprite.getContext("2d");
      const gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2,
      );
      gradient.addColorStop(0, tint);
      gradient.addColorStop(0.2, "rgba(255,255,255,0.75)");
      gradient.addColorStop(0.55, "rgba(255,255,255,0.18)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      return sprite;
    };

    const starImgs = STAR_TINTS.map((tint) => ({
      img: makeGlowSprite(tint),
      loaded: true,
    }));
    const burst2 = makeGlowSprite("rgba(255,215,130,0.9)");
    const burst4 = makeGlowSprite("rgba(255,240,225,0.95)");

    const c = document.createElement("canvas");
    c.width = CANVAS_WIDTH;
    c.height = CANVAS_HEIGHT;
    stage.appendChild(c);

    const x = c.getContext("2d");
    if (!x) {
      stage.removeChild(c);
      return undefined;
    }

    const C = Math.cos;
    const S = Math.sin;
    const Rn = Math.random;

    let t = 0;
    let X = 0;
    let Y = 0;
    let Z = 0;
    let d = 0;
    let oX = 0;
    let oY = 0;
    let oZ = 16;
    let oXv = 0;
    let oYv = 0;
    let oZv = 0;
    let oZ_ = 16;
    let Rl = 0;
    let Pt = 0;
    let Yw = 0;

    const R = (Rl, Pt, Yw, m, ovr = false) => {
      const A = Math.atan2;
      const Hp = Math.hypot;
      let p;
      if (m || ovr) {
        if (!ovr) {
          X += oX;
          Y += oY;
          Z += oZ;
        }
        X = S((p = A(X, Z) + Yw)) * (d = Hp(X, Z));
        Z = C(p) * d;
        Y = S((p = A(Y, Z) + Pt)) * (d = Hp(Y, Z));
        Z = C(p) * d;
        X = S((p = A(X, Y) + Rl)) * (d = Hp(X, Y));
        Y = C(p) * d;
      }
      if (!m && !ovr) {
        Y = S((p = A(Y, Z) + Pt)) * (d = Hp(Y, Z));
        Z = C(p) * d;
        X = S((p = A(X, Z) + Yw)) * (d = Hp(X, Z));
        Z = C(p) * d;
        X = S((p = A(X, Y) + Rl)) * (d = Hp(X, Y));
        Y = C(p) * d;
      }
      if (m) {
        Z += oZ_;
      }
    };

    const Q = () => [
      c.width / 2 + (X / Z) * 700,
      c.height / 2 + (Y / Z) * 700,
    ];

    const rsz = () => {
      const sw = stage.clientWidth;
      const sh = stage.clientHeight;
      const margin = 10;
      const ratio = 0.5625;
      let n;
      if (sh / sw > ratio) {
        c.style.width = `${(n = sw) - margin * 2}px`;
        c.style.height = `${n * ratio - margin * 2}px`;
      } else {
        c.style.height = `${(n = sh) - margin * 2}px`;
        c.style.width = `${n / ratio - margin * 2}px`;
      }
    };
    rsz();
    window.addEventListener("resize", rsz);

    const stroke = (scol, fcol, lw, dl, oga = 1, ocp = true) => {
      if (scol) {
        x.strokeStyle = scol;
        if (ocp) x.closePath();
        x.lineWidth = Math.min(200, (50 / Z) * lw);
        if (dl) {
          x.globalAlpha = 0.33 * oga;
          x.stroke();
          x.lineWidth /= 4;
        }
        x.globalAlpha = 1 * oga;
        x.stroke();
      }
      if (fcol) {
        x.globalAlpha = 1 * oga;
        x.fillStyle = fcol;
        x.fill();
      }
    };

    let network = [[], []];
    const advFreq = 0;
    const forkRate = 8;

    const advance = (shps, sidx) => {
      const squirriliness = Math.min(0.5, Math.max(0, 0.3 - C(t / 4)));
      for (let m = 1; m--; ) {
        const sd = 4;
        const ls = network[sidx][1] + 1 + S(C(t + sidx) * 20);
        const seglen = 3;
        let op1 = 0;
        let op2 = 0;
        let a = [];
        let tx;
        let ty;
        let tz;
        let p1;
        let p2;
        let p1v;
        let p2v;
        let ls1;
        let ls2;
        let t1;
        let t2;
        if (typeof shps === "undefined" || !shps.length) {
          tx = ty = tz = 0;
          network[sidx] = [[], 1];
          p1 = 0;
          p2 = 0;
          p1v = (Rn() - 0.5) * squirriliness;
          p2v = (Rn() - 0.5) * squirriliness;
          ls1 = ls2 = ls;
          t1 = t2 = t * 16;
        } else {
          const l = shps.length - 1;
          op1 = shps[l][5];
          op2 = shps[l][6];
          ls1 = shps[l][11];
          t1 = shps[l][12];
          t2 = t * 16;
          ls2 = ls;
          X = 0;
          Y = 0;
          Z = seglen;
          R(0, op2, op1, 0, 0);
          const vx = X;
          const vy = Y;
          const vz = Z;
          tx = shps[l][0] + vx;
          ty = shps[l][1] + vy;
          tz = shps[l][2] + vz;
          p1v = shps[l][9];
          p2v = shps[l][10];
          p1v /= 1.2;
          p2v /= 2;
          p1v += ((Rn() - 0.5) * squirriliness) / 2;
          p2v += ((Rn() - 0.5) * squirriliness) / 3;
          const op1f = squirriliness < 0.01 ? C(t * 10) * 0.2 : 0;
          const op2f = squirriliness < 0.01 ? -C(t * 20) * 0.2 - 0.00066 : 0;
          p1 = op1 + p1v + op1f;
          p2 = op2 + p2v + op2f;
          p2 /= 1.01;
        }
        for (let i = sd; i--; ) {
          let b = [];
          let p = (Math.PI * 2 / sd) * i + Math.PI / sd + t1;
          X = S(p) * ls1;
          Y = C(p) * ls1;
          Z = -seglen / 2;
          R(0, op2, op1, 0, 0);
          b = [...b, [X, Y, Z]];
          p = (Math.PI * 2 / sd) * (i + 1) + Math.PI / sd + t1;
          X = S(p) * ls1;
          Y = C(p) * ls1;
          Z = -seglen / 2;
          R(0, op2, op1, 0, 0);
          b = [...b, [X, Y, Z]];
          p = (Math.PI * 2 / sd) * (i + 1) + Math.PI / sd + t2;
          X = S(p) * ls2;
          Y = C(p) * ls2;
          Z = seglen / 2;
          R(0, p2, p1, 0, 0);
          b = [...b, [X, Y, Z]];
          p = (Math.PI * 2 / sd) * i + Math.PI / sd + t2;
          X = S(p) * ls2;
          Y = C(p) * ls2;
          Z = seglen / 2;
          R(0, p2, p1, 0, 0);
          b = [...b, [X, Y, Z]];
          a = [...a, b];
        }
        network[sidx][0].push([tx, ty, tz, a, 1, p1, p2, op1, op2, p1v, p2v, ls2, t2]);
      }
    };

    const cl = 24;
    const rw = 24;
    const br = 1;
    const sp = 3;
    const G_ = 10000 / 2;
    const iSTc = 2000;

    let terrain = [];
    Array(cl * rw * br)
      .fill()
      .forEach((v, i) => {
        let a = [];
        const tx = ((i % cl) - cl / 2 + 0.5) * sp;
        const ty = ((i / cl / rw | 0) - br / 2 + 0.5) * sp;
        const tz = (((i / cl | 0) % rw) - rw / 2 + 0.5) * sp;
        switch (Rn() * 24 | 0) {
          case 0: {
            const type = 0;
            const ls = (sp * 2 ** 0.5) / 2;
            for (let j = 4; j--; ) {
              let b = [];
              let p = (Math.PI * 2 / 4) * j + Math.PI / 4;
              X = S(p) * ls;
              Y = 0;
              Z = C(p) * ls;
              b = [...b, [X, Y, Z]];
              p = (Math.PI * 2 / 4) * (j + 1) + Math.PI / 4;
              X = S(p) * ls;
              Y = 0;
              Z = C(p) * ls;
              b = [...b, [X, Y, Z]];
              X = 0;
              Y = -sp / 1.5;
              Z = 0;
              b = [...b, [X, Y, Z]];
              a = [...a, [b, "#fb08", type, tx, ty, tz]];
            }
            break;
          }
          default: {
            const type = 2;
            let b = [];
            const ls = (sp * 2 ** 0.5) / 2;
            for (let j = 4; j--; ) {
              let p = (Math.PI * 2 / 4) * j + Math.PI / 4;
              X = S(p) * ls;
              Y = 0;
              Z = C(p) * ls;
              b = [...b, [X, Y, Z]];
            }
            a = [...a, [b, `hsla(${30 + Rn() * 120},99%,25%,.2)`, type, tx, ty, tz]];
            break;
          }
        }
        terrain = [...terrain, ...a];
      });

    let ST = Array(iSTc).fill().map(() => {
      X = (Rn() - 0.5) * G_;
      Y = (Rn() - 0.5) * G_;
      Z = (Rn() - 0.5) * G_;
      return [X, Y, Z];
    });

    let flashes = [];
    const spawnFlash = (fx, fy, fz, mag = 1) => {
      flashes = [...flashes, [fx, fy, fz, mag]];
    };

    let rafId = 0;

    const renderFrame = () => {
      rafId = window.requestAnimationFrame(renderFrame);

      x.globalAlpha = 1;
      x.fillStyle = "#0008";
      x.fillRect(0, 0, c.width, c.height);

      network.forEach((shps, sidx) => {
        if (!((t * 60 | 0) % advFreq)) advance(shps[0], sidx);
      });

      const homing = 40;
      const min = 8;
      const drag = 1.4;

      const branchCam = 0;
      let ax_ = network[branchCam][0][network[branchCam][0].length - 1][0];
      let ay_ = network[branchCam][0][network[branchCam][0].length - 1][1];
      let az_ = network[branchCam][0][network[branchCam][0].length - 1][2];

      if (!((t * 60 | 0) % forkRate)) {
        spawnFlash(ax_, ay_, az_);
        network.push(deepClone(network[0]));
      }

      oXv /= drag;
      oYv /= drag;
      oZv /= drag;
      oXv += (-ax_ - oX) / homing;
      oYv += (-ay_ - oY) / homing;
      oZv += (-az_ - oZ) / homing;
      const d1 = Math.hypot(oXv, oYv, oZv) + 0.0001;
      const d2 = Math.min(d1, min);
      oXv = (oXv / d1) * d2;
      oYv = (oYv / d1) * d2;
      oZv = (oZv / d1) * d2;

      oX += oXv;
      oY += oYv;
      oZ += oZv;
      oZ_ = Math.min(80, Math.max(36, (0.3 + C(t / 2 + 1.5)) * 250));
      Rl = 0;
      Pt = Math.min(0, Math.max(-Math.PI / 3, (0.3 + C(t / 2 - 1.5)) * Math.PI)) - 0.15;
      Yw = Math.min(Math.PI, Math.max(0, 0.3 + C(t / 3)) * Math.PI * 2);

      ST.forEach((v, i) => {
        X = v[0];
        Y = v[1];
        Z = v[2];
        if (X + oX > G_ / 2) X = v[0] -= G_;
        if (Y + oY > G_ / 2) Y = v[1] -= G_;
        if (Z + oZ > G_ / 2) Z = v[2] -= G_;
        if (X + oX < -G_ / 2) X = v[0] += G_;
        if (Y + oY < -G_ / 2) Y = v[1] += G_;
        if (Z + oZ < -G_ / 2) Z = v[2] += G_;
        R(Rl, Pt, Yw, 1);
        if (Z > 0) {
          const lq = Q();
          const alpha = Math.min(
            1,
            Math.max(
              0,
              (1 / ((1 + Math.hypot(X, Y, Z)) ** 10 / 99999999999999999999999999999999)) *
                Math.min(1, Z / 1e3),
            ),
          );
          if (alpha > 0.1) {
            x.globalAlpha = alpha;
            if (!(i % 5)) {
              let s = Math.min(1e4, (6e5 / Z ** 1.25) / 2);
              x.drawImage(
                starImgs[1 + (i % 8)].img,
                lq[0] - s / 2 / 1.05,
                lq[1] - s / 2 / 1.05,
                s,
                s,
              );
              s *= 1.333;
              x.drawImage(starImgs[0].img, lq[0] - s / 2, lq[1] - s / 2, s, s);
            } else {
              const s = Math.min(1e4, (4e5 / Z ** 1.25) / 2);
              x.drawImage(starImgs[0].img, lq[0] - s / 2, lq[1] - s / 2, s, s);
            }
          }
        }
      });
      x.globalAlpha = 1;

      terrain.forEach((v, i) => {
        x.beginPath();
        v[3] += oXv;
        v[5] += oZv;
        if (v[3] > (sp * rw) / 2) v[3] -= sp * rw;
        if (v[3] < -(sp * rw) / 2) v[3] += sp * rw;
        if (v[4] + oY > (sp * rw) / 2) v[4] -= sp * rw;
        if (v[4] + oY < -(sp * rw) / 2) v[4] += sp * rw;
        if (v[5] > (sp * rw) / 2) v[5] -= sp * rw;
        if (v[5] < -(sp * rw) / 2) v[5] += sp * rw;
        v[0].forEach((q) => {
          X = q[0] + v[3];
          Y = q[1] + v[4];
          Z = q[2] + v[5];
          Y += oY + 6;
          R(Rl, Pt, Yw, 0, 1);
          Z += oZ_;
          if (Z > 0) x.lineTo(...Q());
        });
        let col1 = v[2] === 0 ? "#ff0" : "";
        let col2 = v[2] === 2 ? `hsla(${180 + (i ** 2) % 90},25%,50%,.4)` : v[1];
        const oga =
          (1 / (1 + (1 + Math.hypot(v[3], v[5])) ** 10 / 1e14)) *
          (1 - Math.abs(v[4] + oY) / ((sp * rw) / 2));
        if (oga > 0.05) {
          stroke(col1, col2, 3, true, oga);
        }
        if (v[2] === 0) {
          for (let j = 4; j--; ) {
            x.beginPath();
            X = v[3];
            Y = v[4] - (j + 1) - 1.333;
            Z = v[5];
            Y += oY + 6;
            R(Rl, Pt, Yw, 0, 1);
            Z += oZ_;
            if (Z > 0) x.lineTo(...Q());
            X = v[3];
            Y = v[4] - j - 1.333;
            Z = v[5];
            Y += oY + 6;
            R(Rl, Pt, Yw, 0, 1);
            Z += oZ_;
            if (Z > 0) {
              x.lineTo(...Q());
              col1 = `hsla(${i * 99 + t * 15000 + j * 20},99%,66%,1)`;
              x.lineJoin = x.lineCap = "butt";
              stroke(col1, "", 4 / (1 + j), true, oga);
              if (j === 3) {
                const lq = Q();
                const s = Math.min(1e4, (3e3 / Z) * (1 + C(t * 60 + i) / 4));
                x.globalAlpha = oga;
                x.drawImage(
                  starImgs[4].img,
                  lq[0] - s / 2 / 1.05,
                  lq[1] - s / 2 / 1.02,
                  s,
                  s,
                );
              }
            }
          }
        }
      });
      x.globalAlpha = 1;

      const maxSegs = 32;
      network = network.filter((shps) => shps[1] > 0);
      network.forEach((shps, sidx) => {
        do {
          shps[0] = shps[0].filter((shp, idx) => shps[0].length < maxSegs || idx);
        } while (shps[0].length > maxSegs);

        shps[0].forEach((shp, idx) => {
          const tx = shp[0];
          const ty = shp[1];
          const tz = shp[2];
          let ax1 = 0;
          let ay1 = 0;
          let az1 = 0;
          let ct1 = 0;
          shp[3].forEach((v) => {
            let ax = 0;
            let ay = 0;
            let az = 0;
            let ct = 0;
            v.forEach((q, j) => {
              if (j > 1) {
                ax += q[0];
                ay += q[1];
                az += q[2];
                ct++;
              }
            });
            ax /= ct;
            ay /= ct;
            az /= ct;

            x.beginPath();
            v.forEach((q) => {
              X = q[0] + tx;
              Y = q[1] + ty;
              Z = q[2] + tz;
              R(Rl, Pt, Yw, 1);
              if (Z > 0) x.lineTo(...Q());
            });
            const col2 = `hsla(${(360 / network.length) * sidx + (120 / maxSegs) * idx + 150},75%,${40 + (50 / maxSegs * idx) ** 4 / 80000}%,${(0.66 / maxSegs * idx) ** 2})`;
            const oga = (2 - 2 / (1 + (1 + idx) ** 9 / 999999999)) * shps[1] ** 0.5;
            stroke("", col2, 0.5, false, oga);
            if (idx === shps[0].length - 1) {
              ax1 += X = ax + tx;
              ay1 += Y = ay + ty;
              az1 += Z = az + tz;
              ct1++;
              R(Rl, Pt, Yw, 1);
              if (Z > 0) {
                const lq = Q();
                let s = Math.min(1e4, 2e3 / Z) * shps[1] ** 0.5;
                x.globalAlpha = 1;
                x.drawImage(
                  starImgs[1 + ((7 / network.length * sidx) | 0)].img,
                  lq[0] - s / 2 / 1.05,
                  lq[1] - s / 2 / 1.05,
                  s,
                  s,
                );
                s *= 1.5;
                x.drawImage(starImgs[0].img, lq[0] - s / 2, lq[1] - s / 2, s, s);
              }
            }
          });
          X = ax1 /= ct1;
          Y = ay1 /= ct1;
          Z = az1 /= ct1;
          R(Rl, Pt, Yw, 1);
          if (Z > 0) {
            const lq = Q();
            let s = Math.min(1e4, 2e4 / Z) * shps[1] ** 0.5;
            x.globalAlpha = 0.1;
            x.drawImage(burst2, lq[0] - s / 2, lq[1] - s / 2, s, s);
            x.globalAlpha = 0.5;
            s /= 6;
            x.drawImage(burst4, lq[0] - s / 2, lq[1] - s / 2, s, s);
          }
        });
        if (sidx) shps[1] -= 0.025;
      });
      x.globalAlpha = 1;

      flashes = flashes.filter((v) => v[3] > 0);
      flashes.forEach((v) => {
        X = v[0];
        Y = v[1];
        Z = v[2];
        R(Rl, Pt, Yw, 1);
        if (Z > 0) {
          const lq = Q();
          const s = Math.min(1e4, (1e4 * v[3]) / Z);
          x.drawImage(starImgs[4].img, lq[0] - s / 2 / 1.05, lq[1] - s / 2 / 1.05, s, s);
        }
        v[3] -= 0.05;
      });

      t += 1 / 60;
    };

    renderFrame();

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", rsz);
      if (c.parentNode === stage) {
        stage.removeChild(c);
      }
    };
  }, []);

  return (
    <div className="not-comets-page" ref={stageRef}>
      <div className="not-comets-hud">
        <div className="not-comets-eyebrow">Canvas 2D</div>
        <h1 className="not-comets-title">Not Comets</h1>
        <p className="not-comets-hint">
          Auto-playing space scene · self-drawn glow sprites
        </p>
      </div>
    </div>
  );
};

export default NotComets;