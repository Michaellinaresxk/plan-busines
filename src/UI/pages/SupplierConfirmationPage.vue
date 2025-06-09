<template>
  <div class="public-confirmation-page">
    <!-- Header público -->
    <div class="public-header">
      <div class="container">
        <div class="d-flex align-center">
          <v-avatar color="primary" size="40" class="mr-3">
            <v-icon icon="mdi-check-circle" color="white"></v-icon>
          </v-avatar>
          <div>
            <h1 class="text-h5 font-weight-bold">Plan Business</h1>
            <p class="text-body-2 mb-0">Confirmación de Servicio</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container py-8">
      <div class="max-width-600 mx-auto">

        <!-- Loading State -->
        <v-card v-if="initialLoading" class="pa-8 text-center">
          <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
          <h2 class="text-h6">Cargando información...</h2>
          <p class="text-body-2 text-medium-emphasis">Conectando con Firebase...</p>
        </v-card>

        <!-- Error State -->
        <v-card v-else-if="hasError" class="pa-8 text-center" color="error" variant="tonal">
          <v-icon icon="mdi-alert-circle" size="64" color="error" class="mb-4"></v-icon>
          <h2 class="text-h5 mb-3">Error al cargar</h2>
          <p class="text-body-1 mb-4">{{ errorMessage }}</p>
          <v-btn color="error" variant="outlined" @click="loadConfirmationData">Reintentar</v-btn>
        </v-card>

        <!-- Success State - Confirmation Form -->
        <template v-else-if="reservationData && supplierData && !confirmationCompleted">

          <!-- Reservation Info Card -->
          <v-card class="mb-6" rounded="xl">
            <v-card-title class="pa-6 bg-primary text-white">
              <h2 class="text-h5">{{ reservationData.serviceName }}</h2>
              <p class="text-body-2 mb-0 opacity-90">
                Reserva #{{ reservationData.bookingId.slice(0, 8) }}
              </p>
            </v-card-title>

            <v-card-text class="pa-6">
              <div class="reservation-summary">
                <div class="summary-item">
                  <strong>Cliente:</strong> {{ reservationData.clientName }}
                </div>
                <div class="summary-item">
                  <strong>Fecha:</strong> {{ reservationData.date }} - {{ reservationData.time }}
                </div>
                <div class="summary-item">
                  <strong>Precio:</strong> ${{ reservationData.totalPrice }}
                </div>
                <div v-if="reservationData.notes" class="summary-item">
                  <strong>Notas:</strong> {{ reservationData.notes }}
                </div>

                <!-- ✅ Detalles específicos del servicio -->
                <div v-if="reservationData.formData?.flightNumber" class="summary-item">
                  <strong>Vuelo:</strong> {{ reservationData.formData.flightNumber }}
                </div>
                <div v-if="reservationData.formData?.vehicleType" class="summary-item">
                  <strong>Vehículo:</strong> {{ getVehicleTypeLabel(reservationData.formData.vehicleType) }}
                </div>
                <div v-if="reservationData.formData?.passengerCount" class="summary-item">
                  <strong>Pasajeros:</strong> {{ reservationData.formData.passengerCount }}
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Supplier Response Form -->
          <v-card rounded="xl">
            <v-card-title class="pa-6">
              <h3 class="text-h6">{{ supplierData.name }}, ¿puedes realizar este servicio?</h3>
            </v-card-title>

            <v-card-text class="pa-6">
              <!-- Decision Buttons -->
              <div class="decision-section mb-6">
                <v-btn :color="formData.decision === 'accept' ? 'success' : 'default'"
                  :variant="formData.decision === 'accept' ? 'elevated' : 'outlined'" size="large"
                  class="decision-btn mr-4 mb-4" @click="selectDecision('accept')" :disabled="processing">
                  <v-icon icon="mdi-check" class="mr-2"></v-icon>
                  Sí, puedo realizarlo
                </v-btn>

                <v-btn :color="formData.decision === 'decline' ? 'error' : 'default'"
                  :variant="formData.decision === 'decline' ? 'elevated' : 'outlined'" size="large"
                  class="decision-btn mb-4" @click="selectDecision('decline')" :disabled="processing">
                  <v-icon icon="mdi-close" class="mr-2"></v-icon>
                  No puedo realizarlo
                </v-btn>
              </div>

              <!-- Message Section -->
              <div v-if="formData.decision" class="message-section">
                <v-textarea v-model="formData.message" :label="getMessageLabel()" :placeholder="getMessagePlaceholder()"
                  variant="outlined" rows="4" counter="500" maxlength="500"
                  :rules="[rules.required, rules.minLength(10)]" :disabled="processing">
                </v-textarea>

                <!-- Additional fields for acceptance -->
                <div v-if="formData.decision === 'accept'" class="mt-4">
                  <v-text-field v-model="formData.estimatedArrival" label="Hora estimada de llegada (opcional)"
                    placeholder="Ej: 2:30 PM" variant="outlined" :disabled="processing">
                  </v-text-field>
                </div>
              </div>
            </v-card-text>

            <v-card-actions class="pa-6">
              <v-spacer></v-spacer>
              <v-btn :color="formData.decision === 'accept' ? 'success' : 'error'" size="large" variant="elevated"
                :loading="processing" :disabled="!isFormValid" @click="handleSubmitResponse">
                <v-icon :icon="getSubmitIcon()" class="mr-2"></v-icon>
                {{ getSubmitText() }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </template>

        <!-- ✅ RESULT STATE - Página final sin redirección -->
        <v-card v-if="confirmationCompleted" rounded="xl">
          <v-card-text class="pa-8 text-center">
            <v-icon :icon="confirmationSuccess ? 'mdi-check-circle' : 'mdi-alert-circle'"
              :color="confirmationSuccess ? 'success' : 'error'" size="80" class="mb-4">
            </v-icon>

            <h2 class="text-h4 mb-4" :class="confirmationSuccess ? 'text-success' : 'text-error'">
              {{ confirmationSuccess ? '¡Confirmación Exitosa!' : 'Error en Confirmación' }}
            </h2>

            <p class="text-body-1 mb-6">{{ confirmationMessage }}</p>

            <!-- Status info -->
            <v-alert v-if="confirmationSuccess" color="success" variant="tonal" class="mb-6">
              <div class="text-left">
                <div class="font-weight-bold mb-2">✅ Confirmación procesada correctamente</div>
                <div v-if="formData.decision === 'accept'">
                  • El cliente recibirá tu confirmación por WhatsApp<br>
                  • La reserva cambió a estado APROBADA<br>
                  • Podrás contactar directamente al cliente si es necesario
                </div>
                <div v-else>
                  • La reserva fue marcada como RECHAZADA<br>
                  • Se buscará otro proveedor disponible<br>
                  • El cliente será informado sobre la situación
                </div>
              </div>
            </v-alert>

            <!-- Debug Info -->
            <v-card v-if="debugInfo" class="ma-4" variant="outlined">
              <v-card-title>Información de Confirmación</v-card-title>
              <v-card-text>
                <div class="text-left">
                  <p><strong>Estado:</strong> {{ debugInfo.status }}</p>
                  <p><strong>Nuevo estado de reserva:</strong> {{ debugInfo.newStatus }}</p>
                  <p><strong>Reserva ID:</strong> {{ debugInfo.bookingId }}</p>
                  <p><strong>Proveedor:</strong> {{ debugInfo.supplierName }}</p>
                  <p><strong>Procesado:</strong> {{ debugInfo.timestamp }}</p>
                </div>
              </v-card-text>
            </v-card>

            <!-- Contact Info -->
            <div class="contact-info mt-6">
              <p class="text-body-2 text-medium-emphasis mb-3">
                Gracias por usar Plan Business. Si tienes alguna pregunta, contáctanos:
              </p>
              <v-btn color="primary" variant="elevated" href="https://wa.me/18095551234" target="_blank"
                prepend-icon="mdi-whatsapp" class="mb-2">
                Contactar por WhatsApp
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

// Route
const route = useRoute();

// ✅ API Base URL para Firebase Functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001/plan-busines/us-central1';

// Reactive Data
const initialLoading = ref(true);
const processing = ref(false);
const hasError = ref(false);
const errorMessage = ref('');
const confirmationCompleted = ref(false);
const confirmationSuccess = ref(false);
const confirmationMessage = ref('');
const debugInfo = ref(null);

const reservationData = ref(null);
const supplierData = ref(null);

const formData = ref({
  decision: null,
  message: '',
  estimatedArrival: ''
});

// Validation
const rules = {
  required: (value: string) => !!value?.trim() || 'Este campo es requerido',
  minLength: (length: number) => (value: string) =>
    value?.length >= length || `Mínimo ${length} caracteres`
};

const isFormValid = computed(() => {
  return formData.value.decision &&
    formData.value.message &&
    formData.value.message.trim().length >= 10;
});

// Methods
function selectDecision(decision: 'accept' | 'decline') {
  formData.value.decision = decision;
  formData.value.message = '';

  // ✅ Plantillas de mensaje automáticas
  if (decision === 'accept') {
    formData.value.message = `Hola ${reservationData.value?.clientName}, confirmo que puedo realizar el servicio de ${reservationData.value?.serviceName} para el ${reservationData.value?.date}. Estaré puntual y listo para brindar un excelente servicio.`;
  } else {
    formData.value.message = `Lamentablemente no puedo realizar el servicio de ${reservationData.value?.serviceName} para el ${reservationData.value?.date}. Disculpe las molestias.`;
  }
}

function getMessageLabel() {
  return formData.value.decision === 'accept'
    ? 'Mensaje de confirmación'
    : 'Mensaje de disculpa';
}

function getMessagePlaceholder() {
  return formData.value.decision === 'accept'
    ? 'Confirmo que puedo realizar el servicio...'
    : 'Lamentablemente no puedo realizar este servicio...';
}

function getSubmitIcon() {
  return formData.value.decision === 'accept' ? 'mdi-check' : 'mdi-close';
}

function getSubmitText() {
  return formData.value.decision === 'accept'
    ? 'Confirmar Disponibilidad'
    : 'Rechazar Servicio';
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

// ✅ CARGA DE DATOS DESDE FIREBASE FUNCTIONS
async function loadConfirmationData() {
  try {
    initialLoading.value = true;
    hasError.value = false;
    errorMessage.value = '';

    const bookingId = route.query.booking as string;
    const supplierId = route.query.supplier as string;

    if (!bookingId || !supplierId) {
      throw new Error('Parámetros inválidos en la URL');
    }

    console.log('🔍 Loading confirmation data from Firebase Functions:', { bookingId, supplierId });

    // ✅ LLAMADA A FIREBASE FUNCTION
    const response = await fetch(
      `${API_BASE_URL}/getSupplierConfirmation?booking=${bookingId}&supplier=${supplierId}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Error del servidor');
    }

    console.log('✅ Data loaded successfully:', result.data);

    reservationData.value = result.data.reservation;
    supplierData.value = result.data.supplier;

    if (!result.data.isValid) {
      throw new Error(result.data.error || 'Datos inválidos');
    }

  } catch (error) {
    console.error('❌ Error loading confirmation data:', error);
    hasError.value = true;
    errorMessage.value = error instanceof Error ? error.message : 'Error desconocido';
  } finally {
    initialLoading.value = false;
  }
}

// ✅ ENVÍO DE CONFIRMACIÓN A FIREBASE FUNCTIONS
async function handleSubmitResponse() {
  if (!isFormValid.value || !reservationData.value || !supplierData.value) return;

  processing.value = true;

  try {
    console.log('📤 Submitting supplier confirmation to Firebase Functions...');

    const payload = {
      bookingId: reservationData.value.bookingId,
      supplierId: supplierData.value.id,
      decision: formData.value.decision,
      message: formData.value.message.trim(),
      estimatedArrival: formData.value.estimatedArrival?.trim() || null,
      timestamp: new Date().toISOString()
    };

    console.log('📋 Payload:', payload);

    // ✅ LLAMADA A FIREBASE FUNCTION
    const response = await fetch(`${API_BASE_URL}/processSupplierConfirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    console.log('📥 Firebase Functions response:', result);

    confirmationSuccess.value = result.success;
    confirmationMessage.value = result.message || 'Respuesta procesada';

    // Set debug info
    debugInfo.value = {
      status: result.success ? 'Exitoso' : 'Error',
      bookingId: payload.bookingId,
      supplierName: supplierData.value.name,
      timestamp: new Date().toLocaleString('es-ES'),
      newStatus: result.data?.newStatus || 'Unknown',
      error: result.success ? null : result.error
    };

    if (!result.success) {
      throw new Error(result.error || 'Error del servidor');
    }

    console.log('✅ Confirmation processed successfully by Firebase Functions');

  } catch (error) {
    console.error('❌ Confirmation failed:', error);

    confirmationSuccess.value = false;
    confirmationMessage.value = error instanceof Error
      ? `Error: ${error.message}`
      : 'Error al procesar la confirmación';

    debugInfo.value = {
      status: 'Error',
      bookingId: reservationData.value?.bookingId || 'Unknown',
      supplierName: supplierData.value?.name || 'Unknown',
      timestamp: new Date().toLocaleString('es-ES'),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    processing.value = false;
    confirmationCompleted.value = true;
  }
}

// Lifecycle
onMounted(() => {
  loadConfirmationData();
});
</script>

<style scoped>
.public-confirmation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.public-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 0;
  color: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.max-width-600 {
  max-width: 600px;
}

.decision-btn {
  min-width: 200px;
}

.summary-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.summary-item:last-child {
  border-bottom: none;
}

.contact-info {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
}

@media (max-width: 600px) {
  .decision-btn {
    min-width: 100%;
    margin-right: 0 !important;
  }
}
</style>
