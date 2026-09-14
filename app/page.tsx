'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Music2, Pause, Play, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WORDS = ['Flores para ti', 'Eres mi sol', 'Te quiero mucho', 'Siempre contigo', 'Sonríe siempre', 'Mi lugar favorito', 'Eres luz ✦', 'Solo para ti', 'Un detalle de amor', 'Mi persona bonita', 'Contigo, todo', 'Tú haces magia', 'Para tu sonrisa', 'Mi flor favorita', 'Qué bonito coincidir', 'Te mereces lo bonito', 'Siempre tú', 'Un universo para ti', 'Mi alegría', 'Te llevo conmigo'];
function randomSeed(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

function Galaxy({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pauseRef = useRef(paused);
  useEffect(() => { pauseRef.current = paused; }, [paused]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const random = randomSeed(2109);
    let width = 1, height = 1, frame = 0, lastTime = 0, rotation = 0;
    let pointerX = 0, pointerY = 0, viewX = 0, viewY = 0;
    let dragging = false, lastX = 0, dragRotation = 0, alive = true;
    const flower = new Image(); flower.src = './sunflower.png';
    const stars = Array.from({ length: 220 }, () => ({ x: random(), y: random(), a: random(), s: random() * 1.1 + .25 }));
    const dust = Array.from({ length: 4600 }, () => {
      const radius = 115 + Math.pow(random(), .68) * 960, angle = random() * Math.PI * 2;
      return { x: Math.cos(angle) * radius, y: (random() - .5) * (25 + radius * .08), z: Math.sin(angle) * radius, size: .4 + random() * 1.3, alpha: .18 + random() * .68, color: random() > .4 ? '#ffea45' : '#fffbe0' };
    });
    const orbiters = Array.from({ length: 82 }, (_, i) => ({ radius: 220 + (i % 5) * 172 + random() * 95, angle: i * 2.399963 + random() * .24, height: 20 + random() * 70, flower: i % 3 === 0, word: WORDS[i % WORDS.length], size: i % 3 === 0 ? 52 + random() * 38 : 18 + random() * 6, yellow: i % 2 === 0 }));
    const resize = () => {
      width = canvas.clientWidth; height = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.8);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
    const project = (x: number, y: number, z: number) => {
      const a = rotation + dragRotation + viewX * .12;
      const xx = x * Math.cos(a) - z * Math.sin(a), zz = x * Math.sin(a) + z * Math.cos(a), tilt = .32 + viewY * .045;
      const distance = 1370 + zz * Math.cos(tilt) - y * Math.sin(tilt);
      const scale = Math.min(width * 1.24, height * 1.19, 1030) / Math.max(240, distance);
      return { x: width / 2 + xx * scale, y: height * .475 + (-zz * Math.sin(tilt) - y * Math.cos(tilt)) * scale, scale, depth: distance };
    };
    const draw = (time: number) => {
      if (!alive) return;
      const dt = lastTime ? Math.min((time - lastTime) / 1000, .06) : 0; lastTime = time;
      if (!pauseRef.current) rotation += dt * .047;
      viewX += (pointerX - viewX) * .035; viewY += (pointerY - viewY) * .035;
      ctx.globalAlpha = 1; ctx.fillStyle = '#030403'; ctx.fillRect(0, 0, width, height);
      const glow = ctx.createRadialGradient(width / 2, height * .47, 0, width / 2, height * .47, Math.min(width, height) * .62);
      glow.addColorStop(0, 'rgba(159,135,0,.085)'); glow.addColorStop(1, 'rgba(3,4,3,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
      for (const star of stars) { ctx.globalAlpha = star.a * .5; ctx.fillStyle = '#fff7ba'; ctx.fillRect(star.x * width, star.y * height, star.s, star.s); }
      for (const p of dust) {
        const point = project(p.x, p.y, p.z);
        if (point.x < -5 || point.x > width + 5 || point.y > height || point.y < 0) continue;
        ctx.globalAlpha = p.alpha * Math.min(1, point.scale * 1.5); ctx.fillStyle = p.color;
        const size = Math.max(.5, p.size * point.scale); ctx.fillRect(point.x, point.y, size, size);
      }
      const center = project(0, 0, 0), ringRadius = 155 * center.scale;
      ctx.globalAlpha = 1; ctx.save(); ctx.translate(center.x, center.y);
      ctx.shadowBlur = 32; ctx.shadowColor = '#f0dc00';
      ctx.beginPath(); ctx.ellipse(0, 0, ringRadius, ringRadius * .28, 0, 0, Math.PI * 2);
      ctx.lineWidth = 15 * center.scale; ctx.strokeStyle = '#ffec18'; ctx.stroke();
      ctx.shadowBlur = 12; ctx.lineWidth = 3.5 * center.scale; ctx.strokeStyle = '#ffffd0'; ctx.stroke(); ctx.shadowBlur = 0;
      const core = ctx.createRadialGradient(-ringRadius * .15, -ringRadius * .25, 0, 0, -ringRadius * .13, ringRadius * .61);
      core.addColorStop(0, '#232419'); core.addColorStop(.55, '#0b0d08'); core.addColorStop(1, '#020302');
      ctx.fillStyle = core; ctx.beginPath(); ctx.ellipse(0, -ringRadius * .15, ringRadius * .62, ringRadius * .45, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 0, ringRadius, ringRadius * .28, 0, 0, Math.PI);
      ctx.lineWidth = 11 * center.scale; ctx.strokeStyle = '#fce61c'; ctx.shadowBlur = 18; ctx.shadowColor = '#f9dd00'; ctx.stroke();
      ctx.lineWidth = 2 * center.scale; ctx.strokeStyle = '#ffffc7'; ctx.stroke(); ctx.restore();
      const visible = orbiters.map(p => ({ ...p, point: project(Math.cos(p.angle) * p.radius, p.height, Math.sin(p.angle) * p.radius) })).sort((a, b) => b.point.depth - a.point.depth);
      for (const p of visible) {
        const { point } = p;
        if (point.x < -180 || point.x > width + 180 || point.y < 0 || point.y > height + 100) continue;
        ctx.globalAlpha = Math.max(.22, Math.min(1, point.scale * 1.22));
        if (p.flower && flower.complete && flower.naturalWidth) {
          const size = p.size * point.scale * 1.8; ctx.drawImage(flower, point.x - size / 2, point.y - size * .8, size, size);
        } else if (!p.flower) {
          const size = Math.max(9, p.size * point.scale);
          ctx.font = `600 ${size}px FlowerHand, 'Segoe Print', cursive`; ctx.textAlign = 'center'; ctx.fillStyle = p.yellow ? '#fff02c' : '#fffde4';
          ctx.shadowColor = p.yellow ? '#dfb900' : '#fffacb'; ctx.shadowBlur = point.scale > .65 ? 5 : 0;
          ctx.fillText(p.word, point.x, point.y); ctx.shadowBlur = 0;
        }
      }
      ctx.globalAlpha = 1; frame = requestAnimationFrame(draw);
    };
    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect(); pointerX = (event.clientX - rect.left) / width - .5; pointerY = (event.clientY - rect.top) / height - .5;
      if (dragging) { dragRotation += (event.clientX - lastX) * .004; lastX = event.clientX; }
    };
    const down = (event: PointerEvent) => { dragging = true; lastX = event.clientX; canvas.setPointerCapture(event.pointerId); };
    const up = () => { dragging = false; }; const leave = () => { pointerX = 0; pointerY = 0; };
    const visibility = () => { cancelAnimationFrame(frame); lastTime = 0; if (!document.hidden) frame = requestAnimationFrame(draw); };
    canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', visibility); frame = requestAnimationFrame(draw);
    return () => { alive = false; cancelAnimationFrame(frame); observer.disconnect(); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('pointerleave', leave); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  // A canvas has no native image semantics; this role describes the rendered scene.
  // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
  return <canvas ref={canvasRef} className="galaxy-canvas" aria-label="Una galaxia de girasoles amarillos, estrellas y frases de cariño girando alrededor de un anillo de luz." role="img" />;
}

function useMusic() {
  const audioRef = useRef<AudioContext | null>(null), timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [playing, setPlaying] = useState(false), [error, setError] = useState('');
  const stop = () => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; void audioRef.current?.close(); audioRef.current = null; };
  useEffect(() => stop, []);
  const toggle = async () => {
    if (playing) { stop(); setPlaying(false); return; }
    try {
      const Context = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audio = new Context(); audioRef.current = audio; await audio.resume();
      const master = audio.createGain(); master.gain.value = .13; master.connect(audio.destination);
      const notes = [72, 76, 79, 83, 79, 76, 74, 79, 81, 84, 81, 76, 72, 76, 79, 86, 84, 79, 76, 74, 71, 74, 79, 74];
      let beat = 0, next = audio.currentTime + .05;
      const note = (midi: number, time: number, volume: number, length: number) => {
        const tone = audio.createOscillator(), gain = audio.createGain(); tone.type = 'sine'; tone.frequency.value = 440 * 2 ** ((midi - 69) / 12);
        gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(volume, time + .015); gain.gain.exponentialRampToValueAtTime(.001, time + length);
        tone.connect(gain); gain.connect(master); tone.start(time); tone.stop(time + length + .05);
      };
      const schedule = () => { while (next < audio.currentTime + .45) { note(notes[beat % notes.length], next, .5, 2.7); if (beat % 6 === 0) { const bass = [48, 53, 57, 55][Math.floor(beat / 6) % 4]; note(bass, next, .45, 3.8); note(bass + 7, next + .2, .18, 3.3); } beat++; next += .48; } };
      schedule(); timerRef.current = setInterval(schedule, 150); setPlaying(true); setError('');
    } catch { stop(); setError('No se pudo iniciar la música en este navegador.'); setPlaying(false); }
  };
  return { playing, toggle, error };
}

const motionQuery = '(prefers-reduced-motion: reduce)';
const subscribeMotion = (callback: () => void) => { const media = window.matchMedia(motionQuery); media.addEventListener('change', callback); return () => media.removeEventListener('change', callback); };

export default function Home() {
  const [manualPause, setPaused] = useState<boolean | null>(null);
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false);
  const paused = manualPause ?? reduced; const { playing, toggle, error } = useMusic();

  return (
    <main className="flower-world">
      <Galaxy paused={paused} />
      <footer className="gift-footer">
        <p className="love-note">Un universo de flores, solo para ti.</p>
        <div className="gift-controls">
          <Button variant="ghost" className="gift-button" onClick={toggle} aria-pressed={playing}>{playing ? <VolumeX aria-hidden="true" /> : <Music2 aria-hidden="true" />}{playing ? 'Silenciar' : 'Música'}</Button>
          <span className="control-separator" aria-hidden="true" />
          <Button variant="ghost" className="gift-button" onClick={() => setPaused(!paused)} aria-label={paused ? 'Reanudar animación' : 'Pausar animación'} aria-pressed={paused}>{paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}{paused ? 'Continuar' : 'Pausar'}</Button>
        </div>
        {error && <output className="audio-error">{error}</output>}
      </footer>
      <noscript><p className="no-script">Estas flores son para ti. Activa JavaScript para ver girar tu galaxia de girasoles. 🌻</p></noscript>
    </main>
  );
}


