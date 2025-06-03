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

export interface CalendarEventData {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  attendees: string[];
}

export class SupplierConfirmationService {
  private baseUrl: string;
  private reservationService: any; // Tu servicio de reservas existente
  private whatsappService: any; // Tu servicio de WhatsApp existente
  private calendarService: any; // Tu servicio de Google Calendar

  constructor(
    reservationService: any,
    whatsappService: any,
    calendarService: any,
    baseUrl?: string
  ) {
    this.baseUrl = baseUrl || '/api/supplier-confirmations';
    this.reservationService = reservationService;
    this.whatsappService = whatsappService;
    this.calendarService = calendarService;
  }

  /**
   * Cargar datos de la página de confirmación usando tus servicios existentes
   */
  async loadConfirmationData(bookingId: string, supplierId: string): Promise<ConfirmationPageData> {
    try {
      console.log('🔍 Loading confirmation data:', { bookingId, supplierId });

      // Usar tu servicio de reservas existente
      const reservation = await this.reservationService.getReservationById(bookingId);
      if (!reservation) {
        throw new Error('Reserva no encontrada');
      }

      // Usar tu servicio de proveedores existente
      const supplier = await this.supplierService.getSupplierById(supplierId);
      if (!supplier) {
        throw new Error('Proveedor no encontrado');
      }

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
      throw error;
    }
  }

  /**
   * Enviar confirmación del proveedor con integración completa
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

      // Obtener datos de la reserva y proveedor
      const { reservation, supplier } = await this.loadConfirmationData(
        confirmationData.bookingId,
        confirmationData.supplierId
      );

      if (confirmationData.decision === 'accept') {
        // ✅ ACEPTADO: Procesar confirmación completa
        await this.processServiceAcceptance(confirmationData, reservation, supplier);
      } else {
        // ❌ RECHAZADO: Actualizar estado y notificar
        await this.processServiceRejection(confirmationData, reservation, supplier);
      }

      const isAccepted = confirmationData.decision === 'accept';
      return {
        success: true,
        message: isAccepted
          ? '¡Confirmación exitosa! Se ha agregado al calendario y el cliente será notificado.'
          : 'Respuesta enviada. Se buscará otro proveedor disponible.',
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
   * Procesar aceptación del servicio
   */
  private async processServiceAcceptance(
    confirmationData: SupplierConfirmationData,
    reservation: ReservationView,
    supplier: SupplierView
  ): Promise<void> {
    try {
      // 1. Actualizar estado de la reserva a "proveedor asignado"
      await this.reservationService.updateReservationStatus(
        confirmationData.bookingId,
        'supplier-assigned'
      );

      // 2. Agregar información del proveedor a la reserva
      await this.reservationService.assignSupplierToReservation(confirmationData.bookingId, {
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierPhone: supplier.phone,
        supplierEmail: supplier.email,
        confirmationMessage: confirmationData.message,
        confirmedAt: new Date().toISOString(),
        estimatedArrival: confirmationData.estimatedArrival
      });

      // 3. Crear eventos en Google Calendar
      await this.createCalendarEvents(reservation, supplier, confirmationData);

      // 4. Notificar al cliente usando tu servicio de WhatsApp
      await this.notifyClientOfAcceptance(reservation, supplier, confirmationData);

      console.log('✅ Service acceptance processed successfully');
    } catch (error) {
      console.error('❌ Error processing service acceptance:', error);
      throw error;
    }
  }

  /**
   * Procesar rechazo del servicio
   */
  private async processServiceRejection(
    confirmationData: SupplierConfirmationData,
    reservation: ReservationView,
    supplier: SupplierView
  ): Promise<void> {
    try {
      // 1. Registrar el rechazo en la reserva
      await this.reservationService.recordSupplierRejection(confirmationData.bookingId, {
        supplierId: supplier.id,
        supplierName: supplier.name,
        rejectionReason: confirmationData.message,
        rejectedAt: new Date().toISOString()
      });

      // 2. Buscar otros proveedores automáticamente
      await this.initiateAlternativeSupplierSearch(reservation);

      console.log('✅ Service rejection processed successfully');
    } catch (error) {
      console.error('❌ Error processing service rejection:', error);
      throw error;
    }
  }

  /**
   * Crear eventos en Google Calendar para ambas partes
   */
  private async createCalendarEvents(
    reservation: ReservationView,
    supplier: SupplierView,
    confirmationData: SupplierConfirmationData
  ): Promise<void> {
    try {
      const eventData = this.generateCalendarEventData(reservation, supplier, confirmationData);

      // Crear evento en calendario del cliente
      const clientEvent = await this.calendarService.createEvent({
        ...eventData,
        calendarType: 'client',
        attendees: [reservation.clientEmail, supplier.email]
      });

      // Crear evento en tu calendario (admin)
      const adminEvent = await this.calendarService.createEvent({
        ...eventData,
        calendarType: 'admin',
        attendees: [reservation.clientEmail, supplier.email]
      });

      // Crear evento en calendario del proveedor (opcional)
      if (supplier.email) {
        const supplierEvent = await this.calendarService.createEvent({
          ...eventData,
          calendarType: 'supplier',
          attendees: [reservation.clientEmail]
        });
      }

      // Guardar IDs de eventos en la reserva
      await this.reservationService.updateReservation(reservation.bookingId, {
        calendarEvents: {
          clientEventId: clientEvent.id,
          adminEventId: adminEvent.id,
          supplierEventId: supplierEvent?.id
        }
      });

      console.log('✅ Calendar events created successfully');
    } catch (error) {
      console.error('❌ Error creating calendar events:', error);
      // No fallar la confirmación si el calendario falla
      console.log('⚠️ Continuing without calendar events');
    }
  }

  /**
   * Generar datos del evento de calendario
   */
  private generateCalendarEventData(
    reservation: ReservationView,
    supplier: SupplierView,
    confirmationData: SupplierConfirmationData
  ): CalendarEventData {
    const startDateTime = this.combineDateTime(reservation.date, reservation.time);
    const endDateTime = this.calculateEndDateTime(startDateTime, reservation.serviceName);

    return {
      title: `${reservation.serviceName} - ${reservation.clientName}`,
      description: this.generateEventDescription(reservation, supplier, confirmationData),
      startDateTime,
      endDateTime,
      location: this.extractLocation(reservation),
      attendees: [reservation.clientEmail, supplier.email]
    };
  }

  /**
   * Notificar al cliente usando tu servicio de WhatsApp
   */
  private async notifyClientOfAcceptance(
    reservation: ReservationView,
    supplier: SupplierView,
    confirmationData: SupplierConfirmationData
  ): Promise<void> {
    try {
      const message = this.generateClientNotificationMessage(
        reservation,
        supplier,
        confirmationData
      );

      // Usar tu servicio de WhatsApp existente
      await this.whatsappService.sendMessage(reservation.clientPhone, message, {
        type: 'service_confirmation',
        reservationId: reservation.bookingId,
        supplierId: supplier.id
      });

      console.log('✅ Client notification sent via WhatsApp');
    } catch (error) {
      console.error('❌ Error sending client notification:', error);
      // No fallar la confirmación si WhatsApp falla
    }
  }

  /**
   * Generar mensaje de notificación al cliente
   */
  private generateClientNotificationMessage(
    reservation: ReservationView,
    supplier: SupplierView,
    confirmationData: SupplierConfirmationData
  ): string {
    return `
🎉 *¡Tu servicio ha sido confirmado!*

Hola *${reservation.clientName}*,

Tenemos excelentes noticias. Tu solicitud de *${reservation.serviceName}* ha sido confirmada:

👤 *Proveedor:* ${supplier.name}
📞 *Teléfono:* ${supplier.phone}
📧 *Email:* ${supplier.email}
📅 *Fecha:* ${reservation.date}
🕒 *Hora:* ${reservation.time}
💰 *Total:* $${reservation.totalPrice}

💬 *Mensaje del proveedor:*
"${confirmationData.message}"

${confirmationData.estimatedArrival ? `⏰ *Llegada estimada:* ${confirmationData.estimatedArrival}` : ''}

📅 *Se ha agregado a tu calendario automáticamente*

Si tienes alguna pregunta, puedes contactar directamente al proveedor o respondernos aquí.

¡Gracias por confiar en nosotros! ✨

_Plan-Business_
    `.trim();
  }

  /**
   * Buscar proveedores alternativos automáticamente
   */
  private async initiateAlternativeSupplierSearch(reservation: ReservationView): Promise<void> {
    try {
      // Buscar otros proveedores compatibles
      const alternativeSuppliers = await this.supplierService.findCompatibleSuppliers(
        reservation.serviceId,
        reservation.formData?.vehicleType
      );

      if (alternativeSuppliers.length > 0) {
        // Contactar al siguiente proveedor en la lista
        const nextSupplier = alternativeSuppliers[0];
        await this.contactSupplierForService(nextSupplier, reservation);
      } else {
        // Notificar que no hay más proveedores disponibles
        await this.notifyNoSuppliersAvailable(reservation);
      }
    } catch (error) {
      console.error('❌ Error initiating alternative supplier search:', error);
    }
  }

  /**
   * Contactar proveedor para servicio usando tu WhatsApp service
   */
  private async contactSupplierForService(
    supplier: SupplierView,
    reservation: ReservationView
  ): Promise<void> {
    const confirmationUrl = this.generateConfirmationUrl(reservation.bookingId, supplier.id);
    const message = this.generateSupplierRequestMessage(supplier, reservation, confirmationUrl);

    await this.whatsappService.sendMessage(supplier.phone, message, {
      type: 'service_request',
      reservationId: reservation.bookingId,
      supplierId: supplier.id
    });
  }

  // Utility methods
  private validateServiceMatch(reservation: ReservationView, supplier: SupplierView): boolean {
    return (
      supplier.service === reservation.serviceId ||
      supplier.service === reservation.serviceName?.toLowerCase().replace(/\s+/g, '-')
    );
  }

  private validateConfirmationData(data: SupplierConfirmationData): {
    isValid: boolean;
    error?: string;
  } {
    if (!data.bookingId) return { isValid: false, error: 'ID de reserva requerido' };
    if (!data.supplierId) return { isValid: false, error: 'ID de proveedor requerido' };
    if (!['accept', 'decline'].includes(data.decision))
      return { isValid: false, error: 'Decisión inválida' };
    if (!data.message || data.message.trim().length < 10) {
      return { isValid: false, error: 'El mensaje debe tener al menos 10 caracteres' };
    }
    return { isValid: true };
  }

  private generateConfirmationUrl(bookingId: string, supplierId: string): string {
    const params = new URLSearchParams({
      booking: bookingId,
      supplier: supplierId,
      action: 'confirm'
    });
    return `${window.location.origin}/supplier-confirmation?${params.toString()}`;
  }

  private generateRedirectUrl(data: SupplierConfirmationData): string {
    return `/supplier-dashboard?confirmation=${data.bookingId}`;
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
      compras: 2
    };
    return durations[serviceName.toLowerCase()] || 2;
  }

  private extractLocation(reservation: ReservationView): string {
    return (
      reservation.formData?.location ||
      reservation.formData?.address ||
      reservation.formData?.deliveryAddress ||
      'Por confirmar con el cliente'
    );
  }

  private generateEventDescription(
    reservation: ReservationView,
    supplier: SupplierView,
    confirmationData: SupplierConfirmationData
  ): string {
    return `
Servicio: ${reservation.serviceName}
Cliente: ${reservation.clientName}
Proveedor: ${supplier.name} (${supplier.phone})
Precio: $${reservation.totalPrice}

Mensaje del proveedor: ${confirmationData.message}

${reservation.notes ? `Notas: ${reservation.notes}` : ''}
    `.trim();
  }
}
