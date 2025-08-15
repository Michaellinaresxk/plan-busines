import type { PaymentProperties } from '@/types/properties';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  MERCADO_PAGO = 'mercado_pago',
  PAYPAL = 'paypal',
  RAZORPAY = 'razorpay'
}

export class Payment {
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
    public readonly refundAmount?: number,
    public readonly webhookData?: Record<string, any>
  ) {}

  static fromProperties(properties: PaymentProperties): Payment {
    return new Payment(
      properties.id,
      properties.reservationId,
      properties.amount,
      properties.currency,
      properties.status,
      properties.provider,
      properties.paymentUrl,
      properties.expiresAt,
      properties.createdAt,
      properties.updatedAt,
      properties.customerEmail,
      properties.customerName,
      properties.description,
      properties.metadata || {},
      properties.providerPaymentId,
      properties.completedAt,
      properties.failureReason,
      properties.refundedAt,
      properties.refundAmount,
      properties.webhookData
    );
  }
}

export default Payment;
