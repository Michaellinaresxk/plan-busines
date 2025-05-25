<!-- src/UI/components/suppliers/EditSupplierForm.vue -->
<template>
  <v-dialog v-model="dialogModel" max-width="600" persistent>
    <v-card rounded="xl" elevation="0" border>
      <!-- Header -->
      <v-card-title class="pa-6 d-flex align-center">
        <v-icon icon="mdi-pencil" color="primary" size="28" class="mr-3"></v-icon>
        <div>
          <h2 class="text-h5 font-weight-bold">Editar Proveedor</h2>
          <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
            Actualiza la información de {{ originalSupplier?.name }}
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
                :disabled="loading" @input="markAsChanged('name')"></v-text-field>
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
                :disabled="loading" @input="markAsChanged('email')"></v-text-field>
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
                :rules="[rules.required]" :disabled="loading" @update:model-value="markAsChanged('service')"></v-select>
            </v-col>

            <!-- Switch para Activo -->
            <v-col cols="12">
              <v-switch v-model="formData.canProvideService" label="Proveedor activo (puede ofrecer servicios)"
                color="primary" :disabled="loading" hide-details
                @update:model-value="markAsChanged('canProvideService')"></v-switch>
            </v-col>
          </v-row>

          <!-- ✅ Mostrar campos que han cambiado -->
          <v-alert v-if="hasChanges" color="info" variant="tonal" class="mt-4" prepend-icon="mdi-information">
            <div class="text-body-2">
              <strong>Campos modificados:</strong> {{ changedFieldsText }}
            </div>
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Actions -->
      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn variant="text" :disabled="loading" @click="handleClose">
          Cancelar
        </v-btn>
        <v-btn color="primary" variant="elevated" :loading="loading" :disabled="!isFormValid || !hasChanges"
          @click="handleSubmit">
          <v-icon icon="mdi-content-save" class="mr-2"></v-icon>
          Actualizar Proveedor
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
  supplier?: SupplierData | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'supplier-updated': [id: string, data: UpdateSupplierData];
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

interface UpdateSupplierData {
  name?: string;
  cedula?: string;
  email?: string;
  phone?: string;
  service?: string;
  canProvideService?: boolean;
}

// Reactive Data
const formRef = ref();
const loading = ref(false);
const isFormValid = ref(false);
const originalSupplier = ref<SupplierData | null>(null);
const changedFields = ref<Set<string>>(new Set());

const formData = ref<SupplierData>({
  id: '',
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

const hasChanges = computed(() => changedFields.value.size > 0);

const changedFieldsText = computed(() => {
  const fieldLabels: Record<string, string> = {
    name: 'Nombre',
    cedula: 'Cédula',
    email: 'Email',
    phone: 'Teléfono',
    service: 'Servicio',
    canProvideService: 'Estado'
  };

  return Array.from(changedFields.value)
    .map(field => fieldLabels[field] || field)
    .join(', ');
});

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
function markAsChanged(field: keyof SupplierData) {
  if (!originalSupplier.value) return;

  const originalValue = originalSupplier.value[field];
  const currentValue = formData.value[field];

  if (originalValue !== currentValue) {
    changedFields.value.add(field);
  } else {
    changedFields.value.delete(field);
  }
}

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
  markAsChanged('cedula');
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
  markAsChanged('phone');
}

function loadSupplierData() {
  if (props.supplier) {
    console.log('📝 Loading supplier data for editing:', props.supplier);

    originalSupplier.value = { ...props.supplier };
    formData.value = { ...props.supplier };
    changedFields.value.clear();

    if (formRef.value) {
      formRef.value.resetValidation();
    }
  }
}

function resetForm() {
  formData.value = {
    id: '',
    name: '',
    cedula: '',
    email: '',
    phone: '',
    service: '',
    canProvideService: true
  };

  originalSupplier.value = null;
  changedFields.value.clear();

  if (formRef.value) {
    formRef.value.resetValidation();
  }

  isFormValid.value = false;
}

function handleClose() {
  if (!loading.value) {
    dialogModel.value = false;
  }
}

async function handleSubmit() {
  if (!isFormValid.value || !hasChanges.value || !originalSupplier.value) return;

  loading.value = true;

  try {
    console.log('📝 Form submitted with changes:', Array.from(changedFields.value));

    // Crear objeto solo con los campos que cambiaron
    const updateData: UpdateSupplierData = {};

    changedFields.value.forEach(field => {
      if (field in formData.value) {
        updateData[field as keyof UpdateSupplierData] = formData.value[field as keyof SupplierData];
      }
    });

    console.log('🔄 Sending update data:', updateData);

    // Emit the data to parent component
    emit('supplier-updated', formData.value.id, updateData);

  } catch (error) {
    console.error('❌ Error in form submission:', error);
  } finally {
    loading.value = false;
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue && props.supplier) {
    loadSupplierData();
  } else if (!newValue) {
    resetForm();
  }
});

watch(() => props.supplier, (newSupplier) => {
  if (newSupplier && props.modelValue) {
    loadSupplierData();
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

.v-alert {
  border-radius: 12px;
}
</style>
