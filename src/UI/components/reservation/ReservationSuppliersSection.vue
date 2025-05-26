<!-- src/UI/components/reservation/ReservationSuppliersSection.vue -->
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
              <v-btn color="primary" size="small" variant="elevated" prepend-icon="mdi-send"
                :disabled="!supplier.canProvideService" @click="selectSupplier(supplier)">
                Consultar
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { supplierServiceKey } from '@/services/SupplierService';
import type { SupplierView } from '@/views/SupplierView';
import type { ReservationView } from '@/views/ReservationView';

// Props
const props = defineProps<{
  reservation: ReservationView;
}>();

// Emits
const emit = defineEmits<{
  'supplier-selected': [supplier: SupplierView];
}>();

// Services
const supplierService = inject(supplierServiceKey);

// Estado
const loading = ref(false);
const suppliers = ref<SupplierView[]>([]);

// Métodos
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function selectSupplier(supplier: SupplierView) {
  console.log('🎯 Supplier selected:', supplier);
  emit('supplier-selected', supplier);
}

async function loadSuppliers() {
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

    // ✅ Usar el nuevo método getSuppliersByService
    const serviceSuppliers = await supplierService.getSuppliersByService(
      props.reservation.serviceId || props.reservation.serviceName
    );

    suppliers.value = serviceSuppliers || [];

    console.log(`✅ Loaded ${suppliers.value.length} suppliers for service: ${props.reservation.serviceName}`);

    // Log detallado para debug
    suppliers.value.forEach(supplier => {
      console.log(`  - Found: ${supplier.name} (${supplier.service}) - Active: ${supplier.canProvideService}`);
    });

  } catch (error) {
    console.error('❌ Error loading suppliers:', error);
    suppliers.value = [];
  } finally {
    loading.value = false;
  }
}

async function refreshSuppliers() {
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
