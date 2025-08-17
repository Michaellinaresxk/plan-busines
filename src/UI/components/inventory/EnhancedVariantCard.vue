<template>
  <v-card class="enhanced-variant-card" elevation="2" rounded="lg">
    <!-- Card Header -->
    <v-card-title class="pa-4 pb-2">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-items-center">
          <v-avatar :color="serviceConfig?.color || '#6366F1'" size="32" class="mr-3">
            <v-icon :icon="serviceConfig?.icon || 'mdi-cog'" color="white" size="18"></v-icon>
          </v-avatar>
          <span class="text-subtitle-1 font-weight-bold">
            {{ localVariant.name || `Nueva ${serviceConfig?.name || 'Variante'}` }}
          </span>
        </div>
        <div class="card-actions">
          <v-btn
            icon="mdi-content-copy"
            variant="text"
            size="small"
            @click="duplicateVariant">
          </v-btn>
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            @click="deleteVariant">
          </v-btn>
        </div>
      </div>
    </v-card-title>

    <!-- Card Content -->
    <v-card-text class="pa-4">
      <v-form @submit.prevent="saveVariant">
        <v-row>
          <!-- Variant Name -->
          <v-col cols="12">
            <v-text-field
              v-model="localVariant.name"
              label="Nombre de la Variante"
              variant="outlined"
              density="compact"
              placeholder="ej: ATV Premium con Guía"
              @blur="saveVariant">
            </v-text-field>
          </v-col>

          <!-- Service-Specific Fields (Dynamic) -->
          <template v-if="serviceConfig?.fields">
            <v-col
              v-for="field in serviceConfig.fields"
              :key="field.key"
              cols="12" md="6">

              <!-- Select Field -->
              <v-select
                v-if="field.type === 'select'"
                v-model="localVariant[field.key]"
                :items="field.options"
                :label="field.label"
                variant="outlined"
                density="compact"
                @update:model-value="recalculateAndSave">
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

              <!-- Number Field -->
              <v-text-field
                v-else-if="field.type === 'number'"
                v-model.number="localVariant[field.key]"
                :label="field.label"
                :prefix="field.prefix"
                :suffix="field.suffix"
                type="number"
                variant="outlined"
                density="compact"
                @update:model-value="recalculateAndSave">
              </v-text-field>

              <!-- Switch Field -->
              <v-switch
                v-else-if="field.type === 'switch'"
                v-model="localVariant[field.key]"
                :label="field.label"
                color="primary"
                @update:model-value="recalculateAndSave">
              </v-switch>
            </v-col>
          </template>

          <!-- Manual Price Override (Optional) -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model.number="localVariant.basePrice"
              label="Precio Base (Override)"
              variant="outlined"
              density="compact"
              type="number"
              prefix="$"
              hint="Opcional: sobrescribir precio base calculado"
              @blur="recalculateAndSave">
            </v-text-field>
          </v-col>

          <!-- Description -->
          <v-col cols="12">
            <v-textarea
              v-model="localVariant.description"
              label="Descripción"
              variant="outlined"
              density="compact"
              rows="2"
              placeholder="Describe las características específicas de esta variante"
              @blur="saveVariant">
            </v-textarea>
          </v-col>

          <!-- Features -->
          <v-col cols="12">
            <v-combobox
              v-model="localVariant.features"
              label="Características Incluidas"
              variant="outlined"
              density="compact"
              multiple
              chips
              clearable
              placeholder="ej: Guía incluido, Equipo de seguridad, Refrigerios"
              @update:model-value="saveVariant">
            </v-combobox>
          </v-col>
        </v-row>
      </v-form>

      <!-- Business Price Calculation Display -->
      <div v-if="priceCalculation" class="price-calculation-section mt-4">
        <v-divider class="mb-3"></v-divider>
        <h4 class="text-subtitle-2 mb-3 d-flex align-center">
          <v-icon icon="mdi-calculator" class="mr-2" color="success" size="16"></v-icon>
          Cálculo de Precios
        </h4>

        <v-card variant="outlined" :color="serviceConfig?.color || 'primary'" class="price-breakdown-card">
          <v-card-text class="pa-3">
            <v-row dense>
              <v-col cols="6" sm="3">
                <div class="price-breakdown-item">
                  <span class="breakdown-label">Base:</span>
                  <span class="breakdown-value">${{ formatPrice(priceCalculation.basePrice) }}</span>
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="price-breakdown-item">
                  <span class="breakdown-label">Extras:</span>
                  <span class="breakdown-value info">+${{ formatPrice(priceCalculation.extraPrice) }}</span>
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="price-breakdown-item">
                  <span class="breakdown-label">Ganancia:</span>
                  <span class="breakdown-value success">${{ formatPrice(priceCalculation.profit) }}</span>
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="price-breakdown-item">
                  <span class="breakdown-label">Taxes:</span>
                  <span class="breakdown-value warning">${{ formatPrice(priceCalculation.taxes) }}</span>
                </div>
              </v-col>
            </v-row>

            <v-divider class="my-2"></v-divider>

            <div class="d-flex justify-space-between align-center">
              <span class="text-subtitle-2 font-weight-bold">Cliente Paga:</span>
              <span class="text-h6 font-weight-bold" :style="{ color: serviceConfig?.color || '#6366F1' }">
                ${{ formatPrice(priceCalculation.clientPays) }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-card-text>

    <!-- Card Actions -->
    <v-card-actions class="pa-4 pt-0">
      <v-switch
        v-model="localVariant.isAvailable"
        :label="localVariant.isAvailable ? 'Disponible' : 'No Disponible'"
        :color="localVariant.isAvailable ? 'success' : 'error'"
        @update:model-value="saveVariant">
      </v-switch>
      <v-spacer></v-spacer>

      <!-- Status Chips -->
      <div class="status-chips">
        <v-chip
          v-if="priceCalculation"
          :color="serviceConfig?.color || 'primary'"
          size="small"
          variant="tonal"
          class="mr-2">
          ${{ formatPrice(priceCalculation.clientPays) }}
        </v-chip>
        <v-chip
          v-if="getCapacityInfo()"
          color="info"
          size="small"
          variant="tonal"
          class="mr-2">
          {{ getCapacityInfo() }}
        </v-chip>
        <v-chip
          :color="localVariant.isAvailable ? 'success' : 'error'"
          size="small"
          variant="tonal">
          {{ localVariant.isAvailable ? 'Activa' : 'Inactiva' }}
        </v-chip>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { calculateServicePrice, type PriceCalculation } from '@/config/simpleServiceConfig';
import type { ServiceView } from '@/views/ServiceView';

interface Props {
  variant: Record<string, any>;
  service: ServiceView;
  serviceConfig: any;
}

interface Emits {
  'update': [variant: Record<string, any>];
  'delete': [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local reactive copy of the variant
const localVariant = ref<Record<string, any>>({});

// Price calculation
const priceCalculation = ref<PriceCalculation | null>(null);

// Initialize variant data
function initializeVariant() {
  localVariant.value = {
    ...props.variant,
    id: props.variant.id || `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    isAvailable: props.variant.isAvailable !== false,
    name: props.variant.name || '',
    description: props.variant.description || '',
    features: props.variant.features || [],
    basePrice: props.variant.basePrice || props.service.basePrice
  };

  // Initialize service-specific fields
  if (props.serviceConfig?.fields) {
    props.serviceConfig.fields.forEach((field: any) => {
      if (localVariant.value[field.key] === undefined) {
        if (field.type === 'select' && field.options?.[0]) {
          localVariant.value[field.key] = field.options[0].value;
        } else if (field.type === 'number') {
          localVariant.value[field.key] = 1;
        } else if (field.type === 'switch') {
          localVariant.value[field.key] = false;
        }
      }
    });
  }

  calculatePrice();
}

// Calculate price using business logic
function calculatePrice() {
  if (!props.serviceConfig) {
    priceCalculation.value = null;
    return;
  }

  try {
    const combinedData = {
      ...props.service,
      ...localVariant.value
    };

    priceCalculation.value = calculateServicePrice(props.service.category, combinedData);
  } catch (error) {
    console.error('Error calculating variant price:', error);
    priceCalculation.value = null;
  }
}

// Smart capacity getter
function getCapacityInfo(): string | null {
  if (localVariant.value.maxCapacity) {
    return `${localVariant.value.maxCapacity} pax`;
  }
  if (localVariant.value.capacity) {
    return `${localVariant.value.capacity} plazas`;
  }
  if (localVariant.value.maxPassengers) {
    return `${localVariant.value.maxPassengers} pax`;
  }
  if (localVariant.value.maxParticipants) {
    return `${localVariant.value.maxParticipants} personas`;
  }
  if (localVariant.value.duration) {
    return `${localVariant.value.duration} min`;
  }
  return null;
}

// Format price for display
function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

// Methods
function recalculateAndSave() {
  calculatePrice();
  saveVariant();
}

function saveVariant() {
  // Clean up undefined values and include price calculation
  const cleanVariant = {
    ...Object.fromEntries(
      Object.entries(localVariant.value).filter(([_, value]) => value !== undefined)
    )
  };

  // Include calculated price information
  if (priceCalculation.value) {
    cleanVariant.calculatedPrice = priceCalculation.value.clientPays;
    cleanVariant.profit = priceCalculation.value.profit;
    cleanVariant.taxes = priceCalculation.value.taxes;
    cleanVariant.priceBreakdown = priceCalculation.value;
  }

  emit('update', cleanVariant);
}

function deleteVariant() {
  if (confirm(`¿Estás seguro de que quieres eliminar la variante "${localVariant.value.name || 'Sin nombre'}"?`)) {
    emit('delete');
  }
}

function duplicateVariant() {
  const duplicated = {
    ...localVariant.value,
    id: `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${localVariant.value.name} (Copia)`
  };
  emit('update', duplicated);
}

// Lifecycle
onMounted(() => {
  initializeVariant();
});

// Watch for external changes
watch(() => props.variant, () => {
  initializeVariant();
}, { deep: true });

// Watch for service changes that might affect calculations
watch(() => props.service, () => {
  calculatePrice();
}, { deep: true });
</script>

<style scoped>
.enhanced-variant-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.enhanced-variant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.price-calculation-section {
  margin-top: 16px;
}

.price-breakdown-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.price-breakdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4px;
}

.breakdown-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.breakdown-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.breakdown-value.info {
  color: rgb(var(--v-theme-info));
}

.breakdown-value.success {
  color: rgb(var(--v-theme-success));
}

.breakdown-value.warning {
  color: rgb(var(--v-theme-warning));
}

.status-chips {
  display: flex;
  align-items: center;
  gap: 8px;
}

.v-form {
  width: 100%;
}

.v-switch :deep(.v-label) {
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .status-chips {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .price-breakdown-item {
    margin-bottom: 8px;
  }
}
</style>
