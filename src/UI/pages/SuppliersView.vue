<!-- src/UI/views/SuppliersView.vue -->
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
        <SupplierList :suppliers="paginatedSuppliers" :loading="loading" v-model:current-page="currentPage"
          :total-pages="totalPages" @refresh="refreshData" @view="handleViewSupplier" @contact="handleContactSupplier"
          @edit="handleEditSupplier" @delete="handleDeleteSupplier" @toggle-featured="handleToggleFeatured" />
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
import { ref, computed, onMounted, watch } from 'vue';
import { useDisplay } from 'vuetify';
import DashboardHeader from '@/UI/components/dashboard/DashboardHeader.vue';
import DashboardSidebar from '@/UI/components/dashboard/DashboardSidebar.vue';
import SupplierList from '@/UI/components/suppliers/SupplierList.vue';

// Types
interface Supplier {
  id: string;
  name: string;
  cedula: string;
  email: string;
  phone: string;
  service: string;
  featured?: boolean;
  rating?: number;
  createdAt?: Date;
}

// Responsive helpers
const { mdAndUp } = useDisplay();

// Layout state
const drawer = ref(true);
const rail = ref(false);

// Main state
const loading = ref(false);
const suppliers = ref<Supplier[]>([]);
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

// Mock data
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    cedula: '123456789',
    email: 'juan.perez@email.com',
    phone: '3001234567',
    service: 'Transporte',
    featured: true,
    rating: 4.5
  },
  {
    id: '2',
    name: 'María González',
    cedula: '987654321',
    email: 'maria.gonzalez@email.com',
    phone: '3009876543',
    service: 'Limpieza',
    rating: 4.8
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    cedula: '456789123',
    email: 'carlos.rodriguez@email.com',
    phone: '3004567891',
    service: 'Jardinería',
    featured: true,
    rating: 4.2
  }

];

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
  let result = [...suppliers.value];

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

  // Apply featured filter
  if (filters.value.featured === 'featured') {
    result = result.filter(supplier => supplier.featured === true);
  } else if (filters.value.featured === 'regular') {
    result = result.filter(supplier => !supplier.featured);
  }

  return result;
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredSuppliers.value.length / itemsPerPage.value));

const paginatedSuppliers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredSuppliers.value.slice(start, end);
});

// Statistics
const stats = computed(() => {
  const total = suppliers.value.length;
  const featured = suppliers.value.filter(s => s.featured).length;
  const services = new Set(suppliers.value.map(s => s.service)).size;
  const avgRating = suppliers.value
    .filter(s => s.rating)
    .reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.value.filter(s => s.rating).length || 0;

  return {
    total,
    featured,
    services,
    avgRating: avgRating.toFixed(1)
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
  loading.value = true;
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    suppliers.value = [...mockSuppliers];
    showNotification('Datos actualizados correctamente', 'success', 'mdi-refresh');
  } catch (error) {
    console.error('Error refreshing data:', error);
    showNotification('Error al actualizar los datos', 'error', 'mdi-alert-circle');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  currentPage.value = 1; // Reset to first page when searching
}

function applyFilters() {
  currentPage.value = 1; // Reset to first page when applying filters
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
function handleViewSupplier(supplier: Supplier) {
  console.log('View supplier:', supplier);
  showNotification(`Viendo detalles de ${supplier.name}`, 'info', 'mdi-eye');
}

function handleContactSupplier(supplier: Supplier) {
  console.log('Contact supplier:', supplier);
  // Open phone dialer or email client
  if (supplier.phone) {
    window.open(`tel:${supplier.phone}`);
  }
  showNotification(`Contactando a ${supplier.name}`, 'info', 'mdi-phone');
}

function handleEditSupplier(supplier: Supplier) {
  console.log('Edit supplier:', supplier);
  showNotification(`Editando información de ${supplier.name}`, 'info', 'mdi-pencil');
}

function handleDeleteSupplier(supplier: Supplier) {
  console.log('Delete supplier:', supplier);
  // In a real app, show confirmation dialog first
  if (confirm(`¿Estás seguro de que deseas eliminar a ${supplier.name}?`)) {
    suppliers.value = suppliers.value.filter(s => s.id !== supplier.id);
    showNotification(`${supplier.name} eliminado correctamente`, 'success', 'mdi-delete');
  }
}

function handleToggleFeatured(supplier: Supplier) {
  console.log('Toggle featured:', supplier);
  const index = suppliers.value.findIndex(s => s.id === supplier.id);
  if (index !== -1) {
    suppliers.value[index] = {
      ...suppliers.value[index],
      featured: !suppliers.value[index].featured
    };

    const action = suppliers.value[index].featured ? 'marcado como destacado' : 'quitado de destacados';
    showNotification(`${supplier.name} ${action}`, 'success', 'mdi-star');
  }
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
  // Adjust rail based on screen size
  rail.value = mdAndUp.value;

  // Load initial data
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
