import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    name: 'main-layout',
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'stored-xss',
        path: '/stored-xss',
        component: () => import('components/stored-xss/StoredXss.vue'),
      },
      {
        name: 'reflected-xss',
        path: '/reflected-xss',
        component: () => import('components/reflected-xss/ReflectedXss.vue'),
      },
      {
        name: 'dom-based-xss',
        path: '/dom-based-xss',
        component: () => import('components/dom-based-xss/DomBasedXss.vue'),
      },
      {
        name: 'blind-xss',
        path: '/blind-xss',
        component: () => import('components/blind-xss/BlindXss.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
