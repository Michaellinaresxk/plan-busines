<template>
  <BaseReservationCard :reservation="reservation" :onApprove="onApprove" :onReject="onReject"
    @view-details="$emit('view-details', reservation)">
    <div class="reservation-details">
      <!-- Fecha y Hora -->
      <div class="detail-item">
        <v-icon icon="mdi-calendar" size="small" color="purple" class="mr-2"></v-icon>
        <span class="font-weight-medium">{{ formatDate(reservation.date) }}</span>
      </div>

      <!-- Horario -->
      <div class="detail-item">
        <v-icon icon="mdi-clock-outline" size="small" color="purple" class="mr-2"></v-icon>
        <span>{{ reservation.startTime }} - {{ reservation.endTime }}</span>
      </div>

      <!-- Niños -->
      <div class="detail-item">
        <v-icon icon="mdi-baby" size="small" color="purple" class="mr-2"></v-icon>
        <span>{{ reservation.childrenCount }} {{ reservation.childrenCount === 1 ? 'niño' : 'niños' }}</span>
      </div>

      <!-- Edades -->
      <div v-if="reservation.childrenAges && reservation.childrenAges.length > 0" class="detail-item">
        <v-icon icon="mdi-cake-variant" size="small" color="purple" class="mr-2"></v-icon>
        <span>Edades: {{ formatAges(reservation.childrenAges) }}</span>
      </div>

      <!-- Necesidades especiales -->
      <div v-if="reservation.hasSpecialNeeds" class="detail-item special-needs">
        <v-icon icon="mdi-alert-circle" size="small" color="warning" class="mr-2"></v-icon>
        <div>
          <span class="font-weight-medium text-warning">Necesidades especiales</span>
          <p v-if="reservation.specialNeedsDetails" class="special-needs-details">
            {{ reservation.specialNeedsDetails }}
          </p>
        </div>
      </div>

      <!-- Solicitudes especiales -->
      <div v-if="reservation.specialRequests" class="detail-item special-requests">
        <v-icon icon="mdi-comment-text-outline" size="small" color="blue-grey" class="mr-2"></v-icon>
        <div>
          <span class="font-weight-medium text-blue-grey">Solicitudes especiales:</span>
          <p class="special-requests-text">{{ reservation.specialRequests }}</p>
        </div>
      </div>
    </div>
  </BaseReservationCard>
</template>

<script setup lang="ts">
import BaseReservationCard from './BaseReservationCard.vue';

// Propiedades
const props = defineProps<{
  reservation,
  onApprove: (id: string) => Promise<boolean>;
  onReject: (id: string) => Promise<boolean>;
}>();

// Eventos
const emit = defineEmits<{
  (e: 'view-details', reservation): void;
}>();

// Método para formatear fechas
function formatDate(date: string): string {
  if (!date) return '';

  try {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return date;
  }
}

// Método para formatear edades
function formatAges(ages: string[]): string {
  if (!ages || ages.length === 0) return '';

  return ages.filter(age => age.trim()).join(', ');
}
</script>

<style scoped>
.reservation-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  font-size: 0.875rem;
}

.special-needs {
  background-color: rgba(var(--v-theme-warning), 0.08);
  padding: 8px;
  border-radius: 6px;
  margin-top: 8px;
}

.special-needs-details {
  font-size: 0.8rem;
  margin-top: 4px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.special-requests {
  background-color: rgba(var(--v-theme-blue-grey), 0.05);
  padding: 8px;
  border-radius: 6px;
  margin-top: 8px;
}

.special-requests-text {
  font-size: 0.8rem;
  margin-top: 4px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>
