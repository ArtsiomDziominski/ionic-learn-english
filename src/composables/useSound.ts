import { useSettingsStore } from '@/store/settings';

/**
 * Звуки интерфейса, синтезированные Web Audio — без аудиофайлов:
 * не нужно ничего грузить, и звук одинаковый в вебе и в приложении.
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

interface Tone {
  freq: number;
  at: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  slideTo?: number;
}

function play(tones: Tone[]): void {
  const ac = audio();
  if (!ac) return;
  const start = ac.currentTime + 0.01;
  for (const t of tones) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = t.type ?? 'sine';
    osc.frequency.setValueAtTime(t.freq, start + t.at);
    if (t.slideTo) osc.frequency.exponentialRampToValueAtTime(t.slideTo, start + t.at + t.dur);
    const peak = t.gain ?? 0.16;
    gain.gain.setValueAtTime(0.0001, start + t.at);
    gain.gain.exponentialRampToValueAtTime(peak, start + t.at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + t.at + t.dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(start + t.at);
    osc.stop(start + t.at + t.dur + 0.05);
  }
}

const SOUNDS = {
  correct: [
    { freq: 784, at: 0, dur: 0.12, type: 'triangle' as const },
    { freq: 1175, at: 0.09, dur: 0.22, type: 'triangle' as const },
  ],
  wrong: [
    { freq: 220, at: 0, dur: 0.16, type: 'square' as const, gain: 0.06 },
    { freq: 185, at: 0.12, dur: 0.24, type: 'square' as const, gain: 0.06 },
  ],
  tap: [{ freq: 660, at: 0, dur: 0.05, type: 'sine' as const, gain: 0.07 }],
  match: [{ freq: 988, at: 0, dur: 0.1, type: 'triangle' as const, gain: 0.12 }],
  complete: [
    { freq: 523, at: 0, dur: 0.14, type: 'triangle' as const },
    { freq: 659, at: 0.12, dur: 0.14, type: 'triangle' as const },
    { freq: 784, at: 0.24, dur: 0.14, type: 'triangle' as const },
    { freq: 1047, at: 0.36, dur: 0.4, type: 'triangle' as const, gain: 0.18 },
  ],
  streak: [
    { freq: 300, at: 0, dur: 0.5, type: 'sawtooth' as const, gain: 0.05, slideTo: 900 },
    { freq: 1200, at: 0.42, dur: 0.3, type: 'triangle' as const, gain: 0.14 },
  ],
  coins: [
    { freq: 1319, at: 0, dur: 0.08, type: 'square' as const, gain: 0.05 },
    { freq: 1760, at: 0.07, dur: 0.16, type: 'square' as const, gain: 0.05 },
  ],
} satisfies Record<string, Tone[]>;

export type SoundName = keyof typeof SOUNDS;

export function useSound() {
  const store = useSettingsStore();
  return {
    play: (name: SoundName): void => {
      if (!store.settings.sound) return;
      try {
        play(SOUNDS[name]);
      } catch {
        /* звук — не критичная часть: ошибки Web Audio игнорируем */
      }
    },
  };
}
