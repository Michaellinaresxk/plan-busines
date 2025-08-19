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
                Reservas confirmadas por proveedores - Listas para envío de confirmación por email
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

                  <!-- ✅ BOTÓN PRINCIPAL: ENVIAR CONFIRMACIONES -->
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-email-send"
                    variant="elevated"
                    @click="sendConfirmationEmails"
                    :disabled="selectedReservations.length === 0"
                    :loading="sendingEmails">
                    Enviar Confirmaciones ({{ selectedReservations.length }})
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- Selection Header -->
            <v-card class="mb-4" color="primary" variant="tonal" rounded="lg" v-if="filteredReservations.length > 0">
              <v-card-text class="d-flex align-center">
                <v-checkbox
                  v-model="selectAll"
                  @update:model-value="toggleSelectAll"
                  hide-details
                  color="primary"
                  class="mr-4">
                </v-checkbox>

                <div class="flex-grow-1">
                  <h3 class="text-subtitle-1 font-weight-bold">
                    {{ selectedReservations.length }} de {{ filteredReservations.length }} seleccionadas
                  </h3>
                  <p class="text-body-2 mb-0">
                    Selecciona las reservas para enviar confirmaciones por email
                  </p>
                </div>

                <!-- ✅ BOTÓN DE ACCIÓN RÁPIDA -->
                <v-btn
                  v-if="selectedReservations.length > 0"
                  color="primary"
                  variant="elevated"
                  prepend-icon="mdi-email-send"
                  @click="sendConfirmationEmails"
                  :loading="sendingEmails">
                  Enviar Confirmaciones
                </v-btn>
              </v-card-text>
            </v-card>

            <!-- Loading State -->
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

            <!-- 🎯 RESERVATIONS GRID - USANDO EL COMPONENTE -->
            <div v-else class="reservations-grid">
              <ApprovedReservationCard
                v-for="reservation in paginatedReservations"
                :key="reservation.bookingId"
                :reservation="reservation"
                :is-selected="isSelected(reservation.bookingId)"
                @click="toggleSelection(reservation)"
                @toggle-selection="toggleSelection(reservation)"
                @view-details="openReservationDetails(reservation)"
              />
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
              <v-pagination
                v-model="currentPage"
                :length="totalPages"
                :total-visible="7"
                rounded="circle"
                color="primary"
                :disabled="loading">
              </v-pagination>
            </div>
          </div>
        </v-container>
      </v-main>

      <!-- ✅ EMAIL CONFIRMATION DIALOG -->
      <v-dialog v-model="showEmailDialog" max-width="700">
        <v-card>
          <v-card-title class="text-h5 pt-5 pb-2 px-5 bg-primary text-white">
            <v-icon icon="mdi-email-send" class="mr-2"></v-icon>
            Enviar Confirmaciones por Email
          </v-card-title>

          <v-card-text class="px-5 pt-4">
            <v-alert color="primary" variant="tonal" class="mb-4">
              <div class="d-flex align-center">
                <v-icon icon="mdi-information" class="mr-2"></v-icon>
                <div>
                  <strong>{{ selectedReservations.length }} confirmaciones</strong> serán enviadas por email.
                  <br>
                  <small>Los clientes recibirán todos los detalles de su reserva confirmada.</small>
                </div>
              </div>
            </v-alert>

            <!-- ✅ Email Content Preview -->
            <v-expansion-panels v-model="previewPanels" class="mb-4">
              <v-expansion-panel value="preview">
                <v-expansion-panel-title>
                  <v-icon icon="mdi-eye" class="mr-2"></v-icon>
                  Vista previa del email
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="email-preview">
                    <div class="preview-header mb-3">
                      <h4>Asunto: Confirmación de Reserva - {{ selectedReservations[0]?.serviceName || 'Servicio' }}</h4>
                    </div>
                    <div class="preview-content">
                      <p><strong>Estimado/a Cliente,</strong></p>
                      <p>Su reserva ha sido <strong>confirmada exitosamente</strong>. A continuación los detalles:</p>
                      <ul>
                        <li><strong>Servicio:</strong> {{ selectedReservations[0]?.serviceName }}</li>
                        <li><strong>Fecha:</strong> {{ getServiceDate(selectedReservations[0]) }}</li>
                        <li><strong>Hora:</strong> {{ getServiceTime(selectedReservations[0]) }}</li>
                        <li><strong>Total:</strong> ${{ selectedReservations[0]?.totalPrice }}</li>
                      </ul>
                      <p><em>+ Detalles específicos del servicio</em></p>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- Email List -->
            <div class="email-list">
              <h4 class="text-subtitle-1 font-weight-bold mb-3">
                Reservas a confirmar:
              </h4>
              <div v-for="reservation in selectedReservations" :key="reservation.bookingId" class="email-item">
                <div class="d-flex align-center">
                  <v-avatar color="primary" size="32" class="mr-3">
                    <span class="text-white text-body-2">{{ getInitials(reservation.clientName) }}</span>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <h4 class="text-subtitle-2">{{ reservation.clientName }}</h4>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ reservation.clientEmail }} • {{ reservation.serviceName }} • ${{ reservation.totalPrice }}
                    </p>
                  </div>
                  <v-chip
                    :color="getEmailStatusColor(getReservationEmailStatus(reservation.bookingId) || 'pending')"
                    size="small"
                    variant="tonal">
                    {{ getEmailStatusText(getReservationEmailStatus(reservation.bookingId) || 'pending') }}
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

      <!-- Snackbar -->
      <v-snackbar
        v-model="showSnackbar"
        :color="snackbarColor"
        location="bottom end"
        rounded="pill"
        timeout="5000">
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
// 🎯 IMPORTAR EL COMPONENTE ApprovedReservationCard
import ApprovedReservationCard from '@/UI/components/cards/ApprovedReservationCard.vue';
import { reservationServiceKey } from '@/services/ReservationService';
import { emailServiceKey } from '@/services/EmailService';
import type { ReservationView } from '@/views/ReservationView';

// Responsive helpers
const { mdAndUp } = useDisplay();
const router = useRouter();

// ✅ INJECT SERVICES
const reservationService = inject(reservationServiceKey);
const emailService = inject(emailServiceKey);

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

// ✅ EMAIL STATE
const sendingEmails = ref(false);
const showEmailDialog = ref(false);
const emailLoadingStates = ref<Record<string, boolean>>({});
const emailStatuses = ref<Record<string, string>>({});
const previewPanels = ref(['preview']);

// Notifications
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarIcon = ref('mdi-check-circle');

// ✅ Development flag
const isDevelopment = computed(() => import.meta.env.DEV);

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

// ✅ EMAIL STATUS UTILITIES
function getEmailStatusColor(status: string): string {
  switch (status) {
    case 'sent': return 'success';
    case 'failed': return 'error';
    case 'pending': return 'warning';
    default: return 'grey-lighten-2';
  }
}

function getEmailStatusIcon(status: string): string {
  switch (status) {
    case 'sent': return 'mdi-email-check';
    case 'failed': return 'mdi-email-remove';
    case 'pending': return 'mdi-email-clock';
    default: return 'mdi-email-outline';
  }
}

function getEmailStatusText(status: string): string {
  switch (status) {
    case 'sent': return 'Enviado';
    case 'failed': return 'Error';
    case 'pending': return 'Pendiente';
    default: return 'Sin enviar';
  }
}

function getReservationEmailStatus(bookingId: string): string {
  return emailStatuses.value[bookingId] || 'pending';
}

// ✅ SERVICE DATE/TIME HELPERS
function getServiceDate(reservation: ReservationView): string {
  if (!reservation) return 'N/A';

  if (reservation.serviceDate) return reservation.serviceDate;
  if (reservation.formData?.date) return reservation.formData.date;

  return reservation.bookingDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getServiceTime(reservation: ReservationView): string {
  if (!reservation) return 'N/A';

  if (reservation.serviceTime) return reservation.serviceTime;

  const { formData } = reservation;
  return (
    formData?.time ||
    formData?.startTime ||
    formData?.hour ||
    (formData?.startTime && formData?.endTime
      ? `${formData.startTime} - ${formData.endTime}`
      : 'Por confirmar')
  );
}

// ✅ SERVICE SPECIFIC INFO
function getServiceSpecificInfo(reservation: ReservationView): string {
  if (!reservation.formData) return '';

  const { formData, serviceId } = reservation;

  switch (serviceId) {
    case 'airport-transfer':
      return `Vuelo: ${formData.flightNumber || 'N/A'} • Vehículo: ${formData.vehicleType || 'N/A'}`;
    case 'babysitter':
      return `Niños: ${formData.childrenCount || 0} • Edades: ${formData.childrenAges?.join(', ') || 'N/A'}`;
    case 'custom-decoration':
      return `Ocasión: ${formData.occasion || 'N/A'} • Colores: ${formData.colors?.join(', ') || 'N/A'}`;
    case 'grocery-shopping':
      return `Dirección: ${formData.deliveryAddress || 'N/A'} • Items: ${formData.items?.length || 0}`;
    default:
      return '';
  }
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

  selectAll.value = selectedReservations.value.length === filteredReservations.value.length;
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedReservations.value = [...filteredReservations.value];
  } else {
    selectedReservations.value = [];
  }
}

// ✅ EMAIL METHODS
async function sendConfirmationEmails(): Promise<void> {
  if (selectedReservations.value.length === 0) {
    showNotification('Selecciona al menos una reserva', 'warning', 'mdi-alert');
    return;
  }

  console.log('📧 Opening email confirmation dialog for:', selectedReservations.value.length, 'reservations');
  showEmailDialog.value = true;
}

async function confirmSendEmails(): Promise<void> {
  if (!emailService) {
    showNotification('Servicio de email no disponible', 'error', 'mdi-alert-circle');
    return;
  }

  sendingEmails.value = true;
  showEmailDialog.value = false;

  try {
    console.log('📧 Starting email sending process for', selectedReservations.value.length, 'reservations');

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const processedReservations: string[] = [];

    // Enviar emails uno por uno con información detallada
    for (const reservation of selectedReservations.value) {
      try {
        console.log(`📧 Processing email for ${reservation.clientName} (${reservation.clientEmail})`);
        console.log('📋 Reservation data:', {
          bookingId: reservation.bookingId,
          serviceName: reservation.serviceName,
          serviceDate: getServiceDate(reservation),
          serviceTime: getServiceTime(reservation),
          totalPrice: reservation.totalPrice,
          formData: reservation.formData
        });

        const result = await emailService.sendReservationConfirmation(reservation);

        if (result.success) {
          successCount++;
          emailStatuses.value[reservation.bookingId] = 'sent';
          processedReservations.push(reservation.bookingId);
          console.log(`✅ Email sent successfully to ${reservation.clientName}`, result);
        } else {
          errorCount++;
          emailStatuses.value[reservation.bookingId] = 'failed';
          errors.push(`${reservation.clientName}: ${result.error}`);
          console.error(`❌ Failed to send email to ${reservation.clientName}:`, result.error);
        }
      } catch (error) {
        errorCount++;
        emailStatuses.value[reservation.bookingId] = 'failed';
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        errors.push(`${reservation.clientName}: ${errorMessage}`);
        console.error(`❌ Exception sending email to ${reservation.clientName}:`, error);
      }
    }

    // Mostrar resultado final
    if (successCount > 0 && errorCount === 0) {
      showNotification(
        `✅ ${successCount} confirmaciones enviadas exitosamente`,
        'success',
        'mdi-check-circle'
      );
      selectedReservations.value = [];
      selectAll.value = false;

    } else if (successCount > 0 && errorCount > 0) {
      showNotification(
        `⚠️ ${successCount} enviados correctamente, ${errorCount} fallaron`,
        'warning',
        'mdi-alert'
      );
      // Mantener solo las que fallaron seleccionadas
      selectedReservations.value = selectedReservations.value.filter(r =>
        !processedReservations.includes(r.bookingId)
      );

    } else {
      showNotification(
        `❌ Error al enviar confirmaciones: ${errors.slice(0, 2).join(', ')}${errors.length > 2 ? '...' : ''}`,
        'error',
        'mdi-alert-circle'
      );
    }

    console.log('📧 Email sending process completed:', {
      total: selectedReservations.value.length,
      success: successCount,
      errors: errorCount,
      processedReservations
    });

  } catch (error) {
    console.error('❌ Critical error in confirmSendEmails:', error);
    showNotification(
      error instanceof Error ? error.message : 'Error crítico al enviar confirmaciones',
      'error',
      'mdi-alert-circle'
    );
  } finally {
    sendingEmails.value = false;
  }
}

async function sendSingleConfirmationEmail(reservation: ReservationView): Promise<void> {
  if (!emailService) {
    showNotification('Servicio de email no disponible', 'error', 'mdi-alert-circle');
    return;
  }

  emailLoadingStates.value[reservation.bookingId] = true;

  try {
    console.log(`📧 Sending single confirmation email to ${reservation.clientName}`);
    console.log('📋 Single reservation data:', {
      bookingId: reservation.bookingId,
      serviceName: reservation.serviceName,
      clientEmail: reservation.clientEmail,
      totalPrice: reservation.totalPrice
    });

    const result = await emailService.sendReservationConfirmation(reservation);

    if (result.success) {
      emailStatuses.value[reservation.bookingId] = 'sent';
      showNotification(
        `✅ Confirmación enviada a ${reservation.clientName}`,
        'success',
        'mdi-check-circle'
      );
      console.log(`✅ Single email sent successfully:`, result);
    } else {
      emailStatuses.value[reservation.bookingId] = 'failed';
      showNotification(
        `❌ Error al enviar a ${reservation.clientName}: ${result.error}`,
        'error',
        'mdi-alert-circle'
      );
      console.error(`❌ Single email failed:`, result);
    }
  } catch (error) {
    console.error('❌ Exception in single email send:', error);
    emailStatuses.value[reservation.bookingId] = 'failed';
    showNotification(
      error instanceof Error ? error.message : 'Error al enviar confirmación',
      'error',
      'mdi-alert-circle'
    );
  } finally {
    emailLoadingStates.value[reservation.bookingId] = false;
  }
}

// Utility methods
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
  selectedReservations.value = [];
  selectAll.value = false;
}

function openReservationDetails(reservation: ReservationView) {
  router.push(`/reservation/${reservation.bookingId}`);
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
  console.log('📋 ApprovedReservationsView mounted, initializing...');

  // ✅ VERIFICAR SERVICIOS AL INICIO
  console.log('🔍 Checking services availability:');
  console.log('  - reservationService:', reservationService ? '✅ Available' : '❌ Not available');
  console.log('  - emailService:', emailService ? '✅ Available' : '❌ Not available');

  if (!emailService) {
    console.warn('⚠️ EmailService not available - email functionality will be disabled');
    showNotification('Servicio de email no disponible', 'warning', 'mdi-alert');
  }

  if (!reservationService) {
    console.error('❌ ReservationService not available');
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
  selectAll.value = false;
});

// ✅ DEBUG: Watch email service availability
watch(() => emailService, (newEmailService) => {
  console.log('🔄 EmailService changed:', newEmailService ? 'Available' : 'Not available');
}, { immediate: true });
</script>

<style scoped>
.approved-reservations-container {
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 24px;
}

/* 🎯 GRID USANDO EL COMPONENTE */
.reservations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

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

.email-preview {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.preview-header {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

.preview-content {
  color: rgba(var(--v-theme-on-surface), 0.8);
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
  .reservations-grid {
    gap: 12px;
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
</style>
