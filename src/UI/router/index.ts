import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/UI/pages/HomeView.vue';
import LoginPage from '@/UI/pages/auth/LoginPage.vue';
import DashboardView from '@/UI/pages/DashboardView.vue';
import PendingReservationsView from '@/UI/pages/PendingReservationsView.vue';
import RegisterPage from '@/UI/pages/auth/RegisterPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/UI/pages/HomeView.vue')
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/UI/pages/AboutView.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
      meta: {
        title: 'Sign In - Plan Business',
        requiresGuest: true
      }
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterPage,
      meta: {
        title: 'Create Account - Plan Business',
        requiresGuest: true
      }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/UI/pages/DashboardView.vue')
    },
    {
      path: '/pending',
      name: 'pending',
      component: () => import('@/UI/pages/PendingReservationsView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Reservaciones Pendientes'
      }
    }
  ]
});

export default router;
