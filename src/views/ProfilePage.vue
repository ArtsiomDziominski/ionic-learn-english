<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { IonContent, IonHeader, IonPage, useIonRouter } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useProgressStore } from '@/store/progress';
import { useToastStore } from '@/store/toast';
import { getSection } from '@/core/course';
import { formatDayLong } from '@/core/dates';
import type { GameIconName } from '@/art/icons';
import PageTopBar from '@/components/PageTopBar.vue';
import LexiMascot from '@/components/ui/LexiMascot.vue';
import GameIcon from '@/components/ui/GameIcon.vue';
import AppSheet from '@/components/ui/AppSheet.vue';
import WeekChart from '@/components/profile/WeekChart.vue';
import AchievementBadge from '@/components/profile/AchievementBadge.vue';
import TransferCard from '@/components/profile/TransferCard.vue';
import AppFooter from '@/components/AppFooter.vue';

const progress = useProgressStore();
const toast = useToastStore();
const router = useIonRouter();
const { state, streak, learnedCount, achievements, today, lessonsDone } = storeToRefs(progress);

const editing = ref(false);
const nameDraft = ref('');
const nameInput = ref<HTMLInputElement | null>(null);
const avatarSheet = ref(false);
const showAllAchievements = ref(false);

const section = computed(() => getSection(state.value.sectionId));

const stats = computed<Array<{ icon: GameIconName; value: number; label: string; color: string }>>(() => [
  { icon: 'flame', value: streak.value, label: 'Серия дней', color: 'var(--orange)' },
  { icon: 'bolt', value: state.value.xpTotal, label: 'Всего XP', color: 'var(--gold-ink)' },
  { icon: 'book', value: learnedCount.value, label: 'Слов изучено', color: 'var(--blue)' },
  { icon: 'trophy', value: lessonsDone.value, label: 'Уроков пройдено', color: 'var(--violet-ink)' },
  { icon: 'gem', value: state.value.gems, label: 'Кристаллов', color: 'var(--blue)' },
  { icon: 'medal', value: state.value.streak.best, label: 'Лучшая серия', color: 'var(--red-ink)' },
]);

const earned = computed(() => achievements.value.filter((a) => a.tier > 0).length);
const shownAchievements = computed(() => {
  const sorted = [...achievements.value].sort((a, b) => b.tier - a.tier || b.ratio - a.ratio);
  return showAllAchievements.value ? sorted : sorted.slice(0, 4);
});

/* ——— Имя ——————————————————————————————————————————————————— */

const startEdit = async (): Promise<void> => {
  nameDraft.value = state.value.profile.name;
  editing.value = true;
  await nextTick();
  nameInput.value?.select();
};

const saveName = (): void => {
  if (nameDraft.value.trim()) progress.setName(nameDraft.value);
  editing.value = false;
};

/* ——— Аватар ————————————————————————————————————————————————— */

/** Уменьшает фото до 256 px: data URL весит десятки КБ, а не мегабайты. */
function shrink(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const size = 256;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('canvas'));
      const side = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = src;
  });
}

const applyAvatar = async (src: string): Promise<void> => {
  try {
    progress.setAvatar(await shrink(src));
    toast.show('Фото обновлено', 'success', 'check');
  } catch {
    toast.show('Не удалось загрузить фото', 'error');
  }
};

const fromCamera = async (source: CameraSource): Promise<void> => {
  avatarSheet.value = false;
  try {
    const photo = await Camera.getPhoto({ quality: 85, allowEditing: true, resultType: CameraResultType.DataUrl, source });
    if (photo.dataUrl) await applyAvatar(photo.dataUrl);
  } catch {
    /* пользователь закрыл камеру */
  }
};

const fromFile = (): void => {
  avatarSheet.value = false;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' && void applyAvatar(reader.result);
    reader.readAsDataURL(file);
  };
  input.click();
};

const removeAvatar = (): void => {
  progress.setAvatar(null);
  avatarSheet.value = false;
};

const isNative = Capacitor.isNativePlatform();
</script>

<template>
  <ion-page>
    <ion-header class="header">
      <PageTopBar title="Профиль">
        <button type="button" class="icon-btn" aria-label="Настройки" @click="router.push('/settings')">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" fill="none" stroke="currentColor" stroke-width="2.2" /><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.4 7.4 0 0 0 7 6.5l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 2.6-1.5l2.4 1 2-3.4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /></svg>
        </button>
      </PageTopBar>
    </ion-header>

    <ion-content>
      <div class="page stack">
        <!-- Шапка профиля -->
        <section class="hero">
          <button type="button" class="avatar" aria-label="Сменить фото" @click="avatarSheet = true">
            <img v-if="state.profile.avatar" :src="state.profile.avatar" alt="" />
            <LexiMascot v-else head :size="96" :animated="false" label="Аватар" />
            <span class="avatar__edit" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" fill="currentColor" /><circle cx="12" cy="12.5" r="3.4" fill="var(--violet)" /></svg>
            </span>
          </button>

          <div class="hero__text">
            <div v-if="editing" class="name-edit">
              <label class="sr-only" for="profile-name">Имя</label>
              <input id="profile-name" ref="nameInput" v-model="nameDraft" class="field" maxlength="40" @keydown.enter="saveName" @blur="saveName" />
            </div>
            <button v-else type="button" class="name" @click="startEdit">
              {{ state.profile.name }}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" /></svg>
            </button>
            <p class="muted">С нами с {{ formatDayLong(state.profile.joinedAt) }}</p>
            <p class="level"><span>{{ section.badge }}</span> {{ section.title }}</p>
          </div>
        </section>

        <!-- Статистика -->
        <section>
          <h2 class="section-title">Статистика</h2>
          <div class="stats">
            <div v-for="s in stats" :key="s.label" class="stat card">
              <GameIcon :name="s.icon" :size="30" />
              <div>
                <p class="stat__value nums" :style="{ color: s.color }">{{ s.value }}</p>
                <p class="stat__label">{{ s.label }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="card">
          <WeekChart :xp-by-day="state.xpByDay" :goal="state.dailyGoal" :today="today" />
        </section>

        <!-- Достижения -->
        <section>
          <div class="section-head">
            <h2 class="section-title">Достижения</h2>
            <span class="muted nums">{{ earned }} из {{ achievements.length }}</span>
          </div>
          <div class="card achievements">
            <AchievementBadge v-for="a in shownAchievements" :key="a.def.id" :view="a" />
            <button type="button" class="btn btn--ghost btn--block" @click="showAllAchievements = !showAllAchievements">
              {{ showAllAchievements ? 'Свернуть' : 'Показать все' }}
            </button>
          </div>
        </section>

        <TransferCard />

        <button type="button" class="link card card--press" @click="router.push('/article')">
          <GameIcon name="book" :size="34" />
          <span class="grow">
            <span class="link__title">Статьи об изучении английского</span>
            <span class="link__text">Советы, подборки сериалов, книг и подкастов</span>
          </span>
          <svg class="link__chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>

        <AppFooter />
      </div>
    </ion-content>

    <AppSheet :open="avatarSheet" label="Фото профиля" @close="avatarSheet = false">
      <h2 class="sheet-title">Фото профиля</h2>
      <div class="sheet-actions">
        <template v-if="isNative">
          <button type="button" class="btn btn--block" @click="fromCamera(CameraSource.Camera)">Сделать фото</button>
          <button type="button" class="btn btn--block btn--secondary" @click="fromCamera(CameraSource.Photos)">Выбрать из галереи</button>
        </template>
        <button v-else type="button" class="btn btn--block" @click="fromFile">Выбрать изображение</button>
        <button v-if="state.profile.avatar" type="button" class="btn btn--block btn--ghost danger" @click="removeAvatar">Вернуть Лекси</button>
      </div>
    </AppSheet>
  </ion-page>
</template>

<style scoped>
.header {
  background: var(--bg);
  border-bottom: 2px solid var(--line);
  padding-top: env(safe-area-inset-top);
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.icon-btn svg { width: 26px; height: 26px; }
.icon-btn:hover { background: var(--surface-2); }

.hero {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 8px 0 4px;
}

.avatar {
  position: relative;
  display: grid;
  place-items: center;
  width: 108px;
  height: 108px;
  flex-shrink: 0;
  padding: 0;
  border: 4px solid var(--surface);
  border-radius: 50%;
  background: var(--violet-soft);
  box-shadow: 0 0 0 3px var(--violet);
  overflow: visible;
  cursor: pointer;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar__edit {
  position: absolute;
  right: -4px;
  bottom: -2px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 3px solid var(--surface);
  border-radius: 50%;
  background: var(--violet);
  color: #fff;
}

.avatar__edit svg { width: 20px; height: 20px; }

.hero__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.name {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 1.6rem;
  font-weight: 900;
  text-align: left;
  cursor: pointer;
}

.name svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--text-subtle);
}

.name-edit .field {
  font-size: 1.2rem;
}

.level {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  color: var(--text-muted);
  font-weight: 800;
}

.level span {
  padding: 1px 8px;
  border-radius: 8px;
  background: var(--violet);
  color: #fff;
  font-size: 0.8rem;
}

.section-title {
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
}

.stat__value {
  font-size: 1.3rem;
  font-weight: 900;
  line-height: 1.1;
}

.stat__label {
  color: var(--text-subtle);
  font-size: 0.8rem;
  font-weight: 800;
}

.achievements {
  padding: 4px 16px 10px;
}

.link {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  color: var(--text);
}

.link__title {
  display: block;
  font-weight: 900;
}

.link__text {
  display: block;
  color: var(--text-muted);
  font-size: 0.88rem;
}

.link__chev {
  width: 22px;
  height: 22px;
  color: var(--text-subtle);
}

.sheet-title {
  margin-bottom: 14px;
  font-size: 1.3rem;
}

.sheet-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.danger { --btn-fg: var(--red-ink); }
</style>
