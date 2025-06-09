<template>
  <v-card
    @click="$emit('click')"
    class="simple-card"
    :class="{ 'urgent': reservation.isPriority }"
    flat
    rounded="lg"
  >
    <!-- Single Row Layout -->
    <div class="card-content">

      <!-- Left: Service & Client -->
      <div class="main-info">
        <div class="service-badge" :style="{ backgroundColor: serviceColor }">
          <v-icon :icon="serviceIcon" size="16" color="white" />
        </div>

        <div class="text-content">
          <h3 class="service-title">{{ serviceName }}</h3>
          <p class="client-name">{{ reservation.clientName }}</p>
        </div>
      </div>

      <!-- Center: Date & Time -->
      <div class="datetime-info">
        <div class="date">{{ shortDate }}</div>
        <div v-if="time" class="time">{{ time }}</div>
      </div>

      <!-- Right: Status & Price -->
      <div class="right-info">
        <v-chip
          v-if="reservation.status"
          :color="statusColor"
          size="x-small"
          variant="flat"
        >
          {{ statusText }}
        </v-chip>

        <div v-if="reservation.price" class="price">
          ${{ reservation.price }}
        </div>

        <v-icon
          v-if="reservation.isPriority"
          icon="mdi-star"
          color="amber"
          size="18"
        />
      </div>

    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Reservation {
  id?: string
  clientName: string
  date: string
  time?: string
  startTime?: string
  endTime?: string
  serviceId?: string
  serviceName?: string
  service?: string
  status?: string
  isPriority?: boolean
  price?: number
  [key: string]: any
}

interface Props {
  reservation: Reservation
}

const props = defineProps<Props>()

defineEmits<{
  click: []
}>()

// Simple configs
const SERVICES = {
  'airport-transfer': { name: 'Airport Transfer', icon: 'mdi-airplane', color: '#1976d2' },
  'babysitter': { name: 'Babysitting', icon: 'mdi-baby', color: '#7b1fa2' },
  'custom-decoration': { name: 'Decoration', icon: 'mdi-balloon', color: '#f57c00' },
  'grocery-shopping': { name: 'Shopping', icon: 'mdi-cart', color: '#388e3c' },
  default: { name: 'Service', icon: 'mdi-cog', color: '#616161' }
}

const STATUSES = {
  pending: { color: 'orange', text: 'Pending' },
  approved: { color: 'green', text: 'Approved' },
  completed: { color: 'blue', text: 'Done' },
  cancelled: { color: 'red', text: 'Cancelled' }
}

// Computed
const serviceConfig = computed(() => {
  const id = props.reservation.serviceId
  return SERVICES[id as keyof typeof SERVICES] || SERVICES.default
})

const serviceName = computed(() =>
  props.reservation.serviceName ||
  props.reservation.service ||
  serviceConfig.value.name
)

const serviceIcon = computed(() => serviceConfig.value.icon)
const serviceColor = computed(() => serviceConfig.value.color)

const time = computed(() => {
  if (props.reservation.time) return props.reservation.time
  if (props.reservation.startTime) {
    return props.reservation.endTime
      ? `${props.reservation.startTime}-${props.reservation.endTime}`
      : props.reservation.startTime
  }
  return ''
})

const shortDate = computed(() => {
  if (!props.reservation.date) return ''

  try {
    const date = new Date(props.reservation.date)
    const today = new Date()

    if (date.toDateString() === today.toDateString()) return 'Today'

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return props.reservation.date
  }
})

const statusConfig = computed(() => {
  const status = props.reservation.status
  return STATUSES[status as keyof typeof STATUSES] || { color: 'grey', text: status }
})

const statusColor = computed(() => statusConfig.value.color)
const statusText = computed(() => statusConfig.value.text)
</script>

<style scoped>
.simple-card {
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
  cursor: pointer;
  background: white;
}

.simple-card:hover {
  border-color: #1976d2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.simple-card.urgent {
  border-left: 4px solid #ff9800;
}

.card-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
}

.main-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.service-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.text-content {
  min-width: 0;
  flex: 1;
}

.service-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 2px 0;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.client-name {
  font-size: 13px;
  color: #7f8c8d;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.datetime-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 60px;
}

.date {
  font-size: 12px;
  font-weight: 600;
  color: #34495e;
  white-space: nowrap;
}

.time {
  font-size: 11px;
  color: #95a5a6;
  white-space: nowrap;
}

.right-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.price {
  font-size: 14px;
  font-weight: 700;
  color: #27ae60;
  white-space: nowrap;
}

/* Mobile */
@media (max-width: 600px) {
  .card-content {
    padding: 12px;
    gap: 12px;
  }

  .datetime-info {
    min-width: 50px;
  }

  .service-title {
    font-size: 13px;
  }

  .client-name {
    font-size: 12px;
  }
}

/* Dark theme */
.v-theme--dark .simple-card {
  background: #1e1e1e;
  border-color: #333;
}

.v-theme--dark .simple-card:hover {
  border-color: #42a5f5;
}

.v-theme--dark .service-title {
  color: #ecf0f1;
}

.v-theme--dark .client-name {
  color: #bdc3c7;
}

.v-theme--dark .date {
  color: #ecf0f1;
}

.v-theme--dark .time {
  color: #95a5a6;
}
</style>
