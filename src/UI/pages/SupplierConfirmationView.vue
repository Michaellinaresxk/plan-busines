<template>
  <div class="supplier-confirmation-view">
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 60vh;">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <!-- Error State -->
    <v-container v-else-if="error" class="text-center py-16">
      <v-icon icon="mdi-alert-circle" size="64" color="error" class="mb-4"></v-icon>
      <h2 class="text-h4 mb-4">Error al cargar la solicitud</h2>
      <p class="text-body-1 text-medium-emphasis mb-6">{{ error }}</p>
      <v-btn color="primary" @click="loadReservationData">
        Intentar de nuevo
      </v-btn>
    </v-container>

    <!-- Main Content -->
    <v-container v-else-if="reservation" class="py-6" max-width="800">
      <!-- Header -->
      <div class="text-center mb-8">
        <v-avatar color="primary" size="80" class="mb-4">
          <v-icon icon="mdi-account-check" size="40" color="white"></v-icon>
        </v-avatar>
        <h1 class="text-h3 font-weight-bold mb-2">Confirmación de Servicio</h1>
        <p class="text-h6 text-medium-emphasis">
          Se te ha solicitado realizar el siguiente servicio
        </p>
      </div>

      <!-- Reservation Details Card -->
      <v-card class="mb-6" rounded="xl" elevation="2">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon :icon="getServiceIcon()" size="32" :color="getServiceColor()" class="mr-3"></v-icon>
            <div>
              <h2 class="text-h5 font-weight-bold">{{ reservation.serviceName }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Reserva #{{ reservation.bookingId?.slice(0, 8) }}
              </p>
            </div>
          </div>
        </v-card-title>

        <v-divider></v-divider>

        <!-- Client Information -->
        <v-card-text class="pa-6">
          <div class="mb-6">
            <h3 class="text-h6 font-weight-bold mb-4">Información del Cliente</h3>
            <div class="client-info-grid">
              <div class="info-item">
                <v-icon icon="mdi-account" size="20" class="mr-2"></v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">Cliente</div>
                  <div class="font-weight-medium">{{ reservation.clientName }}</div>
                </div>
              </div>

              <div class="info-item">
                <v-icon icon="mdi-email" size="20" class="mr-2"></v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">Email</div>
                  <div class="font-weight-medium">{{ reservation.clientEmail }}</div>
                </div>
              </div>

              <div class="info-item">
                <v-icon icon="mdi-phone" size="20" class="mr-2"></v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">Teléfono</div>
                  <div class="font-weight-medium">{{ reservation.clientPhone }}</div>
                </div>
              </div>

              <div class="info-item">
                <v-icon icon="mdi-calendar" size="20" class="mr-2"></v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">Fecha y Hora</div>
                  <div class="font-weight-medium">{{ formatBookingDate() }}</div>
                </div>
              </div>

              <div class="info-item">
                <v-icon icon="mdi-currency-usd" size="20" class="mr-2"></v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">Precio</div>
                  <div class="font-weight-medium text-success">${{ reservation.totalPrice }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Service Details using Factory -->
          <div class="mb-6">
            <h3 class="text-h6 font-weight-bold mb-4">Detalles del Servicio</h3>
            <SupplierConfirmationFactory :reservation="reservation" :service-type="detectedServiceType" />
          </div>

          <!-- Notes if any -->
          <div v-if="reservation.notes" class="mb-6">
            <h3 class="text-h6 font-weight-bold mb-4">Notas Adicionales</h3>
            <v-card color="blue-grey-lighten-5" rounded="lg" class="pa-4">
              <p class="mb-0">{{ reservation.notes }}</p>
            </v-card>
          </div>
        </v-card-text>
      </v-card>

      <!-- Response Form -->
      <v-card rounded="xl" elevation="2">
        <v-card-title class="pa-6 pb-4">
          <h2 class="text-h5 font-weight-bold">Tu Respuesta</h2>
        </v-card-title>

        <v-card-text class="pa-6 pt-0">
          <v-form ref="formRef" v-model="isFormValid">
            <!-- Response Options -->
            <div class="mb-6">
              <h3 class="text-subtitle-1 font-weight-bold mb-4">¿Puedes realizar este servicio?</h3>
              <v-radio-group v-model="response.status" :rules="[rules.required]" class="response-options">
                <v-radio value="accepted" color="success" class="accept-option">
                  <template v-slot:label>
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-check-circle" color="success" class="mr-2"></v-icon>
                      <div>
                        <div class="font-weight-bold">Sí, acepto realizar el servicio</div>
                        <div class="text-caption text-medium-emphasis">Confirmo que puedo completar esta solicitud</div>
                      </div>
                    </div>
                  </template>
                </v-radio>

                <v-radio value="declined" color="error" class="decline-option">
                  <template v-slot:label>
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-close-circle" color="error" class="mr-2"></v-icon>
                      <div>
                        <div class="font-weight-bold">No puedo realizar el servicio</div>
                        <div class="text-caption text-medium-emphasis">No estoy disponible o no puedo completar esta
                          solicitud</div>
                      </div>
                    </div>
                  </template>
                </v-radio>
              </v-radio-group>
            </div>

            <!-- Additional Message -->
            <div class="mb-6">
              <h3 class="text-subtitle-1 font-weight-bold mb-3">
                Mensaje Adicional
                <span class="text-caption text-medium-emphasis font-weight-regular">(Opcional)</span>
              </h3>
              <v-textarea v-model="response.message" label="Agrega cualquier información adicional..."
                placeholder="Ejemplo: Confirmo disponibilidad para la fecha solicitada. Estaré contactando al cliente 30 minutos antes del servicio."
                variant="outlined" rows="4" counter="500" :rules="[rules.maxLength(500)]" rounded="lg"></v-textarea>
            </div>

            <!-- Actions -->
            <div class="d-flex flex-column flex-sm-row gap-3">
              <v-btn color="success" size="large" :loading="submitting"
                :disabled="!isFormValid || response.status !== 'accepted'" @click="handleSubmit"
                prepend-icon="mdi-check-circle" class="flex-grow-1">
                Confirmar Aceptación
              </v-btn>

              <v-btn color="error" size="large" variant="outlined" :loading="submitting"
                :disabled="!isFormValid || response.status !== 'declined'" @click="handleSubmit"
                prepend-icon="mdi-close-circle" class="flex-grow-1">
                Confirmar Rechazo
              </v-btn>
            </div>

            <div class="text-center mt-4">
              <p class="text-caption text-medium-emphasis">
                Tu respuesta será enviada inmediatamente al cliente y al administrador
              </p>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Success Dialog -->
    <v-dialog v-model="showSuccessDialog" max-width="500" persistent>
      <v-card rounded="xl">
        <v-card-text class="text-center pa-8">
          <v-icon :icon="response.status === 'accepted' ? 'mdi-check-circle' : 'mdi-information'"
            :color="response.status === 'accepted' ? 'success' : 'info'" size="64" class="mb-4"></v-icon>

          <h2 class="text-h4 font-weight-bold mb-4">
            {{ response.status === 'accepted' ? '¡Servicio Confirmado!' : 'Respuesta Enviada' }}
          </h2>

          <p class="text-body-1 mb-6">
            {{ response.status === 'accepted'
              ? 'Has confirmado que realizarás este servicio. El cliente será notificado.'
              : 'Tu respuesta ha sido registrada. El cliente será notificado.'
            }}
          </p>

          <v-btn color="primary" size="large" @click="handleGoHome" prepend-icon="mdi-home">
            Finalizar
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ReservationService, ServiceType } from '@/services/ReservationServiceFactory';
import SupplierConfirmationFactory from '@/UI/components/suppliers/confirmation/SupplierConfirmationFactory';

// Router
const route = useRoute();

// Props from route
const reservationId = computed(() => route.params.reservationId as string);
const supplierId = computed(() => route.params.supplierId as string);

// State
const loading = ref(true);n
const submitting = ref(false);
const error = ref('');
const reservation = ref(null);
const isFormValid = ref(false);
const showSuccessDialog = ref(false);
const formRef = ref();

// Form data
const response = ref({
  status: '',
  message: ''
});

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Este campo es requerido',
  maxLength: (max: number) => (value: string) =>
    !value || value.length <= max || `Máximo ${max} caracteres`
};

// Computed
const detectedServiceType = computed(() => {
  if (!reservation.value) return ServiceType.UNKNOWN;
  return ReservationService.detectServiceType(reservation.value);
});

// Methods
function getServiceIcon(): string {
  return ReservationService.getServiceIcon(detectedServiceType.value);
}

function getServiceColor(): string {
  return ReservationService.getServiceColor(detectedServiceType.value);
}

function formatBookingDate(): string {
  if (!reservation.value?.bookingDate) return '';

  const date = new Date(reservation.value.bookingDate);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function loadReservationData() {
  loading.value = true;
  error.value = '';

  try {
    // TODO: Aquí irá la llamada al servicio real
    // Por ahora simulamos los datos
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock data - esto vendrá del servicio
    reservation.value = {
      bookingId: reservationId.value,
      serviceName: 'Transporte al Aeropuerto',
      clientName: 'María González',
      clientEmail: 'maria@example.com',
      clientPhone: '(809) 555-0123',
      totalPrice: 75,
      bookingDate: new Date(),
      notes: 'Necesito llegar al aeropuerto a las 6:00 AM. Vuelo internacional.',
      formData: {
        flightNumber: 'AA1234',
        vehicleType: 'suv',
        passengerCount: 2,
        kidsCount: 0,
        needsCarSeat: false,
        isRoundTrip: false,
        pickupLocation: 'Hotel Dreams Suites',
        dropoffLocation: 'Aeropuerto Internacional Las Américas'
      }
    };

    console.log('Reservation loaded:', reservation.value);
  } catch (err) {
    console.error('Error loading reservation:', err);
    error.value = 'No se pudo cargar la información de la reserva. Verifica el enlace e intenta de nuevo.';
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  if (!isFormValid.value) return;

  submitting.value = true;

  try {
    // TODO: Aquí irá la llamada al servicio real
    console.log('Submitting response:', {
      reservationId: reservationId.value,
      supplierId: supplierId.value,
      response: response.value
    });

    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 2000));

    showSuccessDialog.value = true;
  } catch (err) {
    console.error('Error submitting response:', err);
    // TODO: Mostrar error al usuario
  } finally {
    submitting.value = false;
  }
}

function handleGoHome() {
  // TODO: Redirigir a donde sea apropiado
  window.close(); // O redirigir a una página de inicio
}

// Lifecycle
onMounted(() => {
  console.log('SupplierConfirmationView mounted', {
    reservationId: reservationId.value,
    supplierId: supplierId.value
  });

  loadReservationData();
});
</script>

<style scoped>
.supplier-confirmation-view {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.client-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1rem;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
}

.response-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.accept-option,
.decline-option {
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.accept-option {
  border: 2px solid rgba(var(--v-theme-success), 0.2);
  background-color: rgba(var(--v-theme-success), 0.05);
}

.decline-option {
  border: 2px solid rgba(var(--v-theme-error), 0.2);
  background-color: rgba(var(--v-theme-error), 0.05);
}

.accept-option:hover {
  border-color: rgba(var(--v-theme-success), 0.4);
  background-color: rgba(var(--v-theme-success), 0.1);
}

.decline-option:hover {
  border-color: rgba(var(--v-theme-error), 0.4);
  background-color: rgba(var(--v-theme-error), 0.1);
}

@media (max-width: 600px) {
  .client-info-grid {
    grid-template-columns: 1fr;
  }

  .d-flex.flex-column.flex-sm-row {
    flex-direction: column;
  }
}
</style>
