<template>
  <v-app class="professional-reservation-app">
    <!-- 📱 PROFESSIONAL HEADER -->
    <v-app-bar
      elevation="0"
      color="surface"
      class="professional-header"
      height="72">

      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        @click="goBack"
        class="back-btn">
      </v-btn>

      <v-app-bar-title class="header-title-section">
        <div class="title-layout">
          <div class="title-info">
            <span class="main-title">Reserva #{{ reservationIdShort }}</span>
            <span v-if="reservation" class="sub-title">{{ reservation.clientName }}</span>
          </div>
          <v-chip
            v-if="reservation?.status"
            :color="getStatusColor(reservation?.status)"
            variant="flat"
            size="small"
            class="professional-status-chip">
            {{ getStatusText(reservation.status) }}
          </v-chip>
        </div>
      </v-app-bar-title>
    </v-app-bar>

    <!-- 📱 MAIN CONTENT -->
    <v-main class="professional-main">

      <!-- Loading State -->
      <div v-if="loading" class="professional-loading">
        <div class="loading-card">
          <v-progress-circular
            indeterminate
            color="primary"
            size="40"
            width="3">
          </v-progress-circular>
          <h3 class="loading-text">Cargando detalles de la reserva</h3>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="professional-error">
        <v-alert
          type="error"
          variant="tonal"
          class="error-alert"
          :text="error"
          title="Error al cargar la reserva">
        </v-alert>
      </div>

      <!-- Success State -->
      <div v-else-if="reservation" class="professional-content">

        <!-- 🎯 SERVICE OVERVIEW CARD -->
        <v-card class="service-overview-card" elevation="1" rounded="lg">
          <v-card-text class="service-overview-content">

            <!-- Service Header -->
            <div class="service-header-section">
              <div class="service-icon-section">
                <v-avatar
                  :color="getServiceColor(reservation.serviceName)"
                  size="48"
                  class="service-avatar">
                  <v-icon
                    :icon="getServiceIcon(reservation.serviceName)"
                    size="24"
                    color="white">
                  </v-icon>
                </v-avatar>
                <div class="service-title-group">
                  <h1 class="service-name">{{ reservation.serviceName }}</h1>
                  <p class="service-client">{{ reservation.clientName }}</p>
                </div>
              </div>

              <v-chip
                v-if="reservation.isPriority"
                color="error"
                size="small"
                variant="flat"
                prepend-icon="mdi-alert"
                class="priority-chip">
                Prioritario
              </v-chip>
            </div>

            <!-- Service Key Info -->
            <div class="service-key-info">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-icon">
                    <v-icon icon="mdi-calendar" size="16"></v-icon>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Fecha</span>
                    <span class="info-value">{{ formatDate(reservation.date) }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-icon">
                    <v-icon icon="mdi-clock-outline" size="16"></v-icon>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Hora</span>
                    <span class="info-value">{{ reservation.time }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-icon">
                    <v-icon icon="mdi-currency-usd" size="16"></v-icon>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Precio</span>
                    <span class="info-value">${{ reservation.totalPrice }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-icon">
                    <v-icon icon="mdi-clock-time-four-outline" size="16"></v-icon>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Solicitud</span>
                    <span class="info-value">{{ reservation.timeAgo }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Action -->
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-whatsapp"
              @click="contactClient"
              :disabled="actionLoading"
              block
              size="large"
              class="contact-action-btn">
              Contactar Cliente
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- 👤 CLIENT INFORMATION CARD -->
        <v-card class="client-info-card" elevation="1" rounded="lg">
          <v-card-title class="card-title">
            <v-icon icon="mdi-account-circle-outline" class="title-icon"></v-icon>
            <div class="title-text">
              <span class="title-main">Información del Cliente</span>
              <span class="title-sub">Datos de contacto y perfil</span>
            </div>
          </v-card-title>

          <v-divider class="card-divider"></v-divider>

          <v-card-text class="client-info-content">

            <!-- Client Profile -->
            <div class="client-profile-section">
              <v-avatar
                :color="getServiceColor(reservation.serviceName)"
                size="56"
                class="client-avatar">
                <span class="client-initials">
                  {{ getInitials(reservation.clientName) }}
                </span>
              </v-avatar>
              <div class="client-profile-info">
                <h3 class="client-full-name">{{ reservation.clientName }}</h3>
                <p class="client-status">
                  <v-icon
                    :icon="reservation.isNewClient ? 'mdi-account-plus' : 'mdi-account-check'"
                    size="14"
                    class="mr-1">
                  </v-icon>
                  {{ reservation.isNewClient ? 'Cliente Nuevo' : 'Cliente Recurrente' }}
                </p>
              </div>
            </div>

            <!-- Contact Details -->
            <div class="contact-details-section">
              <h4 class="section-subtitle">Contacto</h4>

              <div class="contact-methods">
                <!-- Email -->
                <div class="contact-method">
                  <div class="method-icon">
                    <v-icon icon="mdi-email-outline" size="18"></v-icon>
                  </div>
                  <div class="method-info">
                    <span class="method-label">Correo electrónico</span>
                    <span class="method-value">{{ reservation.clientEmail }}</span>
                  </div>
                  <v-btn
                    icon="mdi-content-copy"
                    variant="text"
                    size="small"
                    @click="copyToClipboard(reservation.clientEmail)"
                    class="method-action">
                  </v-btn>
                </div>

                <!-- Phone -->
                <div class="contact-method">
                  <div class="method-icon">
                    <v-icon icon="mdi-phone-outline" size="18"></v-icon>
                  </div>
                  <div class="method-info">
                    <span class="method-label">Teléfono</span>
                    <span class="method-value">{{ reservation.clientPhone }}</span>
                  </div>
                  <v-btn
                    icon="mdi-phone"
                    variant="text"
                    size="small"
                    @click="callClient"
                    class="method-action">
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- 🛠️ SERVICE DETAILS CARD -->
        <v-card class="service-details-card" elevation="1" rounded="lg">
          <v-card-title class="card-title">
            <v-icon
              :icon="getServiceIcon(reservation.serviceName)"
              class="title-icon">
            </v-icon>
            <div class="title-text">
              <span class="title-main">Detalles del Servicio</span>
              <span class="title-sub">Especificaciones y requerimientos</span>
            </div>
          </v-card-title>

          <v-divider class="card-divider"></v-divider>

          <v-card-text class="service-details-content">
            <ConfirmationDetailsFactory :reservation="reservation" />
          </v-card-text>
        </v-card>

        <!-- 👥 SUPPLIERS CARD -->
        <v-card class="suppliers-card" elevation="1" rounded="lg">
          <v-card-title class="card-title">
            <v-icon icon="mdi-account-hard-hat-outline" class="title-icon"></v-icon>
            <div class="title-text">
              <span class="title-main">Proveedores Disponibles</span>
              <span class="title-sub">Profesionales para este servicio</span>
            </div>
          </v-card-title>

          <v-divider class="card-divider"></v-divider>

          <v-card-text class="suppliers-content">
            <ReservationSuppliersSection
              :reservation="reservation"
              @supplier-selected="handleSupplierSelected"
              @supplier-contacted="handleSupplierContacted" />
          </v-card-text>
        </v-card>

      </div>
    </v-main>

    <!-- 🔔 PROFESSIONAL SNACKBAR -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      location="bottom center"
      timeout="4000"
      rounded="lg"
      class="professional-snackbar">
      <div class="snackbar-content">
        <v-icon :icon="snackbarIcon" class="snackbar-icon" size="small"></v-icon>
        <span class="snackbar-text">{{ snackbarText }}</span>
      </div>
      <template v-slot:actions>
        <v-btn icon="mdi-close" variant="text" size="small" @click="showSnackbar = false"></v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { reservationServiceKey } from '@/services/ReservationService';
import ReservationSuppliersSection from '@/UI/components/reservation/ReservationSuppliersSection.vue';
import ConfirmationDetailsFactory from '@/UI/components/suppliers/confirmation/ConfirmationDetailsFactory.vue';
import type { ReservationView } from '@/views/ReservationView';
import type { SupplierView } from '@/views/SupplierView';

// Router y route
const route = useRoute();
const router = useRouter();

// Services
const reservationService = inject(reservationServiceKey);

// Estado reactivo
const loading = ref(true);
const actionLoading = ref(false);
const error = ref<string | null>(null);
const reservation = ref<ReservationView | null>(null);

// Notificaciones
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarIcon = ref('mdi-check-circle');

// Computed properties
const reservationIdShort = computed(() => {
  const id = route.params.id as string;
  return id ? id.slice(0, 8) : '';
});

const hasTimeline = computed(() => {
  // Por ahora siempre true, en el futuro podríamos tener un historial real
  return true;
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

function getStatusColor(status: string): string {
  const statusColors = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'error',
    'completed': 'info',
    'cancelled': 'grey'
  };
  return statusColors[status as keyof typeof statusColors] || 'primary';
}

function getStatusText(status: string): string {
  const statusTexts = {
    'pending': 'Pendiente',
    'approved': 'Aprobada',
    'rejected': 'Rechazada',
    'completed': 'Completada',
    'cancelled': 'Cancelada'
  };
  return statusTexts[status as keyof typeof statusTexts] || status;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

function formatDateTime(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '';
  }
}

// Métodos principales
async function loadReservation() {
  if (!reservationService) {
    error.value = 'Servicio de reservas no disponible';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    const reservationId = route.params.id as string;
    console.log('🔍 Loading reservation details for ID:', reservationId);

    const reservationData = await reservationService.getReservationById(reservationId);
    reservation.value = reservationData;

    console.log('✅ Reservation loaded successfully:', reservationData);

  } catch (err) {
    console.error('❌ Error loading reservation:', err);
    error.value = err instanceof Error ? err.message : 'Error al cargar la reserva';
  } finally {
    loading.value = false;
  }
}

async function approveReservation() {
  if (!reservation.value || !reservationService) return;

  actionLoading.value = true;
  try {
    await reservationService.approveReservation(reservation.value.bookingId);

    // Actualizar el estado local
    const updatedReservation = await reservationService.getReservationById(reservation.value.bookingId);
    reservation.value = updatedReservation;

    showNotification(
      `Reserva de ${reservation.value.clientName} aprobada exitosamente`,
      'success',
      'mdi-check-circle'
    );
  } catch (err) {
    console.error('Error approving reservation:', err);
    showNotification('Error al aprobar la reserva', 'error', 'mdi-alert-circle');
  } finally {
    actionLoading.value = false;
  }
}

function contactClient() {
  if (!reservation.value) return;

  const phone = reservation.value.clientPhone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${phone}`;
  window.open(whatsappUrl, '_blank');

  showNotification('Abriendo WhatsApp...', 'info', 'mdi-whatsapp');
}

function callClient() {
  if (!reservation.value) return;

  window.open(`tel:${reservation.value.clientPhone}`);
  showNotification('Iniciando llamada...', 'info', 'mdi-phone');
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Copiado al portapapeles', 'success', 'mdi-content-copy');
  } catch (err) {
    console.error('Error copying to clipboard:', err);
    showNotification('Error al copiar', 'error', 'mdi-alert-circle');
  }
}

function goBack() {
  router.back();
}

function handleSupplierSelected(supplier: SupplierView) {
  console.log('🎯 Supplier selected:', supplier.name);
  showNotification(`Proveedor ${supplier.name} seleccionado`, 'info', 'mdi-account-check');
}

function handleSupplierContacted(supplier: SupplierView, result: any) {
  console.log('📞 Supplier contacted:', supplier.name, result);
  showNotification(
    `Consulta enviada a ${supplier.name} por WhatsApp`,
    'success',
    'mdi-whatsapp'
  );
}

function showNotification(message: string, color: 'success' | 'error' | 'info' | 'warning', icon: string) {
  snackbarText.value = message;
  snackbarColor.value = color;
  snackbarIcon.value = icon;
  showSnackbar.value = true;
}

// Lifecycle
onMounted(() => {
  loadReservation();
});
</script>

<style scoped>
/* 🎯 PROFESSIONAL DESIGN SYSTEM */

.professional-reservation-app {
  background: #fafafa;
}

/* 📱 Professional Header */
.professional-header {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.back-btn {
  margin-left: -8px;
  color: rgba(0, 0, 0, 0.7);
}

.header-title-section {
  flex: 1;
}

.title-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.title-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.main-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  line-height: 1.2;
}

.sub-title {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 400;
  margin-top: 2px;
}

.professional-status-chip {
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
}

/* 📱 Main Content */
.professional-main {
  background: #fafafa;
  padding-top: 8px;
}

.professional-content {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 🔄 Loading State */
.professional-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 20px;
}

.loading-card {
  background: white;
  padding: 32px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading-text {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
  margin: 0;
  text-align: center;
}

/* ❌ Error State */
.professional-error {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.error-alert {
  border-radius: 12px;
}

/* 📄 Card System */
.service-overview-card,
.client-info-card,
.service-details-card,
.suppliers-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.service-overview-card:hover,
.client-info-card:hover,
.service-details-card:hover,
.suppliers-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.12);
}

/* 🎯 Service Overview Card */
.service-overview-content {
  padding: 24px;
}

.service-header-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.service-icon-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.service-avatar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.service-title-group {
  flex: 1;
  min-width: 0;
}

.service-name {
  font-size: 1.4rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.service-client {
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
  font-weight: 400;
}

.priority-chip {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
}

.service-key-info {
  margin-bottom: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-icon {
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

.contact-action-btn {
  text-transform: none;
  font-weight: 600;
  font-size: 1rem;
  height: 48px;
  border-radius: 12px;
}

/* 📄 Card Titles */
.card-title {
  padding: 20px 24px 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  color: rgba(0, 0, 0, 0.6);
  background: #f8f9fa;
  padding: 8px;
  border-radius: 8px;
  width: 36px;
  height: 36px;
}

.title-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title-main {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  line-height: 1.2;
}

.title-sub {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 400;
}

.card-divider {
  margin: 0 24px;
  opacity: 0.3;
}

/* 👤 Client Info Card */
.client-info-content {
  padding: 24px;
}

.client-profile-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.client-avatar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.client-initials {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
}

.client-profile-info {
  flex: 1;
}

.client-full-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 4px 0;
}

.client-status {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
  display: flex;
  align-items: center;
}

.contact-details-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-subtitle {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.contact-method:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.method-icon {
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.method-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.method-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.method-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  word-break: break-word;
}

.method-action {
  color: rgba(0, 0, 0, 0.6);
}

/* 🛠️ Service Details Card */
.service-details-content {
  padding: 24px;
}

/* 👥 Suppliers Card */
.suppliers-content {
  padding: 24px;
}

/* 🔔 Professional Snackbar */
.professional-snackbar {
  margin-bottom: 20px;
}

.professional-snackbar :deep(.v-snackbar__wrapper) {
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.87) !important;
  backdrop-filter: blur(10px);
}

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.snackbar-icon {
  color: white;
}

.snackbar-text {
  color: white;
  font-weight: 500;
}

/* 📱 RESPONSIVE BREAKPOINTS */

/* Extra small phones (320px - 359px) */
@media (max-width: 359px) {
  .professional-content {
    padding: 12px;
    gap: 16px;
  }

  .service-overview-content,
  .client-info-content,
  .service-details-content,
  .suppliers-content {
    padding: 16px;
  }

  .card-title {
    padding: 16px 16px 12px 16px;
  }

  .card-divider {
    margin: 0 16px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .service-header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

/* Small phones (360px - 479px) */
@media (min-width: 360px) and (max-width: 479px) {
  .professional-content {
    padding: 14px;
    gap: 18px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

/* Medium phones (480px - 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .professional-content {
    padding: 16px;
    gap: 20px;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

/* Large phones and tablets (768px+) */
@media (min-width: 768px) {
  .professional-content {
    padding: 24px;
    max-width: 800px;
  }

  .info-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .contact-methods {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .professional-content {
    max-width: 1000px;
    padding: 32px;
    gap: 24px;
  }

  .service-overview-content,
  .client-info-content,
  .service-details-content,
  .suppliers-content {
    padding: 32px;
  }

  .card-title {
    padding: 24px 32px 20px 32px;
  }

  .card-divider {
    margin: 0 32px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .professional-reservation-app {
    background: #121212;
  }

  .professional-header {
    background: rgba(18, 18, 18, 0.95) !important;
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }

  .back-btn {
    color: rgba(255, 255, 255, 0.7);
  }

  .main-title {
    color: rgba(255, 255, 255, 0.87);
  }

  .sub-title {
    color: rgba(255, 255, 255, 0.6);
  }

  .professional-main {
    background: #121212;
  }

  .service-overview-card,
  .client-info-card,
  .service-details-card,
  .suppliers-card,
  .loading-card {
    background: #1e1e1e;
    border-color: rgba(255, 255, 255, 0.12);
  }

  .info-item,
  .client-profile-section,
  .contact-method {
    background: #2a2a2a;
  }

  .info-icon,
  .method-icon,
  .title-icon {
    background: #2a2a2a;
    color: rgba(255, 255, 255, 0.6);
  }

  .service-name,
  .client-full-name,
  .title-main,
  .loading-text,
  .info-value,
  .method-value {
    color: rgba(255, 255, 255, 0.87);
  }

  .service-client,
  .client-status,
  .title-sub,
  .info-label,
  .method-label,
  .section-subtitle {
    color: rgba(255, 255, 255, 0.6);
  }

  .contact-method:hover {
    background: #333333;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .service-overview-card,
  .client-info-card,
  .service-details-card,
  .suppliers-card,
  .contact-method {
    transition: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .service-overview-card,
  .client-info-card,
  .service-details-card,
  .suppliers-card {
    border-width: 2px;
  }

  .info-item,
  .client-profile-section,
  .contact-method {
    border: 1px solid rgba(0, 0, 0, 0.2);
  }
}
</style>
