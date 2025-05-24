import { ReservationResource } from '@/infra/reservation/RervationResource';
import { GetAllReservationsUseCase } from './GetAllReservationsUseCase';
import { GetReservationByIdUseCase } from './GetReservationByIdUseCase';
import { ApproveReservationUseCase } from './ApproveReservationUseCase';
import { CompleteReservationUseCase } from './CompleteReservationUseCase';
import { UpdateReservationNotesUseCase } from './UpdateReservationNotesUseCase';
import { UpdateReservationPriceUseCase } from './UpdateReservationPriceUseCase';
import { GetReservationStatsUseCase } from './GetReservationStatsUseCase';
import { GetPendingReservationsUseCase } from './GetPendingReservationsUseCase';

export class ReservationService {
  // Use Cases
  private getAllReservationsUseCase: GetAllReservationsUseCase;
  private getReservationByIdUseCase: GetReservationByIdUseCase;
  private approveReservationUseCase: ApproveReservationUseCase;
  private completeReservationUseCase: CompleteReservationUseCase;
  private updateReservationNotesUseCase: UpdateReservationNotesUseCase;
  private updateReservationPriceUseCase: UpdateReservationPriceUseCase;
  private getReservationStatsUseCase: GetReservationStatsUseCase;
  private getPendingReservationsUseCase: GetPendingReservationsUseCase;

  constructor(private readonly reservationResource: ReservationResource) {
    // Inicializar todos los use cases
    this.getAllReservationsUseCase = new GetAllReservationsUseCase(reservationResource);
    this.getReservationByIdUseCase = new GetReservationByIdUseCase(reservationResource);
    this.approveReservationUseCase = new ApproveReservationUseCase(reservationResource);
    this.completeReservationUseCase = new CompleteReservationUseCase(reservationResource);
    this.updateReservationNotesUseCase = new UpdateReservationNotesUseCase(reservationResource);
    this.updateReservationPriceUseCase = new UpdateReservationPriceUseCase(reservationResource);
    this.getPendingReservationsUseCase = new GetPendingReservationsUseCase(reservationResource);
    this.getReservationStatsUseCase = new GetReservationStatsUseCase(reservationResource);
  }

  // Métodos públicos que delegan a los use cases

  async getAllReservations() {
    return await this.getAllReservationsUseCase.execute();
  }

  async getPendingReservations() {
    return await this.getPendingReservationsUseCase.execute();
  }

  async getReservationById(bookingId: string) {
    return await this.getReservationByIdUseCase.execute(bookingId);
  }

  async approveReservation(bookingId: string) {
    return await this.approveReservationUseCase.execute(bookingId);
  }

  async completeReservation(bookingId: string) {
    return await this.completeReservationUseCase.execute(bookingId);
  }

  async updateReservationNotes(bookingId: string, notes: string) {
    return await this.updateReservationNotesUseCase.execute(bookingId, notes);
  }

  async updateReservationPrice(bookingId: string, totalPrice: number) {
    return await this.updateReservationPriceUseCase.execute(bookingId, totalPrice);
  }

  async getReservationStats() {
    return await this.getReservationStatsUseCase.execute();
  }
}
