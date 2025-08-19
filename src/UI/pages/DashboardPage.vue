<template>
  <v-layout class="dashboard-layout">
    <!-- Sidebar -->
    <DashboardSidebar v-model:drawer="drawer" v-model:rail="rail" :mdAndUp="mdAndUp" :pendingCount="stats.pending"
      :approvedCount="stats.approved" :suppliersCount="12" />

    <!-- Header -->
    <DashboardHeader :mdAndUp="mdAndUp" v-model:drawer="drawer" v-model:rail="rail" @toggle-theme="toggleTheme" />

    <!-- Main Content -->
    <v-main class="main-content">
      <div class="dashboard-background"></div>

      <v-container fluid class="py-6 px-4 position-relative">

        <!-- 🎯 HERO SECTION -->
        <div class="hero-section mb-8">
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">
                <span class="hero-greeting">¡Bienvenido!</span>
                <span class="hero-main">Dashboard de Control</span>
              </h1>
              <p class="hero-subtitle">
                Gestiona tu negocio con inteligencia. Supervisa reservas, métricas y toma decisiones informadas.
              </p>
            </div>

            <div class="hero-stats">
              <div class="quick-stat">
                <div class="quick-stat-number">{{ formatCurrency(todayStats.revenueToday) }}</div>
                <div class="quick-stat-label">Ingresos Hoy</div>
              </div>
              <div class="quick-stat">
                <div class="quick-stat-number">{{ monthStats.conversionRate }}%</div>
                <div class="quick-stat-label">Conversión</div>
              </div>
            </div>
          </div>

          <!-- Floating Action Button -->
          <v-btn
            class="hero-fab"
            color="primary"
            size="large"
            elevation="8"
            @click="openQuickActions">
            <v-icon size="24">mdi-plus</v-icon>
          </v-btn>
        </div>

        <!-- 📊 MODERN METRICS GRID -->
        <div class="metrics-grid mb-8">
          <!-- Metric Card 1 - Pendientes -->
          <div class="metric-card pending-card" @click="goToPending">
            <div class="metric-card-bg"></div>
            <div class="metric-card-content">
              <div class="metric-header">
                <div class="metric-icon-wrapper pending-icon">
                  <v-icon icon="mdi-clock-fast" size="24"></v-icon>
                </div>
                <div class="metric-trend">
                  <v-chip color="warning" size="x-small" variant="elevated">
                    <v-icon icon="mdi-trending-up" size="12" class="mr-1"></v-icon>
                    +{{ getRandomTrend() }}%
                  </v-chip>
                </div>
              </div>

              <div class="metric-value">{{ stats.pending }}</div>
              <div class="metric-label">Reservas Pendientes</div>

              <div class="metric-footer">
                <span class="metric-detail">{{ urgentPending }} requieren atención</span>
                <v-icon icon="mdi-arrow-top-right" size="16" class="metric-arrow"></v-icon>
              </div>
            </div>
          </div>

          <!-- Metric Card 2 - Aprobadas -->
          <div class="metric-card approved-card" @click="goToApproved">
            <div class="metric-card-bg approved-bg"></div>
            <div class="metric-card-content">
              <div class="metric-header">
                <div class="metric-icon-wrapper approved-icon">
                  <v-icon icon="mdi-check-circle" size="24"></v-icon>
                </div>
                <div class="metric-trend">
                  <v-chip color="success" size="x-small" variant="elevated">
                    <v-icon icon="mdi-trending-up" size="12" class="mr-1"></v-icon>
                    +{{ getRandomTrend() }}%
                  </v-chip>
                </div>
              </div>

              <div class="metric-value">{{ todayStats.approvedToday }}</div>
              <div class="metric-label">Aprobadas Hoy</div>

              <div class="metric-footer">
                <span class="metric-detail">{{ stats.approved }} total este mes</span>
                <v-icon icon="mdi-arrow-top-right" size="16" class="metric-arrow"></v-icon>
              </div>
            </div>
          </div>

          <!-- Metric Card 3 - Ingresos -->
          <div class="metric-card revenue-card">
            <div class="metric-card-bg revenue-bg"></div>
            <div class="metric-card-content">
              <div class="metric-header">
                <div class="metric-icon-wrapper revenue-icon">
                  <v-icon icon="mdi-currency-eur" size="24"></v-icon>
                </div>
                <div class="metric-trend">
                  <v-chip color="info" size="x-small" variant="elevated">
                    <v-icon icon="mdi-trending-up" size="12" class="mr-1"></v-icon>
                    +{{ getRandomTrend() }}%
                  </v-chip>
                </div>
              </div>

              <div class="metric-value">{{ formatCurrency(todayStats.revenueToday) }}</div>
              <div class="metric-label">Ingresos Hoy</div>

              <div class="metric-footer">
                <span class="metric-detail">Meta: {{ formatCurrency(500) }}</span>
                <div class="metric-progress">
                  <v-progress-linear
                    :model-value="(todayStats.revenueToday / 500) * 100"
                    color="info"
                    height="3"
                    rounded>
                  </v-progress-linear>
                </div>
              </div>
            </div>
          </div>

          <!-- Metric Card 4 - Performance -->
          <div class="metric-card performance-card">
            <div class="metric-card-bg performance-bg"></div>
            <div class="metric-card-content">
              <div class="metric-header">
                <div class="metric-icon-wrapper performance-icon">
                  <v-icon icon="mdi-chart-line" size="24"></v-icon>
                </div>
                <div class="metric-trend">
                  <v-chip color="primary" size="x-small" variant="elevated">
                    <v-icon icon="mdi-trending-up" size="12" class="mr-1"></v-icon>
                    +{{ getRandomTrend() }}%
                  </v-chip>
                </div>
              </div>

              <div class="metric-value">{{ monthStats.conversionRate }}%</div>
              <div class="metric-label">Tasa Conversión</div>

              <div class="metric-footer">
                <span class="metric-detail">{{ monthStats.totalReservations }} reservas</span>
                <div class="metric-progress">
                  <v-progress-linear
                    :model-value="monthStats.conversionRate"
                    color="primary"
                    height="3"
                    rounded>
                  </v-progress-linear>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 🚨 URGENT ALERTS SECTION -->
        <div v-if="urgentItems.length > 0" class="urgent-section mb-8">
          <div class="urgent-container">
            <div class="urgent-header">
              <div class="urgent-title">
                <v-icon icon="mdi-alert-rhombus" class="urgent-icon"></v-icon>
                <h2>Atención Inmediata</h2>
                <v-chip color="error" size="small" class="urgent-badge">
                  {{ urgentItems.length }}
                </v-chip>
              </div>
              <v-btn variant="text" size="small" @click="showAllUrgent = !showAllUrgent">
                {{ showAllUrgent ? 'Mostrar menos' : 'Ver todos' }}
                <v-icon :icon="showAllUrgent ? 'mdi-chevron-up' : 'mdi-chevron-down'" class="ml-1"></v-icon>
              </v-btn>
            </div>

            <div class="urgent-grid">
              <div
                v-for="(item, index) in (showAllUrgent ? urgentItems : urgentItems.slice(0, 3))"
                :key="item.id"
                class="urgent-item"
                :style="{ animationDelay: `${index * 100}ms` }"
                @click="handleUrgentAction(item)">

                <div class="urgent-item-indicator" :class="item.severity"></div>

                <div class="urgent-item-content">
                  <div class="urgent-item-header">
                    <v-avatar :color="getUrgentColor(item.severity)" size="32" class="urgent-avatar">
                      <v-icon :icon="getUrgentIcon(item.type)" size="16"></v-icon>
                    </v-avatar>
                    <div class="urgent-item-meta">
                      <span class="urgent-type">{{ item.type.replace('_', ' ').toUpperCase() }}</span>
                      <span class="urgent-time">{{ getUrgentTime() }}</span>
                    </div>
                  </div>

                  <p class="urgent-message">{{ item.message }}</p>

                  <div class="urgent-actions">
                    <v-btn
                      size="small"
                      color="primary"
                      variant="elevated"
                      class="urgent-btn">
                      Resolver
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 📱 MODERN CONTENT GRID -->
        <v-row class="content-grid">
          <!-- 📋 Activity Feed -->
          <v-col cols="12" lg="8">
            <div class="glass-card activity-card">
              <div class="card-header">
                <div class="card-title">
                  <div class="card-icon-wrapper activity-icon">
                    <v-icon icon="mdi-pulse" size="20"></v-icon>
                  </div>
                  <div>
                    <h3>Actividad en Tiempo Real</h3>
                    <p>Últimos movimientos en tu negocio</p>
                  </div>
                </div>

                <div class="card-actions">
                  <v-btn variant="text" size="small" @click="refreshData" :loading="loading">
                    <v-icon icon="mdi-refresh" size="16"></v-icon>
                  </v-btn>
                  <v-btn variant="text" size="small" @click="goToAllReservations">
                    Ver todas
                    <v-icon icon="mdi-arrow-right" size="16" class="ml-1"></v-icon>
                  </v-btn>
                </div>
              </div>

              <div class="card-content">
                <div v-if="loading" class="loading-state">
                  <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
                  <p>Cargando actividad...</p>
                </div>

                <div v-else-if="recentActivities.length === 0" class="empty-state">
                  <v-icon icon="mdi-calendar-blank" size="48" class="empty-icon"></v-icon>
                  <h4>Sin actividad reciente</h4>
                  <p>Las nuevas reservas aparecerán aquí</p>
                </div>

                <div v-else class="activity-list">
                  <div
                    v-for="(activity, index) in recentActivities.slice(0, 6)"
                    :key="activity.bookingId"
                    class="activity-item"
                    :style="{ animationDelay: `${index * 50}ms` }"
                    @click="openReservationDetails(activity)">

                    <div class="activity-avatar">
                      <v-avatar :color="getStatusColor(activity.status)" size="36">
                        <v-icon :icon="getStatusIcon(activity.status)" size="18"></v-icon>
                      </v-avatar>
                      <div class="activity-pulse" :class="activity.status"></div>
                    </div>

                    <div class="activity-content">
                      <div class="activity-main">
                        <h4 class="activity-client">{{ activity.clientName }}</h4>
                        <p class="activity-service">{{ activity.serviceName }}</p>
                      </div>

                      <div class="activity-meta">
                        <span class="activity-price">{{ formatCurrency(activity.totalPrice) }}</span>
                        <v-chip
                          :color="getStatusColor(activity.status)"
                          size="x-small"
                          class="activity-status">
                          {{ getStatusText(activity.status) }}
                        </v-chip>
                      </div>
                    </div>

                    <div class="activity-time">
                      <span>{{ activity.timeAgo }}</span>
                      <v-icon icon="mdi-chevron-right" size="16" class="activity-arrow"></v-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>

          <!-- 📊 Analytics Panel -->
          <v-col cols="12" lg="4">
            <!-- Performance Widget -->


            <!-- Quick Actions Widget -->
            <div class="glass-card quick-actions-widget">
              <div class="card-header">
                <div class="card-title">
                  <div class="card-icon-wrapper actions-icon">
                    <v-icon icon="mdi-lightning-bolt" size="20"></v-icon>
                  </div>
                  <div>
                    <h3>Acciones Rápidas</h3>
                    <p>Herramientas esenciales</p>
                  </div>
                </div>
              </div>

              <div class="card-content">
                <div class="quick-actions-grid">
                  <button class="quick-action-btn pending-action" @click="goToPending">
                    <div class="action-icon">
                      <v-icon icon="mdi-clock-alert" size="20"></v-icon>
                    </div>
                    <div class="action-content">
                      <span class="action-title">Pendientes</span>
                      <span class="action-count">{{ stats.pending }}</span>
                    </div>
                  </button>

                  <button class="quick-action-btn payment-action" @click="goToApproved">
                    <div class="action-icon">
                      <v-icon icon="mdi-credit-card" size="20"></v-icon>
                    </div>
                    <div class="action-content">
                      <span class="action-title">Pagos</span>
                      <span class="action-count">{{ stats.approved }}</span>
                    </div>
                  </button>

                  <button class="quick-action-btn suppliers-action" @click="goToSuppliers">
                    <div class="action-icon">
                      <v-icon icon="mdi-account-hard-hat" size="20"></v-icon>
                    </div>
                    <div class="action-content">
                      <span class="action-title">Proveedores</span>
                      <span class="action-count">12</span>
                    </div>
                  </button>

                  <button class="quick-action-btn analytics-action" @click="goToStats">
                    <div class="action-icon">
                      <v-icon icon="mdi-chart-bar" size="20"></v-icon>
                    </div>
                    <div class="action-content">
                      <span class="action-title">Inventario</span>
                      <span class="action-count">Ver</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>

      <!-- Quick Actions Modal -->
      <v-dialog v-model="showQuickActionsModal" max-width="400">
        <v-card class="quick-actions-modal" rounded="xl">
          <v-card-title class="text-h5 pa-6">
            <v-icon icon="mdi-plus-circle" class="mr-3" color="primary"></v-icon>
            Acciones Rápidas
          </v-card-title>

          <v-card-text class="pa-6 pt-0">
            <div class="modal-actions">
              <v-btn block color="primary" variant="tonal" class="mb-3" @click="createNewReservation">
                <v-icon icon="mdi-plus" class="mr-2"></v-icon>
                Nueva Reserva
              </v-btn>
              <v-btn block color="success" variant="tonal" class="mb-3" @click="goToPending">
                <v-icon icon="mdi-clock-fast" class="mr-2"></v-icon>
                Revisar Pendientes
              </v-btn>
              <v-btn block color="info" variant="tonal" @click="goToSuppliers">
                <v-icon icon="mdi-account-plus" class="mr-2"></v-icon>
                Agregar Proveedor
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-main>

    <!-- Modals y Notificaciones -->
    <ReservationDetailModal
      v-if="selectedReservation"
      :show="showDetailModal"
      :reservation="selectedReservation"
      @close="closeReservationDetails"
      @approve="handleApproveFromModal"
      @reject="handleRejectFromModal" />

    <v-snackbar v-model="showSnackbar" :color="snackbarColor" location="bottom end" rounded="pill" timeout="4000">
      <div class="d-flex align-center">
        <v-icon :icon="snackbarIcon" class="mr-2" size="small" />
        {{ snackbarText }}
      </div>
      <template v-slot:actions>
        <v-btn icon="mdi-close" variant="text" @click="showSnackbar = false" />
      </template>
    </v-snackbar>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useDisplay } from 'vuetify';
import { useRouter } from 'vue-router';
import DashboardSidebar from '@/UI/components/dashboard/DashboardSidebar.vue';
import DashboardHeader from '@/UI/components/dashboard/DashboardHeader.vue';
import ReservationDetailModal from '@/UI/components/modals/ReservationDetailModal.vue';
import { reservationServiceKey } from '@/services/ReservationService';

// Dependencies
const { mdAndUp } = useDisplay();
const router = useRouter();
const reservationService = inject(reservationServiceKey);

if (!reservationService) {
  throw new Error('ReservationService not provided');
}

// Layout state
const drawer = ref(true);
const rail = ref(false);

// UI state
const showAllUrgent = ref(false);
const showQuickActionsModal = ref(false);

// Data state
const loading = ref(false);
const allReservations = ref([]);
const stats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  completed: 0,
  cancelled: 0
});

const todayStats = ref({
  newReservations: 0,
  approvedToday: 0,
  revenueToday: 0,
  pendingOlderThan2Hours: 0
});

const monthStats = ref({
  totalReservations: 0,
  totalRevenue: 0,
  conversionRate: 0,
  avgResponseTime: '0h'
});

const urgentItems = ref([]);
const recentActivities = ref([]);

// Modal state
const showDetailModal = ref(false);
const selectedReservation = ref(null);

// Notifications
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarIcon = ref('mdi-check-circle');

// Computed
const urgentPending = computed(() => {
  return urgentItems.value.filter(item => item.severity === 'high').length;
});

// Utility methods
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const getRandomTrend = (): number => {
  return Math.floor(Math.random() * 15) + 1;
};

const getUrgentTime = (): string => {
  const times = ['hace 2h', 'hace 4h', 'hace 1h', 'hace 30min'];
  return times[Math.floor(Math.random() * times.length)];
};

const getStatusColor = (status: string): string => {
  const colors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    completed: 'info',
    cancelled: 'grey'
  };
  return colors[status] || 'grey';
};

const getStatusIcon = (status: string): string => {
  const icons = {
    pending: 'mdi-clock',
    approved: 'mdi-check',
    rejected: 'mdi-close',
    completed: 'mdi-check-all',
    cancelled: 'mdi-cancel'
  };
  return icons[status] || 'mdi-help';
};

const getStatusText = (status: string): string => {
  const texts = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    completed: 'Completada',
    cancelled: 'Cancelada'
  };
  return texts[status] || status;
};

const getUrgentColor = (severity: string): string => {
  const colors = {
    high: 'error',
    medium: 'warning',
    low: 'info'
  };
  return colors[severity] || 'grey';
};

const getUrgentIcon = (type: string): string => {
  const icons = {
    old_pending: 'mdi-clock-alert',
    priority: 'mdi-priority-high',
    high_value: 'mdi-currency-eur'
  };
  return icons[type] || 'mdi-alert';
};

// Data loading methods (usar el mismo código de antes...)
async function loadDashboardData() {
  loading.value = true;
  try {
    console.log('📊 Loading dashboard data...');

    const reservations = await reservationService.getAllReservations();
    allReservations.value = reservations;

    calculateStats(reservations);
    calculateTodayStats(reservations);
    calculateMonthStats(reservations);
    calculateUrgentItems(reservations);

    recentActivities.value = reservations
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
      .slice(0, 8);

    console.log('✅ Dashboard data loaded successfully');

  } catch (error) {
    console.error('❌ Error loading dashboard data:', error);
    showNotification('Error al cargar el dashboard', 'error', 'mdi-alert-circle');
  } finally {
    loading.value = false;
  }
}

function calculateStats(reservations: any[]) {
  stats.value = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    approved: reservations.filter(r => r.status === 'approved').length,
    rejected: reservations.filter(r => r.status === 'rejected').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length
  };
}

function calculateTodayStats(reservations: any[]) {
  const today = new Date().toDateString();
  const todayReservations = reservations.filter(r =>
    new Date(r.bookingDate).toDateString() === today
  );

  const approvedToday = todayReservations.filter(r => r.status === 'approved');

  todayStats.value = {
    newReservations: todayReservations.length,
    approvedToday: approvedToday.length,
    revenueToday: approvedToday.reduce((sum, r) => sum + (r.totalPrice || 0), 0),
    pendingOlderThan2Hours: reservations.filter(r => {
      if (r.status !== 'pending') return false;
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      return new Date(r.bookingDate) < twoHoursAgo;
    }).length
  };
}

function calculateMonthStats(reservations: any[]) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const monthReservations = reservations.filter(r => {
    const date = new Date(r.bookingDate);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  });

  const approvedThisMonth = monthReservations.filter(r => r.status === 'approved');

  monthStats.value = {
    totalReservations: monthReservations.length,
    totalRevenue: approvedThisMonth.reduce((sum, r) => sum + (r.totalPrice || 0), 0),
    conversionRate: monthReservations.length > 0
      ? Math.round((approvedThisMonth.length / monthReservations.length) * 100)
      : 0,
    avgResponseTime: '2.3h'
  };
}

function calculateUrgentItems(reservations: any[]) {
  const urgent = [];
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

  reservations
    .filter(r => r.status === 'pending')
    .forEach(reservation => {
      const reservationDate = new Date(reservation.bookingDate);

      if (reservationDate < fourHoursAgo) {
        urgent.push({
          id: `old_pending_${reservation.bookingId}`,
          type: 'old_pending',
          message: `${reservation.clientName} - Pendiente +4h`,
          reservationId: reservation.bookingId,
          severity: 'high'
        });
      } else if (reservationDate < twoHoursAgo) {
        urgent.push({
          id: `old_pending_${reservation.bookingId}`,
          type: 'old_pending',
          message: `${reservation.clientName} - Pendiente +2h`,
          reservationId: reservation.bookingId,
          severity: 'medium'
        });
      }
    });

  // Reservas prioritarias
  reservations
    .filter(r => r.status === 'pending' && r.isPriority)
    .forEach(reservation => {
      urgent.push({
        id: `priority_${reservation.bookingId}`,
        type: 'priority',
        message: `PRIORITARIA: ${reservation.clientName}`,
        reservationId: reservation.bookingId,
        severity: 'high'
      });
    });

  urgentItems.value = urgent.slice(0, 8);
}

/// Navigation methods
function goToPending() {
  router.push({ path: '/pending' });
}

function goToApproved() {
  router.push({ path: '/approved-reservation' });
}

function goToSuppliers() {
  router.push({ path: '/suppliers' });
}

function goToStats() {
  router.push({ path: '/inventory' });
}

function goToAllReservations() {
  router.push({ name: 'AllReservations' });
}

// Action handlers
function openQuickActions() {
  showQuickActionsModal.value = true;
}

function createNewReservation() {
  showQuickActionsModal.value = false;
  showNotification('Función próximamente', 'info', 'mdi-information');
}

function handleUrgentAction(item: any) {
  router.push({
    name: 'ReservationDetails',
    params: { id: item.reservationId }
  });
}

function openReservationDetails(reservation: any) {
  selectedReservation.value = reservation;
  showDetailModal.value = true;
}

function closeReservationDetails() {
  showDetailModal.value = false;
  selectedReservation.value = null;
}

async function handleApproveFromModal(id: string) {
  showDetailModal.value = false;
  try {
    await reservationService.approveReservation(id);
    await loadDashboardData();
    showNotification('Reserva aprobada exitosamente', 'success', 'mdi-check-circle');
  } catch (error) {
    showNotification('Error al aprobar la reserva', 'error', 'mdi-alert-circle');
  }
}

async function handleRejectFromModal(id: string) {
  showDetailModal.value = false;
}

async function refreshData() {
  await loadDashboardData();
}

function showNotification(message: string, color: 'success' | 'error' | 'info' | 'warning', icon: string) {
  snackbarText.value = message;
  snackbarColor.value = color;
  snackbarIcon.value = icon;
  showSnackbar.value = true;
}

function toggleTheme() {
  console.log('Toggle theme');
}

// Lifecycle
onMounted(async () => {
  rail.value = mdAndUp.value;
  await loadDashboardData();
});

// Watchers
watch(mdAndUp, (newValue) => {
  if (!newValue) {
    rail.value = false;
    drawer.value = false;
  } else {
    drawer.value = true;
    rail.value = true;
  }
});
</script>

<style scoped>
/* 🎨 MODERN DASHBOARD STYLES */
.dashboard-layout {
  min-height: 100vh;
}

.main-content {
  position: relative;
  overflow-x: hidden;
}

/* 🌟 Background Effects */
.dashboard-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  background:
    radial-gradient(circle at 20% 20%, rgba(var(--v-theme-primary), 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(var(--v-theme-secondary), 0.03) 0%, transparent 50%),
    radial-gradient(circle at 40% 70%, rgba(var(--v-theme-info), 0.02) 0%, transparent 50%);
}

/* 🚀 Hero Section */
.hero-section {
  position: relative;
  background: linear-gradient(135deg,
    rgba(var(--v-theme-primary), 0.08) 0%,
    rgba(var(--v-theme-primary), 0.02) 100%);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 40%;
  height: 200%;
  background: linear-gradient(45deg,
    rgba(var(--v-theme-primary), 0.1) 0%,
    transparent 50%);
  border-radius: 50%;
  animation: heroFloat 6s ease-in-out infinite;
}

@keyframes heroFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.hero-text h1 {
  margin: 0;
  line-height: 1.2;
}

.hero-greeting {
  display: block;
  font-size: 1.1rem;
  font-weight: 500;
  color: rgba(var(--v-theme-primary), 0.8);
  margin-bottom: 4px;
}

.hero-main {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg,
    rgb(var(--v-theme-primary)),
    rgba(var(--v-theme-primary), 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin: 12px 0 0 0;
  max-width: 500px;
  line-height: 1.5;
}

.hero-stats {
  display: flex;
  gap: 32px;
}

.quick-stat {
  text-align: center;
}

.quick-stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  line-height: 1;
}

.quick-stat-label {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

.hero-fab {
  position: absolute;
  bottom: -28px;
  right: 32px;
  z-index: 3;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hero-fab:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 28px rgba(var(--v-theme-primary), 0.3);
}

/* 📊 Modern Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.metric-card {
  position: relative;
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: slideInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

.metric-card:nth-child(1) { animation-delay: 0.1s; }
.metric-card:nth-child(2) { animation-delay: 0.2s; }
.metric-card:nth-child(3) { animation-delay: 0.3s; }
.metric-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.metric-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.metric-card-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.1;
  transition: all 0.3s ease;
}

.metric-card:hover .metric-card-bg {
  opacity: 0.15;
  transform: scale(1.1);
}

.pending-card .metric-card-bg,
.approved-bg { background: linear-gradient(135deg, rgb(var(--v-theme-warning)), rgba(var(--v-theme-warning), 0.5)); }

.approved-bg { background: linear-gradient(135deg, rgb(var(--v-theme-success)), rgba(var(--v-theme-success), 0.5)); }

.revenue-bg { background: linear-gradient(135deg, rgb(var(--v-theme-info)), rgba(var(--v-theme-info), 0.5)); }

.performance-bg { background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.5)); }

.metric-card-content {
  padding: 24px;
  position: relative;
  z-index: 2;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.metric-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.pending-icon { background: rgba(var(--v-theme-warning), 0.15); color: rgb(var(--v-theme-warning)); }
.approved-icon { background: rgba(var(--v-theme-success), 0.15); color: rgb(var(--v-theme-success)); }
.revenue-icon { background: rgba(var(--v-theme-info), 0.15); color: rgb(var(--v-theme-info)); }
.performance-icon { background: rgba(var(--v-theme-primary), 0.15); color: rgb(var(--v-theme-primary)); }

.metric-card:hover .metric-icon-wrapper {
  transform: scale(1.1);
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin-bottom: 8px;
}

.metric-label {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-weight: 500;
  margin-bottom: 16px;
}

.metric-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-detail {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.metric-progress {
  width: 60px;
  margin-left: 12px;
}

.metric-arrow {
  color: rgba(var(--v-theme-on-surface), 0.4);
  transition: all 0.3s ease;
}

.metric-card:hover .metric-arrow {
  color: rgb(var(--v-theme-primary));
  transform: translate(2px, -2px);
}

/* 🚨 Urgent Section */
.urgent-section {
  animation: slideInUp 0.6s ease-out 0.5s forwards;
  opacity: 0;
  transform: translateY(30px);
}

.urgent-container {
  background: linear-gradient(135deg,
    rgba(var(--v-theme-error), 0.05) 0%,
    rgba(var(--v-theme-error), 0.02) 100%);
  border: 1px solid rgba(var(--v-theme-error), 0.15);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.urgent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.urgent-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.urgent-title h2 {
  font-size: 1.4rem;
  font-weight: 600;
  color: rgb(var(--v-theme-error));
  margin: 0;
}

.urgent-icon {
  color: rgb(var(--v-theme-error));
  animation: pulse 2s infinite;
}

.urgent-badge {
  animation: bounce 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-3px); }
  60% { transform: translateY(-2px); }
}

.urgent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.urgent-item {
  background: rgba(var(--v-theme-surface), 0.8);
  border: 1px solid rgba(var(--v-theme-error), 0.1);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  animation: slideInUp 0.5s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.urgent-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(var(--v-theme-error), 0.15);
  border-color: rgba(var(--v-theme-error), 0.2);
}

.urgent-item-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 0 2px 2px 0;
}

.urgent-item-indicator.high { background: rgb(var(--v-theme-error)); }
.urgent-item-indicator.medium { background: rgb(var(--v-theme-warning)); }
.urgent-item-indicator.low { background: rgb(var(--v-theme-info)); }

.urgent-item-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.urgent-avatar {
  margin-right: 12px;
}

.urgent-item-meta {
  display: flex;
  flex-direction: column;
}

.urgent-type {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.urgent-time {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.urgent-message {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.8);
  margin: 12px 0;
  line-height: 1.4;
}

.urgent-actions {
  display: flex;
  justify-content: flex-end;
}

.urgent-btn {
  text-transform: none;
  font-weight: 500;
}

/* 🃏 Glass Cards */
.glass-card {
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--v-theme-primary), 0.15);
}

.card-header {
  padding: 24px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.card-title p {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 4px 0 0 0;
}

.card-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-icon { background: rgba(var(--v-theme-primary), 0.15); color: rgb(var(--v-theme-primary)); }
.performance-icon { background: rgba(var(--v-theme-success), 0.15); color: rgb(var(--v-theme-success)); }
.actions-icon { background: rgba(var(--v-theme-warning), 0.15); color: rgb(var(--v-theme-warning)); }

.card-actions {
  display: flex;
  gap: 8px;
}

.card-content {
  padding: 24px;
}

/* 📱 Activity List */
.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  color: rgba(var(--v-theme-on-surface), 0.3);
  margin-bottom: 16px;
}

.empty-state h4 {
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin: 0 0 8px 0;
  font-weight: 500;
}

.empty-state p {
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  animation: slideInUp 0.4s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item:hover {
  background: rgba(var(--v-theme-primary), 0.04);
  margin: 0 -24px;
  padding: 16px 24px;
  border-radius: 12px;
}

.activity-avatar {
  position: relative;
  margin-right: 16px;
}

.activity-pulse {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.activity-pulse.pending { background: rgb(var(--v-theme-warning)); }
.activity-pulse.approved { background: rgb(var(--v-theme-success)); }

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-main {
  margin-bottom: 4px;
}

.activity-client {
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.activity-service {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 2px 0 0 0;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-price {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.activity-time {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  font-size: 0.8rem;
}

.activity-arrow {
  transition: all 0.3s ease;
}

.activity-item:hover .activity-arrow {
  color: rgb(var(--v-theme-primary));
  transform: translateX(2px);
}

/* 📊 Performance Metrics */
.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.performance-item {
  padding: 16px;
background: rgba(var(--v-theme-primary), 0.15);

  border-radius: 12px;
  transition: all 0.3s ease;
}

.performance-item:hover {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  transform: translateY(-2px);
}

.performance-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.performance-label span {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.help-icon {
  color: rgba(var(--v-theme-on-surface), 0.4);
}

.performance-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.performance-value .value {
  font-size: 1.4rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.performance-value .change {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
}

.change.positive {
  background: rgba(var(--v-theme-success), 0.15);
  color: rgb(var(--v-theme-success));
}

.change.negative {
  background: rgba(var(--v-theme-error), 0.15);
  color: rgb(var(--v-theme-error));
}

/* ⚡ Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  padding: 16px;
background: rgba(var(--v-theme-primary), 0.15);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  min-height: 70px;
}

.quick-action-btn:hover {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn .action-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.pending-action .action-icon { background: rgba(var(--v-theme-warning), 0.15); color: rgb(var(--v-theme-warning)); }
.payment-action .action-icon { background: rgba(var(--v-theme-success), 0.15); color: rgb(var(--v-theme-success)); }
.suppliers-action .action-icon { background: rgba(var(--v-theme-info), 0.15); color: rgb(var(--v-theme-info)); }
.analytics-action .action-icon { background: rgba(var(--v-theme-primary), 0.15); color: rgb(var(--v-theme-primary)); }

.action-content {
  display: flex;
  flex-direction: column;
}

.action-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.8);
  margin-bottom: 2px;
}

.action-count {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* 🎭 Modal Styles */
.quick-actions-modal {
  backdrop-filter: blur(20px);
  background: rgba(var(--v-theme-surface), 0.95) !important;
}

.modal-actions .v-btn {
  text-transform: none;
  font-weight: 500;
  justify-content: flex-start;
}

/* 📱 Responsive Design */
@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }

  .hero-stats {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .hero-section {
    padding: 24px 20px;
  }

  .hero-main {
    font-size: 2rem;
  }

  .urgent-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .hero-fab {
    position: relative;
    bottom: auto;
    right: auto;
    margin-top: 20px;
  }
}

@media (max-width: 600px) {
  .card-header {
    padding: 20px;
  }

  .card-content {
    padding: 20px;
  }

  .metric-card-content {
    padding: 20px;
  }

  .activity-item:hover {
    margin: 0 -20px;
    padding: 16px 20px;
  }
}
</style>
