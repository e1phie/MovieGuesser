import { useEffect, useRef } from 'react';

// 简单烟花粒子动画：canvas 多发随机彩色粒子
export default function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    type P = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
    };
    const parts: P[] = [];
    const colors = ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#e040fb', '#ff80ab'];

    function launch() {
      const cx = Math.random() * window.innerWidth;
      const cy = window.innerHeight * (0.2 + Math.random() * 0.3);
      const n = 40 + Math.floor(Math.random() * 30);
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n;
        const sp = 2 + Math.random() * 4;
        parts.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 60 + Math.random() * 30,
          color,
        });
      }
    }

    let raf = 0;
    let last = 0;
    function tick(t: number) {
      raf = requestAnimationFrame(tick);
      if (!ctx) return;
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      if (t - last > 600) {
        launch();
        last = t;
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // 重力
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.life--;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, p.life / 80);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fireworks" />;
}
