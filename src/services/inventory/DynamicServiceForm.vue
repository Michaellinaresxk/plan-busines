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
                Configuración Específica
              </h4>
            </v-col>

            <!-- Renderizar campos dinámicos -->
            <v-col
              v-for="field in serviceConfig.fields"
              :key="field.key"
              cols="12" md="6">

              <!-- Campo Select -->
              <v-select
                v-if="field.type === 'select'"
                v-model="formData[field.key]"
                :items="field.options"
                :label="field.label"
                :rules="field.required ? [v => !!v || `${field.label} es requerido`] : []"
                variant="outlined"
                density="compact"
                @update:model-value="recalculatePrice">
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #append v-if="item.raw.extraPrice">
                      <v-chip size="small" color="info" variant="tonal">
                        {{ item.raw.extraPrice > 0 ? '+' : '' }}${{ item.raw.extraPrice }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-select>

              <!-- Campo Number -->
              <v-text-field
                v-else-if="field.type === 'number'"
                v-model.number="formData[field.key]"
                :label="field.label"
                :prefix="field.prefix"
                :suffix="field.suffix"
                :rules="field.required ? [v => !!v || `${field.label} es requerido`] : []"
                type="number"
                variant="outlined"
                density="compact"
                @update:model-value="recalculatePrice">
              </v-text-field>

              <!-- Campo Switch -->
              <v-switch
                v-else-if="field.type === 'switch'"
                v-model="formData[field.key]"
                :label="field.label"
                color="primary"
                @update:model-value="recalculatePrice">
              </v-switch>

              <!-- Campo Text -->
              <v-text-field
                v-else-if="field.type === 'text'"
                v-model="formData[field.key]"
                :label="field.label"
                :rules="field.required ? [v => !!v || `${field.label} es requerido`] : []"
                variant="outlined"
                density="compact">
              </v-text-field>
            </v-col>

            <!-- Campos Especiales para Excursiones -->
            <template v-if="formData.serviceType === 'excursion'">
              <v-col cols="12" md="6">
                <v-switch
                  v-model="formData.hasMinors"
                  label="¿Hay menores de 10 años?"
                  color="primary"
                  @update:model-value="recalculatePrice">
                </v-switch>
              </v-col>
              <v-col v-if="formData.hasMinors" cols="12" md="6">
                <v-text-field
                  v-model.number="formData.minorsCount"
                  label="Cantidad de Menores"
                  type="number"
                  min="1"
                  variant="outlined"
                  density="compact"
                  @update:model-value="recalculatePrice">
                </v-text-field>
              </v-col>
            </template>
          </template>

          <!-- Precio y Cálculos -->
          <template v-if="serviceConfig && priceCalculation">
            <v-col cols="12">
              <h4 class="text-h6 mb-4 d-flex align-center">
                <v-icon icon="mdi-calculator" class="mr-2" color="success"></v-icon>
                Cálculo de Precios
              </h4>
            </v-col>

            <v-col cols="12">
              <v-card variant="outlined" :color="serviceConfig.color" class="price-breakdown">
                <v-card-text class="pa-4">
                  <v-row>
                    <v-col cols="6" md="3">
                      <div class="price-item">
                        <span class="price-label">Precio Base:</span>
                        <span class="price-value">${{ priceCalculation.basePrice }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="price-item">
                        <span class="price-label">Extras:</span>
                        <span class="price-value text-info">+${{ priceCalculation.extraPrice }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="price-item">
                        <span class="price-label">Taxes ({{ Math.round(serviceConfig.baseTaxes * 100) }}%):</span>
                        <span class="price-value text-warning">${{ priceCalculation.taxes }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="price-item">
                        <span class="price-label">Ganancia ({{ Math.round(serviceConfig.baseProfit * 100) }}%):</span>
                        <span class="price-value text-success">${{ priceCalculation.profit }}</span>
                      </div>
                    </v-col>
                  </v-row>

                  <v-divider class="my-3"></v-divider>

                  <div class="d-flex justify-space-between align-center">
                    <span class="text-h6 font-weight-bold">Precio Final:</span>
                    <span class="text-h5 font-weight-bold" :style="{ color: serviceConfig.color }">
                      ${{ priceCalculation.clientPays }}
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
import { ref, computed, watch } from 'vue';
import {
  BUSINESS_SERVICE_CONFIG,
  getAllServiceTypes,
  getServiceConfig,
  calculateServicePrice,
  validateServiceData,
  type ServiceConfig,
  type PriceCalculation
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

// Price calculation
const priceCalculation = ref<PriceCalculation | null>(null);

// Methods
function onServiceTypeChange() {
  // Reset form data specific to service
  const newFormData: Record<string, any> = {
    title: formData.value.title,
    serviceType: formData.value.serviceType,
    description: formData.value.description
  };

  // Initialize fields with defaults
  if (serviceConfig.value) {
    serviceConfig.value.fields.forEach(field => {
      if (field.type === 'select' && field.options?.[0]) {
        newFormData[field.key] = field.options[0].value;
      } else if (field.type === 'number') {
        newFormData[field.key] = 1;
      } else if (field.type === 'switch') {
        newFormData[field.key] = false;
      } else {
        newFormData[field.key] = '';
      }
    });
  }

  formData.value = newFormData;
  recalculatePrice();
}

function recalculatePrice() {
  if (!serviceConfig.value) {
    priceCalculation.value = null;
    return;
  }

  try {
    priceCalculation.value = calculateServicePrice(
      formData.value.serviceType,
      formData.value
    );
  } catch (error) {
    console.error('Error calculating price:', error);
    priceCalculation.value = null;
  }
}

async function handleSubmit() {
  if (!isFormValid.value || !serviceConfig.value || !priceCalculation.value) return;

  try {
    loading.value = true;

    // Validate service-specific data
    const validation = validateServiceData(formData.value.serviceType, formData.value);
    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      return;
    }

    const serviceData = {
      ...formData.value,
      category: serviceConfig.value.category,
      basePrice: priceCalculation.value.basePrice,
      finalPrice: priceCalculation.value.clientPays,
      taxes: priceCalculation.value.taxes,
      profit: priceCalculation.value.profit,
      priceBreakdown: priceCalculation.value,
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
    priceCalculation.value = null;

  } catch (error) {
    console.error('Error creating service:', error);
  } finally {
    loading.value = false;
  }
}

// Watch for form changes to recalculate
watch(() => formData.value, () => {
  if (serviceConfig.value) {
    recalculatePrice();
  }
}, { deep: true });
</script>

<style scoped>
.price-breakdown {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.price-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px;
}

.price-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
  margin-bottom: 4px;
}

.price-value {
  font-size: 1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

@media (max-width: 768px) {
  .price-item {
    margin-bottom: 16px;
  }
}
</style>
