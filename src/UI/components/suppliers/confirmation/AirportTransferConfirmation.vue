<template>
  <div class="service-details">
    <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
      <v-icon icon="mdi-airplane" size="24" color="blue-darken-2" class="mr-2"></v-icon>
      Detalles del Transporte Aeropuerto
    </h3>

    <div class="details-grid">
      <!-- Información de Vuelo -->
      <div class="detail-section">
        <h4 class="section-title">
          <v-icon icon="mdi-airplane-takeoff" size="18" class="mr-2"></v-icon>
          Información de Vuelo
        </h4>

        <div class="detail-list">
          <div class="detail-row">
            <span class="detail-label">Número de vuelo:</span>
            <span class="detail-value font-weight-bold">{{ reservation.flightNumber }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Fecha y hora:</span>
            <span class="detail-value">{{ formatDateTime(reservation.date, reservation.time) }}</span>
          </div>

          <div v-if="reservation.isRoundTrip" class="detail-row">
            <span class="detail-label">Viaje de regreso:</span>
            <span class="detail-value">{{ formatDate(reservation.returnDate) }}</span>
          </div>

          <div v-if="reservation.returnFlightNumber" class="detail-row">
            <span class="detail-label">Vuelo de regreso:</span>
            <span class="detail-value font-weight-bold">{{ reservation.returnFlightNumber }}</span>
          </div>
        </div>
      </div>

      <!-- Vehículo y Pasajeros -->
      <div class="detail-section">
        <h4 class="section-title">
          <v-icon icon="mdi-car" size="18" class="mr-2"></v-icon>
          Vehículo y Pasajeros
        </h4>

        <div class="detail-list">
          <div class="detail-row highlighted">
            <span class="detail-label">Tipo de vehículo:</span>
            <span class="detail-value font-weight-bold">{{ getVehicleTypeLabel(reservation.vehicleType) }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Pasajeros adultos:</span>
            <span class="detail-value">{{ reservation.passengerCount || 0 }}</span>
          </div>

          <div v-if="reservation.kidsCount" class="detail-row">
            <span class="detail-label">Niños:</span>
            <span class="detail-value">{{ reservation.kidsCount }}</span>
          </div>

          <div v-if="reservation.needsCarSeat" class="detail-row special">
            <span class="detail-label">
              <v-icon icon="mdi-car-child-seat" size="16" color="warning" class="mr-1"></v-icon>
              Asientos para niños:
            </span>
            <span class="detail-value font-weight-bold text-warning">
              {{ reservation.carSeatCount || 1 }} {{ (reservation.carSeatCount || 1) === 1 ? 'asiento' : 'asientos' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Información Adicional -->
      <div v-if="reservation.notes || reservation.specialRequests" class="detail-section full-width">
        <h4 class="section-title">
          <v-icon icon="mdi-note-text" size="18" class="mr-2"></v-icon>
          Información Adicional
        </h4>

        <div class="additional-info">
          <div v-if="reservation.notes" class="info-block">
            <div class="info-title">Notas del cliente:</div>
            <div class="info-content">{{ reservation.notes }}</div>
          </div>

          <div v-if="reservation.specialRequests" class="info-block">
            <div class="info-title">Solicitudes especiales:</div>
            <div class="info-content">{{ reservation.specialRequests }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
const props = defineProps<{
  reservation: any;
}>();

// Utility functions
function formatDate(dateString: string): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

function formatDateTime(dateString: string, timeString: string): string {
  const formattedDate = formatDate(dateString);
  return timeString ? `${formattedDate} a las ${timeString}` : formattedDate;
}

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
.service-details {
  width: 100%;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 16px;
}

.detail-section {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row.highlighted {
  background-color: rgba(var(--v-theme-primary), 0.05);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.detail-row.special {
  background-color: rgba(var(--v-theme-warning), 0.05);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-warning), 0.2);
}

.detail-label {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-weight: 500;
}

.detail-value {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.87);
  text-align: right;
}

.additional-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-block {
  background-color: rgba(var(--v-theme-primary), 0.05);
  padding: 16px;
  border-radius: 8px;
}

.info-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-primary), 0.8);
  margin-bottom: 8px;
}

.info-content {
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

/* Responsive */
@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .detail-value {
    text-align: left;
  }
}
</style>
