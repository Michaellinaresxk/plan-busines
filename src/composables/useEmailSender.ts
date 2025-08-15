import { ref } from 'vue';
import { inject } from 'vue';
import { emailServiceKey } from '@/services/EmailService';
import type { ReservationEmailData } from '@/types/email';

export function useEmailSender() {
  const emailService = inject(emailServiceKey);
  if (!emailService) {
    throw new Error('EmailService not provided');
  }

  const isSending = ref(false);
  const error = ref<string | null>(null);
  const lastSentEmail = ref<string | null>(null);

  const sendPaymentEmail = async (emailData: ReservationEmailData) => {
    if (isSending.value) {
      throw new Error('Email is already being sent');
    }

    isSending.value = true;
    error.value = null;

    try {
      console.log('📧 Sending payment email...', emailData.clientEmail);

      await emailService.sendReservationEmail(emailData);

      lastSentEmail.value = emailData.clientEmail;
      console.log('✅ Payment email sent successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      error.value = `Failed to send email: ${errorMessage}`;
      console.error('❌ Email sending failed:', err);
      throw err;
    } finally {
      isSending.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    isSending: readonly(isSending),
    error: readonly(error),
    lastSentEmail: readonly(lastSentEmail),
    sendPaymentEmail,
    clearError
  };
}
