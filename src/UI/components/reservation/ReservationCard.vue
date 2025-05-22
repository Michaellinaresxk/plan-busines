<template>
  <v-card elevation="0" class="reservation-card" :class="{ 'priority-card': reservation.isPriority }">
    <!-- Indicador de prioridad sutil -->
    <div v-if="reservation.isPriority" class="priority-indicator"></div>

    <div class="card-content">
      <!-- Encabezado con información del cliente -->
      <div class="client-section">
        <v-avatar class="client-avatar" size="40">
          <!-- {{ getInitials(reservation.clientName) }} -->
        </v-avatar>

        <div class="client-info">
          <div class="d-flex align-center">
            <h3 class="client-name">{{ reservation.clientName }}</h3>
            <v-tooltip v-if="reservation.isPriority" text="Cliente prioritario">
              <template v-slot:activator="{ props }">
                <v-icon icon="mdi-priority-high" color="error" size="x-small" class="ml-2" v-bind="props"></v-icon>
              </template>
            </v-tooltip>
          </div>
          <div class="client-email">
            <span>{{ reservation.email }}</span>
          </div>
        </div>
      </div>

      <!-- Sección de servicio -->
      <div class="service-section">
        <v-chip size="small" color="primary" variant="flat" class="service-chip" density="comfortable">
          {{ reservation.service }}
        </v-chip>
      </div>

      <!-- Detalles organizados -->
      <div class="details-section">
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-header">
              <v-icon icon="mdi-calendar-outline" size="small" color="primary" class="detail-icon"></v-icon>
              <span class="detail-label">Fecha</span>
            </div>
            <div class="detail-value">{{ reservation.date }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-header">
              <v-icon icon="mdi-clock-outline" size="small" color="primary" class="detail-icon"></v-icon>
              <span class="detail-label">Hora</span>
            </div>
            <div class="detail-value">{{ reservation.time }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-header">
              <v-icon icon="mdi-phone-outline" size="small" color="primary" class="detail-icon"></v-icon>
              <span class="detail-label">Teléfono</span>
            </div>
            <div class="detail-value">{{ reservation.phone }}</div>
          </div>
        </div>
      </div>

      <!-- Notas (si existen) -->
      <div v-if="reservation.notes" class="notes-section">
        <div class="notes-content">
          <v-icon icon="mdi-text-box-outline" size="small" class="notes-icon"></v-icon>
          <p class="notes-text">{{ reservation.notes }}</p>
        </div>
      </div>

      <!-- Pie de tarjeta con acciones -->
      <div class="card-footer">
        <div class="time-ago">
          <v-icon icon="mdi-clock-time-four-outline" size="x-small" class="time-icon"></v-icon>
          <span>Solicitado hace {{ reservation.timeAgo }}</span>
        </div>

        <div class="action-buttons">
          <v-btn color="error" size="small" variant="text" class="action-button" @click="$emit('reject', reservation)">
            Rechazar
          </v-btn>
          <v-btn color="primary" size="small" variant="tonal" class="action-button ml-2"
            @click="$emit('approve', reservation)">
            Aprobar
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
// import { getInitials } from '@/composables/useReservations';


// Props
const props = defineProps<{
  reservation,
}>();

// Emits
const emit = defineEmits<{
  (e: 'approve', reservation): void;
  (e: 'reject', reservation): void;
}>();
</script>

<style scoped>
.reservation-card {
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  overflow: hidden;
  position: relative;
  transition: all 0.2s ease;
  margin-bottom: 16px;
}

.reservation-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
  border-color: rgba(var(--v-theme-primary), 0.15);
}

.priority-card {
  border-color: rgba(var(--v-theme-error), 0.15);
}

.priority-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, rgb(var(--v-theme-error)), rgba(var(--v-theme-error), 0.5));
}

.card-content {
  padding: 16px;
}

/* Sección del cliente */
.client-section {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}

.client-avatar {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.8), rgba(var(--v-theme-primary), 0.5));
  color: white;
  font-weight: 600;
  margin-right: 12px;
}

.client-info {
  flex: 1;
  min-width: 0;
}

.client-name {
  font-size: 0.94rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.client-email {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

/* Sección del servicio */
.service-section {
  margin-bottom: 16px;
}

.service-chip {
  font-size: 0.75rem;
  font-weight: 500;
}

/* Sección de detalles */
.details-section {
  background-color: rgba(var(--v-theme-surface-variant), 0.15);
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  padding: 16px;
  margin: 12px 0 16px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.detail-item {
  position: relative;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.detail-icon {
  margin-right: 4px;
  opacity: 0.85;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(var(--v-theme-primary), 0.8);
}

.detail-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.87);
  padding-left: 22px;
  /* Alineado con el texto de la etiqueta */
}

/* Responsive: en pantallas pequeñas cambia a columna */
@media (max-width: 600px) {
  .details-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .detail-item:not(:last-child) {
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05);
  }

  .detail-value {
    padding-left: 26px;
  }
}

/* Sección de notas */
.notes-section {
  margin-bottom: 16px;
}

.notes-content {
  display: flex;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  padding: 12px;
}

.notes-icon {
  color: rgba(var(--v-theme-primary), 0.8);
  margin-right: 12px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notes-text {
  font-size: 0.85rem;
  margin: 0;
  color: rgba(var(--v-theme-on-surface), 0.8);
  line-height: 1.4;
}

/* Pie de tarjeta */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.time-ago {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.time-icon {
  margin-right: 4px;
}

.action-buttons {
  display: flex;
}

.action-button {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.3px;
}
</style>
