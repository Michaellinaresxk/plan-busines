// ✅ src/primary/reservation/useCases/UpdateReservationStatusUseCase.ts
import { ReservationResource } from '@/infra/reservation/RervationResource';
import { ReservationStatus } from '@/types/reservation';
import type { UseCase } from '@/primary/UseCase';
import { ReservationView } from '@/views/ReservationView';

export class UpdateReservationStatusUseCase implements UseCase {
  constructor(private reservationResource: ReservationResource) {}

  async execute(bookingId: string, status: ReservationStatus): Promise<ReservationView> {
    try {
      console.log(`🔄 Updating reservation ${bookingId} status to: ${status}`);

      const reservation = await this.reservationResource.updateReservationStatus(bookingId, status);

      console.log(`✅ Reservation ${bookingId} status updated successfully`);
      return ReservationView.fromDomain(reservation);
    } catch (error) {
      console.error(`❌ Error updating reservation ${bookingId} status:`, error);
      throw error;
    }
  }
}
