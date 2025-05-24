<template>
  <DashboardHeader :mdAndUp="mdAndUp" v-model:drawer="drawer" v-model:rail="rail" @toggle-theme="toggleTheme" />
  <div class="pending-reservations-container">
    <div class="header-section mb-6">
      <h1 class="text-h4 font-weight-bold mb-2 d-flex align-center">
        <v-icon icon="mdi-calendar-clock" size="36" color="primary" class="mr-3"></v-icon>
        Reservaciones Pendientes
        <v-chip color="primary" size="small" class="ml-2">{{ filteredReservations.length }}</v-chip>
      </h1>
      <p class="text-subtitle-1 text-medium-emphasis">
        Gestiona y aprueba las solicitudes de reserva de servicios desde Firebase
      </p>
    </div>

    <!-- Filtros y búsqueda -->
    <v-card class="mb-6" elevation="0" border rounded="lg">
      <v-card-text class="py-4">
        <div class="d-flex flex-wrap gap-4 align-center">
          <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="Buscar reservaciones" hide-details
            variant="outlined" density="compact" class="search-field" style="max-width: 300px"
            @update:model-value="handleSearch" clearable></v-text-field>

          <v-select v-model="filters.serviceCategory" :items="serviceCategoryOptions" label="Categoría"
            variant="outlined" density="compact" hide-details class="filter-field" style="max-width: 200px"
            @update:model-value="applyFilters"></v-select>

          <v-spacer></v-spacer>

          <v-btn prepend-icon="mdi-refresh" color="secondary" variant="text" :loading="loading" @click="refreshData">
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
    <ReservationsList :reservations="paginatedReservations" :loading="loading" v-model:current-page="currentPage"
      :items-per-page="itemsPerPage" @refresh="refreshData" @approve="handleApprove" @reject="handleReject"
      @view-details="openReservationDetails"
      empty-state-message="No hay reservaciones pendientes que coincidan con tus criterios de búsqueda."
      empty-state-title="Sin reservaciones pendientes" empty-state-icon="mdi-calendar-check" />

    <!-- Paginación manual si hay muchas reservas -->
    <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
      <v-pagination v-model="currentPage" :length="totalPages" :total-visible="7" rounded="circle" color="primary"
        :disabled="loading"></v-pagination>
    </div>

    <!-- Diálogo de filtros avanzados -->
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

          <v-checkbox v-model="filters.onlyPriority" label="Solo reservaciones prioritarias" color="error"></v-checkbox>

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
      @close="closeReservationDetails" @approve="handleApproveFromModal" @reject="handleRejectFromModal" />

    <!-- Diálogo de confirmación para aprobar todas -->
    <v-dialog v-model="showApproveAllDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon icon="mdi-check-all" color="success" class="mr-2"></v-icon>
          Confirmar Aprobación Masiva
        </v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas aprobar todas las {{ filteredReservations.length }} reservaciones pendientes?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-btn color="secondary" variant="text" @click="showApproveAllDialog = false">
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="confirmApproveAll" :loading="processingApproveAll">
            Aprobar Todas
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue';
import ReservationsList from '@/UI/components/reservation/ReservationsList.vue';
import ReservationDetailModal from '@/UI/components/modals/ReservationDetailModal.vue';
import DashboardHeader from '@/UI/components/dashboard/DashboardHeader.vue';
import { ReservationService, ServiceType } from '@/services/ReservationServiceFactory';
import { reservationServiceKey } from '@/services/ReservationService';
import { useDisplay } from 'vuetify';

// Inyectar el servicio de reservas
const reservationService = inject(reservationServiceKey);

if (!reservationService) {
  throw new Error('ReservationService not provided. Make sure it\'s provided in App.vue');
}

// Estado local
const loading = ref(false);
const processingApproveAll = ref(false);
const reservations = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(9);
const showFilterDialog = ref(false);
const showDetailModal = ref(false);
const showApproveAllDialog = ref(false);
const selectedReservation = ref(null);

// Notificaciones
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarIcon = ref('mdi-check-circle');

// Responsive helpers
const { mdAndUp } = useDisplay();
// Estado del drawer y rail (sidebar)
const drawer = ref(true);
const rail = ref(false);

function toggleTheme() {
  console.log('Toggle theme');
}


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

  // Filtrar por rango de fecha
  if (filters.value.dateRange !== 'all') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);

    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    result = result.filter(r => {
      const reservationDate = new Date(r.serviceDate || r.date);
      reservationDate.setHours(0, 0, 0, 0);

      switch (filters.value.dateRange) {
        case 'today':
          return reservationDate.getTime() === today.getTime();
        case 'tomorrow':
          return reservationDate.getTime() === tomorrow.getTime();
        case 'thisWeek':
          return reservationDate >= today && reservationDate < nextWeekStart;
        case 'nextWeek':
          return reservationDate >= nextWeekStart && reservationDate < nextWeekEnd;
        case 'thisMonth':
          return reservationDate >= today && reservationDate <= thisMonthEnd;
        default:
          return true;
      }
    });
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

// Métodos para Firebase

async function refreshData() {
  loading.value = true;

  try {
    console.log('Fetching pending reservations from Firebase...');

    // Obtener reservas pendientes desde Firebase
    const pendingReservations = await reservationService.getPendingReservations();
    reservations.value = pendingReservations;

    console.log(`Loaded ${pendingReservations.length} pending reservations from Firebase`);

    // Mostrar notificación
    showNotification(
      `${pendingReservations.length} reservaciones cargadas desde Firebase`,
      'info',
      'mdi-refresh'
    );
  } catch (error) {
    console.error('Error fetching reservations from Firebase:', error);
    showNotification('Error al cargar las reservas desde Firebase', 'error', 'mdi-alert-circle');

    // En caso de error, mantener un array vacío
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

  // Reiniciar también la búsqueda
  searchQuery.value = '';

  // Volver a la primera página
  currentPage.value = 1;
}

function applyFilters() {
  showFilterDialog.value = false;
  // Reset a la primera página al aplicar filtros
  currentPage.value = 1;
}

function handleSearch() {
  currentPage.value = 1; // Reset a la primera página al buscar
}

function openReservationDetails(reservation) {
  selectedReservation.value = reservation;
  showDetailModal.value = true;
}

function closeReservationDetails() {
  showDetailModal.value = false;
  selectedReservation.value = null;
}

async function handleApprove(id: string, reservation) {
  try {
    console.log(`Approving reservation ${id}...`);

    // Aprobar en Firebase
    await reservationService.approveReservation(id);

    // Actualizar localmente removiendo la reserva aprobada de pendientes
    const index = reservations.value.findIndex(r => r.bookingId === id);
    if (index !== -1) {
      reservations.value.splice(index, 1);
    }

    // Mostrar notificación
    showNotification(`Reservación de ${reservation.clientName} aprobada con éxito`, 'success', 'mdi-check-circle');
  } catch (error) {
    console.error('Error approving reservation:', error);
    showNotification('Error al aprobar la reservación', 'error', 'mdi-alert-circle');
  }
}

async function handleApproveFromModal(id: string) {
  showDetailModal.value = false;
  if (selectedReservation.value) {
    await handleApprove(id, selectedReservation.value);
  }
}

function showNotification(message: string, color: 'success' | 'error' | 'info' | 'warning', icon: string) {
  snackbarText.value = message;
  snackbarColor.value = color;
  snackbarIcon.value = icon;
  showSnackbar.value = true;
}

// Inicializar cargando datos desde Firebase
onMounted(async () => {
  console.log('PendingReservationsView mounted, loading data...');
  await refreshData();
});

// Observar cambios en el filtrado para determinar si debemos ajustar la página actual
watch(filteredReservations, (newReservations) => {
  const maxPage = Math.ceil(newReservations.length / itemsPerPage.value);
  if (currentPage.value > maxPage && maxPage > 0) {
    currentPage.value = maxPage;
  }
});

// Observar cambios en filtros para resetear página
watch([() => filters.value.serviceCategory, () => filters.value.dateRange, () => filters.value.onlyPriority, () => filters.value.onlyNewClients], () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.pending-reservations-container {
  padding: 16px;
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
  .pending-reservations-container {
    padding: 12px;
  }

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
