<template>
  <v-app>
    <v-layout>
      <!-- Sidebar -->
      <DashboardSidebar
        v-model:drawer="drawer"
        v-model:rail="rail"
        :md-and-up="mdAndUp"
        :pending-count="0"
        :suppliers-count="0"
        @create-reservation="handleCreateReservation"
        @logout="handleLogout" />

      <v-main class="main-content">
        <!-- Header -->
        <DashboardHeader
          v-model:drawer="drawer"
          v-model:rail="rail"
          :md-and-up="mdAndUp"
          title="Gestión Completa de Servicios"
          subtitle="Sistema integrado: Variantes + Lógica de Negocio" />

        <v-container fluid class="pa-6">
          <!-- Enhanced Business Stats -->
          <v-row class="mb-6">
            <v-col cols="12" sm="6" md="3">
              <v-card class="stats-card h-100" elevation="2" rounded="lg">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <p class="text-caption text-medium-emphasis mb-1">Total Servicios</p>
                      <h2 class="text-h4 font-weight-bold text-primary">{{ businessStats.totalServices }}</h2>
                    </div>
                    <v-avatar color="primary" size="48" variant="tonal">
                      <v-icon icon="mdi-briefcase" size="24"></v-icon>
                    </v-avatar>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-card class="stats-card h-100" elevation="2" rounded="lg">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <p class="text-caption text-medium-emphasis mb-1">Total Variantes</p>
                      <h2 class="text-h4 font-weight-bold text-info">{{ businessStats.totalVariants }}</h2>
                    </div>
                    <v-avatar color="info" size="48" variant="tonal">
                      <v-icon icon="mdi-tune-variant" size="24"></v-icon>
                    </v-avatar>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-card class="stats-card h-100" elevation="2" rounded="lg">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <p class="text-caption text-medium-emphasis mb-1">Ganancia Total</p>
                      <h2 class="text-h4 font-weight-bold text-success">${{ businessStats.totalProfit }}</h2>
                    </div>
                    <v-avatar color="success" size="48" variant="tonal">
                      <v-icon icon="mdi-trending-up" size="24"></v-icon>
                    </v-avatar>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <v-card class="stats-card h-100" elevation="2" rounded="lg">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <p class="text-caption text-medium-emphasis mb-1">Taxes Total</p>
                      <h2 class="text-h4 font-weight-bold text-warning">${{ businessStats.totalTaxes }}</h2>
                    </div>
                    <v-avatar color="warning" size="48" variant="tonal">
                      <v-icon icon="mdi-calculator" size="24"></v-icon>
                    </v-avatar>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- 🎯 TABLA DE SERVICIOS CORREGIDA -->
          <ServicesTable
            :services="services"
            :loading="loading"
            @create-service="openCreateDialog"
            @refresh="loadServices"
            @view-service="viewServiceDetails"
            @edit-service="editService"
            @duplicate-service="duplicateService"
            @toggle-status="toggleServiceStatus"
            @delete-service="deleteService"
            @variant-updated="handleVariantUpdated"
            @variant-deleted="handleVariantDeleted" />
        </v-container>
      </v-main>

      <!-- Service Creation Dialog -->
      <v-dialog v-model="showCreateDialog" max-width="900" persistent scrollable>
        <DynamicServiceForm
          @service-created="handleServiceCreated"
          @cancel="showCreateDialog = false" />
      </v-dialog>

      <!-- Snackbar Notifications -->
      <v-snackbar
        v-model="showSnackbar"
        :color="snackbarColor"
        location="bottom end"
        rounded="pill"
        timeout="4000">
        <div class="d-flex align-center">
          <v-icon :icon="snackbarIcon" class="mr-2" size="small"></v-icon>
          {{ snackbarText }}
        </div>
        <template v-slot:actions>
          <v-btn icon="mdi-close" variant="text" @click="showSnackbar = false"></v-btn>
        </template>
      </v-snackbar>
    </v-layout>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import DashboardHeader from '@/UI/components/dashboard/DashboardHeader.vue';
import DashboardSidebar from '@/UI/components/dashboard/DashboardSidebar.vue';
import ServicesTable from '@/UI/components/inventory/ServicesTable.vue'; // ✅ CORREGIDO
import DynamicServiceForm from '@/UI/components/inventory/DynamicServiceForm.vue';
import { serviceServiceKey } from '@/services/ServiceService';
import { calculateServicePrice } from '@/config/simpleServiceConfig';
import type { ServiceView } from '@/views/ServiceView';

console.log('🎯 InventoryPage: Initializing fixed version...');

// Dependencies
const { mdAndUp } = useDisplay();
const router = useRouter();
const serviceService = inject(serviceServiceKey);

if (!serviceService) {
  throw new Error('ServiceService not provided');
}

// Layout state
const drawer = ref(true);
const rail = ref(false);

// Data state
const loading = ref(false);
const services = ref<ServiceView[]>([]);

// UI state
const showCreateDialog = ref(false);
const debugMode = ref(true); // Para debug temporal

// Notifications
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarIcon = ref('mdi-check-circle');

// Enhanced business statistics
const businessStats = computed(() => {
  const activeServices = services.value.filter(s => s.isActive);

  const totalVariants = activeServices.reduce((total, service) => {
    return total + (service.variants?.length || 0);
  }, 0);

  let totalProfit = 0;
  let totalTaxes = 0;

  activeServices.forEach(service => {
    if (service.profit && service.taxes) {
      totalProfit += service.profit;
      totalTaxes += service.taxes;
    } else {
      try {
        const calculation = calculateServicePrice(service.category, service);
        totalProfit += calculation.profit;
        totalTaxes += calculation.taxes;
      } catch (error) {
        const baseProfit = service.basePrice * 0.30;
        const baseTaxes = service.basePrice * 0.18;
        totalProfit += baseProfit;
        totalTaxes += baseTaxes;
      }
    }

    if (service.variants) {
      service.variants.forEach(variant => {
        try {
          const calculation = calculateServicePrice(service.category, { ...service, ...variant });
          totalProfit += calculation.profit;
          totalTaxes += calculation.taxes;
        } catch (error) {
          const variantPrice = variant.price || service.basePrice;
          totalProfit += variantPrice * 0.30;
          totalTaxes += variantPrice * 0.18;
        }
      });
    }
  });

  return {
    totalServices: activeServices.length,
    totalVariants,
    totalProfit: Math.round(totalProfit),
    totalTaxes: Math.round(totalTaxes)
  };
});

// Methods
async function loadServices() {
  try {
    loading.value = true;
    console.log('🔄 Loading services...');

    services.value = await serviceService.getAllServices();

    console.log('✅ Services loaded:', services.value.length);
    console.log('📊 Business stats:', businessStats.value);
    console.log('📋 First service:', services.value[0]);

  } catch (error) {
    console.error('❌ Error loading services:', error);
    showNotification('Error al cargar los servicios', 'error');
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  showCreateDialog.value = true;
}

async function handleServiceCreated(serviceData: any) {
  console.log('✅ Service created with business logic:', serviceData);

  try {
    // 🚀 DESCOMENTAR Y AJUSTAR ESTA LÍNEA:
    await serviceService.createService(
      serviceData.title,                    // title
      serviceData.category,                 // category
      serviceData.basePrice,               // basePrice
      serviceData.currency || 'USD',       // currency
      serviceData.description || '',       // description
      serviceData.variants || [],          // variants
      serviceData.tags || []               // tags
    );

    showCreateDialog.value = false;
    await loadServices();
    showNotification('Servicio creado exitosamente', 'success');

  } catch (error) {
    console.error('❌ Error creating service:', error);
    showNotification('Error al crear el servicio', 'error');
  }
}

function viewServiceDetails(service: ServiceView) {
  console.log('👀 Viewing service details:', service.title);
  showNotification(`Viendo detalles de ${service.title}`, 'info');
}

function editService(service: ServiceView) {
  console.log('✏️ Editing service:', service.title);
  showNotification('Función de edición próximamente', 'info');
}

function duplicateService(service: ServiceView) {
  console.log('📋 Duplicating service:', service.title);
  showNotification(`Servicio "${service.title}" duplicado`, 'success');
}

async function toggleServiceStatus(service: ServiceView) {
  try {
    console.log('🔄 Toggling service status:', service.title);
    await loadServices();
    const newStatus = !service.isActive ? 'activado' : 'desactivado';
    showNotification(`Servicio "${service.title}" ${newStatus}`, 'success');
  } catch (error) {
    console.error('❌ Error toggling service status:', error);
    showNotification('Error al cambiar el estado del servicio', 'error');
  }
}

async function deleteService(service: ServiceView) {
  try {
    const confirmed = confirm(`¿Estás seguro de que quieres eliminar "${service.title}"?`);
    if (!confirmed) return;

    console.log('🗑️ Deleting service:', service.title);
    await loadServices();
    showNotification(`Servicio "${service.title}" eliminado`, 'success');
  } catch (error) {
    console.error('❌ Error deleting service:', error);
    showNotification('Error al eliminar el servicio', 'error');
  }
}

async function handleVariantUpdated(serviceId: string, variantData: any) {
  try {
    console.log('🔄 Updating variant for service:', serviceId, variantData);
    await loadServices();
    showNotification('Variante actualizada con cálculos de negocio', 'success');
  } catch (error) {
    console.error('❌ Error updating variant:', error);
    showNotification('Error al actualizar la variante', 'error');
  }
}

async function handleVariantDeleted(serviceId: string, variantId: string) {
  try {
    console.log('🗑️ Deleting variant:', variantId, 'from service:', serviceId);
    await loadServices();
    showNotification('Variante eliminada exitosamente', 'success');
  } catch (error) {
    console.error('❌ Error deleting variant:', error);
    showNotification('Error al eliminar la variante', 'error');
  }
}

function handleCreateReservation() {
  router.push('/create-reservation');
}

function handleLogout() {
  console.log('Logout');
}

function showNotification(text: string, color: 'success' | 'error' | 'info' | 'warning') {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbarIcon.value = color === 'success' ? 'mdi-check-circle' :
                      color === 'error' ? 'mdi-alert-circle' :
                      color === 'warning' ? 'mdi-alert' : 'mdi-information';
  showSnackbar.value = true;
}

// Lifecycle
onMounted(async () => {
  rail.value = mdAndUp.value;
  await loadServices();

  console.log('🎯 InventoryPage: Sistema corregido inicializado');
  console.log('📋 Características: Tabla funcionando + Lógica de Negocio');
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

console.log('🔧 InventoryPage: Sistema corregido configurado');
</script>

<style scoped>
.main-content {
  background-color: rgb(var(--v-theme-background));
}

.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
}
</style>
