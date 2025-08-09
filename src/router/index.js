import { createRouter, createWebHistory } from 'vue-router';

// Layouts
import MainLayout from '@/layouts/MainLayout.vue';
import EmptyLayout from '@/layouts/EmptyLayout.vue';
import AdminPage from '@/pages/Admin.vue';
import SupportView from '@/views/SupportView.vue';
import Checkout from '@/views/Checkout.vue'

const routes = [
  // Public Pages with Main Layout
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/pages/Home.vue'),
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('@/pages/Cart.vue'),
      },
      {
        path: 'checkout',
        name: 'Checkout',
        component: () => import('@/views/Checkout.vue'),
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/pages/Products.vue'),
      },
      {
        path: 'product/:id',
        name: 'ProductDetails',
        component: () => import('@/pages/ProductDetails.vue'),
        props: true,
      },
      {
        path: 'thank-you',
        name: 'ThankYou',
        component: () => import('@/pages/ThankYou.vue'),
      },
      {
        path: 'account',
        name: 'Account',
        component: () => import('@/pages/account/Account.vue'),
      },
    ],
  },

  // Auth Pages with Empty Layout (no navbar/footer)
  {
    path: '/login',
    component: EmptyLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('@/pages/Login.vue'),
      },
    ],
  },
  {
    path: '/register',
    component: EmptyLayout,
    children: [
      {
        path: '',
        name: 'Register',
        component: () => import('@/pages/Register.vue'),
      },
    ],
  },

  // Unauthorized Page (can use EmptyLayout)
  {
    path: '/unauthorized',
    component: EmptyLayout,
    children: [
      {
        path: '',
        name: 'Unauthorized',
        component: () => import('@/views/Unauthorized.vue'),
      },
    ],
  },

  // Admin Pages with Admin Layout
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
  },

  //Support Page
  {
    path: '/support',
    name: 'Support',
    component: SupportView,
    meta: {
      requiresAuth: true,
      layout: 'DarkLayout', // If you have a special layout for dark web pages
    },
  },

  // 404 catch-all route (must be last)
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
