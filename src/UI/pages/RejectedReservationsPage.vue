<template>
  <v-app>
    <v-layout>
      <DashboardSidebar v-if="showSidebar" v-model:drawer="drawer" v-model:rail="rail" :mdAndUp="mdAndUp"
        :rejectCount="filteredReservations.length" />

      <!-- Contenido principal -->
      <v-main>
        <!-- Header -->
        <DashboardHeader :mdAndUp="mdAndUp" v-model:drawer="drawer" v-model:rail="rail" @toggle-theme="toggleTheme" />

        <v-container fluid class="py-6 px-4">
          <div class="reject-reservations-container">
            <div class="header-section mb-6">
              <h1 class="text-h4 font-weight-bold mb-2 d-flex align-center">
                <v-icon icon="mdi-calendar-clock" size="36" color="primary" class="mr-3"></v-icon>
                Reservaciones Rechazadas
                <v-chip color="primary" size="small" class="ml-2">{{ filteredReservations.length }}</v-chip>
              </h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Gestiona las solicitudes de reserva de servicios que no pudieron completarse.
              </p>
            </div>

            <!-- Filtros y búsqueda -->
            <v-card class="mb-6" elevation="0" border rounded="lg">
              <v-card-text class="py-4">
                <div class="d-flex flex-wrap gap-4 align-center">
                  <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="Buscar reservaciones"
                    hide-details variant="outlined" density="compact" class="search-field" style="max-width: 300px"
                    @update:model-value="handleSearch" clearable></v-text-field>

                  <v-select v-model="filters.serviceCategory" :items="serviceCategoryOptions" label="Categoría"
                    variant="outlined" density="compact" hide-details class="filter-field" style="max-width: 200px"
                    @update:model-value="applyFilters"></v-select>

                  <v-spacer></v-spacer>

                  <v-btn prepend-icon="mdi-refresh" color="secondary" variant="text" :loading="loading"
                    @click="refreshData">
                    Actualizar
                  </v-btn>

                  <v-btn color="primary" prepend-icon="mdi-filter-variant" @click="showFilterDialog = true">
                    Filtros
                    <v-chip v-if="hasActiveFilters" size="x-small" color="primary" class="ml-2">
                      {{ activeFiltersCount }}
                    </v-chip>
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- Lista de reservaciones usando el componente ReservationList -->
            <ReservationsList :reservations="paginatedReservations" :loading="loading"
              v-model:current-page="currentPage" :items-per-page="itemsPerPage" @refresh="refreshData"
              @reject="handleReject" @view-details="openReservationDetails"
              empty-state-message="No hay reservaciones rechazadas que coincidan con tus criterios de búsqueda."
              empty-state-title="Sin reservaciones rechazadas" empty-state-icon="mdi-calendar-check" />


            <!-- Paginación manual si hay muchas reservas -->
            <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
              <v-pagination v-model="currentPage" :length="totalPages" :total-visible="7" rounded="circle"
                color="primary" :disabled="loading"></v-pagination>
            </div>
          </div>
        </v-container>
      </v-main>

      <!-- Diálogos y modales -->
      <v-dialog v-model="showFilterDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h5 pt-5 pb-2 px-5">
            <v-icon icon="mdi-filter-variant" color="primary" class="mr-2"></v-icon>
            Filtrar Reservaciones
          </v-card-title>

          <v-card-text class="px-5 pt-2">
            <v-select v-model="filters.serviceCategory" label="Categoría de Servicio" :items="serviceCategoryOptions"
              variant="outlined" class="mb-4"></v-select>

            <v-select v-model="filters.dateRange" label="Rango de Fecha" :items="dateRangeOptions" variant="outlined"
              class="mb-4"></v-select>

            <v-checkbox v-model="filters.onlyPriority" label="Solo reservaciones prioritarias"
              color="error"></v-checkbox>

            <v-checkbox v-model="filters.onlyNewClients" label="Solo clientes nuevos" color="info"></v-checkbox>
          </v-card-text>

          <v-card-actions class="px-5 pb-5">
            <v-btn color="secondary" variant="text" @click="resetFilters">Reiniciar</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="applyFilters">
              Aplicar Filtros
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Modal de detalles de reservación -->
      <ReservationDetailModal v-if="selectedReservation" :show="showDetailModal" :reservation="selectedReservation"
        @close="closeReservationDetails" />


      <!-- Snackbar para notificaciones -->
      <v-snackbar v-model="showSnackbar" :color="snackbarColor" location="bottom end" rounded="pill" timeout="4000">
        <div class="d-flex align-center">
          <v-icon :icon="snackbarIcon" class="mr-2" size="small"></v-icon>
          {{ snackbarText }}
        </div>
        <template v-slot:actions>
          <v-btn icon="mdi-close" variant="text" @click="showSnackbar = false"></v-btn>
        </template>
      </v-snackbar>
    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useDisplay } from 'vuetify';
import ReservationsList from '@/UI/components/reservation/ReservationsList.vue';
import ReservationDetailModal from '@/UI/components/modals/ReservationDetailModal.vue';
import DashboardHeader from '@/UI/components/dashboard/DashboardHeader.vue';
import DashboardSidebar from '@/UI/components/dashboard/DashboardSidebar.vue';
import { ReservationService, ServiceType } from '@/services/ReservationServiceFactory';
import { reservationServiceKey } from '@/services/ReservationService';

// Responsive helpers
const { mdAndUp } = useDisplay();

// Inyectar el servicio de reservas
const reservationService = inject(reservationServiceKey);

if (!reservationService) {
  throw new Error('ReservationService not provided. Make sure it\'s provided in App.vue');
}

// Estado del layout
const drawer = ref(true);
const rail = ref(false);
const showSidebar = ref(true); // Controla si mostrar sidebar

// Estado local
const loading = ref(false);
const reservations = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(9);
const showFilterDialog = ref(false);
const showDetailModal = ref(false);
const selectedReservation = ref(null);

// Notificaciones
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarIcon = ref('mdi-check-circle');

// Filtros
const filters = ref({
  serviceCategory: 'all',
  dateRange: 'all',
  onlyPriority: false,
  onlyNewClients: false
});

// Opciones para los filtros
const serviceCategoryOptions = [
  { title: 'Todas las categorías', value: 'all' },
  { title: 'Transporte Aeropuerto', value: ServiceType.AIRPORT_TRANSFER },
  { title: 'Servicio de Niñera', value: ServiceType.BABYSITTER },
  { title: 'Decoración Personalizada', value: ServiceType.CUSTOM_DECORATION },
  { title: 'Compras de Supermercado', value: ServiceType.GROCERY_SHOPPING }
];

const dateRangeOptions = [
  { title: 'Todas las fechas', value: 'all' },
  { title: 'Hoy', value: 'today' },
  { title: 'Mañana', value: 'tomorrow' },
  { title: 'Esta semana', value: 'thisWeek' },
  { title: 'La próxima semana', value: 'nextWeek' },
  { title: 'Este mes', value: 'thisMonth' }
];

// Aplicar filtros locales
const filteredReservations = computed(() => {
  let result = [...reservations.value];

  // Filtrar por búsqueda de texto
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(r =>
      r.clientName?.toLowerCase().includes(query) ||
      r.clientEmail?.toLowerCase().includes(query) ||
      r.serviceName?.toLowerCase().includes(query) ||
      r.notes?.toLowerCase().includes(query)
    );
  }

  // Filtrar por categoría de servicio
  if (filters.value.serviceCategory !== 'all') {
    result = result.filter(r =>
      ReservationService.detectServiceType(r.toPlainObject()) === filters.value.serviceCategory
    );
  }

  // Filtrar por prioridad
  if (filters.value.onlyPriority) {
    result = result.filter(r => r.isPriority);
  }

  // Filtrar por clientes nuevos
  if (filters.value.onlyNewClients) {
    result = result.filter(r => r.isNewClient);
  }

  return result;
});

// Paginación computada
const totalPages = computed(() => Math.ceil(filteredReservations.value.length / itemsPerPage.value));

const paginatedReservations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredReservations.value.slice(start, end);
});

// Contador de filtros activos
const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.serviceCategory !== 'all') count++;
  if (filters.value.dateRange !== 'all') count++;
  if (filters.value.onlyPriority) count++;
  if (filters.value.onlyNewClients) count++;
  return count;
});

const hasActiveFilters = computed(() => activeFiltersCount.value > 0);

// Métodos
async function refreshData() {
  loading.value = true;

  try {
    console.log('Fetching rejected reservations...');
    const rejectedReservations = await reservationService.rejectReservation();
    reservations.value = rejectedReservations;

    console.log(`Loaded ${rejectedReservations.length} rejected reservations`);
    showNotification(
      `${rejectedReservations.length} reservaciones cargadas desde Firebase`,
      'info',
      'mdi-refresh'
    );
  } catch (error) {
    console.error('Error fetching reservations from Firebase:', error);
    showNotification('Error al cargar las reservas desde Firebase', 'error', 'mdi-alert-circle');
    reservations.value = [];
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.value = {
    serviceCategory: 'all',
    dateRange: 'all',
    onlyPriority: false,
    onlyNewClients: false
  };
  searchQuery.value = '';
  currentPage.value = 1;
}

function applyFilters() {
  showFilterDialog.value = false;
  currentPage.value = 1;
}

function handleSearch() {
  currentPage.value = 1;
}

function openReservationDetails(reservation) {
  selectedReservation.value = reservation;
  showDetailModal.value = true;
}

function closeReservationDetails() {
  showDetailModal.value = false;
  selectedReservation.value = null;
}


async function handleReject(id: string, reservation) {
  try {
    console.log(`Rejecting reservation ${id}...`);
    await reservationService.rejectReservation(id);

    const index = reservations.value.findIndex(r => r.bookingId === id);
    if (index !== -1) {
      reservations.value.splice(index, 1);
    }

    showNotification(`Reservación de ${reservation.clientName} rechazada`, 'error', 'mdi-close-circle');
  } catch (error) {
    console.error('Error rejecting reservation:', error);
    showNotification('Error al rechazar la reservación', 'error', 'mdi-alert-circle');
  }
}


async function handleRejectFromModal(id: string) {
  showDetailModal.value = false;
  if (selectedReservation.value) {
    await handleReject(id, selectedReservation.value);
  }
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

// Lifecycle hooks
onMounted(async () => {
  // Ajustar layout basado en el tamaño de pantalla
  rail.value = mdAndUp.value;
  console.log('RejectedReservationsView mounted, loading data...');
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

watch(filteredReservations, (newReservations) => {
  const maxPage = Math.ceil(newReservations.length / itemsPerPage.value);
  if (currentPage.value > maxPage && maxPage > 0) {
    currentPage.value = maxPage;
  }
});

</script>

<style scoped>
.reject-reservations-container {
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 24px;
}

.search-field,
.filter-field {
  transition: all 0.3s ease;
}

.search-field:focus-within,
.filter-field:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(var(--v-theme-on-surface), 0.05);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-section h1 {
    font-size: 1.5rem !important;
  }

  .d-flex.flex-wrap.gap-4 {
    flex-direction: column;
    align-items: stretch;
  }

  .search-field,
  .filter-field {
    max-width: 100% !important;
  }
}
</style>
