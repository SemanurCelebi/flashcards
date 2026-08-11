import { createRouter, createWebHistory } from 'vue-router'
import DeckListView from '../views/DeckListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'decks',
      component: DeckListView,
    },
    {
      path: '/decks/:id',
      name: 'deck-detail',
      component: () => import('../views/DeckDetailView.vue'),
      props: true,
    },
    {
      path: '/decks/:id/study',
      name: 'deck-study',
      component: () => import('../views/StudyView.vue'),
      props: true,
    },
    {
      path: '/decks/:id/import',
      name: 'deck-import',
      component: () => import('../views/ImportPdfView.vue'),
      props: true,
    },
  ],
})

export default router
