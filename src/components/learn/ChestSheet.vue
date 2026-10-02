<script setup lang="ts">
import { ref, watch } from 'vue';
import AppSheet from '@/components/ui/AppSheet.vue';
import GameIcon from '@/components/ui/GameIcon.vue';
import CountUp from '@/components/ui/CountUp.vue';
import { useSound } from '@/composables/useSound';
import { hapticReward } from '@/composables/useHaptics';

const props = defineProps<{ open: boolean; amount: number }>();
defineEmits<{ close: [] }>();

const { play } = useSound();
const opened = ref(false);

/* Сундук сначала трясётся, потом распахивается — пауза делает
   награду ощутимой, как в игре. */
watch(() => props.open, (open) => {
  opened.value = false;
  if (!open) return;
  window.setTimeout(() => {
    opened.value = true;
    play('coins');
    hapticReward();
  }, 900);
});
</script>

<template>
  <AppSheet :open="open" label="Сундук" @close="$emit('close')">
    <div class="chest">
      <div class="chest__glow" :class="{ 'chest__glow--on': opened }" />
      <GameIcon :name="opened ? 'chestOpen' : 'chest'" :size="150" class="chest__icon" :class="{ 'chest__icon--shake': !opened, 'chest__icon--pop': opened }" />
    </div>
    <h2 class="title">{{ opened ? 'Сундук открыт!' : 'Открываем…' }}</h2>
    <p class="gems">
      <GameIcon name="gem" :size="36" />
      <CountUp v-if="opened" :value="amount" :duration="700" prefix="+" />
      <span v-else class="nums">+?</span>
    </p>
    <button type="button" class="btn btn--block btn--blue" :disabled="!opened" @click="$emit('close')">Забрать</button>
  </AppSheet>
</template>

<style scoped>
.chest {
  position: relative;
  display: grid;
  place-items: center;
  height: 190px;
}

.chest__glow {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 200, 0, 0.55), rgba(255, 200, 0, 0) 70%);
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 400ms ease, transform 600ms var(--spring);
}

.chest__glow--on {
  opacity: 1;
  transform: scale(1);
  animation: spin-glow 6s linear infinite;
}

.chest__icon { position: relative; }
.chest__icon--shake { animation: shake 0.45s ease-in-out infinite; }
.chest__icon--pop { animation: pop 500ms var(--spring) both; }

@keyframes spin-glow {
  to { transform: rotate(360deg); }
}

.title {
  font-size: 1.5rem;
  text-align: center;
}

.gems {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 6px 0 18px;
  color: var(--blue);
  font-size: 2rem;
  font-weight: 900;
}
</style>
