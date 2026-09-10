<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonIcon,
  IonSearchbar,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent
} from "@ionic/vue";
import HeaderToolbarPages from "@/components/header/HeaderToolbarPages.vue";
import AppFooter from "@/components/AppFooter.vue";
import {vocabularyStore} from "@/store/vocabulary";
import {storeToRefs} from "pinia";
import {addCircleOutline, bookmark, bookmarkOutline, checkmarkCircle, searchOutline} from "ionicons/icons";
import {computed, onMounted, ref, watch} from "vue";

const storeVocabulary = vocabularyStore();
const {vocabularyList, studiedWords, isStudiedView, favoritesWords} = storeToRefs(storeVocabulary);

/** Сколько строк добавляем за один шаг подгрузки. */
const PAGE_SIZE = 60;

const query = ref('');
const visibleCount = ref(PAGE_SIZE);

onMounted(() => {
  storeVocabulary.setStudiedWords();
  storeVocabulary.setFavoritesWord();
});

const filteredList = computed((): COMMON.Word[] => {
  const q = query.value.trim().toLowerCase();
  if (!q) return vocabularyList.value;
  return vocabularyList.value.filter(
    (item) => item.word.toLowerCase().includes(q) || item.translation.toLowerCase().includes(q)
  );
});

/* Список может содержать больше тысячи слов. Рендерить их разом —
   значит получить рваный скролл, поэтому показываем порциями. */
const visibleList = computed((): COMMON.Word[] => filteredList.value.slice(0, visibleCount.value));

const hasMore = computed((): boolean => visibleCount.value < filteredList.value.length);

const wordsLabel = computed((): string => {
  const n = filteredList.value.length;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'слово';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'слова';
  return 'слов';
});

watch(query, () => {
  visibleCount.value = PAGE_SIZE;
});

const loadMore = (event: InfiniteScrollCustomEvent): void => {
  visibleCount.value += PAGE_SIZE;
  event.target.complete();
};

const checkStudiedWord = (word: COMMON.Word): boolean => {
  return isStudiedView.value || !!studiedWords.value.find((item) => item.word === word.word);
}

const checkFavorite = (word: COMMON.Word): boolean => {
  return !!favoritesWords.value.find((item) => item.word === word.word);
}

const actionStudied = (word: COMMON.Word, isStudied: boolean): void => {
  if (isStudied) storeVocabulary.deleteStudiedWords(word);
  else storeVocabulary.updateStudiedWords(word);
}

const actionFavorite = (word: COMMON.Word, isFavorite: boolean): void => {
  if (isFavorite) storeVocabulary.deleteFavoritesWord(word);
  else storeVocabulary.updateFavoritesWord(word);
}
</script>

<template>
  <ion-page>
    <ion-header>
      <HeaderToolbarPages title="Словарь"/>
      <div class="search">
        <ion-searchbar
          v-model="query"
          placeholder="Найти слово или перевод"
          :debounce="200"
          inputmode="search"
        />
      </div>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="list">
        <p class="list__meta app-nums">
          {{ filteredList.length }} {{ wordsLabel }}
        </p>

        <div v-if="!filteredList.length" class="empty">
          <ion-icon :icon="searchOutline" class="empty__icon" />
          <p class="empty__title">Ничего не нашлось</p>
          <p class="empty__hint">Попробуйте другое слово или часть перевода</p>
        </div>

        <article v-for="item in visibleList" :key="item.word" class="word app-card">
          <div class="word__text">
            <p class="word__original">{{ item.word }}</p>
            <p class="word__translation">{{ item.translation }}</p>
          </div>

          <button
            type="button"
            class="word__action"
            :class="{ 'word__action--fav': checkFavorite(item) }"
            :aria-pressed="checkFavorite(item)"
            :aria-label="checkFavorite(item) ? 'Убрать из избранного' : 'В избранное'"
            @click="actionFavorite(item, checkFavorite(item))"
          >
            <ion-icon :icon="checkFavorite(item) ? bookmark : bookmarkOutline" />
          </button>

          <button
            type="button"
            class="word__action"
            :class="{ 'word__action--done': checkStudiedWord(item) }"
            :aria-pressed="checkStudiedWord(item)"
            :aria-label="checkStudiedWord(item) ? 'Убрать из изученных' : 'Отметить изученным'"
            @click="actionStudied(item, checkStudiedWord(item))"
          >
            <ion-icon :icon="checkStudiedWord(item) ? checkmarkCircle : addCircleOutline" />
          </button>
        </article>
      </div>

      <ion-infinite-scroll :disabled="!hasMore" @ionInfinite="loadMore">
        <ion-infinite-scroll-content loading-spinner="dots" />
      </ion-infinite-scroll>

      <AppFooter/>
    </ion-content>
  </ion-page>
</template>

<style scoped lang="scss">
.search {
  padding: 0 var(--app-sp-2) var(--app-sp-2);

  ion-searchbar {
    --box-shadow: none;
    --background: var(--app-surface-2);
    --color: var(--app-text);
    --placeholder-color: var(--app-text-subtle);
    --icon-color: var(--app-text-subtle);
    --border-radius: var(--app-r-md);
    padding: 0;
  }
}

.list {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--app-sp-3) var(--app-sp-4) 0;
  display: flex;
  flex-direction: column;
  gap: var(--app-sp-2);

  &__meta {
    font-size: var(--app-fs-caption);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--app-text-subtle);
    margin: 0 0 var(--app-sp-1);
  }
}

.word {
  display: flex;
  align-items: center;
  gap: var(--app-sp-2);
  padding: var(--app-sp-3) var(--app-sp-3) var(--app-sp-3) var(--app-sp-4);

  &__text {
    flex: 1;
    min-width: 0;
  }

  &__original {
    font-size: var(--app-fs-h2);
    font-weight: 650;
    color: var(--app-text);
    margin: 0;
    overflow-wrap: anywhere;
  }

  &__translation {
    font-size: var(--app-fs-sm);
    color: var(--app-text-muted);
    margin: 2px 0 0;
    overflow-wrap: anywhere;
  }

  /* Иконки были 50px и перевешивали само слово */
  &__action {
    width: var(--app-tap);
    height: var(--app-tap);
    flex: 0 0 var(--app-tap);
    display: grid;
    place-items: center;
    border: 0;
    padding: 0;
    border-radius: var(--app-r-md);
    background: transparent;
    color: var(--app-text-subtle);
    font-size: 22px;
    cursor: pointer;
    transition: color var(--app-dur-base) var(--app-ease),
                background-color var(--app-dur-fast) var(--app-ease),
                transform var(--app-dur-base) var(--app-ease-spring);

    &:active {
      transform: scale(0.9);
    }

    &--fav {
      color: var(--app-warning-ink);
      background: var(--app-tint-warning);
    }

    &--done {
      color: var(--app-success-ink);
      background: var(--app-tint-success);
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--app-sp-2);
  padding: var(--app-sp-8) var(--app-sp-4);
  text-align: center;

  &__icon {
    font-size: 40px;
    color: var(--app-text-subtle);
  }

  &__title {
    font-size: var(--app-fs-h2);
    font-weight: 650;
    color: var(--app-text);
    margin: 0;
  }

  &__hint {
    font-size: var(--app-fs-sm);
    color: var(--app-text-muted);
    margin: 0;
  }
}
</style>
