'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Flower2, Music2, Pause, Play, VolumeX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Galaxy, { DEDICATIONS } from './galaxy';

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
  const [dedication, setDedication] = useState<number | null>(null);
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => false);
  const paused = manualPause ?? reduced; const { playing, toggle, error } = useMusic();
  const message = DEDICATIONS[dedication ?? 0];

  return (
    <main className="flower-world">
      <Galaxy paused={paused || dedication !== null} onSelect={setDedication} />
      <footer className="gift-footer">
        <p className="love-note">Arrastra para girar · Toca una flor</p>
        <div className="gift-controls">
          <Button variant="ghost" className="gift-button" onClick={toggle} aria-pressed={playing}>{playing ? <VolumeX aria-hidden="true" /> : <Music2 aria-hidden="true" />}{playing ? 'Silenciar' : 'Música'}</Button>
          <span className="control-separator" aria-hidden="true" />
          <Dialog open={dedication !== null} onOpenChange={open => setDedication(open ? 0 : null)}>
            <DialogTrigger render={<Button variant="ghost" className="gift-button" />}><Flower2 aria-hidden="true" />Para ti</DialogTrigger>
            <DialogContent className="dedication-card" showCloseButton={false}>
              <div className="dedication-backdrop" aria-hidden="true" />
              <DialogTitle className="sr-only">{message.title}</DialogTitle>
              <DialogDescription className="dedication-message">{message.message}</DialogDescription>
              <DialogClose className="dedication-close" render={<Button variant="ghost" size="icon" />} aria-label="Cerrar dedicatoria"><X aria-hidden="true" /></DialogClose>
            </DialogContent>
          </Dialog>
          <span className="control-separator" aria-hidden="true" />
          <Button variant="ghost" className="gift-button" onClick={() => setPaused(!paused)} aria-label={paused ? 'Reanudar animación' : 'Pausar animación'} aria-pressed={paused}>{paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}{paused ? 'Continuar' : 'Pausar'}</Button>
        </div>
        {error && <output className="audio-error">{error}</output>}
      </footer>
      <noscript><p className="no-script">Estas flores son para ti. Activa JavaScript para ver girar tu galaxia de girasoles. 🌻</p></noscript>
    </main>
  );
}


