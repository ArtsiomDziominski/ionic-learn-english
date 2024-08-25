import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import SettingsPage from "@/views/SettingsPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/words'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/words'
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
        path: 'tab2',
        component: () => import('@/views/Tab2Page.vue')
      },
      {
        path: 'vocabulary',
        component: () => import('@/views/vocabulary/VocabularyView.vue')
      },
      {
        path: 'vocabulary/list',
        component: () => import('@/views/vocabulary/VocabularyListView.vue')
      }
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
