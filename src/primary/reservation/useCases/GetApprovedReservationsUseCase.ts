// ✅ src/primary/reservation/useCases/GetApprovedReservationsUseCase.ts
import { ReservationResource } from '@/infra/reservation/RervationResource';
import { ReservationStatus } from '@/types/reservation';
import type { UseCase } from '@/primary/UseCase';
import { ReservationView } from '@/views/ReservationView';

export class GetApprovedReservationsUseCase implements UseCase {
  constructor(private reservationResource: ReservationResource) {}

  async execute(): Promise<ReservationView[]> {
    try {
      console.log('📋 Getting approved reservations...');

      const reservations = await this.reservationResource.getReservationsByStatus(
        ReservationStatus.APPROVED
      );

      const reservationViews = reservations.map(reservation =>
        ReservationView.fromDomain(reservation)
      );

      console.log(`✅ Found ${reservationViews.length} approved reservations`);
      return reservationViews;
    } catch (error) {
      console.error('❌ Error getting approved reservations:', error);
      throw error;
    }
  }
}
