import { PaymentResource } from '@/infra/payment/PaymentResource';
import { PaymentStatus } from '@/domain/payment/Payment';
import type { UseCase } from '@/primary/UseCase';
import { PaymentView } from '@/views/PaymentView';

export class UpdatePaymentStatusUseCase implements UseCase {
  constructor(private paymentResource: PaymentResource) {}

  async execute(paymentId: string, status: PaymentStatus): Promise<PaymentView> {
    try {
      const payment = await this.paymentResource.updatePaymentStatus(paymentId, status);
      return PaymentView.fromDomain(payment);
    } catch (error) {
      console.error(`Error updating payment ${paymentId} status:`, error);
      throw error;
    }
  }
}
