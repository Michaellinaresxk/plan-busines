<template>
  <BaseReservationCard :reservation="reservation" :onApprove="onApprove" :onReject="onReject"
    @view-details="$emit('view-details', reservation)">
    <div class="reservation-details">
      <!-- Fecha y Hora -->
      <div class="detail-item">
        <v-icon icon="mdi-calendar" size="small" color="primary" class="mr-2"></v-icon>
        <span class="font-weight-medium">{{ formatDate(reservation.date) }} - {{ reservation.time }}</span>
      </div>

      <!-- Servicio -->
      <div class="detail-item">
        <v-icon icon="mdi-tag" size="small" color="primary" class="mr-2"></v-icon>
        <span>{{ reservation.serviceName }}</span>
      </div>

      <!-- Teléfono -->
      <div class="detail-item">
        <v-icon icon="mdi-phone" size="small" color="primary" class="mr-2"></v-icon>
        <span>{{ reservation.clientPhone }}</span>
      </div>

      <!-- Notas -->
      <div v-if="reservation.notes" class="detail-item notes-section">
        <v-icon icon="mdi-text-box-outline" size="small" color="primary" class="mr-2"></v-icon>
        <div>
          <span class="font-weight-medium">Notas:</span>
          <p class="notes-text">{{ reservation.notes }}</p>
        </div>
      </div>

      <!-- Propiedades adicionales -->
      <div v-if="additionalProperties.length > 0" class="detail-item additional-props">
        <v-icon icon="mdi-information-outline" size="small" color="primary" class="mr-2"></v-icon>
        <div>
          <span class="font-weight-medium">Detalles adicionales:</span>
          <div v-for="(value, key) in additionalProperties" :key="key" class="prop-item">
            <span class="prop-name">{{ formatPropName(key) }}:</span>
            <span class="prop-value">{{ formatPropValue(value) }}</span>
          </div>
        </div>
      </div>
    </div>
  </BaseReservationCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseReservationCard from './BaseReservationCard.vue';

// Propiedades
const props = defineProps<{
  reservation: any;
  onApprove: (id: string) => Promise<boolean>;
  onReject: (id: string) => Promise<boolean>;
}>();

// Eventos
const emit = defineEmits<{
  (e: 'view-details', reservation: any): void;
}>();

// Lista de propiedades comunes que no mostraremos como "adicionales"
const commonProps = [
  'id', 'clientName', 'clientEmail', 'clientPhone', 'serviceName', 'serviceId',
  'serviceCategory', 'date', 'time', 'status', 'notes', 'createdAt', 'timeAgo',
  'isPriority', 'onApprove', 'onReject'
];

// Propiedades adicionales para mostrar
const additionalProperties = computed(() => {
  const extras: Record<string, any> = {};

  // Filtrar propiedades comunes y mostrar solo las específicas
  Object.entries(props.reservation).forEach(([key, value]) => {
    if (!commonProps.includes(key) && value !== undefined && value !== null && value !== '') {
      extras[key] = value;
    }
  });

  return extras;
});

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

// Formatear nombre de propiedad para mostrar
function formatPropName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1') // Insertar espacio antes de mayúsculas
    .replace(/^./, (str) => str.toUpperCase()) // Capitalizar primera letra
    .trim();
}

// Formatear valor de propiedad para mostrar
function formatPropValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  } else if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  } else if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
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

.notes-section,
.additional-props {
  background-color: rgba(var(--v-theme-surface-variant), 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
}

.notes-text {
  font-size: 0.8rem;
  margin-top: 4px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.prop-item {
  font-size: 0.8rem;
  margin-top: 4px;
}

.prop-name {
  font-weight: 500;
  margin-right: 4px;
}

.prop-value {
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>
