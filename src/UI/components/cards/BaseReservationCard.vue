// src/components/cards/BaseReservationCard.vue (versión mejorada)
<template>
  <v-card :elevation="elevation" :border="border" :class="[
    'base-reservation-card',
    `border-${borderStyle}`,
    isPriority && 'is-priority',
    customClass
  ]" :rounded="rounded" v-bind="$attrs">
    <!-- Card Header Section -->
    <slot name="header">
      <v-card-item v-if="showDefaultHeader">
        <template v-slot:prepend v-if="showAvatar">
          <v-avatar :color="avatarColor" :size="avatarSize">
            <slot name="avatar-content">
              {{ getInitials(clientName) }}
            </slot>
          </v-avatar>
        </template>

        <v-card-title :class="['pb-0', titleClass]">
          {{ clientName }}
          <v-icon v-if="isPriority" icon="mdi-star" color="amber-darken-2" size="small" class="ml-2"></v-icon>
        </v-card-title>

        <v-card-subtitle v-if="email" class="text-truncate">
          <v-icon icon="mdi-email-outline" size="x-small" class="mr-1"></v-icon>
          {{ email }}
        </v-card-subtitle>
      </v-card-item>
    </slot>

    <!-- Card Content Section -->
    <slot name="content">
      <v-card-text v-if="service || $slots.default" class="pt-2">
        <!-- Service Tag -->
        <div v-if="service" class="d-flex flex-wrap gap-1 mb-3">
          <v-chip size="small" :color="getServiceColor(service)" :class="serviceChipClass">
            {{ service }}
          </v-chip>

          <v-chip v-if="isPriority" color="error" size="small" variant="outlined" class="font-weight-medium">
            {{ priorityLabel }}
          </v-chip>
        </div>

        <!-- Default content slot -->
        <slot></slot>

        <!-- Renderizar detalles generales si no hay contenido específico -->
        <div v-if="!$slots.default && hasDetails" class="dynamic-details">
          <div v-if="date" class="detail-item">
            <v-icon icon="mdi-calendar" size="small" :color="detailIconColor" class="mr-2"></v-icon>
            <span class="text-body-2">{{ date }}</span>
          </div>

          <div v-if="time" class="detail-item">
            <v-icon icon="mdi-clock-outline" size="small" :color="detailIconColor" class="mr-2"></v-icon>
            <span class="text-body-2">{{ time }}</span>
          </div>

          <div v-if="phone" class="detail-item">
            <v-icon icon="mdi-phone" size="small" :color="detailIconColor" class="mr-2"></v-icon>
            <span class="text-body-2">{{ phone }}</span>
          </div>

          <!-- Detectar y mostrar propiedades específicas del tipo de reserva -->
          <template v-if="reservation">
            <div v-if="reservation.flightNumber" class="detail-item">
              <v-icon icon="mdi-airplane" size="small" :color="detailIconColor" class="mr-2"></v-icon>
              <span class="text-body-2">Vuelo: {{ reservation.flightNumber }}</span>
            </div>

            <div v-if="reservation.vehicleType" class="detail-item">
              <v-icon icon="mdi-car" size="small" :color="detailIconColor" class="mr-2"></v-icon>
              <span class="text-body-2">{{ getVehicleType(reservation.vehicleType) }}</span>
            </div>

            <div v-if="reservation.childrenCount" class="detail-item">
              <v-icon icon="mdi-account-child" size="small" :color="detailIconColor" class="mr-2"></v-icon>
              <span class="text-body-2">
                {{ reservation.childrenCount }} {{ reservation.childrenCount === 1 ? 'niño' : 'niños' }}
              </span>
            </div>

            <div v-if="reservation.hasSpecialNeeds" class="detail-item special-needs">
              <v-icon icon="mdi-alert-circle" size="small" color="warning" class="mr-2"></v-icon>
              <span class="text-body-2">Necesidades especiales</span>
            </div>

            <div v-if="reservation.location" class="detail-item">
              <v-icon icon="mdi-map-marker" size="small" :color="detailIconColor" class="mr-2"></v-icon>
              <span class="text-body-2">{{ reservation.location }}</span>
            </div>

            <div v-if="reservation.deliveryAddress" class="detail-item">
              <v-icon icon="mdi-home-map-marker" size="small" :color="detailIconColor" class="mr-2"></v-icon>
              <span class="text-body-2">Entrega: {{ truncateText(reservation.deliveryAddress, 40) }}</span>
            </div>

            <div v-if="reservation.hasAllergies === 'yes'" class="detail-item allergy-warning">
              <v-icon icon="mdi-alert-circle" size="small" color="error" class="mr-2"></v-icon>
              <span class="text-body-2">¡Alergias! (Ver detalles)</span>
            </div>

            <div v-if="reservation.colors && reservation.colors.length > 0" class="detail-item">
              <v-icon icon="mdi-palette" size="small" :color="detailIconColor" class="mr-2"></v-icon>
              <span class="text-body-2">{{ reservation.colors.length }} colores seleccionados</span>
            </div>
          </template>

          <v-expand-transition>
            <div v-if="notes">
              <v-divider class="my-2"></v-divider>
              <div class="d-flex">
                <v-icon icon="mdi-message-text-outline" size="small" :color="detailIconColor"
                  class="mr-2 mt-1"></v-icon>
                <p class="text-body-2">{{ notes }}</p>
              </div>
            </div>
          </v-expand-transition>
        </div>
      </v-card-text>
    </slot>

    <!-- Divider before actions -->
    <v-divider v-if="$slots.actions"></v-divider>

    <!-- Card Actions Section -->
    <slot name="actions">
      <v-card-actions v-if="showTimeAgo || $slots.timeAgo || $slots['default-actions']" class="pa-2">
        <div v-if="showTimeAgo || $slots.timeAgo" class="d-flex align-center text-caption text-medium-emphasis">
          <slot name="timeAgo">
            <v-icon icon="mdi-clock-time-four-outline" size="x-small" class="mr-1"></v-icon>
            <span>{{ timeAgoPrefix }} {{ timeAgo }}</span>
          </slot>
        </div>

        <v-spacer></v-spacer>

        <slot name="default-actions">
          <v-btn v-if="onReject && onApprove" color="error" size="small" variant="text" @click="handleReject"
            :disabled="isProcessing" prepend-icon="mdi-close">
            Rechazar
          </v-btn>
          <v-btn v-if="onApprove" color="success" size="small" variant="tonal" @click="handleApprove"
            :disabled="isProcessing" prepend-icon="mdi-check">
            Aprobar
          </v-btn>
        </slot>
      </v-card-actions>
    </slot>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

// Props definition with improved typing
interface Props {
  clientName?: string;
  email?: string;
  service?: string;
  date?: string;
  time?: string;
  phone?: string;
  notes?: string;
  timeAgo?: string;
  timeAgoPrefix?: string;
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
  titleClass?: string;
  serviceChipClass?: string;
  detailIconColor?: string;
  showDefaultHeader?: boolean;
  showTimeAgo?: boolean;
  // Nueva prop para recibir el objeto de reserva completo
  reservation?: any;
  // Callbacks para acciones
  onApprove?: (id: string | number) => Promise<boolean>;
  onReject?: (id: string | number) => Promise<boolean>;
}

const props = withDefaults(defineProps<Props>(), {
  clientName: '',
  email: '',
  service: '',
  date: '',
  time: '',
  phone: '',
  notes: '',
  timeAgo: '',
  timeAgoPrefix: 'Solicitado',
  isPriority: false,
  priorityLabel: 'Prioritario',
  showAvatar: true,
  avatarSize: 48,
  avatarColor: 'primary',
  elevation: 0,
  border: true,
  borderStyle: 'standard',
  rounded: 'lg',
  customClass: '',
  titleClass: 'text-truncate d-flex align-center',
  serviceChipClass: 'text-white font-weight-medium',
  detailIconColor: 'primary',
  showDefaultHeader: true,
  showTimeAgo: true,
  reservation: () => ({}),
  onApprove: undefined,
  onReject: undefined
});

// Estado local
const isProcessing = ref(false);

// Emit definitions for common actions
const emit = defineEmits<{
  (e: 'approve'): void;
  (e: 'reject'): void;
  (e: 'view-details'): void;
}>();

// Computed properties
const hasDetails = computed(() => {
  return !!(props.date || props.time || props.phone || props.notes ||
    (props.reservation && Object.keys(props.reservation).length > 0));
});

// Mapa de tipos de vehículos
const vehicleTypes = {
  'vanSmall': 'Van Pequeña (1-6 personas)',
  'vanMedium': 'Van Mediana (7-10 personas)',
  'vanLarge': 'Van Grande (11-16 personas)',
  'suv': 'SUV (1-6 personas)'
};

// Mapa de colores de servicio
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
};

// Utility methods
function getInitials(name: string): string {
  if (!name) return '';

  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

function getServiceColor(service: string): string {
  return serviceColors[service as keyof typeof serviceColors] || 'primary';
}

function getVehicleType(type: string): string {
  return vehicleTypes[type as keyof typeof vehicleTypes] || type;
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Handlers para acciones
async function handleApprove() {
  if (isProcessing.value || !props.onApprove) return;

  isProcessing.value = true;
  try {
    const id = props.reservation?.id || '';
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

async function handleReject() {
  if (isProcessing.value || !props.onReject) return;

  isProcessing.value = true;
  try {
    const id = props.reservation?.id || '';
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
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.base-reservation-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(var(--v-theme-on-surface), 0.08) !important;
}

.border-left {
  border-left: 4px solid rgba(var(--v-theme-primary), 0.7) !important;
}

.border-left.is-priority {
  border-left: 4px solid rgb(var(--v-theme-error)) !important;
}

.is-priority {
  position: relative;
}

.detail-item {
  position: relative;
  padding: 6px 0;
  display: flex;
  align-items: flex-start;
}

.detail-item:not(:last-child) {
  border-bottom: 1px dashed rgba(var(--v-theme-on-surface), 0.08);
}

.special-needs,
.allergy-warning {
  background-color: rgba(var(--v-theme-warning), 0.1);
  border-radius: 6px;
  padding: 6px 8px !important;
  margin: 4px 0;
}

.allergy-warning {
  background-color: rgba(var(--v-theme-error), 0.1);
}

.dynamic-details {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  margin-top: 12px;
}

/* Make sure component works well in both light and dark themes */
:deep(.v-theme--dark) .detail-item:not(:last-child) {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}
</style>
