// src/services/EmailService.ts - CONFIGURACIÓN SOLO EMAILJS
import type { InjectionKey } from 'vue';
import { EmailResource } from '@/infra/email/EmailResource';
import { EmailService } from '@/primary/email/useCase';

console.log('🔧 Initializing EmailJS service configuration...');

// ✅ Crear instancia de EmailResource (que internamente usa EmailJSCaller)
const emailResource = new EmailResource();

// ✅ Crear instancia del EmailService con el resource
const emailService = new EmailService(emailResource);

// ✅ Crear injection key
const emailServiceKey = Symbol('EmailService') as InjectionKey<EmailService>;

console.log('✅ EmailJS service configuration completed');

// ✅ Verificar configuración al inicializar
(async () => {
  try {
    const isValid = await emailService.validateConfiguration();
    const serviceInfo = emailService.getServiceInfo();

    console.log('📧 EmailJS Service Initialization Report:');
    console.log('=========================================');
    console.log('Configuration Valid:', isValid ? '✅' : '❌');
    console.log('Service Info:', serviceInfo);

    if (!isValid) {
      console.warn('⚠️ EmailJS configuration issues detected. Check environment variables:');
      console.warn('- VITE_EMAILJS_SERVICE_ID');
      console.warn('- VITE_EMAILJS_TEMPLATE_ID');
      console.warn('- VITE_EMAILJS_PUBLIC_KEY');
      console.warn('- VITE_FROM_EMAIL');
    } else {
      console.log('✅ EmailJS service ready to send emails!');
    }
  } catch (error) {
    console.error('❌ EmailJS service initialization error:', error);
  }
})();

export { emailService, emailServiceKey };
