<script setup lang="ts">
import {IonIcon, useIonRouter, onIonViewWillEnter} from '@ionic/vue';
import {bookmarkOutline, checkboxOutline, chevronForwardOutline, listOutline} from "ionicons/icons";
import {wordsStore} from "@/store/words";
import {storeToRefs} from "pinia";
import {computed, onMounted} from "vue";
import {VocabularyViews} from "@/const/vocabulary";
import {vocabularyStore} from "@/store/vocabulary";

const storeWords = wordsStore();
const {countAllWords} = storeToRefs(storeWords);
const storeVocabulary = vocabularyStore();
const {countStudiedWords, countFavoritesWords} = storeToRefs(storeVocabulary);

const ionRouter = useIonRouter();

const refresh = (): void => {
  storeVocabulary.setStudiedWords();
  storeVocabulary.setFavoritesWord();
};

onMounted(refresh);
onIonViewWillEnter(refresh);

const sections = computed(() => [
  {
    key: 'studied',
    title: 'Изучены',
    hint: 'Слова, которые вы прошли',
    icon: checkboxOutline,
    tone: 'success',
    count: countStudiedWords.value,
    view: VocabularyViews.StudiedWords
  },
  {
    key: 'favorites',
    title: 'Избранное',
    hint: 'Отмечены закладкой во время урока',
    icon: bookmarkOutline,
    tone: 'warning',
    count: countFavoritesWords.value,
    view: VocabularyViews.FavoritesWords
  },
  {
    key: 'all',
    title: 'Все слова',
    hint: 'Полный словарь приложения',
    icon: listOutline,
    tone: 'primary',
    count: countAllWords.value,
    view: VocabularyViews.AllVocabulary
  }
]);

const progressPercent = computed((): number => {
  if (!countAllWords.value) return 0;
  return Math.round((countStudiedWords.value / countAllWords.value) * 100);
});

const setVocabularyView = (view: VocabularyViews): void => {
  storeVocabulary.setVocabularyView(view);
  ionRouter.push('/vocabulary/list');
}
</script>

<template>
  <div class="vocab app-enter">
    <!-- Общий прогресс вместо декоративного баннера: та же площадь,
         но несёт данные -->
    <section class="vocab__summary app-card">
      <div class="vocab__summary-row">
        <div>
          <p class="app-caption">Освоено словаря</p>
          <p class="vocab__summary-value app-nums">{{ progressPercent }}%</p>
        </div>
        <p class="vocab__summary-count app-nums">
          {{ countStudiedWords }} / {{ countAllWords }}
        </p>
      </div>
      <div class="vocab__bar">
        <div class="vocab__bar-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </section>

    <div class="vocab__list">
      <button
        v-for="section in sections"
        :key="section.key"
        type="button"
        class="row app-card app-card-interactive"
        @click="setVocabularyView(section.view)"
      >
        <span class="row__icon" :class="`row__icon--${section.tone}`">
          <ion-icon :icon="section.icon" />
        </span>

        <span class="row__body">
          <span class="row__title">{{ section.title }}</span>
          <span class="row__hint">{{ section.hint }}</span>
        </span>

        <span class="row__count app-nums">{{ section.count }}</span>
        <ion-icon :icon="chevronForwardOutline" class="row__chevron" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vocab {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--app-sp-4) var(--app-sp-4) var(--app-sp-7);
  display: flex;
  flex-direction: column;
  gap: var(--app-sp-5);

  &__summary {
    padding: var(--app-sp-5);
    display: flex;
    flex-direction: column;
    gap: var(--app-sp-3);

    &-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--app-sp-3);
    }

    &-value {
      font-size: var(--app-fs-display);
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--app-text);
      margin: 4px 0 0;
    }

    &-count {
      font-size: var(--app-fs-sm);
      font-weight: 600;
      color: var(--app-text-muted);
      margin: 0;
    }
  }

  &__bar {
    height: 8px;
    border-radius: var(--app-r-pill);
    background: var(--app-surface-3);
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    border-radius: inherit;
    background: var(--ion-color-primary);
    transition: width var(--app-dur-slow) var(--app-ease);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--app-sp-3);
  }
}

/* Список разделов вместо крупных плиток: три пункта читаются
   за один взгляд и помещаются на экран целиком */
.row {
  display: flex;
  align-items: center;
  gap: var(--app-sp-3);
  padding: var(--app-sp-4);
  text-align: left;
  font-family: inherit;
  color: var(--app-text);
  -webkit-tap-highlight-color: transparent;

  &__icon {
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    display: grid;
    place-items: center;
    border-radius: var(--app-r-md);
    font-size: 21px;

    &--primary { background: var(--app-tint-primary); color: var(--app-accent-ink); }
    &--success { background: var(--app-tint-success); color: var(--app-success-ink); }
    &--warning { background: var(--app-tint-warning); color: var(--app-warning-ink); }
  }

  &__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__title {
    font-size: var(--app-fs-body);
    font-weight: 650;
  }

  &__hint {
    font-size: var(--app-fs-sm);
    color: var(--app-text-muted);
    line-height: 1.35;
  }

  &__count {
    font-size: var(--app-fs-h2);
    font-weight: 700;
    color: var(--app-text);
  }

  &__chevron {
    font-size: 17px;
    color: var(--app-text-subtle);
    flex: 0 0 auto;
  }
}
</style>
