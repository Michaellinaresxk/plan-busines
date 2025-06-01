<!-- src/UI/components/reservation/ReservationSuppliersSection.vue -->
<template>
  <v-card class="suppliers-section" rounded="xl" elevation="0" border>
    <v-card-title class="pa-6 pb-4">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="mdi-account-search" color="primary" size="28" class="mr-3"></v-icon>
          <div>
            <h3 class="text-h6 font-weight-bold mb-1">Proveedores Disponibles</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ getSearchDescription() }}
            </p>
          </div>
        </div>

        <v-chip v-if="compatibleSuppliers.length > 0" color="primary" size="small" variant="elevated">
          {{ compatibleSuppliers.length }} disponibles
        </v-chip>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-6">
      <!-- ✅ Mostrar criterios de búsqueda -->
      <v-alert v-if="searchCriteria" color="info" variant="tonal" rounded="lg" class="mb-6">
        <div class="search-info">
          <h4 class="text-subtitle-2 font-weight-bold mb-2">Búsqueda realizada:</h4>
          <div class="criteria-list">
            <div class="criteria-item">
              <v-icon icon="mdi-tools" size="16" class="mr-2"></v-icon>
              <strong>Servicio:</strong> {{ reservation.serviceName }}
            </div>

            <div v-if="searchCriteria.vehicleType" class="criteria-item">
              <v-icon icon="mdi-car" size="16" class="mr-2"></v-icon>
              <strong>Tipo de Vehículo:</strong> {{ getVehicleDisplayName(searchCriteria.vehicleType) }}
            </div>
          </div>
        </div>
      </v-alert>

      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-center align-center py-8">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
      </div>

      <!-- Suppliers Grid -->
      <div v-else-if="compatibleSuppliers.length > 0" class="suppliers-grid">
        <v-card v-for="supplier in compatibleSuppliers" :key="supplier.id" class="supplier-item" rounded="lg"
          elevation="0" border>
          <v-card-text class="pa-4">
            <div class="d-flex align-center mb-3">
              <v-avatar color="primary" size="40" class="mr-3">
                <span class="text-white font-weight-bold">
                  {{ getInitials(supplier.name) }}
                </span>
              </v-avatar>

              <div class="flex-grow-1">
                <h4 class="text-subtitle-1 font-weight-bold">{{ supplier.name }}</h4>
                <p class="text-body-2 text-medium-emphasis mb-0">{{ supplier.email }}</p>
              </div>

              <v-chip color="success" size="small" variant="flat">
                Activo
              </v-chip>
            </div>

            <!-- Supplier Details -->
            <div class="supplier-details mb-4">
              <div class="detail-row">
                <v-icon icon="mdi-phone" size="14" class="mr-2"></v-icon>
                <span class="text-body-2">{{ supplier.phone }}</span>
              </div>

              <!-- ✅ Mostrar vehicleType si es airport transfer -->
              <div v-if="supplier.vehicleType && isAirportTransfer" class="detail-row">
                <v-icon icon="mdi-car" size="14" class="mr-2"></v-icon>
                <span class="text-body-2">{{ getVehicleDisplayName(supplier.vehicleType) }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="d-flex gap-2">
              <v-btn color="primary" size="small" variant="elevated" @click="handleSupplierSelected(supplier)"
                prepend-icon="mdi-check">
                Seleccionar
              </v-btn>

              <v-btn color="secondary" size="small" variant="outlined" @click="handleContactSupplier(supplier)"
                prepend-icon="mdi-whatsapp">
                Consultar
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Empty State -->
      <v-card v-else class="pa-8 text-center" variant="tonal" color="grey-lighten-4">
        <v-icon icon="mdi-account-off" size="48" color="grey-lighten-1" class="mb-4"></v-icon>
        <h3 class="text-h6 mb-2">No hay proveedores compatibles</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ getEmptyStateMessage() }}
        </p>
        <v-btn color="primary" variant="outlined" @click="refreshSuppliers" :loading="loading">
          <v-icon icon="mdi-refresh" class="mr-2"></v-icon>
          Buscar nuevamente
        </v-btn>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';
import { supplierServiceKey } from '@/services/SupplierService';
import type { SupplierView } from '@/views/SupplierView';
import type { ReservationView } from '@/views/ReservationView';

// ✅ Función local para verificar airport transfer
function isAirportTransferService(service: string): boolean {
  const airportServices = ['airport-transfer', 'airport-transfers', 'transporte-aeropuerto'];
  const normalizedService = service.toLowerCase();
  return airportServices.some(airportService =>
    normalizedService.includes(airportService) || airportService.includes(normalizedService)
  );
}

// Props & Emits
interface Props {
  reservation: ReservationView;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'supplier-selected': [supplier: SupplierView];
  'supplier-contacted': [supplier: SupplierView, result: any];
}>();

// Services
const supplierService = inject(supplierServiceKey);

// Reactive Data
const loading = ref(false);
const compatibleSuppliers = ref<SupplierView[]>([]);

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

function getVehicleDisplayName(vehicleType: string): string {
  const vehicleTypes: Record<string, string> = {
    'vanSmall': 'Van Pequeña (1-6 personas)',
    'vanMedium': 'Van Mediana (7-10 personas)',
    'vanLarge': 'Van Grande (11-16 personas)',
    'suv': 'SUV (1-6 personas)'
  };

  return vehicleTypes[vehicleType] || vehicleType;
}

function getSearchDescription(): string {
  if (isAirportTransfer.value && searchCriteria.value.vehicleType) {
    return `Proveedores con vehículo ${getVehicleDisplayName(searchCriteria.value.vehicleType)}`;
  }
  return `Proveedores para ${props.reservation.serviceName}`;
}

function getEmptyStateMessage(): string {
  if (isAirportTransfer.value && searchCriteria.value.vehicleType) {
    return `No se encontraron proveedores de transporte aeropuerto con vehículo tipo "${getVehicleDisplayName(searchCriteria.value.vehicleType)}"`;
  }
  return `No se encontraron proveedores para el servicio "${props.reservation.serviceName}"`;
}

async function loadCompatibleSuppliers() {
  if (!supplierService) {
    console.error('❌ SupplierService not available');
    return;
  }

  loading.value = true;
  try {
    console.log('🔍 Loading compatible suppliers with criteria:', searchCriteria.value);

    // ✅ Usar el nuevo UseCase inteligente
    const suppliers = await supplierService.findCompatibleSuppliers(
      searchCriteria.value.serviceId,
      searchCriteria.value.vehicleType
    );

    compatibleSuppliers.value = suppliers || [];

    console.log(`✅ Found ${compatibleSuppliers.value.length} compatible suppliers`);

  } catch (error) {
    console.error('❌ Error loading compatible suppliers:', error);
    compatibleSuppliers.value = [];
  } finally {
    loading.value = false;
  }
}

function refreshSuppliers() {
  loadCompatibleSuppliers();
}

function handleSupplierSelected(supplier: SupplierView) {
  console.log('🎯 Supplier selected:', supplier.name);
  emit('supplier-selected', supplier);
}

function handleContactSupplier(supplier: SupplierView) {
  console.log('📞 Contacting supplier:', supplier.name);

  // Simular envío de consulta por WhatsApp
  const phone = supplier.phone.replace(/\D/g, '');
  const message = `Hola ${supplier.name}, tengo una reserva de ${props.reservation.serviceName} para el ${props.reservation.date} a las ${props.reservation.time}. ¿Puedes confirmar disponibilidad?`;
  const whatsappUrl = `https://wa.me/1809${phone}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank');

  emit('supplier-contacted', supplier, { method: 'whatsapp', success: true });
}

// Lifecycle
onMounted(() => {
  loadCompatibleSuppliers();
});
</script>

<style scoped>
.suppliers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.supplier-item {
  transition: all 0.3s ease;
}

.supplier-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-info {
  font-size: 0.875rem;
}

.criteria-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.criteria-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.supplier-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

/* Responsive Design */
@media (max-width: 600px) {
  .suppliers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
