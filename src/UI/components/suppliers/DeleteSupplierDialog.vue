<!-- src/UI/components/suppliers/DeleteSupplierDialog.vue -->
<template>
  <v-dialog v-model="dialogModel" max-width="500" persistent>
    <v-card rounded="xl" elevation="0" border>
      <!-- Header -->
      <v-card-title class="pa-6 d-flex align-center">
        <v-avatar color="error" size="48" class="mr-4">
          <v-icon icon="mdi-delete-alert" size="28" color="white"></v-icon>
        </v-avatar>
        <div>
          <h2 class="text-h5 font-weight-bold text-error">Eliminar Proveedor</h2>
          <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
            Esta acción no se puede deshacer
          </p>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Content -->
      <v-card-text class="pa-6">
        <div v-if="supplier" class="text-center">
          <!-- Supplier Info Card -->
          <v-card color="grey-lighten-5" rounded="lg" elevation="0" class="mb-4 pa-4">
            <div class="d-flex align-center">
              <v-avatar color="primary" size="56" class="mr-4">
                <span class="text-h6 font-weight-bold">
                  {{ getInitials(supplier.name) }}
                </span>
              </v-avatar>

              <div class="text-left flex-grow-1">
                <h3 class="text-h6 font-weight-bold mb-1">{{ supplier.name }}</h3>
                <p class="text-body-2 text-medium-emphasis mb-1">
                  <v-icon icon="mdi-tools" size="14" class="mr-1"></v-icon>
                  {{ supplier.service }}
                </p>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  <v-icon icon="mdi-email" size="14" class="mr-1"></v-icon>
                  {{ supplier.email }}
                </p>
              </div>
            </div>
          </v-card>

          <!-- Warning Message -->
          <v-alert color="error" variant="tonal" rounded="lg" prepend-icon="mdi-alert-circle" class="text-left">
            <div class="text-body-1">
              <strong>¿Estás seguro de que deseas eliminar este proveedor?</strong>
            </div>
            <div class="text-body-2 mt-2">
              • Se eliminará permanentemente de la base de datos<br>
              • No podrás recuperar esta información<br>
              • Todas las referencias a este proveedor se perderán
            </div>
          </v-alert>

          <!-- Confirmation Input -->
          <div class="mt-6">
            <p class="text-body-2 text-medium-emphasis mb-3">
              Para confirmar, escribe el nombre del proveedor:
            </p>
            <v-text-field v-model="confirmationText" :label="`Escribe: ${supplier.name}`" variant="outlined"
              density="compact" :disabled="loading" :error="hasConfirmationError" :error-messages="confirmationError"
              @input="validateConfirmation"></v-text-field>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Actions -->
      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn variant="text" :disabled="loading" @click="handleCancel">
          Cancelar
        </v-btn>
        <v-btn color="error" variant="elevated" :loading="loading" :disabled="!isConfirmed" @click="handleDelete">
          <v-icon icon="mdi-delete" class="mr-2"></v-icon>
          Eliminar Definitivamente
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// Props & Emits
interface Props {
  modelValue: boolean;
  supplier?: SupplierData | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'supplier-deleted': [id: string];
}>();

// Interfaces
interface SupplierData {
  id: string;
  name: string;
  cedula: string;
  email: string;
  phone: string;
  service: string;
  canProvideService: boolean;
}

// Reactive Data
const loading = ref(false);
const confirmationText = ref('');
const confirmationError = ref('');

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const isConfirmed = computed(() =>
  confirmationText.value.trim().toLowerCase() === props.supplier?.name.trim().toLowerCase()
);

const hasConfirmationError = computed(() =>
  confirmationError.value.length > 0
);

// Methods
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function validateConfirmation() {
  if (!props.supplier) return;

  const input = confirmationText.value.trim().toLowerCase();
  const required = props.supplier.name.trim().toLowerCase();

  if (input.length > 0 && input !== required) {
    confirmationError.value = 'El nombre no coincide';
  } else {
    confirmationError.value = '';
  }
}

function resetDialog() {
  confirmationText.value = '';
  confirmationError.value = '';
  loading.value = false;
}

function handleCancel() {
  if (!loading.value) {
    resetDialog();
    dialogModel.value = false;
  }
}

async function handleDelete() {
  if (!props.supplier || !isConfirmed.value) return;

  loading.value = true;

  try {
    console.log('🗑️ Deleting supplier:', props.supplier);

    emit('supplier-deleted', props.supplier.id);

  } catch (error) {
    console.error('❌ Error in delete dialog:', error);
  } finally {
    loading.value = false;
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    resetDialog();
  }
});

watch(() => props.supplier, () => {
  resetDialog();
});
</script>

<style scoped>
:deep(.v-field--focused) {
  box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
}

.v-alert {
  border-radius: 12px;
}

.v-card {
  border-radius: 16px;
}
</style>
