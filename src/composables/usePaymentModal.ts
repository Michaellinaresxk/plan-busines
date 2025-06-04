// src/composables/usePaymentModal.ts
import { ref, provide, inject, type Ref } from 'vue';

export interface PaymentLinkData {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  totalPrice: number;
  date: string;
  time: string;
}

export interface PaymentModalController {
  showModal: (reservation: PaymentLinkData) => Promise<boolean>;
  hideModal: () => void;
  markAsSent: () => void;
  currentReservation: Ref<PaymentLinkData | null>;
  isVisible: Ref<boolean>;
}

// Symbol para injection key - evita colisiones
const PaymentModalKey = Symbol('PaymentModal') as symbol;

/**
 * ✅ PROVIDER: Usar en el componente padre para proveer el modal controller
 */
export function providePaymentModal(): PaymentModalController {
  // Estado reactivo del modal
  const currentReservation = ref<PaymentLinkData | null>(null);
  const isVisible = ref(false);

  // Promise resolver para manejar el resultado async
  let resolvePromise: ((sent: boolean) => void) | null = null;

  /**
   * 🎯 Mostrar modal y retornar Promise que resuelve cuando el usuario actúa
   */
  const showModal = (reservation: PaymentLinkData): Promise<boolean> => {
    return new Promise(resolve => {
      console.log('📱 Opening payment modal for:', reservation.clientName);

      // Configurar estado
      currentReservation.value = reservation;
      isVisible.value = true;
      resolvePromise = resolve;
    });
  };

  /**
   * ❌ Cerrar modal sin enviar (cancelar)
   */
  const hideModal = () => {
    console.log('❌ Payment modal cancelled');

    isVisible.value = false;
    currentReservation.value = null;

    if (resolvePromise) {
      resolvePromise(false); // No fue enviado
      resolvePromise = null;
    }
  };

  /**
   * ✅ Marcar como enviado y cerrar modal
   */
  const markAsSent = () => {
    if (!currentReservation.value) {
      console.warn('⚠️ No reservation to mark as sent');
      return;
    }

    console.log('✅ Payment marked as sent for:', currentReservation.value.clientName);

    isVisible.value = false;

    if (resolvePromise) {
      resolvePromise(true); // Fue enviado exitosamente
      resolvePromise = null;
    }

    // Limpiar después de un breve delay para animación
    setTimeout(() => {
      currentReservation.value = null;
    }, 300);
  };

  // Crear el controller object
  const controller: PaymentModalController = {
    showModal,
    hideModal,
    markAsSent,
    currentReservation,
    isVisible
  };

  // Proveer el controller para componentes hijos
  provide(PaymentModalKey, controller);

  return controller;
}

/**
 * ✅ CONSUMER: Usar en componentes hijos para acceder al modal controller
 */
export function usePaymentModal(): PaymentModalController {
  const controller = inject<PaymentModalController>(PaymentModalKey);

  if (!controller) {
    throw new Error(
      'usePaymentModal must be used within a component that provides PaymentModal. ' +
        'Make sure to call providePaymentModal() in a parent component.'
    );
  }

  return controller;
}

/**
 * ✅ COMPOSABLE EXTENDIDO: Con funcionalidades adicionales
 */
export function usePaymentModalWithUtilities() {
  const modalController = usePaymentModal();

  /**
   * 🎯 Enviar múltiples reservas secuencialmente
   */
  const sendMultiplePayments = async (
    reservations: PaymentLinkData[]
  ): Promise<{
    sent: PaymentLinkData[];
    cancelled: PaymentLinkData[];
  }> => {
    const sent: PaymentLinkData[] = [];
    const cancelled: PaymentLinkData[] = [];

    for (const reservation of reservations) {
      try {
        const wasSent = await modalController.showModal(reservation);

        if (wasSent) {
          sent.push(reservation);
        } else {
          cancelled.push(reservation);
        }
      } catch (error) {
        console.error('Error in payment modal:', error);
        cancelled.push(reservation);
      }
    }

    return { sent, cancelled };
  };

  /**
   * 📊 Generar estadísticas de envío
   */
  const generateSendingStats = (sent: PaymentLinkData[], cancelled: PaymentLinkData[]) => {
    const totalAmount = sent.reduce((sum, r) => sum + r.totalPrice, 0);
    const avgAmount = sent.length > 0 ? totalAmount / sent.length : 0;

    return {
      totalReservations: sent.length + cancelled.length,
      sentCount: sent.length,
      cancelledCount: cancelled.length,
      successRate: (sent.length / (sent.length + cancelled.length)) * 100,
      totalAmount,
      avgAmount: Math.round(avgAmount * 100) / 100
    };
  };

  return {
    ...modalController,
    sendMultiplePayments,
    generateSendingStats
  };
}

/**
 * ✅ TYPE GUARDS: Para validación de tipos
 */
export function isValidPaymentData(data: any): data is PaymentLinkData {
  return (
    data &&
    typeof data.bookingId === 'string' &&
    typeof data.clientName === 'string' &&
    typeof data.clientEmail === 'string' &&
    typeof data.serviceName === 'string' &&
    typeof data.totalPrice === 'number' &&
    typeof data.date === 'string' &&
    typeof data.time === 'string'
  );
}

/**
 * ✅ HELPER: Convertir ReservationView a PaymentLinkData
 */
export function reservationToPaymentData(reservation: any): PaymentLinkData {
  if (!isValidPaymentData(reservation)) {
    throw new Error('Invalid reservation data for payment processing');
  }

  return {
    bookingId: reservation.bookingId,
    clientName: reservation.clientName,
    clientEmail: reservation.clientEmail,
    serviceName: reservation.serviceName,
    totalPrice: reservation.totalPrice,
    date: reservation.date,
    time: reservation.time
  };
}

/**
 * ✅ TESTING UTILITIES: Para desarrollo y testing
 */
export function createMockPaymentData(overrides: Partial<PaymentLinkData> = {}): PaymentLinkData {
  return {
    bookingId: 'test-booking-123',
    clientName: 'Juan Pérez',
    clientEmail: 'juan@example.com',
    serviceName: 'Transporte Aeropuerto',
    totalPrice: 50,
    date: '2024-01-15',
    time: '14:00',
    ...overrides
  };
}

/**
 * ✅ CONSTANTS: Para configuración
 */
export const PAYMENT_MODAL_CONSTANTS = {
  ANIMATION_DURATION: 300,
  AUTO_CLOSE_DELAY: 2000,
  MAX_RETRIES: 3,
  DEFAULT_TIMEOUT: 30000 // 30 segundos
} as const;

// Export types para usar en otros archivos
export type PaymentModalResult = {
  success: boolean;
  sent: number;
  cancelled: number;
  reservations: PaymentLinkData[];
};

export type PaymentModalOptions = {
  timeout?: number;
  autoClose?: boolean;
  showProgress?: boolean;
};

/**
 * ✅ ADVANCED COMPOSABLE: Con opciones avanzadas
 */
export function useAdvancedPaymentModal(options: PaymentModalOptions = {}) {
  const basicController = usePaymentModal();

  const {
    timeout = PAYMENT_MODAL_CONSTANTS.DEFAULT_TIMEOUT,
    autoClose = false,
    showProgress = true
  } = options;

  /**
   * Mostrar modal con timeout automático
   */
  const showModalWithTimeout = (reservation: PaymentLinkData): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        basicController.hideModal();
        reject(new Error(`Payment modal timeout after ${timeout}ms`));
      }, timeout);

      basicController
        .showModal(reservation)
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  };

  return {
    ...basicController,
    showModalWithTimeout,
    options
  };
}
