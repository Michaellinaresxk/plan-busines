import { PaymentResource } from '@/infra/payment/PaymentResource';
import type { UseCase } from '@/primary/UseCase';
import { PaymentView } from '@/views/PaymentView';

export class UpdatePaymentUrlUseCase implements UseCase {
  constructor(private paymentResource: PaymentResource) {}

  async execute(
    paymentId: string,
    paymentUrl: string,
    providerPaymentId?: string
  ): Promise<PaymentView> {
    try {
      const payment = await this.paymentResource.updatePaymentUrl(
        paymentId,
        paymentUrl,
        providerPaymentId
      );
      return PaymentView.fromDomain(payment);
    } catch (error) {
      console.error(`Error updating payment ${paymentId} URL:`, error);
      throw error;
    }
  }
}
