// src/services/EnhancedPaymentService.ts - Servicio completo de pagos
import { inject } from 'vue';
import type { ReservationView } from '@/views/ReservationView';
import type { EmailService } from './EmailService';
import type { PaymentService } from './PaymentService';

export interface PaymentLinkOptions {
  reservationId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  description: string;
  expirationHours?: number;
  customMessage?: string;
  sendWhatsApp?: boolean;
  manualLink?: string;
}

export interface PaymentLinkResult {
  success: boolean;
  paymentUrl?: string;
  emailMessageId?: string;
  whatsappMessageId?: string;
  error?: string;
}

export class EnhancedPaymentService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly emailService: EmailService
  ) {}

  /**
   * 🚀 MÉTODO PRINCIPAL: Crear y enviar payment link completo
   */
  async createAndSendPaymentLink(
    reservation: ReservationView,
    options: Partial<PaymentLinkOptions> = {}
  ): Promise<PaymentLinkResult> {
    console.log('🔄 Creating and sending payment link for:', reservation.clientName);

    try {
      // 1. Preparar datos del pago
      const paymentData: PaymentLinkOptions = {
        reservationId: reservation.bookingId,
        amount: reservation.totalPrice,
        customerEmail: reservation.clientEmail,
        customerName: reservation.clientName,
        description: `Pago por ${reservation.serviceName}`,
        expirationHours: options.expirationHours || 48,
        customMessage: options.customMessage,
        sendWhatsApp: options.sendWhatsApp || false,
        manualLink: options.manualLink
      };

      let paymentUrl: string;
      let emailResult: any;

      // 2. Generar o usar payment link
      if (paymentData.manualLink) {
        // ✅ Usar link manual
        paymentUrl = paymentData.manualLink;
        console.log('📝 Using manual payment link:', paymentUrl);
      } else {
        // ✅ Generar link automáticamente con Stripe
        const payment = await this.paymentService.createPayment(
          paymentData.reservationId,
          paymentData.amount,
          'EUR',
          paymentData.customerEmail,
          paymentData.customerName,
          paymentData.description,
          'stripe',
          paymentData.expirationHours
        );

        paymentUrl = payment.paymentUrl;
        console.log('🎯 Generated Stripe payment link:', paymentUrl);
      }

      // 3. Enviar email con payment link
      emailResult = await this.sendPaymentEmail(reservation, paymentUrl, paymentData);

      if (!emailResult.success) {
        throw new Error(`Failed to send payment email: ${emailResult.error}`);
      }

      // 4. Enviar por WhatsApp si está habilitado
      let whatsappMessageId: string | undefined;
      if (paymentData.sendWhatsApp) {
        whatsappMessageId = await this.sendPaymentWhatsApp(reservation, paymentUrl, paymentData);
      }

      // 5. Actualizar estado de la reserva
      await this.updateReservationPaymentStatus(reservation.bookingId, {
        status: 'payment-sent',
        paymentUrl: paymentUrl,
        sentAt: new Date()
      });

      console.log('✅ Payment link sent successfully to:', reservation.clientName);

      return {
        success: true,
        paymentUrl: paymentUrl,
        emailMessageId: emailResult.messageId,
        whatsappMessageId: whatsappMessageId
      };
    } catch (error) {
      console.error('❌ Error in createAndSendPaymentLink:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 📧 Enviar email con payment link
   */
  private async sendPaymentEmail(
    reservation: ReservationView,
    paymentUrl: string,
    options: PaymentLinkOptions
  ): Promise<any> {
    console.log('📧 Sending payment email to:', reservation.clientEmail);

    // Preparar datos del email con payment link
    const emailData = {
      ...reservation,
      paymentLink: paymentUrl,
      expirationHours: options.expirationHours || 48,
      customMessage: options.customMessage,
      // Calcular fecha de expiración
      expirationDate: new Date(
        Date.now() + (options.expirationHours || 48) * 60 * 60 * 1000
      ).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Usar el EmailService existente con template de payment
    return await this.emailService.sendPaymentRequest(emailData);
  }

  /**
   * 📱 Enviar por WhatsApp (opcional)
   */
  private async sendPaymentWhatsApp(
    reservation: ReservationView,
    paymentUrl: string,
    options: PaymentLinkOptions
  ): Promise<string> {
    console.log('📱 Preparing WhatsApp message for:', reservation.clientName);

    const message = this.generateWhatsAppMessage(reservation, paymentUrl, options);
    const phoneNumber = this.extractPhoneNumber(reservation);

    if (phoneNumber) {
      // Abrir WhatsApp Web con el mensaje pre-llenado
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      return 'whatsapp-opened';
    } else {
      // Copiar mensaje al clipboard como fallback
      await navigator.clipboard.writeText(message);
      return 'message-copied';
    }
  }

  /**
   * 📝 Generar mensaje de WhatsApp
   */
  private generateWhatsAppMessage(
    reservation: ReservationView,
    paymentUrl: string,
    options: PaymentLinkOptions
  ): string {
    const expiration = options.expirationHours || 48;

    return `🎉 ¡Hola ${reservation.clientName}!

Tu reserva para *${reservation.serviceName}* ha sido confirmada.

📋 *Detalles:*
• Servicio: ${reservation.serviceName}
• Total: $${reservation.totalPrice}
• Reserva #: ${reservation.bookingId}

💳 *Para completar tu reserva*, por favor realiza el pago:
${paymentUrl}

⏰ El link es válido por ${expiration} horas.

${options.customMessage ? `\n📝 *Mensaje especial:*\n${options.customMessage}\n` : ''}

¡Gracias por confiar en nosotros! 🙏`;
  }

  /**
   * 📞 Extraer número de teléfono de la reserva
   */
  private extractPhoneNumber(reservation: ReservationView): string | null {
    // Buscar en diferentes campos posibles
    const phone =
      reservation.clientPhone ||
      reservation.formData?.phone ||
      reservation.formData?.telefono ||
      reservation.formData?.celular;

    if (!phone) return null;

    // Limpiar y formatear el número
    const cleaned = phone.replace(/\D/g, '');

    // Agregar código de país si no lo tiene (asumir +1 como default)
    if (cleaned.length === 10) {
      return `1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return cleaned;
    }

    return cleaned;
  }

  /**
   * 🔄 Actualizar estado de pago de la reserva
   */
  private async updateReservationPaymentStatus(
    reservationId: string,
    paymentData: {
      status: string;
      paymentUrl: string;
      sentAt: Date;
    }
  ): Promise<void> {
    try {
      // TODO: Implementar actualización en Firebase
      console.log('🔄 Updating reservation payment status:', { reservationId, paymentData });

      // Aquí irían las llamadas a Firebase para actualizar la reserva
      // await updateDoc(doc(db, 'reservations', reservationId), {
      //   paymentStatus: paymentData.status,
      //   paymentUrl: paymentData.paymentUrl,
      //   paymentSentAt: Timestamp.fromDate(paymentData.sentAt)
      // });
    } catch (error) {
      console.error('❌ Error updating reservation payment status:', error);
      // No lanzar error porque el payment link ya se envió exitosamente
    }
  }

  /**
   * 📊 Obtener estadísticas de pagos
   */
  async getPaymentStats(reservationIds?: string[]): Promise<{
    total: number;
    sent: number;
    paid: number;
    pending: number;
    expired: number;
  }> {
    try {
      // TODO: Implementar consulta real a Firebase/Stripe
      console.log('📊 Getting payment statistics...');

      return {
        total: 0,
        sent: 0,
        paid: 0,
        pending: 0,
        expired: 0
      };
    } catch (error) {
      console.error('❌ Error getting payment stats:', error);
      throw error;
    }
  }

  /**
   * 🔍 Verificar estado de un pago
   */
  async checkPaymentStatus(reservationId: string): Promise<{
    status: 'pending' | 'sent' | 'paid' | 'expired' | 'failed';
    paymentUrl?: string;
    paidAt?: Date;
    amount?: number;
  }> {
    try {
      // TODO: Implementar verificación real con Stripe webhooks
      console.log('🔍 Checking payment status for:', reservationId);

      return {
        status: 'pending'
      };
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
      throw error;
    }
  }
}

// 🔑 Dependency Injection Key
export const enhancedPaymentServiceKey = Symbol('EnhancedPaymentService');

// 🚀 Service Instance (to be provided in main.ts)
export const createEnhancedPaymentService = (
  paymentService: PaymentService,
  emailService: EmailService
) => {
  return new EnhancedPaymentService(paymentService, emailService);
};
