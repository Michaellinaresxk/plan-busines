<template>
  <div class="optimized-reservations-list">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <v-progress-circular
          indeterminate
          :color="loaderColor"
          :size="64"
          class="mb-4" />
        <h3 class="text-h6 mb-2">Cargando reservas...</h3>
        <p class="text-body-2 text-medium-emphasis">
          Obteniendo información actualizada
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <v-card
      v-else-if="!reservations || reservations.length === 0"
      class="empty-state-card"
      elevation="0"
      rounded="xl"
      border>
      <v-card-text class="empty-state-content">
        <slot name="empty-state">
          <div class="empty-state-icon">
            <v-avatar :color="emptyStateColor" size="80" class="mb-4">
              <v-icon :icon="emptyStateIcon" size="40" color="white" />
            </v-avatar>
          </div>

          <h3 class="text-h5 mb-3 text-center font-weight-bold">
            {{ emptyStateTitle }}
          </h3>

          <p class="text-medium-emphasis text-body-1 text-center mb-6 max-width-text">
            {{ emptyStateMessage }}
          </p>

          <slot name="empty-actions">
            <v-btn
              :color="emptyStateColor"
              prepend-icon="mdi-refresh"
              variant="flat"
              size="large"
              @click="$emit('refresh')"
              :loading="loading">
              {{ refreshButtonLabel }}
            </v-btn>
          </slot>
        </slot>
      </v-card-text>
    </v-card>

    <!-- Main Content -->
    <template v-else>
      <!-- Header slot para selección masiva, filtros, etc. -->
      <slot name="list-header"></slot>

      <!-- Grid de Reservas -->
      <div class="reservations-grid">
        <div
          v-for="(reservation, index) in displayedReservations"
          :key="getReservationKey(reservation, index)"
          class="reservation-item"
          :class="{ 'selected': isSelected(reservation) }"
          @click="handleReservationClick(reservation)">

          <!-- Checkbox de selección si está habilitado -->
          <div v-if="selectable" class="selection-overlay">
            <v-checkbox
              :model-value="isSelected(reservation)"
              color="success"
              hide-details
              @click.stop
              @update:model-value="toggleSelection(reservation)" />
          </div>

          <!-- Tarjeta de Reserva -->
          <BaseReservationCard
            :client-name="reservation.clientName"
            :email="reservation.clientEmail"
            :phone="reservation.clientPhone"
            :service="reservation.serviceName"
            :date="reservation.date"
            :time="reservation.time"
            :time-ago="reservation.timeAgo"
            :notes="reservation.notes"
            :price="reservation.totalPrice"
            :status="reservation.status"
            :is-priority="reservation.isPriority"
            :show-actions="showActions"
            :enable-navigation="enableNavigation"
            :reservation="reservation"
            :on-approve="onApprove"
            :on-reject="onReject"
            @approve="handleApprove"
            @reject="handleReject"
            @card-click="handleCardClick"
            @view-details="handleViewDetails">

            <!-- Slot para detalles específicos del servicio -->
            <template #service-details>
              <slot name="service-details" :reservation="reservation">
                <ServiceDetailsRenderer :reservation="reservation" />
              </slot>
            </template>
          </BaseReservationCard>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="showInternalPagination && totalInternalPages > 1" class="pagination-container">
        <v-pagination
          v-model="internalCurrentPage"
          :length="totalInternalPages"
          :total-visible="totalVisible"
          rounded="circle"
          :disabled="loading"
          :color="paginationColor"
          class="pagination-component" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import BaseReservationCard from '@/UI/components/cards/BaseReservationCard.vue';
import ServiceDetailsRender from '@/UI/components/reservation/ServiceDetailsRender.vue';

interface ColumnSize {
  cols: number;
  sm?: number;
  md?: number;
  lg?: number;
}

interface Props {
  reservations: any[];
  loading?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
  totalVisible?: number;
  showPagination?: boolean;
  paginationColor?: string;
  loaderColor?: string;
  // Estados de vacío
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  emptyStateIcon?: string;
  emptyStateColor?: string;
  refreshButtonLabel?: string;
  // Funcionalidad
  showActions?: boolean;
  enableNavigation?: boolean;
  selectable?: boolean;
  selectedReservations?: any[];
  // Callbacks
  onApprove?: (id: string | number) => Promise<boolean>;
  onReject?: (id: string | number) => Promise<boolean>;
  onViewDetails?: (reservation: any) => void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  currentPage: 1,
  itemsPerPage: 12,
  totalVisible: 7,
  showPagination: true,
  paginationColor: 'primary',
  loaderColor: 'primary',
  emptyStateTitle: 'No hay reservaciones',
  emptyStateMessage: 'No se encontraron reservaciones con los criterios actuales.',
  emptyStateIcon: 'mdi-calendar-check',
  emptyStateColor: 'primary',
  refreshButtonLabel: 'Actualizar datos',
  showActions: true,
  enableNavigation: true,
  selectable: false,
  selectedReservations: () => [],
  onApprove: undefined,
  onReject: undefined,
  onViewDetails: undefined
});

const emit = defineEmits<{
  (e: 'update:current-page', page: number): void;
  (e: 'update:selected-reservations', reservations: any[]): void;
  (e: 'refresh'): void;
  (e: 'approve', id: string | number, reservation: any): void;
  (e: 'reject', id: string | number, reservation: any): void;
  (e: 'view-details', reservation: any): void;
  (e: 'selection-change', selectedReservations: any[]): void;
}>();

// Estado local
const processingId = ref<string | number | null>(null);
const internalCurrentPage = ref(1);

// Computeds
const showInternalPagination = computed(() => {
  return props.showPagination && !props.currentPage;
});

const currentPageToUse = computed(() => {
  return showInternalPagination.value ? internalCurrentPage.value : props.currentPage;
});

const totalInternalPages = computed(() => {
  if (!props.reservations || props.reservations.length === 0) {
    return 1;
  }
  return Math.ceil(props.reservations.length / props.itemsPerPage);
});

const displayedReservations = computed(() => {
  if (!props.reservations || props.reservations.length === 0) {
    return [];
  }

  if (!props.showPagination) {
    return props.reservations;
  }

  const startIndex = (currentPageToUse.value - 1) * props.itemsPerPage;
  const endIndex = startIndex + props.itemsPerPage;
  return props.reservations.slice(startIndex, endIndex);
});

// Métodos de selección
function isSelected(reservation: any): boolean {
  if (!props.selectable) return false;
  const id = getReservationId(reservation);
  return props.selectedReservations?.some(r => getReservationId(r) === id) ?? false;
}

function toggleSelection(reservation: any): void {
  if (!props.selectable) return;

  const currentSelected = [...(props.selectedReservations || [])];
  const reservationId = getReservationId(reservation);
  const index = currentSelected.findIndex(r => getReservationId(r) === reservationId);

  if (index >= 0) {
    currentSelected.splice(index, 1);
  } else {
    currentSelected.push(reservation);
  }

  emit('update:selected-reservations', currentSelected);
  emit('selection-change', currentSelected);
}

// Métodos de utilidad
function getReservationKey(reservation: any, index: number): string {
  if (reservation.bookingId) return String(reservation.bookingId);
  if (reservation.id) return String(reservation.id);
  return `reservation-${index}`;
}

function getReservationId(reservation: any): string {
  return reservation.bookingId || reservation.id || '';
}

// Event handlers
function handleReservationClick(reservation: any): void {
  if (props.selectable) {
    toggleSelection(reservation);
  } else {
    handleViewDetails(reservation);
  }
}

async function handleApprove(id: string | number): Promise<boolean> {
  if (processingId.value !== null) return false;
  processingId.value = id;

  try {
    const reservation = props.reservations.find(r =>
      r.bookingId === id || r.id === id
    );

    if (props.onApprove) {
      const result = await props.onApprove(id);
      if (result && reservation) {
        emit('approve', id, reservation);
      }
      return result;
    } else {
      emit('approve', id, reservation);
      return true;
    }
  } catch (error) {
    console.error('Error al aprobar la reserva:', error);
    return false;
  } finally {
    processingId.value = null;
  }
}

async function handleReject(id: string | number): Promise<boolean> {
  if (processingId.value !== null) return false;
  processingId.value = id;

  try {
    const reservation = props.reservations.find(r =>
      r.bookingId === id || r.id === id
    );

    if (props.onReject) {
      const result = await props.onReject(id);
      if (result && reservation) {
        emit('reject', id, reservation);
      }
      return result;
    } else {
      emit('reject', id, reservation);
      return true;
    }
  } catch (error) {
    console.error('Error al rechazar la reserva:', error);
    return false;
  } finally {
    processingId.value = null;
  }
}

function handleViewDetails(reservation: any): void {
  if (props.onViewDetails) {
    props.onViewDetails(reservation);
  }
  emit('view-details', reservation);
}

function handleCardClick(reservation: any): void {
  // Este método se puede usar para lógica adicional de click
  console.log('Card clicked:', reservation);
}

// Watchers
watch(() => props.reservations, (newReservations) => {
  if (!newReservations || newReservations.length === 0) return;

  if (showInternalPagination.value) {
    const maxPages = Math.ceil(newReservations.length / props.itemsPerPage);
    if (internalCurrentPage.value > maxPages) {
      internalCurrentPage.value = 1;
    }
  }
}, { immediate: true });

watch(() => props.currentPage, (newPage) => {
  if (!showInternalPagination.value && newPage) {
    internalCurrentPage.value = newPage;
  }
});
</script>

<style scoped>
.optimized-reservations-list {
  min-height: 300px;
  width: 100%;
}

/* Loading State */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.loading-content {
  text-align: center;
  max-width: 300px;
}

/* Empty State */
.empty-state-card {
  margin: 2rem 0;
  background: linear-gradient(135deg,
    rgba(var(--v-theme-surface-variant), 0.3) 0%,
    rgba(var(--v-theme-surface), 1) 100%);
}

.empty-state-content {
  padding: 3rem 2rem !important;
  text-align: center;
}

.empty-state-icon {
  margin-bottom: 1rem;
}

.max-width-text {
  max-width: 400px;
  margin: 0 auto 1.5rem;
}

/* Grid de Reservas */
.reservations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 2rem;
}

.reservation-item {
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.reservation-item.selected {
  transform: scale(0.98);
}

.reservation-item.selected::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: linear-gradient(45deg,
    rgba(var(--v-theme-success), 0.3),
    rgba(var(--v-theme-success), 0.1));
  border-radius: 16px;
  z-index: 0;
  pointer-events: none;
}

.reservation-item.selected .base-reservation-card {
  position: relative;
  z-index: 1;
  border: 2px solid rgb(var(--v-theme-success));
  box-shadow: 0 8px 30px rgba(var(--v-theme-success), 0.2);
}

/* Selection Overlay */
.selection-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  padding: 2px;
  transition: all 0.2s ease;
}

.selection-overlay:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* Paginación */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding: 1rem 0;
}

.pagination-component {
  background: rgba(var(--v-theme-surface-variant), 0.2);
  border-radius: 50px;
  padding: 8px 16px;
  box-shadow: 0 2px 8px rgba(var(--v-theme-on-surface), 0.05);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .reservations-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .reservations-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .empty-state-content {
    padding: 2rem 1rem !important;
  }

  .loading-container {
    min-height: 300px;
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .reservations-grid {
    gap: 12px;
  }

  .selection-overlay {
    top: 8px;
    left: 8px;
  }

  .pagination-component {
    padding: 6px 12px;
  }
}

/* Dark Theme */
:deep(.v-theme--dark) .empty-state-card {
  background: linear-gradient(135deg,
    rgba(var(--v-theme-surface-variant), 0.5) 0%,
    rgba(var(--v-theme-surface), 1) 100%);
}

:deep(.v-theme--dark) .selection-overlay {
  background: rgb(var(--v-theme-surface-variant));
}

:deep(.v-theme--dark) .pagination-component {
  background: rgba(var(--v-theme-surface-variant), 0.4);
}

/* Animaciones mejoradas */
.reservation-item {
  animation: slideInUp 0.6s ease-out;
}

.reservation-item:nth-child(2) { animation-delay: 0.1s; }
.reservation-item:nth-child(3) { animation-delay: 0.2s; }
.reservation-item:nth-child(4) { animation-delay: 0.3s; }
.reservation-item:nth-child(5) { animation-delay: 0.4s; }
.reservation-item:nth-child(6) { animation-delay: 0.5s; }

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Estados de carga y procesamiento */
.reservation-item[data-processing="true"] {
  opacity: 0.7;
  pointer-events: none;
}

.reservation-item[data-processing="true"]::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: rgba(var(--v-theme-primary), 0.9);
  border-radius: 50%;
  z-index: 20;
}

/* Hover effects mejorados */
.reservation-item:hover:not(.selected) {
  transform: translateY(-2px);
}

.reservation-item:hover .selection-overlay {
  transform: scale(1.05);
}

/* Accesibilidad */
.reservation-item:focus-within {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 4px;
  border-radius: 12px;
}

/* Transiciones suaves para el grid */
.reservations-grid {
  transition: all 0.3s ease;
}

/* Estados especiales */
.reservation-item[data-priority="true"] {
  position: relative;
}

.reservation-item[data-priority="true"]::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg,
    rgba(var(--v-theme-error), 0.1),
    rgba(var(--v-theme-warning), 0.1));
  border-radius: 14px;
  z-index: 0;
  animation: priorityPulse 3s infinite;
}

@keyframes priorityPulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
}
</style>
