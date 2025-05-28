<template>
  <div class="service-details">
    <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
      <v-icon icon="mdi-party-popper" size="24" color="amber-darken-2" class="mr-2"></v-icon>
      Detalles de Decoración Personalizada
    </h3>

    <div class="details-grid">
      <!-- Evento y Fecha -->
      <div class="detail-section">
        <h4 class="section-title">
          <v-icon icon="mdi-calendar-heart" size="18" class="mr-2"></v-icon>
          Información del Evento
        </h4>

        <div class="detail-list">
          <div class="detail-row highlighted">
            <span class="detail-label">Ocasión:</span>
            <span class="detail-value font-weight-bold">{{ getOccasionLabel(reservation.occasion) }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Fecha:</span>
            <span class="detail-value">{{ formatDate(reservation.date) }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Hora:</span>
            <span class="detail-value">{{ reservation.time }}</span>
          </div>
        </div>
      </div>

      <!-- Ubicación -->
      <div class="detail-section">
        <h4 class="section-title">
          <v-icon icon="mdi-map-marker" size="18" class="mr-2"></v-icon>
          Ubicación
        </h4>

        <div class="detail-list">
          <div class="detail-row">
            <span class="detail-label">Lugar:</span>
            <span class="detail-value font-weight-bold">{{ reservation.location }}</span>
          </div>

          <div v-if="reservation.exactAddress" class="detail-row">
            <span class="detail-label">Dirección exacta:</span>
            <span class="detail-value">{{ reservation.exactAddress }}</span>
          </div>
        </div>
      </div>

      <!-- Colores y Estilo -->
      <div v-if="reservation.colors && reservation.colors.length > 0" class="detail-section full-width">
        <h4 class="section-title">
          <v-icon icon="mdi-palette" size="18" class="mr-2"></v-icon>
          Colores y Estilo
        </h4>

        <div class="colors-container">
          <div class="colors-grid">
            <div v-for="(color, index) in reservation.colors" :key="index" class="color-item">
              <div class="color-swatch" :style="{ backgroundColor: color }"></div>
              <span class="color-name">{{ color }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Imagen de Referencia -->
      <div v-if="reservation.referenceImage" class="detail-section full-width">
        <h4 class="section-title">
          <v-icon icon="mdi-image" size="18" class="mr-2"></v-icon>
          Imagen de Referencia
        </h4>

        <div class="reference-image-container">
          <v-img :src="reservation.referenceImage" max-height="300" class="reference-image" cover rounded="lg">
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>
            </template>
          </v-img>

          <div class="image-actions mt-3">
            <v-btn color="primary" variant="outlined" prepend-icon="mdi-eye" @click="openImageDialog">
              Ver imagen completa
            </v-btn>
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
          <div v-if="reservation.specialRequests" class="info-block">
            <div class="info-title">Solicitudes especiales:</div>
            <div class="info-content">{{ reservation.specialRequests }}</div>
          </div>

          <div v-if="reservation.notes" class="info-block">
            <div class="info-title">Notas del cliente:</div>
            <div class="info-content">{{ reservation.notes }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Dialog -->
    <v-dialog v-model="showImageDialog" max-width="800px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Imagen de Referencia</span>
          <v-btn icon="mdi-close" variant="text" @click="showImageDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-0">
          <v-img :src="reservation.referenceImage" max-height="600" contain></v-img>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Props
const props = defineProps<{
  reservation: any;
}>();

// State
const showImageDialog = ref(false);

// Methods
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

function getOccasionLabel(occasion: string): string {
  const occasions: Record<string, string> = {
    'birthday': 'Cumpleaños',
    'anniversary': 'Aniversario',
    'proposal': 'Propuesta de Matrimonio',
    'romantic': 'Cena Romántica',
    'baby-shower': 'Baby Shower',
    'wedding': 'Boda',
    'graduation': 'Graduación',
    'corporate': 'Evento Corporativo'
  };

  return occasions[occasion] || occasion;
}

function openImageDialog() {
  showImageDialog.value = true;
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
  background-color: rgba(var(--v-theme-amber-darken-2), 0.05);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-amber-darken-2), 0.2);
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

.colors-container {
  margin-top: 12px;
}

.colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.color-swatch {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.color-name {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.reference-image-container {
  margin-top: 12px;
}

.reference-image {
  border: 2px solid rgba(var(--v-theme-primary), 0.1);
}

.additional-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-block {
  background-color: rgba(var(--v-theme-amber-darken-2), 0.05);
  padding: 16px;
  border-radius: 8px;
}

.info-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-amber-darken-2), 0.8);
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

  .colors-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
}
</style>
