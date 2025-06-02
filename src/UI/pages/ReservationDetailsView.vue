<template>
  <v-app>
    <!-- Header compacto -->
    <v-app-bar elevation="0" color="transparent" class="px-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" class="mr-2"></v-btn>

      <v-app-bar-title class="font-weight-bold">
        Reserva #{{ reservationIdShort }}
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- Status chip -->
      <v-chip :color="getStatusColor(reservation?.status)" variant="elevated" class="font-weight-bold"
        v-if="reservation?.status">
        {{ getStatusText(reservation.status) }}
      </v-chip>
    </v-app-bar>

    <!-- Contenido principal -->
    <v-main>
      <v-container class="pa-4 pa-md-6" style="max-width: 1200px;">

        <!-- Loading State -->
        <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 60vh;">
          <div class="text-center">
            <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
            <h3 class="text-h6 mb-2">Cargando detalles...</h3>
            <p class="text-body-2 text-medium-emphasis">Obteniendo información de la reserva</p>
          </div>
        </div>

        <!-- Error State -->
        <v-alert v-else-if="error" type="error" variant="tonal" class="ma-4" :text="error"
          title="Error al cargar la reserva"></v-alert>

        <!-- Success State -->
        <template v-else-if="reservation">

          <!-- Hero Section -->
          <div class="hero-section mb-8">
            <v-card :color="getServiceColor(reservation.serviceName)" class="hero-card text-white" rounded="xl"
              elevation="8">
              <div class="hero-background"></div>
              <v-card-text class="pa-8 position-relative">
                <v-row align="center">
                  <v-col cols="12" md="8">
                    <div class="d-flex align-center mb-4">
                      <v-avatar :color="getServiceColor(reservation.serviceName)" size="64" class="mr-4 hero-avatar">
                        <v-icon :icon="getServiceIcon(reservation.serviceName)" size="32"></v-icon>
                      </v-avatar>
                      <div>
                        <h1 class="text-h4 font-weight-bold mb-1">{{ reservation.serviceName }}</h1>
                        <p class="text-h6 mb-0 opacity-90">{{ reservation.clientName }}</p>
                      </div>
                    </div>

                    <div class="d-flex flex-wrap gap-4 mb-4">
                      <div class="hero-detail">
                        <v-icon icon="mdi-calendar" class="mr-2"></v-icon>
                        {{ formatDate(reservation.date) }}
                      </div>
                      <div class="hero-detail">
                        <v-icon icon="mdi-clock" class="mr-2"></v-icon>
                        {{ reservation.time }}
                      </div>
                      <div class="hero-detail">
                        <v-icon icon="mdi-currency-usd" class="mr-2"></v-icon>
                        ${{ reservation.totalPrice }}
                      </div>
                    </div>
                  </v-col>

                  <v-col cols="12" md="4" class="text-center text-md-right">
                    <div class="hero-actions">
                      <v-btn v-if="reservation.status === 'pending'" color="success" size="large" variant="elevated"
                        prepend-icon="mdi-check" class="mb-2 mb-md-3" @click="approveReservation"
                        :loading="actionLoading" block>
                        Aprobar Reserva
                      </v-btn>

                      <v-btn color="white" variant="outlined" prepend-icon="mdi-whatsapp" @click="contactClient"
                        :disabled="actionLoading" block>
                        Contactar Cliente
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </div>

          <!-- Main Content Grid -->
          <v-row>
            <!-- Información del Cliente -->
            <v-col cols="12" lg="4">
              <v-card class="mb-6 client-card" rounded="xl" elevation="0" border>
                <v-card-title class="pa-6 pb-4">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-account-circle" color="primary" size="28" class="mr-3"></v-icon>
                    <div>
                      <h3 class="text-h6 font-weight-bold mb-1">Información del Cliente</h3>
                      <p class="text-body-2 text-medium-emphasis mb-0">Datos de contacto</p>
                    </div>
                  </div>
                </v-card-title>

                <v-divider></v-divider>

                <v-card-text class="pa-6">
                  <div class="client-avatar-section mb-6">
                    <v-avatar :color="getServiceColor(reservation.serviceName)" size="80" class="mb-4">
                      <span class="text-h4 font-weight-bold">
                        {{ getInitials(reservation.clientName) }}
                      </span>
                    </v-avatar>
                    <h4 class="text-h5 font-weight-bold mb-1">{{ reservation.clientName }}</h4>
                    <p class="text-body-1 text-medium-emphasis">
                      {{ reservation.isNewClient ? 'Cliente Nuevo' : 'Cliente Recurrente' }}
                    </p>
                  </div>

                  <div class="contact-list">
                    <div class="contact-item">
                      <div class="contact-icon">
                        <v-icon icon="mdi-email" color="primary"></v-icon>
                      </div>
                      <div class="contact-details">
                        <p class="contact-label">Email</p>
                        <p class="contact-value">{{ reservation.clientEmail }}</p>
                      </div>
                      <v-btn icon="mdi-content-copy" variant="text" size="small"
                        @click="copyToClipboard(reservation.clientEmail)"></v-btn>
                    </div>

                    <div class="contact-item">
                      <div class="contact-icon">
                        <v-icon icon="mdi-phone" color="primary"></v-icon>
                      </div>
                      <div class="contact-details">
                        <p class="contact-label">Teléfono</p>
                        <p class="contact-value">{{ reservation.clientPhone }}</p>
                      </div>
                      <v-btn icon="mdi-phone" variant="text" size="small" @click="callClient"></v-btn>
                    </div>

                    <div class="contact-item">
                      <div class="contact-icon">
                        <v-icon icon="mdi-clock-time-four" color="primary"></v-icon>
                      </div>
                      <div class="contact-details">
                        <p class="contact-label">Solicitud realizada</p>
                        <p class="contact-value">{{ reservation.timeAgo }}</p>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Timeline de acciones (si existe historial) -->
              <v-card class="timeline-card" rounded="xl" elevation="0" border v-if="hasTimeline">
                <v-card-title class="pa-6 pb-4">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-timeline" color="primary" size="28" class="mr-3"></v-icon>
                    <div>
                      <h3 class="text-h6 font-weight-bold mb-1">Historial</h3>
                      <p class="text-body-2 text-medium-emphasis mb-0">Actividad de la reserva</p>
                    </div>
                  </div>
                </v-card-title>

                <v-divider></v-divider>

                <v-card-text class="pa-6">
                  <v-timeline side="end" density="compact">
                    <v-timeline-item dot-color="primary" size="small">
                      <div class="timeline-content">
                        <p class="font-weight-medium mb-1">Reserva creada</p>
                        <p class="text-body-2 text-medium-emphasis">{{ formatDateTime(reservation.bookingDate) }}</p>
                      </div>
                    </v-timeline-item>
                  </v-timeline>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Detalles del Servicio -->
            <v-col cols="12" lg="8">
              <!-- Service Details Card -->
              <v-card class="mb-6 service-details-card" rounded="xl" elevation="0" border>
                <v-card-title class="pa-6 pb-4">
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-icon :icon="getServiceIcon(reservation.serviceName)" color="primary" size="28"
                        class="mr-3"></v-icon>
                      <div>
                        <h3 class="text-h6 font-weight-bold mb-1">Detalles del Servicio</h3>
                        <p class="text-body-2 text-medium-emphasis mb-0">Información específica</p>
                      </div>
                    </div>

                    <v-chip v-if="reservation.isPriority" color="error" variant="elevated"
                      prepend-icon="mdi-priority-high" class="font-weight-bold">
                      Prioritario
                    </v-chip>
                  </div>
                </v-card-title>

                <v-divider></v-divider>

                <v-card-text class="pa-6">
                  <!-- Componente dinámico para detalles específicos -->
                  <ConfirmationDetailsFactory :reservation="reservation" />
                </v-card-text>
              </v-card>

              <!-- Suppliers Section -->
              <ReservationSuppliersSection :reservation="reservation" @supplier-selected="handleSupplierSelected"
                @supplier-contacted="handleSupplierContacted" />
            </v-col>
          </v-row>

        </template>
      </v-container>
    </v-main>

    <!-- Snackbar para notificaciones -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" location="bottom end" timeout="4000" rounded="pill">
      <div class="d-flex align-center">
        <v-icon :icon="snackbarIcon" class="mr-2" size="small"></v-icon>
        {{ snackbarText }}
      </div>
      <template v-slot:actions>
        <v-btn icon="mdi-close" variant="text" @click="showSnackbar = false"></v-btn>
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
/* Hero Section */
.hero-section {
  margin-bottom: 2rem;
}

.hero-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--hero-color-start), var(--hero-color-end));
}

.hero-background {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  transform: translate(50px, -50px);
}

.hero-avatar {
  background-color: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.hero-detail {
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 1rem;
}

.hero-actions {
  min-width: 200px;
}

/* Cards */
.client-card,
.service-details-card,
.timeline-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.client-card:hover,
.service-details-card:hover,
.timeline-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Client section */
.client-avatar-section {
  text-align: center;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.contact-item:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  transform: translateX(4px);
}

.contact-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.contact-details {
  flex: 1;
}

.contact-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0 0 4px 0;
}

.contact-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin: 0;
}

/* Timeline */
.timeline-content {
  padding-left: 1rem;
}

/* Responsive design */
@media (max-width: 960px) {
  .hero-card .v-row {
    text-align: center;
  }

  .hero-actions {
    min-width: auto;
    width: 100%;
  }

  .hero-detail {
    justify-content: center;
    font-size: 0.9rem;
  }
}

@media (max-width: 600px) {
  .hero-background {
    display: none;
  }

  .contact-item {
    padding: 0.75rem;
  }

  .contact-icon {
    width: 36px;
    height: 36px;
  }
}

/* Animaciones */
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

.v-card {
  animation: slideInUp 0.6s ease-out;
}

.v-card:nth-child(2) {
  animation-delay: 0.1s;
}

.v-card:nth-child(3) {
  animation-delay: 0.2s;
}
</style>
