import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/UI/pages/auth/LoginPage.vue';
import RegisterPage from '@/UI/pages/auth/RegisterPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
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
    },
    {
      path: '/suppliers',
      name: 'suppliers',
      component: () => import('@/UI/pages/SuppliersView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Lista de proveedores'
      }
    },
    {
      path: '/supplier-confirmation',
      name: 'supplier-confirmation',
      component: () => import('@/UI/pages/SupplierConfirmationView.vue'),
      meta: {
        title: 'Confirmación de Servicio - Plan Business'
      }
    },
    {
      path: '/reservation/:id',
      name: 'ReservationDetails',
      component: () => import('@/UI/pages/ReservationDetailsView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Detalles de Reserva'
      },
      props: true // Permite pasar el parámetro 'id' como prop
    }
  ]
});

export default router;
