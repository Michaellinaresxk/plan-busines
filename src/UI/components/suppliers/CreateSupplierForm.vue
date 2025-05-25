<!-- src/UI/components/suppliers/CreateSupplierForm.vue -->
<template>
  <v-dialog v-model="dialogModel" max-width="600" persistent>
    <v-card rounded="xl" elevation="0" border>
      <!-- Header -->
      <v-card-title class="pa-6 d-flex align-center">
        <v-icon icon="mdi-account-plus" color="primary" size="28" class="mr-3"></v-icon>
        <div>
          <h2 class="text-h5 font-weight-bold">Agregar Nuevo Proveedor</h2>
          <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
            Completa la información del proveedor
          </p>
        </div>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" size="small" :disabled="loading" @click="handleClose"></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Form Content -->
      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
          <v-row>
            <!-- Nombre -->
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.name" label="Nombre Completo" placeholder="Ej: Juan Pérez"
                prepend-inner-icon="mdi-account" variant="outlined" :rules="[rules.required, rules.minLength(2)]"
                :disabled="loading" @input="clearFieldError('name')"></v-text-field>
            </v-col>

            <!-- Cédula -->
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.cedula" label="Cédula" placeholder="000-0000000-0"
                prepend-inner-icon="mdi-card-account-details" variant="outlined" :rules="[rules.required, rules.cedula]"
                :disabled="loading" @input="formatCedula"></v-text-field>
            </v-col>

            <!-- Email -->
            <v-col cols="12">
              <v-text-field v-model="formData.email" label="Correo Electrónico" placeholder="ejemplo@correo.com"
                prepend-inner-icon="mdi-email" type="email" variant="outlined" :rules="[rules.required, rules.email]"
                :disabled="loading" @input="clearFieldError('email')"></v-text-field>
            </v-col>

            <!-- Teléfono -->
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.phone" label="Teléfono" placeholder="(000) 000-0000"
                prepend-inner-icon="mdi-phone" variant="outlined" :rules="[rules.required, rules.phone]"
                :disabled="loading" @input="formatPhone"></v-text-field>
            </v-col>

            <!-- Servicio -->
            <v-col cols="12" md="6">
              <v-select v-model="formData.service" :items="serviceOptions" label="Servicio que Ofrece"
                placeholder="Selecciona un servicio" prepend-inner-icon="mdi-tools" variant="outlined"
                :rules="[rules.required]" :disabled="loading"
                @update:model-value="clearFieldError('service')"></v-select>
            </v-col>

            <!-- Switch para Activo -->
            <v-col cols="12">
              <v-switch v-model="formData.canProvideService" label="Proveedor activo (puede ofrecer servicios)"
                color="primary" :disabled="loading" hide-details></v-switch>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Actions -->
      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn variant="text" :disabled="loading" @click="handleClose">
          Cancelar
        </v-btn>
        <v-btn color="primary" variant="elevated" :loading="loading" :disabled="!isFormValid" @click="handleSubmit">
          <v-icon icon="mdi-plus" class="mr-2"></v-icon>
          Crear Proveedor
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { SUPPLIER_SERVICE_OPTIONS } from '@/types/supplier';

// Props & Emits
interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'supplier-created': [data: CreateSupplierData];
}>();

// Interfaces
interface CreateSupplierData {
  name: string;
  cedula: string;
  email: string;
  phone: string;
  service: string;
  canProvideService: boolean;
}

// Reactive Data
const formRef = ref();
const loading = ref(false);
const isFormValid = ref(false);

const formData = ref<CreateSupplierData>({
  name: '',
  cedula: '',
  email: '',
  phone: '',
  service: '',
  canProvideService: true
});

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const serviceOptions = computed(() =>
  SUPPLIER_SERVICE_OPTIONS.map(option => ({
    title: option.title,
    value: option.value
  }))
);

// Validation Rules
const rules = {
  required: (value: string) => !!value?.trim() || 'Este campo es requerido',

  minLength: (length: number) => (value: string) =>
    value?.length >= length || `Mínimo ${length} caracteres`,

  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || 'Email inválido';
  },

  cedula: (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 11 || 'Cédula debe tener 11 dígitos';
  },

  phone: (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 10 || 'Teléfono debe tener 10 dígitos';
  }
};

// Methods
function formatCedula() {
  const cleaned = formData.value.cedula.replace(/\D/g, '');
  if (cleaned.length <= 11) {
    if (cleaned.length >= 3 && cleaned.length < 10) {
      formData.value.cedula = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else if (cleaned.length >= 10) {
      formData.value.cedula = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 10)}-${cleaned.slice(10)}`;
    } else {
      formData.value.cedula = cleaned;
    }
  }
}

function formatPhone() {
  const cleaned = formData.value.phone.replace(/\D/g, '');
  if (cleaned.length <= 10) {
    if (cleaned.length >= 3 && cleaned.length < 6) {
      formData.value.phone = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else if (cleaned.length >= 6) {
      formData.value.phone = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else {
      formData.value.phone = cleaned;
    }
  }
}

function clearFieldError(field: string) {
  // Clear specific field validation if needed
  console.log(`Clearing error for field: ${field}`);
}

function resetForm() {
  formData.value = {
    name: '',
    cedula: '',
    email: '',
    phone: '',
    service: '',
    canProvideService: true
  };

  if (formRef.value) {
    formRef.value.resetValidation();
  }

  isFormValid.value = false;
}

function handleClose() {
  if (!loading.value) {
    resetForm();
    dialogModel.value = false;
  }
}

async function handleSubmit() {
  if (!isFormValid.value) return;

  loading.value = true;

  try {
    console.log('📝 Form submitted with data:', formData.value);

    // Emit the data to parent component
    emit('supplier-created', { ...formData.value });

  } catch (error) {
    console.error('❌ Error in form submission:', error);
  } finally {
    loading.value = false;
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    resetForm();
  }
});
</script>

<style scoped>
:deep(.v-field--focused) {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

:deep(.v-selection-control) {
  margin-top: 8px;
}
</style>
