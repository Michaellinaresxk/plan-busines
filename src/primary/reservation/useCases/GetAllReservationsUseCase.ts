import { ReservationResource } from '@/infra/reservation/RervationResource';
import type { UseCase } from '@/primary/UseCase';
import { ReservationView } from '@/views/ReservationView';

export class GetAllReservationsUseCase implements UseCase {
  constructor(private reservationResource: ReservationResource) {}

  async execute(): Promise<ReservationView[]> {
    try {
      const reservations = await this.reservationResource.getAllReservations();
      return reservations.map(reservation => ReservationView.fromDomain(reservation));
    } catch (error) {
      console.error('Error getting all reservations:', error);
      throw error;
    }
  }
}
