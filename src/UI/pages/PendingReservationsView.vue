<template>
  <DashboardHeader />
  <div class="pending-reservations-container">
    <div class="header-section mb-6">
      <h1 class="text-h4 font-weight-bold mb-2 d-flex align-center">
        <v-icon icon="mdi-calendar-clock" size="36" color="primary" class="mr-3"></v-icon>
        Reservaciones Pendientes
        <v-chip color="primary" size="small" class="ml-2">{{ filteredReservations.length }}</v-chip>
      </h1>
      <p class="text-subtitle-1 text-medium-emphasis">
        Gestiona y aprueba las solicitudes de reserva de servicios
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
    <ReservationsList :reservations="filteredReservations" :loading="loading" v-model:current-page="currentPage"
      :item-per-page="itemsPerPage" @refresh="refreshData" @approve="handleApprove" @reject="handleReject"
      @view-details="openReservationDetails"
      empty-state-message="No hay reservaciones pendientes que coincidan con tus criterios de búsqueda." />

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

    <!-- Snackbar para notificaciones -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" location="bottom end" rounded="pill" timeout="3000">
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
import { ref, computed, onMounted, watch } from 'vue';
import ReservationsList from '@/UI/components/reservation/ReservationsList.vue';
import ReservationDetailModal from '@/UI/components/modals/ReservationDetailModal.vue';
import { ReservationService, ServiceType } from '@/services/ReservationService';
import { ReservationStatus } from '@/types/reservation';

// Mock de datos para desarrollo (se reemplazará por datos reales de Firestore)
import { MOCK_RESERVATIONS } from '@/constants/reservation';

// Estado local
const loading = ref(false);
const reservations = ref(MOCK_RESERVATIONS);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(9);
const showFilterDialog = ref(false);
const showDetailModal = ref(false);
const selectedReservation = ref(null);

// Notificaciones
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');
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

  // Filtrar solo reservas pendientes
  result = result.filter(r => r.status === ReservationStatus.PENDING);

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
      ReservationService.detectServiceType(r) === filters.value.serviceCategory
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
      const reservationDate = new Date(r.date);
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
function refreshData() {
  loading.value = true;

  // Simulamos la carga de datos (esto sería reemplazado por una llamada real a Firebase)
  setTimeout(() => {
    // Aquí iría la llamada a Firestore
    reservations.value = MOCK_RESERVATIONS;
    loading.value = false;

    // Mostrar notificación
    showNotification('Datos actualizados correctamente', 'info', 'mdi-refresh');
  }, 1000);
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

async function handleApprove(id, reservation) {
  // Aquí iría la lógica para aprobar en Firebase
  // Por ahora, simulamos con un timeout
  await new Promise(resolve => setTimeout(resolve, 800));

  // Actualizar localmente
  const index = reservations.value.findIndex(r => r.id === id);
  if (index !== -1) {
    reservations.value[index].status = ReservationStatus.APPROVED;
  }

  // Mostrar notificación
  showNotification('Reservación aprobada con éxito', 'success', 'mdi-check-circle');
}

async function handleReject(id, reservation) {
  // Aquí iría la lógica para rechazar en Firebase
  // Por ahora, simulamos con un timeout
  await new Promise(resolve => setTimeout(resolve, 800));

  // Actualizar localmente
  const index = reservations.value.findIndex(r => r.id === id);
  if (index !== -1) {
    reservations.value[index].status = ReservationStatus.REJECTED;
  }

  // Mostrar notificación
  showNotification('Reservación rechazada', 'error', 'mdi-close-circle');
}

async function handleApproveFromModal(id) {
  showDetailModal.value = false;
  await handleApprove(id, selectedReservation.value);
}

async function handleRejectFromModal(id) {
  showDetailModal.value = false;
  await handleReject(id, selectedReservation.value);
}

function showNotification(message: string, color: 'success' | 'error' | 'info' | 'warning', icon: string) {
  snackbarText.value = message;
  snackbarColor.value = color;
  snackbarIcon.value = icon;
  showSnackbar.value = true;
}

// Inicializar
onMounted(() => {
  refreshData();
});

// Observar cambios en el filtrado para determinar si debemos ajustar la página actual
watch(filteredReservations, (newReservations) => {
  const maxPage = Math.ceil(newReservations.length / itemsPerPage.value);
  if (currentPage.value > maxPage && maxPage > 0) {
    currentPage.value = maxPage;
  }
});
</script>

<style scoped>
.pending-reservations-container {
  padding: 16px;
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
</style>
