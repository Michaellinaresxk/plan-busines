<template>
  <div
    class="approved-card"
    :class="{ 'payment-sent': paymentStatus === 'sent' }"
  >

    <!-- 📋 Service Header -->
    <div class="service-header">
      <div class="service-badge" :style="{ backgroundColor: serviceColor }">
        <v-icon :icon="serviceIcon" size="16" color="white" />
      </div>
      <div class="service-info">
        <h3 class="service-name">{{ displayServiceName }}</h3>
        <div class="booking-ref">#{{ reservation?.bookingId?.slice(-6) || 'N/A' }}</div>
      </div>
      <!-- Payment Status -->
      <v-chip
        :color="getPaymentStatusColor(paymentStatus)"
        size="x-small"
        variant="tonal"
      >
        {{ getPaymentStatusText(paymentStatus) }}
      </v-chip>
    </div>

    <!-- 📅 Service Date -->
    <div class="service-date">
      <v-icon icon="mdi-calendar" size="16" class="date-icon" />
      <span class="date-text">{{ getServiceDate() }} - {{ getServiceTime() }}</span>
    </div>

    <!-- 💰 Price & Actions -->
    <div class="card-footer">
      <div class="price-section">
        <span class="price-amount">${{ reservation?.totalPrice || '0' }}</span>
        <span class="price-label">Total a Pagar</span>
      </div>

      <!-- Menu de opciones -->
      <v-menu location="bottom end" :close-on-content-click="true">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-dots-vertical"
            variant="text"
            size="small"
            class="options-btn"
          />
        </template>

        <v-list density="compact" class="options-menu">
          <v-list-item
            @click="$emit('view-details')"
            prepend-icon="mdi-eye"
            title="Ver detalles"
            class="menu-item"
          />

          <v-list-item
            @click="$emit('edit-reservation')"
            prepend-icon="mdi-pencil"
            title="Editar"
            class="menu-item"
          />

          <v-divider />

          <v-list-item
            @click="$emit('send-payment-link')"
            :prepend-icon="paymentStatus === 'sent' ? 'mdi-check-circle' : 'mdi-credit-card-send'"
            :title="paymentStatus === 'sent' ? 'Enlace enviado' : 'Enviar enlace de pago'"
            :disabled="paymentStatus === 'sent' || isSendingPayment"
            :class="{ 'payment-item': true, 'sent': paymentStatus === 'sent' }"
            class="menu-item"
          />
        </v-list>
      </v-menu>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ApprovedReservation {
  bookingId: string
  serviceName: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  date?: string
  time?: string
  serviceDate?: string
  serviceTime?: string
  bookingDate?: Date
  totalPrice: number
  formData?: any
  serviceId?: string
  [key: string]: any
}

interface Props {
  reservation: ApprovedReservation
  paymentStatus?: string
  isSendingPayment?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  paymentStatus: 'pending',
  isSendingPayment: false
})

defineEmits<{
  'view-details': []
  'send-payment-link': []
  'edit-reservation': []
}>()

// Service configs
const serviceStyles = {
  'airport-transfer': { color: '#3B82F6', icon: 'mdi-airplane' },
  'babysitter': { color: '#8B5CF6', icon: 'mdi-baby' },
  'custom-decoration': { color: '#F59E0B', icon: 'mdi-party-popper' },
  'grocery-shopping': { color: '#10B981', icon: 'mdi-cart' },
  'default': { color: '#6366F1', icon: 'mdi-star' }
}

const serviceKey = computed(() => {
  const serviceName = props.reservation?.serviceName ||
                     props.reservation?.service_name ||
                     props.reservation?.service ||
                     'default';
  return serviceName.toLowerCase().replace(/\s+/g, '-');
})

const serviceColor = computed(() => {
  return serviceStyles[serviceKey.value as keyof typeof serviceStyles]?.color || serviceStyles.default.color
})

const serviceIcon = computed(() => {
  return serviceStyles[serviceKey.value as keyof typeof serviceStyles]?.icon || serviceStyles.default.icon
})

const displayServiceName = computed(() => {
  return props.reservation?.serviceName ||
         props.reservation?.service_name ||
         props.reservation?.service ||
         'Servicio'
})

// Methods
function getServiceDate(): string {
  if (!props.reservation) return 'Sin fecha'

  // Try different date fields
  if (props.reservation.serviceDate) return formatDateString(props.reservation.serviceDate)
  if (props.reservation.formData?.date) return formatDateString(props.reservation.formData.date)
  if (props.reservation.date) return formatDateString(props.reservation.date)
  if (props.reservation.bookingDate) {
    const date = new Date(props.reservation.bookingDate)
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return 'Por confirmar'
}

function getServiceTime(): string {
  if (!props.reservation) return 'Sin hora'

  // Try different time fields
  if (props.reservation.serviceTime) return props.reservation.serviceTime
  if (props.reservation.time) return props.reservation.time
  if (props.reservation.formData?.time) return props.reservation.formData.time
  if (props.reservation.formData?.startTime) {
    const { startTime, endTime } = props.reservation.formData
    return endTime ? `${startTime} - ${endTime}` : startTime
  }
  if (props.reservation.formData?.hour) return props.reservation.formData.hour

  return 'Por confirmar'
}

function formatDateString(dateString: string): string {
  try {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Hoy'
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana'

    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'sent': return 'success'
    case 'paid': return 'success'
    case 'failed': return 'error'
    case 'pending': return 'warning'
    default: return 'grey'
  }
}

function getPaymentStatusText(status: string): string {
  switch (status) {
    case 'sent': return 'Enlace Enviado'
    case 'paid': return 'Pagado'
    case 'failed': return 'Error'
    case 'pending': return 'Pendiente'
    default: return 'Desconocido'
  }
}
</script>

<style scoped>
/* 📋 MINIMAL APPROVED CARD */

.approved-card {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 140px;
  max-width: 320px;
}

.approved-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  border-radius: 16px 16px 0 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.approved-card:hover {
  border-color: #e2e8f0;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.05),
    0 4px 6px -2px rgba(0, 0, 0, 0.03);
  transform: translateY(-2px);
}

.approved-card:hover::before {
  opacity: 1;
}

.approved-card.payment-sent {
  border-color: #10b981;
  background: #f0fdf4;
}

.approved-card.payment-sent::before {
  background: linear-gradient(90deg, #10b981, #059669, #10b981);
  opacity: 1;
}

/* 📋 Service Header */
.service-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.service-badge {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.service-info {
  flex: 1;
  min-width: 0;
}

.service-name {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.booking-ref {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 📅 Service Date */
.service-date {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.date-icon {
  color: #64748b;
  flex-shrink: 0;
}

.date-text {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* 💰 Card Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-amount {
  font-size: 18px;
  font-weight: 800;
  color: #059669;
  line-height: 1;
}

.price-label {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.options-btn {
  border-radius: 10px;
  color: #64748b;
}

.options-btn:hover {
  background: #f8fafc;
  color: #374151;
  transform: scale(1.05);
}

/* Options Menu */
.options-menu {
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f5f9;
  overflow: hidden;
}

.menu-item {
  font-size: 14px;
  font-weight: 500;
  min-height: 40px;
}

.menu-item:hover {
  background: #f8fafc;
}

.payment-item {
  color: #059669;
  font-weight: 600;
}

.payment-item.sent {
  color: #10b981;
  opacity: 0.7;
}

.payment-item:hover:not(.sent) {
  background: #f0fdf4;
}

/* 🌙 Dark Theme */
.v-theme--dark .approved-card {
  background: #1e293b;
  border-color: #334155;
}

.v-theme--dark .approved-card:hover {
  border-color: #475569;
  background: #1e293b;
}

.v-theme--dark .approved-card.payment-sent {
  background: #064e3b;
  border-color: #10b981;
}

.v-theme--dark .service-name {
  color: #f8fafc;
}

.v-theme--dark .booking-ref {
  color: #94a3b8;
}

.v-theme--dark .service-date {
  background: #334155;
  border-color: #475569;
}

.v-theme--dark .date-icon {
  color: #94a3b8;
}

.v-theme--dark .date-text {
  color: #e2e8f0;
}

.v-theme--dark .price-label {
  color: #64748b;
}

.v-theme--dark .card-footer {
  border-top-color: #334155;
}

.v-theme--dark .options-btn {
  color: #94a3b8;
}

.v-theme--dark .options-btn:hover {
  background: #334155;
  color: #e2e8f0;
}

.v-theme--dark .options-menu {
  background: #1e293b;
  border-color: #334155;
}

.v-theme--dark .menu-item:hover {
  background: #334155;
}

.v-theme--dark .payment-item:hover:not(.sent) {
  background: #064e3b;
}

/* 📱 Responsive Design */
@media (max-width: 359px) {
  .approved-card {
    padding: 16px;
    gap: 16px;
    min-height: 120px;
    max-width: 100%;
  }

  .service-badge {
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }

  .service-name {
    font-size: 14px;
  }

  .service-date {
    padding: 10px 12px;
  }

  .date-text {
    font-size: 13px;
  }

  .price-amount {
    font-size: 16px;
  }
}

@media (min-width: 360px) and (max-width: 479px) {
  .approved-card {
    min-height: 130px;
  }

  .service-name {
    font-size: 15px;
  }

  .price-amount {
    font-size: 17px;
  }
}

/* 🎭 Animations */
.approved-card {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Focus states */
.approved-card:focus-visible,
.options-btn:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .approved-card,
  .options-btn {
    animation: none;
    transition: none;
  }

  .approved-card:hover {
    transform: none;
  }
}

/* High contrast */
@media (prefers-contrast: high) {
  .approved-card {
    border-width: 2px;
  }

  .service-date {
    border: 1px solid currentColor;
  }
}
</style>
