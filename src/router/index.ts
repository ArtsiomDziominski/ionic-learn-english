import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import SettingsPage from "@/views/SettingsPage.vue";
import VocabularyListView from "@/views/vocabulary/VocabularyListView.vue";
import BlogPage from "@/views/Article/ArticlesPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/words'
      },
      {
        path: 'words',
        component: () => import('@/views/Tab1Page.vue'),
        children: [
          {
            path: '',
            component: () => import('@/components/words/WordsSelectFlowCards.vue'),
          }
        ]
      },
      {
        path: 'words/progress',
        component: () => import('@/components/words/WordsProgress.vue'),
      },
      {
        path: 'vocabulary',
        component: () => import('@/views/vocabulary/VocabularyView.vue')
      },
      {
        path: 'vocabulary/list',
        component: VocabularyListView
      },
      {
        path: '/article',
        component: BlogPage,
      },
      {
        path: '/article/:id',
        component: () => import('@/views/Article/ArticlePage.vue')
      },
      {
        path: 'profile',
        component: () => import('@/views/ProfilePage.vue')
      },
    ]
  },
  {
    path: '/settings',
    component: SettingsPage,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
