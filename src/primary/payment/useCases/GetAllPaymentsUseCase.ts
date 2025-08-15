import { PaymentResource } from '@/infra/payment/PaymentResource';
import type { UseCase } from '@/primary/UseCase';
import { PaymentView } from '@/views/PaymentView';

export class GetAllPaymentsUseCase implements UseCase {
  constructor(private paymentResource: PaymentResource) {}

  async execute(): Promise<PaymentView[]> {
    try {
      const payments = await this.paymentResource.getAllPayments();
      return payments.map(payment => PaymentView.fromDomain(payment));
    } catch (error) {
      console.error('Error getting all payments:', error);
      throw error;
    }
  }
}
