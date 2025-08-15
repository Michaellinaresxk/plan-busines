import { PaymentResource } from '@/infra/payment/PaymentResource';
import type { UseCase } from '@/primary/UseCase';
import { PaymentView } from '@/views/PaymentView';
import type { PaymentProvider } from '@/domain/payment/Payment';

export class CreatePaymentLinkUseCase implements UseCase {
  constructor(private paymentResource: PaymentResource) {}

  async execute(
    reservationId: string,
    amount: number,
    currency: string,
    customerEmail: string,
    customerName: string,
    description: string,
    provider: PaymentProvider,
    expirationHours?: number,
    metadata?: Record<string, any>
  ): Promise<PaymentView> {
    try {
      const payment = await this.paymentResource.createPayment(
        reservationId,
        amount,
        currency,
        customerEmail,
        customerName,
        description,
        provider,
        expirationHours,
        metadata
      );
      return PaymentView.fromDomain(payment);
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }
}
