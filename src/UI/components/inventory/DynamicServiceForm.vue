<template>
  <v-card elevation="2" rounded="lg">
    <v-card-title class="pa-6 pb-4">
      <div class="d-flex align-center">
        <v-avatar :color="serviceConfig?.color || '#6366F1'" size="40" class="mr-4">
          <v-icon :icon="serviceConfig?.icon || 'mdi-cog'" color="white" size="20"></v-icon>
        </v-avatar>
        <div>
          <h3 class="text-h5 font-weight-bold">Crear Servicio</h3>
          <p class="text-body-2 text-medium-emphasis">
            {{ serviceConfig?.name || 'Selecciona un tipo de servicio' }}
          </p>
        </div>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-6">
      <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
        <v-row>
          <!-- Información Básica -->
          <v-col cols="12">
            <h4 class="text-h6 mb-4 d-flex align-center">
              <v-icon icon="mdi-information" class="mr-2" color="primary"></v-icon>
              Información Básica
            </h4>
          </v-col>

          <!-- Nombre del Servicio -->
          <v-col cols="12" md="8">
            <v-text-field
              v-model="formData.title"
              label="Nombre del Servicio"
              variant="outlined"
              density="compact"
              :rules="[v => !!v || 'El nombre es requerido']"
              placeholder="ej: Yoga Matutino en la Playa"
              required>
            </v-text-field>
          </v-col>

          <!-- Tipo de Servicio -->
          <v-col cols="12" md="4">
            <v-select
              v-model="formData.serviceType"
              :items="serviceTypeOptions"
              label="Tipo de Servicio"
              variant="outlined"
              density="compact"
              item-title="title"
              item-value="value"
              :rules="[v => !!v || 'Selecciona un tipo']"
              @update:model-value="onServiceTypeChange"
              required>
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-avatar :color="item.raw.color" size="24" class="mr-3">
                      <v-icon :icon="item.raw.icon" color="white" size="12"></v-icon>
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>

          <!-- Campos Dinámicos Específicos del Servicio -->
          <template v-if="serviceConfig">
            <v-col cols="12">
              <h4 class="text-h6 mb-4 d-flex align-center">
                <v-icon :icon="serviceConfig.icon" class="mr-2" :color="serviceConfig.color"></v-icon>
                Vista Previa de Precios
              </h4>
              <p class="text-caption text-medium-emphasis mb-4">
                Este servicio tendrá variantes automáticas que tus clientes podrán elegir en la vista principal.
              </p>
            </v-col>
          </template>

          <!-- Vista Previa de Variantes -->
          <template v-if="serviceConfig">
            <v-col cols="12">
              <h4 class="text-h6 mb-4 d-flex align-center">
                <v-icon icon="mdi-eye" class="mr-2" color="info"></v-icon>
                Variantes Disponibles
              </h4>
            </v-col>

            <v-col cols="12">
              <v-card variant="outlined" :color="serviceConfig.color" class="variants-preview">
                <v-card-text class="pa-4">
                  <div class="variants-list">
                    <div
                      v-for="(option, index) in getVariantPreviews()"
                      :key="index"
                      class="variant-preview-item">
                      <div class="variant-info">
                        <v-icon :icon="serviceConfig.icon" :color="serviceConfig.color" size="16" class="mr-2"></v-icon>
                        <span class="variant-name">{{ option.name }}</span>
                      </div>
                      <div class="variant-price">
                        <v-chip :color="serviceConfig.color" size="small" variant="tonal">
                          ${{ option.price }}
                        </v-chip>
                      </div>
                    </div>
                  </div>

                  <v-divider class="my-3"></v-divider>

                  <div class="preview-note">
                    <v-icon icon="mdi-information" color="info" size="16" class="mr-2"></v-icon>
                    <span class="text-caption text-medium-emphasis">
                      Los clientes podrán elegir entre estas variantes en la vista principal
                    </span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </template>

          <!-- Descripción -->
          <v-col cols="12">
            <v-textarea
              v-model="formData.description"
              label="Descripción (Opcional)"
              variant="outlined"
              density="compact"
              rows="3"
              placeholder="Describe el servicio, incluye, duración, etc.">
            </v-textarea>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="pa-6">
      <v-spacer></v-spacer>
      <v-btn
        variant="text"
        @click="$emit('cancel')"
        :disabled="loading">
        Cancelar
      </v-btn>
      <v-btn
        color="primary"
        variant="elevated"
        @click="handleSubmit"
        :loading="loading"
        :disabled="!isFormValid || !serviceConfig">
        <v-icon icon="mdi-check" class="mr-2"></v-icon>
        Crear Servicio
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  BUSINESS_SERVICE_CONFIG,
  getAllServiceTypes,
  getServiceConfig,
  calculateServicePrice,
  type ServiceConfig
} from '@/config/simpleServiceConfig';

interface Emits {
  'service-created': [serviceData: any];
  'cancel': [];
}

const emit = defineEmits<Emits>();

// Form state
const formRef = ref();
const isFormValid = ref(false);
const loading = ref(false);

// Form data
const formData = ref<Record<string, any>>({
  title: '',
  serviceType: '',
  description: ''
});

// Service configuration
const serviceConfig = computed<ServiceConfig | null>(() => {
  if (!formData.value.serviceType) return null;
  return getServiceConfig(formData.value.serviceType);
});

// Service type options for select
const serviceTypeOptions = computed(() => {
  return getAllServiceTypes().map(serviceType => {
    const config = BUSINESS_SERVICE_CONFIG[serviceType];
    return {
      title: config.name,
      value: serviceType,
      icon: config.icon,
      color: config.color
    };
  });
});

// Methods
function getVariantPreviews(): Array<{name: string, price: number}> {
  if (!serviceConfig.value) return [];

  const previews: Array<{name: string, price: number}> = [];

  // Si hay campos select, mostrar las opciones
  let hasSelectFields = false;
  serviceConfig.value.fields.forEach(field => {
    if (field.type === 'select' && field.options && field.options.length > 0) {
      hasSelectFields = true;
      field.options.forEach(option => {
        try {
          const tempData = { [field.key]: option.value };
          const calculation = calculateServicePrice(formData.value.serviceType, tempData);
          previews.push({
            name: option.label,
            price: calculation.clientPays
          });
        } catch (error) {
          previews.push({
            name: option.label,
            price: option.extraPrice || serviceConfig.value!.basePrice
          });
        }
      });
    }
  });

  // Si no hay campos select, mostrar la opción base
  if (!hasSelectFields) {
    try {
      const calculation = calculateServicePrice(formData.value.serviceType, {});
      previews.push({
        name: serviceConfig.value.name,
        price: calculation.clientPays
      });
    } catch (error) {
      previews.push({
        name: serviceConfig.value.name,
        price: serviceConfig.value.basePrice
      });
    }
  }

  return previews;
}

function formatPrice(price: number): string {
  return Math.round(price).toString();
}

function onServiceTypeChange() {
  // Reset form data - solo mantener los campos básicos
  formData.value = {
    title: formData.value.title,
    serviceType: formData.value.serviceType,
    description: formData.value.description
  };
}

function recalculatePrice() {
  // No necesario para la creación genérica de servicios
  return;
}

async function handleSubmit() {
  if (!isFormValid.value || !serviceConfig.value) return;

  try {
    loading.value = true;

    console.log('🚀 Creating generic service:', {
      title: formData.value.title,
      type: formData.value.serviceType,
      config: serviceConfig.value.name
    });

    const serviceData = {
      title: formData.value.title,
      category: formData.value.serviceType, // Usar serviceType como category
      basePrice: serviceConfig.value.basePrice, // Precio base de referencia
      currency: 'USD',
      description: formData.value.description || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    emit('service-created', serviceData);

    // Reset form
    formData.value = {
      title: '',
      serviceType: '',
      description: ''
    };

  } catch (error) {
    console.error('Error creating service:', error);
  } finally {
    loading.value = false;
  }
}

// No necesitamos watchers para cálculos automáticos
// El usuario verá las variantes en la vista principal
</script>

<style scoped>
.variants-preview {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.variants-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.variant-preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.variant-info {
  display: flex;
  align-items: center;
}

.variant-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.variant-price {
  display: flex;
  align-items: center;
}

.preview-note {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: rgba(var(--v-theme-info), 0.1);
  border-radius: 4px;
}

@media (max-width: 768px) {
  .variant-preview-item {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  .variant-info {
    justify-content: center;
  }
}
</style>
