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
        </v-textarea>
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
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';

// Tipos simplificados
interface ReservationView {
  id: string;
  [key: string]: any;
}

interface SupplierView {
  id: string;
  [key: string]: any;
}

interface Props {
  reservation?: ReservationView;
  supplier?: SupplierView;
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
];

// Computed
const isFormValid = computed(() => {
  return formData.decision && formData.message && formData.message.trim().length >= 10;
});

// Methods
function selectDecision(decision: 'accept' | 'decline') {
  formData.decision = decision;
  formData.message = '';
  emit('decision-selected', decision);
}

function updateMessage() {
  emit('message-updated', formData.message);
}

function submitResponse() {
  if (isFormValid.value) {
    emit('submit-response');
  }
}

function getMessageLabel(): string {
  return formData.decision === 'accept' ? 'Mensaje de confirmación' : 'Mensaje de disculpa';
}

function getMessagePlaceholder(): string {
  return formData.decision === 'accept'
    ? 'Confirmo que puedo realizar el servicio...'
    : 'Lamentablemente no puedo realizar este servicio...';
}

function getSubmitIcon(): string {
  return formData.decision === 'accept' ? 'mdi-check-bold' : 'mdi-close-thick';
}

function getSubmitText(): string {
  return formData.decision === 'accept' ? 'Confirmar Disponibilidad' : 'Rechazar Servicio';
}

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

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.required-indicator {
  color: rgb(var(--v-theme-error));
  margin-left: 4px;
}
</style>
