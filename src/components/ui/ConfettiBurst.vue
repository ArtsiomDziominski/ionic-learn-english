<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * Конфетти на canvas: одна «хлопушка» с двух сторон экрана.
 * Canvas, а не сотни DOM-узлов, — не дёргает раскладку и
 * укладывается в кадр даже на слабом телефоне.
 */

const props = withDefaults(defineProps<{ count?: number; duration?: number }>(), {
  count: 140,
  duration: 2600,
});

const canvas = ref<HTMLCanvasElement | null>(null);
let frame = 0;

const COLORS = ['#7C5CFF', '#58CC02', '#FFC800', '#FF4B4B', '#1CB0F6', '#FF6FB5', '#FF9600'];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  shape: 'rect' | 'circle';
}

onMounted(() => {
  const el = canvas.value;
  if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = el.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth;
  const H = window.innerHeight;
  el.width = W * dpr;
  el.height = H * dpr;
  ctx.scale(dpr, dpr);

  const pieces: Piece[] = Array.from({ length: props.count }, (_, i) => {
    const fromLeft = i % 2 === 0;
    const angle = (fromLeft ? -60 : -120) * (Math.PI / 180) + (Math.random() - 0.5) * 0.9;
    const speed = 9 + Math.random() * 9;
    return {
      x: fromLeft ? -10 : W + 10,
      y: H * (0.55 + Math.random() * 0.2),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 7 + Math.random() * 6,
      h: 10 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[i % COLORS.length],
      shape: Math.random() < 0.25 ? 'circle' : 'rect',
    };
  });

  const start = performance.now();
  const draw = (t: number): void => {
    const elapsed = t - start;
    ctx.clearRect(0, 0, W, H);
    const fade = Math.max(0, 1 - Math.max(0, elapsed - props.duration * 0.7) / (props.duration * 0.3));
    for (const p of pieces) {
      p.vy += 0.32;
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // «Переворот» бумажки — ширина пульсирует
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w * Math.abs(Math.cos(p.rot * 2)), p.h);
      }
      ctx.restore();
    }
    if (elapsed < props.duration) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, W, H);
  };
  frame = requestAnimationFrame(draw);
});

onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<template>
  <canvas ref="canvas" class="confetti" aria-hidden="true" />
</template>

<style scoped>
.confetti {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 2500;
}
</style>
