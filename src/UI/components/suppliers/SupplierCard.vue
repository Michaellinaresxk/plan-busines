<!-- src/UI/components/cards/SupplierCard.vue -->
<template>
  <article class="supplier-card" :class="cardModifiers" @click="handleCardClick">
    <!-- Status Badges -->
    <div class="status-badges">
      <div v-if="isLuxeService" class="badge badge--luxe">
        <v-icon icon="mdi-crown" size="12" />
        <span>LUXE</span>
      </div>
      <div v-if="supplier.featured" class="badge badge--featured">
        <v-icon icon="mdi-star" size="12" />
      </div>
    </div>

    <!-- Card Header -->
    <header class="card-header">
      <div class="service-indicator" :style="{ backgroundColor: serviceColor }">
        <v-icon :icon="serviceIcon" size="20" color="white" />
      </div>

      <div class="header-content">
        <h3 class="supplier-name">{{ supplier.name }}</h3>
        <div class="service-meta">
          <span class="service-tag" :style="{ color: serviceColor }">
            {{ serviceDisplayName }}
          </span>
          <div v-if="supplier.rating" class="rating">
            <v-icon icon="mdi-star" size="14" color="currentColor" />
            <span>{{ supplier.rating }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Card Content -->
    <div class="card-content">
      <dl class="contact-list">
        <div class="contact-item">
          <dt class="contact-label">
            <v-icon icon="mdi-card-account-details-outline" size="16" color="primary" />
            Cédula
          </dt>
          <dd class="contact-value">{{ formatCedula(supplier.cedula) }}</dd>
        </div>

        <div class="contact-item">
          <dt class="contact-label">
            <v-icon icon="mdi-email-outline" size="16" color="primary" />
            Email
          </dt>
          <dd class="contact-value">{{ supplier.email }}</dd>
        </div>

        <div class="contact-item">
          <dt class="contact-label">
            <v-icon icon="mdi-phone-outline" size="16" color="primary" />
            Teléfono
          </dt>
          <dd class="contact-value">{{ formatPhone(supplier.phone) }}</dd>
        </div>

        <div v-if="showVehicleType" class="contact-item">
          <dt class="contact-label">
            <v-icon icon="mdi-car" size="16" />
            Vehículo
          </dt>
          <dd class="contact-value">{{ vehicleTypeLabel }}</dd>
        </div>
      </dl>

      <div v-if="supplier.address" class="address-info">
        <v-icon icon="mdi-map-marker-outline" size="16" />
        <span>{{ supplier.address }}</span>
      </div>
    </div>

    <!-- Actions -->
    <footer class="card-actions">
      <v-btn variant="text" size="small" :color="serviceColor" @click.stop="$emit('contact', supplier)"
        class="action-primary">
        <v-icon icon="mdi-phone" size="16" />
        Contactar
      </v-btn>

      <div class="secondary-actions">
        <v-btn variant="text" size="small" color="grey-darken-1" @click.stop="$emit('view', supplier)" icon="mdi-eye" />

        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn variant="text" size="small" color="grey-darken-1" icon="mdi-dots-vertical" v-bind="props"
              @click.stop />
          </template>

          <v-card class="menu-card" elevation="8">
            <v-list density="compact">
              <v-list-item prepend-icon="mdi-pencil" title="Editar" @click="$emit('edit', supplier)" />
              <v-list-item prepend-icon="mdi-star" :title="supplier.featured ? 'Quitar destacado' : 'Destacar'"
                @click="$emit('toggle-featured', supplier)" />
              <v-divider />
              <v-list-item prepend-icon="mdi-delete" title="Eliminar" class="text-error"
                @click="$emit('delete', supplier)" />
            </v-list>
          </v-card>
        </v-menu>
      </div>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Supplier } from '@/types/supplier';
import {
  getServiceColor,
  getServiceIcon,
  getServiceDisplayName,
  isAirportTransferService,
  getVehicleTypeLabel
} from '@/utils/supplier-helpers';
import { formatCedula, formatPhone, getInitials } from '@/utils/formatters';

interface Props {
  supplier: Supplier;
}

interface Emits {
  view: [supplier: Supplier];
  contact: [supplier: Supplier];
  edit: [supplier: Supplier];
  delete: [supplier: Supplier];
  'toggle-featured': [supplier: Supplier];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Computed Properties
const isLuxeService = computed(() =>
  props.supplier.service.includes('luxe') ||
  props.supplier.service.includes('private')
);

const serviceColor = computed(() => getServiceColor(props.supplier.service));
const serviceIcon = computed(() => getServiceIcon(props.supplier.service));
const serviceDisplayName = computed(() => getServiceDisplayName(props.supplier.service));

const showVehicleType = computed(() =>
  props.supplier.vehicleType &&
  isAirportTransferService(props.supplier.service)
);

const vehicleTypeLabel = computed(() =>
  props.supplier.vehicleType ? getVehicleTypeLabel(props.supplier.vehicleType) : ''
);

const cardModifiers = computed(() => ({
  'supplier-card--featured': props.supplier.featured,
  'supplier-card--luxe': isLuxeService.value,
  'supplier-card--premium': props.supplier.rating && props.supplier.rating >= 4.5
}));

// Methods
const handleCardClick = () => {
  emit('view', props.supplier);
};
</script>

<style scoped>
.supplier-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  border: 1px solid rgb(var(--v-theme-outline-variant));
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
  height: 100%;
}

.supplier-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-shadow), 0.12);
  border-color: rgb(var(--v-theme-primary));
}

.supplier-card--featured {
  border-color: rgb(var(--v-theme-warning));
  box-shadow: 0 0 0 1px rgba(var(--v-theme-warning), 0.2);
}

.supplier-card--featured:hover {
  box-shadow: 0 8px 24px rgba(var(--v-theme-warning), 0.2);
}

.supplier-card--luxe::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #d4af37, #ffd700);
}

/* Status Badges */
.status-badges {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 2;
}

.badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge--luxe {
  background: linear-gradient(135deg, #d4af37, #ffd700);
  color: white;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
}

.badge--featured {
  background: rgb(var(--v-theme-warning));
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  padding: 0;
  justify-content: center;
}

/* Header */
.card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.service-indicator {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.supplier-name {
  font-size: 18px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.service-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.service-tag {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgb(var(--v-theme-warning));
  font-size: 14px;
  font-weight: 500;
}

/* Content */
.card-content {
  flex: 1;
  padding: 16px 20px;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 0 16px 0;
}

.contact-item {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 12px;
  align-items: center;
}

.contact-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
}

.contact-value {
  font-size: 14px;
  font-weight: 400;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  word-break: break-word;
}

.address-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* Actions */
.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid rgb(var(--v-theme-outline-variant));
  background: rgb(var(--v-theme-surface-container-lowest));
}

.action-primary {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}

.secondary-actions {
  display: flex;
  gap: 4px;
}

.menu-card {
  min-width: 160px;
}

/* Responsive */
@media (max-width: 600px) {
  .card-header {
    padding: 16px 16px 12px;
  }

  .card-content {
    padding: 12px 16px;
  }

  .card-actions {
    padding: 12px 16px;
    flex-direction: column;
    gap: 8px;
  }

  .secondary-actions {
    align-self: stretch;
    justify-content: center;
  }

  .contact-item {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .supplier-name {
    font-size: 16px;
  }
}

/* Focus states for accessibility */
.supplier-card:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

/* Loading state */
.supplier-card--loading {
  pointer-events: none;
  opacity: 0.6;
}

.supplier-card--loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--v-theme-surface), 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
