<!-- src/UI/components/cards/SupplierCard.vue -->
<template>
  <v-card class="supplier-card" :class="cardClasses" elevation="0" rounded="xl">
    <!-- Premium Badge -->
    <div v-if="isLuxeService" class="premium-badge">
      <v-icon icon="mdi-crown" size="16" color="white"></v-icon>
      <span>LUXE</span>
    </div>

    <!-- Featured Corner -->
    <div v-if="supplier.featured" class="featured-corner">
      <v-icon icon="mdi-star" size="12" color="white"></v-icon>
    </div>

    <!-- Card Header -->
    <div class="card-header">
      <!-- Service Category Background -->
      <div class="category-background" :style="{ background: getCategoryGradient(supplier.service) }"></div>

      <!-- Avatar and Service Icon -->
      <div class="avatar-section">
        <div class="service-icon-container" :style="{ background: getServiceColor(supplier.service) }">
          <v-icon :icon="getServiceIcon(supplier.service)" size="24" color="white"></v-icon>
        </div>

        <div class="supplier-avatar">
          <span class="avatar-initials">{{ getInitials(supplier.name) }}</span>
        </div>
      </div>

      <!-- Header Content -->
      <div class="header-content">
        <div class="supplier-name">
          {{ supplier.name }}
        </div>

        <div class="service-info">
          <v-chip :color="getServiceColor(supplier.service)" size="x-small" variant="elevated" class="service-chip">
            {{ getServiceDisplayName(supplier.service) }}
          </v-chip>

          <div v-if="supplier.rating" class="rating-section">
            <v-icon icon="mdi-star" size="14" color="amber"></v-icon>
            <span class="rating-value">{{ supplier.rating }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Content -->
    <div class="card-content">
      <!-- Contact Information -->
      <div class="contact-grid">
        <div class="contact-item">
          <div class="contact-icon">
            <v-icon icon="mdi-card-account-details-outline" size="16"></v-icon>
          </div>
          <div class="contact-details">
            <span class="contact-label">Cédula</span>
            <span class="contact-value">{{ formatCedula(supplier.cedula) }}</span>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">
            <v-icon icon="mdi-email-outline" size="16"></v-icon>
          </div>
          <div class="contact-details">
            <span class="contact-label">Email</span>
            <span class="contact-value">{{ supplier.email }}</span>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">
            <v-icon icon="mdi-phone-outline" size="16"></v-icon>
          </div>
          <div class="contact-details">
            <span class="contact-label">Teléfono</span>
            <span class="contact-value">{{ formatPhone(supplier.phone) }}</span>
          </div>
        </div>
      </div>

      <!-- Additional Info -->
      <div v-if="supplier.address" class="additional-info">
        <v-icon icon="mdi-map-marker-outline" size="14" class="info-icon"></v-icon>
        <span class="info-text">{{ supplier.address }}</span>
      </div>
    </div>

    <!-- Card Actions -->
    <div class="card-actions">
      <v-btn variant="text" color="primary" size="small" prepend-icon="mdi-eye-outline" @click="$emit('view', supplier)"
        class="action-btn">
        Ver
      </v-btn>

      <v-btn variant="text" :color="getServiceColor(supplier.service)" size="small" prepend-icon="mdi-phone-outline"
        @click="$emit('contact', supplier)" class="action-btn">
        Contactar
      </v-btn>

      <v-menu location="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props" class="menu-btn"></v-btn>
        </template>

        <v-card class="menu-card" elevation="8" rounded="lg">
          <v-list density="compact" class="menu-list">
            <v-list-item prepend-icon="mdi-pencil-outline" title="Editar información" @click="$emit('edit', supplier)"
              class="menu-item"></v-list-item>

            <v-list-item prepend-icon="mdi-star-outline"
              :title="supplier.featured ? 'Quitar destacado' : 'Marcar destacado'"
              @click="$emit('toggle-featured', supplier)" class="menu-item"></v-list-item>

            <v-divider class="my-1"></v-divider>

            <v-list-item prepend-icon="mdi-delete-outline" title="Eliminar proveedor" class="menu-item menu-item-danger"
              @click="$emit('delete', supplier)"></v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Supplier, SupplierService } from '@/types/supplier';
import { SERVICE_DISPLAY_NAMES, SERVICE_CATEGORIES } from '@/types/supplier';

// Props
const props = defineProps<{
  supplier: Supplier;
}>();

// Emits
const emit = defineEmits<{
  view: [supplier: Supplier];
  contact: [supplier: Supplier];
  edit: [supplier: Supplier];
  delete: [supplier: Supplier];
  'toggle-featured': [supplier: Supplier];
}>();

// Service colors and icons mapping
const serviceStyles = {
  // Culinary
  'private-chef': { color: '#FF6B35', icon: 'mdi-chef-hat', gradient: 'linear-gradient(135deg, #FF6B35, #F7931E)' },
  'luxe-culinary': { color: '#D4AF37', icon: 'mdi-silverware-fork-knife', gradient: 'linear-gradient(135deg, #D4AF37, #FFD700)' },

  // Transportation
  'golf-cart-rentals': { color: '#4CAF50', icon: 'mdi-golf-cart', gradient: 'linear-gradient(135deg, #4CAF50, #8BC34A)' },
  'airport-transfers': { color: '#2196F3', icon: 'mdi-airplane', gradient: 'linear-gradient(135deg, #2196F3, #03DAC6)' },
  'bike-rentals': { color: '#FF9800', icon: 'mdi-bike', gradient: 'linear-gradient(135deg, #FF9800, #FFC107)' },
  'luxe-golf-cart': { color: '#9C27B0', icon: 'mdi-golf-cart', gradient: 'linear-gradient(135deg, #9C27B0, #E91E63)' },
  'luxe-e-bikes': { color: '#673AB7', icon: 'mdi-bike-fast', gradient: 'linear-gradient(135deg, #673AB7, #9C27B0)' },
  'luxe-arrival': { color: '#795548', icon: 'mdi-car-luxury', gradient: 'linear-gradient(135deg, #795548, #8D6E63)' },

  // Wellness
  'yoga-standard': { color: '#E91E63', icon: 'mdi-yoga', gradient: 'linear-gradient(135deg, #E91E63, #FF5722)' },
  'personal-training': { color: '#FF5722', icon: 'mdi-dumbbell', gradient: 'linear-gradient(135deg, #FF5722, #FF9800)' },
  'luxe-yoga': { color: '#9C27B0', icon: 'mdi-meditation', gradient: 'linear-gradient(135deg, #9C27B0, #E91E63)' },
  'luxe-fitness': { color: '#3F51B5', icon: 'mdi-weight-lifter', gradient: 'linear-gradient(135deg, #3F51B5, #673AB7)' },
  'luxe-masseuse': { color: '#8BC34A', icon: 'mdi-spa', gradient: 'linear-gradient(135deg, #8BC34A, #4CAF50)' },

  // Water Activities
  'catamaran-trips': { color: '#00BCD4', icon: 'mdi-sail-boat', gradient: 'linear-gradient(135deg, #00BCD4, #0097A7)' },
  'deep-sea-fishing': { color: '#009688', icon: 'mdi-fish', gradient: 'linear-gradient(135deg, #009688, #00BCD4)' },
  'private-fishing-trip': { color: '#607D8B', icon: 'mdi-fishing', gradient: 'linear-gradient(135deg, #607D8B, #78909C)' },
  'private-catamaran': { color: '#FF6F00', icon: 'mdi-yacht', gradient: 'linear-gradient(135deg, #FF6F00, #FF8F00)' },
  'luxe-yacht': { color: '#1976D2', icon: 'mdi-ferry', gradient: 'linear-gradient(135deg, #1976D2, #1E88E5)' },
  'private-yacht-experience': { color: '#283593', icon: 'mdi-sail-boat', gradient: 'linear-gradient(135deg, #283593, #3949AB)' },

  // Entertainment
  'karaoke': { color: '#E040FB', icon: 'mdi-microphone', gradient: 'linear-gradient(135deg, #E040FB, #D500F9)' },
  'live-music': { color: '#7C4DFF', icon: 'mdi-music', gradient: 'linear-gradient(135deg, #7C4DFF, #651FFF)' },
  'custom-decorations': { color: '#FF4081', icon: 'mdi-party-popper', gradient: 'linear-gradient(135deg, #FF4081, #F50057)' },

  // Others
  'babysitter': { color: '#FFEB3B', icon: 'mdi-baby-face-outline', gradient: 'linear-gradient(135deg, #FFEB3B, #FDD835)' },
  'grocery-shopping': { color: '#4CAF50', icon: 'mdi-cart-outline', gradient: 'linear-gradient(135deg, #4CAF50, #66BB6A)' },
  'saona-island-tour': { color: '#00E676', icon: 'mdi-island', gradient: 'linear-gradient(135deg, #00E676, #1DE9B6)' },
  'horseback-riding': { color: '#8D6E63', icon: 'mdi-horse-human', gradient: 'linear-gradient(135deg, #8D6E63, #A1887F)' },
  'adventure-excursions': { color: '#FF7043', icon: 'mdi-hiking', gradient: 'linear-gradient(135deg, #FF7043, #FF5722)' }
};

// Computed properties
const isLuxeService = computed(() =>
  props.supplier.service.includes('luxe') || props.supplier.service.includes('private')
);

const cardClasses = computed(() => ({
  'supplier-card--featured': props.supplier.featured,
  'supplier-card--luxe': isLuxeService.value,
  'supplier-card--premium': props.supplier.rating && props.supplier.rating >= 4.5
}));

// Utility functions
function getServiceColor(service: string): string {
  return serviceStyles[service as keyof typeof serviceStyles]?.color || '#6366F1';
}

function getServiceIcon(service: string): string {
  return serviceStyles[service as keyof typeof serviceStyles]?.icon || 'mdi-account-hard-hat';
}

function getCategoryGradient(service: string): string {
  return serviceStyles[service as keyof typeof serviceStyles]?.gradient || 'linear-gradient(135deg, #6366F1, #4F46E5)';
}

function getServiceDisplayName(service: string): string {
  return SERVICE_DISPLAY_NAMES[service as SupplierService] || service;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatCedula(cedula: string): string {
  return cedula.replace(/(\d{3})(\d{7})(\d{1})/, '$1-$2-$3');
}

function formatPhone(phone: string): string {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}
</script>

<style scoped>
.supplier-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.supplier-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.supplier-card--featured {
  border: 2px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.1);
}

.supplier-card--luxe {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(255, 255, 255, 0.95));
}

.premium-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #D4AF37, #FFD700);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 3;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.featured-corner {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-left: 24px solid #FFD700;
  border-bottom: 24px solid transparent;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.featured-corner v-icon {
  position: absolute;
  top: 4px;
  left: 4px;
}

.card-header {
  position: relative;
  padding: 24px 20px 16px;
  overflow: hidden;
}

.category-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  opacity: 0.1;
  z-index: 0;
}

.avatar-section {
  position: relative;
  z-index: 1;
  margin-bottom: 12px;
}

.service-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.supplier-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 8px;
  right: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-initials {
  font-size: 14px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.7);
  letter-spacing: 0.5px;
}

.header-content {
  position: relative;
  z-index: 1;
}

.supplier-name {
  font-size: 18px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.9);
  margin-bottom: 8px;
  line-height: 1.2;
}

.service-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.service-chip {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 193, 7, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.rating-value {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 193, 7, 0.9);
}

.card-content {
  padding: 0 20px 16px;
  flex: 1;
}

.contact-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
}

.contact-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-details {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.contact-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 2px;
}

.contact-value {
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
  word-break: break-word;
}

.additional-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.info-icon {
  color: rgba(99, 102, 241, 0.7);
  flex-shrink: 0;
}

.info-text {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.7);
  line-height: 1.3;
}

.card-actions {
  padding: 16px 20px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.action-btn {
  font-size: 12px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.3px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.menu-btn {
  opacity: 0.7;
  transition: all 0.3s ease;
}

.menu-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.menu-card {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.menu-list {
  padding: 8px;
}

.menu-item {
  border-radius: 8px;
  margin-bottom: 2px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(99, 102, 241, 0.1);
  transform: translateX(4px);
}

.menu-item-danger:hover {
  background: rgba(244, 67, 54, 0.1);
  color: rgb(244, 67, 54);
}

/* Responsive Design */
@media (max-width: 600px) {
  .card-header {
    padding: 20px 16px 12px;
  }

  .card-content {
    padding: 0 16px 12px;
  }

  .card-actions {
    padding: 12px 16px 16px;
    flex-direction: column;
    gap: 8px;
  }

  .supplier-name {
    font-size: 16px;
  }

  .service-info {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .supplier-card {
    background: rgba(30, 30, 30, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .supplier-name {
    color: rgba(255, 255, 255, 0.9);
  }

  .contact-label {
    color: rgba(255, 255, 255, 0.5);
  }

  .contact-value {
    color: rgba(255, 255, 255, 0.8);
  }

  .info-text {
    color: rgba(255, 255, 255, 0.7);
  }
}

/* Animation for card entrance */
@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.supplier-card {
  animation: cardEntrance 0.5s ease-out;
}
</style>
