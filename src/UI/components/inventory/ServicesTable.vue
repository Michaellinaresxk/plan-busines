<template>
  <div class="services-table-container">
    <!-- Search Bar -->
    <div class="search-bar">
      <v-text-field
        v-model="searchQuery"
        placeholder="Buscar servicios..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="search-field">
      </v-text-field>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="$emit('create-service')">
        Nuevo
      </v-btn>
      <v-btn
        variant="outlined"
        icon="mdi-refresh"
        @click="$emit('refresh')"
        :loading="loading">
      </v-btn>
    </div>

    <!-- Tabla Real Responsive -->
    <div class="table-wrapper">
      <v-data-table
        :headers="tableHeaders"
        :items="filteredServices"
        :loading="loading"
        :items-per-page="15"
        class="responsive-table"
        density="comfortable">

        <!-- Servicio Column -->
        <template #item.service="{ item }">
          <div class="service-cell">
            <div class="service-main">
              <v-avatar :color="getServiceColor(item)" size="32" class="service-avatar">
                <v-icon :icon="getServiceIcon(item)" color="white" size="16"></v-icon>
              </v-avatar>
              <div class="service-info">
                <div class="service-name">{{ item.title }}</div>
                <div class="service-category">{{ getServiceCategory(item) }}</div>
              </div>
            </div>
          </div>
        </template>

        <!-- Variantes Column - CON COMUNICACIÓN MEJORADA -->
        <template #item.variants="{ item }">
          <div class="variants-cell">
            <ServiceVariantSelector
              :service="item"
              @variant-changed="handleVariantChange" />
          </div>
        </template>

        <!-- Precio Base Column - CON MARGEN ACTUALIZADO -->
        <template #item.priceBase="{ item }">
          <div class="price-base-cell">
            <div class="price-row provider">
              <span class="price-icon">💸</span>
              <span class="price-text">Proveedor: <strong>${{ formatPrice(getProviderPrice(item)) }}</strong></span>
            </div>
            <div class="price-row client">
              <span class="price-icon">💳</span>
              <span class="price-text">Cliente: <strong>${{ formatPrice(getClientPrice(item)) }}</strong></span>
            </div>
            <!-- FILA DE MARGEN ACTUALIZADA -->
            <div class="price-row margin">
              <span class="price-icon">📈</span>
              <span class="price-text">Margen: <strong>{{ getProfitMargin(item) }}%</strong></span>
            </div>
          </div>
        </template>

        <!-- Taxes Column - ACTUALIZADA -->
        <template #item.taxes="{ item }">
          <div class="taxes-cell">
            <div class="percentage-value">{{ getTaxPercentage(item) }}%</div>
            <div class="amount-value">${{ formatPrice(getServiceTaxes(item)) }}</div>
          </div>
        </template>

        <!-- Ganancia Column - ACTUALIZADA -->
        <template #item.profit="{ item }">
          <div class="profit-cell">
            <div class="percentage-value profit-color">{{ getProfitPercentage(item) }}%</div>
            <div class="amount-value profit-color">${{ formatPrice(getServiceProfit(item)) }}</div>
          </div>
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <div class="actions-cell">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="small"
                  v-bind="props">
                </v-btn>
              </template>
              <v-list density="compact">
                <v-list-item @click="editService(item)">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-pencil" size="16"></v-icon>
                  </template>
                  <v-list-item-title>Editar</v-list-item-title>
                </v-list-item>
                <v-list-item @click="duplicateService(item)">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-content-copy" size="16"></v-icon>
                  </template>
                  <v-list-item-title>Duplicar</v-list-item-title>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="deleteService(item)" class="text-error">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-delete" size="16" color="error"></v-icon>
                  </template>
                  <v-list-item-title>Eliminar</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>

        <!-- Loading -->
        <template #loading>
          <div class="loading-state">
            <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
            <p class="mt-3">Cargando servicios...</p>
          </div>
        </template>

        <!-- No Data -->
        <template #no-data>
          <div class="empty-state">
            <v-icon icon="mdi-package-variant-closed" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
            <h3 class="mb-2">No hay servicios</h3>
            <p class="mb-4">{{ searchQuery ? 'No se encontraron resultados' : 'Crea tu primer servicio' }}</p>
            <v-btn
              v-if="!searchQuery"
              color="primary"
              prepend-icon="mdi-plus"
              @click="$emit('create-service')">
              Crear Servicio
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- 🚀 DEBUG PANEL (opcional - puedes remover en producción) -->
    <v-card v-if="Object.keys(selectedVariants).length > 0" class="mt-4" variant="outlined">
      <v-card-title>
        <v-icon icon="mdi-bug" class="mr-2"></v-icon>
        Debug: Variantes Seleccionadas
      </v-card-title>
      <v-card-text>
        <pre class="text-caption">{{ JSON.stringify(selectedVariants, null, 2) }}</pre>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { getServiceConfig, calculateServicePrice } from '@/config/simpleServiceConfig';
import ServiceVariantSelector from './ServiceVariantSelector.vue';
import type { ServiceView } from '@/views/ServiceView';

interface Props {
  services: ServiceView[];
  loading?: boolean;
}

interface Emits {
  'create-service': [];
  'refresh': [];
  'edit-service': [service: ServiceView];
  'duplicate-service': [service: ServiceView];
  'delete-service': [service: ServiceView];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<Emits>();

const searchQuery = ref('');

// 🚀 ESTADO REACTIVO PARA VARIANTES SELECCIONADAS
const selectedVariants = ref<Record<string, any>>({});

// Headers de la tabla
const tableHeaders = [
  {
    title: 'Servicio',
    key: 'service',
    sortable: true,
    width: '30%'
  },
  {
    title: 'Variantes',
    key: 'variants',
    sortable: false,
    width: '25%'
  },
  {
    title: 'Precio Base',
    key: 'priceBase',
    sortable: false,
    width: '25%'
  },
  {
    title: 'Taxes',
    key: 'taxes',
    sortable: true,
    width: '10%'
  },
  {
    title: 'Ganancia',
    key: 'profit',
    sortable: true,
    width: '8%'
  },
  {
    title: '',
    key: 'actions',
    sortable: false,
    width: '2%'
  }
];

const filteredServices = computed(() => {
  if (!searchQuery.value) return props.services;

  const query = searchQuery.value.toLowerCase();
  return props.services.filter(service =>
    service.title.toLowerCase().includes(query) ||
    service.category.toLowerCase().includes(query)
  );
});

// 🚀 HELPER FUNCTION MEJORADA - Obtener datos de servicio con variante
function getServiceData(service: ServiceView) {
  const selectedVariant = selectedVariants.value[service.id];
  if (!selectedVariant) return service;

  // Combinar datos del servicio con la variante seleccionada
  const serviceData = { ...service };

  if (selectedVariant.fieldKey !== 'base') {
    serviceData[selectedVariant.fieldKey] = selectedVariant.optionValue;
  }

  return serviceData;
}

// Helper functions - ACTUALIZADOS PARA USAR VARIANTES SELECCIONADAS
function getServiceColor(service: ServiceView): string {
  const config = getServiceConfig(service.category);
  return config?.color || '#6366F1';
}

function getServiceIcon(service: ServiceView): string {
  const config = getServiceConfig(service.category);
  return config?.icon || 'mdi-help-circle';
}

function getServiceCategory(service: ServiceView): string {
  const config = getServiceConfig(service.category);
  return config?.name || service.category;
}

// 🚀 FUNCIONES DE PRECIO ACTUALIZADAS - Usar variante seleccionada
function getProviderPrice(service: ServiceView): number {
  const selectedVariant = selectedVariants.value[service.id];

  if (selectedVariant?.calculation) {
    return selectedVariant.calculation.subtotal;
  }

  // Fallback: cálculo tradicional
  const config = getServiceConfig(service.category);
  if (!config) return service.basePrice;

  try {
    const serviceData = getServiceData(service);
    const calculation = calculateServicePrice(service.category, serviceData);
    return calculation.subtotal;
  } catch {
    return service.basePrice;
  }
}

function getServiceProfit(service: ServiceView): number {
  const selectedVariant = selectedVariants.value[service.id];

  if (selectedVariant?.calculation) {
    return selectedVariant.calculation.profit;
  }

  // Fallback: cálculo tradicional
  const config = getServiceConfig(service.category);
  if (!config) return 0;

  try {
    const serviceData = getServiceData(service);
    const calculation = calculateServicePrice(service.category, serviceData);
    return calculation.profit;
  } catch {
    return service.basePrice * config.baseProfit;
  }
}

function getServiceTaxes(service: ServiceView): number {
  const selectedVariant = selectedVariants.value[service.id];

  if (selectedVariant?.calculation) {
    return selectedVariant.calculation.taxes;
  }

  // Fallback: cálculo tradicional
  const config = getServiceConfig(service.category);
  if (!config) return 0;

  try {
    const serviceData = getServiceData(service);
    const calculation = calculateServicePrice(service.category, serviceData);
    return calculation.taxes;
  } catch {
    const subtotal = getProviderPrice(service) + getServiceProfit(service);
    return subtotal * config.baseTaxes;
  }
}

function getClientPrice(service: ServiceView): number {
  const selectedVariant = selectedVariants.value[service.id];

  if (selectedVariant?.calculation) {
    return selectedVariant.calculation.clientPays;
  }

  // Fallback: cálculo tradicional
  try {
    const serviceData = getServiceData(service);
    const calculation = calculateServicePrice(service.category, serviceData);
    return calculation.clientPays;
  } catch {
    const subtotal = getProviderPrice(service) + getServiceProfit(service);
    return subtotal + getServiceTaxes(service);
  }
}

// 🚀 FUNCIÓN ACTUALIZADA: Margen de Ganancia
function getProfitMargin(service: ServiceView): string {
  const selectedVariant = selectedVariants.value[service.id];

  if (selectedVariant?.calculation) {
    const calc = selectedVariant.calculation;
    if (calc.subtotal === 0) return '0';
    const margin = (calc.profit / calc.subtotal) * 100;
    return Math.round(margin).toString();
  }

  // Fallback: cálculo tradicional
  try {
    const serviceData = getServiceData(service);
    const calculation = calculateServicePrice(service.category, serviceData);

    if (calculation.subtotal === 0) return '0';

    const margin = (calculation.profit / calculation.subtotal) * 100;
    return Math.round(margin).toString();
  } catch (error) {
    // Fallback final: usar configuración base
    const config = getServiceConfig(service.category);
    if (config) {
      return Math.round(config.baseProfit * 100).toString();
    }
    return '30'; // Default 30%
  }
}

function getProfitPercentage(service: ServiceView): string {
  const config = getServiceConfig(service.category);
  return config ? Math.round(config.baseProfit * 100).toString() : '0';
}

function getTaxPercentage(service: ServiceView): string {
  const config = getServiceConfig(service.category);
  return config ? Math.round(config.baseTaxes * 100).toString() : '0';
}

function formatPrice(price: number): string {
  return Math.round(price).toString();
}

// 🚀 EVENT HANDLER MEJORADO - Manejar cambios de variante
function handleVariantChange(serviceId: string, variantData: any) {
  console.log('🚀 ServicesTable: Variant changed for service:', serviceId, variantData);

  // Actualizar el estado reactivo
  selectedVariants.value[serviceId] = variantData;

  console.log('📊 Updated selected variants:', selectedVariants.value);

  // Opcional: Forzar re-render si es necesario
  // nextTick(() => {
  //   console.log('🔄 Prices recalculated for service:', serviceId);
  // });
}

function editService(service: ServiceView) {
  emit('edit-service', service);
}

function duplicateService(service: ServiceView) {
  emit('duplicate-service', service);
}

function deleteService(service: ServiceView) {
  if (confirm(`¿Eliminar "${service.title}"?`)) {
    emit('delete-service', service);
  }
}
</script>

<style scoped>
.services-table-container {
  width: 100%;
}

/* Search Bar */
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.search-field {
  max-width: 400px;
}

/* Table Wrapper */
.table-wrapper {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.responsive-table {
  --v-table-header-height: 48px;
}

.responsive-table :deep(.v-data-table__thead) {
  background-color: #f8f9fa;
}

.responsive-table :deep(.v-data-table__th) {
  font-weight: 600;
  color: #1a1a1a;
  border-bottom: 2px solid #e0e0e0;
  padding: 12px 8px;
  font-size: 0.9rem;
}

.responsive-table :deep(.v-data-table__td) {
  padding: 16px 8px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.responsive-table :deep(.v-data-table__tr:hover) {
  background-color: #f8f9fa;
}

/* Service Cell */
.service-cell {
  min-height: 60px;
  display: flex;
  align-items: center;
}

.service-main {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.service-avatar {
  flex-shrink: 0;
}

.service-info {
  flex: 1;
  min-width: 0;
}

.service-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1a1a1a;
  line-height: 1.3;
  margin-bottom: 2px;
}

.service-category {
  font-size: 0.8rem;
  color: #666;
}

/* Variants Cell */
.variants-cell {
  min-width: 200px;
}

/* Price Base Cell - ACTUALIZADO CON MARGEN */
.price-base-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  margin-bottom: 2px;
}

.price-row:last-child {
  margin-bottom: 0;
}

.price-row.provider {
  color: #d32f2f;
}

.price-row.client {
  color: #1976d2;
  font-weight: 500;
}

/* NUEVO: Estilo para margen de ganancia */
.price-row.margin {
  color: #388e3c;
  font-size: 0.8rem;
}

.price-row.margin .price-text {
  font-weight: 600;
}

.price-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.price-text {
  flex: 1;
}

/* Taxes Cell */
.taxes-cell {
  text-align: center;
}

.percentage-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f57c00;
  line-height: 1.2;
}

.amount-value {
  font-size: 0.85rem;
  color: #666;
  margin-top: 2px;
}

/* Profit Cell */
.profit-cell {
  text-align: center;
}

.percentage-value.profit-color {
  color: #388e3c;
}

.amount-value.profit-color {
  color: #388e3c;
}

/* Actions Cell */
.actions-cell {
  text-align: center;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.loading-state p,
.empty-state h3,
.empty-state p {
  margin: 0;
}

.empty-state h3 {
  color: #1a1a1a;
  font-weight: 600;
}

.empty-state p {
  color: #666;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-field {
    max-width: none;
  }

  .responsive-table :deep(.v-data-table__th),
  .responsive-table :deep(.v-data-table__td) {
    padding: 8px 4px;
  }

  .responsive-table :deep(.v-data-table__th) {
    font-size: 0.8rem;
  }

  .service-main {
    gap: 8px;
  }

  .service-name {
    font-size: 0.85rem;
  }

  .service-category {
    font-size: 0.75rem;
  }

  .price-row {
    font-size: 0.75rem;
  }

  .price-icon {
    font-size: 0.9rem;
    width: 16px;
  }

  .percentage-value {
    font-size: 0.95rem;
  }

  .amount-value {
    font-size: 0.75rem;
  }
}

@media (max-width: 600px) {
  .responsive-table :deep(.v-data-table__th) {
    font-size: 0.75rem;
    padding: 6px 2px;
  }

  .responsive-table :deep(.v-data-table__td) {
    padding: 12px 2px;
  }

  .service-name {
    font-size: 0.8rem;
  }

  .price-row {
    font-size: 0.7rem;
  }

  .percentage-value {
    font-size: 0.85rem;
  }
}
</style>
