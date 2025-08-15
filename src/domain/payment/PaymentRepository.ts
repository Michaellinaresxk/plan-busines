import { Payment, PaymentProvider, PaymentStatus } from './Payment';

export default interface PaymentRepository {
  createPayment(data: {
    reservationId: string;
    amount: number;
    currency: string;
    customerEmail: string;
    customerName: string;
    description: string;
    provider: PaymentProvider;
    expirationHours?: number;
    metadata?: Record<string, any>;
  }): Promise<Payment>;

  getPaymentById(id: string): Promise<Payment | null>;
  getPaymentsByReservation(reservationId: string): Promise<Payment[]>;
  getPaymentsByStatus(status: PaymentStatus): Promise<Payment[]>;
  getPaymentsByCustomer(customerEmail: string): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;

  updatePaymentStatus(
    id: string,
    status: PaymentStatus,
    additionalData?: Record<string, any>
  ): Promise<Payment>;
  processWebhook(paymentId: string, webhookData: Record<string, any>): Promise<Payment>;

  getPaymentStats(): Promise<{
    total: number;
    pending: number;
    completed: number;
    failed: number;
    expired: number;
    totalAmount: number;
    completedAmount: number;
  }>;

  getExpiredPayments(): Promise<Payment[]>;
  markExpiredPayments(): Promise<number>;
}
