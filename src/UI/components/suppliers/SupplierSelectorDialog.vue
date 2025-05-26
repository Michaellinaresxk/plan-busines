<!-- src/UI/components/modals/SupplierSelectorDialog.vue -->
<template>
  <v-dialog v-model="dialogModel" max-width="900" persistent>
    <v-card rounded="xl" elevation="0" border>
      <!-- Header -->
      <v-card-title class="pa-6 d-flex align-center">
        <v-icon icon="mdi-account-search" color="primary" size="32" class="mr-3"></v-icon>
        <div>
          <h2 class="text-h5 font-weight-bold">Consultar Proveedor</h2>
          <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
            Selecciona un proveedor para {{ reservation?.serviceName }}
          </p>
        </div>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" size="small" :disabled="loading" @click="handleClose"></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Información de la Reserva -->
      <v-card-text class="pa-6 pb-4">
        <v-alert color="info" variant="tonal" rounded="lg" class="mb-6">
          <div class="d-flex align-center">
            <div class="flex-grow-1">
              <h3 class="text-subtitle-1 font-weight-bold mb-2">Reserva a Consultar</h3>
              <div class="reservation-summary">
                <div class="d-flex flex-wrap gap-4">
                  <div class="summary-item">
                    <v-icon icon="mdi-account" size="16" class="mr-1"></v-icon>
                    <strong>{{ reservation?.clientName }}</strong>
                  </div>
                  <div class="summary-item">
                    <v-icon icon="mdi-calendar" size="16" class="mr-1"></v-icon>
                    {{ reservation?.date }} - {{ reservation?.time }}
                  </div>
                  <div class="summary-item">
                    <v-icon icon="mdi-currency-usd" size="16" class="mr-1"></v-icon>
                    ${{ reservation?.totalPrice }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-alert>

        <!-- Búsqueda y Filtros -->
        <div class="d-flex gap-4 mb-4">
          <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="Buscar proveedores..."
            variant="outlined" density="compact" hide-details clearable class="flex-grow-1"></v-text-field>

          <v-btn-toggle v-model="filterActive" mandatory variant="outlined" density="compact">
            <v-btn value="all" size="small">Todos</v-btn>
            <v-btn value="active" size="small">Solo Activos</v-btn>
          </v-btn-toggle>
        </div>

        <!-- Estado de Carga -->
        <div v-if="loadingSuppliers" class="d-flex justify-center align-center py-8">
          <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        </div>

        <!-- Lista de Proveedores -->
        <div v-else-if="filteredSuppliers.length > 0" class="suppliers-grid">
          <v-card v-for="supplier in filteredSuppliers" :key="supplier.id"
            :class="['supplier-card', { 'selected': selectedSupplier?.id === supplier.id }]"
            :color="selectedSupplier?.id === supplier.id ? 'primary' : 'default'"
            :variant="selectedSupplier?.id === supplier.id ? 'tonal' : 'outlined'" rounded="lg"
            @click="selectSupplier(supplier)" :disabled="!supplier.canProvideService">
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-3">
                <v-avatar :color="supplier.canProvideService ? 'primary' : 'grey'" size="40" class="mr-3">
                  <span class="text-white font-weight-bold">
                    {{ getInitials(supplier.name) }}
                  </span>
                </v-avatar>

                <div class="flex-grow-1">
                  <h4 class="text-subtitle-1 font-weight-bold">{{ supplier.name }}</h4>
                  <p class="text-body-2 text-medium-emphasis mb-0">{{ supplier.email }}</p>
                </div>

                <v-chip :color="supplier.canProvideService ? 'success' : 'error'" size="small" variant="flat">
                  {{ supplier.canProvideService ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </div>

              <div class="supplier-details">
                <div class="detail-item">
                  <v-icon icon="mdi-phone" size="14" class="mr-2"></v-icon>
                  <span class="text-body-2">{{ supplier.phone }}</span>
                </div>
                <div class="detail-item">
                  <v-icon icon="mdi-tools" size="14" class="mr-2"></v-icon>
                  <span class="text-body-2">{{ getServiceDisplayName(supplier.service) }}</span>
                </div>
              </div>

              <!-- Indicador de selección -->
              <v-expand-transition>
                <div v-if="selectedSupplier?.id === supplier.id" class="selection-indicator mt-3">
                  <v-icon icon="mdi-check-circle" color="primary" size="20"></v-icon>
                  <span class="text-primary font-weight-medium ml-2">Proveedor Seleccionado</span>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </div>

        <!-- Estado Vacío -->
        <v-card v-else class="pa-8 text-center" variant="tonal" color="grey-lighten-4">
          <v-icon icon="mdi-account-off" size="48" color="grey-lighten-1" class="mb-4"></v-icon>
          <h3 class="text-h6 mb-2">No hay proveedores disponibles</h3>
          <p class="text-body-2 text-medium-emphasis">
            No se encontraron proveedores para el servicio "{{ reservation?.serviceName }}"
          </p>
        </v-card>

        <!-- Mensaje para el Proveedor -->
        <v-expand-transition>
          <div v-if="selectedSupplier" class="mt-6">
            <h3 class="text-subtitle-1 font-weight-bold mb-3">Mensaje para el Proveedor</h3>
            <v-textarea v-model="inquiryMessage" label="Escribe tu consulta al proveedor"
              placeholder="Hola, tengo una reserva para el [fecha] y me gustaría saber si puedes realizar este servicio..."
              variant="outlined" rows="4" :rules="[rules.required]" :disabled="loading"></v-textarea>

            <v-select v-model="expirationHours" :items="expirationOptions" label="Tiempo de expiración"
              variant="outlined" density="compact" :disabled="loading"></v-select>
          </div>
        </v-expand-transition>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Actions -->
      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn variant="text" :disabled="loading" @click="handleClose">
          Cancelar
        </v-btn>
        <v-btn color="primary" variant="elevated" :loading="loading"
          :disabled="!selectedSupplier || !inquiryMessage.trim()" @click="handleSendInquiry">
          <v-icon icon="mdi-send" class="mr-2"></v-icon>
          Enviar Consulta
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue';
import { supplierServiceKey } from '@/services/SupplierService';
import type { SupplierView } from '@/views/SupplierView';
import type { ReservationView } from '@/views/ReservationView';
import { SERVICE_DISPLAY_NAMES } from '@/types/supplier';

// Props & Emits
interface Props {
  modelValue: boolean;
  reservation: ReservationView | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'supplier-selected': [supplier: SupplierView, message: string, expirationHours: number];
}>();

// Services
const supplierService = inject(supplierServiceKey);

// Reactive Data
const loading = ref(false);
const loadingSuppliers = ref(false);
const allSuppliers = ref<SupplierView[]>([]);
const selectedSupplier = ref<SupplierView | null>(null);
const inquiryMessage = ref('');
const searchQuery = ref('');
const filterActive = ref<'all' | 'active'>('active');
const expirationHours = ref(24);

// Options
const expirationOptions = [
  { title: '12 horas', value: 12 },
  { title: '24 horas', value: 24 },
  { title: '48 horas', value: 48 },
  { title: '72 horas', value: 72 }
];

// Validation rules
const rules = {
  required: (value: string) => !!value?.trim() || 'Este campo es requerido'
};

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const compatibleSuppliers = computed(() => {
  if (!props.reservation) return [];

  return allSuppliers.value.filter(supplier =>
    supplier.service === props.reservation?.serviceId ||
    supplier.service === props.reservation?.serviceName
  );
});

const filteredSuppliers = computed(() => {
  let suppliers = [...compatibleSuppliers.value];

  // Filter by active status
  if (filterActive.value === 'active') {
    suppliers = suppliers.filter(supplier => supplier.canProvideService);
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    suppliers = suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(query) ||
      supplier.email.toLowerCase().includes(query) ||
      supplier.phone.includes(query)
    );
  }

  return suppliers;
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

function getServiceDisplayName(service: string): string {
  return SERVICE_DISPLAY_NAMES[service] || service;
}

function selectSupplier(supplier: SupplierView) {
  if (!supplier.canProvideService) return;

  selectedSupplier.value = supplier;

  // Generate default message
  if (!inquiryMessage.value) {
    inquiryMessage.value = `Hola ${supplier.name},

Tengo una reserva de ${props.reservation?.serviceName} para el ${props.reservation?.date} a las ${props.reservation?.time}.

Cliente: ${props.reservation?.clientName}
Precio: $${props.reservation?.totalPrice}

¿Podrías confirmar si puedes realizar este servicio en esa fecha y horario?

Gracias por tu tiempo.`;
  }
}

async function loadSuppliers() {
  if (!supplierService) {
    console.error('❌ SupplierService not available');
    return;
  }

  loadingSuppliers.value = true;
  try {
    const suppliers = await supplierService.getAllSuppliers();
    allSuppliers.value = suppliers || [];
    console.log(`✅ Loaded ${allSuppliers.value.length} suppliers`);
  } catch (error) {
    console.error('❌ Error loading suppliers:', error);
    allSuppliers.value = [];
  } finally {
    loadingSuppliers.value = false;
  }
}

function resetDialog() {
  selectedSupplier.value = null;
  inquiryMessage.value = '';
  searchQuery.value = '';
  filterActive.value = 'active';
  expirationHours.value = 24;
  loading.value = false;
}

function handleClose() {
  if (!loading.value) {
    resetDialog();
    dialogModel.value = false;
  }
}

async function handleSendInquiry() {
  if (!selectedSupplier.value || !inquiryMessage.value.trim()) return;

  loading.value = true;
  try {
    emit('supplier-selected', selectedSupplier.value, inquiryMessage.value.trim(), expirationHours.value);
  } catch (error) {
    console.error('❌ Error sending inquiry:', error);
  } finally {
    loading.value = false;
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    loadSuppliers();
    resetDialog();
  }
});
</script>

<style scoped>
.suppliers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.supplier-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.supplier-card:not(.selected):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.supplier-card.selected {
  border: 2px solid rgb(var(--v-theme-primary));
}

.supplier-card[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.reservation-summary {
  margin-top: 8px;
}

.summary-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.supplier-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.selection-indicator {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-radius: 8px;
}

/* Responsive Design */
@media (max-width: 600px) {
  .suppliers-grid {
    grid-template-columns: 1fr;
  }

  .d-flex.gap-4 {
    flex-direction: column;
    gap: 12px !important;
  }
}
</style>
