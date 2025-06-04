<template>
  <div class="service-details-renderer">
    <!-- Airport Transfer Details -->
    <div v-if="serviceType === 'AIRPORT_TRANSFER'" class="service-details airport-transfer">
      <div class="details-grid">
        <div v-if="reservation.flightNumber" class="detail-item">
          <v-icon icon="mdi-airplane" size="16" color="blue-darken-2" />
          <div class="detail-content">
            <span class="detail-label">Vuelo</span>
            <span class="detail-value">{{ reservation.flightNumber }}</span>
          </div>
        </div>

        <div v-if="reservation.vehicleType" class="detail-item">
          <v-icon icon="mdi-car" size="16" color="blue-darken-2" />
          <div class="detail-content">
            <span class="detail-label">Vehículo</span>
            <span class="detail-value">{{ getVehicleTypeName(reservation.vehicleType) }}</span>
          </div>
        </div>

        <div v-if="reservation.passengerCount" class="detail-item">
          <v-icon icon="mdi-account-group" size="16" color="blue-darken-2" />
          <div class="detail-content">
            <span class="detail-label">Pasajeros</span>
            <span class="detail-value">{{ reservation.passengerCount }} personas</span>
          </div>
        </div>

        <div v-if="reservation.needsCarSeat" class="detail-item special">
          <v-icon icon="mdi-car-seat" size="16" color="warning" />
          <div class="detail-content">
            <span class="detail-label">Sillas para niños</span>
            <span class="detail-value">{{ reservation.carSeatCount || 1 }} silla(s)</span>
          </div>
        </div>

        <div v-if="reservation.isRoundTrip" class="detail-item">
          <v-icon icon="mdi-swap-horizontal" size="16" color="info" />
          <div class="detail-content">
            <span class="detail-label">Viaje redondo</span>
            <span class="detail-value">{{ reservation.returnDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Babysitter Details -->
    <div v-else-if="serviceType === 'BABYSITTER'" class="service-details babysitter">
      <div class="details-grid">
        <div v-if="reservation.childrenCount" class="detail-item">
          <v-icon icon="mdi-baby" size="16" color="deep-purple" />
          <div class="detail-content">
            <span class="detail-label">Niños</span>
            <span class="detail-value">{{ reservation.childrenCount }} niño(s)</span>
          </div>
        </div>

        <div v-if="reservation.childrenAges?.length" class="detail-item">
          <v-icon icon="mdi-cake-variant" size="16" color="deep-purple" />
          <div class="detail-content">
            <span class="detail-label">Edades</span>
            <span class="detail-value">{{ reservation.childrenAges.join(', ') }} años</span>
          </div>
        </div>

        <div v-if="reservation.startTime && reservation.endTime" class="detail-item">
          <v-icon icon="mdi-clock-outline" size="16" color="deep-purple" />
          <div class="detail-content">
            <span class="detail-label">Horario</span>
            <span class="detail-value">{{ reservation.startTime }} - {{ reservation.endTime }}</span>
          </div>
        </div>

        <div v-if="reservation.hasSpecialNeeds" class="detail-item special">
          <v-icon icon="mdi-heart-plus" size="16" color="error" />
          <div class="detail-content">
            <span class="detail-label">Necesidades especiales</span>
            <span class="detail-value">Requiere atención especial</span>
          </div>
        </div>

        <div v-if="reservation.specialRequests" class="detail-item">
          <v-icon icon="mdi-note-text" size="16" color="info" />
          <div class="detail-content">
            <span class="detail-label">Solicitudes</span>
            <span class="detail-value">{{ truncateText(reservation.specialRequests, 50) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Decoration Details -->
    <div v-else-if="serviceType === 'CUSTOM_DECORATION'" class="service-details decoration">
      <div class="details-grid">
        <div v-if="reservation.occasion" class="detail-item">
          <v-icon icon="mdi-party-popper" size="16" color="amber-darken-2" />
          <div class="detail-content">
            <span class="detail-label">Ocasión</span>
            <span class="detail-value">{{ reservation.occasion }}</span>
          </div>
        </div>

        <div v-if="reservation.location" class="detail-item">
          <v-icon icon="mdi-map-marker" size="16" color="amber-darken-2" />
          <div class="detail-content">
            <span class="detail-label">Ubicación</span>
            <span class="detail-value">{{ truncateText(reservation.location, 40) }}</span>
          </div>
        </div>

        <div v-if="reservation.colors?.length" class="detail-item">
          <v-icon icon="mdi-palette" size="16" color="amber-darken-2" />
          <div class="detail-content">
            <span class="detail-label">Colores</span>
            <div class="color-preview">
              <div
                v-for="color in reservation.colors.slice(0, 4)"
                :key="color"
                class="color-dot"
                :style="{ backgroundColor: color }"
                :title="color">
              </div>
              <span v-if="reservation.colors.length > 4" class="color-more">
                +{{ reservation.colors.length - 4 }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="reservation.exactAddress" class="detail-item">
          <v-icon icon="mdi-home-map-marker" size="16" color="amber-darken-2" />
          <div class="detail-content">
            <span class="detail-label">Dirección exacta</span>
            <span class="detail-value">{{ truncateText(reservation.exactAddress, 45) }}</span>
          </div>
        </div>

        <div v-if="reservation.referenceImage" class="detail-item">
          <v-icon icon="mdi-image" size="16" color="success" />
          <div class="detail-content">
            <span class="detail-label">Imagen de referencia</span>
            <span class="detail-value">Incluida</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Grocery Shopping Details -->
    <div v-else-if="serviceType === 'GROCERY_SHOPPING'" class="service-details grocery">
      <div class="details-grid">
        <div v-if="reservation.deliveryAddress" class="detail-item">
          <v-icon icon="mdi-home-map-marker" size="16" color="green" />
          <div class="detail-content">
            <span class="detail-label">Entrega</span>
            <span class="detail-value">{{ truncateText(reservation.deliveryAddress, 40) }}</span>
          </div>
        </div>

        <div v-if="reservation.hour" class="detail-item">
          <v-icon icon="mdi-clock-outline" size="16" color="green" />
          <div class="detail-content">
            <span class="detail-label">Hora preferida</span>
            <span class="detail-value">{{ reservation.hour }}</span>
          </div>
        </div>

        <div v-if="reservation.items?.length" class="detail-item">
          <v-icon icon="mdi-cart" size="16" color="green" />
          <div class="detail-content">
            <span class="detail-label">Productos</span>
            <span class="detail-value">{{ reservation.items.length }} artículo(s)</span>
          </div>
        </div>

        <div v-if="reservation.hasAllergies === 'yes'" class="detail-item special">
          <v-icon icon="mdi-alert-circle" size="16" color="error" />
          <div class="detail-content">
            <span class="detail-label">¡Alergias!</span>
            <span class="detail-value">Ver detalles completos</span>
          </div>
        </div>

        <div v-if="reservation.foodRestrictions" class="detail-item">
          <v-icon icon="mdi-food-off" size="16" color="warning" />
          <div class="detail-content">
            <span class="detail-label">Restricciones</span>
            <span class="detail-value">{{ truncateText(reservation.foodRestrictions, 45) }}</span>
          </div>
        </div>
      </div>

      <!-- Lista de productos si hay pocos -->
      <div v-if="reservation.items?.length && reservation.items.length <= 3" class="items-preview">
        <h4 class="items-title">Productos solicitados:</h4>
        <ul class="items-list">
          <li v-for="item in reservation.items" :key="item.name" class="item">
            <span class="item-quantity">{{ item.quantity }}x</span>
            <span class="item-name">{{ item.name }}</span>
            <span v-if="item.note" class="item-note">({{ item.note }})</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Default/Unknown Service -->
    <div v-else class="service-details default">
      <div class="details-grid">
        <div class="detail-item">
          <v-icon icon="mdi-information" size="16" color="primary" />
          <div class="detail-content">
            <span class="detail-label">Tipo de servicio</span>
            <span class="detail-value">{{ reservation.serviceName || 'Servicio personalizado' }}</span>
          </div>
        </div>

        <div v-if="Object.keys(dynamicProperties).length > 0" class="detail-item">
          <v-icon icon="mdi-cog" size="16" color="primary" />
          <div class="detail-content">
            <span class="detail-label">Detalles adicionales</span>
            <span class="detail-value">{{ Object.keys(dynamicProperties).length }} propiedades</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ServiceType, ReservationService } from '@/services/ReservationServiceFactory';

interface Props {
  reservation: any;
}

const props = defineProps<Props>();

// Computed
const serviceType = computed(() => {
  return ReservationService.detectServiceType(props.reservation);
});

const dynamicProperties = computed(() => {
  const knownProps = [
    'bookingId', 'id', 'clientName', 'clientEmail', 'clientPhone',
    'serviceName', 'date', 'time', 'timeAgo', 'notes', 'totalPrice',
    'status', 'isPriority', 'isNewClient', 'bookingDate'
  ];

  const result: Record<string, any> = {};

  Object.keys(props.reservation).forEach(key => {
    if (!knownProps.includes(key) && props.reservation[key] !== undefined) {
      result[key] = props.reservation[key];
    }
  });

  return result;
});

// Utility functions
function getVehicleTypeName(type: string): string {
  const vehicleTypes: Record<string, string> = {
    'vanSmall': 'Van Pequeña (1-6 pax)',
    'vanMedium': 'Van Mediana (7-10 pax)',
    'vanLarge': 'Van Grande (11-16 pax)',
    'suv': 'SUV (1-6 pax)',
    'sedan': 'Sedán (1-4 pax)',
    'minivan': 'Minivan (5-8 pax)'
  };

  return vehicleTypes[type] || type;
}

function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
</script>

<style scoped>
.service-details-renderer {
  padding: 0;
}

.service-details {
  width: 100%;
}

.details-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(var(--v-theme-outline), 0.2);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item.special {
  background: rgba(var(--v-theme-warning), 0.05);
  border-radius: 6px;
  padding: 8px;
  border: 1px solid rgba(var(--v-theme-warning), 0.2);
  margin: 4px 0;
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
  font-weight: 500;
  word-break: break-word;
}

/* Color Preview */
.color-preview {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 1px rgba(var(--v-theme-outline), 0.3);
  flex-shrink: 0;
}

.color-more {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.6;
  margin-left: 4px;
}

/* Items Preview */
.items-preview {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.items-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 8px;
}

.items-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.item-quantity {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.75rem;
  min-width: 32px;
  text-align: center;
}

.item-name {
  flex: 1;
  color: rgb(var(--v-theme-on-surface));
  font-weight: 500;
}

.item-note {
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.6;
  font-style: italic;
  font-size: 0.8rem;
}

/* Service-specific styling */
.airport-transfer .detail-item {
  border-left: 3px solid rgba(33, 150, 243, 0.3);
  padding-left: 8px;
}

.babysitter .detail-item {
  border-left: 3px solid rgba(156, 39, 176, 0.3);
  padding-left: 8px;
}

.decoration .detail-item {
  border-left: 3px solid rgba(255, 152, 0, 0.3);
  padding-left: 8px;
}

.grocery .detail-item {
  border-left: 3px solid rgba(76, 175, 80, 0.3);
  padding-left: 8px;
}

.default .detail-item {
  border-left: 3px solid rgba(var(--v-theme-primary), 0.3);
  padding-left: 8px;
}

/* Responsive */
@media (max-width: 480px) {
  .detail-item {
    gap: 6px;
  }

  .detail-label {
    font-size: 0.7rem;
  }

  .detail-value {
    font-size: 0.8rem;
  }

  .color-dot {
    width: 14px;
    height: 14px;
  }

  .item-quantity {
    min-width: 28px;
    font-size: 0.7rem;
  }
}

/* Dark theme */
:deep(.v-theme--dark) .detail-item.special {
  background: rgba(var(--v-theme-warning), 0.1);
  border-color: rgba(var(--v-theme-warning), 0.3);
}

:deep(.v-theme--dark) .color-dot {
  border-color: rgb(var(--v-theme-surface-variant));
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
}

:deep(.v-theme--dark) .item-quantity {
  background: rgba(var(--v-theme-primary), 0.2);
}

/* Animations */
.detail-item {
  transition: all 0.2s ease;
}

.detail-item:hover {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 4px;
  padding-left: 12px;
}

.color-dot {
  transition: transform 0.2s ease;
}

.color-dot:hover {
  transform: scale(1.2);
}

/* Accessibility */
.detail-item:focus-within {
  outline: 2px solid rgba(var(--v-theme-primary), 0.5);
  outline-offset: 2px;
  border-radius: 4px;
}
</style>
