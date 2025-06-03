<template>
  <v-card rounded="xl" elevation="0" border class="supplier-response-card">
    <v-card-title class="pa-6 pb-4">
      <div class="d-flex align-center">
        <div class="response-icon-container">
          <v-icon icon="mdi-message-reply" color="white" size="24"></v-icon>
        </div>
        <div class="ml-4">
          <h2 class="text-h5 font-weight-bold mb-1">Tu Respuesta</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            ¿Puedes realizar este servicio?
          </p>
        </div>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-6">
      <!-- Decision Selection -->
      <div class="decision-section mb-6">
        <h3 class="section-title mb-4">Decisión</h3>

        <div class="decision-buttons">
          <v-btn
            :color="formData.decision === 'accept' ? 'success' : 'default'"
            :variant="formData.decision === 'accept' ? 'elevated' : 'outlined'"
            size="large"
            class="decision-btn"
            :class="{ 'selected': formData.decision === 'accept' }"
            @click="selectDecision('accept')"
            :disabled="loading">
            <v-icon icon="mdi-check-circle" size="24" class="mr-3"></v-icon>
            <div class="btn-content">
              <div class="btn-title">Sí, puedo realizarlo</div>
              <div class="btn-subtitle">Confirmar disponibilidad</div>
            </div>
          </v-btn>

          <v-btn
            :color="formData.decision === 'decline' ? 'error' : 'default'"
            :variant="formData.decision === 'decline' ? 'elevated' : 'outlined'"
            size="large"
            class="decision-btn"
            :class="{ 'selected': formData.decision === 'decline' }"
            @click="selectDecision('decline')"
            :disabled="loading">
            <v-icon icon="mdi-close-circle" size="24" class="mr-3"></v-icon>
            <div class="btn-content">
              <div class="btn-title">No puedo realizarlo</div>
              <div class="btn-subtitle">Rechazar servicio</div>
            </div>
          </v-btn>
        </div>
      </div>

      <!-- Message Section -->
      <div class="message-section mb-6" v-if="formData.decision">
        <h3 class="section-title mb-4">
          Mensaje
          <span class="required-indicator">*</span>
        </h3>

        <div class="message-actions mb-3">
          <v-btn
            color="secondary"
            variant="outlined"
            size="small"
            prepend-icon="mdi-auto-fix"
            @click="useTemplate"
            :disabled="loading">
            Usar plantilla
          </v-btn>
        </div>

        <v-textarea
          v-model="formData.message"
          :label="getMessageLabel()"
          :placeholder="getMessagePlaceholder()"
          variant="outlined"
          rows="4"
          counter="500"
          maxlength="500"
          :rules="messageRules"
          :disabled="loading"
          @update:model-value="updateMessage">
          <template v-slot:prepend-inner>
            <v-icon :icon="getMessageIcon()" :color="getMessageIconColor()"></v-icon>
          </template>
        </v-textarea>

        <div class="message-help">
          <v-icon icon="mdi-information" size="16" color="info" class="mr-1"></v-icon>
          <span class="text-caption text-medium-emphasis">
            {{ getMessageHelp() }}
          </span>
        </div>
      </div>

      <!-- Additional Details for Acceptance -->
      <div class="additional-details" v-if="formData.decision === 'accept'">
        <h3 class="section-title mb-4">Detalles Adicionales (Opcional)</h3>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.estimatedArrival"
              label="Hora estimada de llegada"
              placeholder="Ej: 2:30 PM"
              variant="outlined"
              prepend-inner-icon="mdi-clock-outline"
              :disabled="loading">
            </v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.additionalNotes"
              label="Notas adicionales"
              placeholder="Información extra para el cliente"
              variant="outlined"
              prepend-inner-icon="mdi-note-text-outline"
              :disabled="loading">
            </v-text-field>
          </v-col>
        </v-row>
      </div>

      <!-- Submit Button -->
      <div class="submit-section">
        <v-btn
          :color="formData.decision === 'accept' ? 'success' : 'error'"
          size="x-large"
          variant="elevated"
          block
          :loading="loading"
          :disabled="!isFormValid"
          @click="submitResponse">
          <v-icon :icon="getSubmitIcon()" size="24" class="mr-3"></v-icon>
          {{ getSubmitText() }}
        </v-btn>

        <div class="form-validation mt-3" v-if="!isFormValid && formData.decision">
          <v-alert color="warning" variant="tonal" density="compact">
            <v-icon icon="mdi-alert" class="mr-2"></v-icon>
            Por favor completa el mensaje para continuar
          </v-alert>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import type { ReservationView } from '@/views/ReservationView';
import type { SupplierView } from '@/views/SupplierView';

interface Props {
  reservation: ReservationView;
  supplier: SupplierView;
  loading?: boolean;
}

interface FormData {
  decision: 'accept' | 'decline' | null;
  message: string;
  estimatedArrival: string;
  additionalNotes: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<{
  'decision-selected': [decision: 'accept' | 'decline'];
  'message-updated': [message: string];
  'template-requested': [];
  'submit-response': [];
}>();

// Form data
const formData = reactive<FormData>({
  decision: null,
  message: '',
  estimatedArrival: '',
  additionalNotes: ''
});

// Validation rules
const messageRules = [
  (value: string) => !!value?.trim() || 'El mensaje es requerido',
  (value: string) => (value?.length >= 10) || 'El mensaje debe tener al menos 10 caracteres',
  (value: string) => (value?.length <= 500) || 'El mensaje no puede exceder 500 caracteres'
];

// Computed
const isFormValid = computed(() => {
  return formData.decision &&
         formData.message &&
         formData.message.trim().length >= 10;
});

// Methods
function selectDecision(decision: 'accept' | 'decline') {
  formData.decision = decision;
  formData.message = ''; // Reset message when decision changes
  emit('decision-selected', decision);
}

function updateMessage() {
  emit('message-updated', formData.message);
}

function useTemplate() {
  emit('template-requested');
}

function submitResponse() {
  if (isFormValid.value) {
    emit('submit-response');
  }
}

// Dynamic content based on decision
function getMessageLabel(): string {
  if (formData.decision === 'accept') {
    return 'Mensaje de confirmación';
  } else if (formData.decision === 'decline') {
    return 'Mensaje de disculpa';
  }
  return 'Tu mensaje';
}

function getMessagePlaceholder(): string {
  if (formData.decision === 'accept') {
    return 'Confirmo que puedo realizar el servicio...';
  } else if (formData.decision === 'decline') {
    return 'Lamentablemente no puedo realizar este servicio...';
  }
  return 'Escribe tu mensaje aquí';
}

function getMessageIcon(): string {
  if (formData.decision === 'accept') {
    return 'mdi-check-circle';
  } else if (formData.decision === 'decline') {
    return 'mdi-close-circle';
  }
  return 'mdi-message-text';
}

function getMessageIconColor(): string {
  if (formData.decision === 'accept') {
    return 'success';
  } else if (formData.decision === 'decline') {
    return 'error';
  }
  return 'primary';
}

function getMessageHelp(): string {
  if (formData.decision === 'accept') {
    return 'Este mensaje se enviará al cliente confirmando tu disponibilidad';
  } else if (formData.decision === 'decline') {
    return 'Este mensaje se enviará al cliente explicando por qué no puedes realizar el servicio';
  }
  return 'Tu mensaje será enviado al cliente';
}

function getSubmitIcon(): string {
  if (formData.decision === 'accept') {
    return 'mdi-check-bold';
  } else if (formData.decision === 'decline') {
    return 'mdi-close-thick';
  }
  return 'mdi-send';
}

function getSubmitText(): string {
  if (formData.decision === 'accept') {
    return 'Confirmar Disponibilidad';
  } else if (formData.decision === 'decline') {
    return 'Rechazar Servicio';
  }
  return 'Enviar Respuesta';
}

// Expose form data for parent access
defineExpose({
  formData
});
</script>

<style scoped>
.supplier-response-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), 1), rgba(var(--v-theme-surface-variant), 0.2));
}

.response-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgb(var(--v-theme-secondary)), rgb(var(--v-theme-primary)));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(var(--v-theme-secondary), 0.3);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.87);
  display: flex;
  align-items: center;
}

.required-indicator {
  color: rgb(var(--v-theme-error));
  margin-left: 4px;
}

.decision-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.decision-btn {
  height: auto !important;
  padding: 20px !important;
  text-transform: none !important;
  border-radius: 16px !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.decision-btn.selected {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(var(--v-theme-primary), 0.2);
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.btn-title {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.2;
}

.btn-subtitle {
  font-size: 0.85rem;
  opacity: 0.8;
  font-weight: 400;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
}

.message-help {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.additional-details {
  background: rgba(var(--v-theme-success), 0.05);
  border: 1px solid rgba(var(--v-theme-success), 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.submit-section {
  margin-top: 24px;
}

.form-validation {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .decision-btn {
    padding: 16px !important;
  }

  .btn-title {
    font-size: 1rem;
  }

  .btn-subtitle {
    font-size: 0.8rem;
  }
}
</style>
