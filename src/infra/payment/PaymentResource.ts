// src/infra/payment/PaymentResource.ts - ARCHIVO COMPLETO ACTUALIZADO
import type PaymentRepository from '@/domain/payment/PaymentRepository';
import { Payment, PaymentStatus, PaymentProvider } from '@/domain/payment/Payment';
import { PaymentCaller } from './PaymentCaller';
import type { ApiPayment } from './ApiPayment';

export class PaymentResource implements PaymentRepository {
  constructor(private readonly paymentCaller: PaymentCaller) {}

  private apiToDomain(apiPayment: ApiPayment): Payment {
    return Payment.fromProperties({
      id: apiPayment.id,
      reservationId: apiPayment.reservationId,
      amount: apiPayment.amount,
      currency: apiPayment.currency,
      status: apiPayment.status,
      provider: apiPayment.provider,
      paymentUrl: apiPayment.paymentUrl,
      expiresAt: apiPayment.expiresAt.toDate(),
      createdAt: apiPayment.createdAt.toDate(),
      updatedAt: apiPayment.updatedAt.toDate(),
      customerEmail: apiPayment.customerEmail,
      customerName: apiPayment.customerName,
      description: apiPayment.description,
      metadata: apiPayment.metadata,
      providerPaymentId: apiPayment.providerPaymentId,
      completedAt: apiPayment.completedAt?.toDate(),
      failureReason: apiPayment.failureReason,
      refundedAt: apiPayment.refundedAt?.toDate(),
      refundAmount: apiPayment.refundAmount,
      webhookData: apiPayment.webhookData
    });
  }

  async getAllPayments(): Promise<Payment[]> {
    const apiPayments = await this.paymentCaller.getAllPayments();
    return apiPayments.map(this.apiToDomain.bind(this));
  }

  async getPaymentById(id: string): Promise<Payment> {
    const apiPayment = await this.paymentCaller.getPaymentById(id);

    if (!apiPayment) {
      throw new Error(`Payment with ID ${id} not found`);
    }

    return this.apiToDomain(apiPayment);
  }

  async getPaymentsByReservation(reservationId: string): Promise<Payment[]> {
    const apiPayments = await this.paymentCaller.getPaymentsByReservation(reservationId);
    return apiPayments.map(this.apiToDomain.bind(this));
  }

  async getPaymentsByStatus(status: PaymentStatus): Promise<Payment[]> {
    const apiPayments = await this.paymentCaller.getPaymentsByStatus(status);
    return apiPayments.map(this.apiToDomain.bind(this));
  }

  async getPaymentsByCustomer(customerEmail: string): Promise<Payment[]> {
    const apiPayments = await this.paymentCaller.getPaymentsByCustomer(customerEmail);
    return apiPayments.map(this.apiToDomain.bind(this));
  }

  // ✅ NUEVO: Método actualizado para usar la integración con Stripe
  async createPayment(
    reservationId: string,
    amount: number,
    currency: string,
    customerEmail: string,
    customerName: string,
    description: string,
    provider: PaymentProvider,
    expirationHours?: number,
    metadata?: Record<string, any>
  ): Promise<Payment> {
    try {
      console.log(`💳 PaymentResource: Creating payment for reservation ${reservationId}`);

      // ✅ Usar el método actualizado del PaymentCaller que integra Stripe
      const apiPayment = await this.paymentCaller.createPayment({
        reservationId,
        amount,
        currency,
        customerEmail,
        customerName,
        description,
        provider,
        expirationHours,
        metadata
      });

      console.log(`✅ PaymentResource: Payment created successfully ${apiPayment.id}`);

      return this.apiToDomain(apiPayment);
    } catch (error) {
      console.error('❌ PaymentResource: Error creating payment:', error);
      throw error;
    }
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<Payment> {
    try {
      console.log(`🔄 PaymentResource: Updating payment ${paymentId} status to ${status}`);

      const apiPayment = await this.paymentCaller.updatePaymentStatus(paymentId, status);

      console.log(`✅ PaymentResource: Payment status updated successfully`);

      return this.apiToDomain(apiPayment);
    } catch (error) {
      console.error(`❌ PaymentResource: Error updating payment ${paymentId} status:`, error);
      throw error;
    }
  }

  async updatePaymentUrl(
    paymentId: string,
    paymentUrl: string,
    providerPaymentId?: string
  ): Promise<Payment> {
    try {
      console.log(`🔗 PaymentResource: Updating payment ${paymentId} URL`);

      const apiPayment = await this.paymentCaller.updatePaymentUrl(
        paymentId,
        paymentUrl,
        providerPaymentId
      );

      console.log(`✅ PaymentResource: Payment URL updated successfully`);

      return this.apiToDomain(apiPayment);
    } catch (error) {
      console.error(`❌ PaymentResource: Error updating payment ${paymentId} URL:`, error);
      throw error;
    }
  }

  // ✅ NUEVO: Método para procesar webhooks de Stripe
  async processWebhook(webhookData: any): Promise<void> {
    try {
      console.log(`🔄 PaymentResource: Processing webhook ${webhookData.type}`);

      await this.paymentCaller.processStripeWebhook(webhookData);

      console.log(`✅ PaymentResource: Webhook processed successfully`);
    } catch (error) {
      console.error('❌ PaymentResource: Error processing webhook:', error);
      throw error;
    }
  }

  // ✅ NUEVO: Método para obtener estadísticas de pagos
  async getPaymentStats(): Promise<{
    total: number;
    pending: number;
    completed: number;
    failed: number;
    expired: number;
    totalAmount: number;
    completedAmount: number;
  }> {
    try {
      console.log('📊 PaymentResource: Getting payment statistics');

      const stats = await this.paymentCaller.getPaymentStats();

      console.log('✅ PaymentResource: Payment statistics retrieved');

      return stats;
    } catch (error) {
      console.error('❌ PaymentResource: Error getting payment statistics:', error);
      throw error;
    }
  }
}
