/* Ambient neural-network particle field. Pure canvas, no dependencies.
   Density scales down on small screens; freezes to a single static frame
   under prefers-reduced-motion or when the tab is hidden. */
(() => {
  'use strict';

  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const GOLD = '232,181,77';
  const TEAL = '94,234,212';

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0, height = 0;
  let nodes = [];
  let rafId = null;
  let running = true;

  const densityFor = (w) => {
    if (w < 640) return 0.045;   // mobile: sparse, stays out of the way of content
    if (w < 1024) return 0.06;   // tablet
    return 0.075;                // desktop
  };

  const maxLinkDist = (w) => (w < 640 ? 90 : 140);

  function makeNodes() {
    const area = width * height;
    const count = Math.min(70, Math.max(16, Math.round(area * densityFor(width) / 10000)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.4 + 0.9,
      teal: Math.random() < 0.12,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeNodes();
  }

  function step(t) {
    ctx.clearRect(0, 0, width, height);
    const link = maxLinkDist(width);

    for (const n of nodes) {
      if (!reduceMotion) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = width + 20; else if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20; else if (n.y > height + 20) n.y = -20;
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < link) {
          const alpha = (1 - dist / link) * 0.16;
          ctx.strokeStyle = `rgba(${GOLD},${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      const pulse = reduceMotion ? 1 : 0.7 + 0.3 * Math.sin(t / 1400 + n.phase);
      ctx.beginPath();
      ctx.fillStyle = `rgba(${n.teal ? TEAL : GOLD},${0.55 * pulse})`;
      ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reduceMotion && running) rafId = requestAnimationFrame(step);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running && !reduceMotion && rafId === null) {
      rafId = requestAnimationFrame(step);
    } else if (!running && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  resize();
  step(0);
})();
