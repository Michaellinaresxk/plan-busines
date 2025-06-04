<!-- src/UI/components/cards/SupplierCard.vue -->
<template>
  <article class="supplier-card" :class="cardModifiers" @click="handleCardClick">
    <!-- Status Badge -->
    <div v-if="supplier.featured" class="featured-badge">
      <v-icon icon="mdi-star" size="14" />
    </div>

    <!-- Header -->
    <header class="card-header">
      <div class="supplier-avatar" :style="{ backgroundColor: serviceColor }">
        <v-icon :icon="serviceIcon" size="24" color="white" />
      </div>

      <div class="supplier-info">
        <h3 class="supplier-name">{{ supplier.name }}</h3>
        <div class="service-tag" :style="{ color: serviceColor }">
          {{ serviceDisplayName }}
        </div>
        <div v-if="supplier.rating" class="rating">
          <v-icon icon="mdi-star" size="12" color="warning" />
          <span>{{ supplier.rating }}</span>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="card-content">
      <div class="contact-info">
        <div class="contact-item">
          <v-icon icon="mdi-card-account-details" size="16" />
          <span>{{ formatCedula(supplier.cedula) }}</span>
        </div>

        <div class="contact-item">
          <v-icon icon="mdi-email" size="16" />
          <span>{{ supplier.email }}</span>
        </div>

        <div class="contact-item">
          <v-icon icon="mdi-phone" size="16" />
          <span>{{ formatPhone(supplier.phone) }}</span>
        </div>

        <div v-if="showVehicleType" class="contact-item">
          <v-icon icon="mdi-car" size="16" />
          <span>{{ vehicleTypeLabel }}</span>
        </div>
      </div>

      <div v-if="supplier.address" class="address">
        <v-icon icon="mdi-map-marker" size="14" />
        <span>{{ supplier.address }}</span>
      </div>
    </div>

    <!-- Actions -->
    <footer class="card-actions">
      <div class="primary-actions">
        <v-btn
          :color="serviceColor"
          variant="tonal"
          size="small"
          prepend-icon="mdi-whatsapp"
          @click.stop="contactWhatsApp">
          WhatsApp
        </v-btn>
      </div>

      <div class="secondary-actions">
        <v-btn
          variant="text"
          size="small"
          icon="mdi-phone"
          @click.stop="$emit('contact', supplier)" />

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              variant="text"
              size="small"
              icon="mdi-dots-vertical"
              v-bind="props"
              @click.stop />
          </template>

          <v-list density="compact">
            <v-list-item prepend-icon="mdi-eye" title="Ver" @click="$emit('view', supplier)" />
            <v-list-item prepend-icon="mdi-pencil" title="Editar" @click="$emit('edit', supplier)" />
            <v-list-item prepend-icon="mdi-delete" title="Eliminar" @click="$emit('delete', supplier)" />
          </v-list>
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
import { formatCedula, formatPhone } from '@/utils/formatters';

interface Props {
  supplier: Supplier;
}

interface Emits {
  view: [supplier: Supplier];
  contact: [supplier: Supplier];
  edit: [supplier: Supplier];
  delete: [supplier: Supplier];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Computed
const serviceColor = computed(() => getServiceColor(props.supplier.service));
const serviceIcon = computed(() => getServiceIcon(props.supplier.service));
const serviceDisplayName = computed(() => getServiceDisplayName(props.supplier.service));

const showVehicleType = computed(() =>
  props.supplier.vehicleType && isAirportTransferService(props.supplier.service)
);

const vehicleTypeLabel = computed(() =>
  props.supplier.vehicleType ? getVehicleTypeLabel(props.supplier.vehicleType) : ''
);

const cardModifiers = computed(() => ({
  'supplier-card--featured': props.supplier.featured
}));

// Methods
const handleCardClick = () => {
  emit('view', props.supplier);
};

const contactWhatsApp = () => {
  const phone = props.supplier.phone.replace(/\D/g, '');
  const message = `Hola ${props.supplier.name}, me comunico desde Plan Business.`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
};
</script>

<style scoped>
.supplier-card {
  position: relative;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.supplier-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: rgba(var(--v-theme-primary), 0.4);
}

.supplier-card--featured {
  border-color: rgba(var(--v-theme-warning), 0.5);
}

.featured-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgb(var(--v-theme-warning));
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.card-header {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.08);
}

.supplier-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.supplier-info {
  flex: 1;
  min-width: 0;
}

.supplier-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: rgb(var(--v-theme-on-surface));
}

.service-tag {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
}

.card-content {
  padding: 16px 20px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.address {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 8px;
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.08);
  background: rgba(var(--v-theme-surface-variant), 0.1);
}

.primary-actions {
  display: flex;
  gap: 8px;
}

.secondary-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Responsive */
@media (max-width: 600px) {
  .card-header,
  .card-content,
  .card-actions {
    padding: 16px;
  }

  .supplier-name {
    font-size: 16px;
  }

  .card-actions {
    justify-content: space-between;
  }
}
</style>
