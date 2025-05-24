<template>
  <div class="supplier-list">
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center py-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <!-- Empty State -->
    <v-card v-else-if="!suppliers || suppliers.length === 0"
      class="mb-6 pa-8 d-flex flex-column align-center justify-center" elevation="0" rounded="lg" border>
      <v-avatar color="grey-lighten-1" class="mb-4" size="64">
        <v-icon icon="mdi-account-hard-hat" size="36" color="white"></v-icon>
      </v-avatar>

      <h3 class="text-h5 mb-2 text-center">{{ emptyStateTitle }}</h3>

      <p class="text-medium-emphasis text-body-1 text-center mb-6">
        {{ emptyStateMessage }}
      </p>

      <v-btn color="primary" prepend-icon="mdi-refresh" @click="$emit('refresh')" :loading="loading">
        {{ refreshButtonLabel }}
      </v-btn>
    </v-card>


    <!-- Suppliers Grid -->
    <template v-if="suppliers && suppliers.length > 0">
      <v-row>
        <v-col v-for="supplier in (suppliers || [])" :key="supplier.id" :cols="colSize.cols" :sm="colSize.sm"
          :md="colSize.md" :lg="colSize.lg">
          <SupplierCard :supplier="supplier" @view="handleView" @contact="handleContact" @edit="handleEdit"
            @delete="handleDelete" @toggle-featured="handleToggleFeatured" />
        </v-col>
      </v-row>

      <!-- Pagination if needed -->
      <div v-if="showPagination && totalPages > 1" class="d-flex justify-center mt-6">
        <v-pagination v-model="currentPageModel" :length="totalPages" :total-visible="totalVisible" rounded="circle"
          :disabled="loading" color="primary"></v-pagination>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import SupplierCard from '@/UI/components/suppliers/SupplierCard.vue';

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

interface ColumnSize {
  cols: number;
  sm?: number;
  md?: number;
  lg?: number;
}

// Props
interface Props {
  suppliers?: Supplier[]; // ✅ Hacerlo opcional
  loading?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalVisible?: number;
  showPagination?: boolean;
  // Empty state props
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  refreshButtonLabel?: string;
  // Grid configuration
  colSize?: ColumnSize;
}

const props = withDefaults(defineProps<Props>(), {
  suppliers: () => [], // ✅ Array vacío por defecto
  loading: false,
  currentPage: 1,
  totalPages: 1,
  totalVisible: 7,
  showPagination: true,
  emptyStateTitle: 'No hay proveedores',
  emptyStateMessage: 'No se encontraron proveedores registrados en el sistema.',
  refreshButtonLabel: 'Actualizar datos',
  colSize: () => ({ cols: 12, sm: 6, md: 4, lg: 3 })
});

// Emits
const emit = defineEmits<{
  'update:current-page': [page: number];
  refresh: [];
  view: [supplier: Supplier];
  contact: [supplier: Supplier];
  edit: [supplier: Supplier];
  delete: [supplier: Supplier];
  'toggle-featured': [supplier: Supplier];
}>();

// Debug watch
watch(() => props.suppliers, (newSuppliers) => {
  console.log('🔍 SupplierList: suppliers prop changed');
  console.log('  - New suppliers count:', newSuppliers?.length || 0);
  console.log('  - Suppliers data:', newSuppliers);
  console.log('  - Loading state:', props.loading);
}, { immediate: true, deep: true });

// Computed
const currentPageModel = computed({
  get: () => props.currentPage,
  set: (value) => emit('update:current-page', value)
});

// Event handlers
function handleView(supplier: Supplier) {
  console.log('🔍 SupplierList: handleView called', supplier);
  emit('view', supplier);
}

function handleContact(supplier: Supplier) {
  console.log('📞 SupplierList: handleContact called', supplier);
  emit('contact', supplier);
}

function handleEdit(supplier: Supplier) {
  console.log('✏️ SupplierList: handleEdit called', supplier);
  emit('edit', supplier);
}

function handleDelete(supplier: Supplier) {
  console.log('🗑️ SupplierList: handleDelete called', supplier);
  emit('delete', supplier);
}

function handleToggleFeatured(supplier: Supplier) {
  console.log('⭐ SupplierList: handleToggleFeatured called', supplier);
  emit('toggle-featured', supplier);
}
</script>

<style scoped>
.supplier-list {
  min-height: 200px;
}
</style>
