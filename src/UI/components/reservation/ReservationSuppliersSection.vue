<!-- src/UI/components/reservation/ReservationSuppliersSection.vue - Enhanced -->
<template>
  <v-card class="suppliers-section" rounded="xl" elevation="0" border>
    <v-card-title class="pa-6 pb-4">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <div class="title-icon-container">
            <v-icon icon="mdi-account-search" color="white" size="24"></v-icon>
          </div>
          <div class="ml-4">
            <h3 class="text-h6 font-weight-bold mb-1">Proveedores Disponibles</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ getSearchDescription() }}
            </p>
          </div>
        </div>

        <v-chip v-if="compatibleSuppliers.length > 0" color="primary" size="large" variant="elevated"
          class="supplier-count-chip">
          <v-icon icon="mdi-account-group" size="16" class="mr-1"></v-icon>
          {{ compatibleSuppliers.length }} disponibles
        </v-chip>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-6">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading-content">
          <v-progress-circular indeterminate color="primary" size="48" width="3"></v-progress-circular>
          <h4 class="text-h6 mt-4 mb-2">Buscando proveedores...</h4>
          <p class="text-body-2 text-medium-emphasis">Analizando compatibilidad de servicios</p>
        </div>
      </div>

      <!-- Suppliers Grid -->
      <div v-else-if="compatibleSuppliers.length > 0" class="suppliers-grid">
        <v-card v-for="supplier in compatibleSuppliers" :key="supplier.id" class="supplier-card" rounded="xl"
          elevation="0" border>

          <!-- Supplier Header -->
          <div class="supplier-header">
            <div class="supplier-avatar-section">
              <v-avatar :color="getSupplierColor(supplier)" size="56" class="supplier-avatar">
                <span class="text-h6 font-weight-bold text-white">
                  {{ getInitials(supplier.name) }}
                </span>
              </v-avatar>

              <div class="supplier-status-badge">
                <v-chip color="success" size="x-small" variant="flat">
                  <v-icon icon="mdi-check-circle" size="12" class="mr-1"></v-icon>
                  Activo
                </v-chip>
              </div>
            </div>

            <div class="supplier-main-info">
              <h4 class="supplier-name">{{ supplier.name }}</h4>
              <p class="supplier-email">{{ supplier.email }}</p>
            </div>
          </div>

          <v-card-text class="pa-4 pt-0">
            <!-- Contact Info -->
            <div class="contact-section">
              <div class="contact-item">
                <div class="contact-icon-wrapper">
                  <v-icon icon="mdi-phone" size="16" color="primary"></v-icon>
                </div>
                <span class="contact-text">{{ formatPhone(supplier.phone) }}</span>
              </div>

              <div class="contact-item">
                <div class="contact-icon-wrapper">
                  <v-icon icon="mdi-tools" size="16" color="primary"></v-icon>
                </div>
                <span class="contact-text">{{ supplier.service }}</span>
              </div>

              <!-- Vehicle Type for airport transfer -->
              <div v-if="supplier.vehicleType && isAirportTransfer" class="contact-item vehicle-info">
                <div class="contact-icon-wrapper">
                  <v-icon icon="mdi-car" size="16" color="blue"></v-icon>
                </div>
                <span class="contact-text">{{ getVehicleDisplayName(supplier.vehicleType) }}</span>
                <v-chip size="x-small" color="blue" variant="tonal" class="ml-2">
                  Transporte
                </v-chip>
              </div>
            </div>

            <!-- Actions -->
            <div class="supplier-actions">
              <!-- Show different button states based on inquiry status -->
              <template v-if="!supplierInquiries[supplier.id]">
                <!-- Initial state - Send request -->
                <v-btn color="primary" variant="elevated" size="large" class="action-btn primary-action"
                  :loading="contactingSupplier === supplier.id" @click="handleContactSupplier(supplier)">
                  <v-icon icon="mdi-whatsapp" size="20" class="mr-2"></v-icon>
                  Solicitar Servicio
                </v-btn>
              </template>

              <template v-else-if="supplierInquiries[supplier.id].status === 'pending'">
                <!-- Pending state - Show resend option -->
                <v-btn color="warning" variant="outlined" size="large" class="action-btn" disabled>
                  <v-icon icon="mdi-clock-outline" size="20" class="mr-2"></v-icon>
                  Esperando Respuesta
                </v-btn>
                <v-btn color="secondary" variant="text" size="small" class="mt-2" @click="sendReminder(supplier)">
                  Enviar Recordatorio
                </v-btn>
              </template>

              <template v-else-if="supplierInquiries[supplier.id].status === 'accepted'">
                <!-- Accepted state -->
                <v-btn color="success" variant="tonal" size="large" class="action-btn" disabled>
                  <v-icon icon="mdi-check-circle" size="20" class="mr-2"></v-icon>
                  ¡Servicio Confirmado!
                </v-btn>
              </template>

              <template v-else-if="supplierInquiries[supplier.id].status === 'declined'">
                <!-- Declined state -->
                <v-btn color="error" variant="outlined" size="large" class="action-btn" disabled>
                  <v-icon icon="mdi-close-circle" size="20" class="mr-2"></v-icon>
                  No Disponible
                </v-btn>
              </template>
            </div>

            <!-- Response tracking -->
            <div v-if="supplierInquiries[supplier.id]" class="inquiry-status mt-3">
              <v-chip :color="getInquiryStatusColor(supplierInquiries[supplier.id].status)" size="small"
                variant="tonal">
                <v-icon :icon="getInquiryStatusIcon(supplierInquiries[supplier.id].status)" size="16"
                  class="mr-1"></v-icon>
                {{ getInquiryStatusText(supplierInquiries[supplier.id].status) }}
              </v-chip>

              <span class="inquiry-time ml-2 text-caption text-medium-emphasis">
                {{ formatTimeAgo(supplierInquiries[supplier.id].sentAt) }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Empty State -->
      <v-card v-else class="empty-state-card" variant="tonal" color="grey-lighten-4" rounded="xl">
        <v-card-text class="pa-8 text-center">
          <div class="empty-state-icon">
            <v-icon icon="mdi-account-search-outline" size="80" color="grey-lighten-1"></v-icon>
          </div>

          <h3 class="text-h5 mb-3 font-weight-bold">No hay proveedores compatibles</h3>

          <p class="text-body-1 text-medium-emphasis mb-6 empty-message">
            {{ getEmptyStateMessage() }}
          </p>

          <div class="empty-actions">
            <v-btn color="primary" variant="elevated" size="large" @click="refreshSuppliers" :loading="loading">
              <v-icon icon="mdi-refresh" class="mr-2"></v-icon>
              Buscar nuevamente
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-card-text>

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSuccessSnackbar" color="success" location="bottom center" timeout="4000" rounded="pill">
      <div class="d-flex align-center">
        <v-btn>
          <v-icon icon="mdi-whatsapp" class="mr-2"></v-icon>
          {{ successMessage }}
        </v-btn>
      </div>
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showErrorSnackbar" color="error" location="bottom center" timeout="5000" rounded="pill">
      <div class="d-flex align-center">
        <v-icon icon="mdi-alert-circle" class="mr-2"></v-icon>
        {{ errorMessage }}
      </div>
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, reactive } from 'vue';
import { supplierServiceKey } from '@/services/SupplierService';
import { WhatsappService } from '@/services/whatsapp/WhatsappService'; // Your enhanced service
import type { SupplierView } from '@/views/SupplierView';
import type { ReservationView } from '@/views/ReservationView';

// ✅ Interface for tracking inquiries
interface SupplierInquiry {
  supplierId: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  sentAt: Date;
  expiresAt: Date;
  confirmationUrl: string;
  supplierMessage?: string;
  estimatedArrival?: string;
}

// Props & Emits
interface Props {
  reservation: ReservationView;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'supplier-selected': [supplier: SupplierView];
  'supplier-contacted': [supplier: SupplierView, result: any];
  'supplier-confirmed': [supplier: SupplierView, details: any];
}>();

// Services
const supplierService = inject(supplierServiceKey);

// ✅ Create WhatsApp service instance
const whatsappService = new WhatsappService({
  confirmationBaseUrl: window.location.origin
});

// Reactive Data
const loading = ref(false);
const contactingSupplier = ref<string | null>(null);
const compatibleSuppliers = ref<SupplierView[]>([]);

// ✅ Track inquiries sent to suppliers
const supplierInquiries = reactive<Record<string, SupplierInquiry>>({});

// Notifications
const showSuccessSnackbar = ref(false);
const showErrorSnackbar = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// ✅ Airport transfer detection
function isAirportTransferService(service: string): boolean {
  const airportServices = ['airport-transfer', 'airport-transfers', 'transporte-aeropuerto'];
  const normalizedService = service.toLowerCase();
  return airportServices.some(airportService =>
    normalizedService.includes(airportService) || airportService.includes(normalizedService)
  );
}

// Computed
const isAirportTransfer = computed(() =>
  isAirportTransferService(props.reservation.serviceName || props.reservation.serviceId || '')
);

const searchCriteria = computed(() => {
  const serviceId = props.reservation.serviceId || props.reservation.serviceName;
  const vehicleType = isAirportTransfer.value ? props.reservation.formData?.vehicleType : undefined;

  return {
    serviceId,
    vehicleType
  };
});

// Methods
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getSupplierColor(supplier: SupplierView): string {
  const colors = ['primary', 'secondary', 'info', 'success', 'warning', 'purple', 'indigo', 'teal'];
  const hash = supplier.service.length + supplier.name.length;
  return colors[hash % colors.length];
}

function formatPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

function getVehicleDisplayName(vehicleType: string): string {
  const vehicleTypes: Record<string, string> = {
    'vanSmall': 'Van Pequeña (1-6p)',
    'vanMedium': 'Van Mediana (7-10p)',
    'vanLarge': 'Van Grande (11-16p)',
    'suv': 'SUV (1-6p)'
  };
  return vehicleTypes[vehicleType] || vehicleType;
}

function getSearchDescription(): string {
  if (isAirportTransfer.value && searchCriteria.value.vehicleType) {
    return `Proveedores con vehículo ${getVehicleDisplayName(searchCriteria.value.vehicleType)}`;
  }
  return `Proveedores especializados en ${props.reservation.serviceName}`;
}

function getEmptyStateMessage(): string {
  if (isAirportTransfer.value && searchCriteria.value.vehicleType) {
    return `No encontramos proveedores de transporte aeropuerto con vehículo tipo "${getVehicleDisplayName(searchCriteria.value.vehicleType)}" disponibles.`;
  }
  return `No encontramos proveedores disponibles para "${props.reservation.serviceName}" en este momento.`;
}

// ✅ MAIN ACTION: Contact supplier via WhatsApp
async function handleContactSupplier(supplier: SupplierView) {
  contactingSupplier.value = supplier.id;

  try {
    console.log('📞 Contacting supplier via WhatsApp:', supplier.name);

    // ✅ Prepare reservation summary with all necessary data
    const reservationSummary = {
      bookingId: props.reservation.bookingId,
      serviceName: props.reservation.serviceName,
      date: props.reservation.date,
      time: props.reservation.time,
      clientName: props.reservation.clientName,
      clientPhone: props.reservation.clientPhone,
      clientEmail: props.reservation.clientEmail,
      totalPrice: props.reservation.totalPrice,
      location: extractLocation(props.reservation),
      notes: props.reservation.notes,
      // Include specific service data
      vehicleType: props.reservation.formData?.vehicleType,
      passengerCount: props.reservation.formData?.passengerCount,
      flightNumber: props.reservation.formData?.flightNumber,
      formData: props.reservation.formData
    };

    const supplierInfo = {
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      service: supplier.service
    };

    // ✅ Use enhanced WhatsApp service
    const result = await whatsappService.sendSupplierServiceRequest(
      supplierInfo,
      reservationSummary
    );

    if (result.success) {
      // ✅ Register the sent inquiry for tracking
      supplierInquiries[supplier.id] = {
        supplierId: supplier.id,
        status: 'pending',
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        confirmationUrl: result.confirmationUrl
      };

      showSuccess(`Solicitud enviada a ${supplier.name} por WhatsApp`);
      emit('supplier-contacted', supplier, result);
    } else {
      throw new Error(result.error || 'Error al enviar mensaje');
    }

  } catch (error) {
    console.error('❌ Error contacting supplier:', error);
    showError(`Error al contactar a ${supplier.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  } finally {
    contactingSupplier.value = null;
  }
}

// ✅ Send reminder to supplier
async function sendReminder(supplier: SupplierView) {
  try {
    const inquiry = supplierInquiries[supplier.id];
    if (!inquiry) return;

    const hoursLeft = Math.max(0, Math.floor((inquiry.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)));

    const reservationSummary = {
      bookingId: props.reservation.bookingId,
      serviceName: props.reservation.serviceName,
      date: props.reservation.date,
      time: props.reservation.time,
      clientName: props.reservation.clientName,
      totalPrice: props.reservation.totalPrice
    };

    const supplierInfo = {
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      service: supplier.service
    };

    const result = await whatsappService.sendSupplierReminder(
      supplierInfo,
      reservationSummary,
      hoursLeft
    );

    if (result.success) {
      showSuccess(`Recordatorio enviado a ${supplier.name}`);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Error sending reminder:', error);
    showError(`Error al enviar recordatorio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

async function loadCompatibleSuppliers() {
  if (!supplierService) {
    console.error('❌ SupplierService not available');
    return;
  }

  loading.value = true;
  try {
    console.log('🔍 Loading compatible suppliers with criteria:', searchCriteria.value);

    const suppliers = await supplierService.findCompatibleSuppliers(
      searchCriteria.value.serviceId,
      searchCriteria.value.vehicleType
    );

    compatibleSuppliers.value = suppliers || [];
    console.log(`✅ Found ${compatibleSuppliers.value.length} compatible suppliers`);

  } catch (error) {
    console.error('❌ Error loading compatible suppliers:', error);
    compatibleSuppliers.value = [];
    showError('Error al cargar proveedores');
  } finally {
    loading.value = false;
  }
}

function refreshSuppliers() {
  loadCompatibleSuppliers();
}

// ✅ Status helper functions
function getInquiryStatusColor(status: string): string {
  const colors = {
    pending: 'warning',
    accepted: 'success',
    declined: 'error',
    expired: 'grey'
  };
  return colors[status as keyof typeof colors] || 'info';
}

function getInquiryStatusIcon(status: string): string {
  const icons = {
    pending: 'mdi-clock-outline',
    accepted: 'mdi-check-circle',
    declined: 'mdi-close-circle',
    expired: 'mdi-clock-alert'
  };
  return icons[status as keyof typeof icons] || 'mdi-help-circle';
}

function getInquiryStatusText(status: string): string {
  const texts = {
    pending: 'Pendiente',
    accepted: 'Aceptado',
    declined: 'Rechazado',
    expired: 'Expirado'
  };
  return texts[status as keyof typeof texts] || status;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  return `hace ${Math.floor(diffHours / 24)}d`;
}

// Utility functions
function extractLocation(reservation: ReservationView): string {
  return reservation.formData?.location ||
    reservation.formData?.address ||
    reservation.formData?.deliveryAddress ||
    reservation.formData?.exactAddress ||
    'Por confirmar con el cliente';
}

function showSuccess(message: string) {
  successMessage.value = message;
  showSuccessSnackbar.value = true;
}

function showError(message: string) {
  errorMessage.value = message;
  showErrorSnackbar.value = true;
}

// ✅ CRITICAL: Method to update supplier response status
// This will be called from the SupplierConfirmationView when supplier responds
function updateSupplierResponse(
  supplierId: string,
  status: 'accepted' | 'declined',
  supplierMessage?: string,
  estimatedArrival?: string
) {
  if (supplierInquiries[supplierId]) {
    supplierInquiries[supplierId].status = status;
    supplierInquiries[supplierId].supplierMessage = supplierMessage;
    supplierInquiries[supplierId].estimatedArrival = estimatedArrival;

    // Find the supplier and emit confirmation event
    const supplier = compatibleSuppliers.value.find(s => s.id === supplierId);
    if (supplier && status === 'accepted') {
      emit('supplier-confirmed', supplier, {
        message: supplierMessage,
        estimatedArrival,
        confirmedAt: new Date()
      });
    }
  }
}

// ✅ Expose method for external updates (from parent components)
defineExpose({
  updateSupplierResponse,
  refreshSuppliers
});

// Lifecycle
onMounted(() => {
  loadCompatibleSuppliers();
});
</script>

<style scoped>
/* Previous styles remain the same... */
.title-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

.supplier-count-chip {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
  font-weight: 600;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading-content {
  text-align: center;
}

.suppliers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.supplier-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), 1), rgba(var(--v-theme-surface-variant), 0.3));
  position: relative;
  overflow: hidden;
}

.supplier-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
}

.supplier-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 28px rgba(var(--v-theme-primary), 0.15);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.supplier-header {
  padding: 20px 16px 16px;
  position: relative;
}

.supplier-avatar-section {
  position: relative;
  margin-bottom: 12px;
}

.supplier-avatar {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 3px solid white;
}

.supplier-status-badge {
  position: absolute;
  top: -4px;
  right: -4px;
}

.supplier-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin-bottom: 4px;
  line-height: 1.3;
}

.supplier-email {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
}

.contact-section {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 6px 0;
}

.contact-item.vehicle-info {
  background: rgba(var(--v-theme-blue), 0.05);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-blue), 0.1);
}

.contact-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.contact-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.supplier-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.action-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  border-radius: 10px;
}

.primary-action {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

.primary-action:hover {
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-1px);
}

.inquiry-status {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.inquiry-time {
  font-size: 0.75rem;
}

.empty-state-card {
  border: 2px dashed rgba(var(--v-theme-outline), 0.3);
}

.empty-state-icon {
  margin-bottom: 16px;
  opacity: 0.7;
}

.empty-message {
  max-width: 400px;
  margin: 0 auto;
}

.empty-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 768px) {
  .suppliers-grid {
    grid-template-columns: 1fr;
  }

  .supplier-actions {
    flex-direction: column;
  }

  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
