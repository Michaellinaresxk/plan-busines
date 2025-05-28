<template>
  <div class="suppliers-section">
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-h6 font-weight-bold">
        <v-icon icon="mdi-account-hard-hat" class="mr-2"></v-icon>
        Proveedores Disponibles
      </h3>

      <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-refresh" :loading="loading"
        @click="refreshSuppliers">
        Actualizar
      </v-btn>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="d-flex justify-center align-center py-6">
      <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
      <span class="ml-3 text-body-2">Cargando proveedores...</span>
    </div>

    <!-- Sin proveedores -->
    <v-card v-else-if="suppliers.length === 0" class="pa-6 text-center" variant="tonal" color="grey-lighten-4">
      <v-icon icon="mdi-account-off" size="48" color="grey-lighten-1" class="mb-3"></v-icon>
      <h4 class="text-subtitle-1 font-weight-bold mb-2">No hay proveedores disponibles</h4>
      <p class="text-body-2 text-medium-emphasis mb-0">
        No se encontraron proveedores para el servicio: <strong>{{ reservation.serviceName }}</strong>
      </p>
    </v-card>

    <!-- Lista de proveedores -->
    <div v-else class="suppliers-list">
      <v-card v-for="supplier in suppliers" :key="supplier.id" class="supplier-item mb-3"
        :color="supplier.canProvideService ? 'default' : 'grey-lighten-4'" variant="outlined" rounded="lg">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between">
            <!-- Info del proveedor -->
            <div class="d-flex align-center flex-grow-1">
              <v-avatar :color="supplier.canProvideService ? 'primary' : 'grey'" size="40" class="mr-3">
                <span class="text-white font-weight-bold">
                  {{ getInitials(supplier.name) }}
                </span>
              </v-avatar>

              <div class="supplier-info">
                <h5 class="text-subtitle-2 font-weight-bold mb-1">
                  {{ supplier.name }}
                  <v-chip :color="supplier.canProvideService ? 'success' : 'error'" size="x-small" variant="flat"
                    class="ml-2">
                    {{ supplier.canProvideService ? 'Activo' : 'Inactivo' }}
                  </v-chip>
                </h5>

                <div class="contact-info">
                  <div class="d-flex align-center mb-1">
                    <v-icon icon="mdi-email-outline" size="14" class="mr-2"></v-icon>
                    <span class="text-body-2">{{ supplier.email }}</span>
                  </div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-phone-outline" size="14" class="mr-2"></v-icon>
                    <span class="text-body-2">{{ supplier.phone }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div class="supplier-actions">
              <v-btn color="success" size="small" variant="elevated" prepend-icon="mdi-whatsapp"
                :disabled="!supplier.canProvideService || processingSupplier === supplier.id"
                :loading="processingSupplier === supplier.id" @click="consultSupplier(supplier)"
                class="whatsapp-consult-btn">
                {{ processingSupplier === supplier.id ? 'Enviando...' : 'Consultar por WhatsApp' }}
              </v-btn>
            </div>
          </div>

          <!-- Indicador de solicitud enviada -->
          <div v-if="sentRequests.has(supplier.id)" class="sent-indicator mt-3">
            <v-alert color="info" variant="tonal" density="compact" prepend-icon="mdi-check-circle" class="text-body-2">
              Solicitud enviada por WhatsApp - {{ getSentTime(supplier.id) }}
              <template v-slot:append>
                <v-btn size="x-small" color="warning" variant="text" @click="sendReminder(supplier)"
                  :loading="sendingReminder === supplier.id">
                  {{ sendingReminder === supplier.id ? 'Enviando...' : 'Recordatorio' }}
                </v-btn>
              </template>
            </v-alert>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Panel de seguimiento -->
    <v-card v-if="sentRequests.size > 0" class="mt-6" variant="tonal" color="primary">
      <v-card-title class="text-subtitle-1 pa-4">
        <v-icon icon="mdi-whatsapp" class="mr-2"></v-icon>
        Solicitudes Enviadas ({{ sentRequests.size }})
      </v-card-title>
      <v-card-text class="pt-0">
        <p class="text-body-2 text-medium-emphasis">
          Se han enviado {{ sentRequests.size }} solicitudes por WhatsApp para la reserva
          <strong>#{{ reservation.bookingId }}</strong>.
          Los proveedores pueden confirmar su disponibilidad a través del enlace enviado.
        </p>

        <!-- Debug: Mostrar última URL generada -->
        <div v-if="lastGeneratedUrl" class="mt-3">
          <v-btn size="x-small" color="primary" variant="outlined" prepend-icon="mdi-link"
            @click="showUrlDialog = true">
            Ver URL de confirmación
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Snackbar para notificaciones -->
    <v-snackbar v-model="showNotification" :color="notificationColor" location="bottom end" timeout="4000">
      <div class="d-flex align-center">
        <v-icon :icon="notificationIcon" class="mr-2" size="small"></v-icon>
        {{ notificationMessage }}
      </div>
      <template v-slot:actions>
        <v-btn icon="mdi-close" variant="text" @click="showNotification = false"></v-btn>
      </template>
    </v-snackbar>

    <!-- Dialog para mostrar URL (debugging) -->
    <v-dialog v-model="showUrlDialog" max-width="600">
      <v-card>
        <v-card-title>URL de Confirmación Generada</v-card-title>
        <v-card-text>
          <v-text-field :model-value="lastGeneratedUrl" label="URL de confirmación" readonly variant="outlined"
            class="mb-3"></v-text-field>
          <p class="text-body-2 text-medium-emphasis">
            Esta URL se envía automáticamente a los proveedores por WhatsApp.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="copyUrlToClipboard">Copiar</v-btn>
          <v-btn @click="showUrlDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { supplierServiceKey } from '@/services/SupplierService';
import { WhatsappService, type ReservationSummary, type SupplierInfo } from '@/services/whatsapp/WhatsappService';
import type { SupplierView } from '@/views/SupplierView';
import type { ReservationView } from '@/views/ReservationView';

// Props
const props = defineProps<{
  reservation: ReservationView;
}>();

// Emits
const emit = defineEmits<{
  'supplier-selected': [supplier: SupplierView];
  'supplier-contacted': [supplier: SupplierView, result: { success: boolean; confirmationUrl?: string; }];
}>();

// Services
const supplierService = inject(supplierServiceKey);
const whatsappService = new WhatsappService();

// Estado
const loading = ref(false);
const suppliers = ref<SupplierView[]>([]);
const processingSupplier = ref<string | null>(null);
const sendingReminder = ref<string | null>(null);

// Control de solicitudes enviadas
const sentRequests = ref<Map<string, Date>>(new Map());

// Sistema de notificaciones
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationColor = ref<'success' | 'error' | 'info' | 'warning'>('success');
const notificationIcon = ref('mdi-check-circle');

// Debug URL
const showUrlDialog = ref(false);
const lastGeneratedUrl = ref('');

// Métodos
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * 🎯 MÉTODO PRINCIPAL: Consultar proveedor por WhatsApp
 */
async function consultSupplier(supplier: SupplierView): Promise<void> {
  console.log('🎯 Starting supplier consultation:', {
    supplier: supplier.name,
    bookingId: props.reservation.bookingId,
    supplierId: supplier.id
  });

  processingSupplier.value = supplier.id;

  try {
    // Preparar datos del proveedor
    const supplierInfo: SupplierInfo = {
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      service: supplier.service
    };

    // Preparar resumen de la reserva
    const reservationSummary: ReservationSummary = {
      bookingId: props.reservation.bookingId,
      serviceName: props.reservation.serviceName,
      date: props.reservation.date,
      time: props.reservation.time,
      clientName: props.reservation.clientName,
      clientPhone: props.reservation.clientPhone,
      clientEmail: props.reservation.clientEmail,
      totalPrice: props.reservation.totalPrice,
      location: getReservationLocation(),
      notes: props.reservation.notes
    };

    // Enviar solicitud por WhatsApp
    const result = await whatsappService.sendSupplierServiceRequest(supplierInfo, reservationSummary);

    if (result.success) {
      // Marcar como enviado
      sentRequests.value.set(supplier.id, new Date());
      lastGeneratedUrl.value = result.confirmationUrl;

      // Emitir eventos
      emit('supplier-selected', supplier);
      emit('supplier-contacted', supplier, result);

      // Mostrar notificación de éxito
      displayNotification(
        `✅ Solicitud enviada a ${supplier.name} por WhatsApp`,
        'success',
        'mdi-whatsapp'
      );

      console.log('✅ WhatsApp consultation sent successfully', {
        confirmationUrl: result.confirmationUrl
      });
    } else {
      throw new Error(result.error || 'Error desconocido al enviar WhatsApp');
    }

  } catch (error) {
    console.error('❌ Error sending WhatsApp consultation:', error);

    displayNotification(
      `❌ Error al contactar a ${supplier.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      'error',
      'mdi-alert-circle'
    );
  } finally {
    processingSupplier.value = null;
  }
}

/**
 * Enviar recordatorio al proveedor
 */
async function sendReminder(supplier: SupplierView): Promise<void> {
  console.log('📢 Sending reminder to supplier:', supplier.name);

  sendingReminder.value = supplier.id;

  try {
    const supplierInfo: SupplierInfo = {
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      service: supplier.service
    };

    const reservationSummary = {
      bookingId: props.reservation.bookingId,
      serviceName: props.reservation.serviceName,
      date: props.reservation.date,
      time: props.reservation.time,
      clientName: props.reservation.clientName,
      totalPrice: props.reservation.totalPrice
    };

    const result = await whatsappService.sendSupplierReminder(supplierInfo, reservationSummary, 12);

    if (result.success) {
      displayNotification(
        `📢 Recordatorio enviado a ${supplier.name}`,
        'warning',
        'mdi-bell-ring'
      );
    } else {
      throw new Error(result.error || 'Error enviando recordatorio');
    }

  } catch (error) {
    console.error('❌ Error sending reminder:', error);
    displayNotification(
      `❌ Error enviando recordatorio: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      'error',
      'mdi-alert-circle'
    );
  } finally {
    sendingReminder.value = null;
  }
}

/**
 * Obtener ubicación de la reserva
 */
function getReservationLocation(): string {
  const plainObj = props.reservation.toPlainObject();

  return plainObj.location ||
    plainObj.exactAddress ||
    plainObj.deliveryAddress ||
    'Por confirmar con el cliente';
}

/**
 * Obtener hora de envío formateada
 */
function getSentTime(supplierId: string): string {
  const sentDate = sentRequests.value.get(supplierId);
  if (!sentDate) return '';

  return sentDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Mostrar notificaciones del sistema
 */
function displayNotification(
  message: string,
  color: 'success' | 'error' | 'info' | 'warning',
  icon: string
): void {
  notificationMessage.value = message;
  notificationColor.value = color;
  notificationIcon.value = icon;
  showNotification.value = true;
}

/**
 * Copiar URL al portapapeles
 */
async function copyUrlToClipboard(): Promise<void> {
  try {
    await navigator.clipboard.writeText(lastGeneratedUrl.value);
    displayNotification('URL copiada al portapapeles', 'success', 'mdi-content-copy');
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    displayNotification('Error al copiar URL', 'error', 'mdi-alert-circle');
  }
}

/**
 * Cargar proveedores disponibles
 */
async function loadSuppliers(): Promise<void> {
  if (!supplierService) {
    console.error('❌ SupplierService not available');
    return;
  }

  loading.value = true;
  try {
    console.log('🔍 Loading suppliers for service:', {
      serviceId: props.reservation.serviceId,
      serviceName: props.reservation.serviceName
    });

    const serviceSuppliers = await supplierService.getSuppliersByService(
      props.reservation.serviceId || props.reservation.serviceName
    );

    suppliers.value = serviceSuppliers || [];

    console.log(`✅ Loaded ${suppliers.value.length} suppliers for service: ${props.reservation.serviceName}`);

    suppliers.value.forEach(supplier => {
      console.log(`  - Found: ${supplier.name} (${supplier.service}) - Active: ${supplier.canProvideService}`);
    });

  } catch (error) {
    console.error('❌ Error loading suppliers:', error);
    suppliers.value = [];

    displayNotification(
      'Error cargando proveedores',
      'error',
      'mdi-alert-circle'
    );
  } finally {
    loading.value = false;
  }
}

/**
 * Refrescar lista de proveedores
 */
async function refreshSuppliers(): Promise<void> {
  await loadSuppliers();
}

// Lifecycle
onMounted(() => {
  loadSuppliers();
});
</script>

<style scoped>
.suppliers-section {
  width: 100%;
}

.suppliers-list {
  max-height: 400px;
  overflow-y: auto;
}

.supplier-item {
  transition: all 0.3s ease;
}

.supplier-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.supplier-info {
  flex-grow: 1;
  min-width: 0;
}

.contact-info {
  margin-top: 4px;
}

.supplier-actions {
  margin-left: 16px;
}

/* Botón WhatsApp */
.whatsapp-consult-btn {
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);
  transition: all 0.3s ease;
}

.whatsapp-consult-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
}

.whatsapp-consult-btn:disabled {
  transform: none !important;
}

/* Indicador de envío */
.sent-indicator {
  border-left: 3px solid rgb(var(--v-theme-success));
  padding-left: 12px;
  background-color: rgba(var(--v-theme-success), 0.05);
  border-radius: 0 8px 8px 0;
}

/* Responsive */
@media (max-width: 600px) {
  .d-flex.align-center.justify-space-between {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .supplier-actions {
    margin-left: 0;
    margin-top: 12px;
    width: 100%;
  }

  .whatsapp-consult-btn {
    width: 100%;
  }
}

/* Scrollbar styling */
.suppliers-list::-webkit-scrollbar {
  width: 6px;
}

.suppliers-list::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 3px;
}

.suppliers-list::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}

.suppliers-list::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}
</style>
