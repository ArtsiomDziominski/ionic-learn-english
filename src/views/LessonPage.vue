<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, type Component } from 'vue';
import { IonContent, IonPage, onIonViewDidLeave, onIonViewWillEnter, useBackButton, useIonRouter } from '@ionic/vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useLessonStore, type CheckResult } from '@/store/lesson';
import { REFILL_COST, useProgressStore } from '@/store/progress';
import { useToastStore } from '@/store/toast';
import { useSound } from '@/composables/useSound';
import { hapticError, hapticSuccess } from '@/composables/useHaptics';
import { trackEvent } from '@/utils/analytics';
import type { ExerciseType, PracticeMode } from '@/core/lessonBuilder';
import LessonHeader from '@/components/lesson/LessonHeader.vue';
import LessonFooter from '@/components/lesson/LessonFooter.vue';
import LessonComplete from '@/components/lesson/LessonComplete.vue';
import IntroExercise from '@/components/lesson/ex/IntroExercise.vue';
import ChoiceExercise from '@/components/lesson/ex/ChoiceExercise.vue';
import MatchExercise from '@/components/lesson/ex/MatchExercise.vue';
import TilesExercise from '@/components/lesson/ex/TilesExercise.vue';
import TypeExercise from '@/components/lesson/ex/TypeExercise.vue';
import AppSheet from '@/components/ui/AppSheet.vue';
import LexiMascot from '@/components/ui/LexiMascot.vue';
import GameIcon from '@/components/ui/GameIcon.vue';

const lesson = useLessonStore();
const progress = useProgressStore();
const toast = useToastStore();
const route = useRoute();
const router = useIonRouter();
const { play } = useSound();

const { current, phase, result, ratio, combo, showCombo, rewards, isPractice } = storeToRefs(lesson);

const COMPONENTS: Record<ExerciseType, Component> = {
  intro: IntroExercise,
  choice: ChoiceExercise,
  listen: ChoiceExercise,
  match: MatchExercise,
  tiles: TilesExercise,
  type: TypeExercise,
};

const exRef = ref<{ check: () => CheckResult | null } | null>(null);
const ready = ref(false);
const quitOpen = ref(false);
const heartsOpen = ref(false);

const component = computed(() => COMPONENTS[current.value?.type ?? 'choice']);
const hearts = computed(() => (progress.heartsEnabled && !isPractice.value ? progress.hearts : null));

function start(): void {
  const id = String(route.params.id ?? '');
  const ok = id.startsWith('practice-')
    ? lesson.startPractice(id.slice('practice-'.length) as PracticeMode)
    : lesson.startPathLesson(id);
  ready.value = false;
  if (!ok) {
    toast.show('Этот урок пока недоступен', 'error');
    exit();
  }
}

function exit(): void {
  lesson.abandon(heartsOpen.value ? 'out_of_hearts' : 'quit');
  quitOpen.value = false;
  heartsOpen.value = false;
  lesson.reset();
  if (router.canGoBack()) router.back();
  else router.navigate('/words', 'back', 'replace');
}

const react = (r: CheckResult): void => {
  play(r.correct ? 'correct' : 'wrong');
  if (r.correct) void hapticSuccess();
  else void hapticError();
};

function check(): void {
  if (phase.value !== 'answering') return;
  const r = exRef.value?.check();
  if (!r) return;
  lesson.submit(r);
  react(r);
}

/** Сопоставление завершается само, без кнопки «Проверить». */
function onAutoSubmit(r: CheckResult): void {
  lesson.submit(r);
  react(r);
}

function proceed(): void {
  if (phase.value === 'wrong' && lesson.outOfHearts) {
    heartsOpen.value = true;
    trackEvent('out_of_hearts', { place: 'lesson' });
    return;
  }
  ready.value = false;
  lesson.proceed();
}

function acknowledge(): void {
  ready.value = false;
  lesson.acknowledgeIntro();
}

function askQuit(): void {
  if (phase.value === 'finished') exit();
  else quitOpen.value = true;
}

function refill(): void {
  if (progress.refillHearts()) {
    play('coins');
    heartsOpen.value = false;
    ready.value = false;
    lesson.proceed();
  }
}

/* Enter: проверить → продолжить, как в Duolingo на компьютере */
function onKey(e: KeyboardEvent): void {
  if (e.key !== 'Enter' || quitOpen.value || heartsOpen.value || phase.value === 'finished') return;
  e.preventDefault();
  if (phase.value === 'correct' || phase.value === 'wrong') proceed();
  else if (current.value?.type === 'intro') acknowledge();
  else if (ready.value) check();
}

/* Клавиатура привязана к жизни компонента, а не к входу на экран:
   так обработчик не «осиротеет», если компонент пересоздадут. */
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

onIonViewWillEnter(start);
// Ушли без «Выйти» (браузерная «назад», жест): урок остался незаконченным
onIonViewDidLeave(() => lesson.abandon('left'));

// Аппаратная «назад» на Android во время урока спрашивает подтверждение
useBackButton(50, () => askQuit());
</script>

<template>
  <ion-page class="lesson-page">
    <ion-content :scroll-y="true">
      <div class="lesson">
        <LessonHeader :ratio="ratio" :hearts="hearts" :combo="combo" :show-combo="showCombo" @close="askQuit" />

        <main class="lesson__main">
          <Transition name="ex" mode="out-in">
            <component
              :is="component"
              v-if="current"
              :key="current.key"
              ref="exRef"
              :exercise="current"
              :locked="phase !== 'answering'"
              :result="result"
              @ready="ready = $event"
              @submit="onAutoSubmit"
            />
          </Transition>
        </main>

        <LessonFooter
          class="lesson__footer"
          :phase="phase"
          :result="result"
          :can-check="ready"
          :intro="current?.type === 'intro'"
          :auto="current?.type === 'match'"
          @check="check"
          @continue="proceed"
          @intro="acknowledge"
        />
      </div>
    </ion-content>

    <LessonComplete v-if="phase === 'finished' && rewards" :rewards="rewards" :practice="isPractice" @done="exit" />

    <AppSheet :open="quitOpen" label="Выйти из урока?" @close="quitOpen = false">
      <div class="sheet-body">
        <LexiMascot mood="sad" :size="120" />
        <h2 class="sheet-title">Подождите, не уходите!</h2>
        <p class="muted">Если выйти сейчас, прогресс этого урока не сохранится.</p>
        <button type="button" class="btn btn--block btn--lg" @click="quitOpen = false">Продолжить урок</button>
        <button type="button" class="btn btn--block btn--ghost quit" @click="exit">Выйти</button>
      </div>
    </AppSheet>

    <AppSheet :open="heartsOpen" label="Жизни закончились" :dismissible="false" @close="heartsOpen = false">
      <div class="sheet-body">
        <LexiMascot mood="sad" :size="120" />
        <h2 class="sheet-title">Жизни закончились</h2>
        <p class="muted">Пополните запас, чтобы закончить урок, или вернитесь позже — жизни восстанавливаются сами.</p>
        <button type="button" class="btn btn--block btn--lg btn--blue" :disabled="progress.state.gems < REFILL_COST" @click="refill">
          Пополнить <GameIcon name="gem" :size="20" /> {{ REFILL_COST }}
        </button>
        <button type="button" class="btn btn--block btn--ghost quit" @click="exit">Выйти из урока</button>
      </div>
    </AppSheet>
  </ion-page>
</template>

<style scoped>
.lesson {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.lesson__main {
  flex: 1;
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 18px 16px 24px;
}

.lesson__footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.ex-enter-active,
.ex-leave-active {
  transition: opacity 180ms ease, transform 220ms var(--ease);
}

.ex-enter-from {
  opacity: 0;
  transform: translateX(28px);
}

.ex-leave-to {
  opacity: 0;
  transform: translateX(-28px);
}

.sheet-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.sheet-title {
  font-size: 1.4rem;
}

.quit {
  --btn-fg: var(--red-ink);
}
</style>
