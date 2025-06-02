<!-- src/UI/components/cards/TransportReservationCard.vue -->
<template>
  <BaseReservationCard :client-name="reservation.clientName" :email="reservation.email" :service="getServiceName()"
    :date="reservation.date" :time="reservation.time" :is-priority="reservation.isPriority" :reservation="reservation"
    :on-approve="onApprove" :on-reject="onReject" :show-actions="showActions" :enable-navigation="enableNavigation"
    @card-click="handleCardClick" @approve="$emit('approve')" @reject="$emit('reject')">
    <!-- Contenido específico para transporte en el slot extra-content -->
    <template #extra-content>
      <div class="transport-details">
        <!-- Info principal en línea horizontal -->
        <div class="primary-info">
          <!-- Vuelo -->
          <div class="info-chip">
            <v-icon icon="mdi-airplane" size="x-small" class="chip-icon"></v-icon>
            <span class="chip-text">{{ reservation.flightNumber }}</span>
          </div>

          <!-- Vehículo -->
          <div class="info-chip">
            <v-icon icon="mdi-car" size="x-small" class="chip-icon"></v-icon>
            <span class="chip-text">{{ getVehicleTypeShort(reservation.vehicleType) }}</span>
          </div>

          <!-- Pasajeros -->
          <div class="info-chip">
            <v-icon icon="mdi-account-group" size="x-small" class="chip-icon"></v-icon>
            <span class="chip-text">{{ getPassengersText() }}</span>
          </div>
        </div>

        <!-- Indicadores especiales -->
        <div v-if="hasSpecialIndicators" class="special-indicators">
          <v-chip v-if="reservation.isRoundTrip" size="x-small" color="info" variant="outlined"
            prepend-icon="mdi-repeat">
            Ida/Vuelta
          </v-chip>

          <v-chip v-if="reservation.needsCarSeat && reservation.carSeatCount" size="x-small" color="warning"
            variant="outlined" prepend-icon="mdi-car-child-seat">
            {{ reservation.carSeatCount }} asiento{{ reservation.carSeatCount > 1 ? 's' : '' }}
          </v-chip>
        </div>
      </div>
    </template>
  </BaseReservationCard>
</template>

<script setup lang="ts">
import BaseReservationCard from './BaseReservationCard.vue';
import { computed } from 'vue';

interface TransportReservation {
  id?: string;
  bookingId?: string;
  clientName: string;
  email?: string;
  date: string;
  time?: string;
  flightNumber: string;
  vehicleType: string;
  passengerCount: number;
  kidsCount?: number;
  isRoundTrip?: boolean;
  returnDate?: string;
  needsCarSeat?: boolean;
  carSeatCount?: number;
  isPriority?: boolean;
}

interface Props {
  reservation: TransportReservation;
  onApprove?: (id: string) => Promise<boolean>;
  onReject?: (id: string) => Promise<boolean>;
  showActions?: boolean;
  enableNavigation?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  enableNavigation: true
});

const emit = defineEmits<{
  (e: 'view-details', reservation: TransportReservation): void;
  (e: 'approve'): void;
  (e: 'reject'): void;
  (e: 'card-click'): void;
}>();

// Computed properties
const hasSpecialIndicators = computed(() => {
  return props.reservation.isRoundTrip ||
    (props.reservation.needsCarSeat && props.reservation.carSeatCount);
});

// Methods
function getServiceName(): string {
  return 'Transporte Aeropuerto';
}

function getVehicleTypeShort(vehicleType: string): string {
  const vehicleTypesShort: Record<string, string> = {
    'vanSmall': 'Van S',
    'vanMedium': 'Van M',
    'vanLarge': 'Van L',
    'suv': 'SUV'
  };

  return vehicleTypesShort[vehicleType] || vehicleType;
}

function getPassengersText(): string {
  const { passengerCount, kidsCount } = props.reservation;

  if (kidsCount && kidsCount > 0) {
    return `${passengerCount}+${kidsCount}`;
  }

  return `${passengerCount}p`;
}

function handleCardClick(): void {
  emit('view-details', props.reservation);
  emit('card-click');
}
</script>

<style scoped>
.transport-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.primary-info {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.info-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: rgba(var(--v-theme-primary), 0.08);
  border-radius: 12px;
  padding: 4px 8px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.chip-icon {
  color: rgb(var(--v-theme-primary));
  opacity: 0.8;
}

.chip-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
}

.special-indicators {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

/* Dark theme adjustments */
:deep(.v-theme--dark) .info-chip {
  background-color: rgba(var(--v-theme-primary), 0.12);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

/* Responsive */
@media (max-width: 600px) {
  .primary-info {
    gap: 4px;
  }

  .info-chip {
    padding: 3px 6px;
  }

  .chip-text {
    font-size: 0.7rem;
  }
}
</style>
