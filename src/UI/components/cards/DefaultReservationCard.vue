<!-- src/UI/components/cards/GenericReservationCard.vue -->
<template>
  <BaseReservationCard :client-name="reservation.clientName" :email="reservation.clientEmail"
    :service="reservation.serviceName" :date="reservation.date" :time="reservation.time"
    :is-priority="reservation.isPriority" :reservation="reservation" :on-approve="onApprove" :on-reject="onReject"
    :show-actions="showActions" :enable-navigation="enableNavigation" @card-click="handleCardClick"
    @approve="$emit('approve')" @reject="$emit('reject')">
    <!-- Contenido genérico en el slot extra-content -->
    <template #extra-content>
      <div class="generic-details">
        <!-- Información básica en chips -->
        <div class="primary-info">
          <!-- Teléfono si está disponible -->
          <div v-if="reservation.clientPhone" class="info-chip phone-chip">
            <v-icon icon="mdi-phone" size="x-small" class="chip-icon"></v-icon>
            <span class="chip-text">{{ formatPhone(reservation.clientPhone) }}</span>
          </div>

          <!-- Categoría del servicio -->
          <div v-if="reservation.serviceCategory" class="info-chip category-chip">
            <v-icon icon="mdi-tag" size="x-small" class="chip-icon"></v-icon>
            <span class="chip-text">{{ reservation.serviceCategory }}</span>
          </div>

          <!-- Propiedades dinámicas más relevantes -->
          <template v-for="prop in topRelevantProps" :key="prop.key">
            <div class="info-chip dynamic-chip">
              <v-icon :icon="getIconForProperty(prop.key)" size="x-small" class="chip-icon"></v-icon>
              <span class="chip-text">{{ prop.displayValue }}</span>
            </div>
          </template>
        </div>

        <!-- Notas breves si existen -->
        <div v-if="hasNotes" class="notes-preview">
          <v-icon icon="mdi-message-text-outline" size="x-small" class="notes-icon"></v-icon>
          <span class="notes-text">{{ getNotesPreview() }}</span>
        </div>

        <!-- Indicadores especiales -->
        <div v-if="hasSpecialIndicators" class="special-indicators">
          <v-chip v-if="hasAdditionalProperties" size="x-small" color="info" variant="outlined"
            prepend-icon="mdi-information-outline">
            {{ additionalPropsCount }} detalle{{ additionalPropsCount > 1 ? 's' : '' }}
          </v-chip>

          <v-chip v-if="hasNotes" size="x-small" color="blue-grey" variant="outlined"
            prepend-icon="mdi-note-text-outline">
            Con notas
          </v-chip>
        </div>
      </div>
    </template>
  </BaseReservationCard>
</template>

<script setup lang="ts">
import BaseReservationCard from './BaseReservationCard.vue';
import { computed } from 'vue';

interface GenericReservation {
  id?: string;
  bookingId?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  serviceName: string;
  serviceCategory?: string;
  date: string;
  time?: string;
  notes?: string;
  isPriority?: boolean;
  [key: string]: any; // Para propiedades dinámicas
}

interface Props {
  reservation: GenericReservation;
  onApprove?: (id: string) => Promise<boolean>;
  onReject?: (id: string) => Promise<boolean>;
  showActions?: boolean;
  enableNavigation?: boolean;
  maxRelevantProps?: number;
  notesPreviewLength?: number;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  enableNavigation: true,
  maxRelevantProps: 2,
  notesPreviewLength: 30
});

const emit = defineEmits<{
  (e: 'view-details', reservation: GenericReservation): void;
  (e: 'approve'): void;
  (e: 'reject'): void;
  (e: 'card-click'): void;
}>();

// Lista de propiedades comunes que no mostraremos como "adicionales"
const commonProps = [
  'id', 'bookingId', 'clientName', 'clientEmail', 'clientPhone',
  'serviceName', 'serviceId', 'serviceCategory', 'date', 'time',
  'status', 'notes', 'createdAt', 'timeAgo', 'isPriority'
];

// Mapeo de propiedades a iconos
const propertyIcons: Record<string, string> = {
  // Ubicación y direcciones
  'location': 'mdi-map-marker',
  'address': 'mdi-home',
  'exactAddress': 'mdi-home-map-marker',
  'deliveryAddress': 'mdi-truck-delivery',

  // Personas y cantidades
  'passengerCount': 'mdi-account-group',
  'childrenCount': 'mdi-baby',
  'peopleCount': 'mdi-account-multiple',
  'guests': 'mdi-account-group',

  // Tiempo y duración
  'duration': 'mdi-clock-outline',
  'startTime': 'mdi-clock-start',
  'endTime': 'mdi-clock-end',

  // Vehículos y transporte
  'vehicleType': 'mdi-car',
  'flightNumber': 'mdi-airplane',

  // Eventos y ocasiones
  'occasion': 'mdi-party-popper',
  'eventType': 'mdi-calendar-star',

  // Colores y diseño
  'colors': 'mdi-palette',
  'theme': 'mdi-brush',

  // Especiales
  'hasSpecialNeeds': 'mdi-alert-circle',
  'hasAllergies': 'mdi-alert-octagon',
  'isRoundTrip': 'mdi-repeat',

  // Default
  'default': 'mdi-information'
};

// Computed properties
const additionalProperties = computed(() => {
  const extras: Record<string, any> = {};

  Object.entries(props.reservation).forEach(([key, value]) => {
    if (!commonProps.includes(key) &&
      value !== undefined &&
      value !== null &&
      value !== '' &&
      value !== false) {
      extras[key] = value;
    }
  });

  return extras;
});

const hasAdditionalProperties = computed(() => {
  return Object.keys(additionalProperties.value).length > 0;
});

const additionalPropsCount = computed(() => {
  return Object.keys(additionalProperties.value).length;
});

const hasNotes = computed(() => {
  return !!(props.reservation.notes && props.reservation.notes.trim());
});

const hasSpecialIndicators = computed(() => {
  return hasAdditionalProperties.value || hasNotes.value;
});

const topRelevantProps = computed(() => {
  const relevantOrder = [
    'passengerCount', 'childrenCount', 'location', 'occasion',
    'vehicleType', 'flightNumber', 'duration', 'colors'
  ];

  const relevant = [];
  const additional = additionalProperties.value;

  // Primero buscar propiedades en orden de relevancia
  for (const prop of relevantOrder) {
    if (additional[prop] && relevant.length < props.maxRelevantProps) {
      relevant.push({
        key: prop,
        value: additional[prop],
        displayValue: formatPropertyValue(prop, additional[prop])
      });
    }
  }

  // Si aún hay espacio, agregar otras propiedades
  if (relevant.length < props.maxRelevantProps) {
    const remainingProps = Object.entries(additional)
      .filter(([key]) => !relevantOrder.includes(key))
      .slice(0, props.maxRelevantProps - relevant.length);

    for (const [key, value] of remainingProps) {
      relevant.push({
        key,
        value,
        displayValue: formatPropertyValue(key, value)
      });
    }
  }

  return relevant;
});

// Methods
function formatPhone(phone: string): string {
  if (!phone) return '';

  // Formatear teléfono para mostrar solo últimos dígitos si es muy largo
  if (phone.length > 10) {
    return `...${phone.slice(-7)}`;
  }

  return phone;
}

function formatPropertyValue(key: string, value: any): string {
  // Formateo específico por tipo de propiedad
  switch (key) {
    case 'passengerCount':
    case 'childrenCount':
    case 'peopleCount':
      return `${value} ${value === 1 ? 'persona' : 'personas'}`;

    case 'colors':
      if (Array.isArray(value)) {
        return `${value.length} color${value.length === 1 ? '' : 'es'}`;
      }
      return String(value);

    case 'vehicleType':
      const vehicleTypes: Record<string, string> = {
        'vanSmall': 'Van S',
        'vanMedium': 'Van M',
        'vanLarge': 'Van L',
        'suv': 'SUV'
      };
      return vehicleTypes[value] || value;

    case 'occasion':
      const occasions: Record<string, string> = {
        'birthday': 'Cumpleaños',
        'anniversary': 'Aniversario',
        'romantic': 'Romántico'
      };
      return occasions[value] || value;

    case 'location':
    case 'address':
      return value.length > 15 ? value.substring(0, 15) + '...' : value;

    case 'hasSpecialNeeds':
    case 'hasAllergies':
    case 'isRoundTrip':
      return value ? 'Sí' : 'No';

    default:
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value).length > 20 ?
        String(value).substring(0, 20) + '...' :
        String(value);
  }
}

function getIconForProperty(key: string): string {
  return propertyIcons[key] || propertyIcons.default;
}

function getNotesPreview(): string {
  if (!hasNotes.value) return '';

  const notes = props.reservation.notes!.trim();
  return notes.length > props.notesPreviewLength ?
    notes.substring(0, props.notesPreviewLength) + '...' :
    notes;
}

function handleCardClick(): void {
  emit('view-details', props.reservation);
  emit('card-click');
}
</script>

<style scoped>
.generic-details {
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

.phone-chip {
  background-color: rgba(var(--v-theme-green), 0.08);
  border-color: rgba(var(--v-theme-green), 0.2);
}

.phone-chip .chip-icon {
  color: rgb(var(--v-theme-green));
}

.category-chip {
  background-color: rgba(var(--v-theme-blue), 0.08);
  border-color: rgba(var(--v-theme-blue), 0.2);
}

.category-chip .chip-icon {
  color: rgb(var(--v-theme-blue));
}

.dynamic-chip {
  background-color: rgba(var(--v-theme-primary), 0.08);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.dynamic-chip .chip-icon {
  color: rgb(var(--v-theme-primary));
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

.notes-preview {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 6px 8px;
  background-color: rgba(var(--v-theme-blue-grey), 0.05);
  border-radius: 8px;
  border-left: 3px solid rgba(var(--v-theme-blue-grey), 0.3);
}

.notes-icon {
  color: rgb(var(--v-theme-blue-grey));
  opacity: 0.7;
  margin-top: 1px;
  flex-shrink: 0;
}

.notes-text {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.8;
  line-height: 1.3;
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

:deep(.v-theme--dark) .phone-chip {
  background-color: rgba(var(--v-theme-green), 0.15);
  border-color: rgba(var(--v-theme-green), 0.3);
}

:deep(.v-theme--dark) .category-chip {
  background-color: rgba(var(--v-theme-blue), 0.15);
  border-color: rgba(var(--v-theme-blue), 0.3);
}

:deep(.v-theme--dark) .dynamic-chip {
  background-color: rgba(var(--v-theme-primary), 0.15);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

:deep(.v-theme--dark) .notes-preview {
  background-color: rgba(var(--v-theme-blue-grey), 0.1);
  border-left-color: rgba(var(--v-theme-blue-grey), 0.4);
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

  .notes-preview {
    padding: 4px 6px;
  }

  .notes-text {
    font-size: 0.7rem;
  }
}
</style>
