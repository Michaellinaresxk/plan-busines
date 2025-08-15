import { PaymentResource } from '@/infra/payment/PaymentResource';
import type { UseCase } from '@/primary/UseCase';

export class GetPaymentStatsUseCase implements UseCase {
  constructor(private paymentResource: PaymentResource) {}

  async execute(): Promise<{
    total: number;
    pending: number;
    completed: number;
    failed: number;
    expired: number;
    totalAmount: number;
    completedAmount: number;
  }> {
    try {
      return await this.paymentResource.getPaymentStats();
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw error;
    }
  }
}
