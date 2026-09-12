<template>
  <ion-page>
    <ion-header>
      <HeaderToolbarPages title="Страница не найдена"/>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="notfound">
        <!-- Словарная статья: приём подсказывает, что искомого
             слова просто нет в словаре -->
        <article class="entry app-card">
          <div class="entry__head">
            <h1 class="entry__word app-nums">404</h1>
            <span class="entry__phonetic">/ˌfɔː(r) əʊ ˈfɔː(r)/</span>
          </div>
          <span class="entry__pos">noun</span>

          <div class="entry__rule"></div>

          <p class="entry__translation">
            <span class="entry__en">not found</span>
            <span class="entry__sep">—</span>
            <span class="entry__ru">не найдено</span>
          </p>
          <p class="entry__note">
            Такого слова нет в нашем словаре. Возможно, ссылка устарела
            или в адресе опечатка.
          </p>

          <div class="entry__actions">
            <ion-button expand="block" class="app-btn-primary" @click="goHome">
              На главную
            </ion-button>
            <ion-button expand="block" fill="clear" class="entry__quiet" @click="goVocabulary">
              Открыть словарь
            </ion-button>
          </div>
        </article>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonHeader, IonPage, useIonRouter } from '@ionic/vue';
import { onMounted } from 'vue';
import HeaderToolbarPages from '@/components/header/HeaderToolbarPages.vue';
import { useSEO } from '@/composables/useSEO';

const ionRouter = useIonRouter();

onMounted(() => {
  useSEO({
    title: 'Страница не найдена | Слова.Day',
    description: 'Запрошенная страница не найдена. Вернитесь на главную или откройте словарь английских слов.',
  });
});

const goHome = (): void => {
  ionRouter.push('/words');
};

const goVocabulary = (): void => {
  ionRouter.push('/vocabulary');
};
</script>

<style scoped lang="scss">
.notfound {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--app-sp-4);
  box-sizing: border-box;
}

.entry {
  width: 100%;
  max-width: 440px;
  padding: var(--app-sp-6);

  &__head {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: var(--app-sp-2);
  }

  &__word {
    font-size: 2.75rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1;
    color: var(--app-text);
    margin: 0;
  }

  &__phonetic {
    font-size: var(--app-fs-body);
    color: var(--app-text-subtle);
  }

  &__pos {
    display: inline-block;
    margin-top: var(--app-sp-3);
    padding: 3px 9px;
    border-radius: var(--app-r-xs);
    background: var(--app-tint-primary);
    color: var(--app-accent-ink);
    font-size: var(--app-fs-caption);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__rule {
    height: 1px;
    margin: var(--app-sp-5) 0;
    background: var(--app-border);
  }

  &__translation {
    font-size: var(--app-fs-h2);
    font-weight: 650;
    margin: 0;
  }

  &__en { color: var(--app-text); }

  &__sep {
    color: var(--app-text-subtle);
    margin: 0 var(--app-sp-2);
    font-weight: 400;
  }

  &__ru { color: var(--app-text-muted); }

  &__note {
    font-size: var(--app-fs-body);
    color: var(--app-text-muted);
    margin: var(--app-sp-3) 0 0;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: var(--app-sp-1);
    margin-top: var(--app-sp-6);
  }

  &__quiet {
    --color: var(--app-text-muted);
  }
}
</style>
