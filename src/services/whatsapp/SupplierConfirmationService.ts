// src/services/SupplierConfirmationService.ts
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  connectFirestoreEmulator
} from 'firebase/firestore';

// ✅ CONFIGURACIÓN DE FIREBASE PÚBLICO
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase (instancia separada para confirmaciones públicas)
const publicApp = initializeApp(firebaseConfig, 'supplier-confirmation');
const publicDb = getFirestore(publicApp);

// Conectar al emulador en desarrollo
if (import.meta.env.DEV) {
  try {
    connectFirestoreEmulator(publicDb, 'localhost', 8080);
  } catch (error) {
    // Emulador ya conectado o no disponible
    console.log('Firestore emulator already connected or unavailable');
  }
}

export interface SupplierConfirmationData {
  bookingId: string;
  supplierId: string;
  decision: 'accept' | 'decline';
  message: string;
  estimatedArrival?: string;
  additionalNotes?: string;
}

export interface ConfirmationPageData {
  reservation: any;
  supplier: any;
  isValid: boolean;
  error?: string;
}

export class SupplierConfirmationService {
  /**
   * ✅ CARGAR DATOS DE CONFIRMACIÓN
   */
  async loadConfirmationData(bookingId: string, supplierId: string): Promise<ConfirmationPageData> {
    try {
      console.log('🔍 Loading confirmation data:', { bookingId, supplierId });

      if (!bookingId || !supplierId) {
        throw new Error('BookingId y SupplierId son requeridos');
      }

      // Obtener reserva y proveedor en paralelo usando Firebase directamente
      const [reservationDoc, supplierDoc] = await Promise.all([
        getDoc(doc(publicDb, 'bookings', bookingId)),
        getDoc(doc(publicDb, 'supliers', supplierId))
      ]);

      if (!reservationDoc.exists()) {
        throw new Error('Reserva no encontrada');
      }

      if (!supplierDoc.exists()) {
        throw new Error('Proveedor no encontrado');
      }

      const reservation = {
        bookingId: reservationDoc.id,
        ...reservationDoc.data(),
        // Convertir Timestamp a fecha legible
        bookingDate: reservationDoc.data()?.bookingDate?.toDate?.()?.toISOString() || null
      };

      const supplier = {
        id: supplierDoc.id,
        ...supplierDoc.data()
      };

      // Validar compatibilidad de servicio
      const isServiceMatch = this.validateServiceMatch(reservation, supplier);

      if (!isServiceMatch) {
        return {
          reservation,
          supplier,
          isValid: false,
          error: 'El proveedor no está autorizado para este tipo de servicio'
        };
      }

      // Verificar que la reserva esté en estado pendiente
      if (reservation.status !== 'pending') {
        return {
          reservation,
          supplier,
          isValid: false,
          error: `La reserva ya no está pendiente. Estado actual: ${reservation.status}`
        };
      }

      console.log('✅ Confirmation data loaded successfully');

      return {
        reservation,
        supplier,
        isValid: true
      };
    } catch (error) {
      console.error('❌ Error loading confirmation data:', error);
      throw error;
    }
  }

  /**
   * ✅ PROCESAR CONFIRMACIÓN DEL PROVEEDOR
   */
  async submitSupplierConfirmation(confirmationData: SupplierConfirmationData): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      console.log('📤 Submitting supplier confirmation:', confirmationData);

      // Validar datos
      const validation = this.validateConfirmationData(confirmationData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Referencia al documento de la reserva
      const reservationRef = doc(publicDb, 'bookings', confirmationData.bookingId);

      // Verificar que la reserva aún existe y está pendiente
      const reservationDoc = await getDoc(reservationRef);

      if (!reservationDoc.exists()) {
        throw new Error('La reserva no existe');
      }

      const currentStatus = reservationDoc.data()?.status;
      if (currentStatus !== 'pending') {
        throw new Error(`La reserva ya no está pendiente. Estado actual: ${currentStatus}`);
      }

      // Obtener información del proveedor para el log
      const supplierDoc = await getDoc(doc(publicDb, 'supliers', confirmationData.supplierId));
      const supplierName = supplierDoc.exists() ? supplierDoc.data()?.name : 'Unknown';

      // ✅ ACTUALIZAR ESTADO EN FIREBASE
      const newStatus = confirmationData.decision === 'accept' ? 'approved' : 'rejected';

      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp(),
        supplierResponse: {
          supplierId: confirmationData.supplierId,
          supplierName: supplierName,
          decision: confirmationData.decision,
          message: confirmationData.message,
          estimatedArrival: confirmationData.estimatedArrival || null,
          additionalNotes: confirmationData.additionalNotes || null,
          responseDate: serverTimestamp()
        }
      };

      console.log('🔄 Updating reservation in Firebase:', {
        bookingId: confirmationData.bookingId,
        newStatus,
        supplierName
      });

      // ✅ EJECUTAR ACTUALIZACIÓN
      await updateDoc(reservationRef, updateData);

      console.log('✅ Firebase updated successfully');

      const successMessage =
        confirmationData.decision === 'accept'
          ? 'Confirmación exitosa. Se ha notificado al cliente y se agregará al calendario.'
          : 'Respuesta registrada. Se buscará otro proveedor disponible.';

      return {
        success: true,
        message: successMessage,
        data: {
          bookingId: confirmationData.bookingId,
          newStatus,
          supplierName,
          responseDate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Error submitting confirmation:', error);

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al procesar la confirmación'
      };
    }
  }

  /**
   * VALIDACIONES
   */
  private validateServiceMatch(reservation: any, supplier: any): boolean {
    const reservationService = reservation.serviceId || reservation.serviceName;
    const supplierService = supplier.service;

    if (!reservationService || !supplierService) {
      return false;
    }

    // Normalizar strings para comparación
    const normalizeService = (service: string) => service.toLowerCase().replace(/[-_\s]/g, '');

    const normalizedReservation = normalizeService(reservationService);
    const normalizedSupplier = normalizeService(supplierService);

    return (
      normalizedReservation === normalizedSupplier ||
      normalizedReservation.includes(normalizedSupplier) ||
      normalizedSupplier.includes(normalizedReservation)
    );
  }

  private validateConfirmationData(data: SupplierConfirmationData): {
    isValid: boolean;
    error?: string;
  } {
    if (!data.bookingId) {
      return { isValid: false, error: 'ID de reserva requerido' };
    }

    if (!data.supplierId) {
      return { isValid: false, error: 'ID de proveedor requerido' };
    }

    if (!['accept', 'decline'].includes(data.decision)) {
      return { isValid: false, error: 'Decisión inválida' };
    }

    if (!data.message || data.message.trim().length < 10) {
      return { isValid: false, error: 'El mensaje debe tener al menos 10 caracteres' };
    }

    return { isValid: true };
  }
}

// ✅ EXPORTAR INSTANCIA SINGLETON
export const supplierConfirmationService = new SupplierConfirmationService();
