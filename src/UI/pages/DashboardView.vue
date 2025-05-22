<template>
  <v-layout class="dashboard-layout">
    <!-- Barra lateral (sidebar) -->
    <DashboardSidebar v-model:drawer="drawer" v-model:rail="rail" :mdAndUp="mdAndUp" :pendingCount="stats.pending" />

    <!-- Barra superior (app bar) -->
    <DashboardHeader :mdAndUp="mdAndUp" v-model:drawer="drawer" v-model:rail="rail" @toggle-theme="toggleTheme" />

    <!-- Contenido principal -->
    <v-main>
      <v-container fluid class="py-6 px-4 md:px-6">
        <!-- Encabezado del Dashboard -->
        <div class="dashboard-header mb-6">
          <h1 class="text-h4 font-weight-bold mb-2 d-flex align-center">
            <v-icon icon="mdi-view-dashboard" size="36" color="primary" class="mr-3"></v-icon>
            Dashboard de Reservas
            <v-chip color="primary" size="small" class="ml-2">{{ allReservations.length }}</v-chip>
          </h1>
          <p class="text-subtitle-1 text-medium-emphasis">
            Todas las reservas disponibles en Firebase
          </p>
        </div>

        <!-- Estadísticas básicas -->
        <v-row class="mb-6">
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="0" border rounded="lg">
              <v-card-text class="text-center pa-4">
                <v-icon icon="mdi-calendar-multiple" size="32" color="primary" class="mb-2"></v-icon>
                <div class="text-h4 font-weight-bold">{{ stats.total }}</div>
                <div class="text-body-2 text-medium-emphasis">Total</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="0" border rounded="lg">
              <v-card-text class="text-center pa-4">
                <v-icon icon="mdi-clock-outline" size="32" color="warning" class="mb-2"></v-icon>
                <div class="text-h4 font-weight-bold">{{ stats.pending }}</div>
                <div class="text-body-2 text-medium-emphasis">Pendientes</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="0" border rounded="lg">
              <v-card-text class="text-center pa-4">
                <v-icon icon="mdi-check-circle" size="32" color="success" class="mb-2"></v-icon>
                <div class="text-h4 font-weight-bold">{{ stats.approved }}</div>
                <div class="text-body-2 text-medium-emphasis">Aprobadas</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="0" border rounded="lg">
              <v-card-text class="text-center pa-4">
                <v-icon icon="mdi-close-circle" size="32" color="error" class="mb-2"></v-icon>
                <div class="text-h4 font-weight-bold">{{ stats.rejected }}</div>
                <div class="text-body-2 text-medium-emphasis">Rechazadas</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Controles básicos -->
        <v-card class="mb-6" elevation="0" border rounded="lg">
          <v-card-text class="py-4">
            <div class="d-flex flex-wrap gap-4 align-center">
              <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="Buscar reservas..."
                variant="outlined" density="compact" hide-details clearable style="max-width: 300px" />

              <v-select v-model="statusFilter" :items="statusOptions" label="Estado" variant="outlined"
                density="compact" hide-details style="max-width: 150px" />

              <v-spacer></v-spacer>

              <v-btn prepend-icon="mdi-refresh" color="secondary" variant="text" :loading="loading"
                @click="refreshData">
                Actualizar
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Lista de reservas -->
        <ReservationsList :reservations="paginatedReservations" :loading="loading" v-model:current-page="currentPage"
          :items-per-page="itemsPerPage" @refresh="refreshData" @approve="handleApprove" @reject="handleReject"
          @view-details="openReservationDetails" empty-state-title="No hay reservas disponibles"
          empty-state-message="Las reservas aparecerán aquí cuando se carguen desde Firebase." />

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
          <v-pagination v-model="currentPage" :length="totalPages" :total-visible="7" rounded="circle" color="primary"
            :disabled="loading" />
        </div>
      </v-container>
    </v-main>

    <!-- Modal de detalles -->
    <ReservationDetailModal v-if="selectedReservation" :show="showDetailModal" :reservation="selectedReservation"
      @close="closeReservationDetails" @approve="handleApproveFromModal" @reject="handleRejectFromModal" />

    <!-- Notificaciones -->
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
import DashboardSidebar from '@/UI/components/dashboard/DashboardSidebar.vue';
import DashboardHeader from '@/UI/components/dashboard/DashboardHeader.vue';
import ReservationsList from '@/UI/components/reservation/ReservationsList.vue';
import ReservationDetailModal from '@/UI/components/modals/ReservationDetailModal.vue';
import { reservationServiceKey } from '@/services/ReservationService';

// Responsive helpers
const { mdAndUp } = useDisplay();

// Inyectar el servicio de reservas
const reservationService = inject(reservationServiceKey);

if (!reservationService) {
  throw new Error('ReservationService not provided');
}

// Estado del drawer y rail (sidebar)
const drawer = ref(true);
const rail = ref(false);

// Estado principal
const loading = ref(false);
const allReservations = ref([]);
const searchQuery = ref('');
const statusFilter = ref('all');
const currentPage = ref(1);
const itemsPerPage = ref(12);

// Modal state
const showDetailModal = ref(false);
const selectedReservation = ref(null);

// Notificaciones
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarIcon = ref('mdi-check-circle');

// Opciones de filtro
const statusOptions = [
  { title: 'Todos', value: 'all' },
  { title: 'Pendientes', value: 'pending' },
  { title: 'Aprobadas', value: 'approved' },
  { title: 'Rechazadas', value: 'rejected' },
  { title: 'Completadas', value: 'completed' },
  { title: 'Canceladas', value: 'cancelled' }
];

// Estadísticas calculadas
const stats = computed(() => {
  const total = allReservations.value.length;
  const pending = allReservations.value.filter(r => r.status === 'pending').length;
  const approved = allReservations.value.filter(r => r.status === 'approved').length;
  const rejected = allReservations.value.filter(r => r.status === 'rejected').length;

  return { total, pending, approved, rejected };
});

// Reservas filtradas
const filteredReservations = computed(() => {
  let result = [...allReservations.value];

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(r =>
      r.clientName?.toLowerCase().includes(query) ||
      r.clientEmail?.toLowerCase().includes(query) ||
      r.serviceName?.toLowerCase().includes(query) ||
      r.bookingId?.toLowerCase().includes(query)
    );
  }

  // Filtrar por estado
  if (statusFilter.value !== 'all') {
    result = result.filter(r => r.status === statusFilter.value);
  }

  return result;
});

// Paginación
const totalPages = computed(() => Math.ceil(filteredReservations.value.length / itemsPerPage.value));

const paginatedReservations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredReservations.value.slice(start, end);
});

// Métodos principales
async function refreshData() {
  loading.value = true;
  try {
    console.log('Cargando todas las reservas desde Firebase...');

    // Usar getAllReservations() del servicio
    const reservations = await reservationService.getAllReservations();
    allReservations.value = reservations;

    console.log(`Cargadas ${reservations.length} reservas desde Firebase`);
    showNotification(
      `${reservations.length} reservas cargadas correctamente`,
      'success',
      'mdi-check-circle'
    );
  } catch (error) {
    console.error('Error al cargar reservas:', error);
    showNotification('Error al cargar las reservas desde Firebase', 'error', 'mdi-alert-circle');
  } finally {
    loading.value = false;
  }
}

// Métodos de acción
async function handleApprove(id: string, reservation: ReservationView) {
  try {
    await reservationService.approveReservation(id);

    // Actualizar la reserva localmente
    const index = allReservations.value.findIndex(r => r.bookingId === id);
    if (index !== -1) {
      const updatedReservation = await reservationService.getReservationById(id);
      allReservations.value[index] = updatedReservation;
    }

    showNotification(`Reserva de ${reservation.clientName} aprobada`, 'success', 'mdi-check-circle');
  } catch (error) {
    console.error('Error al aprobar reserva:', error);
    showNotification('Error al aprobar la reserva', 'error', 'mdi-alert-circle');
  }
}

// Métodos del modal
function openReservationDetails(reservation) {
  selectedReservation.value = reservation;
  showDetailModal.value = true;
}

function closeReservationDetails() {
  showDetailModal.value = false;
  selectedReservation.value = null;
}

async function handleApproveFromModal(id: string) {
  showDetailModal.value = false;
  if (selectedReservation.value) {
    await handleApprove(id, selectedReservation.value);
  }
}

async function handleRejectFromModal(id: string) {
  showDetailModal.value = false;
}

// Utilidades
function showNotification(message: string, color: 'success' | 'error' | 'info' | 'warning', icon: string) {
  snackbarText.value = message;
  snackbarColor.value = color;
  snackbarIcon.value = icon;
  showSnackbar.value = true;
}

function toggleTheme() {
  console.log('Toggle theme');
}

// Lifecycle hooks
onMounted(async () => {
  // Ajustar rail basado en el tamaño de pantalla
  rail.value = mdAndUp.value;

  // Cargar datos iniciales
  await refreshData();
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

// Resetear página cuando cambian los filtros
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
}

.dashboard-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), rgba(var(--v-theme-secondary), 0.02));
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .dashboard-header {
    padding: 16px;
  }

  .dashboard-header h1 {
    font-size: 1.5rem !important;
    flex-direction: column;
    text-align: center;
  }

  .d-flex.flex-wrap.gap-4 {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
