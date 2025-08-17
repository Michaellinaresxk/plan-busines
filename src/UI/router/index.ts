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
      component: () => import('@/UI/pages/DashboardPage.vue')
    },
    {
      path: '/pending',
      name: 'pending',
      component: () => import('@/UI/pages/PendingReservationsPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Reservaciones Pendientes'
      }
    },
    {
      path: '/suppliers',
      name: 'suppliers',
      component: () => import('@/UI/pages/SuppliersPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Lista de proveedores'
      }
    },
    {
      path: '/supplier-confirmation',
      name: 'supplier-confirmation',
      component: () => import('@/UI/pages/SupplierConfirmationPage.vue'),
      meta: {
        title: 'Confirmación de Servicio - Plan Business'
      }
    },
    {
      path: '/approved-reservation',
      name: 'approved-reservation',
      component: () => import('@/UI/pages/ApprovedReservationsPage.vue'),
      meta: {
        title: 'Reservas aprobadas'
      }
    },
    {
      path: '/rejected-reservation',
      name: 'rejected-reservation',
      component: () => import('@/UI/pages/RejectedReservationsPage.vue'),
      meta: {
        title: 'Reservas aprobadas'
      }
    },
    {
      path: '/reservation/:id',
      name: 'ReservationDetails',
      component: () => import('@/UI/pages/ReservationDetailsPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Detalles de Reserva'
      },
      props: true // Permite pasar el parámetro 'id' como prop
    },
    {
      path: '/all-reservations',
      name: 'all-reservations',
      component: () => import('@/UI/pages/AllReservationsPage.vue'),
      meta: {
        requiresAuth: true,
        title: 'Todas las reservas'
      }
    },
    {
      path: '/inventory',
      name: 'Inventory',
      component: () => import('@/UI/pages/InventoryPage.vue'),
      meta: {
        title: 'Inventario de Servicios'
      }
    }
  ]
});

export default router;
