import { ReservationResource } from '@/infra/reservation/RervationResource';
import type { UseCase } from '@/primary/UseCase';

export class GetReservationStatsUseCase implements UseCase {
  constructor(private reservationResource: ReservationResource) {}

  async execute(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
    cancelled: number;
  }> {
    try {
      return await this.reservationResource.getReservationStats();
    } catch (error) {
      console.error('Error getting reservation stats:', error);
      throw error;
    }
  }
}
