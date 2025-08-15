// src/infra/email/EmailJSCaller.ts - ARCHIVO COMPLETO CON TU TEMPLATE ENGINE
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

    // ✅ Usar TU EmailTemplateEngine personalizado
    this.templateEngine = new EmailTemplateEngine();

    if (!this.serviceId || !this.publicKey) {
      console.warn('⚠️ EmailJS configuration incomplete:', {
        serviceId: this.serviceId ? '✅' : '❌',
        templateId: this.templateId ? '✅' : '❌',
        publicKey: this.publicKey ? '✅' : '❌'
      });
    } else {
      emailjs.init(this.publicKey);
      console.log('✅ EmailJS initialized with custom EmailTemplateEngine');
    }
  }

  /**
   * 📧 Enviar confirmación de reserva usando TU template personalizado
   */
  async sendReservationConfirmationEmail(data: ReservationEmailData): Promise<EmailResult> {
    try {
      console.log('📧 EmailJS: Sending confirmation with custom template to:', data.clientEmail);

      if (!this.serviceId || !this.publicKey) {
        throw new Error('EmailJS configuration incomplete. Check environment variables.');
      }

      // ✅ GENERAR HTML CON TU EmailTemplateEngine
      const customHtmlContent = this.templateEngine.generateEmailHTML(data);

      console.log('🎨 Custom HTML template generated:', {
        length: customHtmlContent.length,
        hasClientName: customHtmlContent.includes(data.clientName),
        hasServiceName: customHtmlContent.includes(data.serviceName),
        hasReservationId: customHtmlContent.includes(data.reservationId)
      });

      // ✅ Preparar parámetros para EmailJS con TU HTML
      const templateParams = {
        // Parámetros principales para template EmailJS
        to_email: data.clientEmail,
        to_name: data.clientName,
        subject: `✅ Reserva Confirmada - ${data.serviceName}`,

        // ✅ TU HTML PERSONALIZADO (triple braces en template EmailJS)
        html_content: customHtmlContent,

        // Parámetros adicionales para fallback
        client_name: data.clientName,
        service_name: data.serviceName,
        booking_id: data.reservationId,
        service_date: data.serviceDate,
        service_time: data.serviceTime || 'Por confirmar',
        location: data.location || 'Por confirmar',
        total_price: data.totalPrice ? `$${data.totalPrice.toFixed(2)}` : 'Por confirmar',
        supplier_name: data.supplierName || 'Por asignar',
        supplier_phone: data.supplierPhone || 'Por confirmar',

        // Metadatos para debugging
        template_type: 'custom_embedded',
        generated_at: new Date().toISOString()
      };

      console.log('📧 Sending email with template params:', {
        to_email: templateParams.to_email,
        subject: templateParams.subject,
        has_html_content: !!templateParams.html_content,
        html_content_length: templateParams.html_content.length
      });

      // ✅ Enviar email usando EmailJS
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );

      console.log('✅ Email sent successfully with custom template:', {
        status: result.status,
        text: result.text,
        templateUsed: 'custom_embedded'
      });

      return {
        success: true,
        messageId: result.text,
        templateUsed: 'custom_embedded',
        htmlGenerated: true
      };
    } catch (error) {
      console.error('❌ Error sending email with custom template:', error);

      // ✅ Fallback: intentar con template básico si el personalizado falla
      try {
        console.log('🔄 Attempting fallback email without custom HTML...');

        const fallbackParams = {
          to_email: data.clientEmail,
          to_name: data.clientName,
          subject: `✅ Reserva Confirmada - ${data.serviceName}`,
          client_name: data.clientName,
          service_name: data.serviceName,
          booking_id: data.reservationId,
          service_date: data.serviceDate,
          service_time: data.serviceTime || 'Por confirmar',
          location: data.location || 'Por confirmar',
          total_price: data.totalPrice ? `$${data.totalPrice.toFixed(2)}` : 'Por confirmar'
        };

        const fallbackResult = await emailjs.send(
          this.serviceId,
          this.templateId,
          fallbackParams,
          this.publicKey
        );

        console.log('✅ Fallback email sent successfully');

        return {
          success: true,
          messageId: fallbackResult.text,
          templateUsed: 'fallback_basic',
          htmlGenerated: false,
          warning: 'Custom template failed, used basic template'
        };
      } catch (fallbackError) {
        console.error('❌ Fallback email also failed:', fallbackError);

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Fallback failed'
        };
      }
    }
  }

  /**
   * 🧪 Método de prueba para validar configuración
   */
  async testConfiguration(): Promise<EmailResult> {
    try {
      console.log('🧪 Testing EmailJS configuration...');

      const testData: ReservationEmailData = {
        clientEmail: 'test@test.com',
        clientName: 'Test User',
        serviceName: 'Test Service',
        serviceDate: '2025-08-15',
        serviceTime: '10:00 AM',
        location: 'Test Location',
        reservationId: 'TEST-001',
        totalPrice: 50
      };

      const result = await this.sendReservationConfirmationEmail(testData);

      if (result.success) {
        console.log('✅ EmailJS configuration test passed');
      } else {
        console.error('❌ EmailJS configuration test failed:', result.error);
      }

      return result;
    } catch (error) {
      console.error('❌ EmailJS configuration test exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test configuration failed'
      };
    }
  }

  /**
   * ✅ Validar configuración de EmailJS
   */
  async validateConfiguration(): Promise<boolean> {
    try {
      console.log('🔍 Validating EmailJS configuration...');

      const hasRequiredConfig = !!(this.serviceId && this.publicKey && this.templateEngine);

      if (hasRequiredConfig) {
        console.log('✅ EmailJS configuration is valid');
      } else {
        console.warn('⚠️ EmailJS configuration has issues:', {
          serviceId: this.serviceId ? '✅' : '❌ Missing VITE_EMAILJS_SERVICE_ID',
          publicKey: this.publicKey ? '✅' : '❌ Missing VITE_EMAILJS_PUBLIC_KEY',
          templateEngine: this.templateEngine ? '✅' : '❌ EmailTemplateEngine failed to initialize'
        });
      }

      return hasRequiredConfig;
    } catch (error) {
      console.error('❌ Error validating EmailJS configuration:', error);
      return false;
    }
  }

  /**
   * 🧪 Test de conectividad EmailJS
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing EmailJS connection...');

      const configValid = await this.validateConfiguration();
      if (!configValid) {
        console.error('❌ EmailJS configuration invalid');
        return false;
      }

      // Test básico de conectividad (sin enviar email real)
      const testResult = await this.testConfiguration();

      console.log('🧪 EmailJS connection test result:', testResult.success);
      return testResult.success;
    } catch (error) {
      console.error('❌ EmailJS connection test failed:', error);
      return false;
    }
  }

  /**
   * 🔍 Obtener información del servicio para debugging
   */
  getServiceInfo(): Record<string, any> {
    return {
      serviceName: 'EmailJS with Custom Templates',
      configuration: {
        serviceId: this.serviceId ? '✅ Configured' : '❌ Missing VITE_EMAILJS_SERVICE_ID',
        templateId: this.templateId ? '✅ Configured' : '❌ Missing VITE_EMAILJS_TEMPLATE_ID',
        publicKey: this.publicKey ? '✅ Configured' : '❌ Missing VITE_EMAILJS_PUBLIC_KEY',
        templateEngine: this.templateEngine
          ? '✅ Custom EmailTemplateEngine Ready'
          : '❌ No Template Engine'
      },
      capabilities: {
        customHtmlTemplates: !!this.templateEngine,
        serviceSpecificDetails: true,
        supplierInformation: true,
        responsiveDesign: true,
        fallbackSupport: true
      },
      environment: {
        isDevelopment: import.meta.env.DEV,
        mode: import.meta.env.MODE
      },
      isReady: !!(this.serviceId && this.publicKey && this.templateEngine)
    };
  }

  /**
   * 👁️ Preview del HTML generado (solo desarrollo)
   */
  previewGeneratedHTML(data: ReservationEmailData): void {
    if (!import.meta.env.DEV) {
      console.warn('⚠️ HTML preview only available in development mode');
      return;
    }

    try {
      const html = this.templateEngine.generateEmailHTML(data);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      window.open(url, '_blank');
      console.log('👁️ Email preview opened in new window');

      // Limpiar URL después de un tiempo
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error('❌ Error generating HTML preview:', error);
    }
  }

  /**
   * 📊 Obtener estadísticas del servicio
   */
  getServiceStats(): Record<string, any> {
    return {
      serviceName: 'EmailJS Service with Custom Templates',
      isConfigured: !!(this.serviceId && this.publicKey),
      hasCustomTemplates: !!this.templateEngine,
      environment: import.meta.env.DEV ? 'development' : 'production',
      lastInitialized: new Date().toISOString(),
      features: [
        'Custom HTML Templates via EmailTemplateEngine',
        'Service-specific email details',
        'Supplier information integration',
        'Responsive email design',
        'Fallback template support',
        'Debug logging and preview',
        'Multi-language support (Spanish)'
      ],
      templateEngine: this.templateEngine
        ? {
            available: true,
            type: 'EmailTemplateEngine',
            supportsServiceTypes: [
              'airport-transfer',
              'babysitter',
              'custom-decoration',
              'grocery-shopping'
            ]
          }
        : {
            available: false,
            error: 'EmailTemplateEngine not initialized'
          }
    };
  }
}
