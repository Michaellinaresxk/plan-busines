<template>
  <div class="enhanced-service-details">

    <!-- 📋 DETALLES ESPECÍFICOS EXPANDIDOS -->
    <div v-if="additionalProperties.length > 0" class="details-section">
      <div class="section-header">
        <div class="header-content">
          <div class="header-icon">
            <v-icon icon="mdi-clipboard-list" size="20"></v-icon>
          </div>
          <div class="header-text">
            <h3 class="section-title">Detalles Específicos</h3>
            <p class="section-subtitle">Información detallada del servicio</p>
          </div>
        </div>
        <v-chip size="small" color="primary" variant="tonal" class="count-chip">
          {{ additionalProperties.length }} {{ additionalProperties.length === 1 ? 'detalle' : 'detalles' }}
        </v-chip>
      </div>

      <!-- Properties Grid -->
      <div class="properties-grid">
        <div
          v-for="(prop, index) in additionalProperties"
          :key="index"
          class="property-card"
          :style="{ animationDelay: `${index * 100}ms` }">

          <div class="property-header">
            <div class="property-icon">
              <v-icon :icon="getPropertyIcon(prop.key)" size="16"></v-icon>
            </div>
            <span class="property-label">{{ formatPropName(prop.key) }}</span>
          </div>

          <div class="property-content">
            <span class="property-value">{{ formatPropValue(prop.value) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 📝 INFORMACIÓN ADICIONAL EXPANDIDA -->
    <div v-if="reservation.notes" class="notes-section">
      <div class="section-header">
        <div class="header-content">
          <div class="header-icon notes-icon">
            <v-icon icon="mdi-note-text" size="20"></v-icon>
          </div>
          <div class="header-text">
            <h3 class="section-title">Información Adicional</h3>
            <p class="section-subtitle">Notas y comentarios del cliente</p>
          </div>
        </div>
        <v-chip size="small" color="info" variant="tonal" class="notes-indicator">
          <v-icon icon="mdi-message-text" size="12" class="mr-1"></v-icon>
          Comentarios
        </v-chip>
      </div>

      <!-- Notes Card -->
      <div class="notes-card">
        <div class="notes-header">
          <div class="client-avatar">
            <v-icon icon="mdi-account-circle" size="20"></v-icon>
          </div>
          <div class="notes-meta">
            <span class="notes-author">Notas del cliente</span>
            <span class="notes-timestamp">Incluidas en la solicitud</span>
          </div>
        </div>

        <div class="notes-content">
          <div class="notes-text">
            "{{ reservation.notes }}"
          </div>
        </div>

        <div class="notes-footer">
          <v-btn
            variant="text"
            size="small"
            prepend-icon="mdi-content-copy"
            @click="copyNotes"
            class="copy-notes-btn">
            Copiar notas
          </v-btn>
        </div>
      </div>
    </div>

    <!-- 🎯 ACCIONES RÁPIDAS -->
    <div class="actions-section">
      <div class="section-header">
        <div class="header-content">
          <div class="header-icon actions-icon">
            <v-icon icon="mdi-lightning-bolt" size="20"></v-icon>
          </div>
          <div class="header-text">
            <h3 class="section-title">Acciones Rápidas</h3>
            <p class="section-subtitle">Herramientas útiles para esta reserva</p>
          </div>
        </div>
      </div>

      <div class="actions-grid">
        <v-btn
          variant="tonal"
          color="primary"
          prepend-icon="mdi-printer"
          block
          class="action-btn">
          Imprimir Detalles
        </v-btn>

        <v-btn
          variant="tonal"
          color="info"
          prepend-icon="mdi-share-variant"
          block
          class="action-btn">
          Compartir Info
        </v-btn>

        <v-btn
          variant="tonal"
          color="success"
          prepend-icon="mdi-download"
          block
          class="action-btn">
          Exportar PDF
        </v-btn>

        <v-btn
          variant="tonal"
          color="warning"
          prepend-icon="mdi-pencil"
          block
          class="action-btn">
          Editar Detalles
        </v-btn>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Props
const props = defineProps<{
  reservation: any;
}>();

// Lista de propiedades comunes que no mostraremos como "adicionales"
const commonProps = [
  'id', 'bookingId', 'clientName', 'clientEmail', 'clientPhone',
  'serviceName', 'serviceId', 'serviceCategory', 'date', 'time',
  'status', 'notes', 'createdAt', 'timeAgo', 'isPriority',
  'isNewClient', 'totalPrice', 'bookingDate', 'formData'
];

// Propiedades adicionales para mostrar
const additionalProperties = computed(() => {
  const extras: Array<{ key: string, value: any; }> = [];

  // Procesar formData si existe
  if (props.reservation.formData && typeof props.reservation.formData === 'object') {
    Object.entries(props.reservation.formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        extras.push({ key, value });
      }
    });
  }

  // Procesar propiedades directas de la reserva
  Object.entries(props.reservation).forEach(([key, value]) => {
    if (!commonProps.includes(key) && value !== undefined && value !== null && value !== '') {
      extras.push({ key, value });
    }
  });

  return extras;
});

// Utility functions
function formatDate(dateString: string): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

function formatPropName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1') // Insertar espacio antes de mayúsculas
    .replace(/^./, (str) => str.toUpperCase()) // Capitalizar primera letra
    .trim();
}

function formatPropValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  } else if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  } else if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function getPropertyIcon(key: string): string {
  const iconMap: Record<string, string> = {
    'date': 'mdi-calendar',
    'time': 'mdi-clock',
    'duration': 'mdi-timer',
    'location': 'mdi-map-marker',
    'price': 'mdi-currency-usd',
    'guests': 'mdi-account-group',
    'rooms': 'mdi-home',
    'adults': 'mdi-account',
    'children': 'mdi-baby',
    'pets': 'mdi-paw',
    'special': 'mdi-star',
    'pickup': 'mdi-car-pickup',
    'dropoff': 'mdi-car',
    'flight': 'mdi-airplane',
    'luggage': 'mdi-bag-suitcase',
    'phone': 'mdi-phone',
    'email': 'mdi-email',
    'address': 'mdi-home-map-marker',
    'notes': 'mdi-note-text',
    'requests': 'mdi-format-list-bulleted'
  };

  const lowerKey = key.toLowerCase();
  for (const [keyPattern, icon] of Object.entries(iconMap)) {
    if (lowerKey.includes(keyPattern)) {
      return icon;
    }
  }
  return 'mdi-information';
}

function getNotesWordCount(): number {
  if (!props.reservation.notes) return 0;
  return props.reservation.notes.trim().split(/\s+/).length;
}

function copyNotes() {
  if (navigator.clipboard && props.reservation.notes) {
    navigator.clipboard.writeText(props.reservation.notes);
    // Aquí podrías emitir un evento o mostrar una notificación
  }
}
</script>

<style scoped>
/* 🎯 ENHANCED COMPONENT STYLES */

.enhanced-service-details {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 📄 Section Headers */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-primary));
}

.notes-icon {
  background: rgba(var(--v-theme-info), 0.1);
  color: rgb(var(--v-theme-info));
}

.summary-icon {
  background: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
}

.actions-icon {
  background: rgba(var(--v-theme-warning), 0.1);
  color: rgb(var(--v-theme-warning));
}

.header-text {
  flex: 1;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.section-subtitle {
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
}

.count-chip,
.notes-indicator {
  font-weight: 500;
}

/* 🏷️ Properties Grid */
.details-section {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.property-card {
  background: rgba(var(--v-theme-surface), 0.8);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.property-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.property-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.property-icon {
  width: 24px;
  height: 24px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-primary));
}

.property-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.property-content {
  padding-left: 32px;
}

.property-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.87);
  word-break: break-word;
}

/* 📝 Notes Section */
.notes-section {
  background: rgba(var(--v-theme-info), 0.03);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(var(--v-theme-info), 0.1);
}

.notes-card {
  background: rgba(var(--v-theme-surface), 0.8);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.notes-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(var(--v-theme-info), 0.05);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.client-avatar {
  width: 32px;
  height: 32px;
  background: rgba(var(--v-theme-info), 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-info));
}

.notes-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notes-author {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.notes-timestamp {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.notes-content {
  padding: 20px;
}

.notes-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(var(--v-theme-on-surface), 0.8);
  font-style: italic;
  background: rgba(var(--v-theme-surface-variant), 0.2);
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid rgb(var(--v-theme-info));
}

.notes-footer {
  padding: 12px 20px;
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.copy-notes-btn {
  text-transform: none;
  font-size: 0.8rem;
}

/* 📊 Summary Section */
.summary-section {
  background: rgba(var(--v-theme-success), 0.03);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(var(--v-theme-success), 0.1);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-card {
  background: rgba(var(--v-theme-surface), 0.8);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.87);
  line-height: 1;
}

.summary-label {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-weight: 500;
}

/* 🎯 Actions Section */
.actions-section {
  background: rgba(var(--v-theme-warning), 0.03);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(var(--v-theme-warning), 0.1);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.action-btn {
  text-transform: none;
  font-weight: 500;
  height: 48px;
  border-radius: 12px;
}

/* 📱 RESPONSIVE DESIGN */

/* Small phones (320px - 479px) */
@media (max-width: 479px) {
  .enhanced-service-details {
    gap: 20px;
  }

  .details-section,
  .notes-section,
  .summary-section,
  .actions-section {
    padding: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .properties-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .actions-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .property-content {
    padding-left: 0;
    margin-top: 8px;
  }
}

/* Medium phones (480px - 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .properties-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablets (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .properties-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .summary-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .actions-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .enhanced-service-details {
    gap: 32px;
  }

  .properties-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }

  .details-section,
  .notes-section,
  .summary-section,
  .actions-section {
    padding: 32px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .details-section {
    background: rgba(var(--v-theme-surface), 0.3);
  }

  .notes-section {
    background: rgba(var(--v-theme-info), 0.05);
  }

  .summary-section {
    background: rgba(var(--v-theme-success), 0.05);
  }

  .actions-section {
    background: rgba(var(--v-theme-warning), 0.05);
  }

  .property-card,
  .notes-card,
  .summary-card {
    background: rgba(var(--v-theme-surface), 0.6);
    border-color: rgba(var(--v-theme-on-surface), 0.15);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .property-card,
  .summary-card {
    animation: none;
    transition: none;
  }

  .property-card:hover,
  .summary-card:hover {
    transform: none;
  }
}
</style>
