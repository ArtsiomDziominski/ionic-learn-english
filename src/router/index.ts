import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import TabsPage from '@/views/TabsPage.vue';
import LearnPage from '@/views/LearnPage.vue';

/*
 * Адреса /words, /vocabulary и /article индексируются поисковиками
 * (см. scripts/prerender.mjs) — их не меняем. Урок открывается на
 * отдельном экране без вкладок: /lesson/<id урока> или
 * /lesson/practice-<режим> для тренировок.
 */
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: TabsPage,
    children: [
      { path: '', redirect: '/words' },
      { path: 'words', component: LearnPage },
      // Старый адрес урока из прежней версии
      { path: 'words/progress', redirect: '/words' },
      { path: 'practice', component: () => import('@/views/PracticePage.vue') },
      { path: 'vocabulary', component: () => import('@/views/VocabularyPage.vue') },
      { path: 'vocabulary/list', redirect: '/vocabulary' },
      { path: 'profile', component: () => import('@/views/ProfilePage.vue') },
      { path: 'article', component: () => import('@/views/Article/ArticlesPage.vue') },
      { path: 'article/:id', component: () => import('@/views/Article/ArticlePage.vue') },
    ],
  },
  {
    path: '/lesson/:id',
    component: () => import('@/views/LessonPage.vue'),
  },
  {
    path: '/settings',
    component: () => import('@/views/SettingsPage.vue'),
  },
  /* Ловим всё остальное: без этого маршрута неизвестный адрес
     внутри приложения показывал пустой экран */
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/NotFoundPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
