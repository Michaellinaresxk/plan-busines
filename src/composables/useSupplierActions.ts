// src/composables/useSupplierActions.ts
import { ref, type Ref } from 'vue';
import type { Supplier } from '@/types/supplier';

export interface SupplierActionHandlers {
  onView: (supplier: Supplier) => void | Promise<void>;
  onContact: (supplier: Supplier) => void | Promise<void>;
  onEdit: (supplier: Supplier) => void | Promise<void>;
  onDelete: (supplier: Supplier) => void | Promise<void>;
  onToggleFeatured: (supplier: Supplier) => void | Promise<void>;
}

export interface SupplierActionsState {
  loading: Ref<boolean>;
  error: Ref<string | null>;
}

export function useSupplierActions(handlers: SupplierActionHandlers) {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const executeAction = async (
    action: () => void | Promise<void>,
    errorMessage: string = 'Error al ejecutar la acción'
  ) => {
    try {
      loading.value = true;
      error.value = null;
      await action();
    } catch (err) {
      error.value = err instanceof Error ? err.message : errorMessage;
      console.error('Supplier action error:', err);
    } finally {
      loading.value = false;
    }
  };

  const handleView = (supplier: Supplier) => {
    executeAction(() => handlers.onView(supplier), 'Error al ver los detalles del proveedor');
  };

  const handleContact = (supplier: Supplier) => {
    executeAction(() => handlers.onContact(supplier), 'Error al contactar al proveedor');
  };

  const handleEdit = (supplier: Supplier) => {
    executeAction(() => handlers.onEdit(supplier), 'Error al editar el proveedor');
  };

  const handleDelete = (supplier: Supplier) => {
    executeAction(() => handlers.onDelete(supplier), 'Error al eliminar el proveedor');
  };

  const handleToggleFeatured = (supplier: Supplier) => {
    executeAction(
      () => handlers.onToggleFeatured(supplier),
      'Error al cambiar el estado destacado'
    );
  };

  return {
    // State
    loading,
    error,

    // Actions
    handleView,
    handleContact,
    handleEdit,
    handleDelete,
    handleToggleFeatured
  };
}

// Composable para manejar contacto específico
export function useSupplierContact() {
  const openPhoneCall = (phone: string) => {
    if (!phone) return;
    window.open(`tel:${phone}`, '_self');
  };

  const openEmailClient = (email: string, subject?: string) => {
    if (!email) return;
    const mailtoUrl = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
    window.open(mailtoUrl, '_self');
  };

  const openWhatsApp = (phone: string, message?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  };

  return {
    openPhoneCall,
    openEmailClient,
    openWhatsApp,
    copyToClipboard
  };
}
