<template>
  <BaseReservationCard :reservation="reservation" :onApprove="onApprove" :onReject="onReject"
    @view-details="$emit('view-details', reservation)">
    <div class="reservation-details">
      <!-- Fecha y Hora -->
      <div class="detail-item">
        <v-icon icon="mdi-calendar" size="small" color="amber-darken-2" class="mr-2"></v-icon>
        <span class="font-weight-medium">{{ formatDate(reservation.date) }} - {{ reservation.time }}</span>
      </div>

      <!-- Ocasión -->
      <div class="detail-item">
        <v-icon icon="mdi-party-popper" size="small" color="amber-darken-2" class="mr-2"></v-icon>
        <span>{{ getOccasionLabel(reservation.occasion) }}</span>
      </div>

      <!-- Ubicación -->
      <div class="detail-item">
        <v-icon icon="mdi-map-marker" size="small" color="amber-darken-2" class="mr-2"></v-icon>
        <span>{{ reservation.location }}</span>
      </div>

      <!-- Dirección -->
      <div class="detail-item">
        <v-icon icon="mdi-home" size="small" color="amber-darken-2" class="mr-2"></v-icon>
        <div>
          <span class="font-weight-medium">Dirección:</span>
          <p class="address-text">{{ reservation.exactAddress }}</p>
        </div>
      </div>

      <!-- Colores -->
      <div v-if="reservation.colors && reservation.colors.length > 0" class="detail-item">
        <v-icon icon="mdi-palette" size="small" color="amber-darken-2" class="mr-2"></v-icon>
        <div class="d-flex flex-column">
          <span class="font-weight-medium">Colores:</span>
          <div class="color-swatches">
            <div v-for="(color, index) in reservation.colors" :key="index" class="color-swatch"
              :style="{ backgroundColor: color }" :title="color"></div>
          </div>
        </div>
      </div>

      <!-- Imagen de referencia -->
      <div v-if="reservation.referenceImage" class="detail-item">
        <v-icon icon="mdi-image" size="small" color="amber-darken-2" class="mr-2"></v-icon>
        <div class="d-flex flex-column">
          <span class="font-weight-medium">Imagen de referencia:</span>
          <v-btn variant="text" color="primary" size="small" prepend-icon="mdi-eye" @click="showReferenceImage = true">
            Ver imagen
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Diálogo para mostrar la imagen de referencia -->
    <v-dialog v-model="showReferenceImage" max-width="600px">
      <v-card>
        <v-card-title class="text-h6">
          Imagen de referencia
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="showReferenceImage = false"></v-btn>
        </v-card-title>
        <v-card-text class="text-center">
          <v-img :src="reservation.referenceImage" max-height="400" contain class="mx-auto"></v-img>
        </v-card-text>
      </v-card>
    </v-dialog>
  </BaseReservationCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CustomDecorationReservation } from '@/types/reservations';
import BaseReservationCard from './BaseReservationCard.vue';

// Propiedades
const props = defineProps<{
  reservation: CustomDecorationReservation;
  onApprove: (id: string) => Promise<boolean>;
  onReject: (id: string) => Promise<boolean>;
}>();

// Eventos
const emit = defineEmits<{
  (e: 'view-details', reservation: CustomDecorationReservation): void;
}>();

// Estado
const showReferenceImage = ref(false);

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

// Método para obtener etiqueta de la ocasión
function getOccasionLabel(occasion: string): string {
  const occasions: Record<string, string> = {
    'birthday': 'Cumpleaños',
    'anniversary': 'Aniversario',
    'proposal': 'Propuesta',
    'romantic': 'Romántico',
    'baby-shower': 'Baby Shower'
  };

  return occasions[occasion] || occasion;
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

.address-text {
  font-size: 0.8rem;
  margin-top: 4px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.color-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
