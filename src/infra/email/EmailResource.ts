import type EmailRepository from '@/domain/email/EmailRepository';
import type Email from '@/domain/email/Email';
import { EmailCaller } from './EmailCaller';
import { EmailTemplateType, type EmailResult, type ReservationEmailData } from '@/types/Email';

export class EmailResource implements EmailRepository {
  constructor(private readonly emailCaller: EmailCaller) {}

  /**
   * 📧 Enviar confirmación de reserva
   */
  async sendReservationConfirmation(data: ReservationEmailData): Promise<EmailResult> {
    console.log('📧 EmailResource.sendReservationConfirmation called:', data.reservationId);

    try {
      // Validar datos requeridos
      this.validateReservationData(data);

      // Crear entidad Email
      const email = Email.create(
        data.clientEmail,
        `Confirmación de Reserva - ${data.serviceName}`,
        EmailTemplateType.RESERVATION_CONFIRMATION,
        data.reservationId
      );

      // Llamar al EmailCaller
      const result = await this.emailCaller.sendReservationConfirmationEmail(data);

      // Actualizar estado del email
      if (result.success && result.messageId) {
        const sentEmail = email.markAsSent(result.messageId);
        // Aquí podrías guardar el email en la base de datos si fuera necesario
        console.log('✅ Email entity updated:', sentEmail.properties);
      } else {
        const failedEmail = email.markAsFailed(result.error || 'Unknown error');
        console.log('❌ Email entity marked as failed:', failedEmail.properties);
      }

      console.log('✅ Reservation confirmation email processed:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in sendReservationConfirmation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 🔍 Obtener email por ID (para futuras implementaciones)
   */
  async getEmailById(id: string): Promise<Email | null> {
    // Implementación futura: buscar en base de datos
    console.log('🔍 Getting email by ID:', id);
    return null;
  }

  /**
   * 💾 Guardar email (para futuras implementaciones)
   */
  async saveEmail(email: Email): Promise<Email> {
    // Implementación futura: guardar en base de datos
    console.log('💾 Saving email:', email.properties);
    return email;
  }

  /**
   * 🔄 Actualizar estado del email (para futuras implementaciones)
   */
  async updateEmailStatus(id: string, status: string, messageId?: string): Promise<Email> {
    // Implementación futura: actualizar en base de datos
    console.log('🔄 Updating email status:', { id, status, messageId });
    throw new Error('Not implemented');
  }

  /**
   * ✅ Validar datos de reserva
   */
  private validateReservationData(data: ReservationEmailData): void {
    const requiredFields = [
      'reservationId',
      'clientName', 
      'clientEmail',
      'serviceName',
      'serviceDate',
      'serviceTime',
      'totalPrice'
    ];

    for (const field of requiredFields) {
      if (!data[field as keyof ReservationEmailData]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.clientEmail)) {
      throw new Error(`Invalid email format: ${data.clientEmail}`);
    }

    // Validar precio
    if (typeof data.totalPrice !== 'number' || data.totalPrice < 0) {
      throw new Error(`Invalid price: ${data.totalPrice}`);
    }
  }
}