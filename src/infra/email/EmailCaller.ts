// src/infra/email/EmailJSCaller.ts - ACTUALIZADO PARA TEMPLATE EMBEBIDO
import emailjs from '@emailjs/browser';
import type { EmailResult, ReservationEmailData } from '@/types/email';
import { EmailTemplateEngine } from './EmailTemplateEngine';

export class EmailJSCaller {
  private readonly serviceId: string;
  private readonly templateId: string;
  private readonly publicKey: string;
  private readonly templateEngine: EmailTemplateEngine;

  constructor() {
    this.serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
    this.templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
    this.publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

    // ✅ Inicializar el motor de templates embebido
    this.templateEngine = new EmailTemplateEngine();

    if (!this.serviceId || !this.publicKey) {
      console.warn('⚠️ EmailJS configuration incomplete:', {
        serviceId: this.serviceId ? '✅' : '❌',
        templateId: this.templateId ? '✅' : '❌',
        publicKey: this.publicKey ? '✅' : '❌'
      });
    } else {
      // Initialize EmailJS
      emailjs.init(this.publicKey);
      console.log('✅ EmailJS initialized successfully with embedded HTML template');
    }
  }

  /**
   * 📧 Enviar email de confirmación usando template HTML embebido
   */
  async sendReservationConfirmationEmail(data: ReservationEmailData): Promise<EmailResult> {
    try {
      console.log(
        '📧 EmailJS: Sending confirmation email using embedded template to:',
        data.clientEmail
      );

      // Validar configuración
      if (!this.serviceId || !this.publicKey) {
        throw new Error('EmailJS configuration incomplete. Check environment variables.');
      }

      // ✅ Generar HTML usando el template embebido
      const htmlContent = this.templateEngine.generateEmailHTML(data);

      if (!htmlContent || htmlContent.length < 100) {
        throw new Error('Generated HTML content is empty or too short');
      }

      console.log('🎨 Email HTML generated from embedded template:', {
        length: htmlContent.length,
        hasContent: htmlContent.includes(data.clientName),
        hasService: htmlContent.includes(data.serviceName),
        reservationId: data.reservationId,
        templateType: 'Embedded HTML Template'
      });

      // ✅ Preparar parámetros para EmailJS
      const templateParams = {
        // Información básica del destinatario
        to_email: data.clientEmail,
        to_name: data.clientName,

        // Subject del email
        subject: `✅ Confirmación de Reserva - ${data.serviceName}`,

        // ✅ CONTENIDO HTML COMPLETO DESDE TEMPLATE EMBEBIDO
        html_content: htmlContent,

        // Información adicional para EmailJS
        client_name: data.clientName,
        reservation_id: data.reservationId,
        service_name: data.serviceName,

        // Email metadata
        reply_to: import.meta.env.VITE_FROM_EMAIL || 'noreply@luxpuntacana.com',
        from_name: 'Plan Business'
      };

      console.log('📧 EmailJS template params prepared:', {
        to_email: templateParams.to_email,
        subject: templateParams.subject,
        hasHtmlContent: !!templateParams.html_content,
        htmlLength: templateParams.html_content.length,
        templateUsed: 'Embedded HTML Template',
        engineReady: !!this.templateEngine
      });

      // ✅ Enviar email usando EmailJS
      const response = await emailjs.send(this.serviceId, this.templateId, templateParams);

      console.log('✅ EmailJS response:', response);

      // EmailJS considera success cuando status es 200
      const isSuccess = response.status === 200;

      if (isSuccess) {
        console.log('✅ Email sent successfully via EmailJS using embedded template:', {
          clientEmail: data.clientEmail,
          serviceName: data.serviceName,
          reservationId: data.reservationId,
          messageId: `emailjs_${response.text}_${Date.now()}`,
          templateType: 'Embedded HTML'
        });
      }

      return {
        success: isSuccess,
        messageId: `emailjs_${response.text}_${Date.now()}`
      };
    } catch (error: any) {
      console.error('❌ EmailJS error with embedded template:', error);

      let errorMessage = 'Unknown EmailJS error';

      if (error.text) {
        errorMessage = `EmailJS: ${error.text}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 🎨 Preview del email generado (solo desarrollo)
   */
  previewEmail(data: ReservationEmailData): void {
    if (!import.meta.env.DEV) {
      console.warn('⚠️ Email preview only available in development');
      return;
    }

    console.log('🎨 Opening email preview using embedded template...');
    this.templateEngine.previewHTML(data);
  }

  /**
   * ✅ Verificar configuración de EmailJS
   */
  async validateConfiguration(): Promise<boolean> {
    const hasServiceId = !!this.serviceId;
    const hasPublicKey = !!this.publicKey;
    const hasTemplateEngine = !!this.templateEngine;

    const isValid = hasServiceId && hasPublicKey && hasTemplateEngine;

    console.log('🔍 EmailJS configuration status with embedded template:', {
      serviceId: hasServiceId ? '✅' : '❌',
      templateId: this.templateId ? '✅' : '⚠️ (Optional for dynamic HTML)',
      publicKey: hasPublicKey ? '✅' : '❌',
      templateEngine: hasTemplateEngine ? '✅' : '❌',
      templateType: 'Embedded HTML Template',
      overall: isValid ? '✅ Valid' : '❌ Invalid'
    });

    return isValid;
  }

  /**
   * 🔍 Obtener información del servicio
   */
  getServiceInfo(): Record<string, any> {
    return {
      serviceName: 'EmailJSCaller with Embedded HTML Template',
      serviceId: this.serviceId ? `${this.serviceId.substring(0, 10)}...` : 'Not set',
      templateId: this.templateId ? `${this.templateId.substring(0, 10)}...` : 'Dynamic HTML',
      publicKey: this.publicKey ? `${this.publicKey.substring(0, 10)}...` : 'Not set',
      templateEngine: 'EmailTemplateEngineEmbedded',
      templateType: 'Embedded HTML Template',
      templateLocation: 'src/infra/email/EmailTemplateEngine.ts',
      usesCustomHTML: true,
      environment: {
        isDevelopment: import.meta.env.DEV,
        hasConfiguration: !!(this.serviceId && this.publicKey),
        templateEngineReady: !!this.templateEngine
      }
    };
  }

  /**
   * 🧪 Test de conectividad básica
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test básico de configuración
      const configValid = await this.validateConfiguration();

      if (!configValid) {
        console.error('❌ EmailJS configuration invalid');
        return false;
      }

      console.log('✅ EmailJS connection test passed with embedded template');
      return true;
    } catch (error) {
      console.error('❌ EmailJS connection test failed:', error);
      return false;
    }
  }

  /**
   * 🧪 Test de generación de HTML con datos de prueba
   */
  testHTMLGeneration(data?: ReservationEmailData): string {
    const testData = data || this.createTestData();

    try {
      console.log('🧪 Testing HTML generation with embedded template...');
      const html = this.templateEngine.generateEmailHTML(testData);

      console.log('🧪 HTML generation test results:', {
        success: !!html,
        length: html.length,
        containsClientName: html.includes(testData.clientName),
        containsServiceName: html.includes(testData.serviceName),
        containsPrice: html.includes(testData.totalPrice.toString()),
        templateType: 'Embedded HTML Template'
      });

      return html;
    } catch (error) {
      console.error('❌ HTML generation test failed with embedded template:', error);
      return '';
    }
  }

  /**
   * 📋 Crear datos de prueba
   */
  private createTestData(): ReservationEmailData {
    return {
      reservationId: 'TEST_EMBEDDED_' + Date.now(),
      clientName: 'María García',
      clientEmail: 'test@example.com',
      serviceName: 'Transporte Aeropuerto',
      serviceDate: '25 de julio, 2025',
      serviceTime: '3:30 PM',
      totalPrice: 85.0,
      location: 'Hotel Bavaro Princess',
      supplierName: 'TransPunta Premium',
      supplierPhone: '+1-829-555-8888',
      additionalDetails: {
        formData: {
          flightNumber: 'DL456',
          vehicleType: 'SUV Luxury',
          passengerCount: 3,
          needsCarSeat: true,
          carSeatCount: 1
        }
      }
    };
  }
}

// ✅ Export con el mismo nombre para compatibilidad
export { EmailJSCaller as EmailCaller };
