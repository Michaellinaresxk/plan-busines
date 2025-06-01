<!-- src/UI/components/cards/BabysitterReservationCard.vue -->
<template>
  <BaseReservationCard :client-name="reservation.clientName" :email="reservation.email" :service="getServiceName()"
    :date="reservation.date" :time="getTimeRange()" :is-priority="reservation.isPriority || reservation.hasSpecialNeeds"
    :reservation="reservation" :on-approve="onApprove" :on-reject="onReject" :show-actions="showActions"
    :enable-navigation="enableNavigation" @card-click="handleCardClick" @approve="$emit('approve')"
    @reject="$emit('reject')">
    <!-- Contenido específico para niñera en el slot extra-content -->
    <template #extra-content>
      <div class="babysitter-details">
        <!-- Info principal en línea horizontal -->
        <div class="primary-info">
          <!-- Niños -->
          <div class="info-chip children-chip">
            <v-icon icon="mdi-baby" size="x-small" class="chip-icon"></v-icon>
            <span class="chip-text">{{ getChildrenText() }}</span>
          </div>

          <!-- Edades si están disponibles -->
          <div v-if="hasAges" class="info-chip ages-chip">
            <v-icon icon="mdi-cake-variant" size="x-small" class="chip-icon"></v-icon>
            <span class="chip-text">{{ getAgesText() }}</span>
          </div>

          <!-- Duración aproximada -->
          <div class="info-chip duration-chip">
            <v-icon icon="mdi-clock-outline" size="x-small" class="chip-icon"></v-icon>
            <span class="chip-text">{{ getDurationText() }}</span>
          </div>
        </div>

        <!-- Indicadores especiales -->
        <div v-if="hasSpecialIndicators" class="special-indicators">
          <v-chip v-if="reservation.hasSpecialNeeds" size="x-small" color="warning" variant="outlined"
            prepend-icon="mdi-alert-circle">
            Necesidades especiales
          </v-chip>

          <v-chip v-if="reservation.specialRequests" size="x-small" color="info" variant="outlined"
            prepend-icon="mdi-comment-text-outline">
            Solicitudes especiales
          </v-chip>
        </div>
      </div>
    </template>
  </BaseReservationCard>
</template>

<script setup lang="ts">
import BaseReservationCard from './BaseReservationCard.vue';
import { computed } from 'vue';

interface BabysitterReservation {
  id?: string;
  bookingId?: string;
  clientName: string;
  email?: string;
  date: string;
  startTime: string;
  endTime: string;
  childrenCount: number;
  childrenAges?: string[];
  hasSpecialNeeds?: boolean;
  specialNeedsDetails?: string;
  specialRequests?: string;
  isPriority?: boolean;
}

interface Props {
  reservation: BabysitterReservation;
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
  (e: 'view-details', reservation: BabysitterReservation): void;
  (e: 'approve'): void;
  (e: 'reject'): void;
  (e: 'card-click'): void;
}>();

// Computed properties
const hasAges = computed(() => {
  return props.reservation.childrenAges &&
    props.reservation.childrenAges.length > 0 &&
    props.reservation.childrenAges.some(age => age.trim());
});

const hasSpecialIndicators = computed(() => {
  return props.reservation.hasSpecialNeeds || props.reservation.specialRequests;
});

// Methods
function getServiceName(): string {
  return 'Niñera';
}

function getTimeRange(): string {
  const { startTime, endTime } = props.reservation;
  return `${startTime} - ${endTime}`;
}

function getChildrenText(): string {
  const count = props.reservation.childrenCount;
  return `${count} ${count === 1 ? 'niño' : 'niños'}`;
}

function getAgesText(): string {
  if (!hasAges.value) return '';

  const validAges = props.reservation.childrenAges!
    .filter(age => age.trim())
    .slice(0, 3); // Máximo 3 edades para no saturar

  if (validAges.length > 3) {
    return `${validAges.slice(0, 2).join(', ')}...`;
  }

  return validAges.join(', ');
}

function getDurationText(): string {
  const { startTime, endTime } = props.reservation;

  try {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);

    let diffMs = end.getTime() - start.getTime();

    // Si end es menor que start, asumimos que cruza medianoche
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000; // Añadir 24 horas
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  } catch {
    return `${startTime} - ${endTime}`;
  }
}

function handleCardClick(): void {
  emit('view-details', props.reservation);
  emit('card-click');
}
</script>

<style scoped>
.babysitter-details {
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
  border-radius: 12px;
  padding: 4px 8px;
  border: 1px solid;
}

.children-chip {
  background-color: rgba(var(--v-theme-deep-purple), 0.08);
  border-color: rgba(var(--v-theme-deep-purple), 0.2);
}

.children-chip .chip-icon {
  color: rgb(var(--v-theme-deep-purple));
}

.ages-chip {
  background-color: rgba(var(--v-theme-pink), 0.08);
  border-color: rgba(var(--v-theme-pink), 0.2);
}

.ages-chip .chip-icon {
  color: rgb(var(--v-theme-pink));
}

.duration-chip {
  background-color: rgba(var(--v-theme-indigo), 0.08);
  border-color: rgba(var(--v-theme-indigo), 0.2);
}

.duration-chip .chip-icon {
  color: rgb(var(--v-theme-indigo));
}

.chip-icon {
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
  opacity: 0.9;
}

:deep(.v-theme--dark) .children-chip {
  background-color: rgba(var(--v-theme-deep-purple), 0.15);
  border-color: rgba(var(--v-theme-deep-purple), 0.3);
}

:deep(.v-theme--dark) .ages-chip {
  background-color: rgba(var(--v-theme-pink), 0.15);
  border-color: rgba(var(--v-theme-pink), 0.3);
}

:deep(.v-theme--dark) .duration-chip {
  background-color: rgba(var(--v-theme-indigo), 0.15);
  border-color: rgba(var(--v-theme-indigo), 0.3);
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
