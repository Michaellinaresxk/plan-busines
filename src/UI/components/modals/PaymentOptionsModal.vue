<!-- PaymentOptionsModal.vue -->
<template>
  <v-dialog :model-value="show" @update:model-value="updateShow" max-width="600" persistent>
    <v-card v-if="reservation">
      <v-card-title class="text-h5 pt-5 pb-2 px-5">
        <v-icon icon="mdi-send" color="primary" class="mr-2"></v-icon>
        Enviar Link de Pago
      </v-card-title>

      <v-card-text class="px-5 pt-2">
        <div class="client-info mb-4">
          <div class="d-flex align-center mb-3">
            <v-avatar color="success" size="40" class="mr-3">
              <span class="text-white">{{ getInitials(reservation.clientName) }}</span>
            </v-avatar>
            <div>
              <h4 class="text-subtitle-1 font-weight-bold">{{ reservation.clientName }}</h4>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ reservation.serviceName }} - ${{ reservation.totalPrice }}
              </p>
            </div>
          </div>
        </div>

        <v-alert color="info" variant="tonal" class="mb-4">
          Elige cómo enviar el link de pago al cliente
        </v-alert>

        <!-- Payment URL Display -->
        <v-card variant="outlined" class="mb-4">
          <v-card-text class="py-3">
            <div class="d-flex align-center">
              <div class="flex-grow-1">
                <p class="text-body-2 text-medium-emphasis mb-1">Link de pago:</p>
                <p class="text-body-1 font-mono" style="word-break: break-all;">
                  {{ paymentUrl }}
                </p>
              </div>
              <v-btn icon="mdi-content-copy" variant="text" @click="copyToClipboard(paymentUrl)"></v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Send Options -->
        <div class="send-options">
          <h4 class="text-subtitle-1 font-weight-bold mb-3">Opciones de Envío:</h4>

          <!-- WhatsApp Option -->
          <v-card class="mb-3 send-option-card" variant="outlined" hover @click="sendViaWhatsApp">
            <v-card-text class="py-3">
              <div class="d-flex align-center">
                <v-avatar color="green" size="40" class="mr-3">
                  <v-icon icon="mdi-whatsapp" color="white"></v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <h5 class="text-subtitle-2 font-weight-bold">Enviar por WhatsApp</h5>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Abre WhatsApp con el mensaje listo para enviar
                  </p>
                </div>
                <v-icon icon="mdi-chevron-right" color="medium-emphasis"></v-icon>
              </div>
            </v-card-text>
          </v-card>

          <!-- Email Option -->
          <v-card class="mb-3 send-option-card" variant="outlined" hover @click="sendViaEmail">
            <v-card-text class="py-3">
              <div class="d-flex align-center">
                <v-avatar color="blue" size="40" class="mr-3">
                  <v-icon icon="mdi-email" color="white"></v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <h5 class="text-subtitle-2 font-weight-bold">Enviar por Email</h5>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Abre tu cliente de email con el mensaje listo
                  </p>
                </div>
                <v-icon icon="mdi-chevron-right" color="medium-emphasis"></v-icon>
              </div>
            </v-card-text>
          </v-card>

          <!-- Copy Message Option -->
          <v-card class="mb-3 send-option-card" variant="outlined" hover @click="copyMessage">
            <v-card-text class="py-3">
              <div class="d-flex align-center">
                <v-avatar color="orange" size="40" class="mr-3">
                  <v-icon icon="mdi-content-copy" color="white"></v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <h5 class="text-subtitle-2 font-weight-bold">Copiar Mensaje</h5>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Copia el mensaje completo para enviar manualmente
                  </p>
                </div>
                <v-icon icon="mdi-chevron-right" color="medium-emphasis"></v-icon>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Message Preview -->
        <v-expansion-panels v-model="showPreview" class="mt-4">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon icon="mdi-eye" class="mr-2"></v-icon>
              Ver mensaje completo
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="message-preview">
                <pre class="text-body-2" style="white-space: pre-wrap; font-family: inherit;">{{ fullMessage }}</pre>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions class="px-5 pb-5">
        <v-btn color="secondary" variant="text" @click="closeModal">
          Cancelar
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="success" @click="markAsSent">
          Marcar como Enviado
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Success Snackbar -->
  <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000">
    {{ snackbarText }}
    <template v-slot:actions>
      <v-btn icon="mdi-close" variant="text" @click="showSnackbar = false"></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface PaymentLinkData {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  totalPrice: number;
  date: string;
  time: string;
}

// Props
const props = defineProps<{
  show: boolean;
  reservation: PaymentLinkData | null;
}>();

// Emits
const emit = defineEmits<{
  'close': [];
  'sent': [reservation: PaymentLinkData];
  'update:show': [value: boolean]; // ✅ Agregamos este emit para v-model
}>();

// State
const showPreview = ref<number | undefined>();
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref<'success' | 'info' | 'warning'>('success');

// Computed
const paymentUrl = computed(() => {
  if (!props.reservation) return '';
  return `${window.location.origin}/pay?booking=${props.reservation.bookingId}&amount=${props.reservation.totalPrice}&service=${encodeURIComponent(props.reservation.serviceName)}`;
});

const fullMessage = computed(() => {
  if (!props.reservation) return '';
  return `🎉 ¡Hola ${props.reservation.clientName}!

Tu servicio de ${props.reservation.serviceName} está confirmado para el ${props.reservation.date} a las ${props.reservation.time}.

💰 Total a pagar: ${props.reservation.totalPrice}

👆 Paga aquí de forma segura:
${paymentUrl.value}

Una vez completado el pago, recibirás todos los detalles del servicio.

¡Gracias por confiar en nosotros! ✨

Plan-Business`;
});

// Methods
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function updateShow(value: boolean) {
  if (!value) {
    closeModal();
  }
}

function sendViaWhatsApp() {
  if (!props.reservation) return;

  // Placeholder phone - en producción obtendrías el teléfono real
  const phone = '18091234567'; // props.reservation.clientPhone
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage.value)}`;

  window.open(whatsappUrl, '_blank');
  showNotification('WhatsApp abierto con el mensaje listo', 'success');
}

function sendViaEmail() {
  if (!props.reservation) return;

  const subject = `Link de pago - ${props.reservation.serviceName}`;
  const emailUrl = `mailto:${props.reservation.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage.value)}`;

  window.open(emailUrl);
  showNotification('Cliente de email abierto', 'success');
}

async function copyMessage() {
  if (!fullMessage.value) return;

  try {
    await navigator.clipboard.writeText(fullMessage.value);
    showNotification('Mensaje copiado al portapapeles', 'success');
  } catch (error) {
    console.error('Error copying message:', error);
    showNotification('Error al copiar mensaje', 'warning');
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Link copiado al portapapeles', 'success');
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    showNotification('Error al copiar', 'warning');
  }
}

function markAsSent() {
  if (!props.reservation) return;

  emit('sent', props.reservation);
  closeModal();
  showNotification('Reserva marcada como enviada', 'success');
}

function closeModal() {
  emit('close');
}

function showNotification(message: string, color: 'success' | 'info' | 'warning') {
  snackbarText.value = message;
  snackbarColor.value = color;
  showSnackbar.value = true;
}
</script>

<style scoped>
.send-option-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-option-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.message-preview {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.font-mono {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}
</style>
