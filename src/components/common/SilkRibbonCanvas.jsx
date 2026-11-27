import React, { useEffect, useRef } from "react";

export default function SilkRibbonCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use alpha: true and desynchronized for minimal latency GPU pipeline
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    let width = 0;
    let height = 0;
    let step = 0;
    let lastTime = performance.now();
    let animationFrameId;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener("resize", resize, { passive: true });
    resize();

    const drawSwoopRibbon = (config) => {
      ctx.save();
      ctx.globalAlpha = config.alpha;

      const pointsTop = [];
      const pointsBottom = [];
      const sampleCount = 60;

      for (let i = 0; i <= sampleCount; i++) {
        const t = i / sampleCount;
        const x = t * width;

        const baseSwoop =
          (1 - t) * (1 - t) * (height * config.startRatio) +
          2 * (1 - t) * t * (height * config.midRatio) +
          t * t * (height * config.endRatio);

        const wave =
          Math.sin(t * Math.PI * 2.2 + step * config.speed) * config.waveAmp +
          Math.cos(t * Math.PI * 3.4 + step * (config.speed * 0.7)) * (config.waveAmp * 0.4);

        const centerY = baseSwoop + wave;
        const ribbonThickness =
          config.thickness * (1 + 0.22 * Math.sin(t * Math.PI * 2.2 + step * config.speed));

        pointsTop.push({ x, y: centerY - ribbonThickness / 2 });
        pointsBottom.push({ x, y: centerY + ribbonThickness / 2 });
      }

      ctx.beginPath();
      ctx.moveTo(pointsTop[0].x, pointsTop[0].y);
      for (let i = 1; i < pointsTop.length; i++) {
        ctx.lineTo(pointsTop[i].x, pointsTop[i].y);
      }
      for (let i = pointsBottom.length - 1; i >= 0; i--) {
        ctx.lineTo(pointsBottom[i].x, pointsBottom[i].y);
      }
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, height * 0.2, width, height * 0.8);
      config.colors.forEach((stop) => grad.addColorStop(stop.p, stop.c));
      ctx.fillStyle = grad;
      ctx.fill();

      if (config.hasSpecular) {
        ctx.beginPath();
        ctx.moveTo(pointsTop[0].x, pointsTop[0].y + 3);
        for (let i = 1; i < pointsTop.length; i++) {
          ctx.lineTo(pointsTop[i].x, pointsTop[i].y + 3);
        }
        ctx.strokeStyle = config.specularColor || "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = config.specularWidth || 2.5;
        ctx.stroke();
      }

      ctx.restore();
    };

    // 120 FPS+ Delta-Time Normalized Render Loop
    const animate = (currentTime) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Delta-time normalization: 60 frame-equivalent units per second
      // Runs identically smooth on 60Hz, 120Hz, or 144Hz displays
      step += delta * 60;

      ctx.clearRect(0, 0, width, height);

      // Layer 1: Silver Base Ribbon
      drawSwoopRibbon({
        startRatio: 0.82,
        midRatio: 0.78,
        endRatio: 0.28,
        waveAmp: 22,
        speed: 0.011,
        thickness: 130,
        alpha: 0.65,
        colors: [
          { p: 0.0, c: "#cbd5e1" },
          { p: 0.35, c: "#e2e8f0" },
          { p: 0.7, c: "#94a3b8" },
          { p: 1.0, c: "#f1f5f9" }
        ],
        hasSpecular: false
      });

      // Layer 2: Gloss Red Silk Ribbon
      drawSwoopRibbon({
        startRatio: 0.72,
        midRatio: 0.64,
        endRatio: 0.14,
        waveAmp: 28,
        speed: 0.015,
        thickness: 105,
        alpha: 0.98,
        colors: [
          { p: 0.0, c: "#881337" },
          { p: 0.25, c: "#dc2626" },
          { p: 0.5, c: "#ef4444" },
          { p: 0.75, c: "#b91c1c" },
          { p: 1.0, c: "#991b1b" }
        ],
        hasSpecular: true,
        specularColor: "rgba(255, 255, 255, 0.65)",
        specularWidth: 3.5
      });

      // Layer 3: Satin Chrome Ribbon
      drawSwoopRibbon({
        startRatio: 0.76,
        midRatio: 0.70,
        endRatio: 0.20,
        waveAmp: 20,
        speed: 0.013,
        thickness: 60,
        alpha: 0.85,
        colors: [
          { p: 0.0, c: "#ffffff" },
          { p: 0.3, c: "#e2e8f0" },
          { p: 0.6, c: "#cbd5e1" },
          { p: 1.0, c: "#ffffff" }
        ],
        hasSpecular: true,
        specularColor: "rgba(255, 255, 255, 0.9)",
        specularWidth: 2
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{
        transform: "translate3d(0, 0, 0)",
        willChange: "transform",
        contain: "strict"
      }}
    />
  );
}