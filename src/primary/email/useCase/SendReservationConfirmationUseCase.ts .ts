import type EmailRepository from '@/domain/email/EmailRepository';
import type { UseCase } from '@/primary/UseCase';
import type { EmailResult, ReservationEmailData } from '@/types/Email';
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
      console.log('📧 SendReservationConfirmationUseCase.execute called:', reservation.bookingId);

      // ✅ Validación de datos requeridos
      this.validateReservationData(reservation);

      // ✅ Construir emailData usando las propiedades correctas de ReservationView
      const emailData: ReservationEmailData = {
        reservationId: reservation.bookingId,
        clientName: reservation.clientName,
        clientEmail: reservation.clientEmail,
        serviceName: reservation.serviceName,
        serviceDate: this.getServiceDate(reservation),
        serviceTime: this.getServiceTime(reservation),
        totalPrice: reservation.totalPrice,
        location: this.extractLocation(reservation),
        supplierName: supplierInfo?.name,
        supplierPhone: supplierInfo?.phone,
        additionalDetails: this.extractAdditionalDetails(reservation)
      };

      console.log('📧 Email data prepared:', emailData);

      const result = await this.emailRepository.sendReservationConfirmation(emailData);

      if (result.success) {
        console.log('✅ Reservation confirmation email sent successfully:', result.messageId);
      } else {
        console.error('❌ Failed to send reservation confirmation email:', result.error);
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

  // ✅ Validación actualizada para ReservationView
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
    if (reservation.totalPrice <= 0) {
      throw new Error(`Invalid totalPrice: ${reservation.totalPrice}`);
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reservation.clientEmail)) {
      throw new Error(`Invalid email format: ${reservation.clientEmail}`);
    }
  }

  // ✅ Extraer fecha del servicio
  private getServiceDate(reservation: ReservationView): string {
    // Prioridad: serviceDate > extraer de formData > usar bookingDate
    if (reservation.serviceDate) {
      return reservation.serviceDate;
    }

    if (reservation.formData?.date) {
      return reservation.formData.date;
    }

    // Formatear bookingDate como fallback
    return reservation.bookingDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // ✅ Extraer hora del servicio
  private getServiceTime(reservation: ReservationView): string {
    // Prioridad: serviceTime > extraer de formData
    if (reservation.serviceTime) {
      return reservation.serviceTime;
    }

    const { formData } = reservation;
    return (
      formData?.time ||
      formData?.startTime ||
      formData?.hour ||
      (formData?.startTime && formData?.endTime 
        ? `${formData.startTime} - ${formData.endTime}` 
        : 'Por confirmar')
    );
  }

  // ✅ Extraer ubicación
  private extractLocation(reservation: ReservationView): string {
    const { formData } = reservation;
    return (
      formData?.location ||
      formData?.exactAddress ||
      formData?.deliveryAddress ||
      formData?.pickupLocation ||
      'Por confirmar con el cliente'
    );
  }

  // ✅ Extraer detalles adicionales por tipo de servicio
  private extractAdditionalDetails(reservation: ReservationView): Record<string, any> {
    const details: Record<string, any> = {};
    const { formData } = reservation;

    // Detalles específicos por tipo de servicio
    switch (reservation.serviceId) {
      case 'airport-transfer':
        details.flightNumber = formData?.flightNumber;
        details.vehicleType = formData?.vehicleType;
        details.passengerCount = formData?.passengerCount;
        details.hasCarSeat = formData?.needsCarSeat || formData?.hasCarSeat;
        details.isRoundTrip = formData?.isRoundTrip;
        break;

      case 'babysitter':
        details.childrenCount = formData?.childrenCount;
        details.childrenAges = Array.isArray(formData?.childrenAges) 
          ? formData.childrenAges.join(', ') 
          : formData?.childrenAges;
        details.startTime = formData?.startTime;
        details.endTime = formData?.endTime;
        details.specialNeeds = formData?.specialNeedsDetails;
        break;

      case 'custom-decoration':
        details.occasion = formData?.occasion;
        details.colors = Array.isArray(formData?.colors) 
          ? formData.colors.join(', ') 
          : formData?.colors;
        details.referenceImage = formData?.referenceImage;
        break;

      case 'grocery-shopping':
        details.deliveryAddress = formData?.deliveryAddress;
        details.itemsCount = Array.isArray(formData?.items) ? formData.items.length : 0;
        details.hasAllergies = formData?.hasAllergies;
        details.allergyDetails = formData?.allergyDetails;
        details.foodRestrictions = formData?.foodRestrictions;
        break;
    }

    // Agregar datos generales
    details.notes = reservation.notes;
    details.formData = formData;

    return details;
  }
}