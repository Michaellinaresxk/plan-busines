// src/primary/email/useCase/index.ts - ACTUALIZADO SOLO EMAILJS
import { EmailResource } from '@/infra/email/EmailResource';
import { ReservationView } from '@/views/ReservationView';
import { SendReservationConfirmationUseCase } from './SendReservationConfirmationUseCase';
import type { EmailResult } from '@/types/email';

export class EmailService {
  // Use Case
  private sendReservationConfirmationUseCase: SendReservationConfirmationUseCase;

  constructor(private readonly emailResource: EmailResource) {
    console.log('📧 EmailService constructor called - EmailJS only');

    // Inicializar use case
    this.sendReservationConfirmationUseCase = new SendReservationConfirmationUseCase(emailResource);

    console.log('✅ EmailService initialized successfully with EmailJS');
  }

  /**
   * 📧 Enviar confirmación de reserva usando EmailJS
   */
  async sendReservationConfirmation(
    reservation: ReservationView,
    supplierInfo?: { name: string; phone: string }
  ): Promise<EmailResult> {
    console.log('📧 EmailService.sendReservationConfirmation called:', {
      bookingId: reservation.bookingId,
      clientName: reservation.clientName,
      clientEmail: reservation.clientEmail,
      serviceName: reservation.serviceName,
      hasSupplierInfo: !!(supplierInfo?.name || supplierInfo?.phone)
    });

    try {
      // ✅ Ejecutar caso de uso con EmailJS
      const result = await this.sendReservationConfirmationUseCase.execute(
        reservation,
        supplierInfo
      );

      console.log('📧 EmailService result:', {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        service: 'EmailJS'
      });

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
   * ✅ Validar configuración del servicio EmailJS
   */
  async validateConfiguration(): Promise<boolean> {
    try {
      console.log('🔍 Validating EmailJS configuration...');

      // Verificar que el emailResource esté disponible
      if (!this.emailResource) {
        console.error('❌ EmailResource not available');
        return false;
      }

      // Verificar configuración específica de EmailJS
      const isValid = await this.emailResource.validateConfiguration();

      if (isValid) {
        console.log('✅ EmailJS configuration is valid');
      } else {
        console.warn('⚠️ EmailJS configuration has issues');
      }

      return isValid;
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

      if (!this.emailResource) {
        console.error('❌ EmailResource not available for testing');
        return false;
      }

      const connectionResult = await this.emailResource.testConnection();

      if (connectionResult) {
        console.log('✅ EmailJS connection test passed');
      } else {
        console.error('❌ EmailJS connection test failed');
      }

      return connectionResult;
    } catch (error) {
      console.error('❌ EmailJS connection test exception:', error);
      return false;
    }
  }

  /**
   * 🔍 Get service info for debugging
   */
  getServiceInfo(): Record<string, any> {
    return {
      serviceName: 'EmailService with EmailJS',
      hasEmailResource: !!this.emailResource,
      hasUseCase: !!this.sendReservationConfirmationUseCase,
      emailResource: this.emailResource?.getServiceInfo(),
      environment: {
        isDevelopment: import.meta.env.DEV,
        emailjsConfig: {
          hasServiceId: !!import.meta.env.VITE_EMAILJS_SERVICE_ID,
          hasTemplateId: !!import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          hasPublicKey: !!import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
          hasFromEmail: !!import.meta.env.VITE_FROM_EMAIL,
          serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'Not set',
          templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'Not set',
          fromEmail: import.meta.env.VITE_FROM_EMAIL || 'Not set'
        }
      }
    };
  }

  /**
   * 🧪 Enviar email de prueba (solo desarrollo)
   */
  async sendTestEmail(): Promise<EmailResult> {
    if (!import.meta.env.DEV) {
      return {
        success: false,
        error: 'Test emails only allowed in development'
      };
    }

    console.log('🧪 Sending test email...');

    // Crear reserva de prueba
    const testReservation: ReservationView = {
      bookingId: 'TEST_' + Date.now(),
      serviceId: 'airport-transfer',
      serviceName: 'Transporte Aeropuerto - PRUEBA',
      bookingDate: new Date(),
      status: 'approved' as any,
      totalPrice: 75.0,
      clientName: 'Juan Pérez',
      clientEmail: 'tu-email@gmail.com', // ✅ CAMBIAR POR TU EMAIL
      clientPhone: '+1-829-555-0123',
      formData: {
        date: new Date().toLocaleDateString('es-ES'),
        time: '14:30',
        location: 'Aeropuerto Punta Cana',
        flightNumber: 'AA1234',
        vehicleType: 'SUV Premium',
        passengerCount: 2,
        needsCarSeat: true,
        carSeatCount: 1
      },
      notes: '🧪 EMAIL DE PRUEBA - Sistema EmailJS',
      timeAgo: 'hace 1 minuto',
      serviceDate: new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      serviceTime: '2:30 PM'
    };

    const testSupplier = {
      name: 'TransCaribe Premium - PRUEBA',
      phone: '+1-829-555-9999'
    };

    try {
      const result = await this.sendReservationConfirmation(testReservation, testSupplier);

      if (result.success) {
        console.log('✅ Test email sent successfully!');
        console.log('📧 Check email:', testReservation.clientEmail);
      } else {
        console.error('❌ Test email failed:', result.error);
      }

      return result;
    } catch (error) {
      console.error('❌ Test email exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test email failed'
      };
    }
  }

  /**
   * 📊 Obtener estadísticas del servicio (básicas)
   */
  getServiceStats(): Record<string, any> {
    return {
      serviceName: 'EmailJS Service',
      isConfigured: !!(
        import.meta.env.VITE_EMAILJS_SERVICE_ID && import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      ),
      environment: import.meta.env.DEV ? 'development' : 'production',
      lastInitialized: new Date().toISOString(),
      features: [
        'Custom HTML Templates',
        'Service-specific details',
        'Supplier information',
        'Responsive design',
        'Multi-language support (Spanish)',
        'Debug logging'
      ]
    };
  }
}
