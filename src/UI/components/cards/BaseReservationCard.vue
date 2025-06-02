<!-- src/UI/components/cards/BaseReservationCard.vue - Optimizada para altura consistente -->
<template>
  <v-card :elevation="elevation" :border="border" :class="[
    'base-reservation-card',
    `border-${borderStyle}`,
    isPriority && 'is-priority',
    customClass
  ]" :rounded="rounded" v-bind="$attrs" @click="handleCardClick">
    <!-- Card Header - Información principal -->
    <v-card-item class="card-header">
      <!-- Avatar -->
      <template v-slot:prepend v-if="showAvatar">
        <v-avatar :color="avatarColor" :size="avatarSize">
          <slot name="avatar-content">
            {{ getInitials(clientName) }}
          </slot>
        </v-avatar>
      </template>

      <!-- Título con nombre del cliente -->
      <v-card-title class="card-title">
        <span class="client-name">{{ clientName }}</span>
        <v-icon v-if="isPriority" icon="mdi-star" color="amber-darken-2" size="small" class="priority-icon"></v-icon>
      </v-card-title>

      <!-- Email -->
      <v-card-subtitle v-if="email" class="card-email">
        <v-icon icon="mdi-email-outline" size="x-small" class="email-icon"></v-icon>
        <span class="email-text">{{ email }}</span>
      </v-card-subtitle>
    </v-card-item>

    <!-- Card Content - Solo información esencial -->
    <v-card-text class="card-content">
      <!-- Servicio - Siempre visible si existe -->
      <div v-if="service" class="service-section">
        <v-chip size="small" :color="getServiceColor(service)" :class="serviceChipClass" class="service-chip">
          {{ service }}
        </v-chip>
        <v-chip v-if="isPriority" color="error" size="small" variant="outlined" class="priority-chip">
          {{ priorityLabel }}
        </v-chip>
      </div>

      <!-- Información principal en una sola línea -->
      <div class="main-info">
        <!-- Fecha -->
        <div v-if="date" class="info-item">
          <v-icon icon="mdi-calendar" size="small" class="info-icon"></v-icon>
          <span class="info-text">{{ formatDate(date) }}</span>
        </div>

        <!-- Hora -->
        <div v-if="time" class="info-item">
          <v-icon icon="mdi-clock-outline" size="small" class="info-icon"></v-icon>
          <span class="info-text">{{ time }}</span>
        </div>
      </div>

      <!-- Slot para contenido personalizado (opcional) -->
      <slot name="extra-content"></slot>
    </v-card-text>

    <!-- Actions - Solo si son necesarias -->
    <v-card-actions v-if="showActions" class="card-actions">
      <v-spacer></v-spacer>

      <v-btn v-if="onReject" color="error" size="small" variant="text" @click.stop="handleReject"
        :disabled="isProcessing" icon="mdi-close"></v-btn>

      <v-btn v-if="onApprove" color="success" size="small" variant="tonal" @click.stop="handleApprove"
        :disabled="isProcessing" icon="mdi-check"></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Props simplificadas para información esencial
interface Props {
  clientName?: string;
  email?: string;
  service?: string;
  date?: string;
  time?: string;
  isPriority?: boolean;
  priorityLabel?: string;
  showAvatar?: boolean;
  avatarSize?: number;
  avatarColor?: string;
  elevation?: number | string;
  border?: boolean;
  borderStyle?: 'standard' | 'left' | 'none';
  rounded?: string;
  customClass?: string;
  serviceChipClass?: string;
  showActions?: boolean;
  enableNavigation?: boolean;
  reservation?: any;
  onApprove?: (id: string | number) => Promise<boolean>;
  onReject?: (id: string | number) => Promise<boolean>;
}

const props = withDefaults(defineProps<Props>(), {
  clientName: '',
  email: '',
  service: '',
  date: '',
  time: '',
  isPriority: false,
  priorityLabel: 'Prioritario',
  showAvatar: true,
  avatarSize: 40,
  avatarColor: 'primary',
  elevation: 0,
  border: true,
  borderStyle: 'standard',
  rounded: 'lg',
  customClass: '',
  serviceChipClass: 'text-white font-weight-medium',
  showActions: false, // Por defecto false para mantener altura consistente
  enableNavigation: true,
  reservation: () => ({}),
  onApprove: undefined,
  onReject: undefined
});

const isProcessing = ref(false);

const emit = defineEmits<{
  (e: 'approve'): void;
  (e: 'reject'): void;
  (e: 'card-click'): void;
}>();

// Mapa de colores de servicio optimizado
const serviceColors = {
  'Corte de cabello': 'indigo',
  'Manicura': 'pink',
  'Pedicura': 'teal',
  'Masaje': 'purple',
  'Tinte': 'blue',
  'Tratamiento facial': 'cyan',
  'Transporte aeropuerto': 'blue-darken-2',
  'Niñera': 'deep-purple',
  'Decoración': 'amber-darken-2',
  'Compras': 'green',
  'Yoga': 'teal',
  'Chef privado': 'orange'
} as const;

// Utility functions
function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2); // Máximo 2 letras
}

function getServiceColor(service: string): string {
  return serviceColors[service as keyof typeof serviceColors] || 'primary';
}

function formatDate(date: string): string {
  if (!date) return '';

  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  } catch {
    return date; // Fallback al formato original
  }
}

// Event handlers
function handleCardClick(): void {
  if (props.enableNavigation) {
    const reservationId = props.reservation?.bookingId || props.reservation?.id;

    if (reservationId) {
      router.push(`/reservation/${reservationId}`);
    }
  }

  emit('card-click');
}

async function handleApprove(): Promise<void> {
  if (isProcessing.value || !props.onApprove) return;

  isProcessing.value = true;
  try {
    const id = props.reservation?.id || props.reservation?.bookingId || '';
    const result = await props.onApprove(id);
    if (result) {
      emit('approve');
    }
  } catch (error) {
    console.error('Error al aprobar la reserva:', error);
  } finally {
    isProcessing.value = false;
  }
}

async function handleReject(): Promise<void> {
  if (isProcessing.value || !props.onReject) return;

  isProcessing.value = true;
  try {
    const id = props.reservation?.id || props.reservation?.bookingId || '';
    const result = await props.onReject(id);
    if (result) {
      emit('reject');
    }
  } catch (error) {
    console.error('Error al rechazar la reserva:', error);
  } finally {
    isProcessing.value = false;
  }
}
</script>

<style scoped>
.base-reservation-card {
  /* Altura fija para consistencia */
  height: 160px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.base-reservation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-on-surface), 0.12) !important;
}

/* Header Section */
.card-header {
  flex-shrink: 0;
  padding: 12px 16px 8px 16px !important;
}

.card-title {
  font-size: 1rem !important;
  line-height: 1.2 !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  gap: 8px;
}

.client-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.priority-icon {
  flex-shrink: 0;
}

.card-email {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px !important;
  padding: 0 !important;
  opacity: 0.8;
}

.email-icon {
  flex-shrink: 0;
}

.email-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Content Section */
.card-content {
  flex: 1;
  padding: 8px 16px 12px 16px !important;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.service-section {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.service-chip {
  flex-shrink: 0;
}

.priority-chip {
  flex-shrink: 0;
  font-size: 0.75rem !important;
}

.main-info {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.info-icon {
  opacity: 0.7;
  color: rgb(var(--v-theme-primary));
}

.info-text {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
}

/* Actions Section */
.card-actions {
  flex-shrink: 0;
  padding: 8px 12px !important;
  min-height: auto !important;
}

/* Border Styles */
.border-left {
  border-left: 4px solid rgba(var(--v-theme-primary), 0.7) !important;
}

.border-left.is-priority {
  border-left: 4px solid rgb(var(--v-theme-error)) !important;
}

/* Priority styling */
.is-priority {
  background: linear-gradient(135deg,
      rgba(var(--v-theme-error), 0.02) 0%,
      rgba(var(--v-theme-surface), 1) 100%);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .base-reservation-card {
    height: 140px;
  }

  .card-header {
    padding: 10px 12px 6px 12px !important;
  }

  .card-content {
    padding: 6px 12px 10px 12px !important;
  }

  .main-info {
    gap: 12px;
  }
}

/* Dark theme adjustments */
:deep(.v-theme--dark) .info-icon {
  opacity: 0.8;
}
</style>
