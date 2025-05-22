<template>
  <BaseReservationCard :reservation="reservation" :onApprove="onApprove" :onReject="onReject"
    @view-details="$emit('view-details', reservation)">
    <div class="reservation-details">
      <!-- Fecha y Hora -->
      <div class="detail-item">
        <v-icon icon="mdi-calendar" size="small" color="green" class="mr-2"></v-icon>
        <span class="font-weight-medium">{{ formatDate(reservation.date) }} - {{ reservation.hour }}</span>
      </div>

      <!-- Dirección de entrega -->
      <div class="detail-item">
        <v-icon icon="mdi-map-marker" size="small" color="green" class="mr-2"></v-icon>
        <div>
          <span class="font-weight-medium">Dirección de entrega:</span>
          <p class="address-text">{{ reservation.deliveryAddress }}</p>
        </div>
      </div>

      <!-- Número de artículos -->
      <div v-if="reservation.items && reservation.items.length > 0" class="detail-item">
        <v-icon icon="mdi-cart" size="small" color="green" class="mr-2"></v-icon>
        <span>{{ reservation.items.length }} {{ reservation.items.length === 1 ? 'artículo' : 'artículos' }}</span>
      </div>

      <!-- Restricciones alimentarias -->
      <div v-if="reservation.foodRestrictions" class="detail-item">
        <v-icon icon="mdi-food-off" size="small" color="green" class="mr-2"></v-icon>
        <div>
          <span class="font-weight-medium">Restricciones alimentarias:</span>
          <p class="dietary-text">{{ reservation.foodRestrictions }}</p>
        </div>
      </div>

      <!-- Alergias -->
      <div v-if="reservation.hasAllergies === 'yes'" class="detail-item allergies-warning">
        <v-icon icon="mdi-alert-circle" size="small" color="error" class="mr-2"></v-icon>
        <div>
          <span class="font-weight-bold text-error">¡ATENCIÓN! Cliente con alergias</span>
          <p v-if="reservation.allergyDetails" class="allergy-details">
            {{ reservation.allergyDetails }}
          </p>
        </div>
      </div>

      <!-- Solicitudes especiales -->
      <div v-if="reservation.specialRequests" class="detail-item">
        <v-icon icon="mdi-note-text" size="small" color="green" class="mr-2"></v-icon>
        <div>
          <span class="font-weight-medium">Solicitudes especiales:</span>
          <p class="special-requests-text">{{ reservation.specialRequests }}</p>
        </div>
      </div>
    </div>
  </BaseReservationCard>
</template>

<script setup lang="ts">
import { GroceryReservation } from '@/types/reservations';
import BaseReservationCard from './BaseReservationCard.vue';

// Propiedades
const props = defineProps<{
  reservation: GroceryReservation;
  onApprove: (id: string) => Promise<boolean>;
  onReject: (id: string) => Promise<boolean>;
}>();

// Eventos
const emit = defineEmits<{
  (e: 'view-details', reservation: GroceryReservation): void;
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
</script>

<style scoped>
.reservation-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  font-size: 0.875rem;
}

.address-text,
.dietary-text,
.special-requests-text {
  font-size: 0.8rem;
  margin-top: 4px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.allergies-warning {
  background-color: rgba(var(--v-theme-error), 0.08);
  padding: 8px;
  border-radius: 6px;
  margin-top: 8px;
}

.allergy-details {
  font-size: 0.8rem;
  margin-top: 4px;
  color: rgba(var(--v-theme-error), 0.9);
}
</style>
