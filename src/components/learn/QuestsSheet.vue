<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProgressStore } from '@/store/progress';
import { useToastStore } from '@/store/toast';
import { useSound } from '@/composables/useSound';
import { hapticReward } from '@/composables/useHaptics';
import { isQuestDone, questIcon, questTitle } from '@/core/quests';
import AppSheet from '@/components/ui/AppSheet.vue';
import GameIcon from '@/components/ui/GameIcon.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';

defineProps<{ open: boolean }>();
defineEmits<{ close: [] }>();

const progress = useProgressStore();
const toast = useToastStore();
const { play } = useSound();
const { quests } = storeToRefs(progress);

const claim = (id: string): void => {
  const gems = progress.claimQuest(id);
  if (gems) {
    play('coins');
    hapticReward();
    toast.show(`+${gems} кристаллов`, 'reward', 'gem');
  }
};
</script>

<template>
  <AppSheet :open="open" label="Задания дня" @close="$emit('close')">
    <h2 class="title">Задания дня</h2>
    <p class="muted lead">Каждый день новые. Выполните — и заберите кристаллы.</p>

    <div class="list">
      <div v-for="q in quests" :key="q.id" class="quest card" :class="{ 'quest--done': q.claimed }">
        <GameIcon :name="questIcon(q)" :size="40" />
        <div class="grow">
          <p class="quest__title">{{ questTitle(q) }}</p>
          <div class="quest__bar">
            <ProgressBar :value="q.progress / q.target" :height="14" color="var(--gold)" />
            <span class="quest__count nums">{{ q.progress }}/{{ q.target }}</span>
          </div>
        </div>
        <button v-if="isQuestDone(q) && !q.claimed" type="button" class="btn btn--gold btn--sm claim" @click="claim(q.id)">
          <GameIcon name="gem" :size="18" /> {{ q.reward }}
        </button>
        <GameIcon v-else-if="q.claimed" name="check" :size="32" label="Награда получена" />
        <span v-else class="reward nums"><GameIcon name="gem" :size="18" />{{ q.reward }}</span>
      </div>
    </div>
  </AppSheet>
</template>

<style scoped>
.title { font-size: 1.35rem; }
.lead { margin: 4px 0 14px; }

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quest {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.quest--done { opacity: 0.7; }

.quest__title {
  font-weight: 800;
  line-height: 1.3;
}

.quest__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.quest__count {
  min-width: 44px;
  color: var(--text-subtle);
  font-size: 0.82rem;
  font-weight: 800;
  text-align: right;
}

.reward {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--text-subtle);
  font-weight: 900;
}

.claim {
  animation: pop 400ms var(--spring) both;
}
</style>
