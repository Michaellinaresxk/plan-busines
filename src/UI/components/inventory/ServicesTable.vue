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
        :prepend-icon="$vuetify.display.smAndUp ? 'mdi-plus' : undefined"
        :icon="$vuetify.display.xs ? 'mdi-plus' : undefined"
        @click="$emit('create-service')">
        <span v-if="$vuetify.display.smAndUp">Nuevo</span>
      </v-btn>
      <v-btn
        variant="outlined"
        icon="mdi-refresh"
        @click="$emit('refresh')"
        :loading="loading">
      </v-btn>
    </div>

    <!-- Desktop: Tabla Normal -->
    <div v-if="$vuetify.display.mdAndUp" class="table-wrapper">
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

        <!-- Variantes Column -->
        <template #item.variants="{ item }">
          <div class="variants-cell">
            <ServiceVariantSelector
              :service="item"
              @variant-changed="handleVariantChange" />
          </div>
        </template>

        <!-- Precio Base Column -->
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
          </div>
        </template>

        <!-- Taxes Column -->
        <template #item.taxes="{ item }">
          <div class="taxes-cell">
            <div class="percentage-value">{{ getTaxPercentage(item) }}%</div>
            <div class="amount-value">${{ formatPrice(getServiceTaxes(item)) }}</div>
          </div>
        </template>

        <!-- Ganancia Column -->
        <template #item.profit="{ item }">
          <div class="profit-cell">
            <div class="percentage-value profit-color">{{ getProfitPercentage(item) }}%</div>
            <div class="amount-value profit-color">${{ formatPrice(getServiceProfit(item)) }} US</div>
          </div>
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <div class="actions-cell">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props"></v-btn>
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
            <v-btn v-if="!searchQuery" color="primary" prepend-icon="mdi-plus" @click="$emit('create-service')">
              Crear Servicio
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Mobile: Cards -->
    <div v-else class="mobile-view">
      <v-progress-circular
        v-if="loading"
        indeterminate
        color="primary"
        size="32"
        class="mx-auto my-8">
      </v-progress-circular>

      <div v-else-if="filteredServices.length === 0" class="empty-state">
        <v-icon icon="mdi-package-variant-closed" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
        <h3 class="mb-2">No hay servicios</h3>
        <p class="mb-4">{{ searchQuery ? 'No se encontraron resultados' : 'Crea tu primer servicio' }}</p>
        <v-btn v-if="!searchQuery" color="primary" prepend-icon="mdi-plus" @click="$emit('create-service')">
          Crear Servicio
        </v-btn>
      </div>

      <!-- Lista de Cards para Mobile -->
      <div v-else class="mobile-cards">
        <v-card
          v-for="service in filteredServices"
          :key="service.id"
          class="mobile-service-card"
          elevation="2">

          <!-- ========== LÍNEA 1: SERVICIO + VARIANTES ========== -->
          <div class="mobile-section mobile-section-1">
            <!-- Información del Servicio -->
            <div class="service-info-container">
              <v-avatar
                :color="getServiceColor(service)"
                size="40"
                class="service-avatar-mobile">
                <v-icon
                  :icon="getServiceIcon(service)"
                  color="white"
                  size="20">
                </v-icon>
              </v-avatar>
              <div class="service-text-info">
                <h4 class="service-title-mobile">{{ service.title }}</h4>
                <p class="service-category-mobile">{{ getServiceCategory(service) }}</p>
              </div>
            </div>

            <!-- Selector de Variantes -->
            <div class="variants-container">
              <ServiceVariantSelector
                :service="service"
                is-mobile
                @variant-changed="handleVariantChange" />
            </div>
          </div>

          <!-- Divider -->
          <v-divider class="section-divider"></v-divider>

          <!-- ========== LÍNEA 2: PROVEEDOR + CLIENTE + ACCIONES ========== -->
          <div class="mobile-section mobile-section-2">
            <!-- Contenedor de Precios Principales -->
            <div class="main-prices-container">
              <!-- Precio Proveedor -->
              <div class="price-item-mobile">
                <div class="price-label-container">
                  <span class="price-emoji">💸</span>
                  <span class="price-label-text">Proveedor</span>
                </div>
                <div class="price-value-mobile provider-color">
                  ${{ formatPrice(getProviderPrice(service)) }}
                </div>
              </div>

              <!-- Precio Cliente -->
              <div class="price-item-mobile">
                <div class="price-label-container">
                  <span class="price-emoji">💳</span>
                  <span class="price-label-text">Cliente</span>
                </div>
                <div class="price-value-mobile client-color">
                  ${{ formatPrice(getClientPrice(service)) }}
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div class="actions-container">
              <v-menu location="bottom end">
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                    v-bind="props"
                    class="actions-btn">
                  </v-btn>
                </template>
                <v-list density="compact" min-width="120">
                  <v-list-item @click="editService(service)">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-pencil" size="16"></v-icon>
                    </template>
                    <v-list-item-title>Editar</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="duplicateService(service)">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-content-copy" size="16"></v-icon>
                    </template>
                    <v-list-item-title>Duplicar</v-list-item-title>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item @click="deleteService(service)" class="text-error">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-delete" size="16" color="error"></v-icon>
                    </template>
                    <v-list-item-title>Eliminar</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <!-- ========== LÍNEA 3: TAXES + GANANCIAS ========== -->
          <div class="mobile-section mobile-section-3">
            <div class="secondary-prices-container">
              <!-- Taxes -->
              <div class="price-item-mobile">
                <div class="price-label-container">
                  <span class="price-emoji">📊</span>
                  <span class="price-label-text">Taxes</span>
                </div>
                <div class="price-details-mobile">
                  <div class="price-percentage taxes-color">
                    {{ getTaxPercentage(service) }}%
                  </div>
                  <div class="price-amount-mobile">
                    ${{ formatPrice(getServiceTaxes(service)) }}
                  </div>
                </div>
              </div>

              <!-- Ganancias -->
              <div class="price-item-mobile">
                <div class="price-label-container">
                  <span class="price-emoji">📈</span>
                  <span class="price-label-text">Ganancia</span>
                </div>
                <div class="price-details-mobile">
                  <div class="price-percentage profit-color">
                    {{ getProfitPercentage(service) }}%
                  </div>
                  <div class="price-amount-mobile">
                    ${{ formatPrice(getServiceProfit(service)) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </v-card>
      </div>
    </div>
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
const selectedVariants = ref<Record<string, any>>({});
const isDev = process.env.NODE_ENV === 'development';

// Headers de la tabla (desktop)
const tableHeaders = [
  { title: 'Servicio', key: 'service', sortable: true, width: '30%' },
  { title: 'Variantes', key: 'variants', sortable: false, width: '25%' },
  { title: 'Precio Base', key: 'priceBase', sortable: false, width: '25%' },
  { title: 'Taxes', key: 'taxes', sortable: true, width: '10%' },
  { title: 'Ganancia', key: 'profit', sortable: true, width: '8%' },
  { title: '', key: 'actions', sortable: false, width: '2%' }
];

const filteredServices = computed(() => {
  if (!searchQuery.value) return props.services;
  const query = searchQuery.value.toLowerCase();
  return props.services.filter(service =>
    service.title.toLowerCase().includes(query) ||
    service.category.toLowerCase().includes(query)
  );
});

// Helper function mejorada - Obtener datos de servicio con variante
function getServiceData(service: ServiceView) {
  const selectedVariant = selectedVariants.value[service.id];
  if (!selectedVariant) return service;

  const serviceData = { ...service };
  if (selectedVariant.fieldKey !== 'base') {
    serviceData[selectedVariant.fieldKey] = selectedVariant.optionValue;
  }
  return serviceData;
}

// Helper functions - actualizados para usar variantes seleccionadas
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

// Funciones de precio actualizadas - usar variante seleccionada
function getProviderPrice(service: ServiceView): number {
  const selectedVariant = selectedVariants.value[service.id];

  if (selectedVariant?.calculation) {
    return selectedVariant.calculation.subtotal;
  }

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

  try {
    const serviceData = getServiceData(service);
    const calculation = calculateServicePrice(service.category, serviceData);
    return calculation.clientPays;
  } catch {
    const subtotal = getProviderPrice(service) + getServiceProfit(service);
    return subtotal + getServiceTaxes(service);
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

// Event handler mejorado - manejar cambios de variante
function handleVariantChange(serviceId: string, variantData: any) {
  console.log('🚀 ServicesTable: Variant changed for service:', serviceId, variantData);
  selectedVariants.value[serviceId] = variantData;
  console.log('📊 Updated selected variants:', selectedVariants.value);
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
/* ========================================
   ESTILOS GENERALES
======================================== */
.services-table-container {
  width: 100%;
  padding: 16px;
}

/* ========================================
   SEARCH BAR
======================================== */
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.search-field {
  flex: 1;
  max-width: 400px;
}

/* ========================================
   DESKTOP TABLE - ESTILOS EXISTENTES
======================================== */
.table-wrapper {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

/* Price Base Cell */
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

/* ========================================
   MOBILE LAYOUT - PERFECTAMENTE ORGANIZADO
======================================== */
.mobile-view {
  width: 100%;
}

.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-service-card {
  padding: 20px;
  border-radius: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* ========== SECCIONES MÓVILES ========== */
.mobile-section {
  display: flex;
  width: 100%;
  min-height: 48px;
}

.mobile-section-1 {
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.mobile-section-2 {
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.mobile-section-3 {
  align-items: center;
  justify-content: flex-start;
}

/* ========== DIVIDER ========== */
.section-divider {
  margin: 12px 0;
  border-color: #e5e7eb;
}

/* ========== LÍNEA 1: SERVICIO + VARIANTES ========== */
.service-info-container {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.service-avatar-mobile {
  flex-shrink: 0;
}

.service-text-info {
  flex: 1;
  min-width: 0;
}

.service-title-mobile {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.3;
  word-wrap: break-word;
}

.service-category-mobile {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.2;
}

.variants-container {
  flex-shrink: 0;
  min-width: 180px;
  max-width: 220px;
}

/* ========== LÍNEA 2: PROVEEDOR + CLIENTE + ACCIONES ========== */
.main-prices-container {
  display: flex;
  gap: 24px;
  flex: 1;
  align-items: center;
}

.actions-container {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.actions-btn {
  border-radius: 8px;
}

/* ========== LÍNEA 3: TAXES + GANANCIAS ========== */
.secondary-prices-container {
  display: flex;
  gap: 24px;
  width: 100%;
  align-items: center;
}

/* ========== ELEMENTOS DE PRECIO MÓVIL ========== */
.price-item-mobile {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
  align-items: flex-start;
}

.price-label-container {
  display: flex;
  align-items: center;
  gap: 6px;
}

.price-emoji {
  font-size: 1rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.price-label-text {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
}

.price-value-mobile {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
}

.price-details-mobile {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
}

.price-percentage {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.2;
}

.price-amount-mobile {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
  line-height: 1.2;
}

/* ========== COLORES ========== */
.provider-color {
  color: #dc2626;
}

.client-color {
  color: #2563eb;
}

.taxes-color {
  color: #f59e0b;
}

.profit-color {
  color: #16a34a;
}

/* ========================================
   RESPONSIVE BREAKPOINTS
======================================== */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .search-field {
    max-width: none;
  }
}

@media (max-width: 600px) {
  .services-table-container {
    padding: 12px;
  }

  .mobile-cards {
    gap: 12px;
  }

  .mobile-service-card {
    padding: 16px;
  }

  .mobile-section-1 {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 10px;
  }

  .variants-container {
    min-width: auto;
    max-width: none;
  }

  .main-prices-container {
    gap: 16px;
  }

  .secondary-prices-container {
    gap: 16px;
  }

  .service-title-mobile {
    font-size: 0.95rem;
  }

  .service-category-mobile {
    font-size: 0.8rem;
  }

  .price-value-mobile {
    font-size: 0.9rem;
  }

  .price-percentage {
    font-size: 0.85rem;
  }

  .price-label-text {
    font-size: 0.75rem;
  }

  .price-amount-mobile {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .mobile-service-card {
    padding: 14px;
  }

  .service-info-container {
    gap: 10px;
  }

  .main-prices-container {
    gap: 12px;
  }

  .secondary-prices-container {
    gap: 12px;
  }

  .service-title-mobile {
    font-size: 0.9rem;
  }

  .price-value-mobile {
    font-size: 0.85rem;
  }

  .price-percentage {
    font-size: 0.8rem;
  }
}
</style>
