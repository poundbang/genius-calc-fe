// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    // Nested routes https://router.vuejs.org/guide/essentials/nested-routes.html#nested-routes
    path: '/',
    name: 'Root',
    component: () => import('@/layouts/default/Main.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
      },
      {
        path: '/estimates',
        name: 'GeniusEstimates',
        component: () => import(/* webpackChunkName: "estimate1" */ '@/views/GeniusEstimates.vue'),
      },
    ],
  },
]

const router = createRouter({
  // history: createWebHistory(process.env.BASE_URL),
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
