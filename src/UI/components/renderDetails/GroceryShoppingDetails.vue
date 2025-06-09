<template>
  <div class="grocery-shopping-details">
    <div class="summary-header">
      <div class="summary-stats">
        <div class="stat-card">
          <v-icon icon="mdi-cart" color="success" size="24"></v-icon>
          <div class="stat-content">
            <span class="stat-number">{{ totalItems }}</span>
            <span class="stat-label">Artículos seleccionados</span>
          </div>
        </div>

        <div class="stat-card">
          <v-icon icon="mdi-calendar-clock" color="info" size="24"></v-icon>
          <div class="stat-content">
            <span class="stat-text">{{ deliveryDateTime }}</span>
            <span class="stat-label">Fecha de entrega</span>
          </div>
        </div>

        <div class="stat-card">
          <v-icon icon="mdi-map-marker" color="error" size="24"></v-icon>
          <div class="stat-content">
            <span class="stat-text">{{ deliveryLocation }}</span>
            <span class="stat-label">Lugar de entrega</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Shopping List by Categories -->
    <div class="shopping-list-section">
      <h3 class="section-title">
        <v-icon icon="mdi-format-list-bulleted" class="mr-2"></v-icon>
        Lista de Compras Seleccionada
      </h3>

      <!-- If we have categorized items from the form -->
      <div v-if="hasCategorizedItems" class="categories-container">
        <div
          v-for="(categoryData, categoryName) in categorizedItems"
          :key="categoryName"
          class="category-group"
        >
          <div class="category-header">
            <div class="category-title">
              <v-icon
                :icon="getCategoryIcon(categoryName)"
                :color="getCategoryColor(categoryName)"
                size="20"
                class="mr-2"
              ></v-icon>
              <h4>{{ getCategoryDisplayName(categoryName) }}</h4>
            </div>
            <v-chip
              :color="getCategoryColor(categoryName)"
              size="small"
              variant="outlined"
            >
              {{ getTotalItemsInCategory(categoryData) }}
            </v-chip>
          </div>

          <div class="items-list">
            <!-- Handle subcategories if they exist -->
            <div
              v-for="(items, subcategoryName) in categoryData.subcategories || { general: categoryData }"
              :key="subcategoryName"
              class="subcategory-section"
            >
              <div v-if="subcategoryName !== 'general'" class="subcategory-title">
                <span>{{ subcategoryName }}</span>
              </div>

              <div
                v-for="(item, index) in (Array.isArray(items) ? items : [])"
                :key="`${categoryName}-${subcategoryName}-${index}`"
                class="grocery-item"
              >
                <div class="item-icon">
                  <v-icon icon="mdi-circle-small" :color="getCategoryColor(categoryName)" size="16"></v-icon>
                </div>
                <div class="item-main-info">
                  <span class="item-name">{{ getItemDisplayName(item) }}</span>
                  <div class="item-metadata" v-if="hasItemMetadata(item)">
                    <span v-if="item.quantity" class="quantity-badge">
                      {{ item.quantity }}{{ item.unit ? ` ${item.unit}` : '' }}
                    </span>
                    <span v-if="item.brand" class="brand-badge">{{ item.brand }}</span>
                    <span v-if="item.size" class="size-badge">{{ item.size }}</span>
                  </div>
                </div>

                <div class="item-price" v-if="item.estimatedPrice || item.price">
                  ${{ item.estimatedPrice || item.price }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- If items are just a simple array (fallback) -->
      <div v-else-if="hasSimpleItems" class="simple-items-list">
        <div
          v-for="(item, index) in simpleItems"
          :key="index"
          class="simple-grocery-item"
        >
          <div class="simple-item-content">
            <v-icon icon="mdi-circle-small" color="primary" size="16" class="mr-2"></v-icon>
            <span class="simple-item-name">{{ typeof item === 'string' ? item : getItemDisplayName(item) }}</span>
          </div>
        </div>
      </div>

      <!-- No items selected message -->
      <div v-else class="no-items-message">
        <v-icon icon="mdi-information" color="info" size="20" class="mr-2"></v-icon>
        <span>No se seleccionaron artículos específicos</span>
      </div>
    </div>

    <!-- Delivery Information -->
    <div class="delivery-section">
      <h3 class="section-title">
        <v-icon icon="mdi-truck-delivery" class="mr-2"></v-icon>
        Información de Entrega
      </h3>

      <div class="delivery-grid">
        <div v-if="formData.date" class="delivery-item">
          <v-icon icon="mdi-calendar" color="info" size="20"></v-icon>
          <div class="delivery-content">
            <span class="delivery-label">Fecha de entrega</span>
            <span class="delivery-value">{{ formatDeliveryDate(formData.date) }}</span>
          </div>
        </div>

        <div v-if="formData.hour" class="delivery-item">
          <v-icon icon="mdi-clock" color="info" size="20"></v-icon>
          <div class="delivery-content">
            <span class="delivery-label">Hora de entrega</span>
            <span class="delivery-value">{{ formData.hour }}</span>
          </div>
        </div>

        <div v-if="formData.deliveryAddress" class="delivery-item">
          <v-icon icon="mdi-map-marker" color="error" size="20"></v-icon>
          <div class="delivery-content">
            <span class="delivery-label">Dirección</span>
            <span class="delivery-value">{{ formData.deliveryAddress }}</span>
          </div>
        </div>

        <div v-if="formData.exactAddress" class="delivery-item full-width">
          <v-icon icon="mdi-map-marker-radius" color="error" size="20"></v-icon>
          <div class="delivery-content">
            <span class="delivery-label">Instrucciones de entrega</span>
            <span class="delivery-value">{{ formData.exactAddress }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dietary Information -->
    <div v-if="hasDietaryInfo" class="dietary-section">
      <h3 class="section-title">
        <v-icon icon="mdi-food-apple" class="mr-2"></v-icon>
        Información Dietética
      </h3>

      <div class="dietary-content">
        <!-- Allergies -->
        <div v-if="formData.hasAllergies === 'yes'" class="dietary-alert">
          <div class="alert-header">
            <v-icon icon="mdi-alert-circle" color="error" size="20" class="mr-2"></v-icon>
            <span class="alert-title">Alergias Alimentarias</span>
          </div>
          <div class="alert-content">
            {{ formData.allergyDetails || 'Se indicaron alergias pero sin detalles específicos' }}
          </div>
        </div>

        <!-- Food Restrictions -->
        <div v-if="formData.foodRestrictions" class="dietary-info">
          <div class="info-header">
            <v-icon icon="mdi-leaf" color="success" size="20" class="mr-2"></v-icon>
            <span class="info-title">Restricciones Dietéticas</span>
          </div>
          <div class="info-content">
            {{ formData.foodRestrictions }}
          </div>
        </div>

        <!-- Special Requests -->
        <div v-if="formData.specialRequests" class="dietary-info">
          <div class="info-header">
            <v-icon icon="mdi-star" color="warning" size="20" class="mr-2"></v-icon>
            <span class="info-title">Solicitudes Especiales</span>
          </div>
          <div class="info-content">
            {{ formData.specialRequests }}
          </div>
        </div>
      </div>
    </div>

    <!-- Pricing Information -->
    <div v-if="hasPricingInfo" class="pricing-section">
      <h3 class="section-title">
        <v-icon icon="mdi-calculator" class="mr-2"></v-icon>
        Información de Precios
      </h3>

      <div class="pricing-breakdown">
        <div class="pricing-row" v-if="baseServicePrice">
          <span class="pricing-label">Tarifa base del servicio:</span>
          <span class="pricing-value">${{ baseServicePrice }}</span>
        </div>

        <div class="pricing-row" v-if="estimatedItemsCost">
          <span class="pricing-label">Costo estimado de artículos:</span>
          <span class="pricing-value">${{ estimatedItemsCost }}</span>
        </div>

        <div class="pricing-row total-row" v-if="reservation.totalPrice">
          <span class="pricing-label">Total estimado:</span>
          <span class="pricing-value total">${{ reservation.totalPrice }}</span>
        </div>

        <div class="pricing-note">
          <v-icon icon="mdi-information" color="info" size="16" class="mr-2"></v-icon>
          <span>El precio final se calculará basado en los precios reales del mercado</span>
        </div>
      </div>
    </div>

    <!-- Debug Information (Development only) -->
    <div v-if="showDebugInfo" class="debug-section">
      <v-expansion-panels variant="accordion">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon icon="mdi-bug" class="mr-2"></v-icon>
            Información de Debug (Desarrollo)
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="debug-content">
              <h4>Form Data:</h4>
              <pre>{{ JSON.stringify(formData, null, 2) }}</pre>

              <h4 class="mt-4">Categorized Items:</h4>
              <pre>{{ JSON.stringify(categorizedItems, null, 2) }}</pre>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface GroceryItem {
  id?: string
  name?: string
  translationKey?: string
  category?: string
  subcategory?: string
  quantity?: string | number
  unit?: string
  brand?: string
  size?: string
  estimatedPrice?: number
  price?: number
}

interface CategoryData {
  category: string
  subcategories: Record<string, GroceryItem[]>
}

interface Props {
  reservation: {
    formData?: {
      // Form fields from GroceryForm.tsx
      date?: string
      hour?: string
      deliveryAddress?: string
      exactAddress?: string
      items?: GroceryItem[]
      hasAllergies?: 'yes' | 'no'
      allergyDetails?: string
      foodRestrictions?: string
      specialRequests?: string

      // Additional possible fields
      categorizedItems?: Record<string, CategoryData>
      itemCount?: number
      serviceType?: string

      // Alternative naming conventions
      groceryItems?: GroceryItem[]
      selectedItems?: string[]
    }
    totalPrice?: number
    serviceName?: string
    [key: string]: any
  }
}

const props = defineProps<Props>()

// Show debug info only in development
const showDebugInfo = computed(() => {
  return process.env.NODE_ENV === 'development'
})

const formData = computed(() => props.reservation.formData || {})

// Extract items from different possible sources
const items = computed((): GroceryItem[] => {
  return formData.value.items ||
         formData.value.groceryItems ||
         []
})

const totalItems = computed(() => {
  if (formData.value.itemCount) return formData.value.itemCount
  return items.value.length
})

// Delivery information
const deliveryDateTime = computed(() => {
  if (formData.value.date && formData.value.hour) {
    return `${formatDeliveryDate(formData.value.date)} a las ${formData.value.hour}`
  } else if (formData.value.date) {
    return formatDeliveryDate(formData.value.date)
  } else if (formData.value.hour) {
    return `Hoy a las ${formData.value.hour}`
  }
  return 'No especificado'
})

const deliveryLocation = computed(() => {
  return formData.value.deliveryAddress || 'No especificado'
})

// Check for categorized items
const hasCategorizedItems = computed(() => {
  return formData.value.categorizedItems &&
         Object.keys(formData.value.categorizedItems).length > 0
})

const categorizedItems = computed(() => {
  return formData.value.categorizedItems || {}
})

// Simple items fallback
const hasSimpleItems = computed(() => {
  return !hasCategorizedItems.value && items.value.length > 0
})

const simpleItems = computed(() => {
  return items.value
})

// Dietary information
const hasDietaryInfo = computed(() => {
  return formData.value.hasAllergies === 'yes' ||
         formData.value.foodRestrictions ||
         formData.value.specialRequests
})

// Pricing information
const hasPricingInfo = computed(() => {
  return props.reservation.totalPrice || baseServicePrice.value || estimatedItemsCost.value
})

const baseServicePrice = computed(() => {
  // This could come from the service configuration
  return 25 // Base service fee
})

const estimatedItemsCost = computed(() => {
  if (props.reservation.totalPrice && baseServicePrice.value) {
    return props.reservation.totalPrice - baseServicePrice.value
  }
  return totalItems.value * 5 // $5 average per item
})

// Helper functions
function formatDeliveryDate(dateString: string): string {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Hoy'
    if (date.toDateString() === tomorrow.toDateString()) return 'Mañana'

    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    })
  } catch (error) {
    return dateString
  }
}

function getItemDisplayName(item: GroceryItem | string): string {
  if (typeof item === 'string') return item

  return item.name ||
         (item.translationKey ? `[${item.translationKey}]` : '') ||
         item.id ||
         'Artículo sin nombre'
}

function hasItemMetadata(item: GroceryItem): boolean {
  return !!(item.quantity || item.brand || item.size)
}

function getTotalItemsInCategory(categoryData: CategoryData | GroceryItem[]): number {
  if (Array.isArray(categoryData)) {
    return categoryData.length
  }

  if (categoryData.subcategories) {
    return Object.values(categoryData.subcategories)
      .reduce((total, items) => total + items.length, 0)
  }

  return 0
}

// Category helpers
const categoryConfig = {
  'produce': { icon: 'mdi-apple', color: 'success', name: 'Frutas y Verduras' },
  'bakery': { icon: 'mdi-bread-slice', color: 'warning', name: 'Panadería' },
  'meat': { icon: 'mdi-food-steak', color: 'error', name: 'Carnes y Mariscos' },
  'dairy': { icon: 'mdi-cow', color: 'info', name: 'Lácteos y Huevos' },
  'pantry': { icon: 'mdi-package-variant', color: 'brown', name: 'Despensa' },
  'snacks': { icon: 'mdi-cookie', color: 'orange', name: 'Snacks' },
  'beverages': { icon: 'mdi-bottle-soda', color: 'blue', name: 'Bebidas' },
  'organic': { icon: 'mdi-leaf', color: 'green', name: 'Orgánicos' },
  'gourmet': { icon: 'mdi-star', color: 'purple', name: 'Gourmet' },
  'spirits': { icon: 'mdi-glass-wine', color: 'deep-purple', name: 'Vinos y Licores' },
  'default': { icon: 'mdi-package', color: 'grey', name: 'Otros' }
}

function getCategoryIcon(categoryName: string): string {
  const key = categoryName.toLowerCase()
  return categoryConfig[key as keyof typeof categoryConfig]?.icon || categoryConfig.default.icon
}

function getCategoryColor(categoryName: string): string {
  const key = categoryName.toLowerCase()
  return categoryConfig[key as keyof typeof categoryConfig]?.color || categoryConfig.default.color
}

function getCategoryDisplayName(categoryName: string): string {
  const key = categoryName.toLowerCase()
  return categoryConfig[key as keyof typeof categoryConfig]?.name || categoryName
}
</script>

<style scoped>
.grocery-shopping-details {
  max-width: 100%;
}

/* Summary Header */
.summary-header {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(56, 142, 60, 0.05));
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
  line-height: 1;
}

.stat-text {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
  line-height: 1.2;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 2px;
}

/* Section Titles */
.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.1);
}

/* Shopping List */
.shopping-list-section {
  margin-bottom: 32px;
}

.categories-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-group {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.category-title {
  display: flex;
  align-items: center;
}

.category-title h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
  margin: 0;
}

.subcategory-section {
  margin-bottom: 16px;
}

.subcategory-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-bottom: 8px;
  padding-left: 8px;
  border-left: 3px solid rgba(var(--v-theme-primary), 0.3);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grocery-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.item-icon {
  flex-shrink: 0;
}

.item-main-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
  font-size: 0.95rem;
  display: block;
}

.item-metadata {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.quantity-badge,
.brand-badge,
.size-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.quantity-badge {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

.brand-badge {
  background: rgba(var(--v-theme-secondary), 0.1);
  color: rgb(var(--v-theme-secondary));
}

.size-badge {
  background: rgba(var(--v-theme-info), 0.1);
  color: rgb(var(--v-theme-info));
}

.item-price {
  font-weight: 700;
  color: rgb(var(--v-theme-success));
  font-size: 0.9rem;
  flex-shrink: 0;
}

/* Simple Items List */
.simple-items-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
}

.simple-grocery-item {
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.simple-item-content {
  display: flex;
  align-items: center;
}

.simple-item-name {
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

/* No Items Message */
.no-items-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: rgba(var(--v-theme-info), 0.05);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-info), 0.2);
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* Delivery Section */
.delivery-section {
  margin-bottom: 32px;
}

.delivery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.delivery-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(var(--v-theme-info), 0.05);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-info), 0.2);
}

.delivery-item.full-width {
  grid-column: 1 / -1;
}

.delivery-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.delivery-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 4px;
}

.delivery-value {
  font-size: 0.95rem;
  color: rgba(var(--v-theme-on-surface), 0.9);
  word-break: break-word;
}

/* Dietary Section */
.dietary-section {
  margin-bottom: 32px;
}

.dietary-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dietary-alert {
  background: rgba(var(--v-theme-error), 0.05);
  border: 1px solid rgba(var(--v-theme-error), 0.2);
  border-radius: 12px;
  padding: 16px;
}

.dietary-info {
  background: rgba(var(--v-theme-success), 0.05);
  border: 1px solid rgba(var(--v-theme-success), 0.2);
  border-radius: 12px;
  padding: 16px;
}

.alert-header,
.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.alert-title,
.info-title {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.alert-content,
.info-content {
  color: rgba(var(--v-theme-on-surface), 0.7);
  line-height: 1.5;
}

/* Pricing Section */
.pricing-section {
  margin-bottom: 32px;
}

.pricing-breakdown {
  background: rgba(var(--v-theme-warning), 0.05);
  border: 1px solid rgba(var(--v-theme-warning), 0.2);
  border-radius: 12px;
  padding: 20px;
}

.pricing-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
}

.pricing-row:not(:last-child) {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.pricing-row.total-row {
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 2px solid rgba(var(--v-theme-warning), 0.3);
}

.pricing-label {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.pricing-value {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.pricing-value.total {
  color: rgb(var(--v-theme-warning));
  font-size: 1.2rem;
}

.pricing-note {
  display: flex;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.1);
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* Debug Section */
.debug-section {
  margin-top: 32px;
}

.debug-content {
  font-family: monospace;
  font-size: 0.8rem;
}

.debug-content pre {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}

.debug-content h4 {
  color: rgba(var(--v-theme-on-surface), 0.8);
  margin: 16px 0 8px 0;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .summary-stats {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-text {
    max-width: none;
    white-space: normal;
  }

  .delivery-grid {
    grid-template-columns: 1fr;
  }

  .delivery-item.full-width {
    grid-column: 1;
  }

  .grocery-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .item-metadata {
    flex-direction: column;
    gap: 4px;
  }

  .pricing-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .simple-items-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .summary-header {
    padding: 16px;
  }

  .category-group {
    padding: 16px;
  }

  .grocery-item {
    padding: 8px;
  }

  .section-title {
    font-size: 1.1rem;
  }
}

/* Dark Theme Support */
.v-theme--dark .stat-card {
  background: rgba(var(--v-theme-surface-variant), 0.4);
}

.v-theme--dark .category-group {
  background: rgba(var(--v-theme-surface-variant), 0.2);
}

.v-theme--dark .grocery-item {
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.v-theme--dark .simple-grocery-item {
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.v-theme--dark .delivery-item {
  background: rgba(var(--v-theme-info), 0.1);
}

.v-theme--dark .dietary-alert {
  background: rgba(var(--v-theme-error), 0.1);
}

.v-theme--dark .dietary-info {
  background: rgba(var(--v-theme-success), 0.1);
}

.v-theme--dark .pricing-breakdown {
  background: rgba(var(--v-theme-warning), 0.1);
}

/* Animation */
.grocery-shopping-details {
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Accessibility */
.grocery-item:focus-within,
.delivery-item:focus-within {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

/* Print Styles */
@media print {
  .debug-section {
    display: none;
  }

  .summary-header {
    background: white !important;
    border: 1px solid #ccc;
  }

  .stat-card {
    box-shadow: none;
    border: 1px solid #ddd;
  }

  .category-group,
  .delivery-item,
  .dietary-alert,
  .dietary-info,
  .pricing-breakdown {
    background: white !important;
    border: 1px solid #ddd;
  }
}
</style>
