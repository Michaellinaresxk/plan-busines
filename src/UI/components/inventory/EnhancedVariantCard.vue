<template>
  <div class="variant-card">

    <!-- Header -->
    <div class="variant-header">
      <div class="variant-title-group">
        <div class="variant-icon">
          <v-icon :icon="serviceConfig?.icon || 'mdi-cog'" size="16" color="white" />
        </div>
        <div>
          <p class="variant-name">
            {{ localVariant.name || `Nueva ${serviceConfig?.name || 'Variante'}` }}
          </p>
          <p v-if="priceCalculation" class="variant-price-preview">
            ${{ formatPrice(priceCalculation.clientPays) }}
          </p>
        </div>
      </div>

      <div class="variant-header-actions">
        <button class="icon-btn" @click="duplicateVariant" title="Duplicar">
          <v-icon icon="mdi-content-copy" size="15" />
        </button>
        <button class="icon-btn icon-btn--danger" @click="deleteVariant" title="Eliminar">
          <v-icon icon="mdi-delete-outline" size="15" />
        </button>
      </div>
    </div>

    <!-- Form -->
    <div class="variant-body">
      <v-form @submit.prevent="saveVariant">

        <!-- Variant Name -->
        <div class="field-group">
          <label class="field-label">Nombre</label>
          <v-text-field
            v-model="localVariant.name"
            variant="outlined"
            density="compact"
            placeholder="ej: ATV Premium con Guía"
            hide-details
            class="luxury-input"
            @blur="saveVariant"
          />
        </div>

        <!-- Service-Specific Fields -->
        <template v-if="serviceConfig?.fields">
          <v-row dense class="mt-1">
            <v-col
              v-for="field in serviceConfig.fields"
              :key="field.key"
              cols="12"
              :md="serviceConfig.fields.length > 1 ? 6 : 12"
            >
              <div class="field-group">
                <label class="field-label">{{ field.label }}</label>

                <v-select
                  v-if="field.type === 'select'"
                  v-model="localVariant[field.key]"
                  :items="field.options"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="luxury-input"
                  @update:model-value="recalculateAndSave"
                >
                  <template #item="{ props: itemProps, item }">
                    <v-list-item v-bind="itemProps">
                      <template v-if="(item.raw as any).extraPrice" #append>
                        <span class="option-price">${{ (item.raw as any).extraPrice }}</span>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>

                <v-text-field
                  v-else-if="field.type === 'number'"
                  v-model.number="localVariant[field.key]"
                  :prefix="field.prefix"
                  :suffix="field.suffix"
                  type="number"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="luxury-input"
                  @update:model-value="recalculateAndSave"
                />

                <div v-else-if="field.type === 'switch'" class="switch-row">
                  <v-switch
                    v-model="localVariant[field.key]"
                    :label="field.label"
                    color="primary"
                    density="compact"
                    hide-details
                    @update:model-value="recalculateAndSave"
                  />
                </div>
              </div>
            </v-col>
          </v-row>
        </template>

        <!-- Price override -->
        <div class="field-group mt-1">
          <label class="field-label">Precio Base <span class="field-label--optional">(override)</span></label>
          <v-text-field
            v-model.number="localVariant.basePrice"
            variant="outlined"
            density="compact"
            type="number"
            prefix="$"
            hide-details
            class="luxury-input"
            @blur="recalculateAndSave"
          />
        </div>

        <!-- Description -->
        <div class="field-group mt-1">
          <label class="field-label">Descripción</label>
          <v-textarea
            v-model="localVariant.description"
            variant="outlined"
            density="compact"
            rows="2"
            hide-details
            placeholder="Características específicas de esta variante"
            class="luxury-input"
            @blur="saveVariant"
          />
        </div>

        <!-- Features -->
        <div class="field-group mt-1">
          <label class="field-label">Incluye</label>
          <v-combobox
            v-model="localVariant.features"
            variant="outlined"
            density="compact"
            multiple
            chips
            clearable
            hide-details
            placeholder="Guía incluido, Equipo de seguridad..."
            class="luxury-input"
            @update:model-value="saveVariant"
          />
        </div>
      </v-form>
    </div>

    <!-- Price Breakdown -->
    <div v-if="priceCalculation" class="price-section">
      <div class="price-section-label">Desglose de precio</div>

      <div class="price-rows">
        <div class="price-row">
          <span class="price-row-label">Subtotal proveedor</span>
          <span class="price-row-value">${{ formatPrice(priceCalculation.subtotal) }}</span>
        </div>
        <div class="price-row">
          <span class="price-row-label">Ganancia</span>
          <span class="price-row-value">${{ formatPrice(priceCalculation.profit) }}</span>
        </div>
        <div class="price-row">
          <span class="price-row-label">ITBIS ({{ Math.round(priceCalculation.taxes / priceCalculation.clientPays * 100) }}%)</span>
          <span class="price-row-value">${{ formatPrice(priceCalculation.taxes) }}</span>
        </div>
      </div>

      <div class="price-total">
        <span class="price-total-label">Cliente paga</span>
        <span class="price-total-value">${{ formatPrice(priceCalculation.clientPays) }}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="variant-footer">
      <div class="availability-toggle">
        <v-switch
          v-model="localVariant.isAvailable"
          color="success"
          density="compact"
          hide-details
          @update:model-value="saveVariant"
        />
        <span class="availability-label" :class="localVariant.isAvailable ? 'available' : 'unavailable'">
          {{ localVariant.isAvailable ? 'Disponible' : 'Inactiva' }}
        </span>
      </div>

      <div class="footer-tags">
        <span v-if="getCapacityInfo()" class="footer-tag">
          {{ getCapacityInfo() }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
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

const localVariant = ref<Record<string, any>>({});
const priceCalculation = ref<PriceCalculation | null>(null);

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

function calculatePrice() {
  if (!props.serviceConfig) { priceCalculation.value = null; return; }
  try {
    priceCalculation.value = calculateServicePrice(props.service.category, {
      ...props.service,
      ...localVariant.value
    });
  } catch {
    priceCalculation.value = null;
  }
}

function getCapacityInfo(): string | null {
  const v = localVariant.value;
  if (v.maxCapacity)    return `${v.maxCapacity} pax`;
  if (v.capacity)       return `${v.capacity} plazas`;
  if (v.maxPassengers)  return `${v.maxPassengers} pax`;
  if (v.maxParticipants) return `${v.maxParticipants} personas`;
  if (v.duration)       return `${v.duration} min`;
  return null;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

function recalculateAndSave() {
  calculatePrice();
  saveVariant();
}

function saveVariant() {
  const clean: Record<string, any> = Object.fromEntries(
    Object.entries(localVariant.value).filter(([, v]) => v !== undefined)
  );
  if (priceCalculation.value) {
    clean.calculatedPrice = priceCalculation.value.clientPays;
    clean.profit = priceCalculation.value.profit;
    clean.taxes = priceCalculation.value.taxes;
    clean.priceBreakdown = priceCalculation.value;
  }
  emit('update', clean);
}

function deleteVariant() {
  if (confirm(`¿Eliminar la variante "${localVariant.value.name || 'Sin nombre'}"?`)) {
    emit('delete');
  }
}

function duplicateVariant() {
  emit('update', {
    ...localVariant.value,
    id: `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${localVariant.value.name} (Copia)`
  });
}

onMounted(initializeVariant);
watch(() => props.variant, initializeVariant, { deep: true });
watch(() => props.service, calculatePrice, { deep: true });
</script>

<style scoped>
/* ─── Card Shell ─── */
.variant-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.variant-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 20px -4px rgba(0,0,0,0.06);
}

/* ─── Header ─── */
.variant-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid #F8FAFC;
}

.variant-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.variant-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #1E293B;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.variant-name {
  font-size: 0.9rem;
  font-weight: 650;
  color: #0F172A;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.1px;
}

.variant-price-preview {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6366F1;
  margin: 1px 0 0;
}

.variant-header-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

/* ─── Icon buttons ─── */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 7px;
  cursor: pointer;
  color: #94A3B8;
  transition: background 0.15s ease, color 0.15s ease;
}

.icon-btn:hover { background: #F1F5F9; color: #475569; }
.icon-btn--danger:hover { background: #FEF2F2; color: #EF4444; }

/* ─── Body / Form ─── */
.variant-body {
  padding: 16px 20px;
}

.field-group {
  margin-bottom: 12px;
}

.field-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: #94A3B8;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.field-label--optional {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  font-size: 0.7rem;
  color: #CBD5E1;
}

/* Minimal input override */
:deep(.luxury-input .v-field__outline__start),
:deep(.luxury-input .v-field__outline__end),
:deep(.luxury-input .v-field__outline__notch) {
  border-color: #E2E8F0 !important;
}

:deep(.luxury-input .v-field:hover .v-field__outline__start),
:deep(.luxury-input .v-field:hover .v-field__outline__end),
:deep(.luxury-input .v-field:hover .v-field__outline__notch) {
  border-color: #CBD5E1 !important;
}

:deep(.luxury-input.v-input--focused .v-field__outline__start),
:deep(.luxury-input.v-input--focused .v-field__outline__end),
:deep(.luxury-input.v-input--focused .v-field__outline__notch) {
  border-color: #6366F1 !important;
}

:deep(.luxury-input .v-field__input) {
  font-size: 0.8375rem !important;
  color: #1E293B !important;
}

.switch-row {
  padding-top: 4px;
}

.option-price {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6366F1;
  background: rgba(99, 102, 241, 0.08);
  padding: 2px 7px;
  border-radius: 5px;
}

/* ─── Price Section ─── */
.price-section {
  margin: 0 20px 16px;
  background: #F8FAFC;
  border: 1px solid #F1F5F9;
  border-radius: 12px;
  padding: 14px 16px;
}

.price-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #94A3B8;
  margin-bottom: 10px;
}

.price-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #E2E8F0;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-row-label {
  font-size: 0.8rem;
  color: #64748B;
}

.price-row-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.price-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-total-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.price-total-value {
  font-size: 1.05rem;
  font-weight: 750;
  color: #6366F1;
  letter-spacing: -0.3px;
}

/* ─── Footer ─── */
.variant-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px 14px;
  border-top: 1px solid #F8FAFC;
}

.availability-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.availability-label {
  font-size: 0.8rem;
  font-weight: 600;
}

.availability-label.available   { color: #10B981; }
.availability-label.unavailable { color: #94A3B8; }

.footer-tags {
  display: flex;
  gap: 6px;
}

.footer-tag {
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748B;
  background: #F1F5F9;
  padding: 3px 9px;
  border-radius: 6px;
  border: 1px solid #E2E8F0;
}

/* ─── Dark theme ─── */
.v-theme--dark .variant-card {
  background: #1E293B;
  border-color: #334155;
}

.v-theme--dark .variant-header { border-bottom-color: #334155; }
.v-theme--dark .variant-name   { color: #F1F5F9; }
.v-theme--dark .icon-btn       { color: #475569; }
.v-theme--dark .icon-btn:hover { background: #334155; color: #94A3B8; }
.v-theme--dark .icon-btn--danger:hover { background: rgba(239,68,68,0.1); color: #F87171; }

.v-theme--dark .field-label { color: #475569; }

.v-theme--dark .price-section {
  background: #0F172A;
  border-color: #334155;
}
.v-theme--dark .price-row-label  { color: #475569; }
.v-theme--dark .price-row-value  { color: #94A3B8; }
.v-theme--dark .price-total-label { color: #CBD5E1; }
.v-theme--dark .price-rows       { border-bottom-color: #334155; }

.v-theme--dark .variant-footer   { border-top-color: #334155; }
.v-theme--dark .footer-tag {
  background: #0F172A;
  border-color: #334155;
  color: #475569;
}

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .variant-header { padding: 14px 16px 12px; }
  .variant-body   { padding: 12px 16px; }
  .price-section  { margin: 0 16px 12px; }
  .variant-footer { padding: 8px 16px 12px; }
}
</style>
