<template>
  <v-dialog v-model="show" max-width="600" persistent>
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
            </div>
          </div>
        </v-alert>

        <!-- Opciones de envío -->
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
                        Crear link de Stripe y enviar por email
                      </div>
                    </div>
                  </div>
                </template>
              </v-radio>

              <v-radio value="manual" color="secondary">
                <template #label>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-link-variant" color="secondary" class="mr-2"></v-icon>
                    <div>
                      <strong>Agregar link manualmente</strong>
                      <div class="text-body-2 text-medium-emphasis">
                        Pegar un link de pago existente
                      </div>
                    </div>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </v-card-text>
        </v-card>

        <!-- Input para link manual (solo si está seleccionado) -->
        <v-expand-transition>
          <div v-if="sendMethod === 'manual'">
            <v-text-field
              v-model="manualPaymentLink"
              label="Link de pago"
              placeholder="https://checkout.stripe.com/c/pay/..."
              prepend-icon="mdi-link"
              variant="outlined"
              :rules="linkRules"
              class="mb-4">
            </v-text-field>
          </div>
        </v-expand-transition>

        <!-- Configuración adicional -->
        <v-card variant="outlined">
          <v-card-text>
            <h4 class="text-subtitle-1 font-weight-bold mb-3">Configuración:</h4>

            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="expirationHours"
                  :items="expirationOptions"
                  label="Expiración del link"
                  variant="outlined"
                  density="compact">
                </v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="sendWhatsApp"
                  label="También enviar por WhatsApp"
                  color="green"
                  density="compact">
                </v-switch>
              </v-col>
            </v-row>

            <v-textarea
              v-model="customMessage"
              label="Mensaje personalizado (opcional)"
              placeholder="Mensaje adicional para el cliente..."
              variant="outlined"
              rows="3"
              counter="500"
              :rules="messageRules">
            </v-textarea>
          </v-card-text>
        </v-card>

        <!-- Preview del email -->
        <v-expansion-panels class="mt-4">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon icon="mdi-eye" class="mr-2"></v-icon>
              Vista previa del email
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="email-preview">
                <div class="preview-content pa-3" style="background: #f5f5f5; border-radius: 8px;">
                  <h4>Para: {{ reservation?.clientEmail }}</h4>
                  <h4>Asunto: Link de Pago - {{ reservation?.serviceName }}</h4>
                  <hr class="my-2">
                  <p><strong>Estimado/a {{ reservation?.clientName }},</strong></p>
                  <p>Tu reserva está confirmada. Para completar el proceso, por favor realiza el pago:</p>
                  <p><strong>Servicio:</strong> {{ reservation?.serviceName }}</p>
                  <p><strong>Total:</strong> ${{ reservation?.totalPrice }}</p>
                  <div v-if="customMessage" class="mt-2 pa-2" style="background: #e3f2fd; border-radius: 4px;">
                    <strong>Mensaje especial:</strong><br>
                    {{ customMessage }}
                  </div>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
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
import { ref, computed, watch } from 'vue';
import type { ReservationView } from '@/views/ReservationView';

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

// Reactive state
const sendMethod = ref<'auto' | 'manual'>('auto');
const manualPaymentLink = ref('');
const expirationHours = ref(48);
const sendWhatsApp = ref(false);
const customMessage = ref('');
const loading = ref(false);

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const canSend = computed(() => {
  if (sendMethod.value === 'manual') {
    return manualPaymentLink.value && isValidUrl(manualPaymentLink.value);
  }
  return true;
});

// Options
const expirationOptions = [
  { title: '24 horas', value: 24 },
  { title: '48 horas', value: 48 },
  { title: '72 horas', value: 72 },
  { title: '1 semana', value: 168 }
];

// Validation rules
const linkRules = [
  (v: string) => !!v || 'El link de pago es requerido',
  (v: string) => isValidUrl(v) || 'Debe ser una URL válida'
];

const messageRules = [
  (v: string) => !v || v.length <= 500 || 'El mensaje no puede exceder 500 caracteres'
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

async function sendPaymentLink() {
  if (!props.reservation) return;

  loading.value = true;

  try {
    let result;

    if (sendMethod.value === 'auto') {
      // Generar link automáticamente usando Stripe
      result = await generateAutomaticPaymentLink();
    } else {
      // Usar link manual
      result = await sendManualPaymentLink();
    }

    if (result.success) {
      emit('payment-sent', props.reservation, result);
      closeModal();
    } else {
      // Manejar error
      console.error('Error sending payment link:', result.error);
    }

  } catch (error) {
    console.error('Error in sendPaymentLink:', error);
  } finally {
    loading.value = false;
  }
}

async function generateAutomaticPaymentLink() {
  // TODO: Implementar con PaymentService y EmailService
  console.log('Generating automatic payment link...');

  // Simular llamada
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    success: true,
    paymentUrl: 'https://checkout.stripe.com/generated-link',
    messageId: 'email-123'
  };
}

async function sendManualPaymentLink() {
  // TODO: Implementar envío con link manual
  console.log('Sending manual payment link:', manualPaymentLink.value);

  // Simular llamada
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    success: true,
    paymentUrl: manualPaymentLink.value,
    messageId: 'email-456'
  };
}

function closeModal() {
  show.value = false;
  // Reset form
  setTimeout(() => {
    sendMethod.value = 'auto';
    manualPaymentLink.value = '';
    expirationHours.value = 48;
    sendWhatsApp.value = false;
    customMessage.value = '';
    loading.value = false;
  }, 300);
}

// Watch for reservation changes
watch(() => props.reservation, (newReservation) => {
  if (newReservation) {
    // Pre-fill some data based on reservation
    expirationHours.value = 48;
  }
});
</script>

<style scoped>
.email-preview {
  max-height: 300px;
  overflow-y: auto;
}

.preview-content {
  font-family: Arial, sans-serif;
  line-height: 1.5;
}
</style>
