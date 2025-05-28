<template>
  <div class="service-details">
    <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
      <v-icon icon="mdi-tools" size="24" color="primary" class="mr-2"></v-icon>
      Detalles del Servicio
    </h3>

    <div class="details-grid">
      <!-- Información Básica -->
      <div class="detail-section">
        <h4 class="section-title">
          <v-icon icon="mdi-information" size="18" class="mr-2"></v-icon>
          Información Básica
        </h4>

        <div class="detail-list">
          <div class="detail-row">
            <span class="detail-label">Servicio:</span>
            <span class="detail-value font-weight-bold">{{ reservation.serviceName }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Fecha:</span>
            <span class="detail-value">{{ formatDate(reservation.date) }}</span>
          </div>

          <div v-if="reservation.time" class="detail-row">
            <span class="detail-label">Hora:</span>
            <span class="detail-value">{{ reservation.time }}</span>
          </div>
        </div>
      </div>

      <!-- Propiedades Adicionales -->
      <div v-if="additionalProperties.length > 0" class="detail-section">
        <h4 class="section-title">
          <v-icon icon="mdi-clipboard-list" size="18" class="mr-2"></v-icon>
          Detalles Específicos
        </h4>

        <div class="detail-list">
          <div v-for="(prop, index) in additionalProperties" :key="index" class="detail-row">
            <span class="detail-label">{{ formatPropName(prop.key) }}:</span>
            <span class="detail-value">{{ formatPropValue(prop.value) }}</span>
          </div>
        </div>
      </div>

      <!-- Información Adicional -->
      <div v-if="reservation.notes" class="detail-section full-width">
        <h4 class="section-title">
          <v-icon icon="mdi-note-text" size="18" class="mr-2"></v-icon>
          Información Adicional
        </h4>

        <div class="additional-info">
          <div class="info-block">
            <div class="info-title">Notas del cliente:</div>
            <div class="info-content">{{ reservation.notes }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Props
const props = defineProps<{
  reservation: any;
}>();

// Lista de propiedades comunes que no mostraremos como "adicionales"
const commonProps = [
  'id', 'bookingId', 'clientName', 'clientEmail', 'clientPhone',
  'serviceName', 'serviceId', 'serviceCategory', 'date', 'time',
  'status', 'notes', 'createdAt', 'timeAgo', 'isPriority',
  'isNewClient', 'totalPrice', 'bookingDate', 'formData'
];

// Propiedades adicionales para mostrar
const additionalProperties = computed(() => {
  const extras: Array<{ key: string, value: any; }> = [];

  // Procesar formData si existe
  if (props.reservation.formData && typeof props.reservation.formData === 'object') {
    Object.entries(props.reservation.formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        extras.push({ key, value });
      }
    });
  }

  // Procesar propiedades directas de la reserva
  Object.entries(props.reservation).forEach(([key, value]) => {
    if (!commonProps.includes(key) && value !== undefined && value !== null && value !== '') {
      extras.push({ key, value });
    }
  });

  return extras;
});

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

function formatPropName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1') // Insertar espacio antes de mayúsculas
    .replace(/^./, (str) => str.toUpperCase()) // Capitalizar primera letra
    .trim();
}

function formatPropValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  } else if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  } else if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}
</script>

<styles scoped>
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
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-weight: 500;
  flex-shrink: 0;
  margin-right: 12px;
}

.detail-value {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.87);
  text-align: right;
  word-break: break-word;
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
</styles>
