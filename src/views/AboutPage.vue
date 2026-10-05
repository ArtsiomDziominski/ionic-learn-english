<script setup lang="ts">
import { IonContent, IonHeader, IonPage, useIonRouter } from '@ionic/vue';
import AppFooter from '@/components/AppFooter.vue';
import PageTopBar from '@/components/PageTopBar.vue';
import LexiMascot from '@/components/ui/LexiMascot.vue';
import { useSEO } from '@/composables/useSEO';
import aboutContent from '@/content/about.json';

/* Текст лежит в src/content/about.json: из него же scripts/prerender.mjs
   собирает статический HTML для роботов, поэтому правим только там. */
interface AboutSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  items?: Array<{ title: string; text: string }>;
  questions?: Array<{ q: string; a: string }>;
}

interface AboutContent {
  path: string;
  title: string;
  description: string;
  keywords: string;
  heading: string;
  lead: string;
  sections: AboutSection[];
  actions: Array<{ href: string; text: string }>;
}

const about = aboutContent as AboutContent;
const router = useIonRouter();

useSEO({
  title: about.title,
  description: about.description,
  keywords: about.keywords,
  url: `https://www.learnenglisheasy.ru${about.path}`,
});
</script>

<template>
  <ion-page>
    <ion-header class="header">
      <PageTopBar :title="about.heading" back />
    </ion-header>

    <ion-content>
      <article class="page stack">
        <section class="hero">
          <LexiMascot mood="wave" :size="120" />
          <p class="hero__lead">{{ about.lead }}</p>
        </section>

        <section v-for="section in about.sections" :id="section.id" :key="section.id" class="card block">
          <h2 class="block__title">{{ section.heading }}</h2>
          <p v-for="text in section.paragraphs" :key="text">{{ text }}</p>

          <ul v-if="section.items" class="items">
            <li v-for="item in section.items" :key="item.title">
              <strong>{{ item.title }}.</strong> {{ item.text }}
            </li>
          </ul>

          <div v-for="item in section.questions" :key="item.q" class="qa">
            <h3 class="qa__q">{{ item.q }}</h3>
            <p>{{ item.a }}</p>
          </div>
        </section>

        <nav class="actions" aria-label="Куда дальше">
          <a
            v-for="(action, index) in about.actions"
            :key="action.href"
            :href="action.href"
            class="btn btn--block"
            :class="{ 'btn--secondary': index > 0 }"
            @click.prevent="router.push(action.href)"
          >
            {{ action.text }}
          </a>
        </nav>

        <AppFooter />
      </article>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.header {
  background: var(--bg);
  border-bottom: 2px solid var(--line);
  padding-top: env(safe-area-inset-top);
}

.hero {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero__lead {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.5;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  line-height: 1.6;
}

.block__title {
  font-size: 1.2rem;
  font-weight: 900;
}

.items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 1.2em;
}

.qa__q {
  margin-bottom: 2px;
  font-size: 1rem;
  font-weight: 800;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.actions .btn {
  text-decoration: none;
}
</style>
