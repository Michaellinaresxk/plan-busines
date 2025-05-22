import { ReservationResource } from '@/infra/reservation/RervationResource';
import type { UseCase } from '@/primary/UseCase';
import { ReservationView } from '@/views/ReservationView';

export class UpdateReservationPriceUseCase implements UseCase {
  constructor(private reservationResource: ReservationResource) {}

  async execute(bookingId: string, totalPrice: number): Promise<ReservationView> {
    try {
      const reservation = await this.reservationResource.updateReservationPrice(
        bookingId,
        totalPrice
      );
      return ReservationView.fromDomain(reservation);
    } catch (error) {
      console.error(`Error updating reservation price ${bookingId}:`, error);
      throw error;
    }
  }
}
