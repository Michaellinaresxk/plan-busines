<template>
  <div class="enhanced-service-variants-panel">
    <v-card-text class="pa-6">
      <!-- Panel Header -->
      <div class="panel-header mb-6">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h3 class="text-h6 font-weight-bold text-primary">
              Gestión de Variantes - {{ service.title }}
            </h3>
            <p class="text-body-2 text-medium-emphasis mt-1">
              {{ getServiceDescription() }}
            </p>
          </div>
          <div class="header-actions d-flex ga-2">
            <v-btn
              color="info"
              variant="outlined"
              size="small"
              prepend-icon="mdi-auto-fix"
              @click="addStandardVariants"
              v-if="canAddStandardVariants">
              Agregar {{ serviceConfig?.name }} Estándar
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              size="small"
              prepend-icon="mdi-plus"
              @click="addNewVariant">
              Nueva Variante
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Service Configuration Info -->
      <div v-if="serviceConfig" class="service-config-info mb-6">
        <v-alert
          :color="serviceConfig.color"
          variant="tonal"
          density="compact"
          :icon="serviceConfig.icon">
          <div class="d-flex justify-space-between align-center">
            <div>
              <strong>{{ serviceConfig.name }}</strong> - Base: ${{ formatPrice(service.basePrice) }}
            </div>
            <div class="text-caption">
              Taxes: {{ Math.round(serviceConfig.baseTaxes * 100) }}% |
              Ganancia: {{ Math.round(serviceConfig.baseProfit * 100) }}%
            </div>
          </div>
        </v-alert>
      </div>

      <!-- Variants Management -->
      <div class="variants-configuration">

        <!-- Render Variants with Business Logic -->
        <template v-if="service.variants && service.variants.length > 0">
          <div class="section-title mb-4">
            <v-icon :icon="serviceConfig?.icon || 'mdi-tune-variant'" class="mr-2" :color="serviceConfig?.color || 'primary'"></v-icon>
            Variantes Configuradas ({{ service.variants.length }})
          </div>

          <v-row>
            <v-col
              v-for="(variant, index) in service.variants"
              :key="variant.id || index"
              cols="12" lg="6">
              <EnhancedVariantCard
                :variant="variant"
                :service="service"
                :service-config="serviceConfig"
                @update="updateVariant(index, $event)"
                @delete="deleteVariant(index)" />
            </v-col>
          </v-row>
        </template>

        <!-- Empty State -->
        <div v-else class="empty-variants">
          <v-card variant="outlined" class="text-center pa-8">
            <v-icon icon="mdi-package-variant-plus" size="48" color="grey-lighten-1" class="mb-4"></v-icon>
            <h4 class="text-h6 mb-2">No hay variantes configuradas</h4>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Las variantes te permiten ofrecer diferentes opciones del mismo servicio con precios y características distintas.
            </p>
            <div class="d-flex justify-center ga-3">
              <v-btn
                v-if="canAddStandardVariants"
                color="info"
                variant="outlined"
                prepend-icon="mdi-auto-fix"
                @click="addStandardVariants">
                Agregar {{ serviceConfig?.name }} Estándar
              </v-btn>
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="mdi-plus"
                @click="addNewVariant">
                Crear Primera Variante
              </v-btn>
            </div>
          </v-card>
        </div>
      </div>

      <!-- Business Summary -->
      <div v-if="service.variants && service.variants.length > 0" class="business-summary mt-6">
        <v-divider class="mb-4"></v-divider>
        <div class="d-flex justify-space-between align-center">
          <div class="summary-stats">
            <v-chip size="small" variant="tonal" color="info" class="mr-2">
              {{ service.variants.length }} variantes
            </v-chip>
            <v-chip size="small" variant="tonal" color="success" class="mr-2">
              {{ activeVariantsCount }} activas
            </v-chip>
            <v-chip size="small" variant="tonal" color="warning">
              Rango: {{ priceRange }}
            </v-chip>
          </div>
          <div class="summary-actions">
            <v-btn
              variant="outlined"
              size="small"
              prepend-icon="mdi-content-duplicate"
              @click="duplicateVariants">
              Duplicar
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              color="warning"
              prepend-icon="mdi-pause"
              @click="toggleAllVariants">
              {{ allVariantsActive ? 'Desactivar Todas' : 'Activar Todas' }}
            </v-btn>
          </div>
        </div>
      </div>
    </v-card-text>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getServiceConfig, createDefaultVariant, calculateServicePrice } from '@/config/simpleServiceConfig';
import EnhancedVariantCard from './EnhancedVariantCard.vue';
import type { ServiceView } from '@/views/ServiceView';

interface Props {
  service: ServiceView;
}

interface Emits {
  'variant-updated': [serviceId: string, variant: any];
  'variant-deleted': [serviceId: string, variantId: string];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Service configuration from business config
const serviceConfig = computed(() => {
  return getServiceConfig(props.service.category);
});

// Check if we can add standard variants for this service type
const canAddStandardVariants = computed(() => {
  return serviceConfig.value && ['atv', 'yacht', 'catamaran', 'massage'].includes(props.service.category);
});

// Active variants count
const activeVariantsCount = computed(() => {
  if (!props.service.variants) return 0;
  return props.service.variants.filter(variant => variant.isAvailable !== false).length;
});

// All variants active check
const allVariantsActive = computed(() => {
  if (!props.service.variants || props.service.variants.length === 0) return false;
  return props.service.variants.every(variant => variant.isAvailable !== false);
});

// Price range calculation with business logic
const priceRange = computed(() => {
  if (!props.service.variants || props.service.variants.length === 0) {
    return `${props.service.currency || '$'} ${formatPrice(props.service.basePrice)}`;
  }

  const prices: number[] = [];

  // Calculate final prices for each variant using business logic
  props.service.variants.forEach(variant => {
    try {
      const calculation = calculateServicePrice(props.service.category, {
        ...props.service,
        ...variant
      });
      prices.push(calculation.clientPays);
    } catch (error) {
      // Fallback to variant price or base price
      prices.push(variant.price || props.service.basePrice);
    }
  });

  if (prices.length === 0) {
    return `${props.service.currency || '$'} ${formatPrice(props.service.basePrice)}`;
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  if (minPrice === maxPrice) {
    return `${props.service.currency || '$'} ${formatPrice(minPrice)}`;
  }

  return `${props.service.currency || '$'} ${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
});

// Methods
function getServiceDescription(): string {
  if (serviceConfig.value) {
    return serviceConfig.value.description || `Gestiona las variantes de ${serviceConfig.value.name}`;
  }
  return 'Gestiona las diferentes opciones y precios de este servicio';
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

function updateVariant(index: number, variantData: any) {
  emit('variant-updated', props.service.id, { index, ...variantData });
}

function deleteVariant(index: number) {
  if (props.service.variants && props.service.variants[index]) {
    const variant = props.service.variants[index];
    emit('variant-deleted', props.service.id, variant.id || `variant_${index}`);
  }
}

function addNewVariant() {
  const newVariant = createNewVariantForService();
  emit('variant-updated', props.service.id, {
    index: props.service.variants?.length || 0,
    ...newVariant,
    isNew: true
  });
}

function addStandardVariants() {
  const standardVariants = getStandardVariantsForService();

  standardVariants.forEach((variant, index) => {
    emit('variant-updated', props.service.id, {
      index: (props.service.variants?.length || 0) + index,
      ...variant,
      isNew: true
    });
  });
}

function createNewVariantForService() {
  if (serviceConfig.value) {
    return createDefaultVariant(props.service.category);
  }

  // Generic variant
  return {
    id: `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: 'Nueva Variante',
    price: props.service.basePrice,
    description: '',
    isAvailable: true,
    features: []
  };
}

function getStandardVariantsForService() {
  const basePrice = props.service.basePrice;

  switch (props.service.category) {
    case 'atv':
      return [
        {
          id: `variant_${Date.now()}_1`,
          name: 'ATV Individual',
          vehicleType: 'atv',
          price: basePrice,
          maxCapacity: 1,
          duration: 3,
          isAvailable: true
        },
        {
          id: `variant_${Date.now()}_2`,
          name: 'Buggies Deportivo',
          vehicleType: 'buggies',
          price: basePrice - 20,
          maxCapacity: 2,
          duration: 3,
          isAvailable: true
        },
        {
          id: `variant_${Date.now()}_3`,
          name: 'Polaris RZR',
          vehicleType: 'polaris',
          price: basePrice + 100,
          maxCapacity: 2,
          duration: 3,
          isAvailable: true
        }
      ];

    case 'massage':
      return [
        {
          id: `variant_${Date.now()}_1`,
          name: 'Masaje Relajante',
          massageType: 'relaxing',
          price: basePrice,
          duration: 60,
          isAvailable: true
        },
        {
          id: `variant_${Date.now()}_2`,
          name: 'Masaje Deportivo',
          massageType: 'sports',
          price: basePrice + 20,
          duration: 60,
          isAvailable: true
        },
        {
          id: `variant_${Date.now()}_3`,
          name: 'Piedras Calientes',
          massageType: 'hot-stone',
          price: basePrice + 30,
          duration: 90,
          isAvailable: true
        }
      ];

    case 'yacht':
      return [
        {
          id: `variant_${Date.now()}_1`,
          name: 'Fairline 43ft',
          yachtModel: 'fairline-43',
          price: basePrice,
          maxCapacity: 8,
          duration: 6,
          isAvailable: true
        },
        {
          id: `variant_${Date.now()}_2`,
          name: 'Aicon Fly 60ft',
          yachtModel: 'aicon-60',
          price: basePrice + 400,
          maxCapacity: 12,
          duration: 8,
          isAvailable: true
        }
      ];

    default:
      return [];
  }
}

function duplicateVariants() {
  console.log('Duplicating variants for service:', props.service.id);
  // TODO: Implement duplication logic
}

function toggleAllVariants() {
  console.log('Toggling all variants for service:', props.service.id);
  // TODO: Implement toggle all logic
}
</script>

<style scoped>
.enhanced-service-variants-panel {
  background-color: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.panel-header {
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.service-config-info {
  margin: 16px 0;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 16px;
}

.variants-configuration {
  margin-top: 24px;
}

.empty-variants {
  margin: 32px 0;
}

.business-summary {
  padding-top: 16px;
}

.summary-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .business-summary .d-flex {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .summary-stats {
    justify-content: center;
  }

  .summary-actions {
    justify-content: center;
  }
}
</style>
