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
                  <v-icon icon="mdi-star" size="32" color="amber" class="mb-2"></v-icon>
                  <div class="text-h4 font-weight-bold">{{ stats.featured }}</div>
                  <div class="text-body-2 text-medium-emphasis">Destacados</div>
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
                  <v-icon icon="mdi-star-circle" size="32" color="success" class="mb-2"></v-icon>
                  <div class="text-h4 font-weight-bold">{{ stats.avgRating }}</div>
                  <div class="text-body-2 text-medium-emphasis">Calificación Prom.</div>
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

              <v-select v-model="filters.featured" :items="featuredOptions" label="Tipo" variant="outlined"
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

    <!-- Add Supplier Dialog (Placeholder) -->
    <v-dialog v-model="showAddSupplierDialog" max-width="600">
      <v-card>
        <v-card-title>Agregar Nuevo Proveedor</v-card-title>
        <v-card-text>
          <p>Formulario para agregar proveedor (implementar después)</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showAddSupplierDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { supplierServiceKey } from '@/services/SupplierService';
import type { SupplierView } from '@/views/SupplierView';

console.log('🏗️ SuppliersView: Initializing component...');

// Inject supplier service with better error handling
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
const showAddSupplierDialog = ref(false);

// Filters
const filters = ref({
  service: 'all',
  featured: 'all'
});

// Notifications
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarIcon = ref('mdi-check-circle');

// Filter options
const serviceOptions = [
  { title: 'Todos los servicios', value: 'all' },
  { title: 'Transporte', value: 'Transporte' },
  { title: 'Limpieza', value: 'Limpieza' },
  { title: 'Jardinería', value: 'Jardinería' },
  { title: 'Plomería', value: 'Plomería' },
  { title: 'Electricidad', value: 'Electricidad' },
  { title: 'Carpintería', value: 'Carpintería' },
  { title: 'Pintura', value: 'Pintura' },
  { title: 'Seguridad', value: 'Seguridad' },
  { title: 'Catering', value: 'Catering' },
  { title: 'Fotografía', value: 'Fotografía' },
  { title: 'Decoración', value: 'Decoración' },
  { title: 'Tecnología', value: 'Tecnología' }
];

const featuredOptions = [
  { title: 'Todos', value: 'all' },
  { title: 'Destacados', value: 'featured' },
  { title: 'Regulares', value: 'regular' }
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

  // Apply featured filter (Note: SupplierView doesn't have featured property yet)
  // if (filters.value.featured === 'featured') {
  //   result = result.filter(supplier => supplier.featured === true);
  // } else if (filters.value.featured === 'regular') {
  //   result = result.filter(supplier => !supplier.featured);
  // }

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
  const featured = 0; // TODO: Add featured property to SupplierView
  const services = new Set(allSuppliers.value.map(s => s.service)).size;
  const avgRating = '4.5'; // TODO: Add rating property to SupplierView

  return {
    total,
    featured,
    services,
    avgRating
  };
});

// Active filters check
const hasActiveFilters = computed(() => {
  return filters.value.service !== 'all' ||
    filters.value.featured !== 'all' ||
    searchQuery.value.length > 0;
});

// Methods
async function refreshData() {
  console.log('🔄 Starting refreshData...');
  loading.value = true;

  try {
    console.log('🔌 Checking SupplierService availability...');

    if (!supplierService) {
      console.error('❌ SupplierService not available in refreshData');
      console.log('🔍 Available keys:', Object.getOwnPropertySymbols({}));
      throw new Error('SupplierService not available - check App.vue providers and service initialization');
    }

    console.log('✅ SupplierService is available, calling getAllSuppliers...');
    const suppliers = await supplierService.getAllSuppliers();

    console.log('📦 Received suppliers:', suppliers);
    console.log('📊 Suppliers count:', suppliers?.length || 0);
    console.log('📋 Individual suppliers:');
    suppliers?.forEach((supplier, index) => {
      console.log(`  ${index + 1}:`, supplier);
    });

    allSuppliers.value = suppliers || [];

    const count = allSuppliers.value.length;
    console.log(`✅ Successfully loaded ${count} suppliers`);

    showNotification(
      `${count} suppliers cargados correctamente`,
      'success',
      'mdi-check-circle'
    );
  } catch (error) {
    console.error('❌ Error in refreshData:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');

    showNotification(
      `Error al cargar suppliers: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error',
      'mdi-alert-circle'
    );

    allSuppliers.value = [];
  } finally {
    loading.value = false;
    console.log('🏁 refreshData completed');
  }
}

function handleSearch() {
  currentPage.value = 1;
}

function applyFilters() {
  currentPage.value = 1;
}

function resetFilters() {
  filters.value = {
    service: 'all',
    featured: 'all'
  };
  searchQuery.value = '';
  currentPage.value = 1;
}

function toggleTheme() {
  console.log('Toggle theme');
}

// Supplier event handlers
function handleViewSupplier(supplier: SupplierView) {
  console.log('View supplier:', supplier);
  showNotification(`Viendo detalles de ${supplier.name}`, 'info', 'mdi-eye');
}

function handleContactSupplier(supplier: SupplierView) {
  console.log('Contact supplier:', supplier);
  if (supplier.phone) {
    window.open(`tel:${supplier.phone}`);
  }
  showNotification(`Contactando a ${supplier.name}`, 'info', 'mdi-phone');
}

function handleEditSupplier(supplier: SupplierView) {
  console.log('Edit supplier:', supplier);
  showNotification(`Editando información de ${supplier.name}`, 'info', 'mdi-pencil');
}

function handleDeleteSupplier(supplier: SupplierView) {
  console.log('Delete supplier:', supplier);
  showNotification(`Eliminar ${supplier.name} (no implementado)`, 'warning', 'mdi-delete');
}

function handleToggleFeatured(supplier: SupplierView) {
  console.log('Toggle featured:', supplier);
  showNotification(`Toggle featured ${supplier.name} (no implementado)`, 'info', 'mdi-star');
}

// Utility functions
function showNotification(message: string, color: 'success' | 'error' | 'info' | 'warning', icon: string) {
  snackbarText.value = message;
  snackbarColor.value = color;
  snackbarIcon.value = icon;
  showSnackbar.value = true;
}

// Lifecycle hooks
onMounted(async () => {
  console.log('🚀 SuppliersView mounted');

  // Adjust rail based on screen size
  rail.value = mdAndUp.value;

  // Load initial data
  console.log('📡 Loading initial supplier data...');
  await refreshData();
});

// Watchers
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
watch([() => filters.value.service, () => filters.value.featured, searchQuery], () => {
  currentPage.value = 1;
});

// Reset page when total pages change and current page is out of range
watch(totalPages, (newTotalPages) => {
  if (currentPage.value > newTotalPages && newTotalPages > 0) {
    currentPage.value = newTotalPages;
  }
});
</script>
