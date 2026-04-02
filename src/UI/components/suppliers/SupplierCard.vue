<template>
  <article
    class="supplier-card"
    :class="{ 'supplier-card--featured': supplier.featured }"
    @click="handleCardClick"
  >
    <!-- Featured accent line -->
    <div v-if="supplier.featured" class="featured-line" />

    <!-- Header -->
    <header class="card-header">
      <div class="supplier-avatar">
        <v-icon :icon="serviceIcon" size="20" color="white" />
      </div>

      <div class="supplier-info">
        <h3 class="supplier-name">{{ supplier.name }}</h3>
        <div class="supplier-meta">
          <span class="service-label">{{ serviceDisplayName }}</span>
          <template v-if="supplier.rating">
            <span class="meta-dot">·</span>
            <span class="rating-value">
              <v-icon icon="mdi-star" size="11" color="#F59E0B" />
              {{ supplier.rating }}
            </span>
          </template>
        </div>
      </div>

      <!-- Menu -->
      <v-menu location="bottom end" :close-on-content-click="true">
        <template #activator="{ props }">
          <button
            v-bind="props"
            class="icon-btn"
            @click.stop
            aria-label="Opciones"
          >
            <v-icon icon="mdi-dots-vertical" size="18" />
          </button>
        </template>
        <v-list density="compact" class="options-list" rounded="xl" elevation="8">
          <v-list-item prepend-icon="mdi-eye-outline" title="Ver detalles" @click="$emit('view', supplier)" rounded="lg" />
          <v-list-item prepend-icon="mdi-pencil-outline" title="Editar" @click="$emit('edit', supplier)" rounded="lg" />
          <v-divider class="my-1" />
          <v-list-item prepend-icon="mdi-delete-outline" title="Eliminar" class="text-error" @click="$emit('delete', supplier)" rounded="lg" />
        </v-list>
      </v-menu>
    </header>

    <!-- Contact details -->
    <div class="card-body">
      <div class="contact-row">
        <v-icon icon="mdi-card-account-details-outline" size="14" class="contact-icon" />
        <span class="contact-text">{{ formatCedula(supplier.cedula) }}</span>
      </div>
      <div class="contact-row">
        <v-icon icon="mdi-email-outline" size="14" class="contact-icon" />
        <span class="contact-text contact-text--email">{{ supplier.email }}</span>
      </div>
      <div class="contact-row">
        <v-icon icon="mdi-phone-outline" size="14" class="contact-icon" />
        <span class="contact-text">{{ formatPhone(supplier.phone) }}</span>
      </div>
      <div v-if="showVehicleType" class="contact-row">
        <v-icon icon="mdi-car-outline" size="14" class="contact-icon" />
        <span class="contact-text">{{ vehicleTypeLabel }}</span>
      </div>
      <div v-if="supplier.address" class="contact-row">
        <v-icon icon="mdi-map-marker-outline" size="14" class="contact-icon" />
        <span class="contact-text">{{ supplier.address }}</span>
      </div>
    </div>

    <!-- Footer -->
    <footer class="card-footer">
      <button class="whatsapp-btn" @click.stop="contactWhatsApp">
        <v-icon icon="mdi-whatsapp" size="16" />
        <span>WhatsApp</span>
      </button>

      <button class="call-btn icon-btn" @click.stop="$emit('contact', supplier)" aria-label="Llamar">
        <v-icon icon="mdi-phone-outline" size="16" />
      </button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Supplier } from '@/types/supplier';
import {
  getServiceIcon,
  getServiceDisplayName,
  isAirportTransferService,
  getVehicleTypeLabel
} from '@/utils/supplier-helpers';
import { formatCedula, formatPhone } from '@/utils/formatters';

interface Props { supplier: Supplier }
interface Emits {
  view: [supplier: Supplier];
  contact: [supplier: Supplier];
  edit: [supplier: Supplier];
  delete: [supplier: Supplier];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const serviceIcon = computed(() => getServiceIcon(props.supplier.service));
const serviceDisplayName = computed(() => getServiceDisplayName(props.supplier.service));
const showVehicleType = computed(() =>
  props.supplier.vehicleType && isAirportTransferService(props.supplier.service)
);
const vehicleTypeLabel = computed(() =>
  props.supplier.vehicleType ? getVehicleTypeLabel(props.supplier.vehicleType) : ''
);

const handleCardClick = () => emit('view', props.supplier);

const contactWhatsApp = () => {
  const phone = props.supplier.phone.replace(/\D/g, '');
  const message = `Hola ${props.supplier.name}, me comunico desde Plan Business.`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
};
</script>

<style scoped>
/* ─── Card Shell ─── */
.supplier-card {
  position: relative;
  background: #FFFFFF;
  border: 1px solid #F1F5F9;
  border-radius: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.supplier-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.06),
    0 10px 24px -4px rgba(0, 0, 0, 0.07);
}

/* ─── Featured accent ─── */
.featured-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #D4AF37, #F59E0B, #D4AF37);
}

/* ─── Header ─── */
.card-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 20px 16px;
}

.supplier-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #1E293B;
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
  font-size: 0.9375rem;
  font-weight: 650;
  color: #0F172A;
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.1px;
}

.supplier-meta {
  display: flex;
  align-items: center;
  gap: 5px;
}

.service-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.meta-dot {
  color: #CBD5E1;
  font-size: 0.75rem;
}

.rating-value {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748B;
}

/* ─── Icon button ─── */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: #94A3B8;
  transition: background 0.15s ease, color 0.15s ease;
  flex-shrink: 0;
}

.icon-btn:hover {
  background: #F8FAFC;
  color: #475569;
}

/* ─── Body ─── */
.card-body {
  padding: 0 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  flex: 1;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 9px;
}

.contact-icon {
  color: #CBD5E1;
  flex-shrink: 0;
}

.contact-text {
  font-size: 0.8125rem;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-text--email {
  color: #64748B;
}

/* ─── Footer ─── */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 16px;
  border-top: 1px solid #F8FAFC;
  margin-top: auto;
}

.whatsapp-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border: 1px solid #E2E8F0;
  border-radius: 9px;
  background: transparent;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.whatsapp-btn:hover {
  background: #F0FDF4;
  border-color: #86EFAC;
  color: #15803D;
}

.call-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #E2E8F0;
  border-radius: 9px;
}

/* ─── Options menu ─── */
.options-list {
  min-width: 160px;
}

/* ─── Dark theme ─── */
.v-theme--dark .supplier-card {
  background: #1E293B;
  border-color: #334155;
}

.v-theme--dark .supplier-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3), 0 10px 24px -4px rgba(0,0,0,0.3);
}

.v-theme--dark .supplier-name { color: #F1F5F9; }
.v-theme--dark .service-label { color: #475569; }
.v-theme--dark .contact-icon  { color: #475569; }
.v-theme--dark .contact-text  { color: #94A3B8; }

.v-theme--dark .card-footer    { border-top-color: #334155; }

.v-theme--dark .whatsapp-btn,
.v-theme--dark .call-btn {
  border-color: #334155;
  color: #94A3B8;
}

.v-theme--dark .whatsapp-btn:hover {
  background: #064E3B;
  border-color: #059669;
  color: #34D399;
}

.v-theme--dark .icon-btn:hover {
  background: #334155;
  color: #CBD5E1;
}

/* ─── Responsive ─── */
@media (max-width: 600px) {
  .card-header { padding: 16px 16px 12px; }
  .card-body   { padding: 0 16px 12px; }
  .card-footer { padding: 10px 16px 14px; }
  .supplier-name { font-size: 0.875rem; }
}
</style>
