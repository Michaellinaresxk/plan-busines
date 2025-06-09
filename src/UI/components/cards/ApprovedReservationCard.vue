<template>
  <v-card
    @click="$emit('click')"
    class="approved-card"
    :class="{ 'selected': isSelected }"
    flat
    rounded="lg"
  >
    <!-- Selection Checkbox -->
    <div class="selection-overlay">
      <v-checkbox
        :model-value="isSelected"
        color="success"
        hide-details
        @click.stop
        @update:model-value="$emit('toggle-selection')"
      />
    </div>

    <!-- Ready Badge -->
    <div class="ready-badge">
      <v-chip color="success" variant="flat" size="x-small">
        Ready
      </v-chip>
    </div>

    <div class="card-content">

      <!-- SERVICE - Most Important -->
      <div class="service-section">
        <div class="service-badge" :style="{ backgroundColor: serviceColor }">
          <v-icon :icon="serviceIcon" size="18" color="white" />
        </div>
        <h2 class="service-title">{{ displayServiceName }}</h2>
      </div>

      <!-- CLIENT NAME - Second Priority -->
      <div class="client-section">
        <h3 class="client-name">{{ reservation?.clientName || 'Cliente' }}</h3>
        <div class="client-email">{{ truncatedEmail }}</div>
      </div>

      <!-- DATE & TIME -->
      <div class="datetime-section">
        <div class="date-row">
          <v-icon icon="mdi-calendar" size="14" color="grey" />
          <span class="date-text">{{ shortDate }}</span>
        </div>
        <div v-if="reservation?.time" class="time-row">
          <v-icon icon="mdi-clock" size="14" color="grey" />
          <span class="time-text">{{ reservation.time }}</span>
        </div>
      </div>

      <!-- PRICE - Bottom -->
      <div class="price-section">
        <div class="price-main">${{ reservation?.totalPrice || reservation?.price || '0' }}</div>
        <v-btn
          icon="mdi-eye"
          variant="text"
          size="x-small"
          color="primary"
          @click.stop="$emit('view-details')"
        />
      </div>

    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ApprovedReservation {
  bookingId: string
  serviceName: string
  clientName: string
  clientEmail: string
  date: string
  time?: string
  totalPrice: number
  [key: string]: any
}

interface Props {
  reservation: ApprovedReservation
  isSelected: boolean
}

const props = defineProps<Props>()

defineEmits<{
  click: []
  'toggle-selection': []
  'view-details': []
}>()

// Service configs
const serviceStyles = {
  'airport-transfer': { color: '#2196F3', icon: 'mdi-airplane' },
  'babysitter': { color: '#9C27B0', icon: 'mdi-baby' },
  'custom-decoration': { color: '#FF9800', icon: 'mdi-party-popper' },
  'grocery-shopping': { color: '#4CAF50', icon: 'mdi-cart' },
  'default': { color: '#6366F1', icon: 'mdi-star' }
}

// Computed
const serviceKey = computed(() => {
  // Manejar diferentes posibles nombres de propiedades para el servicio
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

const truncatedEmail = computed(() => {
  const email = props.reservation?.clientEmail || props.reservation?.email || ''
  return email.length > 25 ? `${email.slice(0, 22)}...` : email
})

const displayServiceName = computed(() => {
  return props.reservation?.serviceName ||
         props.reservation?.service_name ||
         props.reservation?.service ||
         'Servicio'
})

const shortDate = computed(() => {
  if (!props.reservation?.date) return ''

  try {
    const date = new Date(props.reservation.date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return props.reservation.date
  }
})
</script>

<style scoped>
.approved-card {
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  cursor: pointer;
  background: white;
  height: 200px; /* Aumentado para más espacio */
  position: relative;
  overflow: hidden;
}

.approved-card:hover {
  border-color: #4caf50;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.2);
  transform: translateY(-2px);
}

.approved-card.selected {
  border-color: #4caf50;
  background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
}

.selection-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2px;
}

.ready-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 18px; /* Más padding */
  gap: 14px; /* Más espacio entre secciones */
  margin-top: 20px; /* Space for badges */
}

/* SERVICE SECTION - Más compacto */
.service-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px; /* Menos espacio abajo */
}

.service-badge {
  width: 32px; /* Ligeramente más pequeño */
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.service-title {
  font-size: 15px; /* Ligeramente más pequeño */
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  flex: 1;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* CLIENT SECTION - Más prominente */
.client-section {
  flex: 1;
  min-height: 0;
  padding: 12px; /* Agregamos padding */
  background: #f8f9fa; /* Fondo sutil */
  border-radius: 10px; /* Bordes redondeados */
  border: 1px solid #e9ecef; /* Borde sutil */
}

.client-name {
  font-size: 16px; /* Más grande */
  font-weight: 700; /* Más bold */
  color: #1a1a1a; /* Más oscuro */
  margin: 0 0 6px 0; /* Más espacio */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.client-email {
  font-size: 13px; /* Ligeramente más grande */
  color: #495057; /* Más oscuro que antes */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  line-height: 1.4;
}

/* DATETIME SECTION - Más compacto */
.datetime-section {
  display: flex;
  flex-direction: column;
  gap: 6px; /* Más espacio */
  padding: 10px 12px; /* Más padding */
  background: #f1f3f4;
  border-radius: 8px;
}

.date-row,
.time-row {
  display: flex;
  align-items: center;
  gap: 8px; /* Más espacio */
}

.date-text,
.time-text {
  font-size: 13px; /* Ligeramente más grande */
  font-weight: 600; /* Más bold */
  color: #374151; /* Más oscuro */
}

/* PRICE SECTION */
.price-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #e9ecef;
}

.price-main {
  font-size: 18px;
  font-weight: 700;
  color: #27ae60;
}

/* Responsive */
@media (max-width: 600px) {
  .approved-card {
    height: 180px; /* Mantener altura en mobile */
  }

  .card-content {
    padding: 16px;
    gap: 12px;
    margin-top: 16px;
  }

  .service-title {
    font-size: 14px;
  }

  .service-badge {
    width: 28px;
    height: 28px;
  }

  .client-name {
    font-size: 15px;
  }

  .client-email {
    font-size: 12px;
  }

  .client-section {
    padding: 10px;
  }

  .price-main {
    font-size: 16px;
  }
}

/* Dark theme */
.v-theme--dark .approved-card {
  background: #1e1e1e;
  border-color: #333;
}

.v-theme--dark .approved-card.selected {
  background: linear-gradient(135deg, #1a2e1a 0%, #1e1e1e 100%);
}

.v-theme--dark .approved-card:hover {
  border-color: #66bb6a;
}

.v-theme--dark .service-title {
  color: #ffffff;
}

.v-theme--dark .client-name {
  color: #e0e0e0;
}

.v-theme--dark .client-email {
  color: #bdbdbd;
}

.v-theme--dark .datetime-section {
  background: #2c2c2c;
}

.v-theme--dark .date-text,
.v-theme--dark .time-text {
  color: #bdbdbd;
}

.v-theme--dark .price-section {
  border-color: #404040;
}

.v-theme--dark .selection-overlay {
  background: #333;
}

/* Animation */
.approved-card {
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
