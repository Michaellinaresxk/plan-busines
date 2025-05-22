import { ReservationResource } from '@/infra/reservation/RervationResource';
import type { UseCase } from '@/primary/UseCase';
import { ReservationView } from '@/views/ReservationView';

export class UpdateReservationNotesUseCase implements UseCase {
  constructor(private reservationResource: ReservationResource) {}

  async execute(bookingId: string, notes: string): Promise<ReservationView> {
    try {
      const reservation = await this.reservationResource.updateReservationNotes(bookingId, notes);
      return ReservationView.fromDomain(reservation);
    } catch (error) {
      console.error(`Error updating reservation notes ${bookingId}:`, error);
      throw error;
    }
  }
}
