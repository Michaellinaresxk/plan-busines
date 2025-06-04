<template>
  <v-app>
    <v-layout>
      <DashboardSidebar v-if="showSidebar" v-model:drawer="drawer" v-model:rail="rail" :mdAndUp="mdAndUp"
        :pendingCount="0" />

      <v-main>
        <DashboardHeader :mdAndUp="mdAndUp" v-model:drawer="drawer" v-model:rail="rail" @toggle-theme="toggleTheme" />

        <v-container fluid class="py-6 px-4">
          <div class="approved-reservations-container">
            <!-- Header -->
            <div class="header-section mb-6">
              <h1 class="text-h4 font-weight-bold mb-2 d-flex align-center">
                <v-icon icon="mdi-check-circle" size="36" color="success" class="mr-3"></v-icon>
                Reservas Aprobadas
                <v-chip color="success" size="small" class="ml-2">{{ filteredReservations.length }}</v-chip>
              </h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Reservas confirmadas por proveedores - Listas para envío de pago
              </p>
            </div>

            <!-- Action Buttons -->
            <v-card class="mb-6" elevation="0" border rounded="lg">
              <v-card-text class="py-4">
                <div class="d-flex flex-wrap gap-4 align-center">
                  <v-text-field
                    v-model="searchQuery"
                    prepend-inner-icon="mdi-magnify"
                    label="Buscar reservas aprobadas"
                    hide-details
                    variant="outlined"
                    density="compact"
                    style="max-width: 300px"
                    @update:model-value="handleSearch"
                    clearable>
                  </v-text-field>

                  <v-spacer></v-spacer>

                  <v-btn
                    prepend-icon="mdi-refresh"
                    color="secondary"
                    variant="text"
                    :loading="loading"
                    @click="refreshData">
                    Actualizar
                  </v-btn>

                  <!-- ✅ BOTÓN PARA ENVIAR PAGOS -->
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-credit-card"
                    @click="sendPaymentLinks"
                    :disabled="selectedReservations.length === 0">
                    Enviar Links de Pago ({{ selectedReservations.length }})
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- Selection Header -->
            <v-card class="mb-4" color="success" variant="tonal" rounded="lg" v-if="filteredReservations.length > 0">
              <v-card-text class="d-flex align-center">
                <v-checkbox
                  v-model="selectAll"
                  @update:model-value="toggleSelectAll"
                  hide-details
                  color="success"
                  class="mr-4">
                </v-checkbox>

                <div class="flex-grow-1">
                  <h3 class="text-subtitle-1 font-weight-bold">
                    {{ selectedReservations.length }} de {{ filteredReservations.length }} seleccionadas
                  </h3>
                  <p class="text-body-2 mb-0">
                    Selecciona las reservas para enviar links de pago masivos
                  </p>
                </div>

                <v-btn
                  v-if="selectedReservations.length > 0"
                  color="success"
                  variant="elevated"
                  prepend-icon="mdi-send"
                  @click="sendPaymentLinks">
                  Enviar Pagos
                </v-btn>
              </v-card-text>
            </v-card>

            <!-- ✅ Custom Reservations Grid with Selection -->
            <div v-if="loading" class="d-flex justify-center align-center py-12">
              <div class="text-center">
                <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
                <h3 class="text-h6 mb-2">Cargando reservas...</h3>
                <p class="text-body-2 text-medium-emphasis">Obteniendo reservas aprobadas</p>
              </div>
            </div>

            <!-- Empty State -->
            <v-card
              v-else-if="filteredReservations.length === 0"
              class="text-center py-12"
              variant="outlined"
              rounded="lg">
              <v-card-text>
                <v-icon icon="mdi-check-circle" size="64" color="success" class="mb-4"></v-icon>
                <h3 class="text-h5 mb-2">Sin reservas aprobadas</h3>
                <p class="text-body-1 text-medium-emphasis mb-4">
                  No hay reservas aprobadas en este momento.
                </p>
                <v-btn color="primary" @click="refreshData">Actualizar</v-btn>
              </v-card-text>
            </v-card>

            <!-- Reservations Grid -->
            <div v-else class="reservations-grid">
              <v-card
                v-for="reservation in paginatedReservations"
                :key="reservation.bookingId"
                class="reservation-card"
                :class="{ 'selected': isSelected(reservation.bookingId) }"
                rounded="lg"
                elevation="2"
                hover
                @click="toggleSelection(reservation)">

                <!-- Selection Checkbox -->
                <div class="selection-overlay">
                  <v-checkbox
                    :model-value="isSelected(reservation.bookingId)"
                    color="success"
                    hide-details
                    @click.stop
                    @update:model-value="toggleSelection(reservation)">
                  </v-checkbox>
                </div>

                <!-- Ready Badge -->
                <div class="ready-badge">
                  <v-chip color="success" variant="elevated" size="small" prepend-icon="mdi-check-circle">
                    Lista para pago
                  </v-chip>
                </div>

                <v-card-text class="pa-4">
                  <!-- Service Header -->
                  <div class="d-flex align-center mb-3">
                    <v-avatar :color="getServiceColor(reservation.serviceName)" size="40" class="mr-3">
                      <v-icon :icon="getServiceIcon(reservation.serviceName)" color="white"></v-icon>
                    </v-avatar>
                    <div class="flex-grow-1">
                      <h4 class="text-subtitle-1 font-weight-bold">{{ reservation.serviceName }}</h4>
                      <p class="text-body-2 text-medium-emphasis mb-0">{{ reservation.timeAgo }}</p>
                    </div>
                    <v-chip color="success" variant="elevated" size="small">
                      Aprobada
                    </v-chip>
                  </div>

                  <!-- Client Info -->
                  <div class="client-section mb-3">
                    <div class="d-flex align-center mb-2">
                      <v-icon icon="mdi-account" size="16" color="primary" class="mr-2"></v-icon>
                      <span class="text-subtitle-2 font-weight-medium">{{ reservation.clientName }}</span>
                    </div>
                    <div class="d-flex align-center mb-1">
                      <v-icon icon="mdi-email" size="14" color="medium-emphasis" class="mr-2"></v-icon>
                      <span class="text-body-2 text-medium-emphasis">{{ reservation.clientEmail }}</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-phone" size="14" color="medium-emphasis" class="mr-2"></v-icon>
                      <span class="text-body-2 text-medium-emphasis">{{ reservation.clientPhone }}</span>
                    </div>
                  </div>

                  <!-- Service Details -->
                  <div class="service-details mb-3">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <div class="d-flex align-center">
                        <v-icon icon="mdi-calendar" size="14" color="medium-emphasis" class="mr-2"></v-icon>
                        <span class="text-body-2">{{ reservation.date }}</span>
                      </div>
                      <div class="d-flex align-center">
                        <v-icon icon="mdi-clock" size="14" color="medium-emphasis" class="mr-2"></v-icon>
                        <span class="text-body-2">{{ reservation.time }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Price -->
                  <div class="price-section">
                    <div class="d-flex align-center justify-space-between">
                      <span class="text-h6 font-weight-bold text-success">${{ reservation.totalPrice }}</span>
                      <v-btn
                        icon="mdi-eye"
                        variant="text"
                        size="small"
                        color="primary"
                        @click.stop="openReservationDetails(reservation)">
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
              <v-pagination
                v-model="currentPage"
                :length="totalPages"
                :total-visible="7"
                rounded="circle"
                color="success"
                :disabled="loading">
              </v-pagination>
            </div>
          </div>
        </v-container>
      </v-main>

      <!-- Payment Links Dialog -->
      <v-dialog v-model="showPaymentDialog" max-width="600">
        <v-card>
          <v-card-title class="text-h5 pt-5 pb-2 px-5">
            <v-icon icon="mdi-credit-card" color="primary" class="mr-2"></v-icon>
            Enviar Links de Pago
          </v-card-title>

          <v-card-text class="px-5 pt-2">
            <v-alert color="info" variant="tonal" class="mb-4">
              Se enviará un link de pago a {{ selectedReservations.length }} clientes.
            </v-alert>

            <div class="payment-list">
              <div v-for="reservation in selectedReservations" :key="reservation.bookingId" class="payment-item">
                <div class="d-flex align-center">
                  <v-avatar color="success" size="32" class="mr-3">
                    <span class="text-white text-body-2">{{ getInitials(reservation.clientName) }}</span>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <h4 class="text-subtitle-2">{{ reservation.clientName }}</h4>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ reservation.serviceName }} - ${{ reservation.totalPrice }}
                    </p>
                  </div>
                  <v-chip color="success" size="small" variant="tonal">
                    Lista
                  </v-chip>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="px-5 pb-5">
            <v-btn color="secondary" variant="text" @click="showPaymentDialog = false">
              Cancelar
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="confirmSendPayments" :loading="sendingPayments">
              Enviar Links
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ✅ NEW: Payment Options Modal -->
      <PaymentOptionsModal
        :show="paymentModalController.isVisible.value"
        :reservation="paymentModalController.currentReservation.value"
        @close="paymentModalController.hideModal"
        @sent="handlePaymentSent" />

      <!-- Snackbar -->
      <v-snackbar
        v-model="showSnackbar"
        :color="snackbarColor"
        location="bottom end"
        rounded="pill"
        timeout="4000">
        <div class="d-flex align-center">
          <v-icon :icon="snackbarIcon" class="mr-2" size="small"></v-icon>
          {{ snackbarText }}
        </div>
        <template v-slot:actions>
          <v-btn icon="mdi-close" variant="text" @click="showSnackbar = false"></v-btn>
        </template>
      </v-snackbar>
    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useDisplay } from 'vuetify';
import { useRouter } from 'vue-router';
import DashboardHeader from '@/UI/components/dashboard/DashboardHeader.vue';
import DashboardSidebar from '@/UI/components/dashboard/DashboardSidebar.vue';
import PaymentOptionsModal from '@/UI/components/modals/PaymentOptionsModal.vue'; // ✅ Nuevo import
import { reservationServiceKey } from '@/services/ReservationService';
import { providePaymentModal } from '@/composables/usePaymentModal'; // ✅ Nuevo import
import type { ReservationView } from '@/views/ReservationView';

// Responsive helpers
const { mdAndUp } = useDisplay();
const router = useRouter();

// Inject services
const reservationService = inject(reservationServiceKey);

// ✅ Setup payment modal controller
const paymentModalController = providePaymentModal();

// Layout state
const drawer = ref(true);
const rail = ref(false);
const showSidebar = ref(true);

// State
const loading = ref(false);
const reservations = ref<ReservationView[]>([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(12);

// Selection state
const selectedReservations = ref<ReservationView[]>([]);
const selectAll = ref(false);

// Payment dialog - ✅ Mantenemos para compatibilidad pero usaremos el nuevo modal
const showPaymentDialog = ref(false);
const sendingPayments = ref(false);

// Notifications
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarIcon = ref('mdi-check-circle');

// Computed
const filteredReservations = computed(() => {
  let result = [...reservations.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(r =>
      r.clientName?.toLowerCase().includes(query) ||
      r.clientEmail?.toLowerCase().includes(query) ||
      r.serviceName?.toLowerCase().includes(query)
    );
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredReservations.value.length / itemsPerPage.value));

const paginatedReservations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredReservations.value.slice(start, end);
});

// Service utilities
const serviceStyles = {
  'airport-transfer': { color: '#2196F3', icon: 'mdi-airplane' },
  'babysitter': { color: '#9C27B0', icon: 'mdi-baby' },
  'custom-decoration': { color: '#FF9800', icon: 'mdi-party-popper' },
  'grocery-shopping': { color: '#4CAF50', icon: 'mdi-cart' },
  'default': { color: '#6366F1', icon: 'mdi-tools' }
};

function getServiceColor(serviceName: string): string {
  const serviceKey = serviceName?.toLowerCase().replace(/\s+/g, '-') || 'default';
  return serviceStyles[serviceKey as keyof typeof serviceStyles]?.color || serviceStyles.default.color;
}

function getServiceIcon(serviceName: string): string {
  const serviceKey = serviceName?.toLowerCase().replace(/\s+/g, '-') || 'default';
  return serviceStyles[serviceKey as keyof typeof serviceStyles]?.icon || serviceStyles.default.icon;
}

// Selection methods
function isSelected(bookingId: string): boolean {
  return selectedReservations.value.some(r => r.bookingId === bookingId);
}

function toggleSelection(reservation: ReservationView) {
  const index = selectedReservations.value.findIndex(r => r.bookingId === reservation.bookingId);

  if (index >= 0) {
    selectedReservations.value.splice(index, 1);
  } else {
    selectedReservations.value.push(reservation);
  }

  // Update selectAll state
  selectAll.value = selectedReservations.value.length === filteredReservations.value.length;
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedReservations.value = [...filteredReservations.value];
  } else {
    selectedReservations.value = [];
  }
}

// Methods
async function refreshData() {
  loading.value = true;

  try {
    console.log('🔄 Fetching approved reservations from Firebase...');

    if (!reservationService) {
      throw new Error('ReservationService not available');
    }

    const approvedReservations = await reservationService.getApprovedReservations();
    reservations.value = approvedReservations;

    console.log(`✅ Loaded ${approvedReservations.length} approved reservations`);
    showNotification(
      `${approvedReservations.length} reservas aprobadas cargadas`,
      'success',
      'mdi-check-circle'
    );
  } catch (error) {
    console.error('❌ Error fetching approved reservations:', error);
    showNotification('Error al cargar las reservas aprobadas', 'error', 'mdi-alert-circle');
    reservations.value = [];
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  currentPage.value = 1;
  // Reset selection when searching
  selectedReservations.value = [];
  selectAll.value = false;
}

function openReservationDetails(reservation: ReservationView) {
  router.push(`/reservations/${reservation.bookingId}`);
}

function sendPaymentLinks() {
  if (selectedReservations.value.length === 0) {
    showNotification('Selecciona al menos una reserva', 'warning', 'mdi-alert');
    return;
  }

  showPaymentDialog.value = true;
}

// ✅ NUEVA IMPLEMENTACIÓN CON MODAL MEJORADO
async function confirmSendPayments() {
  sendingPayments.value = true;
  showPaymentDialog.value = false; // Cerrar el dialog básico

  try {
    console.log('💳 Sending payment links to selected reservations...');

    if (!reservationService) {
      throw new Error('ReservationService not available');
    }

    // ✅ Usar el nuevo servicio con modal integrado
    const result = await reservationService.sendPaymentLinks(selectedReservations.value);

    if (result.success) {
      showNotification(
        `Links de pago enviados a ${result.sent} clientes exitosamente`,
        'success',
        'mdi-check-circle'
      );

      // Remover las reservas exitosas de la lista
      const successfulIds = result.processedReservations.map(r => r.bookingId);
      reservations.value = reservations.value.filter(r =>
        !successfulIds.includes(r.bookingId)
      );

      // Limpiar selección
      selectedReservations.value = [];
      selectAll.value = false;

    } else {
      // Mostrar errores si los hubo
      const errorMessage = result.errors.length > 0
        ? `Errores: ${result.errors.slice(0, 2).join(', ')}${result.errors.length > 2 ? '...' : ''}`
        : 'Algunos links no pudieron enviarse';

      showNotification(
        `${result.sent} enviados, ${result.failed} fallaron. ${errorMessage}`,
        'warning',
        'mdi-alert'
      );

      // Remover solo las exitosas
      const successfulIds = result.processedReservations.map(r => r.bookingId);
      reservations.value = reservations.value.filter(r =>
        !successfulIds.includes(r.bookingId)
      );

      // Actualizar selección removiendo las exitosas
      selectedReservations.value = selectedReservations.value.filter(r =>
        !successfulIds.includes(r.bookingId)
      );
    }

  } catch (error) {
    console.error('❌ Error sending payment links:', error);
    showNotification(
      error instanceof Error ? error.message : 'Error al enviar links de pago',
      'error',
      'mdi-alert-circle'
    );
  } finally {
    sendingPayments.value = false;
  }
}

// ✅ MANEJAR EVENTO DEL MODAL DE PAGO
function handlePaymentSent(reservation: any) {
  console.log('✅ Payment link sent for:', reservation.clientName);

  // Remover esta reserva de la lista
  const index = reservations.value.findIndex(r => r.bookingId === reservation.bookingId);
  if (index >= 0) {
    reservations.value.splice(index, 1);
  }

  // Remover de selección si estaba seleccionada
  const selectedIndex = selectedReservations.value.findIndex(r => r.bookingId === reservation.bookingId);
  if (selectedIndex >= 0) {
    selectedReservations.value.splice(selectedIndex, 1);
  }

  showNotification(
    `Link de pago enviado a ${reservation.clientName}`,
    'success',
    'mdi-check-circle'
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function showNotification(message: string, color: 'success' | 'error' | 'info' | 'warning', icon: string) {
  snackbarText.value = message;
  snackbarColor.value = color;
  snackbarIcon.value = icon;
  showSnackbar.value = true;
}

function toggleTheme() {
  console.log('Toggle theme');
}

// Lifecycle
onMounted(async () => {
  rail.value = mdAndUp.value;
  console.log('📋 ApprovedReservationsView mounted, loading data...');
  await refreshData();
});

// Watchers
watch(mdAndUp, (newValue) => {
  if (!newValue) {
    rail.value = false;
    drawer.value = false;
  } else {
    drawer.value = true;
    rail.value = true;
  }
});

watch(filteredReservations, (newReservations) => {
  const maxPage = Math.ceil(newReservations.length / itemsPerPage.value);
  if (currentPage.value > maxPage && maxPage > 0) {
    currentPage.value = maxPage;
  }

  // Reset selection if filtered
  selectedReservations.value = [];
  selectAll.value = false;
});
</script>

<style scoped>
.approved-reservations-container {
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 24px;
}

.reservations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.reservation-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 2px solid transparent;
}

.reservation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.reservation-card.selected {
  border-color: rgb(var(--v-theme-success));
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
}

.selection-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ready-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.client-section {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  padding: 12px;
}

.service-details {
  border-top: 1px solid rgba(var(--v-theme-outline), 0.1);
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
  padding: 8px 0;
}

.price-section {
  padding-top: 8px;
}

.payment-list {
  max-height: 300px;
  overflow-y: auto;
}

.payment-item {
  padding: 12px 0;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.payment-item:last-child {
  border-bottom: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-section h1 {
    font-size: 1.5rem !important;
  }

  .reservations-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .d-flex.flex-wrap.gap-4 {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 600px) {
  .selection-overlay,
  .ready-badge {
    position: static;
    margin-bottom: 8px;
  }

  .reservation-card {
    padding-top: 0;
  }
}

/* Animation improvements */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reservation-card {
  animation: slideInUp 0.6s ease-out;
}

.reservation-card:nth-child(2) { animation-delay: 0.1s; }
.reservation-card:nth-child(3) { animation-delay: 0.2s; }
.reservation-card:nth-child(4) { animation-delay: 0.3s; }
</style>
