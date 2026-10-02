<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useIonRouter } from '@ionic/vue';
import { MAX_HEARTS, REFILL_COST, useProgressStore } from '@/store/progress';
import { useToastStore } from '@/store/toast';
import { useSound } from '@/composables/useSound';
import { formatDuration } from '@/core/dates';
import AppSheet from '@/components/ui/AppSheet.vue';
import GameIcon from '@/components/ui/GameIcon.vue';
import LexiMascot from '@/components/ui/LexiMascot.vue';

defineProps<{ open: boolean; reason?: string }>();
const emit = defineEmits<{ close: [] }>();

const progress = useProgressStore();
const toast = useToastStore();
const router = useIonRouter();
const { play } = useSound();
const { hearts, heartsEnabled, nextHeartMs, state } = storeToRefs(progress);

const full = computed(() => hearts.value >= MAX_HEARTS);

const refill = (): void => {
  if (progress.refillHearts()) {
    play('coins');
    toast.show('Жизни восстановлены!', 'reward', 'heart');
    emit('close');
  }
};

const practice = (): void => {
  emit('close');
  router.push('/practice');
};

const settings = (): void => {
  emit('close');
  router.push('/settings');
};
</script>

<template>
  <AppSheet :open="open" label="Жизни" @close="$emit('close')">
    <div class="head">
      <LexiMascot :mood="hearts === 0 && heartsEnabled ? 'sad' : 'idle'" :size="96" />
      <div>
        <h2 class="title">{{ heartsEnabled ? (hearts === 0 ? 'Жизни закончились' : 'Жизни') : 'Без ограничений' }}</h2>
        <p class="muted">{{ reason ?? 'За каждую ошибку в уроке теряется жизнь.' }}</p>
      </div>
    </div>

    <template v-if="heartsEnabled">
      <div class="hearts" :aria-label="`Жизни: ${hearts} из ${MAX_HEARTS}`">
        <GameIcon v-for="i in MAX_HEARTS" :key="i" name="heart" :size="40" :muted="i > hearts" />
      </div>
      <p class="timer">
        {{ full ? 'Полный запас — вперёд!' : `Следующая жизнь через ${formatDuration(nextHeartMs ?? 0)}` }}
      </p>

      <div class="actions">
        <button type="button" class="btn btn--block btn--blue" :disabled="full || state.gems < REFILL_COST" @click="refill">
          Пополнить
          <span class="price"><GameIcon name="gem" :size="20" /> {{ REFILL_COST }}</span>
        </button>
        <button type="button" class="btn btn--block btn--secondary" @click="practice">
          Тренировка: +1 жизнь
        </button>
      </div>
    </template>

    <template v-else>
      <p class="off">Жизни отключены в настройках — ошибки ничего не стоят. Включите их, если хотите больше азарта.</p>
      <button type="button" class="btn btn--block btn--secondary" @click="settings">Открыть настройки</button>
    </template>
  </AppSheet>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.title { font-size: 1.35rem; }

.hearts {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 8px 0;
}

.timer {
  margin-bottom: 16px;
  color: var(--text-muted);
  font-weight: 800;
  text-align: center;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: var(--r-pill);
  background: rgba(255, 255, 255, 0.22);
}

.off {
  margin: 8px 0 16px;
  color: var(--text-muted);
}
</style>
