<template>
  <div :class="['reservation-card', { 'is-priority': reservation.isPriority }]" @mouseover="isHovered = true"
    @mouseleave="isHovered = false">
    <!-- Priority indicator -->
    <div v-if="reservation.isPriority" class="priority-indicator">
      <span class="priority-line"></span>
      <div class="priority-badge">
        <IconPriority class="priority-icon" />
        <span>Priority</span>
      </div>
    </div>

    <!-- Card header -->
    <div class="card-header">
      <div class="client-info">
        <div class="avatar" :style="{ backgroundColor: avatarBackground }">
          {{ getInitials(reservation.clientName) }}
        </div>
        <div class="client-details">
          <h3 class="client-name">{{ reservation.clientName }}</h3>
          <div class="client-email">
            <IconEmail />
            <span>{{ reservation.email }}</span>
          </div>
        </div>
      </div>

      <!-- Action menu -->
      <button class="action-button" :class="{ visible: isHovered }" @click.stop="showDetailDialog"
        aria-label="More options">
        <IconMore />
      </button>
    </div>

    <!-- Service info -->
    <div class="service-section">
      <div class="service-tags">
        <span class="service-tag" :style="{ borderColor: serviceColor }">
          {{ reservation.service }}
        </span>
        <span v-if="reservation.isPriority" class="priority-tag"> Priority </span>
      </div>

      <!-- Reservation details -->
      <div class="reservation-details">
        <div class="detail-item">
          <IconCalendar :color="serviceColor" />
          <span>{{ formatDate(reservation.date) }}</span>
        </div>

        <div class="detail-item">
          <IconClock :color="serviceColor" />
          <span>{{ formatTime(reservation.time) }}</span>
        </div>

        <div class="detail-item">
          <IconPhone :color="serviceColor" />
          <span>{{ formatPhone(reservation.phone) }}</span>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="reservation.notes" class="notes-container">
        <div class="notes-content">
          <p>{{ reservation.notes }}</p>
        </div>
      </div>

      <!-- Timestamp -->
      <div class="timestamp">
        <IconHistory />
        <span>Requested {{ reservation.timeAgo }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions-container">
      <!-- <button class="action-button decline" :disabled="isRejecting" @click="rejectReservation">
        <IconDecline v-if="!isRejecting" />
        <IconSpinner v-else class="spinner" />
        <span>Decline</span>
      </button> -->

      <button class="action-button approve" :disabled="isApproving" @click="approveReservation">
        <IconApprove v-if="!isApproving" />
        <IconSpinner v-else class="spinner" />
        <span>Approve</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  getInitials,
  formatDate,
  formatTime,
  formatPhone,
  getServiceColor
} from '@/utils/reservationUtils';

// Props with TypeScript interface
const props = defineProps<{
  reservation,
}>();

// Emits with type safety
const emit = defineEmits<{
  (e: 'approve', id: number): void;
  (e: 'reject', id: number): void;
  (e: 'view-details', reservation): void;
}>();

// Reactive state
const isHovered = ref(false);
const isApproving = ref(false);
const isRejecting = ref(false);

// Computed properties
const serviceColor = computed(() => {
  return getServiceColor(props.reservation.service);
});

const avatarBackground = computed(() => {
  // Create a lighter version of the service color for the avatar
  return `${serviceColor.value}22`; // Adding 22 for 13% opacity in hex
});

async function approveReservation(): Promise<void> {
  if (isApproving.value) return;

  isApproving.value = true;

  try {
    // Here would be the API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    emit('approve', props.reservation.id);
  } catch (error) {
    console.error('Error approving reservation:', error);
  } finally {
    isApproving.value = false;
  }
}

// async function rejectReservation(): Promise<void> {
//   if (isRejecting.value) return;

//   isRejecting.value = true;

//   try {
//     // Here would be the API call
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     emit('reject', props.reservation.id);
//   } catch (error) {
//     console.error('Error rejecting reservation:', error);
//   } finally {
//     isRejecting.value = false;
//   }
// }

function showDetailDialog(): void {
  emit('view-details', props.reservation);
}
</script>

<style scoped>
.reservation-card {
  position: relative;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin-bottom: 1.5rem;
  border-left: 3px solid transparent;
}

.reservation-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.is-priority {
  border-left-color: #ef4444;
}

.priority-indicator {
  position: relative;
}

.priority-line {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 3px;
  background-color: #ef4444;
}

.priority-badge {
  position: absolute;
  top: 12px;
  right: 0;
  background: linear-gradient(135deg, #ff5757, #ef4444);
  color: white;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 4px 0 0 4px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 5px rgba(239, 68, 68, 0.3);
}

.priority-icon {
  width: 12px;
  height: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 0.75rem;
}

.client-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
  margin-right: 1rem;
  color: rgba(0, 0, 0, 0.75);
}

.client-details {
  display: flex;
  flex-direction: column;
}

.client-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: #111827;
}

.client-email {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.client-email svg {
  margin-right: 0.375rem;
  width: 14px;
  height: 14px;
}

.action-button {
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
  padding: 0.5rem;
  border-radius: 50%;
}

.action-button.visible {
  opacity: 1;
}

.action-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.service-section {
  padding: 0.75rem 1.25rem 1rem;
}

.service-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
}

.service-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background-color: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
  font-weight: 500;
  border: 1px solid;
}

.priority-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-weight: 500;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.reservation-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #4b5563;
}

.detail-item svg {
  margin-right: 6px;
  width: 16px;
  height: 16px;
}

.notes-container {
  margin: 1rem 0;
  border-radius: 8px;
  background-color: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.notes-content {
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
}

.notes-content p {
  margin: 0;
}

.timestamp {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.75rem;
}

.timestamp svg {
  margin-right: 4px;
  width: 12px;
  height: 12px;
}

.actions-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 1rem 1.25rem;
  background-color: #f9fafb;
  border-top: 1px solid #f3f4f6;
}

.actions-container .action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  opacity: 1;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
  gap: 8px;
}

.actions-container .action-button:hover {
  transform: translateY(-1px);
}

.actions-container .action-button svg {
  width: 16px;
  height: 16px;
}

.actions-container .action-button.decline {
  background-color: transparent;
  border: 1px solid #e5e7eb;
  color: #6b7280;
}

.actions-container .action-button.decline:hover {
  background-color: #f3f4f6;
}

.actions-container .action-button.approve {
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  color: white;
  box-shadow: 0 2px 5px rgba(16, 185, 129, 0.3);
}

.actions-container .action-button.approve:hover {
  background: linear-gradient(135deg, #059669, #047857);
}

.actions-container .action-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .reservation-details {
    flex-direction: column;
    gap: 8px;
  }

  .actions-container {
    padding: 0.75rem 1rem;
  }

  .card-header {
    padding: 1rem 1rem 0.5rem;
  }

  .service-section {
    padding: 0.5rem 1rem 0.75rem;
  }

  .avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}
</style>
