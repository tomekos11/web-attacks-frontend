import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    name: 'main-layout',
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'stored-xss',
        path: 'stored-xss',
        component: () => import('components/stored-xss/StoredXss.vue'),
      },
      {
        name: 'reflected-xss',
        path: 'reflected-xss',
        component: () => import('components/reflected-xss/ReflectedXss.vue'),
      },
      {
        name: 'dom-based-xss',
        path: 'dom-based-xss',
        component: () => import('components/dom-based-xss/DomBasedXss.vue'),
      },
      {
        name: 'blind-xss',
        path: 'blind-xss',
        component: () => import('components/blind-xss/BlindXss.vue'),
      },
      {
        name: 'classic-sql-injection',
        path: 'classic-sql-injection',
        component: () => import('components/classic-sql-injection/ClassicSqlInjection.vue'),
      },
      {
        name: 'union-based-sql-injection',
        path: 'union-based-sql-injection',
        component: () => import('components/union-based-sql-injection/UnionBasedSqlInjection.vue'),
      },
      {
        name: 'error-based-sql-injection',
        path: '/error-based-sql-injection',
        component: () => import('components/error-based-sql-injection/ErrorBasedSqlInjection.vue'),
      },
      {
        name: 'command-injection',
        path: 'command-injection',
        component: () => import('components/command-injection/CommandInjection.vue'),
      },
      {
        name: 'path-traversal',
        path: 'path-traversal',
        component: () => import('components/path-traversal/PathTraversal.vue'),
      },
      {
        name: 'security',
        path: 'security',
        component: () => import('pages/Security.vue'),
        meta: { admin: true },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') },
]

export default routes
