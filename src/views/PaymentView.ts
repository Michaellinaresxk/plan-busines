import type Payment from '@/domain/payment/Payment';
import type { PaymentStatus, PaymentProvider } from '@/domain/payment/Payment';

export class PaymentView {
  private constructor(
    public readonly id: string,
    public readonly reservationId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: PaymentStatus,
    public readonly provider: PaymentProvider,
    public readonly paymentUrl: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly customerEmail: string,
    public readonly customerName: string,
    public readonly description: string,
    public readonly metadata: Record<string, any>,
    public readonly providerPaymentId?: string,
    public readonly completedAt?: Date,
    public readonly failureReason?: string,
    public readonly refundedAt?: Date,
    public readonly refundAmount?: number
  ) {}

  static fromDomain(payment: Payment): PaymentView {
    return new PaymentView(
      payment.id,
      payment.reservationId,
      payment.amount,
      payment.currency,
      payment.status,
      payment.provider,
      payment.paymentUrl,
      payment.expiresAt,
      payment.createdAt,
      payment.updatedAt,
      payment.customerEmail,
      payment.customerName,
      payment.description,
      payment.metadata,
      payment.providerPaymentId,
      payment.completedAt,
      payment.failureReason,
      payment.refundedAt,
      payment.refundAmount
    );
  }
}

export default PaymentView;
