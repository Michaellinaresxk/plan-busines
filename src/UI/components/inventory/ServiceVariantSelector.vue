<template>
  <div class="service-variant-selector">
    <!-- Si no hay configuración -->
    <div v-if="!serviceConfig" class="no-variants">
      <v-chip size="small" color="grey" variant="tonal">
        Sin configuración
      </v-chip>
    </div>

    <!-- Si hay configuración - SIEMPRE mostrar selector -->
    <div v-else class="variants-selector">
      <!-- Select para elegir variante -->
      <v-select
        v-model="selectedVariantKey"
        :items="variantOptions"
        label="Seleccionar Variante"
        variant="outlined"
        density="compact"
        hide-details
        class="variant-select">
        <template #selection="{ item }">
          <div class="d-flex align-center">
            <v-icon
              :icon="serviceConfig?.icon || 'mdi-tune-variant'"
              :color="serviceConfig?.color || 'primary'"
              size="16"
              class="mr-2">
            </v-icon>
            <span class="text-caption">{{ item.title }}</span>
          </div>
        </template>
        <template #item="{ props, item }">
          <v-list-item v-bind="props">
            <template #prepend>
              <v-icon
                :icon="serviceConfig?.icon || 'mdi-tune-variant'"
                :color="serviceConfig?.color || 'primary'"
                size="16">
              </v-icon>
            </template>
            <template #append>
              <v-chip size="small" :color="serviceConfig?.color || 'primary'" variant="tonal">
                ${{ formatPrice(item.raw.calculatedPrice) }}
              </v-chip>
            </template>
          </v-list-item>
        </template>
      </v-select>

      <!-- Detalles de la variante seleccionada - SIMPLIFICADO -->
      <div v-if="selectedVariantData" class="variant-details mt-2">
        <div class="variant-summary">
          <div class="variant-name-display">
            <v-icon
              :icon="serviceConfig?.icon || 'mdi-tune-variant'"
              :color="serviceConfig?.color || 'primary'"
              size="14"
              class="mr-1">
            </v-icon>
            <span class="text-caption font-weight-medium">{{ selectedVariantData.label }}</span>
          </div>

          <div class="variant-price-display">
            <v-chip
              :color="serviceConfig?.color || 'primary'"
              size="small"
              variant="tonal">
              ${{ formatPrice(selectedVariantData.calculatedPrice) }}
            </v-chip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { getServiceConfig, calculateServicePrice, type PriceCalculation } from '@/config/simpleServiceConfig';
import type { ServiceView } from '@/views/ServiceView';

interface Props {
  service: ServiceView;
}

interface Emits {
  'variant-changed': [serviceId: string, variantData: any];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Estado del selector
const selectedVariantKey = ref<string>('');

// Configuración del servicio desde BUSINESS_SERVICE_CONFIG
const serviceConfig = computed(() => {
  return getServiceConfig(props.service.category);
});

// Generar opciones de variantes dinámicamente desde la configuración
const variantOptions = computed(() => {
  if (!serviceConfig.value) {
    return [];
  }

  const options: Array<{
    title: string;
    value: string;
    calculatedPrice: number;
    fieldKey: string;
    optionValue: any;
    label: string;
  }> = [];

  // Buscar campos tipo 'select' que contengan opciones con precios
  let hasSelectFields = false;

  serviceConfig.value.fields.forEach(field => {
    if (field.type === 'select' && field.options && field.options.length > 0) {
      hasSelectFields = true;
      field.options.forEach(option => {
        // Crear datos temporales para el cálculo
        const tempServiceData = {
          ...props.service,
          [field.key]: option.value
        };

        // Calcular precio para esta opción
        let calculatedPrice = 0;
        try {
          const calculation = calculateServicePrice(props.service.category, tempServiceData);
          calculatedPrice = calculation.clientPays;
        } catch (error) {
          console.error('Error calculating price for option:', error);
          calculatedPrice = option.extraPrice || serviceConfig.value!.basePrice;
        }

        const variantKey = `${field.key}_${option.value}`;

        options.push({
          title: option.label,
          value: variantKey,
          calculatedPrice,
          fieldKey: field.key,
          optionValue: option.value,
          label: option.label
        });
      });
    }
  });

  // Si no hay campos select, crear opción base del servicio
  if (!hasSelectFields) {
    try {
      const calculation = calculateServicePrice(props.service.category, props.service);
      options.push({
        title: serviceConfig.value.name,
        value: 'base',
        calculatedPrice: calculation.clientPays,
        fieldKey: 'base',
        optionValue: 'base',
        label: serviceConfig.value.name
      });
    } catch (error) {
      console.error('Error calculating base price:', error);
      options.push({
        title: serviceConfig.value.name,
        value: 'base',
        calculatedPrice: serviceConfig.value.basePrice,
        fieldKey: 'base',
        optionValue: 'base',
        label: serviceConfig.value.name
      });
    }
  }

  return options;
});

// Datos de la variante seleccionada
const selectedVariantData = computed(() => {
  if (!selectedVariantKey.value) return null;
  return variantOptions.value.find(option => option.value === selectedVariantKey.value);
});

// Cálculo de precios para la variante seleccionada
const variantCalculation = computed<PriceCalculation | null>(() => {
  if (!selectedVariantData.value || !serviceConfig.value) {
    return null;
  }

  try {
    // Crear datos del servicio con la opción seleccionada
    let serviceData = { ...props.service };

    // Solo agregar el campo si no es el caso base
    if (selectedVariantData.value.fieldKey !== 'base') {
      serviceData[selectedVariantData.value.fieldKey] = selectedVariantData.value.optionValue;
    }

    return calculateServicePrice(props.service.category, serviceData);
  } catch (error) {
    console.error('Error calculating variant price:', error);

    // Fallback básico
    const basePrice = serviceConfig.value.basePrice;
    const taxes = basePrice * serviceConfig.value.baseTaxes;
    const profit = basePrice * serviceConfig.value.baseProfit;

    return {
      basePrice: basePrice,
      extraPrice: 0,
      subtotal: basePrice,
      taxes: Math.round(taxes),
      profit: Math.round(profit),
      finalPrice: Math.round(basePrice + taxes + profit),
      clientPays: Math.round(basePrice + taxes + profit)
    };
  }
});

// 🚀 NUEVA FUNCIÓN: Emitir cambios de variante
function emitVariantChange() {
  if (!selectedVariantData.value || !variantCalculation.value) {
    return;
  }

  const variantData = {
    fieldKey: selectedVariantData.value.fieldKey,
    optionValue: selectedVariantData.value.optionValue,
    label: selectedVariantData.value.label,
    calculatedPrice: selectedVariantData.value.calculatedPrice,
    calculation: variantCalculation.value
  };

  console.log('🔄 ServiceVariantSelector emitting variant-changed:', {
    serviceId: props.service.id,
    variantData
  });

  emit('variant-changed', props.service.id, variantData);
}

// Formatear precios
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// 🚀 WATCHERS ACTUALIZADOS - Emitir cuando cambie la variante
watch(selectedVariantKey, () => {
  if (selectedVariantKey.value) {
    emitVariantChange();
  }
});

watch(variantCalculation, () => {
  if (variantCalculation.value) {
    emitVariantChange();
  }
});

// Inicializar con la primera opción
watch(variantOptions, (newOptions) => {
  if (newOptions.length > 0 && !selectedVariantKey.value) {
    selectedVariantKey.value = newOptions[0].value;
  }
}, { immediate: true });

// Resetear cuando cambie el servicio
watch(() => props.service.category, () => {
  selectedVariantKey.value = '';
});

// 🚀 MOUNTED - Emitir variante inicial
onMounted(() => {
  if (selectedVariantKey.value) {
    emitVariantChange();
  }
});
</script>

<style scoped>
.service-variant-selector {
  width: 100%;
}

.variant-select {
  max-width: 100%;
}

.variant-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.variant-name-display {
  display: flex;
  align-items: center;
}

.variant-price-display {
  display: flex;
  align-items: center;
}

.no-variants {
  text-align: center;
  padding: 16px;
}

@media (max-width: 768px) {
  .price-item {
    margin-bottom: 8px;
  }

  .variant-features {
    justify-content: center;
  }
}
</style>
