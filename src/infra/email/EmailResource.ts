// src/infra/email/EmailResource.ts - ACTUALIZADO SOLO PARA EMAILJS
import type EmailRepository from '@/domain/email/EmailRepository';
import type Email from '@/domain/email/Email';
import { EmailJSCaller } from './EmailCaller';
import { type EmailResult, type ReservationEmailData } from '@/types/email';

export class EmailResource implements EmailRepository {
  private readonly emailCaller: EmailJSCaller;

  constructor() {
    console.log('📧 EmailResource: Initializing with EmailJS only');
    this.emailCaller = new EmailJSCaller();
  }

  /**
   * 📧 Enviar confirmación de reserva usando EmailJS
   */
  async sendReservationConfirmation(data: ReservationEmailData): Promise<EmailResult> {
    console.log('📧 EmailResource.sendReservationConfirmation called:', {
      reservationId: data.reservationId,
      clientEmail: data.clientEmail,
      serviceName: data.serviceName
    });

    try {
      // ✅ Validar datos requeridos
      this.validateReservationData(data);

      console.log('✅ Validation passed, calling EmailJS...');

      // ✅ Llamar directamente a EmailJS
      const result = await this.emailCaller.sendReservationConfirmationEmail(data);

      console.log('📧 EmailJS result:', result);

      // ✅ Log del resultado
      if (result.success) {
        console.log('✅ Email sent successfully via EmailJS:', {
          reservationId: data.reservationId,
          clientEmail: data.clientEmail,
          messageId: result.messageId,
          service: 'EmailJS'
        });
      } else {
        console.error('❌ Email failed via EmailJS:', {
          reservationId: data.reservationId,
          clientEmail: data.clientEmail,
          error: result.error,
          service: 'EmailJS'
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
   * 🔍 Obtener información del servicio de email
   */
  getServiceInfo(): Record<string, any> {
    return {
      serviceName: 'EmailResource with EmailJS',
      caller: this.emailCaller.getServiceInfo(),
      environment: {
        isDevelopment: import.meta.env.DEV,
        emailjsConfig: {
          hasServiceId: !!import.meta.env.VITE_EMAILJS_SERVICE_ID,
          hasTemplateId: !!import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          hasPublicKey: !!import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        }
      }
    };
  }

  /**
   * ✅ Validar configuración completa
   */
  async validateConfiguration(): Promise<boolean> {
    try {
      console.log('🔍 Validating EmailJS configuration...');

      // ✅ Verificar EmailJS Caller
      const callerValid = await this.emailCaller.validateConfiguration();

      // ✅ Verificar variables de entorno específicas de EmailJS
      const hasEmailJSConfig = !!(
        import.meta.env.VITE_EMAILJS_SERVICE_ID &&
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY &&
        import.meta.env.VITE_FROM_EMAIL
      );

      const isValid = callerValid && hasEmailJSConfig;

      console.log('🔍 EmailJS configuration status:', {
        emailjsCaller: callerValid ? '✅' : '❌',
        emailjsConfig: hasEmailJSConfig ? '✅' : '❌',
        overall: isValid ? '✅' : '❌'
      });

      return isValid;
    } catch (error) {
      console.error('❌ Error validating EmailJS configuration:', error);
      return false;
    }
  }

  /**
   * ✅ Test de conectividad
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing EmailJS connection...');

      const configValid = await this.validateConfiguration();
      if (!configValid) {
        console.error('❌ EmailJS configuration invalid');
        return false;
      }

      const connectionTest = await this.emailCaller.testConnection();

      console.log('🧪 EmailJS connection test result:', connectionTest);
      return connectionTest;
    } catch (error) {
      console.error('❌ EmailJS connection test failed:', error);
      return false;
    }
  }

  // ✅ Métodos requeridos por la interface (implementación simple)
  async getEmailById(id: string): Promise<Email | null> {
    console.log('🔍 Getting email by ID (not implemented in EmailJS):', id);
    // EmailJS no guarda emails - solo los envía
    return null;
  }

  async saveEmail(email: Email): Promise<Email> {
    console.log('💾 Saving email (not needed with EmailJS):', email.id);
    // EmailJS no necesita guardar emails
    return email;
  }

  async updateEmailStatus(id: string, status: string, messageId?: string): Promise<Email> {
    console.log('🔄 Updating email status (not needed with EmailJS):', { id, status, messageId });
    // EmailJS no maneja estados de email después del envío
    throw new Error('Email status tracking not implemented with EmailJS');
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
