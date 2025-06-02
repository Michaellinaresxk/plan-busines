<!-- src/UI/components/cards/DecorationReservationCard.vue -->
<template>
  <BaseReservationCard :client-name="reservation.clientName" :email="reservation.email" :service="getServiceName()"
    :date="reservation.date" :time="reservation.time" :is-priority="reservation.isPriority" :reservation="reservation"
    :on-approve="onApprove" :on-reject="onReject" :show-actions="showActions" :enable-navigation="enableNavigation"
    @card-click="handleCardClick" @approve="$emit('approve')" @reject="$emit('reject')">
    <!-- Contenido específico para decoración en el slot extra-content -->
    <template #extra-content>
      <div class="decoration-details">
        <!-- Info principal en línea horizontal -->
        <div class="primary-info">
          <!-- Ocasión -->
          <div class="info-chip occasion-chip">
            <v-icon icon="mdi-party-popper" size="x-small" class="chip-icon"></v-icon>
            <span class="chip-text">{{ getOccasionLabel(reservation.occasion) }}</span>
          </div>

          <!-- Ubicación -->
          <div class="info-chip location-chip">
            <v-icon icon="mdi-map-marker" size="x-small" class="chip-icon"></v-icon>
            <span class="chip-text">{{ getLocationShort(reservation.location) }}</span>
          </div>

          <!-- Colores si están disponibles -->
          <div v-if="hasColors" class="info-chip colors-chip">
            <v-icon icon="mdi-palette" size="x-small" class="chip-icon"></v-icon>
            <span class="chip-text">{{ getColorsText() }}</span>
          </div>
        </div>

        <!-- Paleta de colores visual -->
        <div v-if="hasColors && showColorPalette" class="color-palette">
          <div class="color-swatches">
            <div v-for="(color, index) in getDisplayColors()" :key="index" class="color-swatch"
              :style="{ backgroundColor: color }" :title="color"></div>
            <div v-if="reservation.colors.length > maxDisplayColors" class="color-more"
              :title="`+${reservation.colors.length - maxDisplayColors} colores más`">
              +{{ reservation.colors.length - maxDisplayColors }}
            </div>
          </div>
        </div>

        <!-- Indicadores especiales -->
        <div v-if="hasSpecialIndicators" class="special-indicators">
          <v-chip v-if="reservation.referenceImage" size="x-small" color="info" variant="outlined"
            prepend-icon="mdi-image" @click.stop="showReferenceImage = true">
            Ver referencia
          </v-chip>

          <v-chip v-if="hasSpecialRequests" size="x-small" color="amber-darken-2" variant="outlined"
            prepend-icon="mdi-star">
            Personalizado
          </v-chip>
        </div>
      </div>
    </template>
  </BaseReservationCard>

  <!-- Diálogo para mostrar la imagen de referencia -->
  <v-dialog v-model="showReferenceImage" max-width="500px">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between py-3">
        <span class="text-h6">Imagen de referencia</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="showReferenceImage = false"></v-btn>
      </v-card-title>

      <v-card-text class="pa-0">
        <v-img :src="reservation.referenceImage" max-height="400" cover class="reference-image">
          <template v-slot:error>
            <div class="error-placeholder">
              <v-icon icon="mdi-image-broken" size="large" color="grey"></v-icon>
              <p class="text-caption mt-2">No se pudo cargar la imagen</p>
            </div>
          </template>
        </v-img>
      </v-card-text>

      <v-card-actions class="pa-3">
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="showReferenceImage = false">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import BaseReservationCard from './BaseReservationCard.vue';
import { computed, ref } from 'vue';

interface CustomDecorationReservation {
  id?: string;
  bookingId?: string;
  clientName: string;
  email?: string;
  date: string;
  time?: string;
  occasion: string;
  location: string;
  exactAddress?: string;
  colors?: string[];
  referenceImage?: string;
  specialRequests?: string;
  isPriority?: boolean;
}

interface Props {
  reservation: CustomDecorationReservation;
  onApprove?: (id: string) => Promise<boolean>;
  onReject?: (id: string) => Promise<boolean>;
  showActions?: boolean;
  enableNavigation?: boolean;
  showColorPalette?: boolean;
  maxDisplayColors?: number;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  enableNavigation: true,
  showColorPalette: true,
  maxDisplayColors: 4
});

const emit = defineEmits<{
  (e: 'view-details', reservation: CustomDecorationReservation): void;
  (e: 'approve'): void;
  (e: 'reject'): void;
  (e: 'card-click'): void;
}>();

// Estado local
const showReferenceImage = ref(false);

// Computed properties
const hasColors = computed(() => {
  return props.reservation.colors && props.reservation.colors.length > 0;
});

const hasSpecialRequests = computed(() => {
  return !!(props.reservation.specialRequests && props.reservation.specialRequests.trim());
});

const hasSpecialIndicators = computed(() => {
  return props.reservation.referenceImage || hasSpecialRequests.value;
});

// Methods
function getServiceName(): string {
  return 'Decoración';
}

function getOccasionLabel(occasion: string): string {
  const occasions: Record<string, string> = {
    'birthday': 'Cumpleaños',
    'anniversary': 'Aniversario',
    'proposal': 'Propuesta',
    'romantic': 'Romántico',
    'baby-shower': 'Baby Shower',
    'wedding': 'Boda',
    'graduation': 'Graduación',
    'corporate': 'Corporativo'
  };

  return occasions[occasion] || occasion;
}

function getLocationShort(location: string): string {
  if (!location) return '';

  // Truncar ubicación si es muy larga
  if (location.length > 15) {
    return location.substring(0, 15) + '...';
  }

  return location;
}

function getColorsText(): string {
  if (!hasColors.value) return '';

  const count = props.reservation.colors!.length;
  return `${count} color${count === 1 ? '' : 'es'}`;
}

function getDisplayColors(): string[] {
  if (!hasColors.value) return [];

  return props.reservation.colors!.slice(0, props.maxDisplayColors);
}

function handleCardClick(): void {
  emit('view-details', props.reservation);
  emit('card-click');
}
</script>

<style scoped>
.decoration-details {
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

.occasion-chip {
  background-color: rgba(var(--v-theme-amber-darken-2), 0.08);
  border-color: rgba(var(--v-theme-amber-darken-2), 0.2);
}

.occasion-chip .chip-icon {
  color: rgb(var(--v-theme-amber-darken-2));
}

.location-chip {
  background-color: rgba(var(--v-theme-teal), 0.08);
  border-color: rgba(var(--v-theme-teal), 0.2);
}

.location-chip .chip-icon {
  color: rgb(var(--v-theme-teal));
}

.colors-chip {
  background-color: rgba(var(--v-theme-purple), 0.08);
  border-color: rgba(var(--v-theme-purple), 0.2);
}

.colors-chip .chip-icon {
  color: rgb(var(--v-theme-purple));
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

.color-palette {
  margin-top: 4px;
}

.color-swatches {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}

.color-swatch {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.color-more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background-color: rgba(var(--v-theme-on-surface), 0.1);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  font-size: 0.6rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  cursor: help;
}

.special-indicators {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

/* Dialog styles */
.reference-image {
  border-radius: 0;
}

.error-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
}

/* Dark theme adjustments */
:deep(.v-theme--dark) .info-chip {
  opacity: 0.9;
}

:deep(.v-theme--dark) .occasion-chip {
  background-color: rgba(var(--v-theme-amber-darken-2), 0.15);
  border-color: rgba(var(--v-theme-amber-darken-2), 0.3);
}

:deep(.v-theme--dark) .location-chip {
  background-color: rgba(var(--v-theme-teal), 0.15);
  border-color: rgba(var(--v-theme-teal), 0.3);
}

:deep(.v-theme--dark) .colors-chip {
  background-color: rgba(var(--v-theme-purple), 0.15);
  border-color: rgba(var(--v-theme-purple), 0.3);
}

:deep(.v-theme--dark) .color-swatch {
  border-color: rgba(255, 255, 255, 0.2);
}

:deep(.v-theme--dark) .color-more {
  background-color: rgba(var(--v-theme-on-surface), 0.15);
  border-color: rgba(var(--v-theme-on-surface), 0.3);
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

  .color-swatches {
    gap: 3px;
  }

  .color-swatch,
  .color-more {
    width: 14px;
    height: 14px;
  }

  .color-more {
    font-size: 0.55rem;
  }
}
</style>
