<template>
  <div class="airport-transfer-details">
    <!-- Quick Summary -->
    <div class="summary-header">
      <div class="summary-stats">
        <div class="stat-card">
          <v-icon icon="mdi-airplane" color="blue" size="24"></v-icon>
          <div class="stat-content">
            <span class="stat-text">{{ flightNumber }}</span>
            <span class="stat-label">Número de vuelo</span>
          </div>
        </div>

        <div class="stat-card">
          <v-icon icon="mdi-calendar-clock" color="info" size="24"></v-icon>
          <div class="stat-content">
            <span class="stat-text">{{ flightDateTime }}</span>
            <span class="stat-label">Fecha y hora</span>
          </div>
        </div>

        <div class="stat-card">
          <v-icon icon="mdi-car" color="primary" size="24"></v-icon>
          <div class="stat-content">
            <span class="stat-text">{{ vehicleTypeDisplay }}</span>
            <span class="stat-label">Tipo de vehículo</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Flight Information -->
    <div class="flight-section">
      <h3 class="section-title">
        <v-icon icon="mdi-airplane-takeoff" class="mr-2"></v-icon>
        Información de Vuelo
      </h3>

      <div class="flight-grid">
        <div class="flight-card primary-flight">
          <div class="flight-header">
            <v-icon icon="mdi-airplane-takeoff" color="blue" size="20" class="mr-2"></v-icon>
            <span class="flight-type">Vuelo Principal</span>
          </div>

          <div class="flight-details">
            <div class="flight-number">{{ flightNumber }}</div>
            <div class="flight-datetime">
              <div class="flight-date">{{ formatFlightDate(formData.date) }}</div>
              <div class="flight-time">{{ formData.time || reservation.time }}</div>
            </div>
          </div>
        </div>

        <!-- Return Flight (if round trip) -->
        <div v-if="isRoundTrip" class="flight-card return-flight">
          <div class="flight-header">
            <v-icon icon="mdi-airplane-landing" color="success" size="20" class="mr-2"></v-icon>
            <span class="flight-type">Vuelo de Regreso</span>
          </div>

          <div class="flight-details">
            <div class="flight-number">{{ returnFlightNumber }}</div>
            <div class="flight-datetime">
              <div class="flight-date">{{ formatFlightDate(formData.returnDate) }}</div>
              <div class="flight-time">{{ formData.returnTime }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vehicle and Passengers -->
    <div class="vehicle-section">
      <h3 class="section-title">
        <v-icon icon="mdi-car-multiple" class="mr-2"></v-icon>
        Vehículo y Pasajeros
      </h3>

      <div class="vehicle-grid">
        <!-- Vehicle Info -->
        <div class="vehicle-info-card">
          <div class="vehicle-icon">
            <v-icon :icon="getVehicleIcon()" :color="getVehicleColor()" size="32"></v-icon>
          </div>
          <div class="vehicle-details">
            <div class="vehicle-type">{{ vehicleTypeDisplay }}</div>
            <div class="vehicle-capacity">{{ getVehicleCapacity() }}</div>
          </div>
        </div>

        <!-- Passenger Info -->
        <div class="passenger-grid">
          <div class="passenger-item">
            <v-icon icon="mdi-account-group" color="primary" size="20"></v-icon>
            <div class="passenger-content">
              <span class="passenger-label">Adultos</span>
              <span class="passenger-value">{{ adultsCount }}</span>
            </div>
          </div>

          <div v-if="kidsCount" class="passenger-item">
            <v-icon icon="mdi-account-child" color="warning" size="20"></v-icon>
            <div class="passenger-content">
              <span class="passenger-label">Niños</span>
              <span class="passenger-value">{{ kidsCount }}</span>
            </div>
          </div>

          <div class="passenger-item total">
            <v-icon icon="mdi-account-multiple" color="success" size="20"></v-icon>
            <div class="passenger-content">
              <span class="passenger-label">Total pasajeros</span>
              <span class="passenger-value total-count">{{ totalPassengers }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Car Seats (if needed) -->
      <div v-if="needsCarSeat" class="car-seat-section">
        <div class="car-seat-alert">
          <div class="alert-header">
            <v-icon icon="mdi-car-child-seat" color="warning" size="20" class="mr-2"></v-icon>
            <span class="alert-title">Asientos para Niños Requeridos</span>
          </div>
          <div class="alert-content">
            <span class="seat-count">{{ carSeatCount || 1 }}</span>
            <span class="seat-text">{{ (carSeatCount || 1) === 1 ? 'asiento requerido' : 'asientos requeridos' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Transfer Type and Pickup -->
    <div class="transfer-section">
      <h3 class="section-title">
        <v-icon icon="mdi-map-marker-path" class="mr-2"></v-icon>
        Detalles del Transfer
      </h3>

      <div class="transfer-grid">
        <div class="transfer-item">
          <v-icon icon="mdi-swap-horizontal" color="info" size="20"></v-icon>
          <div class="transfer-content">
            <span class="transfer-label">Tipo de transfer</span>
            <span class="transfer-value">{{ transferTypeDisplay }}</span>
          </div>
        </div>

        <div v-if="pickupLocation" class="transfer-item">
          <v-icon icon="mdi-map-marker" color="error" size="20"></v-icon>
          <div class="transfer-content">
            <span class="transfer-label">Punto de recogida</span>
            <span class="transfer-value">{{ pickupLocation }}</span>
          </div>
        </div>

        <div v-if="destinationLocation" class="transfer-item">
          <v-icon icon="mdi-map-marker-check" color="success" size="20"></v-icon>
          <div class="transfer-content">
            <span class="transfer-label">Destino</span>
            <span class="transfer-value">{{ destinationLocation }}</span>
          </div>
        </div>

        <div v-if="estimatedDuration" class="transfer-item">
          <v-icon icon="mdi-clock-outline" color="purple" size="20"></v-icon>
          <div class="transfer-content">
            <span class="transfer-label">Duración estimada</span>
            <span class="transfer-value">{{ estimatedDuration }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Information -->
    <div v-if="hasAdditionalInfo" class="additional-section">
      <h3 class="section-title">
        <v-icon icon="mdi-information" class="mr-2"></v-icon>
        Información Adicional
      </h3>

      <div class="additional-content">
        <!-- Special Requests -->
        <div v-if="specialRequests" class="additional-info">
          <div class="info-header">
            <v-icon icon="mdi-star" color="amber" size="20" class="mr-2"></v-icon>
            <span class="info-title">Solicitudes Especiales</span>
          </div>
          <div class="info-content">
            {{ specialRequests }}
          </div>
        </div>

        <!-- Notes -->
        <div v-if="notes" class="additional-info">
          <div class="info-header">
            <v-icon icon="mdi-note-text" color="blue-grey" size="20" class="mr-2"></v-icon>
            <span class="info-title">Notas del Cliente</span>
          </div>
          <div class="info-content">
            {{ notes }}
          </div>
        </div>

        <!-- Contact Instructions -->
        <div v-if="contactInstructions" class="additional-info">
          <div class="info-header">
            <v-icon icon="mdi-phone-message" color="green" size="20" class="mr-2"></v-icon>
            <span class="info-title">Instrucciones de Contacto</span>
          </div>
          <div class="info-content">
            {{ contactInstructions }}
          </div>
        </div>
      </div>
    </div>

    <!-- Pricing Information -->
    <div v-if="hasPricingInfo" class="pricing-section">
      <h3 class="section-title">
        <v-icon icon="mdi-calculator" class="mr-2"></v-icon>
        Información de Precios
      </h3>

      <div class="pricing-breakdown">
        <div class="pricing-row" v-if="baseTransferPrice">
          <span class="pricing-label">Transfer base:</span>
          <span class="pricing-value">${{ baseTransferPrice }}</span>
        </div>

        <div class="pricing-row" v-if="vehicleUpcharge">
          <span class="pricing-label">Cargo por tipo de vehículo:</span>
          <span class="pricing-value">${{ vehicleUpcharge }}</span>
        </div>

        <div class="pricing-row" v-if="roundTripSurcharge && isRoundTrip">
          <span class="pricing-label">Cargo viaje redondo:</span>
          <span class="pricing-value">${{ roundTripSurcharge }}</span>
        </div>

        <div class="pricing-row" v-if="carSeatFee && needsCarSeat">
          <span class="pricing-label">Asientos para niños:</span>
          <span class="pricing-value">${{ carSeatFee }}</span>
        </div>

        <div class="pricing-row total-row" v-if="reservation.totalPrice">
          <span class="pricing-label">Total:</span>
          <span class="pricing-value total">${{ reservation.totalPrice }}</span>
        </div>
      </div>
    </div>

    <!-- Debug Information (Development only) -->
    <div v-if="showDebugInfo" class="debug-section">
      <v-expansion-panels variant="accordion">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon icon="mdi-bug" class="mr-2"></v-icon>
            Información de Debug (Desarrollo)
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="debug-content">
              <h4>Form Data:</h4>
              <pre>{{ JSON.stringify(formData, null, 2) }}</pre>

              <h4 class="mt-4">Reservation Data:</h4>
              <pre>{{ JSON.stringify(reservation, null, 2) }}</pre>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  reservation: {
    formData?: {
      // Flight information
      flightNumber?: string
      returnFlightNumber?: string
      date?: string
      time?: string
      returnDate?: string
      returnTime?: string
      isRoundTrip?: boolean

      // Vehicle and passengers
      vehicleType?: string
      passengerCount?: number
      adultsCount?: number
      kidsCount?: number
      needsCarSeat?: boolean
      carSeatCount?: number

      // Transfer details
      transferType?: string
      pickupLocation?: string
      destinationLocation?: string
      estimatedDuration?: string

      // Additional info
      specialRequests?: string
      notes?: string
      contactInstructions?: string

      // Pricing
      baseTransferPrice?: number
      vehicleUpcharge?: number
      roundTripSurcharge?: number
      carSeatFee?: number
    }
    totalPrice?: number
    serviceName?: string

    // Legacy fields (for backward compatibility)
    flightNumber?: string
    returnFlightNumber?: string
    date?: string
    time?: string
    vehicleType?: string
    passengerCount?: number
    notes?: string
    [key: string]: any
  }
}

const props = defineProps<Props>()

// Show debug info only in development
const showDebugInfo = computed(() => {
  return process.env.NODE_ENV === 'development'
})

const formData = computed(() => props.reservation.formData || {})

// Flight Information
const flightNumber = computed(() =>
  formData.value.flightNumber ||
  props.reservation.flightNumber ||
  'No especificado'
)

const returnFlightNumber = computed(() =>
  formData.value.returnFlightNumber ||
  props.reservation.returnFlightNumber ||
  'No especificado'
)

const isRoundTrip = computed(() =>
  formData.value.isRoundTrip ||
  !!formData.value.returnFlightNumber ||
  !!props.reservation.returnFlightNumber
)

const flightDateTime = computed(() => {
  const date = formData.value.date || props.reservation.date
  const time = formData.value.time || props.reservation.time

  if (date && time) {
    return `${formatFlightDate(date)} a las ${time}`
  } else if (date) {
    return formatFlightDate(date)
  } else if (time) {
    return `Hoy a las ${time}`
  }
  return 'No especificado'
})

// Vehicle Information
const vehicleType = computed(() =>
  formData.value.vehicleType ||
  props.reservation.vehicleType ||
  'standard'
)

const vehicleTypeDisplay = computed(() => getVehicleTypeLabel(vehicleType.value))

// Passenger Information
const adultsCount = computed(() =>
  formData.value.adultsCount ||
  formData.value.passengerCount ||
  props.reservation.passengerCount ||
  1
)

const kidsCount = computed(() =>
  formData.value.kidsCount ||
  props.reservation.kidsCount ||
  0
)

const totalPassengers = computed(() => adultsCount.value + kidsCount.value)

const needsCarSeat = computed(() =>
  formData.value.needsCarSeat ||
  props.reservation.needsCarSeat ||
  false
)

const carSeatCount = computed(() =>
  formData.value.carSeatCount ||
  props.reservation.carSeatCount ||
  (needsCarSeat.value ? 1 : 0)
)

// Transfer Details
const transferTypeDisplay = computed(() => {
  if (isRoundTrip.value) return 'Viaje redondo'
  return 'Solo ida'
})

const pickupLocation = computed(() =>
  formData.value.pickupLocation ||
  formData.value.pickup ||
  formData.value.location ||
  'Aeropuerto'
)

const destinationLocation = computed(() =>
  formData.value.destinationLocation ||
  formData.value.destination ||
  formData.value.address ||
  'Hotel/Destino'
)

const estimatedDuration = computed(() =>
  formData.value.estimatedDuration ||
  formData.value.duration ||
  '30-45 minutos'
)

// Additional Information
const specialRequests = computed(() =>
  formData.value.specialRequests ||
  props.reservation.specialRequests
)

const notes = computed(() =>
  formData.value.notes ||
  props.reservation.notes
)

const contactInstructions = computed(() =>
  formData.value.contactInstructions
)

const hasAdditionalInfo = computed(() =>
  specialRequests.value || notes.value || contactInstructions.value
)

// Pricing Information
const baseTransferPrice = computed(() =>
  formData.value.baseTransferPrice ||
  35 // Default base price
)

const vehicleUpcharge = computed(() =>
  formData.value.vehicleUpcharge
)

const roundTripSurcharge = computed(() =>
  formData.value.roundTripSurcharge
)

const carSeatFee = computed(() =>
  formData.value.carSeatFee
)

const hasPricingInfo = computed(() =>
  props.reservation.totalPrice || baseTransferPrice.value || vehicleUpcharge.value
)

// Helper functions
function formatFlightDate(dateString: string): string {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Hoy'
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana'

    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    })
  } catch (error) {
    return dateString
  }
}

function getVehicleTypeLabel(vehicleType: string): string {
  const vehicleTypes: Record<string, string> = {
    'vanSmall': 'Van Pequeña',
    'vanMedium': 'Van Mediana',
    'vanLarge': 'Van Grande',
    'suv': 'SUV Premium',
    'standard': 'Vehículo Estándar',
    'luxury': 'Vehículo de Lujo'
  }

  return vehicleTypes[vehicleType] || 'Vehículo Estándar'
}

function getVehicleCapacity(): string {
  const capacities: Record<string, string> = {
    'vanSmall': '1-6 personas',
    'vanMedium': '7-10 personas',
    'vanLarge': '11-16 personas',
    'suv': '1-6 personas',
    'standard': '1-4 personas',
    'luxury': '1-4 personas'
  }

  return capacities[vehicleType.value] || '1-4 personas'
}

function getVehicleIcon(): string {
  const icons: Record<string, string> = {
    'vanSmall': 'mdi-van-passenger',
    'vanMedium': 'mdi-van-passenger',
    'vanLarge': 'mdi-bus',
    'suv': 'mdi-car-estate',
    'standard': 'mdi-car',
    'luxury': 'mdi-car-sports'
  }

  return icons[vehicleType.value] || 'mdi-car'
}

function getVehicleColor(): string {
  const colors: Record<string, string> = {
    'vanSmall': 'blue',
    'vanMedium': 'indigo',
    'vanLarge': 'deep-purple',
    'suv': 'green',
    'standard': 'primary',
    'luxury': 'purple'
  }

  return colors[vehicleType.value] || 'primary'
}
</script>

<style scoped>
.airport-transfer-details {
  max-width: 100%;
}

/* Summary Header */
.summary-header {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(25, 118, 210, 0.05));
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-text {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
  line-height: 1.2;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 2px;
}

/* Section Titles */
.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.1);
}

/* Flight Section */
.flight-section {
  margin-bottom: 32px;
}

.flight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.flight-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.flight-card.primary-flight {
  border-left: 4px solid rgb(var(--v-theme-blue));
  background: rgba(var(--v-theme-blue), 0.05);
}

.flight-card.return-flight {
  border-left: 4px solid rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.05);
}

.flight-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.flight-type {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.flight-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flight-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.flight-datetime {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.flight-date {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.flight-time {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

/* Vehicle Section */
.vehicle-section {
  margin-bottom: 32px;
}

.vehicle-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  align-items: start;
}

.vehicle-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.vehicle-icon {
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 50%;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vehicle-details {
  display: flex;
  flex-direction: column;
}

.vehicle-type {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.vehicle-capacity {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.passenger-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.passenger-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.passenger-item.total {
  background: rgba(var(--v-theme-success), 0.05);
  border-color: rgba(var(--v-theme-success), 0.2);
}

.passenger-content {
  display: flex;
  flex-direction: column;
}

.passenger-label {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 2px;
}

.passenger-value {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.passenger-value.total-count {
  font-size: 1.2rem;
  color: rgb(var(--v-theme-success));
}

/* Car Seat Section */
.car-seat-section {
  margin-top: 20px;
}

.car-seat-alert {
  background: rgba(var(--v-theme-warning), 0.05);
  border: 1px solid rgba(var(--v-theme-warning), 0.2);
  border-radius: 12px;
  padding: 16px;
}

.alert-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.alert-title {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.seat-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-warning));
}

.seat-text {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

/* Transfer Section */
.transfer-section {
  margin-bottom: 32px;
}

.transfer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.transfer-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(var(--v-theme-info), 0.05);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-info), 0.2);
}

.transfer-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.transfer-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 4px;
}

.transfer-value {
  font-size: 0.95rem;
  color: rgba(var(--v-theme-on-surface), 0.9);
  word-break: break-word;
}

/* Additional Section */
.additional-section {
  margin-bottom: 32px;
}

.additional-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.additional-info {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
  border-radius: 12px;
  padding: 16px;
}

.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-title {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.info-content {
  color: rgba(var(--v-theme-on-surface), 0.7);
  line-height: 1.5;
}

/* Pricing Section */
.pricing-section {
  margin-bottom: 32px;
}

.pricing-breakdown {
  background: rgba(var(--v-theme-success), 0.05);
  border: 1px solid rgba(var(--v-theme-success), 0.2);
  border-radius: 12px;
  padding: 20px;
}

.pricing-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
}

.pricing-row:not(:last-child) {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.pricing-row.total-row {
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 2px solid rgba(var(--v-theme-success), 0.3);
}

.pricing-label {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.pricing-value {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.pricing-value.total {
  color: rgb(var(--v-theme-success));
  font-size: 1.2rem;
}

/* Debug Section */
.debug-section {
  margin-top: 32px;
}

.debug-content {
  font-family: monospace;
  font-size: 0.8rem;
}

.debug-content pre {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}

.debug-content h4 {
  color: rgba(var(--v-theme-on-surface), 0.8);
  margin: 16px 0 8px 0;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .vehicle-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .summary-stats {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-text {
    max-width: none;
    white-space: normal;
  }

  .flight-grid {
    grid-template-columns: 1fr;
  }

  .transfer-grid {
    grid-template-columns: 1fr;
  }

  .passenger-grid {
    grid-template-columns: 1fr;
  }

  .vehicle-info-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .pricing-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .summary-header {
    padding: 16px;
  }

  .flight-card,
  .vehicle-info-card,
  .transfer-item,
  .additional-info {
    padding: 12px;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .flight-number {
    font-size: 1.3rem;
  }
}

/* Dark Theme Support */
.v-theme--dark .stat-card {
  background: rgba(var(--v-theme-surface-variant), 0.4);
}

.v-theme--dark .flight-card {
  background: rgba(var(--v-theme-surface-variant), 0.2);
}

.v-theme--dark .flight-card.primary-flight {
  background: rgba(var(--v-theme-blue), 0.1);
}

.v-theme--dark .flight-card.return-flight {
  background: rgba(var(--v-theme-success), 0.1);
}

.v-theme--dark .vehicle-info-card {
  background: rgba(var(--v-theme-primary), 0.1);
}

.v-theme--dark .passenger-item {
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.v-theme--dark .passenger-item.total {
  background: rgba(var(--v-theme-success), 0.1);
}

.v-theme--dark .car-seat-alert {
  background: rgba(var(--v-theme-warning), 0.1);
}

.v-theme--dark .transfer-item {
  background: rgba(var(--v-theme-info), 0.1);
}

.v-theme--dark .additional-info {
  background: rgba(var(--v-theme-surface-variant), 0.2);
}

.v-theme--dark .pricing-breakdown {
  background: rgba(var(--v-theme-success), 0.1);
}

/* Animation */
.airport-transfer-details {
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Special Effects */
.flight-card {
  transition: all 0.3s ease;
}

.flight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.vehicle-info-card {
  transition: all 0.3s ease;
}

.vehicle-info-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
}

.passenger-item {
  transition: all 0.2s ease;
}

.passenger-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.transfer-item {
  transition: all 0.2s ease;
}

.transfer-item:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(var(--v-theme-info), 0.2);
}

/* Accessibility */
.flight-card:focus-within,
.vehicle-info-card:focus-within,
.passenger-item:focus-within,
.transfer-item:focus-within {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

/* Print Styles */
@media print {
  .debug-section {
    display: none;
  }

  .summary-header {
    background: white !important;
    border: 1px solid #ccc;
  }

  .stat-card {
    box-shadow: none;
    border: 1px solid #ddd;
  }

  .flight-card,
  .vehicle-info-card,
  .passenger-item,
  .transfer-item,
  .additional-info,
  .pricing-breakdown {
    background: white !important;
    border: 1px solid #ddd;
    box-shadow: none;
  }

  .flight-card:hover,
  .vehicle-info-card:hover,
  .passenger-item:hover,
  .transfer-item:hover {
    transform: none;
    box-shadow: none;
  }
}

/* Loading States */
.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Success/Error States */
.success-highlight {
  border-left: 4px solid rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.05);
}

.warning-highlight {
  border-left: 4px solid rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.05);
}

.error-highlight {
  border-left: 4px solid rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.05);
}

</style>
