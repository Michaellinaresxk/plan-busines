<template>
  <v-app>
    <!-- Header Section -->
    <v-app-bar elevation="0" color="primary" class="px-4">
      <v-avatar color="white" size="40" class="mr-3">
        <v-icon icon="mdi-account-check" color="primary"></v-icon>
      </v-avatar>

      <v-app-bar-title class="text-white font-weight-bold">
        Confirmación de Servicio
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <v-chip color="white" text-color="primary" size="small" class="font-weight-medium">
        {{ supplierName }}
      </v-chip>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container class="pa-6" style="max-width: 800px;">

        <!-- Loading State -->
        <div v-if="initialLoading" class="d-flex justify-center align-center py-12">
          <div class="text-center">
            <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
            <h3 class="text-h6">Cargando información...</h3>
            <p class="text-body-2 text-medium-emphasis">Obteniendo detalles de la reserva</p>
          </div>
        </div>

        <!-- Error State -->
        <v-card v-else-if="hasError" class="pa-8 text-center" color="error" variant="tonal">
          <v-icon icon="mdi-alert-circle" size="64" color="error" class="mb-4"></v-icon>
          <h3 class="text-h5 mb-2">Error al cargar la solicitud</h3>
          <p class="text-body-1 mb-4">{{ errorMessage }}</p>
          <v-btn color="error" variant="outlined" @click="retryLoad">
            <v-icon icon="mdi-refresh" class="mr-2"></v-icon>
            Intentar nuevamente
          </v-btn>
        </v-card>

        <!-- Success State -->
        <template v-else>
          <!-- Reservation Details Section -->
          <v-card class="mb-6" elevation="2" rounded="xl">
            <v-card-title class="pa-6 pb-4">
              <div class="d-flex align-center">
                <v-icon icon="mdi-calendar-check" color="primary" size="28" class="mr-3"></v-icon>
                <div>
                  <h2 class="text-h5 font-weight-bold">Detalles de la Reserva</h2>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Solicitud #{{ bookingIdShort }}
                  </p>
                </div>
              </div>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="pa-6">
              <v-row>
                <!-- Client Information -->
                <v-col cols="12" md="4">
                  <div class="info-section">
                    <h3 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
                      <v-icon icon="mdi-account" size="20" class="mr-2" color="primary"></v-icon>
                      Información del Cliente
                    </h3>

                    <div class="info-grid">
                      <div class="info-item">
                        <span class="info-label">Nombre:</span>
                        <span class="info-value">{{ clientName }}</span>
                      </div>

                      <div class="info-item">
                        <span class="info-label">Email:</span>
                        <span class="info-value">{{ clientEmail }}</span>
                      </div>

                      <div class="info-item">
                        <span class="info-label">Teléfono:</span>
                        <span class="info-value">{{ clientPhone }}</span>
                      </div>

                      <div class="info-item">
                        <span class="info-label">Precio:</span>
                        <span class="info-value font-weight-bold text-success">
                          ${{ totalPrice }}
                        </span>
                      </div>
                    </div>
                  </div>
                </v-col>

                <!-- Service Details -->
                <v-col cols="12" md="8">
                  <div class="service-details">
                    <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
                      <v-icon icon="mdi-tools" size="24" color="primary" class="mr-2"></v-icon>
                      {{ serviceName }}
                    </h3>

                    <div class="details-grid">
                      <div class="detail-row">
                        <span class="detail-label">Fecha:</span>
                        <span class="detail-value">{{ serviceDate }}</span>
                      </div>

                      <div class="detail-row">
                        <span class="detail-label">Hora:</span>
                        <span class="detail-value">{{ serviceTime }}</span>
                      </div>

                      <div v-if="flightNumber" class="detail-row">
                        <span class="detail-label">Número de vuelo:</span>
                        <span class="detail-value">{{ flightNumber }}</span>
                      </div>

                      <div v-if="vehicleType" class="detail-row">
                        <span class="detail-label">Tipo de vehículo:</span>
                        <span class="detail-value">{{ vehicleTypeLabel }}</span>
                      </div>

                      <div v-if="passengerCount > 0" class="detail-row">
                        <span class="detail-label">Pasajeros:</span>
                        <span class="detail-value">{{ passengerCount }}</span>
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <!-- Additional Notes -->
              <div v-if="notes" class="mt-4">
                <v-alert color="info" variant="tonal" rounded="lg">
                  <div class="d-flex align-start">
                    <v-icon icon="mdi-note-text" class="mr-2 mt-1"></v-icon>
                    <div>
                      <div class="font-weight-medium mb-1">Notas adicionales:</div>
                      <div class="text-body-2">{{ notes }}</div>
                    </div>
                  </div>
                </v-alert>
              </div>
            </v-card-text>
          </v-card>

          <!-- Response Section -->
          <v-card elevation="2" rounded="xl">
            <v-card-title class="pa-6 pb-4">
              <div class="d-flex align-center">
                <v-icon icon="mdi-message-reply" color="primary" size="28" class="mr-3"></v-icon>
                <div>
                  <h2 class="text-h5 font-weight-bold">Su Respuesta</h2>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Confirme si puede realizar este servicio
                  </p>
                </div>
              </div>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="pa-6">
              <!-- Decision Buttons -->
              <div class="mb-6">
                <h3 class="text-subtitle-1 font-weight-bold mb-4">¿Puede realizar este servicio?</h3>

                <div class="d-flex flex-column flex-sm-row gap-4">
                  <v-btn :color="decision === 'accept' ? 'success' : 'default'"
                    :variant="decision === 'accept' ? 'elevated' : 'outlined'" size="large" class="flex-fill"
                    prepend-icon="mdi-check-circle" @click="selectDecision('accept')" :disabled="loading">
                    Sí, puedo realizarlo
                  </v-btn>

                  <v-btn :color="decision === 'decline' ? 'error' : 'default'"
                    :variant="decision === 'decline' ? 'elevated' : 'outlined'" size="large" class="flex-fill"
                    prepend-icon="mdi-close-circle" @click="selectDecision('decline')" :disabled="loading">
                    No puedo realizarlo
                  </v-btn>
                </div>
              </div>

              <!-- Message Textarea -->
              <div class="mb-6">
                <h3 class="text-subtitle-1 font-weight-bold mb-3">
                  {{ decision === 'accept' ? 'Mensaje de confirmación' : 'Motivo del rechazo' }}
                  <span class="text-error">*</span>
                </h3>

                <v-textarea v-model="message" :label="textareaLabel" :placeholder="textareaPlaceholder"
                  variant="outlined" rows="4" auto-grow :disabled="loading || !decision"
                  :color="decision === 'accept' ? 'success' : 'error'" counter maxlength="500"></v-textarea>

                <!-- Template button -->
                <div v-if="decision" class="mt-2">
                  <v-btn size="small" variant="text" :color="decision === 'accept' ? 'success' : 'error'"
                    @click="useTemplate">
                    <v-icon icon="mdi-text-box-plus" class="mr-1"></v-icon>
                    Usar plantilla
                  </v-btn>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="d-flex justify-end">
                <v-btn :color="decision === 'accept' ? 'success' : 'error'" size="large" :loading="loading"
                  :disabled="!canSubmit" @click="handleSubmit" prepend-icon="mdi-send">
                  {{ decision === 'accept' ? 'Confirmar Servicio' : 'Enviar Rechazo' }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </template>

        <!-- Success Dialog -->
        <v-dialog v-model="showSuccessDialog" max-width="500" persistent>
          <v-card rounded="xl">
            <v-card-text class="pa-8 text-center">
              <v-avatar :color="decision === 'accept' ? 'success' : 'info'" size="80" class="mb-4">
                <v-icon :icon="decision === 'accept' ? 'mdi-check-circle' : 'mdi-information'" size="40"
                  color="white"></v-icon>
              </v-avatar>

              <h3 class="text-h5 mb-3">
                {{ decision === 'accept' ? '¡Servicio Confirmado!' : 'Respuesta Enviada' }}
              </h3>

              <p class="text-body-1 mb-6">{{ successMessage }}</p>

              <v-btn color="primary" @click="handleRedirect">
                Continuar
              </v-btn>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Snackbar for notifications -->
        <v-snackbar v-model="showSnackbar" :color="snackbarColor" location="bottom center" timeout="5000"
          rounded="pill">
          <div class="d-flex align-center">
            <v-icon :icon="snackbarIcon" class="mr-2"></v-icon>
            {{ snackbarMessage }}
          </div>
          <template v-slot:actions>
            <v-btn icon="mdi-close" variant="text" @click="showSnackbar = false"></v-btn>
          </template>
        </v-snackbar>

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Router
const route = useRoute();
const router = useRouter();

// Reactive data
const initialLoading = ref(true);
const loading = ref(false);
const hasError = ref(false);
const errorMessage = ref('');

// Reservation data
const bookingId = ref('');
const serviceName = ref('');
const clientName = ref('');
const clientEmail = ref('');
const clientPhone = ref('');
const serviceDate = ref('');
const serviceTime = ref('');
const totalPrice = ref(0);
const notes = ref('');

// Service specific data
const flightNumber = ref('');
const vehicleType = ref('');
const passengerCount = ref(0);

// Supplier data
const supplierId = ref('');
const supplierName = ref('');

// Response data
const decision = ref(null);
const message = ref('');

// Dialog states
const showSuccessDialog = ref(false);
const successMessage = ref('');

// Snackbar state
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const snackbarIcon = ref('mdi-check-circle');

// Computed properties
const bookingIdShort = computed(() => {
  return bookingId.value ? bookingId.value.slice(0, 8) : '';
});

const vehicleTypeLabel = computed(() => {
  const vehicleTypes = {
    'vanSmall': 'Van Pequeña (1-6 personas)',
    'vanMedium': 'Van Mediana (7-10 personas)',
    'vanLarge': 'Van Grande (11-16 personas)',
    'suv': 'SUV (1-6 personas)'
  };

  return vehicleTypes[vehicleType.value] || vehicleType.value;
});

const textareaLabel = computed(() => {
  if (!decision.value) return 'Seleccione una opción primero';
  return decision.value === 'accept'
    ? 'Mensaje de confirmación'
    : 'Explique el motivo del rechazo';
});

const textareaPlaceholder = computed(() => {
  if (!decision.value) return '';

  return decision.value === 'accept'
    ? 'Confirmo que puedo realizar este servicio. Estaré disponible en la fecha y hora solicitada...'
    : 'Lamentablemente no puedo realizar este servicio debido a...';
});

const canSubmit = computed(() => {
  return decision.value &&
    message.value &&
    message.value.trim().length >= 10 &&
    !loading.value;
});

// Methods
function selectDecision(newDecision) {
  decision.value = newDecision;
  message.value = '';
}

function useTemplate() {
  if (!decision.value) return;

  if (decision.value === 'accept') {
    message.value = `Confirmo que puedo realizar el servicio de ${serviceName.value} para el ${serviceDate.value} a las ${serviceTime.value}. Estaré disponible y llegaré puntualmente.`;
  } else {
    message.value = 'Lamentablemente no puedo realizar este servicio en la fecha solicitada debido a compromisos previos. Gracias por considerarme.';
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return;

  loading.value = true;

  try {
    console.log('🔄 Submitting supplier response:', {
      decision: decision.value,
      message: message.value,
      reservationId: bookingId.value,
      supplierId: supplierId.value
    });

    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mostrar mensaje de éxito
    const isAccept = decision.value === 'accept';
    successMessage.value = isAccept
      ? '¡Servicio confirmado exitosamente! El cliente será notificado.'
      : 'Respuesta enviada correctamente. Buscaremos otro proveedor disponible.';

    showSuccessDialog.value = true;

  } catch (error) {
    console.error('❌ Error submitting response:', error);
    showNotification(
      'Error al enviar la respuesta. Inténtelo nuevamente.',
      'error',
      'mdi-alert-circle'
    );
  } finally {
    loading.value = false;
  }
}

function handleRedirect() {
  router.push('/');
}

async function loadConfirmationData() {
  initialLoading.value = true;
  hasError.value = false;

  try {
    // Obtener parámetros de la URL
    const urlBookingId = route.query.booking;
    const urlSupplierId = route.query.supplier;

    console.log('📡 Loading confirmation data:', {
      booking: urlBookingId,
      supplier: urlSupplierId
    });

    if (!urlBookingId || !urlSupplierId) {
      throw new Error('Parámetros de URL inválidos');
    }

    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Asignar datos simulados
    bookingId.value = urlBookingId;
    supplierId.value = urlSupplierId;
    serviceName.value = 'Transporte Aeropuerto';
    clientName.value = 'María González';
    clientEmail.value = 'maria@email.com';
    clientPhone.value = '(809) 555-0456';
    serviceDate.value = '2024-01-25';
    serviceTime.value = '14:30';
    totalPrice.value = 75;
    notes.value = 'Vuelo internacional, necesito llegada 2 horas antes.';
    flightNumber.value = 'AA1234';
    vehicleType.value = 'vanMedium';
    passengerCount.value = 2;
    supplierName.value = 'Juan Pérez';

    console.log('✅ Confirmation data loaded successfully');

  } catch (error) {
    console.error('❌ Error loading confirmation data:', error);
    hasError.value = true;
    errorMessage.value = error.message || 'Error al cargar los datos';
  } finally {
    initialLoading.value = false;
  }
}

async function retryLoad() {
  await loadConfirmationData();
}

function showNotification(messageText, color, icon) {
  snackbarMessage.value = messageText;
  snackbarColor.value = color;
  snackbarIcon.value = icon;
  showSnackbar.value = true;
}

// Lifecycle
onMounted(() => {
  loadConfirmationData();
});
</script>

<style scoped>
.info-section {
  height: 100%;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 4px;
}

.info-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.87);
  word-break: break-word;
}

.service-details {
  width: 100%;
}

.details-grid {
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

.v-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.v-btn {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.v-btn:hover {
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .v-container {
    padding: 16px;
  }

  .info-item {
    padding: 6px 0;
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
