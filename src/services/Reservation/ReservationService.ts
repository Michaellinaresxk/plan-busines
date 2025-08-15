
import { ReservationService as BaseReservationService } from '@/primary/reservation/useCases/index';
import type { ReservationView } from '@/views/ReservationView';
import { supplierService } from '../SupplierService';
import { emailService } from '../EmailService';

export class ReservationService extends BaseReservationService {
  /**
   * 📧 NUEVO: Enviar links de pago a reservas seleccionadass
   */
  async sendPaymentLinks(selectedReservations: ReservationView[]): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    processedReservations: ReservationView[];
    errors: string[];
  }> {
    console.log(`📧 Starting to send payment links to ${selectedReservations.length} reservations`);

    try {
      // Preparar requests para el EmailService
      const emailRequests = await Promise.all(
        selectedReservations.map(async reservation => {
          // Obtener supplier para cada reserva
          const supplier = await supplierService.getSuppliersByService(reservation.serviceId);

          if (!supplier) {
            throw new Error(`No supplier found for reservation ${reservation.bookingId}`);
          }

          return {
            reservation,
            supplier,
            expirationHours: 48 // 48 horas para pagar
          };
        })
      );

      // Enviar emails usando EmailService
      const result = await emailService.sendMultiplePaymentRequests(emailRequests);

      // Actualizar estado de las reservas exitosas
      const processedReservations: ReservationView[] = [];

      for (let i = 0; i < result.results.length; i++) {
        const emailResult = result.results[i];
        const reservation = selectedReservations[i];

        if (emailResult.success) {
          // Actualizar estado en Firebase
          await this.updateReservationStatus(reservation.bookingId, 'payment-sent');

          // Agregar metadata del email
          reservation.metadata = {
            ...reservation.metadata,
            paymentEmailSent: true,
            paymentEmailSentAt: new Date().toISOString(),
            paymentLink: emailResult.paymentLink,
            paymentMessageId: emailResult.messageId
          };

          processedReservations.push(reservation);
        }
      }

      console.log(`✅ Payment links sent: ${result.success} success, ${result.failed} failed`);

      return {
        success: result.failed === 0, // Solo true si todos fueron exitosos
        sent: result.success,
        failed: result.failed,
        processedReservations,
        errors: result.errors
      };
    } catch (error) {
      console.error('❌ Error in sendPaymentLinks:', error);
      return {
        success: false,
        sent: 0,
        failed: selectedReservations.length,
        processedReservations: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * 📧 Enviar link de pago individual
   */
  async sendSinglePaymentLink(reservation: ReservationView): Promise<{
    success: boolean;
    messageId?: string;
    paymentLink?: string;
    error?: string;
  }> {
    console.log(`📧 Sending single payment link to: ${reservation.clientName}`);

    try {
      // Obtener supplier
      const supplier = await supplierService.getSuppliersByService(reservation.serviceId);

      if (!supplier) {
        throw new Error(`No supplier found for reservation ${reservation.bookingId}`);
      }

      // Enviar email
      const result = await emailService.sendPaymentRequest({
        reservation,
        supplier,
        expirationHours: 48
      });

      if (result.success) {
        // Actualizar estado en Firebase
        await this.updateReservationStatus(reservation.bookingId, 'payment-sent');

        console.log(`✅ Single payment link sent to: ${reservation.clientName}`);
      }

      return result;
    } catch (error) {
      console.error('❌ Error sending single payment link:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 📊 Obtener estadísticas de emails enviados
   */
  async getEmailStats(reservationId?: string): Promise<{
    totalEmails: number;
    sentToday: number;
    pendingPayments: number;
    completedPayments: number;
    expiredLinks: number;
  }> {
    try {
      // TODO: Implementar cuando tengas tabla de emails/payments
      console.log('📊 Getting email stats...');

      return {
        totalEmails: 0,
        sentToday: 0,
        pendingPayments: 0,
        completedPayments: 0,
        expiredLinks: 0
      };
    } catch (error) {
      console.error('❌ Error getting email stats:', error);
      throw error;
    }
  }
}

// src/UI/pages/ApprovedReservationsPage.vue - Actualización del método confirmSendPayments
export default {
  // ... resto del componente

  methods: {
    // ✅ MÉTODO ACTUALIZADO para usar el nuevo EmailService
    async confirmSendPayments() {
      this.sendingPayments = true;
      this.showPaymentDialog = false;

      try {
        console.log('💳 Sending payment links using EmailService...');

        if (!this.reservationService) {
          throw new Error('ReservationService not available');
        }

        // ✅ USAR NUEVO MÉTODO DEL SERVICIO
        const result = await this.reservationService.sendPaymentLinks(this.selectedReservations);

        if (result.success) {
          // ✅ TODO EXITOSO
          this.showNotification(
            `¡Perfecto! Links de pago enviados a ${result.sent} clientes exitosamente`,
            'success',
            'mdi-check-circle'
          );

          // Remover reservas procesadas de la lista
          this.reservations = this.reservations.filter(
            r => !result.processedReservations.some(pr => pr.bookingId === r.bookingId)
          );

          // Limpiar selección
          this.selectedReservations = [];
          this.selectAll = false;
        } else {
          // ✅ ALGUNOS FALLARON
          const successMessage =
            result.sent > 0 ? `${result.sent} emails enviados exitosamente. ` : '';

          const errorMessage = result.failed > 0 ? `${result.failed} emails fallaron.` : '';

          const detailMessage =
            result.errors.length > 0
              ? ` Errores: ${result.errors.slice(0, 2).join(', ')}${result.errors.length > 2 ? '...' : ''}`
              : '';

          this.showNotification(
            `${successMessage}${errorMessage}${detailMessage}`,
            result.sent > 0 ? 'warning' : 'error',
            result.sent > 0 ? 'mdi-alert' : 'mdi-alert-circle'
          );

          // Remover solo las exitosas
          this.reservations = this.reservations.filter(
            r => !result.processedReservations.some(pr => pr.bookingId === r.bookingId)
          );

          // Actualizar selección removiendo las exitosas
          this.selectedReservations = this.selectedReservations.filter(
            r => !result.processedReservations.some(pr => pr.bookingId === r.bookingId)
          );
        }
      } catch (error) {
        console.error('❌ Error sending payment links:', error);
        this.showNotification(
          error instanceof Error ? error.message : 'Error al enviar links de pago',
          'error',
          'mdi-alert-circle'
        );
      } finally {
        this.sendingPayments = false;
      }
    },

    // ✅ NUEVO: Método para enviar link individual
    async sendSinglePaymentLink(reservation) {
      try {
        console.log('📧 Sending single payment link to:', reservation.clientName);

        const result = await this.reservationService.sendSinglePaymentLink(reservation);

        if (result.success) {
          this.showNotification(
            `Link de pago enviado a ${reservation.clientName}`,
            'success',
            'mdi-check-circle'
          );

          // Remover de la lista
          const index = this.reservations.findIndex(r => r.bookingId === reservation.bookingId);
          if (index >= 0) {
            this.reservations.splice(index, 1);
          }

          // Remover de selección si estaba seleccionada
          const selectedIndex = this.selectedReservations.findIndex(
            r => r.bookingId === reservation.bookingId
          );
          if (selectedIndex >= 0) {
            this.selectedReservations.splice(selectedIndex, 1);
          }
        } else {
          this.showNotification(
            `Error enviando link a ${reservation.clientName}: ${result.error}`,
            'error',
            'mdi-alert-circle'
          );
        }
      } catch (error) {
        console.error('❌ Error sending single payment link:', error);
        this.showNotification('Error enviando link de pago', 'error', 'mdi-alert-circle');
      }
    },

    // ✅ NUEVO: Botón de envío individual en cada card
    openSinglePaymentDialog(reservation) {
      this.$confirm({
        title: 'Enviar Link de Pago',
        message: `¿Enviar link de pago a ${reservation.clientName}?`,
        confirmText: 'Enviar',
        cancelText: 'Cancelar',
        type: 'info'
      }).then(() => {
        this.sendSinglePaymentLink(reservation);
      });
    }
  }
};
