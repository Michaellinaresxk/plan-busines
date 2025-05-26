<template>
  <div class="reservation-list">
    <!-- Estado de carga -->
    <div v-if="loading" class="d-flex justify-center align-center py-8">
      <v-progress-circular indeterminate :color="loaderColor" :size="64"></v-progress-circular>
    </div>

    <!-- Sin resultados -->
    <v-card v-else-if="!reservations || reservations.length === 0"
      class="mb-6 pa-8 d-flex flex-column align-center justify-center" elevation="0" rounded="lg" border>
      <slot name="empty-state">
        <v-avatar :color="emptyStateColor" class="mb-4" size="64">
          <v-icon :icon="emptyStateIcon" size="36" color="white"></v-icon>
        </v-avatar>
        <h3 class="text-h5 mb-2 text-center">{{ emptyStateTitle }}</h3>
        <p class="text-medium-emphasis text-body-1 text-center mb-6">
          {{ emptyStateMessage }}
        </p>
        <slot name="empty-actions">
          <v-btn :color="emptyStateColor" prepend-icon="mdi-refresh" @click="$emit('refresh')" :loading="loading">
            {{ refreshButtonLabel }}
          </v-btn>
        </slot>
      </slot>
    </v-card>

    <!-- Lista de reservaciones -->
    <template v-else>
      <slot name="list-header"></slot>

      <v-row>
        <v-col v-for="(reservation, index) in displayedReservations" :key="getReservationKey(reservation, index)"
          :cols="colSize.cols" :sm="colSize.sm" :md="colSize.md" :lg="colSize.lg">
          <ReservationCardFactory :reservation="reservation" :onApprove="handleApprove" :onReject="handleReject"
            @view-details="handleViewDetails" @approve="handleApprove" @reject="handleReject" />
        </v-col>
      </v-row>

      <!-- Paginación interna del componente -->
      <div v-if="showInternalPagination && totalInternalPages > 1" class="d-flex justify-center mt-6">
        <v-pagination v-model="internalCurrentPage" :length="totalInternalPages" :total-visible="totalVisible"
          rounded="circle" :disabled="loading" :color="paginationColor"></v-pagination>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ReservationCardFactory from '@/UI/components/cards/ReservationCardFactory.vue';

// Definir el tipo para los tamaños de columna
interface ColumnSize {
  cols: number;
  sm?: number;
  md?: number;
  lg?: number;
}

// Props del componente
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
  // Configuración de columnas
  colSize?: ColumnSize;
  // Callbacks para acciones
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
  colSize: () => ({ cols: 12, sm: 6, md: 4, lg: 3 }),
  onApprove: undefined,
  onReject: undefined,
  onViewDetails: undefined
});

// Eventos
const emit = defineEmits<{
  (e: 'update:current-page', page: number): void;
  (e: 'refresh'): void;
  (e: 'approve', id: string | number, reservation: any): void;
  (e: 'reject', id: string | number, reservation: any): void;
  (e: 'view-details', reservation: any): void;
}>();

// Estado local para paginación interna
const processingId = ref<string | number | null>(null);
const internalCurrentPage = ref(1);

// Determinar si usar paginación externa o interna
const showInternalPagination = computed(() => {
  // Si el componente padre no maneja paginación (no hay v-model:current-page), usar paginación interna
  return props.showPagination && !props.currentPage;
});

const currentPageToUse = computed(() => {
  return showInternalPagination.value ? internalCurrentPage.value : props.currentPage;
});

// Calcular número total de páginas
const totalInternalPages = computed(() => {
  if (!props.reservations || props.reservations.length === 0) {
    return 1;
  }
  return Math.ceil(props.reservations.length / props.itemsPerPage);
});

// Obtener las reservaciones a mostrar (con o sin paginación)
const displayedReservations = computed(() => {
  if (!props.reservations || props.reservations.length === 0) {
    return [];
  }

  // Si no hay paginación, mostrar todas
  if (!props.showPagination) {
    return props.reservations;
  }

  // Aplicar paginación
  const startIndex = (currentPageToUse.value - 1) * props.itemsPerPage;
  const endIndex = startIndex + props.itemsPerPage;
  return props.reservations.slice(startIndex, endIndex);
});

// Métodos
function getReservationKey(reservation: any, index: number): string {
  // Usar bookingId primero, luego id, luego índice como fallback
  if (reservation.bookingId) return String(reservation.bookingId);
  if (reservation.id) return String(reservation.id);
  return `reservation-${index}`;
}

// Manejadores para las acciones
async function handleApprove(id: string | number): Promise<boolean> {
  if (processingId.value !== null) return false;
  processingId.value = id;

  try {
    // Buscar la reserva usando tanto bookingId como id
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
    // Buscar la reserva usando tanto bookingId como id
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

function handleViewDetails(reservation: any) {
  if (props.onViewDetails) {
    props.onViewDetails(reservation);
  }

  emit('view-details', reservation);
}

// Watchers
watch(() => props.reservations, (newReservations) => {
  if (!newReservations || newReservations.length === 0) return;

  // Si estamos usando paginación interna, ajustar página si es necesario
  if (showInternalPagination.value) {
    const maxPages = Math.ceil(newReservations.length / props.itemsPerPage);
    if (internalCurrentPage.value > maxPages) {
      internalCurrentPage.value = 1;
    }
  }
}, { immediate: true });

// Sincronizar paginación externa con interna si es necesario
watch(() => props.currentPage, (newPage) => {
  if (!showInternalPagination.value && newPage) {
    internalCurrentPage.value = newPage;
  }
});
</script>

<style scoped>
.reservation-list {
  min-height: 200px;
}
</style>
