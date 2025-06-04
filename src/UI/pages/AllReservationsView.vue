<template>
  <v-layout class="all-reservations-layout">
    <!-- Sidebar -->
    <DashboardSidebar v-model:drawer="drawer" v-model:rail="rail" :mdAndUp="mdAndUp"
      :pendingCount="stats.pending" :approvedCount="stats.approved" :suppliersCount="12" />

    <!-- Header -->
    <DashboardHeader :mdAndUp="mdAndUp" v-model:drawer="drawer" v-model:rail="rail" @toggle-theme="toggleTheme" />

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="py-6 px-4">

        <!-- 📊 Header Section with Stats -->
        <div class="page-header mb-6">
          <div class="header-content">
            <div class="title-section">
              <h1 class="page-title">
                <v-icon icon="mdi-calendar-multiple" size="32" color="primary" class="mr-3" />
                Todas las Reservas
                <v-chip color="primary" size="small" class="ml-3">{{ totalReservations }}</v-chip>
              </h1>
              <p class="page-subtitle">
                Gestión completa del historial de reservas y estadísticas
              </p>
            </div>

            <div class="quick-stats">
              <div class="stat-card" @click="applyQuickFilter('pending')">
                <div class="stat-value">{{ stats.pending }}</div>
                <div class="stat-label">Pendientes</div>
              </div>
              <div class="stat-card" @click="applyQuickFilter('approved')">
                <div class="stat-value">{{ stats.approved }}</div>
                <div class="stat-label">Aprobadas</div>
              </div>
              <div class="stat-card" @click="applyQuickFilter('completed')">
                <div class="stat-value">{{ stats.completed }}</div>
                <div class="stat-label">Completadas</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 🔍 Advanced Filters Section -->
        <v-card class="filters-card mb-6" rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="filters-header mb-4">
              <h3 class="filters-title">
                <v-icon icon="mdi-filter-variant" class="mr-2" />
                Filtros Avanzados
              </h3>
              <div class="filters-actions">
                <v-chip v-if="hasActiveFilters" color="primary" size="small" @click="clearAllFilters">
                  {{ activeFiltersCount }} filtros activos
                  <v-icon icon="mdi-close" size="14" class="ml-1" />
                </v-chip>
                <v-btn variant="text" size="small" @click="showFilters = !showFilters">
                  {{ showFilters ? 'Ocultar' : 'Mostrar' }}
                  <v-icon :icon="showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'" class="ml-1" />
                </v-btn>
              </div>
            </div>

            <v-expand-transition>
              <div v-show="showFilters" class="filters-content">
                <v-row>
                  <!-- Search -->
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="filters.search"
                      label="Buscar reservas..."
                      prepend-inner-icon="mdi-magnify"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable
                      @update:model-value="debouncedSearch" />
                  </v-col>

                  <!-- Status Filter -->
                  <v-col cols="12" md="2">
                    <v-select
                      v-model="filters.status"
                      label="Estado"
                      :items="statusOptions"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable />
                  </v-col>

                  <!-- Service Filter -->
                  <v-col cols="12" md="3">
                    <v-select
                      v-model="filters.service"
                      label="Servicio"
                      :items="serviceOptions"
                      variant="outlined"
                      density="compact"
                      hide-details
                      clearable />
                  </v-col>

                  <!-- Date Range -->
                  <v-col cols="12" md="3">
                    <v-select
                      v-model="filters.dateRange"
                      label="Período"
                      :items="dateRangeOptions"
                      variant="outlined"
                      density="compact"
                      hide-details
                      @update:model-value="handleDateRangeChange" />
                  </v-col>
                </v-row>

                <v-row class="mt-2">
                  <!-- Price Range -->
                  <v-col cols="12" md="4">
                    <v-range-slider
                      v-model="filters.priceRange"
                      label="Rango de Precio"
                      :min="0"
                      :max="1000"
                      step="50"
                      thumb-label
                      hide-details
                      class="price-slider">
                      <template v-slot:prepend>
                        <span class="text-caption">€0</span>
                      </template>
                      <template v-slot:append>
                        <span class="text-caption">€1000+</span>
                      </template>
                    </v-range-slider>
                  </v-col>

                  <!-- Sort Options -->
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="filters.sortBy"
                      label="Ordenar por"
                      :items="sortOptions"
                      variant="outlined"
                      density="compact"
                      hide-details />
                  </v-col>

                  <!-- Quick Filters -->
                  <v-col cols="12" md="4">
                    <div class="quick-filters">
                      <span class="quick-filters-label">Filtros rápidos:</span>
                      <div class="quick-filters-chips">
                        <v-chip
                          v-model="filters.priorityOnly"
                          color="error"
                          size="small"
                          variant="tonal"
                          filter>
                          Prioritarias
                        </v-chip>
                        <v-chip
                          v-model="filters.newClientsOnly"
                          color="info"
                          size="small"
                          variant="tonal"
                          filter>
                          Nuevos Clientes
                        </v-chip>
                        <v-chip
                          v-model="filters.highValueOnly"
                          color="success"
                          size="small"
                          variant="tonal"
                          filter>
                          Alto Valor
                        </v-chip>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-expand-transition>
          </v-card-text>
        </v-card>

        <!-- 📊 Analytics Summary (when filters applied) -->
        <v-card v-if="hasActiveFilters" class="analytics-card mb-6" rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="analytics-header">
              <h3 class="analytics-title">
                <v-icon icon="mdi-chart-box" class="mr-2" />
                Resumen de Filtros Aplicados
              </h3>
            </div>

            <div class="analytics-grid">
              <div class="analytics-item">
                <span class="analytics-label">Total Filtrado:</span>
                <span class="analytics-value">{{ filteredReservations.length }}</span>
              </div>
              <div class="analytics-item">
                <span class="analytics-label">Ingresos Total:</span>
                <span class="analytics-value">{{ formatCurrency(totalRevenue) }}</span>
              </div>
              <div class="analytics-item">
                <span class="analytics-label">Precio Promedio:</span>
                <span class="analytics-value">{{ formatCurrency(averagePrice) }}</span>
              </div>
              <div class="analytics-item">
                <span class="analytics-label">Período:</span>
                <span class="analytics-value">{{ getDateRangeLabel() }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- 🎯 Action Bar -->
        <v-card class="action-bar mb-6" rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center">
              <div class="selection-info">
                <span v-if="selectedReservations.length > 0" class="text-subtitle-2">
                  {{ selectedReservations.length }} reservas seleccionadas
                </span>
                <span v-else class="text-body-2 text-medium-emphasis">
                  {{ filteredReservations.length }} de {{ totalReservations }} reservas
                </span>
              </div>

              <div class="action-buttons">
                <v-btn
                  v-if="selectedReservations.length > 0"
                  color="error"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-delete"
                  @click="bulkDelete">
                  Eliminar Seleccionadas
                </v-btn>

                <v-btn
                  color="success"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-download"
                  @click="exportData">
                  Exportar
                </v-btn>

                <v-btn
                  color="primary"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-refresh"
                  :loading="loading"
                  @click="refreshData">
                  Actualizar
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- 📋 Reservations List -->
        <ReservationsList
          :reservations="paginatedReservations"
          :loading="loading"
          v-model:current-page="currentPage"
          :items-per-page="itemsPerPage"
          :show-selection="true"
          v-model:selected="selectedReservations"
          @refresh="refreshData"
          @approve="handleApprove"
          @reject="handleReject"
          @view-details="openReservationDetails"
          empty-state-title="No se encontraron reservas"
          empty-state-message="Intenta ajustar los filtros para ver más resultados."
          empty-state-icon="mdi-calendar-search">

          <!-- Custom header for bulk actions -->
          <template v-if="selectedReservations.length > 0" #list-header>
            <v-card color="primary" variant="tonal" rounded="lg" class="mb-4">
              <v-card-text class="d-flex align-center justify-space-between pa-4">
                <div class="selection-summary">
                  <h3 class="text-subtitle-1 font-weight-bold">
                    {{ selectedReservations.length }} reservas seleccionadas
                  </h3>
                  <p class="text-body-2 mb-0">
                    Total: {{ formatCurrency(getSelectedTotal()) }}
                  </p>
                </div>

                <div class="bulk-actions">
                  <v-btn
                    color="success"
                    variant="elevated"
                    size="small"
                    prepend-icon="mdi-check-all"
                    @click="bulkApprove"
                    class="mr-2">
                    Aprobar Todas
                  </v-btn>
                  <v-btn
                    color="error"
                    variant="elevated"
                    size="small"
                    prepend-icon="mdi-close-circle"
                    @click="bulkReject">
                    Rechazar Todas
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </template>
        </ReservationsList>

        <!-- 📄 Pagination -->
        <div v-if="totalPages > 1" class="pagination-section d-flex justify-center mt-6">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="7"
            rounded="circle"
            color="primary"
            :disabled="loading" />
        </div>

      </v-container>
    </v-main>

    <!-- 📱 Modals -->
    <ReservationDetailModal
      v-if="selectedReservation"
      :show="showDetailModal"
      :reservation="selectedReservation"
      @close="closeReservationDetails"
      @approve="handleApproveFromModal"
      @reject="handleRejectFromModal" />

    <!-- Export Dialog -->
    <v-dialog v-model="showExportDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="text-h5 pa-6">
          <v-icon icon="mdi-download" class="mr-2" color="primary" />
          Exportar Datos
        </v-card-title>

        <v-card-text class="px-6 pt-0">
          <p class="mb-4">Selecciona el formato de exportación:</p>

          <v-btn-toggle v-model="exportFormat" color="primary" mandatory class="mb-4">
            <v-btn value="csv" prepend-icon="mdi-file-delimited">CSV</v-btn>
            <v-btn value="excel" prepend-icon="mdi-file-excel">Excel</v-btn>
            <v-btn value="pdf" prepend-icon="mdi-file-pdf-box">PDF</v-btn>
          </v-btn-toggle>

          <v-checkbox
            v-model="exportFiltered"
            label="Solo exportar reservas filtradas"
            hide-details />
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-btn color="secondary" variant="text" @click="showExportDialog = false">
            Cancelar
          </v-btn>
          <v-spacer />
          <v-btn color="primary" @click="confirmExport" :loading="exporting">
            Exportar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
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
import ReservationsList from '@/UI/components/reservation/ReservationsList.vue';
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

// Data state
const loading = ref(false);
const allReservations = ref([]);
const selectedReservations = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(12);

// UI state
const showFilters = ref(false);
const showDetailModal = ref(false);
const selectedReservation = ref(null);
const showExportDialog = ref(false);
const exporting = ref(false);
const exportFormat = ref('csv');
const exportFiltered = ref(true);

// Filters state
const filters = ref({
  search: '',
  status: null,
  service: null,
  dateRange: 'all',
  priceRange: [0, 1000],
  sortBy: 'newest',
  priorityOnly: false,
  newClientsOnly: false,
  highValueOnly: false,
  customDateStart: null,
  customDateEnd: null
});

// Stats
const stats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  completed: 0,
  cancelled: 0
});

// Notifications
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarIcon = ref('mdi-check-circle');

// Filter options
const statusOptions = [
  { title: 'Pendientes', value: 'pending' },
  { title: 'Aprobadas', value: 'approved' },
  { title: 'Rechazadas', value: 'rejected' },
  { title: 'Completadas', value: 'completed' },
  { title: 'Canceladas', value: 'cancelled' }
];

const serviceOptions = [
  { title: 'Transporte Aeropuerto', value: 'airport-transfer' },
  { title: 'Servicio de Niñera', value: 'babysitter' },
  { title: 'Decoración Personalizada', value: 'custom-decoration' },
  { title: 'Compras de Supermercado', value: 'grocery-shopping' }
];

const dateRangeOptions = [
  { title: 'Todas las fechas', value: 'all' },
  { title: 'Hoy', value: 'today' },
  { title: 'Ayer', value: 'yesterday' },
  { title: 'Última semana', value: 'lastWeek' },
  { title: 'Último mes', value: 'lastMonth' },
  { title: 'Últimos 3 meses', value: 'last3Months' },
  { title: 'Este año', value: 'thisYear' },
  { title: 'Personalizado', value: 'custom' }
];

const sortOptions = [
  { title: 'Más recientes', value: 'newest' },
  { title: 'Más antiguos', value: 'oldest' },
  { title: 'Mayor precio', value: 'priceDesc' },
  { title: 'Menor precio', value: 'priceAsc' },
  { title: 'Cliente A-Z', value: 'clientAsc' },
  { title: 'Cliente Z-A', value: 'clientDesc' }
];

// Computed properties
const totalReservations = computed(() => allReservations.value.length);

const hasActiveFilters = computed(() => {
  return filters.value.search ||
         filters.value.status ||
         filters.value.service ||
         filters.value.dateRange !== 'all' ||
         filters.value.priceRange[0] > 0 ||
         filters.value.priceRange[1] < 1000 ||
         filters.value.priorityOnly ||
         filters.value.newClientsOnly ||
         filters.value.highValueOnly;
});

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.search) count++;
  if (filters.value.status) count++;
  if (filters.value.service) count++;
  if (filters.value.dateRange !== 'all') count++;
  if (filters.value.priceRange[0] > 0 || filters.value.priceRange[1] < 1000) count++;
  if (filters.value.priorityOnly) count++;
  if (filters.value.newClientsOnly) count++;
  if (filters.value.highValueOnly) count++;
  return count;
});

const filteredReservations = computed(() => {
  let result = [...allReservations.value];

  // Search filter
  if (filters.value.search) {
    const query = filters.value.search.toLowerCase();
    result = result.filter(r =>
      r.clientName?.toLowerCase().includes(query) ||
      r.clientEmail?.toLowerCase().includes(query) ||
      r.serviceName?.toLowerCase().includes(query) ||
      r.bookingId?.toLowerCase().includes(query)
    );
  }

  // Status filter
  if (filters.value.status) {
    result = result.filter(r => r.status === filters.value.status);
  }

  // Service filter
  if (filters.value.service) {
    result = result.filter(r => r.serviceName?.toLowerCase().includes(filters.value.service));
  }

  // Date range filter
  if (filters.value.dateRange !== 'all') {
    result = filterByDateRange(result, filters.value.dateRange);
  }

  // Price range filter
  result = result.filter(r =>
    (r.totalPrice || 0) >= filters.value.priceRange[0] &&
    (r.totalPrice || 0) <= filters.value.priceRange[1]
  );

  // Quick filters
  if (filters.value.priorityOnly) {
    result = result.filter(r => r.isPriority);
  }

  if (filters.value.newClientsOnly) {
    result = result.filter(r => r.isNewClient);
  }

  if (filters.value.highValueOnly) {
    result = result.filter(r => (r.totalPrice || 0) > 300);
  }

  // Sort
  result = sortReservations(result, filters.value.sortBy);

  return result;
});

const totalPages = computed(() => Math.ceil(filteredReservations.value.length / itemsPerPage.value));

const paginatedReservations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredReservations.value.slice(start, end);
});

const totalRevenue = computed(() => {
  return filteredReservations.value.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
});

const averagePrice = computed(() => {
  const filtered = filteredReservations.value;
  return filtered.length > 0 ? totalRevenue.value / filtered.length : 0;
});

// Utility methods
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const getDateRangeLabel = (): string => {
  const option = dateRangeOptions.find(opt => opt.value === filters.value.dateRange);
  return option?.title || 'Personalizado';
};

const getSelectedTotal = (): number => {
  return selectedReservations.value.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
};

// Filter methods
const debouncedSearch = (() => {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      currentPage.value = 1;
    }, 300);
  };
})();

const filterByDateRange = (reservations: any[], range: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case 'today':
      return reservations.filter(r => {
        const date = new Date(r.bookingDate);
        return date >= today;
      });

    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return reservations.filter(r => {
        const date = new Date(r.bookingDate);
        return date >= yesterday && date < today;
      });

    case 'lastWeek':
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return reservations.filter(r => new Date(r.bookingDate) >= weekAgo);

    case 'lastMonth':
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return reservations.filter(r => new Date(r.bookingDate) >= monthAgo);

    case 'last3Months':
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return reservations.filter(r => new Date(r.bookingDate) >= threeMonthsAgo);

    case 'thisYear':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return reservations.filter(r => new Date(r.bookingDate) >= yearStart);

    default:
      return reservations;
  }
};

const sortReservations = (reservations: any[], sortBy: string) => {
  const sorted = [...reservations];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
    case 'priceDesc':
      return sorted.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
    case 'priceAsc':
      return sorted.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
    case 'clientAsc':
      return sorted.sort((a, b) => a.clientName?.localeCompare(b.clientName) || 0);
    case 'clientDesc':
      return sorted.sort((a, b) => b.clientName?.localeCompare(a.clientName) || 0);
    default:
      return sorted;
  }
};

const applyQuickFilter = (status: string) => {
  filters.value.status = status;
  currentPage.value = 1;
  showNotification(`Filtro aplicado: ${status}`, 'info', 'mdi-filter');
};

const clearAllFilters = () => {
  filters.value = {
    search: '',
    status: null,
    service: null,
    dateRange: 'all',
    priceRange: [0, 1000],
    sortBy: 'newest',
    priorityOnly: false,
    newClientsOnly: false,
    highValueOnly: false,
    customDateStart: null,
    customDateEnd: null
  };
  currentPage.value = 1;
  showNotification('Filtros limpiados', 'info', 'mdi-filter-remove');
};

const handleDateRangeChange = () => {
  currentPage.value = 1;
};

// Data methods
async function refreshData() {
  loading.value = true;
  try {
    const reservations = await reservationService.getAllReservations();
    allReservations.value = reservations;

    // Calculate stats
    stats.value = {
      total: reservations.length,
      pending: reservations.filter(r => r.status === 'pending').length,
      approved: reservations.filter(r => r.status === 'approved').length,
      rejected: reservations.filter(r => r.status === 'rejected').length,
      completed: reservations.filter(r => r.status === 'completed').length,
      cancelled: reservations.filter(r => r.status === 'cancelled').length
    };

    showNotification(`${reservations.length} reservas cargadas`, 'success', 'mdi-check-circle');
  } catch (error) {
    console.error('Error loading reservations:', error);
    showNotification('Error al cargar las reservas', 'error', 'mdi-alert-circle');
  } finally {
    loading.value = false;
  }
}

// Action methods
async function handleApprove(id: string, reservation: any) {
  try {
    await reservationService.approveReservation(id);
    await refreshData();
    showNotification(`Reserva de ${reservation.clientName} aprobada`, 'success', 'mdi-check-circle');
  } catch (error) {
    showNotification('Error al aprobar la reserva', 'error', 'mdi-alert-circle');
  }
}

async function handleReject(id: string, reservation: any) {
  try {
    await reservationService.rejectReservation(id);
    await refreshData();
    showNotification(`Reserva de ${reservation.clientName} rechazada`, 'error', 'mdi-close-circle');
  } catch (error) {
    showNotification('Error al rechazar la reserva', 'error', 'mdi-alert-circle');
  }
}

const openReservationDetails = (reservation: any) => {
  selectedReservation.value = reservation;
  showDetailModal.value = true;
};

const closeReservationDetails = () => {
  showDetailModal.value = false;
  selectedReservation.value = null;
};

const handleApproveFromModal = async (id: string) => {
  showDetailModal.value = false;
  if (selectedReservation.value) {
    await handleApprove(id, selectedReservation.value);
  }
};

const handleRejectFromModal = async (id: string) => {
  showDetailModal.value = false;
  if (selectedReservation.value) {
    await handleReject(id, selectedReservation.value);
  }
};

// Bulk actions
const bulkApprove = async () => {
  try {
    loading.value = true;
    for (const reservation of selectedReservations.value) {
      await reservationService.approveReservation(reservation.bookingId);
    }

    selectedReservations.value = [];
    await refreshData();
    showNotification('Reservas aprobadas exitosamente', 'success', 'mdi-check-all');
  } catch (error) {
    showNotification('Error al aprobar las reservas', 'error', 'mdi-alert-circle');
  } finally {
    loading.value = false;
  }
};

const bulkReject = async () => {
  try {
    loading.value = true;
    for (const reservation of selectedReservations.value) {
      await reservationService.rejectReservation(reservation.bookingId);
    }

    selectedReservations.value = [];
    await refreshData();
    showNotification('Reservas rechazadas exitosamente', 'error', 'mdi-close-circle');
  } catch (error) {
    showNotification('Error al rechazar las reservas', 'error', 'mdi-alert-circle');
  } finally {
    loading.value = false;
  }
};

const bulkDelete = async () => {
  // Implement bulk delete logic
  console.log('Bulk delete:', selectedReservations.value);
  showNotification('Función de eliminación en desarrollo', 'info', 'mdi-information');
};

// Export functionality
const exportData = () => {
  showExportDialog.value = true;
};

const confirmExport = async () => {
  try {
    exporting.value = true;

    const dataToExport = exportFiltered.value ? filteredReservations.value : allReservations.value;

    switch (exportFormat.value) {
      case 'csv':
        await exportToCSV(dataToExport);
        break;
      case 'excel':
        await exportToExcel(dataToExport);
        break;
      case 'pdf':
        await exportToPDF(dataToExport);
        break;
    }

    showExportDialog.value = false;
    showNotification(`Datos exportados en formato ${exportFormat.value.toUpperCase()}`, 'success', 'mdi-download');
  } catch (error) {
    showNotification('Error al exportar los datos', 'error', 'mdi-alert-circle');
  } finally {
    exporting.value = false;
  }
};

const exportToCSV = async (data: any[]) => {
  const headers = ['ID', 'Cliente', 'Email', 'Servicio', 'Fecha', 'Estado', 'Precio'];
  const rows = data.map(r => [
    r.bookingId,
    r.clientName,
    r.clientEmail,
    r.serviceName,
    new Date(r.bookingDate).toLocaleDateString(),
    r.status,
    r.totalPrice
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reservas_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const exportToExcel = async (data: any[]) => {
  // Placeholder for Excel export
  console.log('Excel export not implemented yet');
  showNotification('Exportación a Excel próximamente', 'info', 'mdi-information');
};

const exportToPDF = async (data: any[]) => {
  // Placeholder for PDF export
  console.log('PDF export not implemented yet');
  showNotification('Exportación a PDF próximamente', 'info', 'mdi-information');
};

// Utility methods
const showNotification = (message: string, color: 'success' | 'error' | 'info' | 'warning', icon: string) => {
  snackbarText.value = message;
  snackbarColor.value = color;
  snackbarIcon.value = icon;
  showSnackbar.value = true;
};

const toggleTheme = () => {
  console.log('Toggle theme');
};

// Lifecycle
onMounted(async () => {
  rail.value = mdAndUp.value;
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

watch([() => filters.value.search, () => filters.value.status, () => filters.value.service], () => {
  currentPage.value = 1;
});

watch(filteredReservations, () => {
  selectedReservations.value = [];
});
</script>

<style scoped>
.all-reservations-layout {
  min-height: 100vh;
}

/* Page Header */
.page-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), rgba(var(--v-theme-primary), 0.02));
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
}

.page-subtitle {
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
  font-size: 1rem;
}

.quick-stats {
  display: flex;
  gap: 16px;
}

.stat-card {
  background: rgba(var(--v-theme-surface), 0.8);
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
  border-radius: 12px;
  padding: 16px;
  min-width: 80px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

/* Filters */
.filters-card {
  transition: all 0.3s ease;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
  margin: 0;
  display: flex;
  align-items: center;
}

.filters-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price-slider {
  margin-top: 8px;
}

.quick-filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-filters-label {
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-weight: 500;
}

.quick-filters-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* Analytics */
.analytics-header {
  margin-bottom: 16px;
}

.analytics-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
  margin: 0;
  display: flex;
  align-items: center;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.analytics-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
}

.analytics-label {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.analytics-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

/* Action Bar */
.action-bar {
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* Bulk Actions */
.selection-summary h3 {
  margin: 0 0 4px 0;
}

.bulk-actions {
  display: flex;
  gap: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 20px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .page-title {
    font-size: 1.5rem;
    flex-direction: column;
    text-align: center;
  }

  .quick-stats {
    justify-content: center;
    flex-wrap: wrap;
  }

  .filters-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .bulk-actions {
    flex-direction: column;
  }

  .stat-card {
    min-width: 70px;
    padding: 12px;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .quick-filters-chips {
    flex-direction: column;
  }

  .selection-summary {
    text-align: center;
  }
}
</style>
