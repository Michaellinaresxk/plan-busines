// src/services/SupplierConfirmationService.ts
import type { ReservationView } from '@/views/ReservationView';
import type { SupplierView } from '@/views/SupplierView';

export interface SupplierConfirmationData {
  bookingId: string;
  supplierId: string;
  decision: 'accept' | 'decline';
  message: string;
  estimatedArrival?: string;
  additionalNotes?: string;
}

export interface ConfirmationPageData {
  reservation: ReservationView;
  supplier: SupplierView;
  isValid: boolean;
  error?: string;
}

export class SupplierConfirmationService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || '/api/supplier-confirmations';
  }

  /**
   * Cargar datos de la página de confirmación
   */
  async loadConfirmationData(bookingId: string, supplierId: string): Promise<ConfirmationPageData> {
    try {
      console.log('🔍 Loading confirmation data:', { bookingId, supplierId });

      // En un entorno real, esto sería una llamada a la API
      // Por ahora, usamos datos simulados basados en los parámetros de la URL

      const reservation = await this.getReservationData(bookingId);
      const supplier = await this.getSupplierData(supplierId);

      // Validar que el proveedor puede realizar este servicio
      const isServiceMatch = this.validateServiceMatch(reservation, supplier);

      if (!isServiceMatch) {
        return {
          reservation,
          supplier,
          isValid: false,
          error: 'El proveedor no está autorizado para este tipo de servicio'
        };
      }

      return {
        reservation,
        supplier,
        isValid: true
      };
    } catch (error) {
      console.error('❌ Error loading confirmation data:', error);

      // Datos de error por defecto
      return {
        reservation: {} as ReservationView,
        supplier: {} as SupplierView,
        isValid: false,
        error: error instanceof Error ? error.message : 'Error al cargar los datos'
      };
    }
  }

  /**
   * Enviar confirmación del proveedor
   */
  async submitSupplierConfirmation(confirmationData: SupplierConfirmationData): Promise<{
    success: boolean;
    message: string;
    redirectUrl?: string;
  }> {
    try {
      console.log('📤 Submitting supplier confirmation:', confirmationData);

      // Validar datos
      const validation = this.validateConfirmationData(confirmationData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // En un entorno real, esto sería una llamada POST a la API
      // Simulamos el proceso
      await this.simulateApiCall(confirmationData);

      // Generar respuesta basada en la decisión
      const isAccepted = confirmationData.decision === 'accept';

      return {
        success: true,
        message: isAccepted
          ? '¡Confirmación exitosa! El cliente será notificado de tu disponibilidad.'
          : 'Respuesta enviada. Buscaremos otro proveedor disponible.',
        redirectUrl: this.generateRedirectUrl(confirmationData)
      };
    } catch (error) {
      console.error('❌ Error submitting confirmation:', error);

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al enviar la confirmación'
      };
    }
  }

  /**
   * Obtener datos de la reserva (simulado)
   */
  private async getReservationData(bookingId: string): Promise<ReservationView> {
    // En desarrollo real, esto sería una llamada a la API
    // Por ahora creamos datos mock basados en el tipo de servicio detectado

    return {
      bookingId,
      serviceName: 'Transporte Aeropuerto',
      serviceId: 'airport-transfer',
      clientName: 'María González',
      clientEmail: 'maria@email.com',
      clientPhone: '(809) 555-0456',
      date: '2024-01-25',
      time: '14:30',
      totalPrice: 75,
      status: 'pending',
      notes: 'Vuelo internacional, necesito llegada 2 horas antes.',
      isNewClient: false,
      isPriority: false,
      createdAt: new Date(),
      bookingDate: new Date(),
      timeAgo: '2 horas',

      // Datos específicos del servicio (formData)
      formData: {
        flightNumber: 'AA1234',
        vehicleType: 'vanMedium',
        passengerCount: 2,
        kidsCount: 1,
        needsCarSeat: true,
        carSeatCount: 1,
        isRoundTrip: true,
        returnDate: '2024-01-30',
        returnFlightNumber: 'AA5678',
        specialRequests: 'Por favor llegar 15 minutos antes de la hora programada'
      },

      toPlainObject: function () {
        return { ...this };
      }
    } as ReservationView;
  }

  /**
   * Obtener datos del proveedor (simulado)
   */
  private async getSupplierData(supplierId: string): Promise<SupplierView> {
    // En desarrollo real, esto sería una llamada a la API

    return {
      id: supplierId,
      name: 'Juan Pérez',
      cedula: '001-0123456-7',
      email: 'juan@email.com',
      phone: '(809) 555-0123',
      service: 'airport-transfer',
      canProvideService: true,
      createdAt: new Date(),

      toPlainObject: function () {
        return { ...this };
      }
    } as SupplierView;
  }

  /**
   * Validar que el proveedor puede realizar este servicio
   */
  private validateServiceMatch(reservation: ReservationView, supplier: SupplierView): boolean {
    return (
      supplier.service === reservation.serviceId ||
      supplier.service === reservation.serviceName?.toLowerCase().replace(/\s+/g, '-')
    );
  }

  /**
   * Validar datos de confirmación
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

  /**
   * Simular llamada a la API
   */
  private async simulateApiCall(data: SupplierConfirmationData): Promise<void> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simular posible error (5% de probabilidad)
    if (Math.random() < 0.05) {
      throw new Error('Error de conexión temporal');
    }

    console.log('✅ API call simulation completed for:', data.bookingId);
  }

  /**
   * Generar URL de redirección
   */
  private generateRedirectUrl(data: SupplierConfirmationData): string {
    // Podrías redirigir a un dashboard del proveedor o página de éxito
    return `/supplier-dashboard?confirmation=${data.bookingId}`;
  }

  /**
   * Obtener mensaje de plantilla para el proveedor
   */
  getTemplateMessage(decision: 'accept' | 'decline', reservation: ReservationView): string {
    if (decision === 'accept') {
      return (
        `Confirmo que puedo realizar el servicio de ${reservation.serviceName} ` +
        `para el ${reservation.date} a las ${reservation.time}. ` +
        `Estaré disponible y llegare puntualmente.`
      );
    } else {
      return (
        `Lamentablemente no puedo realizar este servicio en la fecha solicitada ` +
        `debido a compromisos previos. Gracias por considerarme.`
      );
    }
  }
}
