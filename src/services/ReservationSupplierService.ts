import type { ReservationView } from '@/views/ReservationView';
import type { SupplierView } from '@/views/SupplierView';
import { WhatsappService } from '@/services/whatsapp/WhatsappService';

export interface SupplierConfirmationData {
  bookingId: string;
  supplierId: string;
  decision: 'accept' | 'decline';
  message: string;
  estimatedArrival?: string;
  additionalNotes?: string;
}

export interface CalendarEventData {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  attendees: string[];
}

export class ReservationSupplierService {
  private reservationService: any;
  private supplierService: any;
  private whatsappService: WhatsappService;
  private calendarService?: any;

  constructor(
    reservationService: any,
    supplierService: any,
    whatsappService: WhatsappService,
    calendarService?: any
  ) {
    this.reservationService = reservationService;
    this.supplierService = supplierService;
    this.whatsappService = whatsappService;
    this.calendarService = calendarService;
  }

  /**
   * 🎯 MÉTODO PRINCIPAL: Procesar confirmación del proveedor
   */
  async processSupplierConfirmation(confirmationData: SupplierConfirmationData): Promise<{
    success: boolean;
    message: string;
    redirectUrl?: string;
  }> {
    try {
      console.log('📤 Processing supplier confirmation:', confirmationData);

      // Validar datos de entrada
      const validation = this.validateConfirmationData(confirmationData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Obtener datos de la reserva y proveedor
      const [reservation, supplier] = await Promise.all([
        this.reservationService.getReservationById(confirmationData.bookingId),
        this.supplierService.getSupplierById(confirmationData.supplierId)
      ]);

      if (!reservation || !supplier) {
        throw new Error('Reserva o proveedor no encontrado');
      }

      if (confirmationData.decision === 'accept') {
        // ✅ ACEPTADO: Procesar confirmación completa
        await this.processAcceptedService(confirmationData, reservation, supplier);
        return {
          success: true,
          message:
            '¡Confirmación exitosa! Se ha agregado al calendario y el cliente será notificado.',
          redirectUrl: '/supplier-dashboard'
        };
      } else {
        // ❌ RECHAZADO: Procesar rechazo y buscar alternativas
        await this.processDeclinedService(confirmationData, reservation, supplier);
        return {
          success: true,
          message: 'Respuesta enviada. Se buscará otro proveedor disponible.',
          redirectUrl: '/supplier-dashboard'
        };
      }
    } catch (error) {
      console.error('❌ Error processing supplier confirmation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al procesar la confirmación'
      };
    }
  }

  /**
   * ✅ Procesar servicio aceptado
   */
  private async processAcceptedService(
    confirmationData: SupplierConfirmationData,
    reservation: ReservationView,
    supplier: SupplierView
  ): Promise<void> {
    try {
      console.log('✅ Processing accepted service');

      // 1. Actualizar estado de la reserva
      await this.updateReservationWithSupplier(confirmationData, reservation, supplier);

      // 2. Crear eventos en calendario (si está disponible)
      if (this.calendarService) {
        await this.createCalendarEvents(confirmationData, reservation, supplier);
      }

      // 3. Notificar al cliente
      await this.notifyClientOfAcceptance(confirmationData, reservation, supplier);

      console.log('✅ Accepted service processed successfully');
    } catch (error) {
      console.error('❌ Error processing accepted service:', error);
      throw error;
    }
  }

  /**
   * ❌ Procesar servicio rechazado
   */
  private async processDeclinedService(
    confirmationData: SupplierConfirmationData,
    reservation: ReservationView,
    supplier: SupplierView
  ): Promise<void> {
    try {
      console.log('❌ Processing declined service');

      // 1. Registrar el rechazo en la reserva
      await this.recordSupplierRejection(confirmationData, reservation, supplier);

      // 2. Notificar al cliente sobre el rechazo
      await this.notifyClientOfDecline(confirmationData, reservation, supplier);

      // 3. Buscar proveedores alternativos automáticamente
      await this.initiateAlternativeSupplierSearch(reservation);

      console.log('❌ Declined service processed successfully');
    } catch (error) {
      console.error('❌ Error processing declined service:', error);
      throw error;
    }
  }

  /**
   * ⚡ MÉTODO DIRECTO: Actualizar estado de reserva
   * Este es el método que tu componente está intentando llamar
   */
  async updateReservationStatus(
    reservationId: string,
    status: 'accepted' | 'declined' | 'pending',
    supplierResponseData: {
      message: string;
      supplierId: string;
      estimatedArrival?: string;
      additionalNotes?: string;
    }
  ): Promise<any> {
    try {
      console.log('⚡ Direct update reservation status called:', {
        reservationId,
        status,
        supplierResponseData
      });

      // Convertir a formato que espera processSupplierConfirmation
      const confirmationData: SupplierConfirmationData = {
        bookingId: reservationId,
        supplierId: supplierResponseData.supplierId,
        decision: status === 'accepted' ? 'accept' : 'decline',
        message: supplierResponseData.message,
        estimatedArrival: supplierResponseData.estimatedArrival,
        additionalNotes: supplierResponseData.additionalNotes
      };

      // Usar el método principal existente
      const result = await this.processSupplierConfirmation(confirmationData);

      if (!result.success) {
        throw new Error(result.message);
      }

      return {
        success: true,
        message: result.message,
        data: {
          reservationId,
          status: status === 'accepted' ? 'supplier-confirmed' : 'seeking-supplier',
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Error in updateReservationStatus:', error);
      throw error;
    }
  }

  /**
   * 📝 Actualizar reserva con información del proveedor
   */
  private async updateReservationWithSupplier(
    confirmationData: SupplierConfirmationData,
    reservation: ReservationView,
    supplier: SupplierView
  ): Promise<void> {
    try {
      // Actualizar estado de la reserva a "proveedor confirmado"
      await this.reservationService.updateReservationStatus(
        confirmationData.bookingId,
        'supplier-confirmed'
      );

      // Agregar información del proveedor a la reserva
      const supplierInfo = {
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierPhone: supplier.phone,
        supplierEmail: supplier.email,
        supplierService: supplier.service,
        confirmationMessage: confirmationData.message,
        confirmedAt: new Date().toISOString(),
        estimatedArrival: confirmationData.estimatedArrival,
        additionalNotes: confirmationData.additionalNotes
      };

      // Actualizar la reserva con información del proveedor
      await this.reservationService.updateReservation(confirmationData.bookingId, {
        assignedSupplier: supplierInfo,
        status: 'supplier-confirmed'
      });

      console.log('📝 Reservation updated with supplier info');
    } catch (error) {
      console.error('❌ Error updating reservation:', error);
      throw error;
    }
  }

  /**
   * 📅 Crear eventos en Google Calendar
   */
  private async createCalendarEvents(
    confirmationData: SupplierConfirmationData,
    reservation: ReservationView,
    supplier: SupplierView
  ): Promise<void> {
    if (!this.calendarService) {
      console.log('⚠️ Calendar service not available, skipping calendar events');
      return;
    }

    try {
      const eventData = this.generateCalendarEventData(confirmationData, reservation, supplier);

      // Crear evento en calendario principal (admin)
      const adminEvent = await this.calendarService.createEvent({
        ...eventData,
        calendarType: 'admin',
        attendees: [reservation.clientEmail, supplier.email]
      });

      // Guardar ID del evento en la reserva
      await this.reservationService.updateReservation(reservation.bookingId, {
        calendarEventId: adminEvent.id
      });

      console.log('📅 Calendar events created successfully');
    } catch (error) {
      console.error('❌ Error creating calendar events:', error);
      // No fallar la confirmación si el calendario falla
      console.log('⚠️ Continuing without calendar events');
    }
  }

  /**
   * 📱 Notificar al cliente sobre la confirmación
   */
  private async notifyClientOfAcceptance(
    confirmationData: SupplierConfirmationData,
    reservation: ReservationView,
    supplier: SupplierView
  ): Promise<void> {
    try {
      await this.whatsappService.notifyClientConfirmation(
        {
          bookingId: reservation.bookingId,
          serviceName: reservation.serviceName,
          date: reservation.date,
          time: reservation.time,
          clientName: reservation.clientName,
          clientPhone: reservation.clientPhone,
          clientEmail: reservation.clientEmail,
          totalPrice: reservation.totalPrice,
          location: this.extractLocation(reservation),
          notes: reservation.notes
        },
        {
          id: supplier.id,
          name: supplier.name,
          phone: supplier.phone,
          email: supplier.email,
          service: supplier.service
        },
        true, // isAccepted
        confirmationData.message,
        confirmationData.estimatedArrival
      );

      console.log('📱 Client notified of acceptance');
    } catch (error) {
      console.error('❌ Error notifying client:', error);
      // No fallar la confirmación si WhatsApp falla
    }
  }

  /**
   * 📱 Notificar al cliente sobre el rechazo
   */
  private async notifyClientOfDecline(
    confirmationData: SupplierConfirmationData,
    reservation: ReservationView,
    supplier: SupplierView
  ): Promise<void> {
    try {
      await this.whatsappService.notifyClientConfirmation(
        {
          bookingId: reservation.bookingId,
          serviceName: reservation.serviceName,
          date: reservation.date,
          time: reservation.time,
          clientName: reservation.clientName,
          clientPhone: reservation.clientPhone,
          clientEmail: reservation.clientEmail,
          totalPrice: reservation.totalPrice,
          location: this.extractLocation(reservation),
          notes: reservation.notes
        },
        {
          id: supplier.id,
          name: supplier.name,
          phone: supplier.phone,
          email: supplier.email,
          service: supplier.service
        },
        false, // isAccepted
        confirmationData.message
      );

      console.log('📱 Client notified of decline');
    } catch (error) {
      console.error('❌ Error notifying client:', error);
    }
  }

  /**
   * 📝 Registrar rechazo del proveedor
   */
  private async recordSupplierRejection(
    confirmationData: SupplierConfirmationData,
    reservation: ReservationView,
    supplier: SupplierView
  ): Promise<void> {
    try {
      const rejectionInfo = {
        supplierId: supplier.id,
        supplierName: supplier.name,
        rejectionReason: confirmationData.message,
        rejectedAt: new Date().toISOString()
      };

      // Agregar el rechazo al historial de la reserva
      await this.reservationService.updateReservation(confirmationData.bookingId, {
        supplierRejections: [rejectionInfo], // En una implementación real, esto sería un array
        status: 'seeking-supplier'
      });

      console.log('📝 Supplier rejection recorded');
    } catch (error) {
      console.error('❌ Error recording rejection:', error);
      throw error;
    }
  }

  /**
   * 🔍 Buscar proveedores alternativos
   */
  private async initiateAlternativeSupplierSearch(reservation: ReservationView): Promise<void> {
    try {
      // Buscar otros proveedores compatibles
      const alternativeSuppliers = await this.supplierService.findCompatibleSuppliers(
        reservation.serviceId,
        reservation.formData?.vehicleType
      );

      if (alternativeSuppliers.length > 0) {
        console.log(`🔍 Found ${alternativeSuppliers.length} alternative suppliers`);

        // En una implementación completa, aquí podrías:
        // 1. Contactar automáticamente al siguiente proveedor
        // 2. Notificar al admin para revisión manual
        // 3. Actualizar el estado de la reserva

        // Por ahora solo actualizamos el estado
        await this.reservationService.updateReservation(reservation.bookingId, {
          alternativeSuppliersFound: alternativeSuppliers.length,
          status: 'alternative-suppliers-available'
        });
      } else {
        console.log('⚠️ No alternative suppliers found');

        await this.reservationService.updateReservation(reservation.bookingId, {
          status: 'no-suppliers-available'
        });
      }
    } catch (error) {
      console.error('❌ Error searching for alternative suppliers:', error);
    }
  }

  /**
   * 📅 Generar datos del evento de calendario
   */
  private generateCalendarEventData(
    confirmationData: SupplierConfirmationData,
    reservation: ReservationView,
    supplier: SupplierView
  ): CalendarEventData {
    const startDateTime = this.combineDateTime(reservation.date, reservation.time);
    const endDateTime = this.calculateEndDateTime(startDateTime, reservation.serviceName);

    return {
      title: `${reservation.serviceName} - ${reservation.clientName}`,
      description: this.generateEventDescription(confirmationData, reservation, supplier),
      startDateTime,
      endDateTime,
      location: this.extractLocation(reservation),
      attendees: [reservation.clientEmail, supplier.email]
    };
  }

  /**
   * 📝 Generar descripción del evento
   */
  private generateEventDescription(
    confirmationData: SupplierConfirmationData,
    reservation: ReservationView,
    supplier: SupplierView
  ): string {
    return `
Servicio: ${reservation.serviceName}
Cliente: ${reservation.clientName} (${reservation.clientPhone})
Proveedor: ${supplier.name} (${supplier.phone})
Precio: $${reservation.totalPrice}

Mensaje del proveedor: ${confirmationData.message}

${confirmationData.estimatedArrival ? `Llegada estimada: ${confirmationData.estimatedArrival}` : ''}
${reservation.notes ? `Notas adicionales: ${reservation.notes}` : ''}
    `.trim();
  }

  // Utility methods
  private validateConfirmationData(data: SupplierConfirmationData): {
    isValid: boolean;
    error?: string;
  } {
    if (!data.bookingId) return { isValid: false, error: 'ID de reserva requerido' };
    if (!data.supplierId) return { isValid: false, error: 'ID de proveedor requerido' };
    if (!['accept', 'decline'].includes(data.decision)) {
      return { isValid: false, error: 'Decisión inválida' };
    }
    if (!data.message || data.message.trim().length < 10) {
      return { isValid: false, error: 'El mensaje debe tener al menos 10 caracteres' };
    }
    return { isValid: true };
  }

  private extractLocation(reservation: ReservationView): string {
    return (
      reservation.formData?.location ||
      reservation.formData?.address ||
      reservation.formData?.deliveryAddress ||
      reservation.formData?.exactAddress ||
      'Por confirmar con el cliente'
    );
  }

  private combineDateTime(date: string, time: string): string {
    return new Date(`${date} ${time}`).toISOString();
  }

  private calculateEndDateTime(startDateTime: string, serviceName: string): string {
    const start = new Date(startDateTime);
    const defaultDuration = this.getServiceDuration(serviceName);
    return new Date(start.getTime() + defaultDuration * 60 * 60 * 1000).toISOString();
  }

  private getServiceDuration(serviceName: string): number {
    // Duraciones por defecto en horas
    const durations: Record<string, number> = {
      'transporte-aeropuerto': 2,
      'airport-transfer': 2,
      niñera: 4,
      babysitter: 4,
      decoración: 3,
      'custom-decoration': 3,
      compras: 2,
      'grocery-shopping': 2
    };
    return durations[serviceName.toLowerCase()] || 2;
  }
}
