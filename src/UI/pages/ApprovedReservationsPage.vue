<template>
  <v-app>
    <!-- Sidebar -->
    <DashboardSidebar v-model:drawer="drawer" v-model:rail="rail" />

    <!-- App Bar -->
    <DashboardHeader v-model:drawer="drawer" v-model:rail="rail" @toggle-theme="toggleTheme" />

    <!-- Main Content -->
    <v-main>
      <div class="approved-page-container">

        <!-- ✅ Header Section - Sin espacios extra -->
        <div class="page-header">
          <div class="header-content">
            <div class="title-section">
              <h1 class="page-title">
                <v-icon icon="mdi-check-circle" color="success" size="32" class="mr-3"></v-icon>
                Reservas Aprobadas
              </h1>
              <p class="page-subtitle">
                Gestiona y envía confirmaciones con payment links
              </p>
            </div>

            <!-- Stats Cards -->
            <div class="stats-section" v-if="!loading">
              <div class="stat-card">
                <div class="stat-number">{{ filteredReservations.length }}</div>
                <div class="stat-label">Total</div>
              </div>
              <div class="stat-card success">
                <div class="stat-number">{{ getPaymentStats().sent }}</div>
                <div class="stat-label">Enviados</div>
              </div>
              <div class="stat-card pending">
                <div class="stat-number">{{ getPaymentStats().pending }}</div>
                <div class="stat-label">Pendientes</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ✅ Actions Bar - Mejor alineación -->
        <div class="actions-bar">
          <v-text-field
            v-model="searchQuery"
            placeholder="Buscar por cliente, servicio..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            class="search-field"
            clearable
            @input="handleSearch"
          />

          <div class="action-buttons">
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="refreshData"
              :loading="loading"
              class="action-btn">
              Actualizar
            </v-btn>

            <v-btn
              v-if="selectedReservations.length > 0"
              color="success"
              prepend-icon="mdi-email-send"
              @click="showEmailDialog = true"
              class="action-btn">
              Confirmar {{ selectedReservations.length }}
            </v-btn>
          </div>
        </div>

        <!-- ✅ Content Area - Sin espacios extra -->
        <div class="content-area">

          <!-- Loading State -->
          <div v-if="loading" class="loading-section">
            <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
            <p class="loading-text">Cargando reservas aprobadas...</p>
          </div>

          <!-- Reservations Grid -->
          <div v-else-if="filteredReservations.length > 0" class="reservations-grid">
            <ApprovedReservationCard
              v-for="reservation in paginatedReservations"
              :key="reservation.bookingId"
              :reservation="reservation"
              :payment-status="getPaymentStatus(reservation.bookingId)"
              :is-sending-payment="paymentLoadingStates[reservation.bookingId] || false"
              @view-details="openReservationDetails(reservation)"
              @edit-reservation="editReservation(reservation)"
              @send-confirmation="sendSingleConfirmationEmail(reservation)"
              @send-payment-link="handleSendPaymentLink(reservation)"
              @select="toggleReservationSelection(reservation)"
              :selected="selectedReservations.some(r => r.bookingId === reservation.bookingId)"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <v-icon icon="mdi-calendar-check" size="64" color="grey-lighten-2" class="empty-icon"></v-icon>
            <h3 class="empty-title">No hay reservas aprobadas</h3>
            <p class="empty-subtitle">Las reservas aparecerán aquí cuando sean aprobadas por los proveedores</p>
            <v-btn color="primary" prepend-icon="mdi-refresh" @click="refreshData" :loading="loading">
              Actualizar
            </v-btn>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination-section">
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="5"
              rounded="circle"
            />
          </div>

        </div>
      </div>

      <!-- ✅ NUEVO: PaymentLinkModal Integration -->
      <PaymentLinkModal
        v-model="showPaymentModal"
        :reservation="selectedReservationForPayment"
        @payment-sent="handlePaymentSent"
      />

      <!-- Email Confirmation Dialog -->
      <v-dialog v-model="showEmailDialog" max-width="600">
        <v-card>
          <v-card-title class="text-h5 pt-5 pb-2 px-5">
            <v-icon icon="mdi-email-send" color="primary" class="mr-2"></v-icon>
            Confirmar Envío de Emails
          </v-card-title>

          <v-card-text class="px-5 pt-2">
            <v-alert color="info" variant="tonal" class="mb-4">
              Se enviará confirmación por email a {{ selectedReservations.length }} clientes
            </v-alert>

            <div class="email-list">
              <div
                v-for="reservation in selectedReservations"
                :key="reservation.bookingId"
                class="email-item"
              >
                <div class="d-flex align-center">
                  <v-avatar color="primary" size="32" class="mr-3">
                    <span class="text-white text-caption">{{ getInitials(reservation.clientName) }}</span>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="text-subtitle-2 font-weight-medium">{{ reservation.clientName }}</div>
                    <div class="text-body-2 text-medium-emphasis">{{ reservation.clientEmail }}</div>
                  </div>
                  <v-chip
                    :color="emailStatuses[reservation.bookingId] === 'sent' ? 'success' : 'default'"
                    size="small"
                    variant="tonal"
                  >
                    {{ emailStatuses[reservation.bookingId] === 'sent' ? 'Enviado' : 'Pendiente' }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="px-5 pb-5">
            <v-btn color="secondary" variant="text" @click="showEmailDialog = false">
              Cancelar
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="confirmSendEmails"
              :loading="sendingEmails"
              prepend-icon="mdi-email-send">
              Enviar {{ selectedReservations.length }} Confirmaciones
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-main>

    <!-- ✅ Snackbar - Mejorado -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      location="bottom center"
      timeout="4000"
      elevation="6"
      rounded="lg">
      <div class="snackbar-content">
        <v-icon :icon="snackbarIcon" size="20" class="mr-2"></v-icon>
        <span class="snackbar-text">{{ snackbarText }}</span>
      </div>
      <template v-slot:actions>
        <v-btn icon="mdi-close" variant="text" size="small" @click="showSnackbar = false"></v-btn>
      </template>
    </v-snackbar>

  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useDisplay } from 'vuetify';
import { useRouter } from 'vue-router';
import DashboardHeader from '@/UI/components/dashboard/DashboardHeader.vue';
import DashboardSidebar from '@/UI/components/dashboard/DashboardSidebar.vue';
import ApprovedReservationCard from '@/UI/components/cards/ApprovedReservationCard.vue';
// ✅ NUEVO: Importar PaymentLinkModal
import PaymentLinkModal from '@/UI/components/modals/PaymentLinkModal.vue';
import { reservationServiceKey } from '@/services/ReservationService';
import { emailServiceKey } from '@/services/EmailService';
import type { ReservationView } from '@/views/ReservationView';

// Responsive helpers
const { mdAndUp } = useDisplay();
const router = useRouter();

// Services
const reservationService = inject(reservationServiceKey);
const emailService = inject(emailServiceKey);

// Layout state
const drawer = ref(true);
const rail = ref(true);

// Data state
const loading = ref(false);
const reservations = ref<ReservationView[]>([]);
const selectedReservations = ref<ReservationView[]>([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(12);

// Email state
const sendingEmails = ref(false);
const showEmailDialog = ref(false);
const emailStatuses = ref<Record<string, 'pending' | 'sent' | 'failed'>>({});
const emailLoadingStates = ref<Record<string, boolean>>({});

// ✅ NUEVO: Payment Modal State
const showPaymentModal = ref(false);
const selectedReservationForPayment = ref<ReservationView | null>(null);
const paymentStatuses = ref<Record<string, 'pending' | 'sent' | 'paid' | 'expired'>>({});
const paymentLoadingStates = ref<Record<string, boolean>>({});

// UI state
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarIcon = ref('mdi-check-circle');

// Computed
const filteredReservations = computed(() => {
  if (!searchQuery.value) return reservations.value;

  const query = searchQuery.value.toLowerCase();
  return reservations.value.filter(reservation =>
    reservation.clientName.toLowerCase().includes(query) ||
    reservation.serviceName.toLowerCase().includes(query) ||
    reservation.clientEmail.toLowerCase().includes(query)
  );
});

const paginatedReservations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredReservations.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredReservations.value.length / itemsPerPage.value);
});

// ✅ Payment Stats
function getPaymentStats() {
  const sent = Object.values(paymentStatuses.value).filter(status => status === 'sent').length;
  const pending = filteredReservations.value.length - sent;
  return { sent, pending };
}

// ✅ NUEVO: Payment Methods
function handleSendPaymentLink(reservation: ReservationView) {
  console.log('🔗 Opening payment modal for:', reservation.clientName);
  selectedReservationForPayment.value = reservation;
  showPaymentModal.value = true;
}

function handlePaymentSent(reservation: ReservationView, result: any) {
  console.log('✅ Payment link sent successfully:', { reservation: reservation.clientName, result });

  // Actualizar estado de pago
  paymentStatuses.value[reservation.bookingId] = 'sent';

  // Cerrar modal
  showPaymentModal.value = false;
  selectedReservationForPayment.value = null;

  // Mostrar notificación de éxito
  showNotification(
    `💳 Payment link enviado a ${reservation.clientName}`,
    'success',
    'mdi-check-circle'
  );
}

function getPaymentStatus(bookingId: string): 'pending' | 'sent' | 'paid' | 'expired' {
  return paymentStatuses.value[bookingId] || 'pending';
}

// Existing methods...
function toggleReservationSelection(reservation: ReservationView) {
  const index = selectedReservations.value.findIndex(r => r.bookingId === reservation.bookingId);
  if (index > -1) {
    selectedReservations.value.splice(index, 1);
  } else {
    selectedReservations.value.push(reservation);
  }
}

async function confirmSendEmails() {
  if (!emailService) {
    showNotification('Servicio de email no disponible', 'error', 'mdi-alert-circle');
    return;
  }

  sendingEmails.value = true;

  try {
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const reservation of selectedReservations.value) {
      try {
        const result = await emailService.sendReservationConfirmation(reservation);

        if (result.success) {
          successCount++;
          emailStatuses.value[reservation.bookingId] = 'sent';
        } else {
          errorCount++;
          emailStatuses.value[reservation.bookingId] = 'failed';
          errors.push(`${reservation.clientName}: ${result.error}`);
        }
      } catch (error) {
        errorCount++;
        emailStatuses.value[reservation.bookingId] = 'failed';
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        errors.push(`${reservation.clientName}: ${errorMessage}`);
      }
    }

    // Show final result
    if (successCount > 0 && errorCount === 0) {
      showNotification(
        `✅ ${successCount} confirmaciones enviadas exitosamente`,
        'success',
        'mdi-check-circle'
      );
      selectedReservations.value = [];
    } else if (successCount > 0 && errorCount > 0) {
      showNotification(
        `⚠️ ${successCount} enviados, ${errorCount} fallaron`,
        'warning',
        'mdi-alert'
      );
    } else {
      showNotification(
        `❌ Error al enviar confirmaciones`,
        'error',
        'mdi-alert-circle'
      );
    }

  } catch (error) {
    console.error('❌ Critical error in confirmSendEmails:', error);
    showNotification('Error crítico al enviar confirmaciones', 'error', 'mdi-alert-circle');
  } finally {
    sendingEmails.value = false;
    showEmailDialog.value = false;
  }
}

async function sendSingleConfirmationEmail(reservation: ReservationView): Promise<void> {
  if (!emailService) {
    showNotification('Servicio de email no disponible', 'error', 'mdi-alert-circle');
    return;
  }

  emailLoadingStates.value[reservation.bookingId] = true;

  try {
    const result = await emailService.sendReservationConfirmation(reservation);

    if (result.success) {
      emailStatuses.value[reservation.bookingId] = 'sent';
      showNotification(
        `✅ Confirmación enviada a ${reservation.clientName}`,
        'success',
        'mdi-check-circle'
      );
    } else {
      emailStatuses.value[reservation.bookingId] = 'failed';
      showNotification(
        `❌ Error al enviar a ${reservation.clientName}`,
        'error',
        'mdi-alert-circle'
      );
    }
  } catch (error) {
    emailStatuses.value[reservation.bookingId] = 'failed';
    showNotification('Error al enviar confirmación', 'error', 'mdi-alert-circle');
  } finally {
    emailLoadingStates.value[reservation.bookingId] = false;
  }
}

// Utility methods
async function refreshData() {
  loading.value = true;

  try {
    if (!reservationService) {
      throw new Error('ReservationService not available');
    }

    const approvedReservations = await reservationService.getApprovedReservations();
    reservations.value = approvedReservations;

    showNotification(
      `${approvedReservations.length} reservas cargadas`,
      'success',
      'mdi-check-circle'
    );
  } catch (error) {
    console.error('❌ Error fetching approved reservations:', error);
    showNotification('Error al cargar las reservas', 'error', 'mdi-alert-circle');
    reservations.value = [];
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  currentPage.value = 1;
  selectedReservations.value = [];
}

function openReservationDetails(reservation: ReservationView) {
  router.push(`/reservation/${reservation.bookingId}`);
}

function editReservation(reservation: ReservationView) {
  console.log('Edit reservation:', reservation.bookingId);
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

  if (!reservationService) {
    showNotification('Servicio de reservas no disponible', 'error', 'mdi-alert-circle');
    return;
  }

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
  selectedReservations.value = [];
});
</script>

<style scoped>
/* ✅ LAYOUT ARREGLADO - Sin espacios extra */
.approved-page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: #fafafa;
}

/* ✅ Header Section - Mejor diseño */
.page-header {
  background: linear-gradient(135deg,
    rgba(var(--v-theme-success), 0.05) 0%,
    rgba(var(--v-theme-primary), 0.02) 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid rgba(var(--v-theme-success), 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
}

.page-subtitle {
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
  font-size: 1rem;
}

/* ✅ Stats Section */
.stats-section {
  display: flex;
  gap: 16px;
}

.stat-card {
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  text-align: center;
  min-width: 80px;
  border: 2px solid rgba(var(--v-theme-primary), 0.1);
}

.stat-card.success {
  border-color: rgba(var(--v-theme-success), 0.2);
  background: rgba(var(--v-theme-success), 0.02);
}

.stat-card.pending {
  border-color: rgba(var(--v-theme-warning), 0.2);
  background: rgba(var(--v-theme-warning), 0.02);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 4px;
}

/* ✅ Actions Bar - Mejor alineación */
.actions-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.search-field {
  flex: 1;
  max-width: 400px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  text-transform: none;
  font-weight: 500;
}

/* ✅ Content Area */
.content-area {
  margin-top: 0;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
}

.loading-text {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 1rem;
  margin: 0;
}

/* ✅ Reservations Grid */
.reservations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

/* ✅ Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  border: 2px dashed rgba(var(--v-theme-on-surface), 0.1);
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin: 0 0 8px 0;
}

.empty-subtitle {
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 0 0 24px 0;
}

/* ✅ Pagination */
.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

/* ✅ Email List */
.email-list {
  max-height: 300px;
  overflow-y: auto;
}

.email-item {
  padding: 12px 0;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.email-item:last-child {
  border-bottom: none;
}

/* ✅ Snackbar */
.snackbar-content {
  display: flex;
  align-items: center;
}

.snackbar-text {
  font-weight: 500;
}

/* ✅ Responsive */
@media (max-width: 768px) {
  .approved-page-container {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .stats-section {
    justify-content: space-between;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .actions-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .action-buttons {
    justify-content: stretch;
  }

  .action-btn {
    flex: 1;
  }

  .reservations-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
