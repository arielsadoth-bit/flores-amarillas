'use client';

import { useEffect, useRef } from 'react';

export const DEDICATIONS = [
  { title: 'Un detalle para ti', message: 'Gracias por llenar mis días de alegría y hacer que hasta los momentos más pequeños se sientan especiales.' },
  { title: 'Eres mi sol', message: 'Ojalá estas flores te recuerden lo mucho que iluminas mi mundo. Que nunca te falten motivos para sonreír.' },
  { title: 'Qué bonito coincidir', message: 'Entre tantas estrellas, tuve la suerte de encontrarte. Hoy te regalo este pequeño universo, con todo mi cariño.' },
  { title: 'Flores para ti', message: 'Unas flores que no se marchitan y un cariño que crece. Gracias por ser tú y por estar en mi vida.' },
];

const WORDS = ['Flores para ti', 'Eres mi sol', 'Te quiero mucho', 'Siempre contigo', 'Sonríe siempre', 'Mi lugar favorito', 'Eres pura alegría', 'Solo para ti', 'Un detalle de amor', 'Mi persona bonita', 'Contigo, todo', 'Tú haces magia', 'Para tu sonrisa', 'Mi flor favorita', 'Qué bonito coincidir', 'Te mereces lo bonito', 'Siempre tú', 'Un universo para ti', 'Mi alegría', 'Te llevo conmigo', 'Eres especial', 'Gracias por existir'];
const TAU = Math.PI * 2;
function seeded(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
type Hit = { x: number; y: number; radius: number; dedication: number };

export default function Galaxy({ paused, onSelect }: { paused: boolean; onSelect?: (index: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({ paused, onSelect });
  useEffect(() => { state.current = { paused, onSelect }; }, [paused, onSelect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const random = seeded(21092026);
    const flower = new Image(); flower.src = './sunflower.png';
    const bouquet = new Image(); bouquet.src = './yellow-bouquet.png';
    let width = 1, height = 1, frame = 0, lastTime = 0, angle = 0, elapsed = 0;
    let dragAngle = 0, dragTilt = 0, zoom = 1, viewX = 0, viewY = 0;
    let pointerX = 0, pointerY = 0, downX = 0, downY = 0, lastX = 0, lastY = 0, dragged = false;
    let alive = true, activePointer: number | null = null, hits: Hit[] = [];
    const stars = Array.from({ length: 430 }, () => ({ x: random(), y: random(), size: .4 + random() ** 4 * 2.7, alpha: .2 + random() * .75, phase: random() * TAU }));
    const dust = Array.from({ length: 7800 }, () => {
      const radius = 270 + random() ** .65 * 1080, a = random() * TAU;
      return { x: Math.cos(a) * radius, z: Math.sin(a) * radius, y: (random() - .5) * (55 + radius * .18), size: .6 + random() ** 3 * 2.4, alpha: .32 + random() * .68, white: random() > .23 };
    });
    const orbiters = Array.from({ length: 68 }, (_, i) => ({
      radius: 410 + i % 5 * 165 + random() * 95,
      angle: i * 2.399963 + random() * .18,
      y: 40 + random() * 95,
      kind: i % 4 === 0 ? 'flower' : i % 7 === 0 ? 'bouquet' : 'text',
      text: WORDS[i % WORDS.length],
      size: i % 4 === 0 || i % 7 === 0 ? 135 + random() * 55 : 32 + random() * 10,
      yellow: i % 3 === 0,
      dedication: i % DEDICATIONS.length,
    }));
    const labelCache = new Map<string, HTMLCanvasElement>();
    const label = (text: string, yellow: boolean) => {
      const key = `${text}-${yellow}`;
      if (labelCache.has(key)) return labelCache.get(key)!;
      const image = document.createElement('canvas');
      const paint = image.getContext('2d')!;
      paint.font = '400 56px GalaxyHand, FlowerHand, cursive';
      image.width = Math.ceil(paint.measureText(text).width) + 32; image.height = 94;
      paint.font = '400 56px GalaxyHand, FlowerHand, cursive'; paint.textAlign = 'center'; paint.textBaseline = 'middle';
      paint.fillStyle = yellow ? '#ffff34' : '#fffef4'; paint.shadowBlur = 9; paint.shadowColor = yellow ? '#e8d900' : '#fffa9b';
      paint.fillText(text, image.width / 2, 47); labelCache.set(key, image); return image;
    };
    void document.fonts.load('400 56px GalaxyHand').then(() => { if (alive) labelCache.clear(); });
    const resize = () => {
      width = canvas.clientWidth; height = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize();

    const draw = (time: number) => {
      if (!alive) return;
      const dt = lastTime ? Math.min((time - lastTime) / 1000, .05) : 0; lastTime = time;
      if (!state.current.paused) { angle += dt * .045; elapsed += dt; }
      viewX += (pointerX - viewX) * .04; viewY += (pointerY - viewY) * .04;
      const spin = angle + dragAngle + viewX * .06;
      const cos = Math.cos(spin), sin = Math.sin(spin);
      const tilt = .23 + dragTilt + viewY * .035;
      const focal = Math.min(width * 1.75, height * 1.38, 1550) * zoom;
      const camera = 1530;
      const project = (x: number, y: number, z: number) => {
        const xx = x * cos - z * sin, zz = x * sin + z * cos;
        const depth = camera + zz * Math.cos(tilt) - y * Math.sin(tilt);
        const scale = focal / Math.max(150, depth);
        return { x: width / 2 + xx * scale, y: height * .46 + (-zz * Math.sin(tilt) - y * Math.cos(tilt)) * scale, depth, scale };
      };
      ctx.globalAlpha = 1; ctx.fillStyle = '#020202'; ctx.fillRect(0, 0, width, height);
      for (const star of stars) {
        ctx.globalAlpha = star.alpha * (.78 + Math.sin(elapsed * .7 + star.phase) * .22);
        ctx.fillStyle = '#fffdf0'; ctx.fillRect(star.x * width, star.y * height, star.size, star.size);
      }
      const particles = dust.map(p => ({ p, at: project(p.x, p.y, p.z) }));
      const visible = orbiters.map(p => ({ p, at: project(Math.cos(p.angle) * p.radius, p.y, Math.sin(p.angle) * p.radius) })).sort((a, b) => b.at.depth - a.at.depth);
      const drawDust = (near: boolean) => {
        for (const { p, at } of particles) {
          if ((at.depth < camera) !== near || at.depth < 210 || at.x < 0 || at.x > width || at.y < 0 || at.y > height) continue;
          const size = Math.min(5.5, Math.max(.55, p.size * at.scale));
          ctx.globalAlpha = p.alpha * Math.min(1, at.scale * 1.25); ctx.fillStyle = p.white ? '#fffef1' : '#fbea55';
          ctx.fillRect(at.x, at.y, size, size);
        }
      };
      const drawOrbiters = (near: boolean) => {
        for (const { p, at } of visible) {
          if ((at.depth < camera) !== near || at.depth < 330 || at.x < -250 || at.x > width + 250 || at.y < -150 || at.y > height + 150) continue;
          ctx.globalAlpha = Math.min(1, .42 + at.scale * .7);
          if (p.kind !== 'text') {
            const asset = p.kind === 'bouquet' && bouquet.complete && bouquet.naturalWidth ? bouquet : flower;
            if (!asset.complete || !asset.naturalWidth) continue;
            const size = Math.min(240, p.size * at.scale);
            ctx.drawImage(asset, at.x - size / 2, at.y - size / 2, size, size);
            hits.push({ x: at.x, y: at.y, radius: Math.max(24, size * .44), dedication: p.dedication });
          } else {
            const image = label(p.text, p.yellow);
            const scale = Math.min(1.7, p.size * at.scale / 56);
            ctx.drawImage(image, at.x - image.width * scale / 2, at.y - image.height * scale / 2, image.width * scale, image.height * scale);
          }
        }
      };
      hits = []; drawDust(false); drawOrbiters(false);
      const r = 275 * focal / camera;
      const ellipseY = Math.max(.1, Math.sin(tilt));
      ctx.save(); ctx.globalAlpha = 1; ctx.translate(width / 2, height * .46);
      ctx.shadowColor = '#fff000'; ctx.shadowBlur = 32;
      ctx.beginPath(); ctx.ellipse(0, 0, r, r * ellipseY, 0, 0, TAU);
      ctx.strokeStyle = '#ffe900'; ctx.lineWidth = Math.max(7, r * .055); ctx.stroke();
      ctx.strokeStyle = '#ffffb4'; ctx.lineWidth = Math.max(2, r * .018); ctx.stroke();
      ctx.shadowBlur = 0;
      const core = ctx.createRadialGradient(-r * .13, -r * .28, 0, 0, -r * .16, r * .52);
      core.addColorStop(0, '#1c1b15'); core.addColorStop(.65, '#0d0c08'); core.addColorStop(1, '#020202');
      ctx.fillStyle = core; ctx.beginPath(); ctx.ellipse(0, -r * .13, r * .53, r * .43, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 0, r, r * ellipseY, 0, 0, Math.PI);
      ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 24; ctx.strokeStyle = '#fff31c'; ctx.lineWidth = Math.max(8, r * .055); ctx.stroke();
      ctx.strokeStyle = '#ffffe5'; ctx.lineWidth = Math.max(2, r * .015); ctx.stroke(); ctx.restore();
      drawDust(true); drawOrbiters(true);
      ctx.globalAlpha = 1; frame = requestAnimationFrame(draw);
    };
    const hitAt = (x: number, y: number) => [...hits].reverse().find(h => Math.hypot(x - h.x, y - h.y) < h.radius);
    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect(), x = event.clientX - rect.left, y = event.clientY - rect.top;
      pointerX = x / width - .5; pointerY = y / height - .5;
      if (event.pointerId === activePointer) {
        if (Math.hypot(event.clientX - downX, event.clientY - downY) > 7) dragged = true;
        dragAngle += (event.clientX - lastX) * .004;
        dragTilt = Math.max(-.11, Math.min(.4, dragTilt + (event.clientY - lastY) * .0008));
        lastX = event.clientX; lastY = event.clientY;
      }
      canvas.style.cursor = activePointer !== null ? 'grabbing' : hitAt(x, y) ? 'pointer' : 'grab';
    };
    const down = (event: PointerEvent) => {
      if (activePointer !== null) return;
      activePointer = event.pointerId; downX = lastX = event.clientX; downY = lastY = event.clientY; dragged = false;
      canvas.setPointerCapture(event.pointerId);
    };
    const up = (event: PointerEvent) => {
      if (event.pointerId !== activePointer) return;
      const rect = canvas.getBoundingClientRect();
      if (!dragged) { const hit = hitAt(event.clientX - rect.left, event.clientY - rect.top); if (hit) state.current.onSelect?.(hit.dedication); }
      activePointer = null; canvas.style.cursor = 'grab';
    };
    const cancel = () => { activePointer = null; canvas.style.cursor = 'grab'; };
    const leave = () => { pointerX = 0; pointerY = 0; };
    const wheel = (event: WheelEvent) => { if (event.ctrlKey) return; event.preventDefault(); zoom = Math.max(.7, Math.min(1.35, zoom - event.deltaY * .0006)); };
    const visibility = () => { cancelAnimationFrame(frame); lastTime = 0; if (!document.hidden) frame = requestAnimationFrame(draw); };
    canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', cancel); canvas.addEventListener('lostpointercapture', cancel); canvas.addEventListener('pointerleave', leave); canvas.addEventListener('wheel', wheel, { passive: false });
    document.addEventListener('visibilitychange', visibility); frame = requestAnimationFrame(draw);
    return () => {
      alive = false; cancelAnimationFrame(frame); observer.disconnect();
      canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', cancel); canvas.removeEventListener('lostpointercapture', cancel); canvas.removeEventListener('pointerleave', leave); canvas.removeEventListener('wheel', wheel);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  // Canvas is the rendered scene; the page provides a keyboard-accessible dedication button.
  // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
  return <canvas ref={canvasRef} className="galaxy-canvas" role="img" aria-label="Galaxia de estrellas, girasoles, ramos amarillos y frases de cariño. Arrastra para girar y toca una flor para abrir una dedicatoria." />;
}
