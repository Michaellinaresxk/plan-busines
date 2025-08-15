import { ref, computed } from 'vue';
import { inject } from 'vue';
import { paymentServiceKey } from '@/services/PaymentService';
import type { PaymentStatus } from '@/domain/payment/Payment';

export interface PaymentFlowState {
  isCreating: boolean;
  isProcessing: boolean;
  error: string | null;
  paymentUrl: string | null;
  status: PaymentStatus | null;
}

export function usePaymentFlow() {
  // ✅ Dependency Injection - Clean pattern
  const paymentService = inject(paymentServiceKey);
  if (!paymentService) {
    throw new Error("PaymentService not provided. Ensure it's injected in app setup.");
  }

  // ✅ Reactive State Management
  const state = ref<PaymentFlowState>({
    isCreating: false,
    isProcessing: false,
    error: null,
    paymentUrl: null,
    status: null
  });

  // ✅ Computed Properties for UI State
  const canCreatePayment = computed(() => !state.value.isCreating && !state.value.isProcessing);

  const hasError = computed(() => !!state.value.error);

  const isReady = computed(() => state.value.paymentUrl && !state.value.error);

  // ✅ Clear Error Handling
  const clearError = () => {
    state.value.error = null;
  };

  const resetState = () => {
    state.value = {
      isCreating: false,
      isProcessing: false,
      error: null,
      paymentUrl: null,
      status: null
    };
  };

  // ✅ Business Logic Separation
  const createPaymentLink = async (
    reservationId: string,
    amount: number,
    customerEmail: string,
    customerName: string,
    description: string
  ) => {
    if (!canCreatePayment.value) {
      throw new Error('Cannot create payment in current state');
    }

    state.value.isCreating = true;
    state.value.error = null;

    try {
      console.log('🔄 Creating payment link...', { reservationId, amount });

      const payment = await paymentService.createPayment(
        reservationId,
        amount,
        'EUR', // Could be configurable
        customerEmail,
        customerName,
        description,
        'stripe', // Could be configurable
        48 // 48h expiration
      );

      state.value.paymentUrl = payment.paymentUrl;
      state.value.status = payment.status;

      console.log('✅ Payment link created:', payment.paymentUrl);
      return payment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      state.value.error = `Failed to create payment: ${errorMessage}`;
      console.error('❌ Payment creation failed:', error);
      throw error;
    } finally {
      state.value.isCreating = false;
    }
  };

  // ✅ Payment Status Check with Polling
  const checkPaymentStatus = async (paymentId: string) => {
    try {
      state.value.isProcessing = true;
      const payment = await paymentService.getPaymentById(paymentId);
      state.value.status = payment.status;
      return payment;
    } catch (error) {
      state.value.error = `Failed to check payment status: ${error}`;
      throw error;
    } finally {
      state.value.isProcessing = false;
    }
  };

  return {
    // State
    state: readonly(state),

    // Computed
    canCreatePayment,
    hasError,
    isReady,

    // Actions
    createPaymentLink,
    checkPaymentStatus,
    clearError,
    resetState
  };
}
