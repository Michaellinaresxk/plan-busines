<template>
  <v-app>
    <DashboardHeader :mdAndUp="mdAndUp" v-model:drawer="drawer" v-model:rail="rail" @toggle-theme="toggleTheme" />

    <DashboardSidebar v-model:drawer="drawer" v-model:rail="rail" :mdAndUp="mdAndUp" :pending-count="0" />

    <v-main>
      <v-container fluid class="py-6 px-4 md:px-6">
        <!-- Header Section -->
        <div class="suppliers-header mb-6">
          <div class="d-flex flex-wrap align-center justify-space-between mb-4">
            <div>
              <h1 class="text-h4 font-weight-bold mb-2 d-flex align-center">
                <v-icon icon="mdi-account-hard-hat" size="36" color="primary" class="mr-3"></v-icon>
                Lista de Proveedores
                <v-chip color="primary" size="small" class="ml-2">{{ filteredSuppliers.length }}</v-chip>
              </h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Gestiona y contacta con los proveedores de servicios
              </p>
            </div>

            <div class="d-flex flex-wrap gap-2 mt-2 mt-sm-0">
              <v-btn prepend-icon="mdi-refresh" color="secondary" variant="text" :loading="loading"
                @click="refreshData">
                Actualizar
              </v-btn>

              <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddSupplierDialog = true">
                Agregar Proveedor
              </v-btn>
            </div>
          </div>

          <!-- Stats Cards -->
          <v-row class="mb-4">
            <v-col cols="12" sm="6" md="3">
              <v-card elevation="0" border rounded="lg">
                <v-card-text class="text-center pa-4">
                  <v-icon icon="mdi-account-multiple" size="32" color="primary" class="mb-2"></v-icon>
                  <div class="text-h4 font-weight-bold">{{ stats.total }}</div>
                  <div class="text-body-2 text-medium-emphasis">Total</div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-card elevation="0" border rounded="lg">
                <v-card-text class="text-center pa-4">
                  <v-icon icon="mdi-check-circle" size="32" color="success" class="mb-2"></v-icon>
                  <div class="text-h4 font-weight-bold">{{ stats.active }}</div>
                  <div class="text-body-2 text-medium-emphasis">Activos</div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-card elevation="0" border rounded="lg">
                <v-card-text class="text-center pa-4">
                  <v-icon icon="mdi-tools" size="32" color="teal" class="mb-2"></v-icon>
                  <div class="text-h4 font-weight-bold">{{ stats.services }}</div>
                  <div class="text-body-2 text-medium-emphasis">Servicios</div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-card elevation="0" border rounded="lg">
                <v-card-text class="text-center pa-4">
                  <v-icon icon="mdi-star-circle" size="32" color="amber" class="mb-2"></v-icon>
                  <div class="text-h4 font-weight-bold">{{ stats.featured }}</div>
                  <div class="text-body-2 text-medium-emphasis">Destacados</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Filters and Search -->
        <v-card class="mb-6" elevation="0" border rounded="lg">
          <v-card-text class="py-4">
            <div class="d-flex flex-wrap gap-4 align-center">
              <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="Buscar proveedores..."
                variant="outlined" density="compact" hide-details clearable style="max-width: 300px"
                @update:model-value="handleSearch" />

              <v-select v-model="filters.service" :items="serviceOptions" label="Servicio" variant="outlined"
                density="compact" hide-details style="max-width: 200px" @update:model-value="applyFilters" />

              <v-select v-model="filters.status" :items="statusOptions" label="Estado" variant="outlined"
                density="compact" hide-details style="max-width: 150px" @update:model-value="applyFilters" />

              <v-spacer></v-spacer>

              <v-btn color="secondary" variant="outlined" prepend-icon="mdi-filter-off" @click="resetFilters"
                :disabled="!hasActiveFilters">
                Limpiar Filtros
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Suppliers List -->
        <SupplierList :suppliers="paginatedSuppliers || []" :loading="loading" :current-page="currentPage"
          :total-pages="totalPages" v-model:current-page="currentPage" @refresh="refreshData" @view="handleViewSupplier"
          @contact="handleContactSupplier" @edit="handleEditSupplier" @delete="handleDeleteSupplier"
          @toggle-featured="handleToggleFeatured" />
      </v-container>
    </v-main>

    <!-- ✅ Formulario de Crear Proveedor -->
    <CreateSupplierForm v-model="showAddSupplierDialog" @supplier-created="handleSupplierCreated" />

    <!-- ✅ Formulario de Editar Proveedor -->
    <EditSupplierForm v-model="showEditSupplierDialog" :supplier="selectedSupplier"
      @supplier-updated="handleSupplierUpdated" />

    <!-- ✅ Dialog de Eliminar Proveedor -->
    <DeleteSupplierDialog v-model="showDeleteSupplierDialog" :supplier="selectedSupplier"
      @supplier-deleted="handleSupplierDeleted" />

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" location="bottom end" rounded="pill" timeout="4000">
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
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useDisplay } from 'vuetify';
import DashboardHeader from '@/UI/components/dashboard/DashboardHeader.vue';
import DashboardSidebar from '@/UI/components/dashboard/DashboardSidebar.vue';
import SupplierList from '@/UI/components/suppliers/SupplierList.vue';
import CreateSupplierForm from '@/UI/components/suppliers/CreateSupplierForm.vue';
import EditSupplierForm from '@/UI/components/suppliers/EditSupplierForm.vue';
import DeleteSupplierDialog from '@/UI/components/suppliers/DeleteSupplierDialog.vue';
import { supplierServiceKey } from '@/services/SupplierService';
import type { SupplierView } from '@/views/SupplierView';
import { SUPPLIER_SERVICE_OPTIONS } from '@/types/supplier';

// ✅ Interfaces para los formularios
interface CreateSupplierData {
  name: string;
  cedula: string;
  email: string;
  phone: string;
  service: string;
  canProvideService: boolean;
}

interface UpdateSupplierData {
  name?: string;
  cedula?: string;
  email?: string;
  phone?: string;
  service?: string;
  canProvideService?: boolean;
}

console.log('🏗️ SuppliersView: Initializing component...');

// Inject supplier service con manejo de errores
const supplierService = inject(supplierServiceKey);
console.log('🔌 SupplierService injection result:', supplierService ? '✅ Available' : '❌ Not available');

// Responsive helpers
const { mdAndUp } = useDisplay();

// Layout state
const drawer = ref(true);
const rail = ref(false);

// Main state
const loading = ref(false);
const allSuppliers = ref<SupplierView[]>([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(12);

// Dialog states
const showAddSupplierDialog = ref(false);
const showEditSupplierDialog = ref(false);
const showDeleteSupplierDialog = ref(false);
const selectedSupplier = ref<SupplierView | null>(null);

// Filters
const filters = ref({
  service: 'all',
  status: 'all'
});

// Notifications
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarIcon = ref('mdi-check-circle');

// Filter options
const serviceOptions = computed(() => [
  { title: 'Todos los servicios', value: 'all' },
  ...SUPPLIER_SERVICE_OPTIONS.map(option => ({
    title: option.title,
    value: option.value
  }))
]);

const statusOptions = [
  { title: 'Todos', value: 'all' },
  { title: 'Activos', value: 'active' },
  { title: 'Inactivos', value: 'inactive' }
];

// Computed properties
const filteredSuppliers = computed(() => {
  let result = [...allSuppliers.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(supplier =>
      supplier.name.toLowerCase().includes(query) ||
      supplier.email.toLowerCase().includes(query) ||
      supplier.service.toLowerCase().includes(query) ||
      supplier.cedula.includes(query) ||
      supplier.phone.includes(query)
    );
  }

  // Apply service filter
  if (filters.value.service !== 'all') {
    result = result.filter(supplier => supplier.service === filters.value.service);
  }

  // Apply status filter
  if (filters.value.status !== 'all') {
    if (filters.value.status === 'active') {
      result = result.filter(supplier => supplier.canProvideService);
    } else if (filters.value.status === 'inactive') {
      result = result.filter(supplier => !supplier.canProvideService);
    }
  }

  return result;
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredSuppliers.value.length / itemsPerPage.value));

const paginatedSuppliers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  const result = filteredSuppliers.value.slice(start, end);

  console.log('📄 Pagination computed:');
  console.log('  - Total suppliers:', filteredSuppliers.value.length);
  console.log('  - Current page:', currentPage.value);
  console.log('  - Items per page:', itemsPerPage.value);
  console.log('  - Start index:', start);
  console.log('  - End index:', end);
  console.log('  - Paginated result:', result);

  return result;
});

// Statistics
const stats = computed(() => {
  const total = allSuppliers.value.length;
  const active = allSuppliers.value.filter(s => s.canProvideService).length;
  const featured = 0; // ✅ Por ahora 0, hasta que implementemos featured
  const services = new Set(allSuppliers.value.map(s => s.service)).size;

  return {
    total,
    active,
    featured,
    services
  };
});

// Active filters check
const hasActiveFilters = computed(() => {
  return filters.value.service !== 'all' ||
    filters.value.status !== 'all' ||
    searchQuery.value.length > 0;
});

// ✅ MÉTODOS PRINCIPALES

// Cargar datos
async function refreshData() {
  console.log('🔄 Starting refreshData...');
  loading.value = true;

  try {
    console.log('🔌 Checking SupplierService availability...');

    if (!supplierService) {
      console.error('❌ SupplierService not available in refreshData');
      throw new Error('SupplierService not available - check App.vue providers and service initialization');
    }

    console.log('✅ SupplierService is available, calling getAllSuppliers...');
    const suppliers = await supplierService.getAllSuppliers();

    console.log('📦 Received suppliers:', suppliers);
    console.log('📊 Suppliers count:', suppliers?.length || 0);

    allSuppliers.value = suppliers || [];

    const count = allSuppliers.value.length;
    console.log(`✅ Successfully loaded ${count} suppliers`);

    showNotification(
      `${count} proveedores cargados correctamente`,
      'success',
      'mdi-check-circle'
    );
  } catch (error) {
    console.error('❌ Error in refreshData:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');

    showNotification(
      `Error al cargar proveedores: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error',
      'mdi-alert-circle'
    );

    allSuppliers.value = [];
  } finally {
    loading.value = false;
    console.log('🏁 refreshData completed');
  }
}

// ✅ CREAR SUPPLIER
async function handleSupplierCreated(data: CreateSupplierData) {
  console.log('🔄 Creating supplier with data:', data);

  if (!supplierService) {
    console.error('❌ SupplierService not available');
    showNotification('Error: Servicio no disponible', 'error', 'mdi-alert-circle');
    return;
  }

  try {
    const newSupplier = await supplierService.createSupplier(
      data.name,
      data.cedula,
      data.email,
      data.phone,
      data.service,
      data.canProvideService
    );

    console.log('✅ Supplier created successfully:', newSupplier);

    // Cerrar el dialog
    showAddSupplierDialog.value = false;

    // Actualizar la lista
    await refreshData();

    // Mostrar notificación de éxito
    showNotification(
      `Proveedor "${data.name}" creado exitosamente`,
      'success',
      'mdi-check-circle'
    );

  } catch (error) {
    console.error('❌ Error creating supplier:', error);

    showNotification(
      `Error al crear proveedor: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      'error',
      'mdi-alert-circle'
    );
  }
}

// ✅ ACTUALIZAR SUPPLIER
async function handleSupplierUpdated(id: string, data: UpdateSupplierData) {
  console.log('🔄 Updating supplier with data:', { id, data });

  if (!supplierService) {
    console.error('❌ SupplierService not available');
    showNotification('Error: Servicio no disponible', 'error', 'mdi-alert-circle');
    return;
  }

  try {
    const updatedSupplier = await supplierService.updateSupplier(id, data);

    console.log('✅ Supplier updated successfully:', updatedSupplier);

    // Cerrar el dialog
    showEditSupplierDialog.value = false;
    selectedSupplier.value = null;

    // Actualizar la lista
    await refreshData();

    // Mostrar notificación de éxito
    const changedFields = Object.keys(data).length;
    showNotification(
      `Proveedor actualizado exitosamente (${changedFields} campos modificados)`,
      'success',
      'mdi-check-circle'
    );

  } catch (error) {
    console.error('❌ Error updating supplier:', error);

    showNotification(
      `Error al actualizar proveedor: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      'error',
      'mdi-alert-circle'
    );
  }
}

// ✅ ELIMINAR SUPPLIER
async function handleSupplierDeleted(id: string) {
  console.log('🗑️ Deleting supplier with ID:', id);

  if (!supplierService) {
    console.error('❌ SupplierService not available');
    showNotification('Error: Servicio no disponible', 'error', 'mdi-alert-circle');
    return;
  }

  try {
    // Obtener el nombre del supplier antes de eliminarlo (para la notificación)
    const supplierToDelete = selectedSupplier.value;
    const supplierName = supplierToDelete?.name || 'Proveedor';

    await supplierService.deleteSupplier(id);

    console.log('✅ Supplier deleted successfully');

    // Cerrar el dialog y limpiar selección
    showDeleteSupplierDialog.value = false;
    selectedSupplier.value = null;

    // Actualizar la lista
    await refreshData();

    // Mostrar notificación de éxito
    showNotification(
      `Proveedor "${supplierName}" eliminado exitosamente`,
      'success',
      'mdi-check-circle'
    );

  } catch (error) {
    console.error('❌ Error deleting supplier:', error);

    showNotification(
      `Error al eliminar proveedor: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      'error',
      'mdi-alert-circle'
    );
  }
}

// ✅ EVENT HANDLERS

function handleSearch() {
  currentPage.value = 1;
}

function applyFilters() {
  currentPage.value = 1;
}

function resetFilters() {
  filters.value = {
    service: 'all',
    status: 'all'
  };
  searchQuery.value = '';
  currentPage.value = 1;
}

function toggleTheme() {
  console.log('Toggle theme - implementar más tarde');
}

// Supplier event handlers
function handleViewSupplier(supplier: SupplierView) {
  console.log('View supplier:', supplier);
  showNotification(`Viendo detalles de ${supplier.name}`, 'info', 'mdi-eye');
}

function handleContactSupplier(supplier: SupplierView) {
  console.log('Contact supplier:', supplier);

  // ✅ Lógica simple sin métodos del view
  const cleanedPhone = supplier.phone.replace(/\D/g, '');

  // Intentar abrir WhatsApp si el teléfono tiene 10 dígitos
  if (cleanedPhone.length === 10) {
    const whatsappUrl = `https://wa.me/1809${cleanedPhone}`;
    window.open(whatsappUrl, '_blank');
  } else if (supplier.phone) {
    window.open(`tel:${supplier.phone}`);
  }

  showNotification(`Contactando a ${supplier.name}`, 'info', 'mdi-phone');
}

function handleEditSupplier(supplier: SupplierView) {
  console.log('Edit supplier:', supplier);

  // Establecer el supplier seleccionado y abrir el dialog
  selectedSupplier.value = supplier;
  showEditSupplierDialog.value = true;

  showNotification(`Editando información de ${supplier.name}`, 'info', 'mdi-pencil');
}

function handleDeleteSupplier(supplier: SupplierView) {
  console.log('Delete supplier:', supplier);

  // Establecer el supplier seleccionado y abrir el dialog de confirmación
  selectedSupplier.value = supplier;
  showDeleteSupplierDialog.value = true;

  showNotification(`Preparando eliminación de ${supplier.name}`, 'warning', 'mdi-delete-alert');
}

function handleToggleFeatured(supplier: SupplierView) {
  console.log('Toggle featured:', supplier);
  // TODO: Implementar toggle featured cuando agregemos esta funcionalidad
  showNotification(`Toggle featured ${supplier.name} (implementar más tarde)`, 'info', 'mdi-star');
}

// Utility functions
function showNotification(message: string, color: 'success' | 'error' | 'info' | 'warning', icon: string) {
  snackbarText.value = message;
  snackbarColor.value = color;
  snackbarIcon.value = icon;
  showSnackbar.value = true;
}

// ✅ LIFECYCLE HOOKS
onMounted(async () => {
  console.log('🚀 SuppliersView mounted');

  // Adjust rail based on screen size
  rail.value = mdAndUp.value;

  // Load initial data
  console.log('📡 Loading initial supplier data...');
  await refreshData();
});

// ✅ WATCHERS
watch(mdAndUp, (newValue) => {
  if (!newValue) {
    rail.value = false;
    drawer.value = false;
  } else {
    drawer.value = true;
    rail.value = true;
  }
});

// Reset page when filters change
watch([() => filters.value.service, () => filters.value.status, searchQuery], () => {
  currentPage.value = 1;
});

// Reset page when total pages change and current page is out of range
watch(totalPages, (newTotalPages) => {
  if (currentPage.value > newTotalPages && newTotalPages > 0) {
    currentPage.value = newTotalPages;
  }
});
</script>

<style scoped>
.suppliers-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05));
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.v-chip {
  font-weight: 600;
}

:deep(.v-card) {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

:deep(.v-card:hover) {
  transform: translateY(-2px);
}

.v-snackbar {
  margin: 12px;
}

@media (max-width: 600px) {
  .suppliers-header {
    padding: 16px;
  }

  .d-flex.gap-2 {
    gap: 8px !important;
  }
}
</style>
