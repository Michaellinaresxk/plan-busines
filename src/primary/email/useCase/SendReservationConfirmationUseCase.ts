// src/primary/email/useCase/SendReservationConfirmationUseCase.ts - ACTUALIZADO PARA EMAILJS
import type EmailRepository from '@/domain/email/EmailRepository';
import type { UseCase } from '@/primary/UseCase';
import type { EmailResult, ReservationEmailData } from '@/types/email';
import { ReservationView } from '@/views/ReservationView';

export class SendReservationConfirmationUseCase implements UseCase {
  constructor(private readonly emailRepository: EmailRepository) {
    console.log('📧 SendReservationConfirmationUseCase initialized with EmailJS');
  }

  async execute(
    reservation: ReservationView,
    supplierInfo?: {
      name: string;
      phone: string;
    }
  ): Promise<EmailResult> {
    try {
      console.log('📧 SendReservationConfirmationUseCase.execute called:', {
        bookingId: reservation.bookingId,
        clientName: reservation.clientName,
        clientEmail: reservation.clientEmail,
        serviceName: reservation.serviceName
      });

      // ✅ Validación básica
      this.validateReservationData(reservation);

      // ✅ Crear datos del email para EmailJS
      const emailData: ReservationEmailData = {
        reservationId: reservation.bookingId,
        clientName: reservation.clientName,
        clientEmail: reservation.clientEmail,
        serviceName: reservation.serviceName,
        serviceDate: this.extractServiceDate(reservation),
        serviceTime: this.extractServiceTime(reservation),
        totalPrice: reservation.totalPrice,
        location: this.extractLocation(reservation),
        supplierName: supplierInfo?.name,
        supplierPhone: supplierInfo?.phone,
        additionalDetails: this.extractAdditionalDetails(reservation)
      };

      console.log('📧 Email data prepared for EmailJS:', {
        reservationId: emailData.reservationId,
        clientEmail: emailData.clientEmail,
        serviceName: emailData.serviceName,
        serviceDate: emailData.serviceDate,
        serviceTime: emailData.serviceTime,
        totalPrice: emailData.totalPrice,
        hasSupplierInfo: !!(emailData.supplierName || emailData.supplierPhone),
        hasAdditionalDetails: !!emailData.additionalDetails
      });

      // ✅ Enviar email usando EmailJS
      const result = await this.emailRepository.sendReservationConfirmation(emailData);

      if (result.success) {
        console.log('✅ Reservation confirmation email sent successfully via EmailJS:', {
          reservationId: reservation.bookingId,
          messageId: result.messageId,
          clientEmail: reservation.clientEmail
        });
      } else {
        console.error('❌ Failed to send reservation confirmation email via EmailJS:', {
          reservationId: reservation.bookingId,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Error in SendReservationConfirmationUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * ✅ Validación simple de datos requeridos
   */
  private validateReservationData(reservation: ReservationView): void {
    const requiredFields = [
      { field: 'bookingId', value: reservation.bookingId },
      { field: 'clientName', value: reservation.clientName },
      { field: 'clientEmail', value: reservation.clientEmail },
      { field: 'serviceName', value: reservation.serviceName },
      { field: 'totalPrice', value: reservation.totalPrice }
    ];

    for (const { field, value } of requiredFields) {
      if (!value) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validar precio
    if (typeof reservation.totalPrice !== 'number' || reservation.totalPrice <= 0) {
      throw new Error(`Invalid totalPrice: ${reservation.totalPrice}`);
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reservation.clientEmail)) {
      throw new Error(`Invalid email format: ${reservation.clientEmail}`);
    }

    console.log('✅ Reservation data validation passed');
  }

  /**
   * 📅 Extraer fecha del servicio con fallbacks
   */
  private extractServiceDate(reservation: ReservationView): string {
    // Prioridad: serviceDate > formData.date > bookingDate formateado
    if (reservation.serviceDate) {
      return reservation.serviceDate;
    }

    if (reservation.formData?.date) {
      return reservation.formData.date;
    }

    // Formatear bookingDate como fallback
    return reservation.bookingDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * 🕐 Extraer hora del servicio con fallbacks
   */
  private extractServiceTime(reservation: ReservationView): string {
    // Prioridad: serviceTime > varios campos de formData
    if (reservation.serviceTime) {
      return reservation.serviceTime;
    }

    const { formData } = reservation;
    if (!formData) return 'Por confirmar';

    return (
      formData.time ||
      formData.startTime ||
      formData.hour ||
      (formData.startTime && formData.endTime
        ? `${formData.startTime} - ${formData.endTime}`
        : 'Por confirmar')
    );
  }

  /**
   * 📍 Extraer ubicación con fallbacks
   */
  private extractLocation(reservation: ReservationView): string {
    const { formData } = reservation;
    if (!formData) return 'Por confirmar con el cliente';

    return (
      formData.location ||
      formData.exactAddress ||
      formData.deliveryAddress ||
      formData.pickupAddress ||
      'Por confirmar con el cliente'
    );
  }

  /**
   * ℹ️ Extraer detalles adicionales para el template de EmailJS
   */
  private extractAdditionalDetails(reservation: ReservationView): Record<string, any> {
    const details: Record<string, any> = {};

    // ✅ Incluir formData completo para el template HTML personalizado
    details.formData = reservation.formData || {};

    // ✅ Agregar información básica
    details.bookingDate = reservation.bookingDate.toISOString();
    details.status = reservation.status;
    details.notes = reservation.notes;

    // ✅ Detalles específicos por tipo de servicio para el HTML template
    switch (reservation.serviceId) {
      case 'airport-transfer':
        this.extractAirportTransferDetails(details, reservation.formData);
        break;

      case 'babysitter':
        this.extractBabysitterDetails(details, reservation.formData);
        break;

      case 'custom-decoration':
        this.extractDecorationDetails(details, reservation.formData);
        break;

      case 'grocery-shopping':
        this.extractGroceryDetails(details, reservation.formData);
        break;

      default:
        console.log('📋 Generic service - using basic formData only');
    }

    console.log('📋 Extracted additional details for EmailJS:', {
      serviceId: reservation.serviceId,
      hasFormData: !!details.formData,
      formDataKeys: Object.keys(details.formData || {}),
      serviceSpecificFields: Object.keys(details).filter(
        key => !['formData', 'bookingDate', 'status', 'notes'].includes(key)
      )
    });

    return details;
  }

  /**
   * ✈️ Detalles específicos de transporte aeropuerto
   */
  private extractAirportTransferDetails(
    details: Record<string, any>,
    formData?: Record<string, any>
  ): void {
    if (!formData) return;

    const airportFields = [
      'flightNumber',
      'vehicleType',
      'passengerCount',
      'needsCarSeat',
      'carSeatCount',
      'isRoundTrip',
      'pickupAddress',
      'dropoffAddress',
      'flightTime'
    ];

    airportFields.forEach(field => {
      if (formData[field] !== undefined) {
        details[field] = formData[field];
      }
    });
  }

  /**
   * 👶 Detalles específicos de niñera
   */
  private extractBabysitterDetails(
    details: Record<string, any>,
    formData?: Record<string, any>
  ): void {
    if (!formData) return;

    const babysitterFields = [
      'childrenCount',
      'childrenAges',
      'startTime',
      'endTime',
      'specialNeedsDetails',
      'hasSpecialNeeds',
      'parentInstructions'
    ];

    babysitterFields.forEach(field => {
      if (formData[field] !== undefined) {
        details[field] = formData[field];
      }
    });
  }

  /**
   * 🎨 Detalles específicos de decoración
   */
  private extractDecorationDetails(
    details: Record<string, any>,
    formData?: Record<string, any>
  ): void {
    if (!formData) return;

    const decorationFields = [
      'occasion',
      'colors',
      'referenceImage',
      'exactAddress',
      'decorationType',
      'budget',
      'specialRequirements'
    ];

    decorationFields.forEach(field => {
      if (formData[field] !== undefined) {
        details[field] = formData[field];
      }
    });
  }

  /**
   * 🛒 Detalles específicos de compras
   */
  private extractGroceryDetails(
    details: Record<string, any>,
    formData?: Record<string, any>
  ): void {
    if (!formData) return;

    const groceryFields = [
      'deliveryAddress',
      'items',
      'hasAllergies',
      'allergyDetails',
      'foodRestrictions',
      'preferredBrands',
      'budget'
    ];

    groceryFields.forEach(field => {
      if (formData[field] !== undefined) {
        details[field] = formData[field];
      }
    });
  }
}
