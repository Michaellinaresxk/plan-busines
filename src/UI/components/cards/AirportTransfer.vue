<template>
  <BaseReservationCard :client-name="reservation.clientName" :email="reservation.email" :service="getServiceName()"
    :date="reservation.date" :time="reservation.time" :is-priority="reservation.isPriority" :reservation="reservation"
    :on-approve="onApprove" :on-reject="onReject" :show-actions="showActions" :enable-navigation="enableNavigation"
    @card-click="handleCardClick" @approve="$emit('approve')" @reject="$emit('reject')">
    <template #extra-content>
      <div class="transport-details">
        <!-- Info principal en chips compactos -->
        <div class="info-chips">
          <!-- Vuelo -->
          <div class="info-chip flight-chip">
            <v-icon icon="mdi-airplane" size="12" class="chip-icon" />
            <span class="chip-text">{{ reservation.flightNumber }}</span>
          </div>

          <!-- Vehículo + Pasajeros en un solo chip -->
          <div class="info-chip vehicle-chip">
            <v-icon icon="mdi-car" size="12" class="chip-icon" />
            <span class="chip-text">{{ getVehicleTypeShort(reservation.vehicleType) }}</span>
            <v-divider vertical class="chip-divider" />
            <v-icon icon="mdi-account-group" size="12" class="chip-icon" />
            <span class="chip-text">{{ getPassengersText() }}</span>
          </div>

          <!-- Indicadores especiales compactos -->
          <div v-if="reservation.isRoundTrip" class="info-chip special-chip">
            <v-icon icon="mdi-repeat" size="12" class="chip-icon special-icon" />
            <span class="chip-text">Ida/Vuelta</span>
          </div>

          <div v-if="reservation.needsCarSeat && reservation.carSeatCount" class="info-chip special-chip">
            <v-icon icon="mdi-car-child-seat" size="12" class="chip-icon special-icon" />
            <span class="chip-text">{{ reservation.carSeatCount }} asiento{{ reservation.carSeatCount > 1 ? 's' : ''
              }}</span>
          </div>
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
  gap: 0;
}

.info-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.info-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  padding: 4px 8px;
  border: 1px solid;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  font-size: 0.7rem;
  transition: all 0.2s ease;
}

.info-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.flight-chip {
  background: linear-gradient(135deg, rgba(var(--v-theme-blue), 0.1), rgba(var(--v-theme-blue), 0.05));
  border-color: rgba(var(--v-theme-blue), 0.3);
}

.flight-chip .chip-icon {
  color: rgb(var(--v-theme-blue));
}

.vehicle-chip {
  background: linear-gradient(135deg, rgba(var(--v-theme-green), 0.1), rgba(var(--v-theme-green), 0.05));
  border-color: rgba(var(--v-theme-green), 0.3);
}

.vehicle-chip .chip-icon {
  color: rgb(var(--v-theme-green));
}

.special-chip {
  background: linear-gradient(135deg, rgba(var(--v-theme-orange), 0.1), rgba(var(--v-theme-orange), 0.05));
  border-color: rgba(var(--v-theme-orange), 0.3);
}

.special-icon {
  color: rgb(var(--v-theme-orange));
}

.chip-icon {
  opacity: 0.9;
  flex-shrink: 0;
}

.chip-text {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
  line-height: 1;
}

.chip-divider {
  height: 12px;
  margin: 0 4px;
  opacity: 0.3;
}

/* Dark theme */
:deep(.v-theme--dark) .info-chip {
  background: rgba(var(--v-theme-surface-variant), 0.8);
  backdrop-filter: blur(10px);
}

:deep(.v-theme--dark) .flight-chip {
  background: linear-gradient(135deg, rgba(var(--v-theme-blue), 0.2), rgba(var(--v-theme-blue), 0.1));
  border-color: rgba(var(--v-theme-blue), 0.4);
}

:deep(.v-theme--dark) .vehicle-chip {
  background: linear-gradient(135deg, rgba(var(--v-theme-green), 0.2), rgba(var(--v-theme-green), 0.1));
  border-color: rgba(var(--v-theme-green), 0.4);
}

:deep(.v-theme--dark) .special-chip {
  background: linear-gradient(135deg, rgba(var(--v-theme-orange), 0.2), rgba(var(--v-theme-orange), 0.1));
  border-color: rgba(var(--v-theme-orange), 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .info-chips {
    gap: 4px;
  }

  .info-chip {
    padding: 3px 6px;
    gap: 3px;
  }

  .chip-text {
    font-size: 0.65rem;
  }

  .chip-divider {
    margin: 0 2px;
  }
}

@media (max-width: 480px) {
  .info-chips {
    flex-direction: column;
    align-items: stretch;
    gap: 3px;
  }

  .info-chip {
    justify-content: center;
  }
}
</style>
