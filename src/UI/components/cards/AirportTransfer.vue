<template>
  <BaseReservationCard :reservation="reservation" :onApprove="onApprove" :onReject="onReject"
    @view-details="$emit('view-details', reservation)" @approve="$emit('approve')" @reject="$emit('reject')">
    <div class="reservation-details">
      <!-- Fecha y Hora -->
      <div class="detail-item">
        <v-icon icon="mdi-calendar" size="small" color="primary" class="mr-2"></v-icon>
        <span class="font-weight-medium">{{ formatDate(reservation.date) }}</span>
      </div>

      <!-- Tipo de vehículo -->
      <div class="detail-item">
        <v-icon icon="mdi-car" size="small" color="primary" class="mr-2"></v-icon>
        <span>{{ getVehicleTypeLabel(reservation.vehicleType) }}</span>
      </div>

      <!-- Número de vuelo -->
      <div class="detail-item">
        <v-icon icon="mdi-airplane" size="small" color="primary" class="mr-2"></v-icon>
        <span>Vuelo: {{ reservation.flightNumber }}</span>
      </div>

      <!-- Viaje de ida y vuelta -->
      <div v-if="reservation.isRoundTrip" class="detail-item">
        <v-icon icon="mdi-repeat" size="small" color="primary" class="mr-2"></v-icon>
        <span>Ida y vuelta - Regreso: {{ formatDate(reservation.returnDate) }}</span>
      </div>

      <!-- Pasajeros -->
      <div class="detail-item">
        <v-icon icon="mdi-account-group" size="small" color="primary" class="mr-2"></v-icon>
        <span>{{ reservation.passengerCount }} pasajeros{{ reservation.kidsCount ? `, ${reservation.kidsCount} niños` :
          '' }}</span>
      </div>

      <!-- Asientos para niños -->
      <div v-if="reservation.needsCarSeat && reservation.carSeatCount" class="detail-item">
        <v-icon icon="mdi-car-child-seat" size="small" color="warning" class="mr-2"></v-icon>
        <span>{{ reservation.carSeatCount }} {{ reservation.carSeatCount === 1 ? 'asiento' : 'asientos' }} para
          niños</span>
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
  (e: 'view-details', reservation: any): void;
  (e: 'approve'): void;
  (e: 'reject'): void;
}>();

// Método para formatear fechas
function formatDate(date: string): string {
  if (!date) return '';

  // Si es ya está en formato DD/MM/YYYY, devuélvelo como está
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    return date;
  }

  try {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return date;
  }
}

// Método para obtener etiqueta del tipo de vehículo
function getVehicleTypeLabel(vehicleType: string): string {
  const vehicleTypes: Record<string, string> = {
    'vanSmall': 'Van Pequeña (1-6 personas)',
    'vanMedium': 'Van Mediana (7-10 personas)',
    'vanLarge': 'Van Grande (11-16 personas)',
    'suv': 'SUV (1-6 personas)'
  };

  return vehicleTypes[vehicleType] || vehicleType;
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
  align-items: center;
  font-size: 0.875rem;
}
</style>
