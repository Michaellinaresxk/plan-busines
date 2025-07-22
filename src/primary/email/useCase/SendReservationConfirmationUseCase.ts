// src/primary/email/useCase/SendReservationConfirmationUseCase.ts - FIXED VERSION
import type EmailRepository from '@/domain/email/EmailRepository';
import type { UseCase } from '@/primary/UseCase';
import type { EmailResult, ReservationEmailData } from '@/types/email';
import { ReservationView } from '@/views/ReservationView';

export class SendReservationConfirmationUseCase implements UseCase {
  constructor(private readonly emailRepository: EmailRepository) {}

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

      // ✅ Crear datos del email con información completa
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

      console.log('📧 Email data prepared:', emailData);

      // ✅ Enviar email
      const result = await this.emailRepository.sendReservationConfirmation(emailData);

      if (result.success) {
        console.log('✅ Reservation confirmation email sent successfully:', {
          reservationId: reservation.bookingId,
          messageId: result.messageId
        });
      } else {
        console.error('❌ Failed to send reservation confirmation email:', {
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
    if (!reservation.bookingId) {
      throw new Error('Missing required field: bookingId');
    }
    if (!reservation.clientName) {
      throw new Error('Missing required field: clientName');
    }
    if (!reservation.clientEmail) {
      throw new Error('Missing required field: clientEmail');
    }
    if (!reservation.serviceName) {
      throw new Error('Missing required field: serviceName');
    }
    if (!reservation.totalPrice || reservation.totalPrice <= 0) {
      throw new Error('Invalid totalPrice');
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reservation.clientEmail)) {
      throw new Error(`Invalid email format: ${reservation.clientEmail}`);
    }
  }

  /**
   * 📅 Extraer fecha del servicio
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
   * 🕐 Extraer hora del servicio
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
   * 📍 Extraer ubicación
   */
  private extractLocation(reservation: ReservationView): string {
    const { formData } = reservation;
    if (!formData) return 'Por confirmar con el cliente';

    return (
      formData.location ||
      formData.exactAddress ||
      formData.deliveryAddress ||
      'Por confirmar con el cliente'
    );
  }

  /**
   * ℹ️ Extraer detalles adicionales específicos del servicio
   */
  private extractAdditionalDetails(reservation: ReservationView): Record<string, any> {
    const details: Record<string, any> = {};

    // ✅ Incluir formData completo para el template del email
    details.formData = reservation.formData || {};

    // ✅ Agregar información básica
    details.bookingDate = reservation.bookingDate.toISOString();
    details.status = reservation.status;
    details.notes = reservation.notes;

    // ✅ Detalles específicos por tipo de servicio
    switch (reservation.serviceId) {
      case 'airport-transfer':
        if (reservation.formData) {
          details.flightNumber = reservation.formData.flightNumber;
          details.vehicleType = reservation.formData.vehicleType;
          details.passengerCount = reservation.formData.passengerCount;
          details.needsCarSeat = reservation.formData.needsCarSeat;
          details.carSeatCount = reservation.formData.carSeatCount;
          details.isRoundTrip = reservation.formData.isRoundTrip;
        }
        break;

      case 'babysitter':
        if (reservation.formData) {
          details.childrenCount = reservation.formData.childrenCount;
          details.childrenAges = reservation.formData.childrenAges;
          details.startTime = reservation.formData.startTime;
          details.endTime = reservation.formData.endTime;
          details.specialNeedsDetails = reservation.formData.specialNeedsDetails;
        }
        break;

      case 'custom-decoration':
        if (reservation.formData) {
          details.occasion = reservation.formData.occasion;
          details.colors = reservation.formData.colors;
          details.referenceImage = reservation.formData.referenceImage;
          details.exactAddress = reservation.formData.exactAddress;
        }
        break;

      case 'grocery-shopping':
        if (reservation.formData) {
          details.deliveryAddress = reservation.formData.deliveryAddress;
          details.items = reservation.formData.items;
          details.hasAllergies = reservation.formData.hasAllergies;
          details.allergyDetails = reservation.formData.allergyDetails;
          details.foodRestrictions = reservation.formData.foodRestrictions;
        }
        break;
    }

    console.log('📋 Extracted additional details:', details);

    return details;
  }
}
