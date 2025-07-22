// src/primary/email/useCase/index.ts - FIXED VERSION
import { EmailResource } from '@/infra/email/EmailResource';
import { ReservationView } from '@/views/ReservationView';
import { SendReservationConfirmationUseCase } from './SendReservationConfirmationUseCase.ts';
import type { EmailResult } from '@/types/email';

export class EmailService {
  // Use Cases
  private sendReservationConfirmationUseCase: SendReservationConfirmationUseCase;

  constructor(private readonly emailResource: EmailResource) {
    console.log('📧 EmailService constructor called');

    // Inicializar use case
    this.sendReservationConfirmationUseCase = new SendReservationConfirmationUseCase(emailResource);

    console.log('✅ EmailService initialized successfully');
  }

  /**
   * 📧 Enviar confirmación de reserva
   */
  async sendReservationConfirmation(
    reservation: ReservationView,
    supplierInfo?: { name: string; phone: string }
  ): Promise<EmailResult> {
    console.log('📧 EmailService.sendReservationConfirmation called:', {
      bookingId: reservation.bookingId,
      clientName: reservation.clientName,
      clientEmail: reservation.clientEmail,
      serviceName: reservation.serviceName
    });

    try {
      const result = await this.sendReservationConfirmationUseCase.execute(reservation, supplierInfo);

      console.log('📧 EmailService result:', result);

      return result;
    } catch (error) {
      console.error('❌ Error in EmailService.sendReservationConfirmation:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * ✅ Validar configuración del servicio
   */
  async validateConfiguration(): Promise<boolean> {
    try {
      console.log('🔍 Validating EmailService configuration...');

      // Verificar que el emailResource esté disponible
      if (!this.emailResource) {
        console.error('❌ EmailResource not available');
        return false;
      }

      // Verificar variables de entorno
      const hasApiKey = !!import.meta.env.VITE_SENDGRID_API_KEY;
      const hasFromEmail = !!import.meta.env.VITE_FROM_EMAIL;

      console.log('🔍 Configuration check:', {
        hasApiKey,
        hasFromEmail,
        emailResource: !!this.emailResource
      });

      const isValid = hasApiKey && hasFromEmail && !!this.emailResource;

      if (isValid) {
        console.log('✅ EmailService configuration is valid');
      } else {
        console.warn('⚠️ EmailService configuration has issues');
      }

      return isValid;
    } catch (error) {
      console.error('❌ Error validating email service configuration:', error);
      return false;
    }
  }

  /**
   * 🔍 Get service info for debugging
   */
  getServiceInfo(): Record<string, any> {
    return {
      hasEmailResource: !!this.emailResource,
      hasUseCase: !!this.sendReservationConfirmationUseCase,
      environment: {
        hasApiKey: !!import.meta.env.VITE_SENDGRID_API_KEY,
        hasFromEmail: !!import.meta.env.VITE_FROM_EMAIL,
        fromEmail: import.meta.env.VITE_FROM_EMAIL || 'Not set',
        fromName: import.meta.env.VITE_FROM_NAME || 'Not set'
      }
    };
  }
}
