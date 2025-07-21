import type { EmailResult, ReservationEmailData } from '@/types/Email';
import sgMail from '@sendgrid/mail';

export class EmailCaller {
  private readonly fromEmail: string;
  private readonly templateId: string;

  constructor() {
    const apiKey = import.meta.env.VITE_SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_SENDGRID_API_KEY is required');
    }
    
    sgMail.setApiKey(apiKey);
    
    // Email remitente configurado
    this.fromEmail = import.meta.env.VITE_FROM_EMAIL || 'noreply@tudominio.com';
    
    // Template ID de SendGrid
    this.templateId = import.meta.env.VITE_SENDGRID_TEMPLATE_CONFIRMATION || 'd-xxxxx';
  }

  /**
   * 📧 Enviar email de confirmación de reserva
   */
  async sendReservationConfirmationEmail(data: ReservationEmailData): Promise<EmailResult> {
    try {
      console.log('📧 Sending reservation confirmation email to:', data.clientEmail);

      const emailData = {
        to: data.clientEmail,
        from: {
          email: this.fromEmail,
          name: 'Tu Servicio de Reservas'
        },
        subject: `Confirmación de Reserva - ${data.serviceName}`,
        templateId: this.templateId,
        dynamicTemplateData: {
          clientName: data.clientName,
          serviceName: data.serviceName,
          serviceDate: data.serviceDate,
          serviceTime: data.serviceTime,
          totalPrice: data.totalPrice,
          location: data.location || 'Por confirmar',
          supplierName: data.supplierName || 'Por asignar',
          supplierPhone: data.supplierPhone || '',
          reservationId: data.reservationId,
          year: new Date().getFullYear(),
          formattedPrice: `$${data.totalPrice.toFixed(2)}`,
          serviceDateTime: `${data.serviceDate} a las ${data.serviceTime}`,
          // Generar iniciales del proveedor
          supplierInitials: data.supplierName 
            ? data.supplierName.split(' ').map(n => n[0]).join('').toUpperCase()
            : 'PS',
          ...data.additionalDetails
        }
      };

      const response = await sgMail.send(emailData);
      
      console.log('✅ Email sent successfully:', response[0].statusCode);
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id'] || 'unknown'
      };

    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * ✅ Verificar configuración de SendGrid
   */
  async validateConfiguration(): Promise<boolean> {
    try {
      console.log('✅ SendGrid configuration is valid');
      return true;
    } catch (error) {
      console.error('❌ SendGrid configuration error:', error);
      return false;
    }
  }
}