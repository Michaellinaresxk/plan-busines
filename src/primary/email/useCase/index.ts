import { EmailResource } from '@/infra/email/EmailResource';
import  { ReservationView } from '@/views/ReservationView';
import  { SendReservationConfirmationUseCase } from './SendReservationConfirmationUseCase.ts ';
import type { EmailResult } from '@/types/Email';

export class EmailService {
  // Use Cases
  private sendReservationConfirmationUseCase: SendReservationConfirmationUseCase;

  constructor(private readonly emailResource: EmailResource) {
    // Inicializar use case
    this.sendReservationConfirmationUseCase = new SendReservationConfirmationUseCase(emailResource);
  }

  /**
   * 📧 Enviar confirmación de reserva
   */
  async sendReservationConfirmation(
    reservation: ReservationView,
    supplierInfo?: { name: string; phone: string }
  ): Promise<EmailResult> {
    console.log('📧 EmailService.sendReservationConfirmation called:', reservation.bookingId);
    return await this.sendReservationConfirmationUseCase.execute(reservation, supplierInfo);
  }

  /**
   * ✅ Validar configuración del servicio
   */
  async validateConfiguration(): Promise<boolean> {
    try {
      // Aquí podrías validar la configuración de SendGrid
      return true;
    } catch (error) {
      console.error('❌ Error validating email service configuration:', error);
      return false;
    }
  }
}