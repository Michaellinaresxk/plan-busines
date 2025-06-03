// ✅ src/primary/reservation/useCases/RejectReservationUseCase.ts
import { ReservationResource } from '@/infra/reservation/RervationResource';
import { ReservationStatus } from '@/types/reservation';
import type { UseCase } from '@/primary/UseCase';
import { ReservationView } from '@/views/ReservationView';

export class RejectReservationUseCase implements UseCase {
  constructor(private reservationResource: ReservationResource) {}

  async execute(bookingId: string): Promise<ReservationView> {
    try {
      console.log(`❌ Rejecting reservation ${bookingId}`);

      const reservation = await this.reservationResource.updateReservationStatus(
        bookingId,
        ReservationStatus.REJECTED
      );

      console.log(`✅ Reservation ${bookingId} rejected successfully`);
      return ReservationView.fromDomain(reservation);
    } catch (error) {
      console.error(`❌ Error rejecting reservation ${bookingId}:`, error);
      throw error;
    }
  }
}
