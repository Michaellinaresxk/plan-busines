import { ReservationResource } from '@/infra/reservation/RervationResource';
import type { UseCase } from '@/primary/UseCase';
import { ReservationView } from '@/views/ReservationView';

export class ApproveReservationUseCase implements UseCase {
  constructor(private reservationResource: ReservationResource) {}

  async execute(bookingId: string): Promise<ReservationView> {
    try {
      const reservation = await this.reservationResource.approveReservation(bookingId);
      return ReservationView.fromDomain(reservation);
    } catch (error) {
      console.error(`Error approving reservation ${bookingId}:`, error);
      throw error;
    }
  }
}
