<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { FREEZE_COST, MAX_FREEZES, MAX_HEARTS, REFILL_COST, useProgressStore } from '@/store/progress';
import { useToastStore } from '@/store/toast';
import { useSound } from '@/composables/useSound';
import AppSheet from '@/components/ui/AppSheet.vue';
import GameIcon from '@/components/ui/GameIcon.vue';
import type { GameIconName } from '@/art/icons';

defineProps<{ open: boolean }>();
defineEmits<{ close: [] }>();

const progress = useProgressStore();
const toast = useToastStore();
const { play } = useSound();
const { state, hearts, heartsEnabled } = storeToRefs(progress);

const items = computed(() => [
  {
    id: 'hearts',
    icon: 'heart' as GameIconName,
    title: 'Полный запас жизней',
    text: heartsEnabled.value ? `Сейчас ${hearts.value} из ${MAX_HEARTS}` : 'Жизни отключены в настройках',
    price: REFILL_COST,
    disabled: !heartsEnabled.value || hearts.value >= MAX_HEARTS || state.value.gems < REFILL_COST,
  },
  {
    id: 'freeze',
    icon: 'freeze' as GameIconName,
    title: 'Заморозка серии',
    text: `Спасёт серию в пропущенный день · ${state.value.streak.freezes}/${MAX_FREEZES}`,
    price: FREEZE_COST,
    disabled: state.value.streak.freezes >= MAX_FREEZES || state.value.gems < FREEZE_COST,
  },
]);

const ways: Array<{ icon: GameIconName; text: string }> = [
  { icon: 'star', text: 'Новый урок — 5 кристаллов, повторение юнита — 20' },
  { icon: 'chest', text: 'Сундуки на пути — от 15 до 30' },
  { icon: 'target', text: 'Задания дня — 10–15 за каждое' },
  { icon: 'medal', text: 'Новые уровни достижений — 20 и больше' },
];

const buy = (id: string): void => {
  const ok = id === 'hearts' ? progress.refillHearts() : progress.buyFreeze();
  if (ok) {
    play('coins');
    toast.show(id === 'hearts' ? 'Жизни восстановлены!' : 'Заморозка куплена', 'reward', id === 'hearts' ? 'heart' : 'freeze');
  }
};
</script>

<template>
  <AppSheet :open="open" label="Кристаллы и магазин" @close="$emit('close')">
    <div class="hero">
      <GameIcon name="gem" :size="64" />
      <p class="hero__num nums">{{ state.gems }}</p>
      <p class="muted">кристаллов</p>
    </div>

    <h3 class="sub">Магазин</h3>
    <div class="items">
      <div v-for="item in items" :key="item.id" class="item card">
        <GameIcon :name="item.icon" :size="44" />
        <div class="grow">
          <p class="item__title">{{ item.title }}</p>
          <p class="item__text">{{ item.text }}</p>
        </div>
        <button type="button" class="btn btn--blue btn--sm" :disabled="item.disabled" @click="buy(item.id)">
          <GameIcon name="gem" :size="18" /> {{ item.price }}
        </button>
      </div>
    </div>

    <h3 class="sub">Как заработать</h3>
    <ul class="ways">
      <li v-for="w in ways" :key="w.text">
        <GameIcon :name="w.icon" :size="28" />
        <span>{{ w.text }}</span>
      </li>
    </ul>
  </AppSheet>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0 10px;
}

.hero__num {
  color: var(--blue);
  font-size: 2.6rem;
  font-weight: 900;
  line-height: 1.1;
}

.sub {
  margin: 14px 0 10px;
  font-size: 1.05rem;
}

.items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.item__title { font-weight: 900; }
.item__text { color: var(--text-muted); font-size: 0.88rem; }

.ways {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ways li {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-muted);
}
</style>
