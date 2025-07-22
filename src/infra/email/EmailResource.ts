// src/infra/email/EmailResource.ts - FIXED VERSION
import type EmailRepository from '@/domain/email/EmailRepository';
import type Email from '@/domain/email/Email';
import { EmailCaller } from './EmailCaller';
import { type EmailResult, type ReservationEmailData } from '@/types/email';

export class EmailResource implements EmailRepository {
  constructor(private readonly emailCaller: EmailCaller) {}

  /**
   * 📧 Enviar confirmación de reserva - VERSIÓN SIMPLIFICADA
   */
  async sendReservationConfirmation(data: ReservationEmailData): Promise<EmailResult> {
    console.log('📧 EmailResource.sendReservationConfirmation called:', data.reservationId);

    try {
      // ✅ Validar datos requeridos
      this.validateReservationData(data);

      console.log('✅ Validation passed, calling EmailCaller...');

      // ✅ Llamar directamente al EmailCaller (sin crear entidad Email por ahora)
      const result = await this.emailCaller.sendReservationConfirmationEmail(data);

      console.log('✅ EmailCaller result:', result);

      // ✅ Log del resultado
      if (result.success) {
        console.log('✅ Email sent successfully:', {
          reservationId: data.reservationId,
          clientEmail: data.clientEmail,
          messageId: result.messageId
        });
      } else {
        console.error('❌ Email failed:', {
          reservationId: data.reservationId,
          clientEmail: data.clientEmail,
          error: result.error
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Error in EmailResource.sendReservationConfirmation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 🔍 Obtener email por ID (implementación futura)
   */
  async getEmailById(id: string): Promise<Email | null> {
    console.log('🔍 Getting email by ID:', id);
    // TODO: Implementar cuando sea necesario
    return null;
  }

  /**
   * 💾 Guardar email (implementación futura)
   */
  async saveEmail(email: Email): Promise<Email> {
    console.log('💾 Saving email:', email);
    // TODO: Implementar cuando sea necesario
    return email;
  }

  /**
   * 🔄 Actualizar estado del email (implementación futura)
   */
  async updateEmailStatus(id: string, status: string, messageId?: string): Promise<Email> {
    console.log('🔄 Updating email status:', { id, status, messageId });
    // TODO: Implementar cuando sea necesario
    throw new Error('Not implemented yet');
  }

  /**
   * ✅ Validar datos de reserva
   */
  private validateReservationData(data: ReservationEmailData): void {
    console.log('🔍 Validating reservation data:', {
      reservationId: data.reservationId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      serviceName: data.serviceName,
      totalPrice: data.totalPrice
    });

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

    console.log('✅ Validation completed successfully');
  }
}
