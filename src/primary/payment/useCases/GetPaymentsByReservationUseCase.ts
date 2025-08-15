import { PaymentResource } from '@/infra/payment/PaymentResource';
import type { UseCase } from '@/primary/UseCase';
import { PaymentView } from '@/views/PaymentView';

export class GetPaymentsByReservationUseCase implements UseCase {
  constructor(private paymentResource: PaymentResource) {}

  async execute(reservationId: string): Promise<PaymentView[]> {
    try {
      const payments = await this.paymentResource.getPaymentsByReservation(reservationId);
      return payments.map(payment => PaymentView.fromDomain(payment));
    } catch (error) {
      console.error(`Error getting payments for reservation ${reservationId}:`, error);
      throw error;
    }
  }
}
