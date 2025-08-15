import { PaymentResource } from '@/infra/payment/PaymentResource';
import type { UseCase } from '@/primary/UseCase';
import { PaymentView } from '@/views/PaymentView';

export class GetPaymentByIdUseCase implements UseCase {
  constructor(private paymentResource: PaymentResource) {}

  async execute(paymentId: string): Promise<PaymentView> {
    try {
      const payment = await this.paymentResource.getPaymentById(paymentId);
      return PaymentView.fromDomain(payment);
    } catch (error) {
      console.error(`Error getting payment ${paymentId}:`, error);
      throw error;
    }
  }
}
