import React, { useEffect, useRef } from "react";
import usePageMeta from "../../../../utils/usePageMeta";
import "./Lightbeams.css";

const Lightbeams = () => {
  usePageMeta({
    title: "Lightbeams",
    description:
      "A beam of light woven from rising particles, drawn on a transparent canvas.",
    keywords:
      "lightbeams, canvas, particle, creative coding, javascript, animation",
  });
  const stageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return undefined;

    const app = {
      particles: [],
      stepCount: 0,
      birthPeriod: 5,
      maxPop: 50,
    };

    const setup = () => {
      canvas.height = stage.clientHeight;
      canvas.width = stage.clientWidth;
      app.ctx = canvas.getContext("2d");
      app.width = canvas.width;
      app.height = canvas.height;
      app.xC = canvas.width / 2;
      app.yC = canvas.height / 2;
    };

    const kill = (particleName) => {
      app.particles = app.particles.filter(
        (seed) => seed.name !== particleName,
      );
    };

    const birth = () => {
      const particle = {
        x: app.width * Math.random(),
        y: app.height * (0.5 + 0.5 * Math.random()),
        xSpeed: 0,
        ySpeed: 0,
        name: "seed" + app.stepCount,
      };
      app.particles.push(particle);
    };

    const evolve = () => {
      app.stepCount++;
      if (app.stepCount % app.birthPeriod === 0 && app.particles.length < app.maxPop) {
        birth();
      }
      if (app.stepCount === 50) kill("seed10");
    };

    const move = () => {
      for (let i = 0; i < app.particles.length; i++) {
        const particle = app.particles[i];
        particle.y -= 4;
        if (particle.y < 0) kill(particle.name);
      }
    };

    const draw = (timestamp) => {
      app.ctx.save();
      app.ctx.globalAlpha = 0.01;
      app.ctx.fillStyle = "#444";
      app.ctx.fillRect(0, 0, app.width, app.height);
      app.ctx.restore();

      for (let i = 0; i < app.particles.length; i++) {
        const particle = app.particles[i];
        const distance = Math.sqrt(
          Math.pow(particle.x - app.xC, 2) + Math.pow(particle.y - app.yC, 2),
        );
        const rParticle = distance;
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
          const xOffset = app.width * 0.04;
          const yOffset = app.height * 0.3;
          const startX = particle.x + Math.cos(angle) * rParticle;
          const startY = particle.y + Math.sin(angle) * rParticle;

          if (
            startX < app.width / 2 + xOffset &&
            startX > app.width / 2 - xOffset &&
            startY < app.height / 2 + yOffset &&
            startY > app.height / 2 - yOffset
          ) {
            app.ctx.save();
            app.ctx.translate(app.width / 2, app.height / 2);
            app.ctx.rotate(timestamp / 5000);
            app.ctx.translate(-app.width / 2, -app.height / 2);
            app.ctx.beginPath();
            app.ctx.moveTo(startX, startY);
            app.ctx.lineTo(
              particle.x + Math.cos(angle + 0.1) * rParticle,
              particle.y + Math.sin(angle + 0.1) * rParticle,
            );
            app.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            app.ctx.stroke();
            app.ctx.restore();
          }
        }
      }
    };

    const update = (timestamp) => {
      evolve();
      move();
      draw(timestamp);
    };

    setup();

    let animationId = null;
    const frame = (timestamp) => {
      update(timestamp);
      animationId = window.requestAnimationFrame(frame);
    };
    animationId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="lightbeams-page" ref={stageRef}>
      <canvas className="lightbeams-canvas" ref={canvasRef} />
    </div>
  );
};

export default Lightbeams;