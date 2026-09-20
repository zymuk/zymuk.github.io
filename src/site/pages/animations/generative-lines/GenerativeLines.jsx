import React, { useEffect, useRef } from "react";
import usePageMeta from "../../../../utils/usePageMeta";
import "./GenerativeLines.css";

const lerp = (a, b, t) => a + (b - a) * t;
const rand = (min, max) => min + Math.random() * (max - min);
const mapRange = (v, x1, y1, x2, y2) =>
  ((v - x1) * (y2 - x2)) / (y1 - x1) + x2;

class Line {
  constructor(obj) {
    Object.assign(this, obj);
    this.ctx = this.canvas.getContext("2d");
    this.init();
  }

  init() {
    const points = [];
    for (let i = 0; i < this.linePoints; i++) {
      const segment = this.lineLength / this.linePoints;
      if (i === 0) {
        points.push({
          x: 0,
          y: 0,
        });
      } else {
        points.push({
          x: rand(segment * (i - 1), segment * i),
          y: rand(-this.maxDistortion, this.maxDistortion),
        });
      }
    }
    this.points = points;
    this.draw();
  }

  draw() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = "screen";
    this.ctx.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);
    this.ctx.rotate(this.angle);

    this.ctx.strokeStyle = `hsla(${Math.round(
      rand(this.hue, this.hue + 50),
    )}, 70%, 70%, ${this.opacity})`;
    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    for (let i = 1; i < this.points.length - 1; i++) {
      const xc = lerp(this.points[i].x, this.points[i + 1].x, 0.5);
      const yc = lerp(this.points[i].y, this.points[i + 1].y, 0.5);
      this.ctx.lineWidth = mapRange(
        i,
        1,
        this.points.length,
        this.lineWidthMax,
        this.lineWidthMin,
      );
      this.ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
      this.ctx.stroke();
    }

    this.ctx.lineTo(
      this.points[this.points.length - 1].x,
      this.points[this.points.length - 1].y,
    );
    this.ctx.stroke();
    this.ctx.restore();
  }
}

const GenerativeLines = () => {
  usePageMeta({
    title: "Generative Lines",
    description:
      "Generative canvas artwork built from hundreds of flowing curved lines.",
    keywords:
      "generative art, canvas, creative coding, javascript, animation, data art",
  });
  const stageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return undefined;

    const createLines = () => {
      canvas.width = stage.clientWidth * 2;
      canvas.height = stage.clientHeight * 2;
      canvas.style.width = `${stage.clientWidth}px`;
      canvas.style.height = `${stage.clientHeight}px`;

      let maxLines = 300;
      let hue = rand(0, 320);
      for (let i = 0; i < maxLines; i++) {
        new Line({
          canvas: canvas,
          lineLength: rand(0, stage.clientWidth * 0.5),
          linePoints: rand(10, 20),
          maxDistortion: rand(10, 30),
          lineWidthMax: rand(0, 1),
          lineWidthMin: 0,
          angle: (i / maxLines) * (Math.PI * 2),
          opacity: rand(0.1, 1),
          hue,
        });
      }

      maxLines = 20;
      for (let i = 0; i < maxLines; i++) {
        new Line({
          canvas: canvas,
          lineLength: rand(0, stage.clientWidth),
          linePoints: rand(10, 30),
          maxDistortion: rand(10, 20),
          lineWidthMax: rand(0, 1),
          lineWidthMin: 0,
          angle: (i / maxLines) * (Math.PI * 2),
          hue: hue,
          opacity: rand(0, 0.7),
        });
      }
    };

    createLines();

    const handleResize = () => createLines();
    const handleClick = () => createLines();
    window.addEventListener("resize", handleResize);
    canvas.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="generative-lines-page" ref={stageRef}>
      <canvas className="generative-lines-canvas" ref={canvasRef} />
    </div>
  );
};

export default GenerativeLines;