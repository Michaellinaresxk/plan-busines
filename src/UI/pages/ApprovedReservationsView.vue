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
                  <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="Buscar reservas aprobadas"
                    hide-details variant="outlined" density="compact" style="max-width: 300px"
                    @update:model-value="handleSearch" clearable></v-text-field>

                  <v-spacer></v-spacer>

                  <v-btn prepend-icon="mdi-refresh" color="secondary" variant="text" :loading="loading"
                    @click="refreshData">
                    Actualizar
                  </v-btn>

                  <!-- ✅ BOTÓN PARA ENVIAR PAGOS -->
                  <v-btn color="primary" prepend-icon="mdi-credit-card" @click="sendPaymentLinks"
                    :disabled="selectedReservations.length === 0">
                    Enviar Links de Pago ({{ selectedReservations.length }})
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- Reservations List with Selection -->
            <ReservationsList
              :reservations="paginatedReservations"
              :loading="loading"
              v-model:current-page="currentPage"
              :items-per-page="itemsPerPage"
              @refresh="refreshData"
              @view-details="openReservationDetails"
              empty-state-message="No hay reservas aprobadas en este momento."
              empty-state-title="Sin reservas aprobadas"
              empty-state-icon="mdi-check-circle">

              <!-- ✅ Custom slot para agregar checkboxes de selección -->
              <template #list-header>
                <v-card class="mb-4" color="success" variant="tonal" rounded="lg">
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

                    <v-btn v-if="selectedReservations.length > 0"
                           color="success"
                           variant="elevated"
                           prepend-icon="mdi-send"
                           @click="sendPaymentLinks">
                      Enviar Pagos
                    </v-btn>
                  </v-card-text>
                </v-card>
              </template>
            </ReservationsList>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
              <v-pagination v-model="currentPage" :length="totalPages" :total-visible="7" rounded="circle"
                color="success" :disabled="loading"></v-pagination>
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
              <div v-for="reservation in selectedReservations" :key="reservation.id" class="payment-item">
                <div class="d-flex align-center">
                  <v-avatar color="success" size="32" class="mr-3">
                    <span class="text-white text-body-2">{{ getInitials(reservation.clientName) }}</span>
                  </v-avatar>
                  <div>
                    <h4 class="text-subtitle-2">{{ reservation.clientName }}</h4>
                    <p class="text-body-2 text-medium-emphasis mb-0">${{ reservation.totalPrice }}</p>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="px-5 pb-5">
            <v-btn color="secondary" variant="text" @click="showPaymentDialog = false">Cancelar</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="confirmSendPayments" :loading="sendingPayments">
              Enviar Links
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbar -->
      <v-snackbar v-model="showSnackbar" :color="snackbarColor" location="bottom end" rounded="pill" timeout="4000">
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
import ReservationsList from '@/UI/components/reservation/ReservationsList.vue';
import DashboardHeader from '@/UI/components/dashboard/DashboardHeader.vue';
import DashboardSidebar from '@/UI/components/dashboard/DashboardSidebar.vue';
import { reservationServiceKey } from '@/services/ReservationService';

// Responsive helpers
const { mdAndUp } = useDisplay();

// Inject services
const reservationService = inject(reservationServiceKey);

// Layout state
const drawer = ref(true);
const rail = ref(false);
const showSidebar = ref(true);

// State
const loading = ref(false);
const reservations = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(9);

// Selection state
const selectedReservations = ref([]);
const selectAll = ref(false);

// Payment dialog
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
}

function openReservationDetails(reservation) {
  // Navigate to reservation details or open modal
  console.log('📋 Opening reservation details:', reservation.bookingId);
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedReservations.value = [...filteredReservations.value];
  } else {
    selectedReservations.value = [];
  }
}

function sendPaymentLinks() {
  if (selectedReservations.value.length === 0) {
    showNotification('Selecciona al menos una reserva', 'warning', 'mdi-alert');
    return;
  }

  showPaymentDialog.value = true;
}

async function confirmSendPayments() {
  sendingPayments.value = true;

  try {
    console.log('💳 Sending payment links to selected reservations...');

    // ✅ Aquí implementarías el servicio de pagos
    // Ejemplo: await paymentService.sendPaymentLinks(selectedReservations.value);

    // Simular envío por ahora
    await new Promise(resolve => setTimeout(resolve, 2000));

    showNotification(
      `Links de pago enviados a ${selectedReservations.value.length} clientes`,
      'success',
      'mdi-check-circle'
    );

    // Limpiar selección
    selectedReservations.value = [];
    selectAll.value = false;
    showPaymentDialog.value = false;

    // ✅ Actualizar estado de reservas a COMPLETED después del pago
    // await reservationService.markReservationsAsPaymentSent(selectedIds);

  } catch (error) {
    console.error('❌ Error sending payment links:', error);
    showNotification('Error al enviar links de pago', 'error', 'mdi-alert-circle');
  } finally {
    sendingPayments.value = false;
  }
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

  .d-flex.flex-wrap.gap-4 {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
