<!-- src/UI/views/SupplierConfirmationView.vue -->
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
        {{ supplier?.name || 'Proveedor' }}
      </v-chip>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container class="pa-6" style="max-width: 800px;">

        <!-- Reservation Details Section -->
        <v-card class="mb-6" elevation="2" rounded="xl">
          <v-card-title class="pa-6 pb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-calendar-check" color="primary" size="28" class="mr-3"></v-icon>
              <div>
                <h2 class="text-h5 font-weight-bold">Detalles de la Reserva</h2>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Solicitud de servicio #{{ reservation?.bookingId?.slice(0, 8) }}
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
                      <span class="info-value">{{ reservation?.clientName }}</span>
                    </div>

                    <div class="info-item">
                      <span class="info-label">Email:</span>
                      <span class="info-value">{{ reservation?.clientEmail }}</span>
                    </div>

                    <div class="info-item">
                      <span class="info-label">Teléfono:</span>
                      <span class="info-value">{{ reservation?.clientPhone }}</span>
                    </div>

                    <div class="info-item">
                      <span class="info-label">Precio:</span>
                      <span class="info-value font-weight-bold text-success">
                        ${{ reservation?.totalPrice }}
                      </span>
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- Service Details Factory -->
              <v-col cols="12" md="8">
                <ReservationDetailsFactory v-if="reservation" :reservation="reservation" />
              </v-col>
            </v-row>

            <!-- Additional Notes -->
            <div v-if="reservation?.notes" class="mt-4">
              <v-alert color="info" variant="tonal" rounded="lg">
                <div class="d-flex align-start">
                  <v-icon icon="mdi-note-text" class="mr-2 mt-1"></v-icon>
                  <div>
                    <div class="font-weight-medium mb-1">Notas adicionales:</div>
                    <div class="text-body-2">{{ reservation.notes }}</div>
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
                <v-btn :color="response.decision === 'accept' ? 'success' : 'default'"
                  :variant="response.decision === 'accept' ? 'elevated' : 'outlined'" size="large" class="flex-fill"
                  prepend-icon="mdi-check-circle" @click="selectDecision('accept')" :disabled="loading">
                  Sí, puedo realizarlo
                </v-btn>

                <v-btn :color="response.decision === 'decline' ? 'error' : 'default'"
                  :variant="response.decision === 'decline' ? 'elevated' : 'outlined'" size="large" class="flex-fill"
                  prepend-icon="mdi-close-circle" @click="selectDecision('decline')" :disabled="loading">
                  No puedo realizarlo
                </v-btn>
              </div>
            </div>

            <!-- Message Textarea -->
            <div class="mb-6">
              <h3 class="text-subtitle-1 font-weight-bold mb-3">
                {{ response.decision === 'accept' ? 'Mensaje de confirmación' : 'Motivo del rechazo' }}
                <span class="text-error">*</span>
              </h3>

              <v-textarea v-model="response.message" :label="getTextareaLabel()" :placeholder="getTextareaPlaceholder()"
                variant="outlined" rows="4" auto-grow :rules="messageRules" :disabled="loading || !response.decision"
                :color="response.decision === 'accept' ? 'success' : 'error'" counter maxlength="500"></v-textarea>
            </div>

            <!-- Submit Button -->
            <div class="d-flex justify-end">
              <v-btn :color="response.decision === 'accept' ? 'success' : 'error'" size="large" :loading="loading"
                :disabled="!canSubmit" @click="submitResponse" prepend-icon="mdi-send">
                {{ response.decision === 'accept' ? 'Confirmar Servicio' : 'Enviar Rechazo' }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Success/Error Messages -->
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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import ReservationDetailsFactory from '@/UI/components/suppliers/confirmation/ConfirmationDetailsFactory.vue';

// Responsive helper
const { mdAndUp } = useDisplay();

// Router
const route = useRoute();
const router = useRouter();

// Reactive data
const loading = ref(false);
const supplier = ref(null);
const reservation = ref(null);

const response = ref({
  decision: null as 'accept' | 'decline' | null,
  message: ''
});

// Snackbar state
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref<'success' | 'error' | 'warning'>('success');
const snackbarIcon = ref('mdi-check-circle');

// Validation rules
const messageRules = [
  (v: string) => !!v?.trim() || 'Este campo es requerido',
  (v: string) => v?.length >= 10 || 'El mensaje debe tener al menos 10 caracteres',
  (v: string) => v?.length <= 500 || 'El mensaje no puede exceder 500 caracteres'
];

// Computed properties
const canSubmit = computed(() => {
  return response.value.decision &&
    response.value.message?.trim().length >= 10 &&
    !loading.value;
});

// Methods
function selectDecision(decision: 'accept' | 'decline') {
  response.value.decision = decision;
  response.value.message = ''; // Clear previous message
}

function getTextareaLabel(): string {
  if (!response.value.decision) return 'Seleccione una opción primero';
  return response.value.decision === 'accept'
    ? 'Mensaje de confirmación (opcional)'
    : 'Explique el motivo del rechazo';
}

function getTextareaPlaceholder(): string {
  if (!response.value.decision) return '';

  return response.value.decision === 'accept'
    ? 'Confirmo que puedo realizar este servicio. Estaré disponible en la fecha y hora solicitada...'
    : 'Lamentablemente no puedo realizar este servicio debido a...';
}

async function submitResponse() {
  if (!canSubmit.value) return;

  loading.value = true;

  try {
    console.log('🔄 Submitting supplier response:', {
      decision: response.value.decision,
      message: response.value.message,
      reservationId: reservation.value?.bookingId,
      supplierId: supplier.value?.id
    });

    // TODO: Implement actual API call
    // const supplierInquiryService = inject(supplierInquiryServiceKey);
    // await supplierInquiryService.respondToInquiry(inquiryId, response.value);

    // Simulate API call for now
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Show success message
    const isAccept = response.value.decision === 'accept';
    showNotification(
      isAccept
        ? '¡Servicio confirmado exitosamente!'
        : 'Respuesta enviada correctamente',
      'success',
      'mdi-check-circle'
    );

    // Redirect after success
    setTimeout(() => {
      // router.push('/supplier-dashboard'); // Uncomment when route exists
      console.log('🔄 Would redirect to supplier dashboard');
    }, 2000);

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

function showNotification(message: string, color: 'success' | 'error' | 'warning', icon: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarIcon.value = icon;
  showSnackbar.value = true;
}

// Load data on mount
onMounted(async () => {
  try {
    // Get IDs from route params
    const inquiryId = route.params.inquiryId as string;
    const reservationId = route.params.reservationId as string;
    const supplierId = route.params.supplierId as string;

    console.log('📡 Loading confirmation data:', { inquiryId, reservationId, supplierId });

    // TODO: Replace with actual API calls
    // const reservationService = inject(reservationServiceKey);
    // const supplierService = inject(supplierServiceKey);
    //
    // const [reservationData, supplierData] = await Promise.all([
    //   reservationService.getReservationById(reservationId),
    //   supplierService.getSupplierById(supplierId)
    // ]);

    // Mock data - replace with actual API calls
    supplier.value = {
      id: supplierId || 'supplier-123',
      name: 'Juan Pérez',
      email: 'juan@email.com',
      phone: '(809) 555-0123',
      service: 'Transporte Aeropuerto'
    };

    // Mock reservation data with different service types for testing
    const serviceType = route.query.type || 'airport';

    if (serviceType === 'airport') {
      reservation.value = {
        bookingId: reservationId || 'booking-456',
        serviceName: 'Transporte Aeropuerto',
        clientName: 'María González',
        clientEmail: 'maria@email.com',
        clientPhone: '(809) 555-0456',
        date: '2024-01-25',
        time: '14:30',
        totalPrice: 75,
        notes: 'Vuelo internacional, necesito llegada 2 horas antes.',
        formData: {
          flightNumber: 'AA1234',
          vehicleType: 'vanMedium',
          passengerCount: 2,
          kidsCount: 1,
          needsCarSeat: true,
          carSeatCount: 1,
          isRoundTrip: true,
          returnDate: '2024-01-30',
          returnFlightNumber: 'AA5678',
          specialRequests: 'Por favor llegar 15 minutos antes de la hora programada'
        }
      };
    } else if (serviceType === 'babysitter') {
      reservation.value = {
        bookingId: reservationId || 'booking-789',
        serviceName: 'Servicio de Niñera',
        clientName: 'Ana López',
        clientEmail: 'ana@email.com',
        clientPhone: '(809) 555-0789',
        date: '2024-01-26',
        time: '19:00',
        totalPrice: 120,
        notes: 'Los niños van a dormir a las 21:00. Hay cena preparada en la nevera.',
        formData: {
          childrenCount: 2,
          childrenAges: ['5', '8'],
          startTime: '19:00',
          endTime: '23:30',
          hasSpecialNeeds: true,
          specialNeedsDetails: 'El niño menor tiene alergia a las nueces',
          specialRequests: 'Por favor revisar las tareas de matemáticas con el mayor'
        }
      };
    } else if (serviceType === 'decoration') {
      reservation.value = {
        bookingId: reservationId || 'booking-101',
        serviceName: 'Decoración Personalizada',
        clientName: 'Carlos Martínez',
        clientEmail: 'carlos@email.com',
        clientPhone: '(809) 555-0101',
        date: '2024-02-14',
        time: '18:00',
        totalPrice: 250,
        notes: 'Es una sorpresa, por favor ser discretos al llegar.',
        formData: {
          occasion: 'romantic',
          location: 'Casa privada',
          exactAddress: 'Calle Principal #123, Bella Vista, Santo Domingo',
          colors: ['#FF69B4', '#DC143C', '#FFD700'],
          referenceImage: 'https://example.com/romantic-setup.jpg',
          specialRequests: 'Incluir pétalos de rosa y velas aromáticas'
        }
      };
    } else if (serviceType === 'grocery') {
      reservation.value = {
        bookingId: reservationId || 'booking-202',
        serviceName: 'Compras de Supermercado',
        clientName: 'Sofia Herrera',
        clientEmail: 'sofia@email.com',
        clientPhone: '(809) 555-0202',
        date: '2024-01-27',
        time: '10:00',
        totalPrice: 85,
        notes: 'Preferiblemente productos orgánicos cuando sea posible.',
        formData: {
          deliveryAddress: 'Torre Corporativa, Piso 12, Oficina 1205, Piantini',
          hour: '10:00',
          hasAllergies: 'yes',
          allergyDetails: 'Alergia severa al maní y frutos secos',
          foodRestrictions: 'Dieta vegetariana estricta',
          items: [
            { name: 'Leche de almendras', quantity: 2, note: 'Sin azúcar añadida' },
            { name: 'Pan integral', quantity: 1, note: 'Preferiblemente artesanal' },
            { name: 'Tomates orgánicos', quantity: 1, note: '1 libra aproximadamente' },
            { name: 'Queso vegano', quantity: 1, note: 'Marca Violife si está disponible' },
            { name: 'Pasta integral', quantity: 2, note: 'Cualquier forma está bien' }
          ],
          specialRequests: 'Por favor revisar todas las etiquetas para confirmar que no contengan ingredientes de origen animal'
        }
      };
    }

    console.log('✅ Data loaded successfully');

  } catch (error) {
    console.error('❌ Error loading data:', error);
    showNotification(
      'Error al cargar los datos de la reserva',
      'error',
      'mdi-alert-circle'
    );
  }
});
</script>

<style scoped>
.confirmation-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), rgba(var(--v-theme-secondary), 0.02));
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

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

/* Card hover effects */
.v-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Button animations */
.v-btn {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.v-btn:hover {
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .v-container {
    padding: 16px;
  }

  .info-item {
    padding: 6px 0;
  }

  .d-flex.gap-4 {
    gap: 12px !important;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {

  .v-card,
  .v-btn {
    transition: none;
  }

  .v-card:hover,
  .v-btn:hover {
    transform: none;
  }
}
</style>
