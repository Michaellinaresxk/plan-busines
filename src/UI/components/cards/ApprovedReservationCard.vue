<template>
  <div
    @click="$emit('click')"
    class="reservation-card"
    :class="{ 'selected': isSelected }"
  >
    <!-- Glass Background Overlay -->
    <div class="glass-background"></div>

    <!-- Top Section: Service & Selection -->
    <div class="top-section">
      <div class="service-header">
        <div class="service-icon-container">
          <div class="service-icon" :style="{ backgroundColor: serviceColor }">
            <v-icon :icon="serviceIcon" size="24" color="white" />
          </div>
          <div class="service-glow" :style="{ backgroundColor: serviceColor }"></div>
        </div>

        <div class="service-info">
          <h3 class="service-title">{{ displayServiceName }}</h3>
          <div class="ready-status">
            <div class="status-pulse"></div>
            <span>Ready</span>
          </div>
        </div>
      </div>

      <div class="selection-area">
        <v-checkbox
          :model-value="isSelected"
          color="primary"
          hide-details
          @click.stop
          @update:model-value="$emit('toggle-selection')"
          class="custom-checkbox"
        />
      </div>
    </div>

    <!-- Client Section -->
    <div class="client-section">
      <div class="client-avatar">
        <div class="avatar-circle">
          <v-icon icon="mdi-account" size="20" color="white" />
        </div>
      </div>

      <div class="client-details">
        <h2 class="client-name">{{ reservation?.clientName || 'Cliente' }}</h2>
        <p class="client-email">{{ truncatedEmail }}</p>
      </div>

      <v-btn
        icon="mdi-eye"
        variant="flat"
        size="small"
        color="primary"
        @click.stop="$emit('view-details')"
        class="view-btn"
      />
    </div>

    <!-- Details Grid -->
    <div class="details-grid">
      <div class="detail-card date-card">
        <div class="detail-icon">
          <v-icon icon="mdi-calendar-outline" size="18" />
        </div>
        <div class="detail-content">
          <span class="detail-label">Date</span>
          <span class="detail-value">{{ shortDate }}</span>
        </div>
      </div>

      <div v-if="reservation?.time" class="detail-card time-card">
        <div class="detail-icon">
          <v-icon icon="mdi-clock-outline" size="18" />
        </div>
        <div class="detail-content">
          <span class="detail-label">Time</span>
          <span class="detail-value">{{ reservation.time }}</span>
        </div>
      </div>
    </div>

    <!-- Price Section -->
    <div class="price-section">
      <div class="price-container">
        <span class="currency">$</span>
        <span class="amount">{{ reservation?.totalPrice || reservation?.price || '0' }}</span>
      </div>
      <div class="price-label">Total Amount</div>
    </div>

    <!-- Selection Indicator -->
    <div class="selection-border" :class="{ active: isSelected }"></div>
  </div>
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

// Service configs with vibrant modern colors
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
.reservation-card {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  height: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.glass-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(255, 255, 255, 0.6) 100%);
  border-radius: 24px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.reservation-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.8);
}

.reservation-card:hover .glass-background {
  opacity: 1;
}

.reservation-card.selected {
  border-color: #3B82F6;
  background: linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%);
  box-shadow:
    0 25px 50px -12px rgba(59, 130, 246, 0.4),
    0 0 0 1px #3B82F6;
}

/* Top Section */
.top-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 2;
}

.service-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.service-icon-container {
  position: relative;
}

.service-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}

.service-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  opacity: 0.2;
  filter: blur(20px);
  z-index: 1;
}

.reservation-card:hover .service-icon {
  transform: rotate(5deg) scale(1.1);
}

.service-info {
  flex: 1;
}

.service-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.ready-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #10b981;
}

.status-pulse {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
}

.selection-area {
  position: relative;
  z-index: 3;
}

.custom-checkbox {
  transform: scale(1.2);
}

/* Client Section */
.client-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  position: relative;
  z-index: 2;
}

.client-avatar {
  position: relative;
}

.avatar-circle {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
}

.client-details {
  flex: 1;
  min-width: 0;
}

.client-name {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.client-email {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-btn {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.view-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  position: relative;
  z-index: 2;
}

.detail-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.detail-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  flex-shrink: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.detail-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Price Section */
.price-section {
  margin-top: auto;
  text-align: center;
  position: relative;
  z-index: 2;
}

.price-container {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  margin-bottom: 6px;
}

.currency {
  font-size: 20px;
  font-weight: 600;
  color: #10b981;
}

.amount {
  font-size: 32px;
  font-weight: 900;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.price-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Selection Border */
.selection-border {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 26px;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6, #10B981);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.selection-border.active {
  opacity: 1;
  animation: borderGlow 2s infinite;
}

@keyframes borderGlow {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
}

/* Dark Theme */
.v-theme--dark .reservation-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: rgba(51, 65, 85, 0.8);
}

.v-theme--dark .glass-background {
  background: linear-gradient(135deg,
    rgba(30, 41, 59, 0.9) 0%,
    rgba(15, 23, 42, 0.6) 100%);
}

.v-theme--dark .reservation-card.selected {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%);
}

.v-theme--dark .service-title {
  color: #f8fafc;
}

.v-theme--dark .client-section {
  background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
  border-color: rgba(71, 85, 105, 0.3);
}

.v-theme--dark .client-name {
  color: #f8fafc;
}

.v-theme--dark .client-email {
  color: #94a3b8;
}

.v-theme--dark .detail-card {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(71, 85, 105, 0.2);
}

.v-theme--dark .detail-icon {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  color: #9ca3af;
}

.v-theme--dark .detail-value {
  color: #e2e8f0;
}

.v-theme--dark .detail-label {
  color: #64748b;
}

.v-theme--dark .price-label {
  color: #94a3b8;
}

/* Responsive */
@media (max-width: 768px) {
  .reservation-card {
    height: 260px;
    padding: 20px;
    gap: 16px;
  }

  .service-icon {
    width: 48px;
    height: 48px;
  }

  .service-glow {
    width: 68px;
    height: 68px;
  }

  .service-title {
    font-size: 16px;
  }

  .client-section {
    padding: 16px;
  }

  .avatar-circle {
    width: 40px;
    height: 40px;
  }

  .client-name {
    font-size: 18px;
  }

  .details-grid {
    gap: 12px;
  }

  .detail-card {
    padding: 12px;
  }

  .detail-icon {
    width: 36px;
    height: 36px;
  }

  .amount {
    font-size: 28px;
  }
}

/* Animation */
.reservation-card {
  animation: slideInUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

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

/* Focus states */
.reservation-card:focus-visible {
  outline: 3px solid #3B82F6;
  outline-offset: 2px;
}
</style>
