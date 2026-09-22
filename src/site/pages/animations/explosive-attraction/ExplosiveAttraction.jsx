import React, { useEffect, useRef } from "react";
import usePageMeta from "../../../../utils/usePageMeta";
import "./ExplosiveAttraction.css";

const MAX_PARTICLES = 200;
const ATTRACTION_RADIUS = 50;
const MAX_CHANGED_FRAMES = 50;

const random = (min, max) => min + Math.random() * (max - min);

const ExplosiveAttraction = () => {
  usePageMeta({
    title: "Explosive Attraction",
    description:
      "An interactive particle explosion that scatters and attracts back toward your cursor.",
    keywords:
      "explosive attraction, particle, canvas, interactive, javascript, animation, creative coding",
  });
  const stageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let width = canvas.width;
    let height = canvas.height;
    let point = { x: width / 2, y: height / 2 };
    let hue = 0;
    const particles = [];

    const resize = () => {
      width = canvas.width = stage.clientWidth;
      height = canvas.height = stage.clientHeight;
      point = { x: width / 2, y: height / 2 };
    };

    const createParticle = () => ({
      hue,
      alpha: 0,
      size: random(1, 5),
      x: random(0, width),
      y: random(0, height),
      velocity: random(1, 5) * 0.5,
      changed: false,
      changedFrame: 0,
    });

    const reset = (particle) => Object.assign(particle, createParticle());

    const update = (particle) => {
      if (particle.changed) {
        particle.alpha *= 0.92;
        particle.size += 2;
        particle.changedFrame += 1;
        if (particle.changedFrame > MAX_CHANGED_FRAMES) reset(particle);
      } else if (
        Math.hypot(point.x - particle.x, point.y - particle.y) <
        ATTRACTION_RADIUS
      ) {
        particle.changed = true;
      } else {
        const dx = point.x - particle.x;
        const dy = point.y - particle.y;
        const angle = Math.atan2(dy, dx);
        particle.alpha += 0.01;
        particle.x += particle.velocity * Math.cos(angle);
        particle.y += particle.velocity * Math.sin(angle);
        particle.velocity += 0.02;
      }
    };

    const draw = (particle) => {
      ctx.strokeStyle = `hsla(${particle.hue}, 100%, 50%, ${particle.alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
      ctx.stroke();
      update(particle);
    };

    let animationId = null;
    const animate = () => {
      animationId = window.requestAnimationFrame(animate);
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(0, 0, width, height);
      particles.forEach(draw);
      hue += 0.3;
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      point.x = event.clientX - rect.left;
      point.y = event.clientY - rect.top;
    };
    const handleTouchMove = (event) => {
      const touch = event.touches.length ? event.touches[0] : null;
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      point.x = touch.clientX - rect.left;
      point.y = touch.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      point.x = width / 2;
      point.y = height / 2;
    };
    const handleResize = () => resize();

    resize();
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const spawnTimers = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      spawnTimers.push(
        window.setTimeout(() => particles.push(createParticle()), i * 10),
      );
    }

    animate();

    return () => {
      window.cancelAnimationFrame(animationId);
      spawnTimers.forEach((timer) => window.clearTimeout(timer));
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="explosive-attraction-page" ref={stageRef}>
      <canvas className="explosive-attraction-canvas" ref={canvasRef} />
    </div>
  );
};

export default ExplosiveAttraction;