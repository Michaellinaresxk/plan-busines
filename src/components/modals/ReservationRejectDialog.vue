<template>
  <v-dialog v-model="dialogModel" max-width="500" transition="dialog-bottom-transition">
    <v-card rounded="lg">
      <v-toolbar color="error" class="text-white rounded-t-lg px-4">
        <v-icon icon="mdi-close-circle" class="mr-2"></v-icon>
        <v-toolbar-title>Rechazar Reserva</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-toolbar>

      <v-card-text class="px-4 pt-4">
        <v-alert variant="tonal" color="error" border="start" density="compact" class="mb-4">
          <div class="d-flex">
            <div>
              <p class="text-subtitle-2 font-weight-bold mb-1">Detalles de la reserva</p>
              <p class="text-body-2 mb-0">
                Cliente: <strong>{{ reservation?.clientName || 'Cliente' }}</strong>
              </p>
              <p class="text-body-2 mb-0">
                Servicio: <strong>{{ reservation?.service || 'Servicio' }}</strong>
              </p>
              <p class="text-body-2 mb-0">
                Fecha: <strong>{{ reservation?.date || 'Fecha' }}</strong>
              </p>
              <p class="text-body-2 mb-0">
                Hora: <strong>{{ reservation?.time || 'Hora' }}</strong>
              </p>
            </div>
          </div>
        </v-alert>

        <v-select v-model="rejectReason" label="Motivo del rechazo" :items="rejectReasons" variant="outlined"
          rounded="lg" class="mb-4" hide-details bg-color="surface"></v-select>

        <v-textarea v-model="message" label="Mensaje para el cliente"
          placeholder="Explica al cliente el motivo del rechazo" variant="outlined" rounded="lg" rows="3" auto-grow
          required hide-details bg-color="surface" class="mb-4"></v-textarea>

        <v-checkbox v-model="sendEmail" label="Enviar email de notificación al cliente" color="error"
          hide-details></v-checkbox>

        <v-checkbox v-model="offerAlternative" label="Ofrecer fecha alternativa" color="error"
          hide-details></v-checkbox>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-btn color="secondary" variant="text" @click="closeDialog" prepend-icon="mdi-close">
          Cancelar
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="confirm" prepend-icon="mdi-close-circle" :loading="processingAction"
          :disabled="!isValid">
          Confirmar rechazo
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Reservation } from '@/types/Reservation';

// Props
const props = defineProps<{
  modelValue: boolean;
  reservation: Reservation | null;
  processingAction: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
}>();

// Estado local
const rejectReasons = [
  'Horario no disponible',
  'Servicio no disponible en la fecha solicitada',
  'Personal no disponible',
  'Solicitud duplicada',
  'Otro motivo'
];

const rejectReason = ref(rejectReasons[0]);
const message = ref('');
const sendEmail = ref(true);
const offerAlternative = ref(false);

// Validación
const isValid = computed(() => message.value.trim().length > 0);

// Modelo v-model para diálogo
const dialogModel = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
});

// Métodos
const closeDialog = () => {
  dialogModel.value = false;
  resetForm();
};

const confirm = () => {
  if (isValid.value) {
    emit('confirm');
    resetForm();
  }
};

const resetForm = () => {
  rejectReason.value = rejectReasons[0];
  message.value = '';
  sendEmail.value = true;
  offerAlternative.value = false;
};
</script>
