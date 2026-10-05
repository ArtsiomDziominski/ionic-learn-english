<template>
  <ion-page>
    <ion-header class="header">
      <PageTopBar title="Страница не найдена" back />
    </ion-header>

    <ion-content>
      <div class="page notfound">
        <LexiMascot mood="think" :size="190" />
        <!-- Словарная статья: искомого «слова» просто нет в словаре -->
        <article class="entry card">
          <div class="entry__head">
            <h1 class="entry__word nums">404</h1>
            <span class="entry__phonetic">/ˌfɔː(r) əʊ ˈfɔː(r)/</span>
          </div>
          <p class="entry__translation">
            <span lang="en">not found</span> — <span>не найдено</span>
          </p>
          <p class="entry__note">
            Такого слова нет даже у Лекси. Возможно, ссылка устарела или в адресе опечатка.
          </p>
        </article>
        <div class="actions">
          <button type="button" class="btn btn--block btn--lg" @click="router.navigate('/', 'root', 'replace')">К урокам</button>
          <button type="button" class="btn btn--block btn--secondary" @click="router.navigate('/vocabulary', 'root', 'replace')">Открыть словарь</button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, useIonRouter } from '@ionic/vue';
import { onMounted } from 'vue';
import { useSEO } from '@/composables/useSEO';
import PageTopBar from '@/components/PageTopBar.vue';
import LexiMascot from '@/components/ui/LexiMascot.vue';

const router = useIonRouter();

onMounted(() => {
  useSEO({
    title: 'Страница не найдена | Слова.Day',
    description: 'Запрошенная страница не найдена. Вернитесь на главную или откройте словарь английских слов.',
  });
});
</script>

<style scoped>
.header {
  background: var(--bg);
  border-bottom: 2px solid var(--line);
  padding-top: env(safe-area-inset-top);
}

.notfound {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding-top: 24px;
}

.entry {
  width: 100%;
  border-bottom-width: 4px;
}

.entry__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.entry__word {
  color: var(--violet-ink);
  font-size: 2.6rem;
  font-weight: 900;
}

.entry__phonetic {
  color: var(--text-subtle);
  font-weight: 700;
}

.entry__translation {
  margin: 6px 0;
  font-size: 1.15rem;
  font-weight: 900;
}

.entry__note {
  color: var(--text-muted);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}
</style>
