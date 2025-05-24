import { ReservationResource } from '@/infra/reservation/RervationResource';
import type { UseCase } from '@/primary/UseCase';
import { ReservationView } from '@/views/ReservationView';

export class GetPendingReservationsUseCase implements UseCase {
  constructor(private reservationResource: ReservationResource) {}

  async execute(): Promise<ReservationView[]> {
    try {
      const reservations = await this.reservationResource.getPendingReservations();
      return reservations.map(reservation => ReservationView.fromDomain(reservation));
    } catch (error) {
      console.error('Error getting pending reservations:', error);
      throw error;
    }
  }
}
