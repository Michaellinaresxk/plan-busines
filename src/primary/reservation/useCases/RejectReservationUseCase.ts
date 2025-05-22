import { ReservationResource } from '@/infra/reservation/RervationResource';
import type { UseCase } from '@/primary/UseCase';
import { ReservationView } from '@/views/ReservationView';

export class RejectReservationUseCase implements UseCase {
  constructor(private reservationResource: ReservationResource) {}

  async execute(bookingId: string): Promise<ReservationView> {
    try {
      const reservation = await this.reservationResource.rejectReservation(bookingId);
      return ReservationView.fromDomain(reservation);
    } catch (error) {
      console.error(`Error rejecting reservation ${bookingId}:`, error);
      throw error;
    }
  }
}
