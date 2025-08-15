import type { Timestamp } from 'firebase/firestore';
import type { PaymentStatus, PaymentProvider } from '@/domain/payment/Payment';

export type ApiPayment = {
  id: string;
  reservationId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  paymentUrl: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  customerEmail: string;
  customerName: string;
  description: string;
  metadata: Record<string, any>;
  providerPaymentId?: string;
  completedAt?: Timestamp;
  failureReason?: string;
  refundedAt?: Timestamp;
  refundAmount?: number;
  webhookData?: Record<string, any>;
};
