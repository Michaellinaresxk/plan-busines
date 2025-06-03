<!-- src/UI/components/cards/BaseReservationCard.vue - Versión Optimizada y Moderna -->
<template>
  <v-card :elevation="elevation" :border="border" :class="[
    'base-reservation-card',
    `border-${borderStyle}`,
    isPriority && 'is-priority',
    customClass
  ]" :rounded="rounded" v-bind="$attrs" @click="handleCardClick">
    <!-- Header compacto con toda la info principal -->
    <v-card-item class="card-header">
      <!-- Avatar más pequeño -->
      <template v-slot:prepend v-if="showAvatar">
        <v-avatar :color="avatarColor" size="32" class="flex-shrink-0">
          <slot name="avatar-content">
            {{ getInitials(clientName) }}
          </slot>
        </v-avatar>
      </template>

      <!-- Info principal en layout horizontal compacto -->
      <div class="header-content">
        <!-- Primera línea: Nombre + Servicio + Prioridad -->
        <div class="header-main">
          <div class="client-info">
            <span class="client-name">{{ clientName }}</span>
            <v-icon v-if="isPriority" icon="mdi-star" color="amber-darken-2" size="14" class="priority-star" />
          </div>

          <v-chip v-if="service" size="x-small" :color="getServiceColor(service)" class="service-chip"
            density="compact">
            {{ service }}
          </v-chip>
        </div>

        <!-- Segunda línea: Email + Fecha/Hora en una sola línea -->
        <div class="header-secondary">
          <div v-if="email" class="email-info">
            <v-icon icon="mdi-email-outline" size="12" class="info-icon" />
            <span class="info-text">{{ email }}</span>
          </div>

          <div class="datetime-info">
            <div v-if="date" class="date-time-item">
              <v-icon icon="mdi-calendar" size="12" class="info-icon" />
              <span class="info-text">{{ formatDate(date) }}</span>
            </div>

            <div v-if="time" class="date-time-item">
              <v-icon icon="mdi-clock-outline" size="12" class="info-icon" />
              <span class="info-text">{{ time }}</span>
            </div>
          </div>
        </div>
      </div>
    </v-card-item>

    <!-- Content area para info específica del servicio -->
    <v-card-text v-if="$slots['extra-content']" class="card-content">
      <slot name="extra-content"></slot>
    </v-card-text>

    <!-- Actions minimalistas -->
    <v-card-actions v-if="showActions" class="card-actions">
      <v-spacer />

      <v-btn v-if="onReject" color="error" size="small" variant="text" @click.stop="handleReject"
        :disabled="isProcessing" icon="mdi-close" density="compact" />

      <v-btn v-if="onApprove" color="success" size="small" variant="tonal" @click.stop="handleApprove"
        :disabled="isProcessing" icon="mdi-check" density="compact" />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

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
  avatarSize: 32,
  avatarColor: 'primary',
  elevation: 0,
  border: true,
  borderStyle: 'standard',
  rounded: 'lg',
  customClass: '',
  serviceChipClass: '',
  showActions: false,
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

// Mapa de colores optimizado
const serviceColors = {
  'Corte de cabello': 'indigo',
  'Manicura': 'pink',
  'Pedicura': 'teal',
  'Masaje': 'purple',
  'Tinte': 'blue',
  'Tratamiento facial': 'cyan',
  'Transporte Aeropuerto': 'blue-darken-2',
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
    .slice(0, 2);
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
    return date;
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
  /* Altura más compacta pero adaptable */
  min-height: 120px;
  max-height: 160px;
  display: flex;
  flex-direction: column;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

.base-reservation-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(var(--v-theme-on-surface), 0.08) !important;
}

/* Header compacto */
.card-header {
  flex-shrink: 0;
  padding: 12px !important;
  min-height: auto !important;
}

.header-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  /* Para permitir truncation */
}

.header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.client-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.priority-star {
  flex-shrink: 0;
}

.service-chip {
  flex-shrink: 0;
  font-size: 0.7rem !important;
  height: 20px !important;
  color: white !important;
  font-weight: 500 !important;
}

.header-secondary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.75rem;
}

.email-info {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.datetime-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.date-time-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

.info-icon {
  opacity: 0.6;
  color: rgb(var(--v-theme-primary));
  flex-shrink: 0;
}

.info-text {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.75rem;
}

/* Content area */
.card-content {
  flex: 1;
  padding: 0 12px 8px 12px !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Actions */
.card-actions {
  flex-shrink: 0;
  padding: 6px 12px !important;
  min-height: auto !important;
}

/* Border styles */
.border-left {
  border-left: 3px solid rgba(var(--v-theme-primary), 0.7) !important;
}

.border-left.is-priority {
  border-left: 3px solid rgb(var(--v-theme-error)) !important;
}

/* Priority styling */
.is-priority {
  background: linear-gradient(135deg,
      rgba(var(--v-theme-error), 0.02) 0%,
      rgba(var(--v-theme-surface), 1) 100%);
}

.is-priority .client-name {
  color: rgb(var(--v-theme-error));
}

/* Responsive */
@media (max-width: 768px) {
  .base-reservation-card {
    min-height: 110px;
    max-height: 140px;
  }

  .card-header {
    padding: 10px !important;
  }

  .header-secondary {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .datetime-info {
    gap: 8px;
  }

  .client-name {
    font-size: 0.9rem;
  }

  .info-text {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .header-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .service-chip {
    align-self: flex-start;
  }
}

/* Dark theme */
:deep(.v-theme--dark) .base-reservation-card {
  background: rgb(var(--v-theme-surface-variant));
}

:deep(.v-theme--dark) .info-icon {
  opacity: 0.7;
}

/* Animation para loading states */
.base-reservation-card[disabled] {
  pointer-events: none;
  opacity: 0.6;
}

/* Mejoras para accesibilidad */
.base-reservation-card:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
</style>
