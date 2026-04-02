<!-- PaymentLinkModal.vue - SIMPLIFICADO para usar template existente -->
<template>
  <v-dialog v-model="show" max-width="500" persistent>
    <v-card>
      <!-- Header -->
      <v-card-title class="text-h5 pt-5 pb-2 px-5 bg-primary text-white">
        <v-icon icon="mdi-credit-card-plus" class="mr-2"></v-icon>
        Enviar Link de Pago
      </v-card-title>

      <v-card-text class="px-5 pt-4">
        <!-- Información de la reserva -->
        <v-alert color="info" variant="tonal" class="mb-4">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="40" class="mr-3">
              <span class="text-white text-body-2">{{ getInitials(reservation?.clientName) }}</span>
            </v-avatar>
            <div>
              <h4 class="text-subtitle-1 font-weight-bold">{{ reservation?.clientName }}</h4>
              <p class="text-body-2 mb-0">
                {{ reservation?.serviceName }} • ${{ reservation?.totalPrice }}
              </p>
              <p class="text-caption text-medium-emphasis mb-0">
                {{ reservation?.clientEmail }}
              </p>
            </div>
          </div>
        </v-alert>

        <!-- Método de envío simplificado -->
        <v-card variant="outlined" class="mb-4">
          <v-card-text>
            <h4 class="text-subtitle-1 font-weight-bold mb-3">Método de envío:</h4>

            <v-radio-group v-model="sendMethod" class="mb-0">
              <v-radio value="auto" color="primary">
                <template #label>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-magic-staff" color="primary" class="mr-2"></v-icon>
                    <div>
                      <strong>Generar automáticamente</strong>
                      <div class="text-body-2 text-medium-emphasis">
                        Crear link de Stripe y enviar usando tu template de email
                      </div>
                    </div>
                  </div>
                </template>
              </v-radio>

              <v-radio value="manual" color="primary">
                <template #label>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-link-variant" color="primary" class="mr-2"></v-icon>
                    <div>
                      <strong>Link manual</strong>
                      <div class="text-body-2 text-medium-emphasis">
                        Usar un link de pago personalizado
                      </div>
                    </div>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>

            <!-- Campo para link manual -->
            <v-text-field
              v-if="sendMethod === 'manual'"
              v-model="manualPaymentLink"
              label="URL del payment link"
              placeholder="https://checkout.stripe.com/..."
              variant="outlined"
              density="compact"
              :rules="linkRules"
              prepend-inner-icon="mdi-link"
              class="mt-3"
            />
          </v-card-text>
        </v-card>

        <!-- Mensaje personalizado (opcional) -->
        <v-card variant="outlined">
          <v-card-text>
            <h4 class="text-subtitle-1 font-weight-bold mb-3">Personalización:</h4>

            <v-textarea
              v-model="customMessage"
              label="Mensaje personalizado (opcional)"
              placeholder="Mensaje adicional para el cliente..."
              variant="outlined"
              rows="3"
              :rules="messageRules"
              counter="300"
              hint="Este mensaje se incluirá en tu template de email existente"
            />
          </v-card-text>
        </v-card>

        <!-- Error state -->
        <v-alert
          v-if="errorMessage"
          color="error"
          variant="tonal"
          class="mt-4"
          closable
          @click:close="errorMessage = ''"
        >
          <div class="d-flex align-start">
            <v-icon icon="mdi-alert-circle" class="mr-2 mt-1"></v-icon>
            <div>
              <strong>Error al enviar</strong>
              <div class="text-body-2 mt-1">{{ errorMessage }}</div>
            </div>
          </div>
        </v-alert>

        <!-- Info: template usage -->
        <v-alert v-else color="success" variant="tonal" class="mt-4">
          <div class="d-flex align-start">
            <v-icon icon="mdi-email-check" class="mr-2 mt-1"></v-icon>
            <div>
              <strong>Tu email template se usará automáticamente</strong>
              <div class="text-body-2 mt-1">
                El payment link se integrará en tu diseño existente con toda la información de la reserva.
              </div>
            </div>
          </div>
        </v-alert>
      </v-card-text>

      <!-- Actions -->
      <v-divider></v-divider>
      <v-card-actions class="pa-5">
        <v-btn
          color="grey"
          variant="outlined"
          @click="closeModal"
          :disabled="loading">
          Cancelar
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn
          color="primary"
          variant="elevated"
          @click="sendPaymentLink"
          :loading="loading"
          :disabled="!canSend">
          <v-icon icon="mdi-send" class="mr-2"></v-icon>
          Enviar Link de Pago
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import type { ReservationView } from '@/views/ReservationView';
import { emailServiceKey } from '@/services/EmailService';

// Props
interface Props {
  modelValue: boolean;
  reservation: ReservationView | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'payment-sent': [reservation: ReservationView, result: any];
}>();

// ✅ Inject EmailService
const emailService = inject(emailServiceKey);

// Reactive state
const sendMethod = ref<'auto' | 'manual'>('auto');
const manualPaymentLink = ref('');
const customMessage = ref('');
const loading = ref(false);
const errorMessage = ref('');

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const canSend = computed(() => {
  if (!props.reservation) return false;

  if (sendMethod.value === 'manual') {
    return manualPaymentLink.value && isValidUrl(manualPaymentLink.value);
  }
  return true;
});

// Validation rules
const linkRules = [
  (v: string) => !!v || 'El link de pago es requerido',
  (v: string) => isValidUrl(v) || 'Debe ser una URL válida'
];

const messageRules = [
  (v: string) => !v || v.length <= 300 || 'El mensaje no puede exceder 300 caracteres'
];

// Methods
function getInitials(name?: string): string {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('https://');
  } catch {
    return false;
  }
}

// ✅ IMPLEMENTACIÓN SIMPLIFICADA: Enviar payment link usando template existente
async function sendPaymentLink() {
  if (!props.reservation) return;

  loading.value = true;

  try {
    let paymentUrl: string;

    if (sendMethod.value === 'auto') {
      // ✅ Generar link automáticamente usando Stripe
      paymentUrl = await generateStripePaymentUrl();
    } else {
      // ✅ Usar link manual
      paymentUrl = manualPaymentLink.value;
    }

    // ✅ Preparar datos para el template existente
    const emailData = {
      ...props.reservation,
      // ✅ CLAVE: Agregar el payment link al objeto
      paymentLink: paymentUrl,
      customMessage: customMessage.value || undefined
    };

    console.log('📧 Sending email with payment link using existing template...', {
      clientName: emailData.clientName,
      paymentLink: emailData.paymentLink,
      hasCustomMessage: !!emailData.customMessage
    });

    // ✅ Enviar usando el EmailService y template existente
    const result = await emailService.sendReservationConfirmation(emailData);

    if (!result.success) {
      throw new Error(`Failed to send payment email: ${result.error}`);
    }

    console.log('✅ Payment email sent successfully using existing template');

    // ✅ Emitir evento de éxito
    emit('payment-sent', props.reservation, {
      success: true,
      paymentUrl: paymentUrl,
      emailMessageId: result.messageId,
      method: sendMethod.value
    });

    closeModal();

  } catch (error) {
    console.error('❌ Error in sendPaymentLink:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Error desconocido';
  } finally {
    loading.value = false;
  }
}

// ✅ Generar payment URL con Stripe (simplificado)
async function generateStripePaymentUrl(): Promise<string> {
  if (!props.reservation) {
    throw new Error('No reservation data available');
  }

  console.log('🔧 Generating Stripe payment link for reservation:', props.reservation.bookingId);

  // TODO: Implementar con Stripe API real
  // Por ahora, generar un link simulado
  const mockStripeUrl = `https://checkout.stripe.com/c/pay/cs_${Date.now()}_${props.reservation.bookingId}`;

  // Simular delay de API call
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('✅ Stripe payment link generated:', mockStripeUrl);
  return mockStripeUrl;
}

function closeModal() {
  show.value = false;
  setTimeout(() => {
    sendMethod.value = 'auto';
    manualPaymentLink.value = '';
    customMessage.value = '';
    errorMessage.value = '';
    loading.value = false;
  }, 300);
}

// Watch for reservation changes
watch(() => props.reservation, (newReservation) => {
  if (newReservation) {
    // Reset form when reservation changes
    customMessage.value = '';
    manualPaymentLink.value = '';
  }
});
</script>

<style scoped>
/* Estilos simplificados para el modal */
</style>
