<template>
  <div class="service-details-view">
    <!-- Service Header -->
    <div class="service-header mb-6">
      <div class="d-flex align-center mb-4">
        <v-avatar :color="serviceConfig?.color || '#6366F1'" size="48" class="mr-4">
          <v-icon :icon="serviceConfig?.icon || 'mdi-cog'" color="white" size="24"></v-icon>
        </v-avatar>
        <div>
          <h2 class="text-h5 font-weight-bold">{{ service.title }}</h2>
          <p class="text-body-1 text-medium-emphasis">{{ serviceConfig?.name || service.serviceType }}</p>
        </div>
      </div>

      <v-chip
        :color="service.isActive ? 'success' : 'error'"
        size="small"
        variant="tonal"
        class="mb-3">
        {{ service.isActive ? 'Servicio Activo' : 'Servicio Inactivo' }}
      </v-chip>

      <p v-if="service.description" class="text-body-1">{{ service.description }}</p>
    </div>

    <!-- Service Specifics -->
    <div class="service-specifics-section mb-6">
      <h3 class="section-title mb-4">
        <v-icon :icon="serviceConfig?.icon || 'mdi-cog'" class="mr-2" :color="serviceConfig?.color"></v-icon>
        Detalles Específicos
      </h3>

      <v-card variant="outlined" rounded="lg">
        <v-card-text class="pa-4">
          <v-row>
            <!-- Dynamic service-specific details -->
            <v-col cols="12" md="6">
              <ServiceSpecificsRenderer :service="service" />
            </v-col>

            <!-- Additional service info -->
            <v-col cols="12" md="6">
              <div class="service-info-grid">
                <div class="info-item">
                  <span class="info-label">Categoría:</span>
                  <span class="info-value">{{ getCategoryDisplayName(service.category) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Precio Base:</span>
                  <span class="info-value">${{ formatPrice(service.basePrice) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Última Actualización:</span>
                  <span class="info-value">{{ formatDate(service.updatedAt) }}</span>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Price Breakdown -->
    <div class="price-breakdown-section mb-6">
      <h3 class="section-title mb-4">
        <v-icon icon="mdi-calculator" class="mr-2" color="success"></v-icon>
        Desglose de Precios
      </h3>

      <v-card variant="outlined" rounded="lg">
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="6" md="3">
              <div class="price-breakdown-item">
                <div class="price-icon">
                  <v-icon icon="mdi-cash" color="primary" size="20"></v-icon>
                </div>
                <div class="price-info">
                  <span class="price-label">Precio Base</span>
                  <span class="price-value primary">${{ formatPrice(service.basePrice) }}</span>
                </div>
              </div>
            </v-col>

            <v-col cols="6" md="3">
              <div class="price-breakdown-item">
                <div class="price-icon">
                  <v-icon icon="mdi-trending-up" color="success" size="20"></v-icon>
                </div>
                <div class="price-info">
                  <span class="price-label">Ganancia</span>
                  <span class="price-value success">${{ formatPrice(service.profit) }}</span>
                </div>
              </div>
            </v-col>

            <v-col cols="6" md="3">
              <div class="price-breakdown-item">
                <div class="price-icon">
                  <v-icon icon="mdi-percent" color="warning" size="20"></v-icon>
                </div>
                <div class="price-info">
                  <span class="price-label">Taxes</span>
                  <span class="price-value warning">${{ formatPrice(service.taxes) }}</span>
                </div>
              </div>
            </v-col>

            <v-col cols="6" md="3">
              <div class="price-breakdown-item final-price">
                <div class="price-icon">
                  <v-icon icon="mdi-cash-multiple" :color="serviceConfig?.color || 'primary'" size="20"></v-icon>
                </div>
                <div class="price-info">
                  <span class="price-label">Precio Final</span>
                  <span class="price-value final">${{ formatPrice(service.finalPrice) }}</span>
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Profit Margin -->
          <v-divider class="my-4"></v-divider>

          <div class="d-flex justify-space-between align-center">
            <span class="text-subtitle-1 font-weight-medium">Margen de Ganancia:</span>
            <v-chip
              :color="getProfitMarginColor(profitMargin)"
              size="large"
              variant="tonal">
              {{ profitMargin }}%
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Service Configuration -->
    <div v-if="serviceConfig" class="service-config-section">
      <h3 class="section-title mb-4">
        <v-icon icon="mdi-cog" class="mr-2" color="info"></v-icon>
        Configuración del Servicio
      </h3>

      <v-card variant="outlined" rounded="lg">
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" md="4">
              <div class="config-item">
                <span class="config-label">Taxes Base:</span>
                <span class="config-value">{{ Math.round(serviceConfig.baseTaxes * 100) }}%</span>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="config-item">
                <span class="config-label">Ganancia Base:</span>
                <span class="config-value">{{ Math.round(serviceConfig.baseProfit * 100) }}%</span>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="config-item">
                <span class="config-label">Tipo de Cálculo:</span>
                <span class="config-value">{{ getPriceCalculationType(serviceConfig.priceCalculation) }}</span>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getServiceConfig } from '@/config/simpleServiceConfig';
import ServiceSpecificsRenderer from './ServiceSpecificsRenderer.vue';

interface Props {
  service: {
    title: string;
    serviceType: string;
    category: string;
    basePrice: number;
    finalPrice: number;
    profit: number;
    taxes: number;
    isActive: boolean;
    updatedAt: Date;
    description?: string;
    [key: string]: any;
  };
}

const props = defineProps<Props>();

// Service configuration
const serviceConfig = computed(() => {
  return getServiceConfig(props.service.serviceType);
});

// Profit margin calculation
const profitMargin = computed(() => {
  if (props.service.finalPrice === 0) return 0;
  return Math.round((props.service.profit / props.service.finalPrice) * 100);
});

// Helper functions
function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getCategoryDisplayName(category: string): string {
  const categoryNames: Record<string, string> = {
    'wellness': 'Bienestar',
    'adventure': 'Aventura',
    'transport': 'Transporte',
    'tours': 'Tours',
    'luxury': 'Lujo',
    'entertainment': 'Entretenimiento',
    'services': 'Servicios'
  };
  return categoryNames[category] || category;
}

function getProfitMarginColor(margin: number): string {
  if (margin >= 40) return 'success';
  if (margin >= 25) return 'warning';
  return 'error';
}

function getPriceCalculationType(type?: string): string {
  const types: Record<string, string> = {
    'simple': 'Simple',
    'complex': 'Complejo',
    'age-based': 'Por Edad',
    'round-trip': 'Ida y Vuelta'
  };
  return types[type || 'simple'] || 'Simple';
}
</script>

<style scoped>
.service-details-view {
  max-height: 80vh;
  overflow-y: auto;
}

.service-header {
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.service-info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
}

.info-value {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.price-breakdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.price-breakdown-item.final-price {
  background: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.price-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(var(--v-theme-surface), 0.8);
  border-radius: 50%;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price-value {
  font-size: 1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.price-value.primary {
  color: rgb(var(--v-theme-primary));
}

.price-value.success {
  color: rgb(var(--v-theme-success));
}

.price-value.warning {
  color: rgb(var(--v-theme-warning));
}

.price-value.final {
  font-size: 1.1rem;
  color: rgb(var(--v-theme-primary));
}

.config-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px;
}

.config-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
  margin-bottom: 4px;
}

.config-value {
  font-size: 1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

@media (max-width: 768px) {
  .price-breakdown-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .config-item {
    margin-bottom: 16px;
  }
}
</style>
