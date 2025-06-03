<!-- src/UI/components/cards/BabysitterReservationCard.vue - Versión Optimizada -->
<template>
  <BaseReservationCard :client-name="reservation.clientName" :email="reservation.email" :service="getServiceName()"
    :date="reservation.date" :time="getTimeRange()" :is-priority="reservation.isPriority || reservation.hasSpecialNeeds"
    :reservation="reservation" :on-approve="onApprove" :on-reject="onReject" :show-actions="showActions"
    :enable-navigation="enableNavigation" @card-click="handleCardClick" @approve="$emit('approve')"
    @reject="$emit('reject')">
    <template #extra-content>
      <div class="babysitter-details">
        <div class="info-chips-grid">
          <!-- Niños con duración -->
          <div class="info-chip-modern chip-babysitter">
            <v-icon icon="mdi-baby" size="12" class="chip-icon" />
            <span class="chip-text">{{ getChildrenText() }}</span>
            <div class="chip-divider"></div>
            <v-icon icon="mdi-clock-outline" size="12" class="chip-icon" />
            <span class="chip-text">{{ getDurationText() }}</span>
          </div>

          <!-- Edades si están disponibles -->
          <div v-if="hasAges" class="info-chip-modern chip-neutral">
            <v-icon icon="mdi-cake-variant" size="12" class="chip-icon" />
            <span class="chip-text">{{ getAgesText() }}</span>
          </div>

          <!-- Necesidades especiales -->
          <div v-if="reservation.hasSpecialNeeds" class="info-chip-modern chip-special">
            <v-icon icon="mdi-alert-circle" size="12" class="chip-icon" />
            <span class="chip-text">Necesidades especiales</span>
          </div>

          <!-- Solicitudes especiales -->
          <div v-if="reservation.specialRequests" class="info-chip-modern chip-neutral">
            <v-icon icon="mdi-comment-text-outline" size="12" class="chip-icon" />
            <span class="chip-text">Con solicitudes</span>
          </div>
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
    .slice(0, 3);

  if (validAges.length > 2) {
    return `${validAges.slice(0, 2).join(', ')}...`;
  }

  return validAges.join(', ') + ' años';
}

function getDurationText(): string {
  const { startTime, endTime } = props.reservation;

  try {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);

    let diffMs = end.getTime() - start.getTime();

    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000;
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    }
  } catch {
    return 'Duración no disponible';
  }
}

function handleCardClick(): void {
  emit('view-details', props.reservation);
  emit('card-click');
}
</script>

<style scoped>
.babysitter-details {
  padding: 0;
}

.info-chips-grid {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

/* Aplicar el sistema de diseño */
.info-chip-modern {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid;
  font-size: 0.7rem;
  font-weight: 500;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.info-chip-modern:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chip-babysitter {
  background: linear-gradient(135deg, rgba(var(--v-theme-deep-purple), 0.1), rgba(var(--v-theme-deep-purple), 0.05));
  border-color: rgba(var(--v-theme-deep-purple), 0.3);
}

.chip-babysitter .chip-icon {
  color: rgb(var(--v-theme-deep-purple));
}

.chip-neutral {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface-variant), 0.3), rgba(var(--v-theme-surface-variant), 0.1));
  border-color: rgba(var(--v-theme-outline), 0.2);
}

.chip-neutral .chip-icon {
  color: rgb(var(--v-theme-on-surface-variant));
}

.chip-special {
  background: linear-gradient(135deg, rgba(var(--v-theme-orange), 0.1), rgba(var(--v-theme-orange), 0.05));
  border-color: rgba(var(--v-theme-orange), 0.3);
}

.chip-special .chip-icon {
  color: rgb(var(--v-theme-orange));
}

.chip-icon {
  flex-shrink: 0;
  opacity: 0.9;
}

.chip-text {
  white-space: nowrap;
  line-height: 1;
  color: rgb(var(--v-theme-on-surface));
}

.chip-divider {
  width: 1px;
  height: 12px;
  background: currentColor;
  opacity: 0.3;
  margin: 0 4px;
}

/* Dark theme */
:deep(.v-theme--dark) .info-chip-modern {
  background: rgba(var(--v-theme-surface-variant), 0.8);
  backdrop-filter: blur(10px);
}

:deep(.v-theme--dark) .chip-babysitter {
  background: linear-gradient(135deg, rgba(var(--v-theme-deep-purple), 0.2), rgba(var(--v-theme-deep-purple), 0.1));
  border-color: rgba(var(--v-theme-deep-purple), 0.4);
}

:deep(.v-theme--dark) .chip-special {
  background: linear-gradient(135deg, rgba(var(--v-theme-orange), 0.2), rgba(var(--v-theme-orange), 0.1));
  border-color: rgba(var(--v-theme-orange), 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .info-chips-grid {
    gap: 4px;
  }

  .info-chip-modern {
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
  .info-chips-grid {
    flex-direction: column;
    align-items: stretch;
    gap: 3px;
  }

  .info-chip-modern {
    justify-content: center;
  }
}
</style>
