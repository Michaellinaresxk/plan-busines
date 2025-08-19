<!-- src/UI/components/reservation/ReservationSuppliersSection.vue - Modern Enhanced -->
<template>
  <v-card class="modern-suppliers-section" rounded="xl" elevation="0">

    <!-- 🎯 MODERN HEADER -->
    <div class="modern-header">
      <div class="header-background"></div>
      <v-card-title class="header-content">
        <div class="header-layout">
          <div class="header-main">
            <div class="modern-title-icon">
              <v-icon icon="mdi-account-search" color="white" size="24"></v-icon>
            </div>
            <div class="header-text">
              <h3 class="modern-title">Proveedores Disponibles</h3>
              <p class="modern-subtitle">{{ getSearchDescription() }}</p>
            </div>
          </div>
          <div class="header-badge">
            <v-chip
              color="white"
              variant="elevated"
              size="small"
              class="modern-count-chip">
              <v-icon icon="mdi-account-group" size="14" class="mr-1"></v-icon>
              {{ compatibleSuppliers.length }}
            </v-chip>
          </div>
        </div>
      </v-card-title>
    </div>

    <v-card-text class="modern-content">

      <!-- 🔄 MODERN LOADING STATE -->
      <div v-if="loading" class="modern-loading">
        <div class="loading-card">
          <div class="loading-animation">
            <v-progress-circular
              indeterminate
              color="primary"
              size="40"
              width="3">
            </v-progress-circular>
          </div>
          <h4 class="loading-title">Buscando proveedores...</h4>
          <p class="loading-subtitle">Analizando compatibilidad de servicios</p>
        </div>
      </div>

      <!-- 👥 MODERN SUPPLIERS GRID -->
      <div v-else-if="compatibleSuppliers.length > 0" class="modern-suppliers-grid">
        <div
          v-for="(supplier, index) in compatibleSuppliers"
          :key="supplier.id"
          class="modern-supplier-card"
          :style="{ animationDelay: `${index * 150}ms` }">

          <!-- Card Glow Effect -->
          <div class="card-glow"></div>

          <!-- Supplier Header -->
          <div class="supplier-header-modern">
            <div class="avatar-section">
              <div class="avatar-container">
                <v-avatar
                  :color="getSupplierColor(supplier)"
                  size="60"
                  class="modern-avatar">
                  <span class="avatar-initials">
                    {{ getInitials(supplier.name) }}
                  </span>
                </v-avatar>

                <!-- Status Indicator -->
                <div class="status-indicator">
                  <div class="status-dot"></div>
                </div>
              </div>

              <!-- Supplier Badge -->
              <v-chip
                color="success"
                size="x-small"
                variant="flat"
                class="supplier-badge">
                <v-icon icon="mdi-check-circle" size="10" class="mr-1"></v-icon>
                Verificado
              </v-chip>
            </div>

            <div class="supplier-info-modern">
              <h4 class="supplier-name-modern">{{ supplier.name }}</h4>
              <p class="supplier-email-modern">{{ supplier.email }}</p>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="contact-section-modern">
            <div class="contact-item-modern">
              <div class="contact-icon-modern phone-icon">
                <v-icon icon="mdi-phone" size="14"></v-icon>
              </div>
              <span class="contact-text-modern">{{ formatPhone(supplier.phone) }}</span>
            </div>

            <div class="contact-item-modern">
              <div class="contact-icon-modern service-icon">
                <v-icon icon="mdi-tools" size="14"></v-icon>
              </div>
              <span class="contact-text-modern">{{ supplier.service }}</span>
            </div>

            <!-- Vehicle Type for airport transfer -->
            <div v-if="supplier.vehicleType && isAirportTransfer" class="contact-item-modern vehicle-item">
              <div class="contact-icon-modern vehicle-icon">
                <v-icon icon="mdi-car" size="14"></v-icon>
              </div>
              <span class="contact-text-modern">{{ getVehicleDisplayName(supplier.vehicleType) }}</span>
              <v-chip size="x-small" color="blue" variant="tonal" class="vehicle-chip">
                Transporte
              </v-chip>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="supplier-actions-modern">
            <!-- Initial state - Send request -->
            <template v-if="!supplierInquiries[supplier.id]">
              <v-btn
                color="primary"
                variant="flat"
                size="large"
                class="modern-action-btn primary-modern"
                :loading="contactingSupplier === supplier.id"
                @click="handleContactSupplier(supplier)"
                block>
                <v-icon icon="mdi-whatsapp" size="18" class="mr-2"></v-icon>
                Solicitar Servicio
              </v-btn>
            </template>

            <!-- Pending state -->
            <template v-else-if="supplierInquiries[supplier.id].status === 'pending'">
              <v-btn
                color="warning"
                variant="tonal"
                size="large"
                class="modern-action-btn pending-modern"
                disabled
                block>
                <v-icon icon="mdi-clock-outline" size="18" class="mr-2"></v-icon>
                Esperando Respuesta
              </v-btn>
              <v-btn
                color="secondary"
                variant="text"
                size="small"
                class="reminder-btn"
                @click="sendReminder(supplier)">
                Enviar Recordatorio
              </v-btn>
            </template>

            <!-- Accepted state -->
            <template v-else-if="supplierInquiries[supplier.id].status === 'accepted'">
              <v-btn
                color="success"
                variant="flat"
                size="large"
                class="modern-action-btn accepted-modern"
                disabled
                block>
                <v-icon icon="mdi-check-circle" size="18" class="mr-2"></v-icon>
                ¡Servicio Confirmado!
              </v-btn>
            </template>

            <!-- Declined state -->
            <template v-else-if="supplierInquiries[supplier.id].status === 'declined'">
              <v-btn
                color="error"
                variant="tonal"
                size="large"
                class="modern-action-btn declined-modern"
                disabled
                block>
                <v-icon icon="mdi-close-circle" size="18" class="mr-2"></v-icon>
                No Disponible
              </v-btn>
            </template>
          </div>

          <!-- Inquiry Status -->
          <div v-if="supplierInquiries[supplier.id]" class="inquiry-status-modern">
            <div class="status-container">
              <v-chip
                :color="getInquiryStatusColor(supplierInquiries[supplier.id].status)"
                size="small"
                variant="tonal"
                class="status-chip-modern">
                <v-icon
                  :icon="getInquiryStatusIcon(supplierInquiries[supplier.id].status)"
                  size="12"
                  class="mr-1">
                </v-icon>
                {{ getInquiryStatusText(supplierInquiries[supplier.id].status) }}
              </v-chip>

              <span class="inquiry-time-modern">
                {{ formatTimeAgo(supplierInquiries[supplier.id].sentAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 🚫 MODERN EMPTY STATE -->
      <div v-else class="modern-empty-state">
        <div class="empty-card">
          <div class="empty-icon-container">
            <div class="empty-icon-bg">
              <v-icon icon="mdi-account-search-outline" size="48" class="empty-icon"></v-icon>
            </div>
          </div>

          <div class="empty-content">
            <h3 class="empty-title">No hay proveedores compatibles</h3>
            <p class="empty-message">{{ getEmptyStateMessage() }}</p>
          </div>

          <div class="empty-actions">
            <v-btn
              color="primary"
              variant="flat"
              size="large"
              @click="refreshSuppliers"
              :loading="loading"
              class="refresh-btn">
              <v-icon icon="mdi-refresh" class="mr-2"></v-icon>
              Buscar nuevamente
            </v-btn>
          </div>
        </div>
      </div>

    </v-card-text>

    <!-- Modern Snackbars -->
    <v-snackbar
      v-model="showSuccessSnackbar"
      color="success"
      location="bottom center"
      timeout="4000"
      rounded="xl"
      class="modern-snackbar">
      <div class="snackbar-content">
        <v-icon icon="mdi-whatsapp" class="snackbar-icon"></v-icon>
        <span class="snackbar-text">{{ successMessage }}</span>
      </div>
    </v-snackbar>

    <v-snackbar
      v-model="showErrorSnackbar"
      color="error"
      location="bottom center"
      timeout="5000"
      rounded="xl"
      class="modern-snackbar">
      <div class="snackbar-content">
        <v-icon icon="mdi-alert-circle" class="snackbar-icon"></v-icon>
        <span class="snackbar-text">{{ errorMessage }}</span>
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
/* 🎯 MODERN SUPPLIERS SECTION STYLES */

.modern-suppliers-section {
  background: rgba(var(--v-theme-surface), 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  overflow: hidden;
}

/* 🎨 Modern Header */
.modern-header {
  position: relative;
  background: linear-gradient(135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%);
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  transform: translateX(50px);
}

.header-content {
  position: relative;
  z-index: 2;
  padding: 24px !important;
}

.header-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.modern-title-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-text {
  flex: 1;
}

.modern-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.modern-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.4;
}

.header-badge {
  flex-shrink: 0;
}

.modern-count-chip {
  background: rgba(255, 255, 255, 0.9) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 📱 Modern Content */
.modern-content {
  padding: 24px !important;
}

/* 🔄 Modern Loading */
.modern-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-card {
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.loading-animation {
  margin-bottom: 20px;
}

.loading-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin: 0 0 8px 0;
}

.loading-subtitle {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
}

/* 👥 Modern Suppliers Grid */
.modern-suppliers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.modern-supplier-card {
  background: rgba(var(--v-theme-surface), 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: slideInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modern-supplier-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg,
    rgb(var(--v-theme-primary)),
    rgb(var(--v-theme-secondary)));
  border-radius: 20px 20px 0 0;
}

.modern-supplier-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.card-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg,
    rgba(var(--v-theme-primary), 0.1),
    rgba(var(--v-theme-secondary), 0.1));
  border-radius: 22px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.modern-supplier-card:hover .card-glow {
  opacity: 1;
}

/* 👤 Supplier Header */
.supplier-header-modern {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.avatar-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar-container {
  position: relative;
}

.modern-avatar {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border: 3px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.avatar-initials {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
}

.status-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: rgb(var(--v-theme-success));
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.supplier-badge {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.supplier-info-modern {
  flex: 1;
  min-width: 0;
}

.supplier-name-modern {
  font-size: 1.2rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.9);
  margin: 0 0 6px 0;
  line-height: 1.3;
}

.supplier-email-modern {
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
  font-weight: 500;
}

/* 📞 Contact Section */
.contact-section-modern {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item-modern {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.contact-item-modern:hover {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  transform: translateY(-1px);
}

.vehicle-item {
  background: rgba(var(--v-theme-blue), 0.05) !important;
  border: 1px solid rgba(var(--v-theme-blue), 0.1);
}

.contact-icon-modern {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  flex-shrink: 0;
}

.phone-icon {
  background: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
}

.service-icon {
  background: rgba(var(--v-theme-info), 0.1);
  color: rgb(var(--v-theme-info));
}

.vehicle-icon {
  background: rgba(var(--v-theme-blue), 0.1);
  color: rgb(var(--v-theme-blue));
}

.contact-text-modern {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.8);
  flex: 1;
}

.vehicle-chip {
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: auto;
}

/* 🎯 Modern Actions */
.supplier-actions-modern {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.modern-action-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 12px;
  height: 48px;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.primary-modern {
  background: linear-gradient(135deg,
    rgb(var(--v-theme-primary)),
    rgb(var(--v-theme-secondary)));
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.3);
  color: white;
}

.primary-modern:hover {
  box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-2px);
}

.pending-modern {
  background: rgba(var(--v-theme-warning), 0.1);
  color: rgb(var(--v-theme-warning));
  border: 1px solid rgba(var(--v-theme-warning), 0.3);
}

.accepted-modern {
  background: linear-gradient(135deg,
    rgb(var(--v-theme-success)),
    rgba(var(--v-theme-success), 0.8));
  color: white;
}

.declined-modern {
  background: rgba(var(--v-theme-error), 0.1);
  color: rgb(var(--v-theme-error));
  border: 1px solid rgba(var(--v-theme-error), 0.3);
}

.reminder-btn {
  text-transform: none;
  font-weight: 500;
  font-size: 0.8rem;
}

/* 📊 Inquiry Status */
.inquiry-status-modern {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  padding-top: 16px;
}

.status-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-chip-modern {
  font-weight: 500;
  font-size: 0.75rem;
}

.inquiry-time-modern {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  font-weight: 500;
}

/* 🚫 Modern Empty State */
.modern-empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-card {
  background: rgba(var(--v-theme-surface), 0.6);
  backdrop-filter: blur(20px);
  border: 2px dashed rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 24px;
  padding: 48px 32px;
  text-align: center;
  max-width: 500px;
}

.empty-icon-container {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.empty-icon-bg {
  width: 80px;
  height: 80px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  color: rgba(var(--v-theme-on-surface), 0.4);
}

.empty-content {
  margin-bottom: 32px;
}

.empty-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.8);
  margin: 0 0 12px 0;
}

.empty-message {
  font-size: 0.95rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  line-height: 1.5;
  margin: 0;
}

.empty-actions {
  display: flex;
  justify-content: center;
}

.refresh-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 12px;
  height: 48px;
  background: linear-gradient(135deg,
    rgb(var(--v-theme-primary)),
    rgb(var(--v-theme-secondary)));
  color: white;
}

/* 🔔 Modern Snackbars */
.modern-snackbar :deep(.v-snackbar__wrapper) {
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.snackbar-icon {
  color: white;
}

.snackbar-text {
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}

/* 📱 RESPONSIVE DESIGN */

/* Small phones (320px - 479px) */
@media (max-width: 479px) {
  .modern-content {
    padding: 16px !important;
  }

  .header-content {
    padding: 20px !important;
  }

  .header-layout {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .modern-suppliers-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .modern-supplier-card {
    padding: 20px;
  }

  .supplier-header-modern {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }

  .supplier-info-modern {
    text-align: center;
  }

  .empty-card {
    padding: 32px 20px;
  }
}

/* Medium phones (480px - 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .modern-suppliers-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .header-layout {
    gap: 12px;
  }
}

/* Large phones (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .modern-suppliers-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .modern-content {
    padding: 32px !important;
  }

  .header-content {
    padding: 32px !important;
  }

  .modern-suppliers-grid {
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    gap: 24px;
  }

  .modern-supplier-card {
    padding: 28px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .modern-suppliers-section {
    background: rgba(var(--v-theme-surface), 0.95);
    border-color: rgba(var(--v-theme-on-surface), 0.15);
  }

  .modern-supplier-card,
  .loading-card,
  .empty-card {
    background: rgba(var(--v-theme-surface), 0.9);
    border-color: rgba(var(--v-theme-on-surface), 0.15);
  }

  .contact-item-modern {
    background: rgba(var(--v-theme-surface), 0.4);
  }

  .contact-item-modern:hover {
    background: rgba(var(--v-theme-surface), 0.6);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .modern-supplier-card,
  .contact-item-modern,
  .modern-action-btn {
    animation: none;
    transition: none;
  }

  .modern-supplier-card:hover,
  .contact-item-modern:hover,
  .primary-modern:hover {
    transform: none;
  }

  .status-dot {
    animation: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .modern-supplier-card,
  .loading-card,
  .empty-card {
    border-width: 2px;
  }

  .contact-item-modern {
    border: 1px solid rgba(var(--v-theme-on-surface), 0.3);
  }
}
</style>
