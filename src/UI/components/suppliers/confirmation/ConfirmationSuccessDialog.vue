<template>
  <v-dialog v-model="dialogModel" max-width="500px" persistent>
    <v-card rounded="xl" elevation="8">
      <!-- Success Header -->
      <div class="success-header">
        <div class="success-icon-container">
          <v-icon :icon="getSuccessIcon()" size="48" color="white"></v-icon>
        </div>
        <div class="success-animation">
          <div class="checkmark-circle" v-if="decision === 'accept'">
            <div class="checkmark"></div>
          </div>
          <div class="decline-circle" v-else>
            <div class="decline-mark"></div>
          </div>
        </div>
      </div>

      <!-- Success Content -->
      <v-card-text class="pa-8 text-center">
        <h2 class="text-h4 font-weight-bold mb-4" :class="getTitleClass()">
          {{ getSuccessTitle() }}
        </h2>

        <p class="text-body-1 text-medium-emphasis mb-6">
          {{ message }}
        </p>

        <!-- Success Details -->
        <div class="success-details">
          <v-alert
            :color="getAlertColor()"
            variant="tonal"
            rounded="lg"
            class="mb-6">
            <div class="d-flex align-start">
              <v-icon :icon="getAlertIcon()" class="mr-3 mt-1"></v-icon>
              <div class="text-left">
                <div class="font-weight-bold mb-2">{{ getAlertTitle() }}</div>
                <div class="text-body-2">{{ getAlertMessage() }}</div>
              </div>
            </div>
          </v-alert>

          <!-- Next Steps -->
          <div class="next-steps" v-if="decision === 'accept'">
            <h3 class="text-h6 font-weight-bold mb-3">Próximos pasos:</h3>
            <div class="steps-list">
              <div class="step-item">
                <v-icon icon="mdi-calendar-plus" color="success" class="mr-3"></v-icon>
                <span>Se agregará al calendario automáticamente</span>
              </div>
              <div class="step-item">
                <v-icon icon="mdi-whatsapp" color="success" class="mr-3"></v-icon>
                <span>El cliente recibirá tu confirmación por WhatsApp</span>
              </div>
              <div class="step-item">
                <v-icon icon="mdi-phone" color="success" class="mr-3"></v-icon>
                <span>Podrás contactar directamente al cliente si es necesario</span>
              </div>
            </div>
          </div>

          <div class="next-steps" v-else>
            <h3 class="text-h6 font-weight-bold mb-3">¿Qué sucede ahora?</h3>
            <div class="steps-list">
              <div class="step-item">
                <v-icon icon="mdi-account-search" color="info" class="mr-3"></v-icon>
                <span>Buscaremos otro proveedor disponible</span>
              </div>
              <div class="step-item">
                <v-icon icon="mdi-whatsapp" color="info" class="mr-3"></v-icon>
                <span>El cliente será informado sobre la situación</span>
              </div>
              <div class="step-item">
                <v-icon icon="mdi-heart" color="info" class="mr-3"></v-icon>
                <span>Gracias por tu honestidad y profesionalismo</span>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          :color="getButtonColor()"
          variant="elevated"
          size="large"
          prepend-icon="mdi-arrow-right"
          @click="handleContinue">
          {{ getButtonText() }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: boolean;
  decision: 'accept' | 'decline' | null;
  message: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'continue': [];
}>();

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Methods
function getSuccessIcon(): string {
  return props.decision === 'accept' ? 'mdi-check-circle' : 'mdi-information';
}

function getSuccessTitle(): string {
  if (props.decision === 'accept') {
    return '¡Servicio Confirmado!';
  } else {
    return 'Respuesta Enviada';
  }
}

function getTitleClass(): string {
  return props.decision === 'accept' ? 'text-success' : 'text-info';
}

function getAlertColor(): string {
  return props.decision === 'accept' ? 'success' : 'info';
}

function getAlertIcon(): string {
  return props.decision === 'accept' ? 'mdi-calendar-check' : 'mdi-information-outline';
}

function getAlertTitle(): string {
  if (props.decision === 'accept') {
    return 'Confirmación procesada exitosamente';
  } else {
    return 'Respuesta registrada correctamente';
  }
}

function getAlertMessage(): string {
  if (props.decision === 'accept') {
    return 'Tu confirmación ha sido enviada al cliente y se han actualizado todos los sistemas automáticamente.';
  } else {
    return 'Tu respuesta ha sido registrada y procesaremos la búsqueda de un proveedor alternativo.';
  }
}

function getButtonColor(): string {
  return props.decision === 'accept' ? 'success' : 'primary';
}

function getButtonText(): string {
  return 'Continuar';
}

function handleContinue() {
  emit('continue');
}
</script>

<style scoped>
.success-header {
  position: relative;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  padding: 32px;
  text-align: center;
  overflow: hidden;
}

.success-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

.success-icon-container {
  position: relative;
  z-index: 2;
  margin-bottom: 16px;
}

.success-animation {
  position: relative;
  z-index: 2;
}

.checkmark-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(var(--v-theme-success), 0.2);
  border: 3px solid rgb(var(--v-theme-success));
  margin: 0 auto;
  position: relative;
  animation: scaleIn 0.6s ease-out;
}

.checkmark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 35px;
  border: solid white;
  border-width: 0 4px 4px 0;
  transform: translate(-50%, -60%) rotate(45deg);
  animation: checkmarkDraw 0.4s ease-out 0.3s both;
}

.decline-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(var(--v-theme-info), 0.2);
  border: 3px solid rgb(var(--v-theme-info));
  margin: 0 auto;
  position: relative;
  animation: scaleIn 0.6s ease-out;
}

.decline-mark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 30px;
  background: white;
  border-radius: 3px;
  animation: fadeIn 0.4s ease-out 0.3s both;
}

.decline-mark::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
}

.success-details {
  text-align: left;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  font-size: 0.9rem;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes scaleIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes checkmarkDraw {
  from { transform: translate(-50%, -60%) rotate(45deg) scale(0); }
  to { transform: translate(-50%, -60%) rotate(45deg) scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

@media (max-width: 600px) {
  .success-header {
    padding: 24px;
  }

  .checkmark-circle,
  .decline-circle {
    width: 60px;
    height: 60px;
  }

  .checkmark {
    width: 15px;
    height: 25px;
    border-width: 0 3px 3px 0;
  }

  .decline-mark {
    width: 4px;
    height: 20px;
  }

  .decline-mark::after {
    width: 4px;
    height: 4px;
    bottom: -6px;
  }
}
</style>
