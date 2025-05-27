<template>
  <div class="service-details">
    <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
      <v-icon icon="mdi-cart" size="24" color="green" class="mr-2"></v-icon>
      Detalles de Compras de Supermercado
    </h3>

    <div class="details-grid">
      <!-- Entrega -->
      <div class="detail-section">
        <h4 class="section-title">
          <v-icon icon="mdi-truck-delivery" size="18" class="mr-2"></v-icon>
          Información de Entrega
        </h4>

        <div class="detail-list">
          <div class="detail-row">
            <span class="detail-label">Fecha:</span>
            <span class="detail-value font-weight-bold">{{ formatDate(reservation.date) }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Hora preferida:</span>
            <span class="detail-value">{{ reservation.hour || reservation.time }}</span>
          </div>

          <div class="detail-row highlighted">
            <span class="detail-label">Dirección de entrega:</span>
            <span class="detail-value font-weight-bold">{{ reservation.deliveryAddress }}</span>
          </div>
        </div>
      </div>

      <!-- Lista de Compras -->
      <div v-if="reservation.items && reservation.items.length > 0" class="detail-section">
        <h4 class="section-title">
          <v-icon icon="mdi-format-list-bulleted" size="18" class="mr-2"></v-icon>
          Lista de Compras
        </h4>

        <div class="items-summary">
          <div class="items-count">
            <span class="count-number">{{ reservation.items.length }}</span>
            <span class="count-text">{{ reservation.items.length === 1 ? 'artículo' : 'artículos' }}</span>
          </div>

          <v-btn variant="outlined" size="small" prepend-icon="mdi-eye" @click="showItemsDialog = true">
            Ver lista completa
          </v-btn>
        </div>
      </div>

      <!-- Restricciones y Alergias -->
      <div v-if="hasRestrictionsOrAllergies" class="detail-section full-width">
        <h4 class="section-title">
          <v-icon icon="mdi-alert-circle" size="18" color="warning" class="mr-2"></v-icon>
          Restricciones y Alergias
        </h4>

        <div v-if="reservation.hasAllergies === 'yes'" class="allergy-alert">
          <v-alert color="error" variant="tonal" class="mb-3">
            <div class="d-flex align-start">
              <v-icon icon="mdi-alert" class="mr-2 mt-1"></v-icon>
              <div>
                <div class="font-weight-bold mb-2">⚠️ ATENCIÓN: Cliente con alergias</div>
                <div v-if="reservation.allergyDetails" class="text-body-2">
                  <strong>Detalles:</strong> {{ reservation.allergyDetails }}
                </div>
              </div>
            </div>
          </v-alert>
        </div>

        <div v-if="reservation.foodRestrictions" class="restrictions-info">
          <div class="info-block warning">
            <div class="info-title">Restricciones alimentarias:</div>
            <div class="info-content">{{ reservation.foodRestrictions }}</div>
          </div>
        </div>
      </div>

      <!-- Información Adicional -->
      <div v-if="reservation.notes || reservation.specialRequests" class="detail-section full-width">
        <h4 class="section-title">
          <v-icon icon="mdi-note-text" size="18" class="mr-2"></v-icon>
          Información Adicional
        </h4>

        <div class="additional-info">
          <div v-if="reservation.specialRequests" class="info-block">
            <div class="info-title">Solicitudes especiales:</div>
            <div class="info-content">{{ reservation.specialRequests }}</div>
          </div>

          <div v-if="reservation.notes" class="info-block">
            <div class="info-title">Notas del cliente:</div>
            <div class="info-content">{{ reservation.notes }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Items Dialog -->
    <v-dialog v-model="showItemsDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Lista de Compras Completa</span>
          <v-btn icon="mdi-close" variant="text" @click="showItemsDialog = false"></v-btn>
        </v-card-title>

        <v-card-text>
          <div class="items-list">
            <div v-for="(item, index) in reservation.items" :key="index" class="item-row">
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div v-if="item.note" class="item-note">{{ item.note }}</div>
              </div>
              <div class="item-quantity">
                <v-chip size="small" color="primary" variant="tonal">
                  {{ item.quantity }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showItemsDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Props
const props = defineProps<{
  reservation: any;
}>();

// State
const showItemsDialog = ref(false);

// Computed
const hasRestrictionsOrAllergies = computed(() => {
  return reservation.value?.hasAllergies === 'yes' ||
    reservation.value?.foodRestrictions ||
    reservation.value?.allergyDetails;
});

// Methods
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
</script>

<style scoped>
.service-details {
  width: 100%;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 16px;
}

.detail-section {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row.highlighted {
  background-color: rgba(var(--v-theme-green), 0.05);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-green), 0.2);
}

.detail-label {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-weight: 500;
  flex-shrink: 0;
  margin-right: 12px;
}

.detail-value {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.87);
  text-align: right;
  word-break: break-word;
}

.items-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(var(--v-theme-green), 0.05);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-green), 0.2);
}

.items-count {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.count-number {
  font-size: 2rem;
  font-weight: 700;
  color: rgba(var(--v-theme-green), 0.8);
}

.count-text {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.allergy-alert {
  margin-bottom: 16px;
}

.additional-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-block {
  background-color: rgba(var(--v-theme-green), 0.05);
  padding: 16px;
  border-radius: 8px;
}

.info-block.warning {
  background-color: rgba(var(--v-theme-warning), 0.05);
  border: 1px solid rgba(var(--v-theme-warning), 0.2);
}

.info-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-green), 0.8);
  margin-bottom: 8px;
}

.info-block.warning .info-title {
  color: rgba(var(--v-theme-warning), 0.8);
}

.info-content {
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.items-list {
  max-height: 400px;
  overflow-y: auto;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.item-row:last-child {
  border-bottom: none;
}

.item-info {
  flex-grow: 1;
}

.item-name {
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin-bottom: 4px;
}

.item-note {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-style: italic;
}

.item-quantity {
  margin-left: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .detail-value {
    text-align: left;
  }

  .items-summary {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}

/* Scrollbar styling for items list */
.items-list::-webkit-scrollbar {
  width: 6px;
}

.items-list::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 3px;
}

.items-list::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}

.items-list::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}
