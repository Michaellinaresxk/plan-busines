<template>
  <v-app class="mobile-pending-app">
    <v-layout class="mobile-layout">
      <!-- Mobile-optimized Sidebar -->
      <DashboardSidebar
        v-if="showSidebar"
        v-model:drawer="drawer"
        v-model:rail="rail"
        :mdAndUp="mdAndUp"
        :pendingCount="filteredReservations.length" />

      <!-- Main Content -->
      <v-main class="mobile-main">
        <!-- Mobile-optimized Header -->
        <DashboardHeader
          :mdAndUp="mdAndUp"
          v-model:drawer="drawer"
          v-model:rail="rail"
          @toggle-theme="toggleTheme"
          class="mobile-header" />

        <div class="mobile-container">
          <!-- 📱 MOBILE HERO SECTION -->
          <div class="mobile-hero-section">
            <v-card class="hero-card" rounded="xl" elevation="0" border>
              <v-card-text class="hero-content pa-6">
                <div class="hero-layout">
                  <div class="hero-icon">
                    <v-icon icon="mdi-calendar-clock" size="32" color="primary"></v-icon>
                  </div>
                  <div class="hero-text">
                    <h1 class="hero-title">Reservaciones Pendientes</h1>
                    <p class="hero-subtitle">Gestiona las solicitudes de reserva</p>
                  </div>
                  <div class="hero-badge">
                    <v-chip color="primary" size="large" class="count-chip">
                      {{ filteredReservations.length }}
                    </v-chip>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- 📱 MOBILE SEARCH & FILTERS -->
          <div class="mobile-search-section">
            <!-- Quick Search -->
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Buscar reservaciones"
              hide-details
              variant="outlined"
              density="comfortable"
              class="mobile-search"
              @update:model-value="handleSearch"
              clearable
              rounded>
            </v-text-field>

            <!-- Filter Actions -->
            <div class="mobile-filter-actions">
              <v-btn
                prepend-icon="mdi-refresh"
                color="primary"
                variant="tonal"
                :loading="loading"
                @click="refreshData"
                class="refresh-btn">
                Actualizar
              </v-btn>

              <v-btn
                color="primary"
                prepend-icon="mdi-filter-variant"
                @click="showFilterDialog = true"
                class="filter-btn">
                Filtros
                <v-chip
                  v-if="hasActiveFilters"
                  size="x-small"
                  color="white"
                  class="ml-2 filter-count">
                  {{ activeFiltersCount }}
                </v-chip>
              </v-btn>
            </div>

            <!-- Quick Filters Chips -->
            <div class="quick-filters" v-if="hasActiveFilters">
              <v-chip
                v-if="filters.serviceCategory !== 'all'"
                closable
                size="small"
                color="primary"
                variant="tonal"
                @click:close="filters.serviceCategory = 'all'; applyFilters()"
                class="filter-chip">
                {{ serviceCategoryOptions.find(opt => opt.value === filters.serviceCategory)?.title }}
              </v-chip>

              <v-chip
                v-if="filters.onlyPriority"
                closable
                size="small"
                color="error"
                variant="tonal"
                @click:close="filters.onlyPriority = false; applyFilters()"
                class="filter-chip">
                Prioritarias
              </v-chip>

              <v-chip
                v-if="filters.onlyNewClients"
                closable
                size="small"
                color="info"
                variant="tonal"
                @click:close="filters.onlyNewClients = false; applyFilters()"
                class="filter-chip">
                Clientes Nuevos
              </v-chip>
            </div>
          </div>

          <!-- 📱 MOBILE RESERVATIONS LIST -->
          <div class="mobile-reservations-section">
            <ReservationsList
              :reservations="paginatedReservations"
              :loading="loading"
              v-model:current-page="currentPage"
              :items-per-page="itemsPerPage"
              @refresh="refreshData"
              @approve="handleApprove"
              @reject="handleReject"
              @view-details="openReservationDetails"
              empty-state-message="No hay reservaciones pendientes que coincidan con tus criterios de búsqueda."
              empty-state-title="Sin reservaciones pendientes"
              empty-state-icon="mdi-calendar-check"
              class="mobile-list" />

            <!-- Mobile Pagination -->
            <div v-if="totalPages > 1" class="mobile-pagination">
              <v-pagination
                v-model="currentPage"
                :length="totalPages"
                :total-visible="mdAndUp ? 7 : 5"
                rounded="circle"
                color="primary"
                :disabled="loading"
                class="pagination-component">
              </v-pagination>
            </div>
          </div>
        </div>
      </v-main>

      <!-- 📱 MOBILE FILTER BOTTOM SHEET -->
      <v-bottom-sheet v-model="showFilterDialog" inset>
        <v-card rounded="t-xl" class="filter-sheet">
          <v-card-text class="pa-4">
            <!-- Handle -->
            <div class="sheet-handle"></div>

            <!-- Header -->
            <div class="sheet-header">
              <v-icon icon="mdi-filter-variant" color="primary" class="mr-3"></v-icon>
              <h3 class="sheet-title">Filtrar Reservaciones</h3>
            </div>

            <!-- Filter Content -->
            <div class="filter-content">
              <v-select
                v-model="filters.serviceCategory"
                label="Categoría de Servicio"
                :items="serviceCategoryOptions"
                variant="outlined"
                class="mb-4 filter-field">
              </v-select>

              <v-select
                v-model="filters.dateRange"
                label="Rango de Fecha"
                :items="dateRangeOptions"
                variant="outlined"
                class="mb-4 filter-field">
              </v-select>

              <div class="checkbox-group">
                <v-checkbox
                  v-model="filters.onlyPriority"
                  label="Solo reservaciones prioritarias"
                  color="error"
                  class="priority-check">
                </v-checkbox>

                <v-checkbox
                  v-model="filters.onlyNewClients"
                  label="Solo clientes nuevos"
                  color="info"
                  class="newclient-check">
                </v-checkbox>
              </div>
            </div>

            <!-- Actions -->
            <div class="sheet-actions">
              <v-btn
                color="secondary"
                variant="tonal"
                @click="resetFilters"
                block
                class="mb-3 reset-btn">
                <v-icon icon="mdi-refresh" class="mr-2"></v-icon>
                Reiniciar Filtros
              </v-btn>
              <v-btn
                color="primary"
                @click="applyFilters"
                block
                class="apply-btn">
                <v-icon icon="mdi-check" class="mr-2"></v-icon>
                Aplicar Filtros
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-bottom-sheet>

      <!-- Mobile Snackbar -->
      <v-snackbar
        v-model="showSnackbar"
        :color="snackbarColor"
        location="bottom"
        rounded="pill"
        timeout="4000"
        class="mobile-snackbar">
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
import { useRouter } from 'vue-router';
import ReservationsList from '@/UI/components/reservation/ReservationsList.vue';
import DashboardHeader from '@/UI/components/dashboard/DashboardHeader.vue';
import DashboardSidebar from '@/UI/components/dashboard/DashboardSidebar.vue';
import { ReservationService, ServiceType } from '@/services/ReservationServiceFactory';
import { reservationServiceKey } from '@/services/ReservationService';

// Dependencies
const { mdAndUp } = useDisplay();
const router = useRouter();

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
    console.log('Fetching pending reservations from Firebase...');
    const pendingReservations = await reservationService.getPendingReservations();
    reservations.value = pendingReservations;

    console.log(`Loaded ${pendingReservations.length} pending reservations from Firebase`);
    showNotification(
      `${pendingReservations.length} reservaciones cargadas desde Firebase`,
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

// 🎯 Navegación a vista de detalles (como en el dashboard)
function openReservationDetails(reservation) {
  console.log(`Navigating to reservation details: ${reservation.bookingId}`);
  router.push({
    name: 'ReservationDetails',
    params: { id: reservation.bookingId }
  });
}

async function handleApprove(id: string, reservation) {
  try {
    console.log(`Approving reservation ${id}...`);
    await reservationService.approveReservation(id);

    const index = reservations.value.findIndex(r => r.bookingId === id);
    if (index !== -1) {
      reservations.value.splice(index, 1);
    }

    showNotification(`Reservación de ${reservation.clientName} aprobada con éxito`, 'success', 'mdi-check-circle');
  } catch (error) {
    console.error('Error approving reservation:', error);
    showNotification('Error al aprobar la reservación', 'error', 'mdi-alert-circle');
  }
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
  console.log('PendingReservationsView mounted, loading data...');
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
/* 📱 MOBILE-FIRST RESPONSIVE DESIGN */

.mobile-pending-app {
  background: rgb(var(--v-theme-background));
}

.mobile-layout {
  min-height: 100vh;
}

.mobile-main {
  background: linear-gradient(135deg,
    rgba(var(--v-theme-primary), 0.02) 0%,
    rgba(var(--v-theme-background), 1) 100%);
}

.mobile-container {
  padding: 16px;
  padding-bottom: 24px;
  max-width: 100%;
}

/* 🎯 Mobile Hero Section */
.mobile-hero-section {
  margin-bottom: 20px;
}

.hero-card {
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.hero-content {
  position: relative;
}

.hero-layout {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-icon {
  width: 56px;
  height: 56px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-text {
  flex: 1;
  min-width: 0;
}

.hero-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.hero-subtitle {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
  line-height: 1.4;
}

.hero-badge {
  flex-shrink: 0;
}

.count-chip {
  font-size: 1.1rem;
  font-weight: 700;
  height: 40px;
  min-width: 50px;
}

/* 🔍 Mobile Search Section */
.mobile-search-section {
  margin-bottom: 20px;
}

.mobile-search {
  margin-bottom: 16px;
}

.mobile-search :deep(.v-field) {
  border-radius: 16px;
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(10px);
}

.mobile-filter-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.refresh-btn {
  flex: 1;
  text-transform: none;
  border-radius: 12px;
  font-weight: 600;
}

.filter-btn {
  flex: 1;
  text-transform: none;
  border-radius: 12px;
  font-weight: 600;
}

.filter-count {
  background: rgba(255, 255, 255, 0.2) !important;
}

.quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  text-transform: none;
  border-radius: 12px;
}

/* 📋 Mobile Reservations Section */
.mobile-reservations-section {
  margin-bottom: 20px;
}

.mobile-list :deep(.v-card) {
  border-radius: 16px;
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.mobile-list :deep(.v-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.mobile-pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 16px;
  background: rgba(var(--v-theme-surface), 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
}

.pagination-component :deep(.v-pagination__item) {
  border-radius: 12px;
  min-width: 40px;
  height: 40px;
}

/* 📱 Bottom Sheet Styles */
.filter-sheet {
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(20px);
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: rgba(var(--v-theme-on-surface), 0.3);
  border-radius: 2px;
  margin: 0 auto 20px auto;
}

.sheet-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.sheet-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin: 0;
}

.filter-content {
  margin-bottom: 24px;
}

.filter-field :deep(.v-field) {
  border-radius: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.checkbox-group {
  background: rgba(var(--v-theme-surface-variant), 0.2);
  border-radius: 12px;
  padding: 16px;
}

.priority-check :deep(.v-checkbox) {
  margin-bottom: 8px;
}

.sheet-actions {
  padding-top: 16px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.reset-btn,
.apply-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 12px;
  height: 48px;
}

/* 🔔 Mobile Snackbar */
.mobile-snackbar {
  margin-bottom: 16px;
}

.mobile-snackbar :deep(.v-snackbar__wrapper) {
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

/* 📱 RESPONSIVE BREAKPOINTS */

/* Extra small phones (320px - 359px) */
@media (max-width: 359px) {
  .mobile-container {
    padding: 12px;
  }

  .hero-layout {
    gap: 12px;
  }

  .hero-icon {
    width: 48px;
    height: 48px;
  }

  .hero-title {
    font-size: 1.1rem;
  }

  .mobile-filter-actions {
    flex-direction: column;
  }

  .refresh-btn,
  .filter-btn {
    flex: none;
  }
}

/* Small phones (360px - 399px) */
@media (min-width: 360px) and (max-width: 399px) {
  .mobile-container {
    padding: 14px;
  }

  .count-chip {
    font-size: 1rem;
    height: 36px;
  }
}

/* Medium phones (400px - 479px) */
@media (min-width: 400px) and (max-width: 479px) {
  .mobile-container {
    padding: 16px;
  }

  .hero-layout {
    gap: 18px;
  }
}

/* Large phones (480px - 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .mobile-container {
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
  }

  .hero-card {
    padding: 24px;
  }

  .hero-layout {
    gap: 20px;
  }

  .hero-icon {
    width: 64px;
    height: 64px;
  }

  .hero-title {
    font-size: 1.4rem;
  }
}

/* Tablets (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .mobile-container {
    padding: 24px;
    max-width: 800px;
    margin: 0 auto;
  }

  .mobile-search-section {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 16px;
    align-items: start;
  }

  .mobile-search {
    margin-bottom: 0;
  }

  .mobile-filter-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 0;
  }

  .refresh-btn,
  .filter-btn {
    flex: none;
    min-width: 120px;
  }

  .quick-filters {
    grid-column: 1 / -1;
    margin-top: 16px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .mobile-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px;
  }

  .hero-card {
    padding: 32px;
  }

  .hero-title {
    font-size: 1.6rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }
}

/* Dark mode optimizations */
@media (prefers-color-scheme: dark) {
  .hero-card,
  .mobile-list :deep(.v-card) {
    background: rgba(var(--v-theme-surface), 0.9);
    border-color: rgba(var(--v-theme-on-surface), 0.15);
  }

  .mobile-search :deep(.v-field),
  .filter-field :deep(.v-field) {
    background: rgba(var(--v-theme-surface), 0.9);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .mobile-list :deep(.v-card),
  .mobile-search :deep(.v-field),
  .refresh-btn,
  .filter-btn {
    transition: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .hero-card,
  .mobile-list :deep(.v-card) {
    border-width: 2px;
  }

  .quick-filters .filter-chip {
    border: 1px solid currentColor;
  }
}

/* Landscape orientation adjustments */
@media (orientation: landscape) and (max-height: 500px) {
  .hero-card {
    padding: 16px;
  }

  .hero-layout {
    gap: 12px;
  }

  .hero-icon {
    width: 48px;
    height: 48px;
  }

  .mobile-container {
    padding: 12px;
  }
}
</style>
