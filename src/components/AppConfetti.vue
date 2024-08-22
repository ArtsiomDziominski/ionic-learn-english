<template>
  <div class="confetti-container">
    <div
        v-for="n in confettiCount"
        :key="n"
        class="confetti-piece"
        :style="getConfettiStyle()"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Confetti',
  setup() {
    const confettiCount = 150;
    const colors = [
      '#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd',
      '#fbcfe3', '#f8edeb', '#ffd0d0',
    ];

    const getConfettiStyle = () => {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomLeft = `${Math.random() * 100}vw`;
      const randomRotation = `rotate(${Math.random() * 360}deg)`;
      const randomDelay = `${Math.random() * 2}s`;
      const randomStartY = `${Math.random() * -20}vh`; // Начальная позиция Y за пределами видимой области

      return {
        backgroundColor: randomColor,
        left: randomLeft,
        top: randomStartY,
        transform: randomRotation,
        animationDelay: randomDelay,
      };
    };

    return {
      confettiCount,
      getConfettiStyle,
    };
  },
});
</script>

<style scoped>
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 20px;
  opacity: 0;
  border-radius: 3px;
  animation: fall 4s ease-in-out;
}

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
</style>
