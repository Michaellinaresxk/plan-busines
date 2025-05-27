<template>
  <div class="service-details">
    <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
      <v-icon icon="mdi-baby" size="24" color="deep-purple" class="mr-2"></v-icon>
      Detalles del Servicio de Niñera
    </h3>

    <div class="details-grid">
      <!-- Horario y Fecha -->
      <div class="detail-section">
        <h4 class="section-title">
          <v-icon icon="mdi-clock-outline" size="18" class="mr-2"></v-icon>
          Horario del Servicio
        </h4>

        <div class="detail-list">
          <div class="detail-row">
            <span class="detail-label">Fecha:</span>
            <span class="detail-value font-weight-bold">{{ formatDate(reservation.date) }}</span>
          </div>

          <div class="detail-row highlighted">
            <span class="detail-label">Horario:</span>
            <span class="detail-value font-weight-bold">
              {{ reservation.startTime }} - {{ reservation.endTime }}
            </span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Duración aproximada:</span>
            <span class="detail-value">{{ calculateDuration(reservation.startTime, reservation.endTime) }}</span>
          </div>
        </div>
      </div>

      <!-- Información de los Niños -->
      <div class="detail-section">
        <h4 class="section-title">
          <v-icon icon="mdi-account-child" size="18" class="mr-2"></v-icon>
          Información de los Niños
        </h4>

        <div class="detail-list">
          <div class="detail-row highlighted">
            <span class="detail-label">Número de niños:</span>
            <span class="detail-value font-weight-bold">
              {{ reservation.childrenCount }} {{ reservation.childrenCount === 1 ? 'niño' : 'niños' }}
            </span>
          </div>

          <div v-if="reservation.childrenAges && reservation.childrenAges.length > 0" class="detail-row">
            <span class="detail-label">Edades:</span>
            <span class="detail-value">{{ formatAges(reservation.childrenAges) }}</span>
          </div>
        </div>
      </div>

      <!-- Necesidades Especiales -->
      <div v-if="reservation.hasSpecialNeeds" class="detail-section special-needs full-width">
        <h4 class="section-title">
          <v-icon icon="mdi-alert-circle" size="18" color="warning" class="mr-2"></v-icon>
          Necesidades Especiales
        </h4>

        <v-alert color="warning" variant="tonal" class="mb-4">
          <div class="d-flex align-start">
            <v-icon icon="mdi-alert" class="mr-2 mt-1"></v-icon>
            <div>
              <div class="font-weight-bold mb-2">Este servicio requiere atención especial</div>
              <div v-if="reservation.specialNeedsDetails" class="text-body-2">
                {{ reservation.specialNeedsDetails }}
              </div>
            </div>
          </div>
        </v-alert>
      </div>

      <!-- Información Adicional -->
      <div v-if="reservation.specialRequests || reservation.notes" class="detail-section full-width">
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

function formatAges(ages: string[]): string {
  if (!ages || ages.length === 0) return '';
  return ages.filter(age => age.trim()).join(', ') + ' años';
}

function calculateDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return '';

  try {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);

    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return diffMinutes > 0 ? `${diffHours}h ${diffMinutes}min` : `${diffHours}h`;
    }
    return `${diffMinutes}min`;
  } catch (error) {
    return '';
  }
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

.detail-section.special-needs {
  border-color: rgba(var(--v-theme-warning), 0.3);
  background-color: rgba(var(--v-theme-warning), 0.05);
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
  background-color: rgba(var(--v-theme-deep-purple), 0.05);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-deep-purple), 0.2);
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
  background-color: rgba(var(--v-theme-deep-purple), 0.05);
  padding: 16px;
  border-radius: 8px;
}

.info-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-deep-purple), 0.8);
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
