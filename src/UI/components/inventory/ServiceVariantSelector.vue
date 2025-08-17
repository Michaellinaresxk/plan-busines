<template>
  <div class="service-variant-selector" :class="{ 'is-mobile': isMobile }">
    <!-- Si no hay configuración -->
    <div v-if="!serviceConfig" class="no-variants">
      <v-chip
        :size="isMobile ? 'x-small' : 'small'"
        color="grey"
        variant="tonal">
        Sin configuración
      </v-chip>
    </div>

    <!-- Si hay configuración - SIEMPRE mostrar selector -->
    <div v-else class="variants-selector">
      <!-- Select para elegir variante -->
      <v-select
        v-model="selectedVariantKey"
        :items="variantOptions"
        :label="isMobile ? 'Variante' : 'Seleccionar Variante'"
        variant="outlined"
        :density="isMobile ? 'compact' : 'comfortable'"
        hide-details
        :menu-props="{ maxHeight: isMobile ? '200px' : '300px', offsetY: true }"
        class="variant-select">
        <template #selection="{ item }">
          <div class="d-flex align-center">
            <v-icon
              :icon="serviceConfig?.icon || 'mdi-tune-variant'"
              :color="serviceConfig?.color || 'primary'"
              :size="isMobile ? 14 : 16"
              class="mr-2">
            </v-icon>
            <span :class="isMobile ? 'text-caption' : 'text-body-2'">
              {{ truncateText(item.title, isMobile ? 15 : 25) }}
            </span>
          </div>
        </template>
        <template #item="{ props: itemProps, item }">
          <v-list-item v-bind="itemProps">
            <template #prepend>
              <v-icon
                :icon="serviceConfig?.icon || 'mdi-tune-variant'"
                :color="serviceConfig?.color || 'primary'"
                :size="isMobile ? 14 : 16">
              </v-icon>
            </template>
            <template #append>
              <v-chip
                :size="isMobile ? 'x-small' : 'small'"
                :color="serviceConfig?.color || 'primary'"
                variant="tonal">
                ${{ formatPrice(item.raw.calculatedPrice) }}
              </v-chip>
            </template>
          </v-list-item>
        </template>
      </v-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { getServiceConfig, calculateServicePrice, type PriceCalculation } from '@/config/simpleServiceConfig';
import type { ServiceView } from '@/views/ServiceView';

interface Props {
  service: ServiceView;
  isMobile?: boolean;
}

interface Emits {
  'variant-changed': [serviceId: string, variantData: any];
}

const props = withDefaults(defineProps<Props>(), {
  isMobile: false
});

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

// Función para truncar texto
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

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

.is-mobile {
  max-width: 100%;
}

/* Selector Styles */
.variant-select {
  max-width: 100%;
}

.is-mobile .variant-select :deep(.v-field__input) {
  font-size: 0.875rem;
  min-height: 36px;
}

.is-mobile .variant-select :deep(.v-field__append-inner) {
  padding-left: 4px;
}

/* Variant Details Desktop */
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

/* Mobile Variant Details */
.mobile-variant-details {
  margin-top: 4px;
}

.mobile-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  background: rgba(var(--v-theme-surface-variant), 0.2);
  border-radius: 4px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.variant-info {
  display: flex;
  align-items: center;
  gap: 3px;
}

.variant-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: #666;
}

/* No Variants */
.no-variants {
  text-align: center;
  padding: 12px;
}

.is-mobile .no-variants {
  padding: 8px;
}

/* Responsive Optimizations */
@media (max-width: 600px) {
  .service-variant-selector {
    font-size: 0.875rem;
  }

  .variant-select :deep(.v-field__input) {
    min-height: 32px;
    font-size: 0.8rem;
  }

  .variant-summary {
    padding: 4px 6px;
  }

  .variant-label {
    font-size: 0.65rem;
  }
}

@media (max-width: 480px) {
  .variant-select :deep(.v-field__input) {
    min-height: 30px;
    font-size: 0.75rem;
  }
}
</style>
