<template>
  <v-card rounded="xl" elevation="0" border class="reservation-details-card">
    <v-card-title class="pa-6 pb-4">
      <div class="d-flex align-center">
        <div class="service-icon-container">
          <v-icon :icon="getServiceIcon(reservation.serviceName)" color="white" size="28"></v-icon>
        </div>
        <div class="ml-4">
          <h2 class="text-h5 font-weight-bold mb-1">{{ reservation.serviceName }}</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            Solicitud #{{ reservation.bookingId.slice(0, 8) }}
          </p>
        </div>
        <v-spacer></v-spacer>
        <v-chip :color="getPriorityColor()" variant="elevated" class="font-weight-bold">
          {{ getPriorityText() }}
        </v-chip>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-6">
      <!-- Client Information -->
      <div class="client-section mb-6">
        <h3 class="section-title">
          <v-icon icon="mdi-account" class="mr-2"></v-icon>
          Información del Cliente
        </h3>

        <div class="client-info">
          <div class="client-avatar-section">
            <v-avatar color="primary" size="64" class="client-avatar">
              <span class="text-h5 font-weight-bold text-white">
                {{ getInitials(reservation.clientName) }}
              </span>
            </v-avatar>
            <div class="client-details">
              <h4 class="client-name">{{ reservation.clientName }}</h4>
              <p class="client-contact">{{ reservation.clientEmail }}</p>
              <p class="client-contact">{{ reservation.clientPhone }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Service Details -->
      <div class="service-section mb-6">
        <h3 class="section-title">
          <v-icon icon="mdi-calendar-clock" class="mr-2"></v-icon>
          Detalles del Servicio
        </h3>

        <div class="service-details">
          <div class="detail-row">
            <div class="detail-item">
              <v-icon icon="mdi-calendar" color="primary" class="mr-3"></v-icon>
              <div>
                <p class="detail-label">Fecha</p>
                <p class="detail-value">{{ formatDate(reservation.date) }}</p>
              </div>
            </div>

            <div class="detail-item">
              <v-icon icon="mdi-clock" color="primary" class="mr-3"></v-icon>
              <div>
                <p class="detail-label">Hora</p>
                <p class="detail-value">{{ reservation.time }}</p>
              </div>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-item">
              <v-icon icon="mdi-currency-usd" color="primary" class="mr-3"></v-icon>
              <div>
                <p class="detail-label">Precio Total</p>
                <p class="detail-value price">${{ reservation.totalPrice }}</p>
              </div>
            </div>

            <div class="detail-item" v-if="getLocationText()">
              <v-icon icon="mdi-map-marker" color="primary" class="mr-3"></v-icon>
              <div>
                <p class="detail-label">Ubicación</p>
                <p class="detail-value">{{ getLocationText() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Service Specific Details -->
      <div class="specific-details mb-6" v-if="hasSpecificDetails()">
        <h3 class="section-title">
          <v-icon :icon="getServiceIcon(reservation.serviceName)" class="mr-2"></v-icon>
          Detalles Específicos
        </h3>

        <div class="specific-details-content">
          <!-- Airport Transfer Details -->
          <template v-if="isAirportTransfer()">
            <div class="specific-detail" v-if="reservation.formData?.flightNumber">
              <v-icon icon="mdi-airplane" color="blue" class="mr-2"></v-icon>
              <span>Vuelo: {{ reservation.formData.flightNumber }}</span>
            </div>
            <div class="specific-detail" v-if="reservation.formData?.vehicleType">
              <v-icon icon="mdi-car" color="blue" class="mr-2"></v-icon>
              <span>{{ getVehicleTypeLabel(reservation.formData.vehicleType) }}</span>
            </div>
            <div class="specific-detail" v-if="reservation.formData?.passengerCount">
              <v-icon icon="mdi-account-group" color="blue" class="mr-2"></v-icon>
              <span>{{ reservation.formData.passengerCount }} pasajeros</span>
            </div>
          </template>

          <!-- Babysitter Details -->
          <template v-if="isBabysitter()">
            <div class="specific-detail" v-if="reservation.formData?.childrenCount">
              <v-icon icon="mdi-baby" color="purple" class="mr-2"></v-icon>
              <span>{{ reservation.formData.childrenCount }} niños</span>
            </div>
            <div class="specific-detail" v-if="reservation.formData?.childrenAges">
              <v-icon icon="mdi-calendar" color="purple" class="mr-2"></v-icon>
              <span>Edades: {{ reservation.formData.childrenAges.join(', ') }} años</span>
            </div>
            <div class="specific-detail" v-if="reservation.formData?.hasSpecialNeeds">
              <v-icon icon="mdi-alert-circle" color="warning" class="mr-2"></v-icon>
              <span>Necesidades especiales requeridas</span>
            </div>
          </template>

          <!-- Other service types can be added here -->
        </div>
      </div>

      <!-- Notes -->
      <div class="notes-section" v-if="reservation.notes">
        <h3 class="section-title">
          <v-icon icon="mdi-note-text" class="mr-2"></v-icon>
          Notas Adicionales
        </h3>
        <div class="notes-content">
          <p>{{ reservation.notes }}</p>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { ReservationView } from '@/views/ReservationView';
import type { SupplierView } from '@/views/SupplierView';

interface Props {
  reservation: ReservationView;
  supplier: SupplierView;
}

const props = defineProps<Props>();

// Service icons mapping
const serviceIcons = {
  'airport-transfer': 'mdi-airplane',
  'transporte-aeropuerto': 'mdi-airplane',
  'babysitter': 'mdi-baby',
  'niñera': 'mdi-baby',
  'custom-decoration': 'mdi-party-popper',
  'decoración': 'mdi-party-popper',
  'grocery-shopping': 'mdi-cart',
  'compras': 'mdi-cart',
  default: 'mdi-tools'
};

function getServiceIcon(serviceName: string): string {
  const key = serviceName.toLowerCase().replace(/\s+/g, '-');
  return serviceIcons[key as keyof typeof serviceIcons] || serviceIcons.default;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

function getPriorityColor(): string {
  return props.reservation.isPriority ? 'error' : 'primary';
}

function getPriorityText(): string {
  return props.reservation.isPriority ? 'Prioritario' : 'Normal';
}

function getLocationText(): string {
  const formData = props.reservation.formData || {};
  return formData.location ||
         formData.address ||
         formData.deliveryAddress ||
         formData.exactAddress ||
         '';
}

function hasSpecificDetails(): boolean {
  return isAirportTransfer() || isBabysitter() || hasCustomDetails();
}

function isAirportTransfer(): boolean {
  const serviceName = props.reservation.serviceName.toLowerCase();
  return serviceName.includes('airport') || serviceName.includes('aeropuerto');
}

function isBabysitter(): boolean {
  const serviceName = props.reservation.serviceName.toLowerCase();
  return serviceName.includes('babysitter') || serviceName.includes('niñera');
}

function hasCustomDetails(): boolean {
  const formData = props.reservation.formData || {};
  return Object.keys(formData).length > 0;
}

function getVehicleTypeLabel(vehicleType: string): string {
  const labels: Record<string, string> = {
    'vanSmall': 'Van Pequeña (1-6 personas)',
    'vanMedium': 'Van Mediana (7-10 personas)',
    'vanLarge': 'Van Grande (11-16 personas)',
    'suv': 'SUV (1-6 personas)'
  };
  return labels[vehicleType] || vehicleType;
}
</script>

<style scoped>
.reservation-details-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), 1), rgba(var(--v-theme-surface-variant), 0.3));
}

.service-icon-container {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.client-info {
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.client-avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.client-avatar {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
  border: 3px solid white;
}

.client-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin-bottom: 4px;
}

.client-contact {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin: 2px 0;
}

.service-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.detail-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0 0 4px 0;
}

.detail-value {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin: 0;
}

.detail-value.price {
  font-size: 1.25rem;
  color: rgb(var(--v-theme-primary));
}

.specific-details-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.specific-detail {
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-info), 0.05);
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-info), 0.2);
  font-size: 0.9rem;
  font-weight: 500;
}

.notes-content {
  background: rgba(var(--v-theme-warning), 0.05);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-warning), 0.2);
}

.notes-content p {
  margin: 0;
  line-height: 1.6;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

@media (max-width: 768px) {
  .detail-row {
    grid-template-columns: 1fr;
  }

  .client-avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .specific-details-content {
    flex-direction: column;
  }
}
</style>
