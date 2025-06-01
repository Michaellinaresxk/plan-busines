<!-- src/components/suppliers/SuppliersGrid.vue -->
<template>
  <div class="suppliers-grid">
    <!-- Loading State -->
    <div v-if="loading" class="loading-grid">
      <div v-for="n in 6" :key="n" class="skeleton-card" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!suppliers.length" class="empty-state">
      <v-icon icon="mdi-account-group-outline" size="64" color="grey-lighten-1" />
      <h3>No hay proveedores</h3>
      <p>Aún no se han agregado proveedores a esta categoría</p>
      <v-btn color="primary" variant="elevated" prepend-icon="mdi-plus" @click="$emit('add-supplier')">
        Agregar Proveedor
      </v-btn>
    </div>

    <!-- Suppliers Grid -->
    <div v-else class="grid">
      <TransitionGroup name="card" tag="div" class="grid-container">
        <SupplierCard v-for="supplier in suppliers" :key="supplier.id" :supplier="supplier" @view="handleView"
          @contact="handleContact" @edit="handleEdit" @delete="handleDelete" @toggle-featured="handleToggleFeatured" />
      </TransitionGroup>
    </div>

    <!-- Contact Dialog -->
    <ContactDialog v-model="contactDialog.show" :supplier="contactDialog.supplier"
      @close="contactDialog.show = false" />

    <!-- Delete Confirmation -->
    <ConfirmDialog v-model="deleteDialog.show" title="Eliminar Proveedor"
      :text="`¿Estás seguro de que deseas eliminar a ${deleteDialog.supplier?.name}?`" confirm-text="Eliminar"
      confirm-color="error" @confirm="confirmDelete" @cancel="deleteDialog.show = false" />

    <!-- Snackbar for feedback -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="bottom">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import SupplierCard from '@/components/cards/SupplierCard.vue';
import ContactDialog from '@/components/dialogs/ContactDialog.vue';
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue';
import { useSupplierActions, useSupplierContact } from '@/composables/useSupplierActions';
import { useSupplierStore } from '@/stores/supplierStore';
import type { Supplier } from '@/types/supplier';

interface Props {
  suppliers: Supplier[];
  loading?: boolean;
}

interface Emits {
  'add-supplier': [];
  'supplier-updated': [supplier: Supplier];
  'supplier-deleted': [supplierId: string];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const emit = defineEmits<Emits>();

const router = useRouter();
const supplierStore = useSupplierStore();
const { openPhoneCall, openEmailClient, openWhatsApp } = useSupplierContact();

// Dialogs state
const contactDialog = reactive({
  show: false,
  supplier: null as Supplier | null
});

const deleteDialog = reactive({
  show: false,
  supplier: null as Supplier | null
});

// Snackbar state
const snackbar = reactive({
  show: false,
  message: '',
  color: 'success' as 'success' | 'error' | 'warning' | 'info'
});

// Actions handlers
const supplierActionHandlers = {
  onView: (supplier: Supplier) => {
    router.push(`/suppliers/${supplier.id}`);
  },

  onContact: (supplier: Supplier) => {
    contactDialog.supplier = supplier;
    contactDialog.show = true;
  },

  onEdit: (supplier: Supplier) => {
    router.push(`/suppliers/${supplier.id}/edit`);
  },

  onDelete: (supplier: Supplier) => {
    deleteDialog.supplier = supplier;
    deleteDialog.show = true;
  },

  onToggleFeatured: async (supplier: Supplier) => {
    try {
      const updatedSupplier = await supplierStore.toggleFeatured(supplier.id);
      emit('supplier-updated', updatedSupplier);

      showSnackbar(
        `${supplier.name} ${updatedSupplier.featured ? 'marcado como' : 'removido de'} destacado`,
        'success'
      );
    } catch (error) {
      showSnackbar('Error al actualizar el estado destacado', 'error');
    }
  }
};

const {
  loading: actionLoading,
  error: actionError,
  handleView,
  handleContact,
  handleEdit,
  handleDelete,
  handleToggleFeatured
} = useSupplierActions(supplierActionHandlers);

// Utility functions
const showSnackbar = (message: string, color: typeof snackbar.color) => {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.show = true;
};

const confirmDelete = async () => {
  if (!deleteDialog.supplier) return;

  try {
    await supplierStore.deleteSupplier(deleteDialog.supplier.id);
    emit('supplier-deleted', deleteDialog.supplier.id);
    showSnackbar(`${deleteDialog.supplier.name} eliminado exitosamente`, 'success');
  } catch (error) {
    showSnackbar('Error al eliminar el proveedor', 'error');
  } finally {
    deleteDialog.show = false;
    deleteDialog.supplier = null;
  }
};

// Contact methods (for ContactDialog)
const handleDirectContact = (supplier: Supplier, method: 'phone' | 'email' | 'whatsapp') => {
  switch (method) {
    case 'phone':
      openPhoneCall(supplier.phone);
      break;
    case 'email':
      openEmailClient(supplier.email, `Consulta sobre ${supplier.service}`);
      break;
    case 'whatsapp':
      openWhatsApp(supplier.phone, `Hola ${supplier.name}, me interesa su servicio de ${supplier.service}`);
      break;
  }

  contactDialog.show = false;
  showSnackbar(`Contactando a ${supplier.name}`, 'info');
};
</script>

<style scoped>
.suppliers-grid {
  width: 100%;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.skeleton-card {
  height: 280px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 16px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  gap: 16px;
}

.empty-state h3 {
  font-size: 24px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

.empty-state p {
  font-size: 16px;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
  max-width: 400px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

/* Card transitions */
.card-enter-active,
.card-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.card-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.card-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive design */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .loading-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .suppliers-grid {
    padding: 0 8px;
  }
}
</style>
