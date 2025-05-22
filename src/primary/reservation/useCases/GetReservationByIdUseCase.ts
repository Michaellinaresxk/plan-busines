import { ReservationResource } from '@/infra/reservation/RervationResource';
import type { UseCase } from '@/primary/UseCase';
import { ReservationView } from '@/views/ReservationView';

export class GetReservationByIdUseCase implements UseCase {
  constructor(private reservationResource: ReservationResource) {}

  async execute(bookingId: string): Promise<ReservationView> {
    try {
      const reservation = await this.reservationResource.getReservationById(bookingId);
      return ReservationView.fromDomain(reservation);
    } catch (error) {
      console.error(`Error getting reservation ${bookingId}:`, error);
      throw error;
    }
  }
}
