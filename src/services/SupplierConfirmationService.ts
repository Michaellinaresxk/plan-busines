// src/services/SupplierConfirmationService.ts
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
  private readonly apiBaseUrl: string;

  constructor() {
    // ✅ Configuración dinámica de URL
    this.apiBaseUrl = this.getApiBaseUrl();
  }

  /**
   * ✅ OBTENER URL BASE DINÁMICAMENTE
   */
  private getApiBaseUrl(): string {
    // En desarrollo, usa el emulador
    if (import.meta.env.DEV) {
      return `http://127.0.0.1:5001/${import.meta.env.VITE_APIKEY}/us-central1`;
    }

    // En producción, usa la URL real de Firebase Functions
    return `https://us-central1-${import.meta.env.VITE_APIKEY}.cloudfunctions.net`;
  }

  /**
   * ✅ CARGAR DATOS DE CONFIRMACIÓN
   */
  async loadConfirmationData(bookingId: string, supplierId: string): Promise<ConfirmationPageData> {
    try {
      console.log('🔍 Loading confirmation data:', { bookingId, supplierId });

      if (!bookingId || !supplierId) {
        throw new Error('BookingId y SupplierId son requeridos');
      }

      const url = `${this.apiBaseUrl}/getSupplierConfirmation?booking=${bookingId}&supplier=${supplierId}`;
      console.log('📡 API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        // ✅ Configuración adicional para CORS
        mode: 'cors',
        credentials: 'omit'
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ API Response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Error del servidor');
      }

      return {
        reservation: result.data.reservation,
        supplier: result.data.supplier,
        isValid: result.data.isValid,
        error: result.data.error
      };
    } catch (error) {
      console.error('❌ Error loading confirmation data:', error);

      // ✅ Mensaje de error más descriptivo
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(
          'No se puede conectar con el servidor. Verifica que Firebase Functions esté corriendo.'
        );
      }

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

      const url = `${this.apiBaseUrl}/processSupplierConfirmation`;
      console.log('📡 API URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          ...confirmationData,
          timestamp: new Date().toISOString()
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ API Response:', result);

      return {
        success: result.success,
        message: result.message,
        data: result.data
      };
    } catch (error) {
      console.error('❌ Error submitting confirmation:', error);

      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return {
          success: false,
          message: 'No se puede conectar con el servidor. Verifica tu conexión a internet.'
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al procesar la confirmación'
      };
    }
  }

  /**
   * VALIDACIONES
   */
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
