<!-- src/views/SupplierConfirmationView.vue - Simplified Version -->
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
        {{ supplierData?.name || 'Cargando...' }}
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
        <template v-else-if="reservationData && supplierData">
          <!-- Reservation Details Section -->
          <ReservationDetailsCard :reservation="reservationData" :supplier="supplierData" class="mb-6" />

          <!-- Response Section -->
          <SupplierResponseCard :reservation="reservationData" :supplier="supplierData" :loading="loading"
            @decision-selected="handleDecisionSelected" @message-updated="handleMessageUpdated"
            @template-requested="handleTemplateRequested" @submit-response="handleSubmitResponse" />
        </template>

        <!-- Success Dialog -->
        <ConfirmationSuccessDialog v-model="showSuccessDialog" :decision="formData.decision" :message="successMessage"
          @continue="handleRedirect" />

        <!-- Error Snackbar -->
        <v-snackbar v-model="showErrorSnackbar" color="error" location="bottom center" timeout="5000" rounded="pill">
          <div class="d-flex align-center">
            <v-icon icon="mdi-alert-circle" class="mr-2"></v-icon>
            {{ errorSnackbarMessage }}
          </div>
          <template v-slot:actions>
            <v-btn icon="mdi-close" variant="text" @click="showErrorSnackbar = false"></v-btn>
          </template>
        </v-snackbar>

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, inject, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ReservationSupplierService } from '@/services/ReservationSupplierService.ts';
import { reservationServiceKey } from '@/services/ReservationService';
import { supplierServiceKey } from '@/services/SupplierService';
import { WhatsappService } from '@/services/whatsapp/WhatsappService';
import ReservationDetailsCard from '@/UI/components/reservation/ReservationDetailsCard.vue';
import SupplierResponseCard from '@/UI/components/suppliers/confirmation/SupplierResponseCard.vue';
import ConfirmationSuccessDialog from '@/UI/components/suppliers/confirmation/ConfirmationSuccessDialog.vue';
import type { ReservationView } from '@/views/ReservationView';
import type { SupplierView } from '@/views/SupplierView';

const route = useRoute();
const router = useRouter();

// ✅ Inject your existing services
const reservationService = inject(reservationServiceKey);
const supplierService = inject(supplierServiceKey);

// Reactive data
const initialLoading = ref(true);
const loading = ref(false);
const hasError = ref(false);
const errorMessage = ref('');

// Data
const reservationData = ref<ReservationView | null>(null);
const supplierData = ref<SupplierView | null>(null);

// Form data
const formData = reactive({
  decision: null as 'accept' | 'decline' | null,
  message: '',
  estimatedArrival: '',
  additionalNotes: ''
});

// Dialog states
const showSuccessDialog = ref(false);
const successMessage = ref('');

// Error handling
const showErrorSnackbar = ref(false);
const errorSnackbarMessage = ref('');

// Computed
const bookingIdShort = computed(() => {
  return reservationData.value?.bookingId?.slice(0, 8) || '';
});

const isFormValid = computed(() => {
  return formData.decision &&
    formData.message &&
    formData.message.trim().length >= 10;
});

// ✅ Create service instances
let reservationSupplierService: ReservationSupplierService | null = null;

// Methods
async function initializeService() {
  if (!reservationService || !supplierService) {
    throw new Error('Servicios requeridos no disponibles');
  }

  // ✅ Create WhatsApp service instance
  const whatsappService = new WhatsappService({
    confirmationBaseUrl: window.location.origin
  });

  // ✅ Create the integrated service
  reservationSupplierService = new ReservationSupplierService(
    reservationService,
    supplierService,
    whatsappService
    // Note: Calendar service can be added later when available
  );
}

async function loadConfirmationData() {
  initialLoading.value = true;
  hasError.value = false;

  try {
    // Get URL parameters
    const urlBookingId = route.query.booking as string;
    const urlSupplierId = route.query.supplier as string;

    console.log('📡 Loading confirmation data:', {
      booking: urlBookingId,
      supplier: urlSupplierId
    });

    if (!urlBookingId || !urlSupplierId) {
      throw new Error('Parámetros de URL inválidos');
    }

    // Initialize service if not ready
    if (!reservationSupplierService) {
      await initializeService();
    }

    // ✅ Load data using your existing services
    const [reservation, supplier] = await Promise.all([
      reservationService!.getReservationById(urlBookingId),
      supplierService!.getSupplierById(urlSupplierId)
    ]);

    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    if (!supplier) {
      throw new Error('Proveedor no encontrado');
    }

    // ✅ Simple validation - no complex service match logic here
    if (!supplier.canProvideService) {
      throw new Error('El proveedor no está activo para proporcionar servicios');
    }

    reservationData.value = reservation;
    supplierData.value = supplier;

    console.log('✅ Confirmation data loaded successfully');

  } catch (error) {
    console.error('❌ Error loading confirmation data:', error);
    hasError.value = true;
    errorMessage.value = error instanceof Error ? error.message : 'Error al cargar los datos';
  } finally {
    initialLoading.value = false;
  }
}

async function handleSubmitResponse() {
  if (!isFormValid.value || !reservationSupplierService) return;

  loading.value = true;

  try {
    console.log('🔄 Submitting supplier response:', formData);

    const confirmationData = {
      bookingId: reservationData.value!.bookingId,
      supplierId: supplierData.value!.id,
      decision: formData.decision!,
      message: formData.message,
      estimatedArrival: formData.estimatedArrival,
      additionalNotes: formData.additionalNotes
    };

    // ✅ Use the integrated service to process everything
    const result = await reservationSupplierService.processSupplierConfirmation(confirmationData);

    if (result.success) {
      successMessage.value = result.message;
      showSuccessDialog.value = true;
    } else {
      throw new Error(result.message);
    }

  } catch (error) {
    console.error('❌ Error submitting response:', error);
    displayErrorSnackbar(
      error instanceof Error ? error.message : 'Error al enviar la respuesta'
    );
  } finally {
    loading.value = false;
  }
}

function handleDecisionSelected(decision: 'accept' | 'decline') {
  formData.decision = decision;
  formData.message = ''; // Reset message when decision changes
}

function handleMessageUpdated(message: string) {
  formData.message = message;
}

function handleTemplateRequested() {
  if (!formData.decision || !reservationData.value) return;

  if (formData.decision === 'accept') {
    formData.message = `Confirmo que puedo realizar el servicio de ${reservationData.value.serviceName} para el ${reservationData.value.date} a las ${reservationData.value.time}. Estaré disponible y llegaré puntualmente.`;
  } else {
    formData.message = 'Lamentablemente no puedo realizar este servicio en la fecha solicitada debido a compromisos previos. Gracias por considerarme.';
  }
}

function handleRedirect() {
  // ✅ Simple redirect - could go to a supplier dashboard or main page
  router.push('/');
}

async function retryLoad() {
  await loadConfirmationData();
}

function displayErrorSnackbar(message: string) {
  errorSnackbarMessage.value = message;
  showErrorSnackbar.value = true;
}

// Lifecycle
onMounted(async () => {
  await loadConfirmationData();
});
</script>

<style scoped>
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
}
</style>
