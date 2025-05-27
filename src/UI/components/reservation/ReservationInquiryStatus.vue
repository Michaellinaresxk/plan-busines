<template>
  <div class="inquiry-status-container">
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center py-4">
      <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
      <span class="ml-2 text-body-2">Cargando consultas...</span>
    </div>

    <!-- No Inquiries -->
    <div v-else-if="inquiries.length === 0" class="no-inquiries">
      <v-icon icon="mdi-information-outline" size="20" color="grey-lighten-1" class="mr-2"></v-icon>
      <span class="text-body-2 text-medium-emphasis">No hay consultas a proveedores</span>
    </div>

    <!-- Inquiries List -->
    <div v-else class="inquiries-list">
      <h4 class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
        <v-icon icon="mdi-account-search" size="18" class="mr-2"></v-icon>
        Consultas a Proveedores ({{ inquiries.length }})
      </h4>

      <div class="inquiry-cards">
        <v-card v-for="inquiry in sortedInquiries" :key="inquiry.id" class="inquiry-card mb-3"
          :color="getInquiryColor(inquiry.status)" variant="tonal" rounded="lg">
          <v-card-text class="pa-4">
            <!-- Header -->
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center">
                <v-avatar :color="getStatusColor(inquiry.status)" size="32" class="mr-3">
                  <v-icon :icon="getStatusIcon(inquiry.status)" size="16" color="white"></v-icon>
                </v-avatar>

                <div>
                  <h5 class="text-subtitle-2 font-weight-bold">{{ inquiry.supplierName }}</h5>
                  <p class="text-caption text-medium-emphasis mb-0">
                    {{ formatDate(inquiry.inquiryDate) }}
                  </p>
                </div>
              </div>

              <v-chip :color="getStatusColor(inquiry.status)" size="small" variant="flat" class="font-weight-medium">
                {{ getStatusText(inquiry.status) }}
              </v-chip>
            </div>

            <!-- Contact Info -->
            <div class="contact-info mb-3">
              <div class="contact-item">
                <v-icon icon="mdi-email-outline" size="14" class="mr-2"></v-icon>
                <span class="text-body-2">{{ inquiry.supplierEmail }}</span>
              </div>
              <div class="contact-item">
                <v-icon icon="mdi-phone-outline" size="14" class="mr-2"></v-icon>
                <span class="text-body-2">{{ inquiry.supplierPhone }}</span>
              </div>
            </div>

            <!-- Inquiry Message -->
            <div class="inquiry-message mb-3">
              <p class="text-body-2">{{ truncateText(inquiry.message, 120) }}</p>
              <v-btn v-if="inquiry.message.length > 120" variant="text" size="x-small" color="primary"
                @click="toggleExpanded(inquiry.id)">
                {{ expandedMessages.has(inquiry.id) ? 'Ver menos' : 'Ver más' }}
              </v-btn>
            </div>

            <!-- Supplier Response -->
            <div v-if="inquiry.supplierResponse" class="supplier-response mb-3">
              <v-divider class="mb-2"></v-divider>
              <div class="d-flex align-items-start">
                <v-icon icon="mdi-reply" size="16" color="primary" class="mr-2 mt-1"></v-icon>
                <div class="flex-grow-1">
                  <p class="text-caption font-weight-medium text-primary mb-1">Respuesta del proveedor:</p>
                  <p class="text-body-2">{{ inquiry.supplierResponse }}</p>
                  <p v-if="inquiry.responseDate" class="text-caption text-medium-emphasis">
                    {{ formatDate(inquiry.responseDate) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Status Info -->
            <div class="status-info">
              <div class="d-flex align-center justify-space-between">
                <div class="status-details">
                  <!-- Pending Status -->
                  <div v-if="inquiry.status === 'pending'" class="d-flex align-items-center">
                    <v-icon icon="mdi-clock-outline" size="14" color="warning" class="mr-1"></v-icon>
                    <span class="text-caption">
                      Expira: {{ formatDate(inquiry.expiresAt) }}
                    </span>
                  </div>

                  <!-- Expired Status -->
                  <div v-else-if="inquiry.status === 'expired'" class="d-flex align-items-center">
                    <v-icon icon="mdi-clock-alert-outline" size="14" color="error" class="mr-1"></v-icon>
                    <span class="text-caption text-error">
                      Expiró el {{ formatDate(inquiry.expiresAt) }}
                    </span>
                  </div>

                  <!-- Accepted/Rejected Status -->
                  <div v-else class="d-flex align-items-center">
                    <v-icon :icon="inquiry.status === 'accepted' ? 'mdi-check-circle' : 'mdi-close-circle'" size="14"
                      :color="inquiry.status === 'accepted' ? 'success' : 'error'" class="mr-1"></v-icon>
                    <span class="text-caption">
                      {{ inquiry.status === 'accepted' ? 'Aceptado' : 'Rechazado' }} el {{
                        formatDate(inquiry.responseDate) }}
                    </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="inquiry-actions">
                  <v-menu location="bottom end">
                    <template v-slot:activator="{ props }">
                      <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props"></v-btn>
                    </template>

                    <v-card min-width="200" elevation="8" rounded="lg">
                      <v-list density="compact">
                        <v-list-item prepend-icon="mdi-phone" title="Llamar proveedor"
                          @click="callSupplier(inquiry)"></v-list-item>

                        <v-list-item prepend-icon="mdi-whatsapp" title="WhatsApp"
                          @click="openWhatsApp(inquiry)"></v-list-item>

                        <v-list-item prepend-icon="mdi-email" title="Enviar email"
                          @click="sendEmail(inquiry)"></v-list-item>

                        <v-divider class="my-1"></v-divider>

                        <v-list-item v-if="inquiry.status === 'pending'" prepend-icon="mdi-refresh"
                          title="Reenviar consulta" @click="resendInquiry(inquiry)"></v-list-item>

                        <v-list-item prepend-icon="mdi-delete-outline" title="Eliminar consulta" class="text-error"
                          @click="deleteInquiry(inquiry)"></v-list-item>
                      </v-list>
                    </v-card>
                  </v-menu>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { SupplierInquiry, InquiryStatus } from '@/types/supplierInquiry';

// Props
interface Props {
  reservationId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const props = withDefaults(defineProps<Props>(), {
  autoRefresh: false,
  refreshInterval: 30000 // 30 seconds
});

// Emits
const emit = defineEmits<{
  'inquiry-updated': [inquiry: SupplierInquiry];
  'call-supplier': [inquiry: SupplierInquiry];
  'contact-supplier': [inquiry: SupplierInquiry, method: 'whatsapp' | 'email'];
  'resend-inquiry': [inquiry: SupplierInquiry];
  'delete-inquiry': [inquiry: SupplierInquiry];
}>();

// Reactive Data
const loading = ref(false);
const inquiries = ref<SupplierInquiry[]>([]);
const expandedMessages = ref<Set<string>>(new Set());
const refreshTimer = ref<NodeJS.Timeout | null>(null);

// Computed
const sortedInquiries = computed(() => {
  return [...inquiries.value].sort((a, b) => {
    // Sort by status priority: pending > accepted > rejected > expired
    const statusPriority = { pending: 4, accepted: 3, rejected: 2, expired: 1 };
    const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 0;
    const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 0;

    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    // Then by inquiry date (newest first)
    return b.inquiryDate.getTime() - a.inquiryDate.getTime();
  });
});

// Methods
function getInquiryColor(status: InquiryStatus): string {
  const colors = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'error',
    expired: 'grey'
  };
  return colors[status] || 'default';
}

function getStatusColor(status: InquiryStatus): string {
  const colors = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'error',
    expired: 'grey-darken-1'
  };
  return colors[status] || 'primary';
}

function getStatusIcon(status: InquiryStatus): string {
  const icons = {
    pending: 'mdi-clock-outline',
    accepted: 'mdi-check',
    rejected: 'mdi-close',
    expired: 'mdi-clock-alert-outline'
  };
  return icons[status] || 'mdi-help-circle';
}

function getStatusText(status: InquiryStatus): string {
  const texts = {
    pending: 'Pendiente',
    accepted: 'Aceptado',
    rejected: 'Rechazado',
    expired: 'Expirado'
  };
  return texts[status] || status;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 1) {
    return 'Hace un momento';
  } else if (minutes < 60) {
    return `Hace ${minutes} min`;
  } else if (hours < 24) {
    return `Hace ${hours} h`;
  } else if (days < 7) {
    return `Hace ${days} días`;
  } else {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function toggleExpanded(inquiryId: string) {
  if (expandedMessages.value.has(inquiryId)) {
    expandedMessages.value.delete(inquiryId);
  } else {
    expandedMessages.value.add(inquiryId);
  }
}

function callSupplier(inquiry: SupplierInquiry) {
  emit('call-supplier', inquiry);
}

function openWhatsApp(inquiry: SupplierInquiry) {
  emit('contact-supplier', inquiry, 'whatsapp');
}

function sendEmail(inquiry: SupplierInquiry) {
  emit('contact-supplier', inquiry, 'email');
}

function resendInquiry(inquiry: SupplierInquiry) {
  emit('resend-inquiry', inquiry);
}

function deleteInquiry(inquiry: SupplierInquiry) {
  emit('delete-inquiry', inquiry);
}

async function loadInquiries() {
  loading.value = true;
  try {
    // TODO: Implementar llamada al servicio
    // const inquiryService = inject(supplierInquiryServiceKey);
    // inquiries.value = await inquiryService.getInquiriesByReservation(props.reservationId);

    // Mock data for now
    inquiries.value = [];
    console.log(`✅ Loaded ${inquiries.value.length} inquiries for reservation ${props.reservationId}`);
  } catch (error) {
    console.error('❌ Error loading inquiries:', error);
    inquiries.value = [];
  } finally {
    loading.value = false;
  }
}

function startAutoRefresh() {
  if (props.autoRefresh && !refreshTimer.value) {
    refreshTimer.value = setInterval(() => {
      loadInquiries();
    }, props.refreshInterval);
  }
}

function stopAutoRefresh() {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
}

// Lifecycle
onMounted(() => {
  loadInquiries();
  startAutoRefresh();
});

// Cleanup
function cleanup() {
  stopAutoRefresh();
}

// Expose methods for parent components
defineExpose({
  refresh: loadInquiries,
  cleanup
});
</script>

<style scoped>
.inquiry-status-container {
  width: 100%;
}

.no-inquiries {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
  border: 1px dashed rgba(var(--v-theme-outline), 0.2);
}

.inquiries-list {
  width: 100%;
}

.inquiry-cards {
  max-height: 400px;
  overflow-y: auto;
}

.inquiry-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
}

.inquiry-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-item {
  display: flex;
  align-items: center;
}

.inquiry-message {
  background-color: rgba(var(--v-theme-surface-variant), 0.2);
  border-radius: 8px;
  padding: 12px;
  border-left: 3px solid rgba(var(--v-theme-primary), 0.3);
}

.supplier-response {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-radius: 8px;
  padding: 12px;
}

.status-info {
  margin-top: 8px;
}

.status-details {
  flex-grow: 1;
}

.inquiry-actions {
  display: flex;
  align-items: center;
}

/* Responsive Design */
@media (max-width: 600px) {
  .inquiry-cards {
    max-height: 300px;
  }

  .contact-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .d-flex.align-center.justify-space-between {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

/* Scrollbar styling */
.inquiry-cards::-webkit-scrollbar {
  width: 6px;
}

.inquiry-cards::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 3px;
}

.inquiry-cards::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}

.inquiry-cards::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}
</style>
