<!-- Versión optimizada con mejor espaciado y alineación -->
<template>
  <v-card
    :elevation="elevation"
    :border="border"
    :class="cardClasses"
    :rounded="rounded"
    v-bind="$attrs"
    @click="handleCardClick">

    <!-- Header Principal -->
    <div class="card-header">
      <!-- Avatar y Info Principal -->
      <div class="header-top">
        <v-avatar
          v-if="showAvatar"
          :color="avatarColor"
          size="40"
          class="header-avatar">
          <slot name="avatar-content">
            {{ getInitials(clientName) }}
          </slot>
        </v-avatar>

        <div class="header-info">
          <div class="name-priority-row">
            <h3 class="client-name">{{ clientName }}</h3>
            <v-icon
              v-if="isPriority"
              icon="mdi-star"
              color="amber-darken-2"
              size="16"
              class="priority-icon" />
          </div>

          <div class="service-row">
            <v-chip
              v-if="service"
              :color="getServiceColor(service)"
              size="small"
              class="service-chip"
              density="comfortable">
              <v-icon
                :icon="getServiceIcon(service)"
                size="14"
                class="me-1" />
              {{ service }}
            </v-chip>
          </div>
        </div>
      </div>

      <!-- Información de Contacto -->
      <div class="contact-section">
        <div v-if="email" class="contact-item">
          <v-icon icon="mdi-email-outline" size="14" class="contact-icon" />
          <span class="contact-text">{{ truncateEmail(email) }}</span>
        </div>

        <div v-if="phone" class="contact-item">
          <v-icon icon="mdi-phone" size="14" class="contact-icon" />
          <span class="contact-text">{{ phone }}</span>
        </div>
      </div>
    </div>

    <!-- Separador visual -->
    <v-divider class="mx-4" />

    <!-- Información de Fecha y Hora -->
    <div class="datetime-section">
      <div v-if="date" class="datetime-item">
        <v-icon icon="mdi-calendar" size="16" color="primary" />
        <div class="datetime-content">
          <span class="datetime-label">Fecha</span>
          <span class="datetime-value">{{ formatDate(date) }}</span>
        </div>
      </div>

      <div v-if="time" class="datetime-item">
        <v-icon icon="mdi-clock-outline" size="16" color="primary" />
        <div class="datetime-content">
          <span class="datetime-label">Hora</span>
          <span class="datetime-value">{{ time }}</span>
        </div>
      </div>

      <div v-if="timeAgo" class="datetime-item">
        <v-icon icon="mdi-clock-time-four" size="16" color="success" />
        <div class="datetime-content">
          <span class="datetime-label">Solicitado</span>
          <span class="datetime-value">{{ timeAgo }}</span>
        </div>
      </div>
    </div>

    <!-- Contenido Específico del Servicio -->
    <div v-if="$slots['service-details']" class="service-details-section">
      <v-divider class="mx-4 mb-3" />
      <slot name="service-details"></slot>
    </div>

    <!-- Notas si existen -->
    <div v-if="notes" class="notes-section">
      <v-divider class="mx-4 mb-3" />
      <div class="notes-content">
        <v-icon icon="mdi-note-text" size="14" color="info" class="notes-icon" />
        <p class="notes-text">{{ truncateText(notes, 80) }}</p>
      </div>
    </div>

    <!-- Información de Precio -->
    <div v-if="price" class="price-section">
      <div class="price-content">
        <span class="price-label">Total</span>
        <span class="price-value">${{ formatPrice(price) }}</span>
      </div>
    </div>

    <!-- Actions -->
    <v-card-actions v-if="showActions" class="card-actions">
      <v-spacer />

      <v-btn
        v-if="onReject"
        color="error"
        size="small"
        variant="outlined"
        @click.stop="handleReject"
        :disabled="isProcessing"
        prepend-icon="mdi-close"
        class="action-btn">
        Rechazar
      </v-btn>

      <v-btn
        v-if="onApprove"
        color="success"
        size="small"
        variant="flat"
        @click.stop="handleApprove"
        :disabled="isProcessing"
        prepend-icon="mdi-check"
        class="action-btn">
        Aprobar
      </v-btn>
    </v-card-actions>

    <!-- Status Badge -->
    <div v-if="status" class="status-badge">
      <v-chip
        :color="getStatusColor(status)"
        size="x-small"
        class="status-chip">
        {{ getStatusText(status) }}
      </v-chip>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

interface Props {
  clientName?: string;
  email?: string;
  phone?: string;
  service?: string;
  date?: string;
  time?: string;
  timeAgo?: string;
  notes?: string;
  price?: number;
  status?: string;
  isPriority?: boolean;
  showAvatar?: boolean;
  avatarColor?: string;
  elevation?: number | string;
  border?: boolean;
  borderStyle?: 'standard' | 'left' | 'none';
  rounded?: string;
  customClass?: string;
  showActions?: boolean;
  enableNavigation?: boolean;
  reservation?: any;
  onApprove?: (id: string | number) => Promise<boolean>;
  onReject?: (id: string | number) => Promise<boolean>;
}

const props = withDefaults(defineProps<Props>(), {
  clientName: '',
  email: '',
  phone: '',
  service: '',
  date: '',
  time: '',
  timeAgo: '',
  notes: '',
  price: 0,
  status: '',
  isPriority: false,
  showAvatar: true,
  avatarColor: 'primary',
  elevation: 2,
  border: false,
  borderStyle: 'standard',
  rounded: 'lg',
  customClass: '',
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
  (e: 'view-details'): void;
}>();

// Computed
const cardClasses = computed(() => [
  'optimized-reservation-card',
  `border-${props.borderStyle}`,
  props.isPriority && 'is-priority',
  props.customClass
]);

// Service mappings
const serviceStyles = {
  'Transporte Aeropuerto': { color: 'blue-darken-2', icon: 'mdi-airplane' },
  'Servicio de Niñera': { color: 'deep-purple', icon: 'mdi-baby' },
  'Decoración Personalizada': { color: 'amber-darken-2', icon: 'mdi-party-popper' },
  'Compras de Supermercado': { color: 'green', icon: 'mdi-cart' },
  'default': { color: 'primary', icon: 'mdi-tools' }
} as const;

const statusMap = {
  'pending': { color: 'warning', text: 'Pendiente' },
  'approved': { color: 'success', text: 'Aprobada' },
  'rejected': { color: 'error', text: 'Rechazada' },
  'completed': { color: 'info', text: 'Completada' },
  'cancelled': { color: 'grey', text: 'Cancelada' }
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
  return serviceStyles[service as keyof typeof serviceStyles]?.color || serviceStyles.default.color;
}

function getServiceIcon(service: string): string {
  return serviceStyles[service as keyof typeof serviceStyles]?.icon || serviceStyles.default.icon;
}

function getStatusColor(status: string): string {
  return statusMap[status as keyof typeof statusMap]?.color || 'grey';
}

function getStatusText(status: string): string {
  return statusMap[status as keyof typeof statusMap]?.text || status;
}

function formatDate(date: string): string {
  if (!date) return '';
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return date;
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
}

function truncateEmail(email: string): string {
  if (!email || email.length <= 25) return email;
  const [name, domain] = email.split('@');
  if (name.length > 15) {
    return `${name.substring(0, 12)}...@${domain}`;
  }
  return email;
}

function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Event handlers
function handleCardClick(): void {
  if (props.enableNavigation) {
    const reservationId = props.reservation?.bookingId || props.reservation?.id;
    if (reservationId) {
      router.push(`/reservation/${reservationId}`);
    } else {
      emit('view-details');
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
.optimized-reservation-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  min-height: 280px;
  max-height: 380px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgb(var(--v-theme-surface));
}

.optimized-reservation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(var(--v-theme-on-surface), 0.12) !important;
}

/* Header */
.card-header {
  padding: 20px;
  background: linear-gradient(135deg,
    rgba(var(--v-theme-primary), 0.02) 0%,
    rgba(var(--v-theme-surface), 1) 100%);
}

.header-top {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.header-avatar {
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(var(--v-theme-on-surface), 0.1);
}

.header-info {
  flex: 1;
  min-width: 0;
}

.name-priority-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.client-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.priority-icon {
  flex-shrink: 0;
  animation: pulse 2s infinite;
}

.service-row {
  margin-top: 4px;
}

.service-chip {
  font-weight: 500 !important;
  color: white !important;
  border: none !important;
}

/* Contact Section */
.contact-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.contact-icon {
  color: rgb(var(--v-theme-primary));
  opacity: 0.7;
  flex-shrink: 0;
}

.contact-text {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* DateTime Section */
.datetime-section {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.datetime-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.datetime-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.datetime-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.datetime-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

/* Service Details */
.service-details-section {
  padding: 0 20px 16px;
  flex: 1;
}

/* Notes Section */
.notes-section {
  padding: 0 20px 16px;
}

.notes-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: rgba(var(--v-theme-info), 0.1);
  border-radius: 8px;
  border-left: 3px solid rgb(var(--v-theme-info));
}

.notes-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.notes-text {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.8;
  margin: 0;
  line-height: 1.4;
}

/* Price Section */
.price-section {
  padding: 16px 20px;
  background: rgba(var(--v-theme-success), 0.1);
  border-top: 1px solid rgba(var(--v-theme-success), 0.2);
}

.price-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
}

.price-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(var(--v-theme-success));
}

/* Actions */
.card-actions {
  padding: 16px 20px !important;
  background: rgba(var(--v-theme-surface-variant), 0.2);
  border-top: 1px solid rgba(var(--v-theme-outline), 0.1);
  gap: 8px;
}

.action-btn {
  min-width: 90px;
  font-weight: 500;
}

/* Status Badge */
.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.status-chip {
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Border Styles */
.border-left {
  border-left: 4px solid rgba(var(--v-theme-primary), 0.7) !important;
}

.border-left.is-priority {
  border-left: 4px solid rgb(var(--v-theme-error)) !important;
}

/* Priority Styling */
.is-priority {
  background: linear-gradient(135deg,
    rgba(var(--v-theme-error), 0.03) 0%,
    rgba(var(--v-theme-surface), 1) 100%);
}

.is-priority .client-name {
  color: rgb(var(--v-theme-error));
}

.is-priority .card-header {
  background: linear-gradient(135deg,
    rgba(var(--v-theme-error), 0.05) 0%,
    rgba(var(--v-theme-surface), 1) 100%);
}

/* Animations */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .optimized-reservation-card {
    min-height: 260px;
  }

  .card-header {
    padding: 16px;
  }

  .datetime-section {
    padding: 12px 16px;
  }

  .header-top {
    gap: 12px;
    margin-bottom: 12px;
  }

  .client-name {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .card-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    width: 100%;
  }

  .datetime-section {
    gap: 8px;
  }

  .datetime-item {
    gap: 8px;
  }
}

/* Dark Theme */
:deep(.v-theme--dark) .optimized-reservation-card {
  background: rgb(var(--v-theme-surface-variant));
}

:deep(.v-theme--dark) .contact-icon,
:deep(.v-theme--dark) .notes-icon {
  opacity: 0.8;
}

/* Focus States */
.optimized-reservation-card:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

/* Loading State */
.optimized-reservation-card[disabled] {
  pointer-events: none;
  opacity: 0.6;
}
</style>
