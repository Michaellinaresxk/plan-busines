import { ReservationResource } from '@/infra/reservation/RervationResource';
import { GetAllReservationsUseCase } from './GetAllReservationsUseCase';
import { GetReservationByIdUseCase } from './GetReservationByIdUseCase';
import { ApproveReservationUseCase } from './ApproveReservationUseCase';
import { CompleteReservationUseCase } from './CompleteReservationUseCase';
import { UpdateReservationNotesUseCase } from './UpdateReservationNotesUseCase';
import { UpdateReservationPriceUseCase } from './UpdateReservationPriceUseCase';
import { GetReservationStatsUseCase } from './GetReservationStatsUseCase';
import { GetPendingReservationsUseCase } from './GetPendingReservationsUseCase';

import { UpdateReservationStatusUseCase } from './UpdateReservationStatusUseCase';
import { RejectReservationUseCase } from './RejectReservationUseCase';
import { GetApprovedReservationsUseCase } from './GetApprovedReservationsUseCase';
import { ReservationView } from '@/views/ReservationView';

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

  private updateReservationStatusUseCase: UpdateReservationStatusUseCase;
  private rejectReservationUseCase: RejectReservationUseCase;
  private getApprovedReservationsUseCase: GetApprovedReservationsUseCase;

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

    this.updateReservationStatusUseCase = new UpdateReservationStatusUseCase(reservationResource);
    this.rejectReservationUseCase = new RejectReservationUseCase(reservationResource);
    this.getApprovedReservationsUseCase = new GetApprovedReservationsUseCase(reservationResource);
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

  /**
   * 🎯 MÉTODO PRINCIPAL: Actualizar estado de reserva
   * Este es el método que necesita SupplierConfirmationView
   */
  async updateReservationStatus(bookingId: string, status: string) {
    console.log('🔧 ReservationService.updateReservationStatus called:', { bookingId, status });

    try {
      // ✅ VERIFICAR QUE TENEMOS EL RESOURCE
      if (!this.reservationResource) {
        console.error('❌ reservationResource is null/undefined');
        throw new Error('ReservationResource no está disponible');
      }

      // ✅ VERIFICAR QUE EL MÉTODO EXISTE EN EL RESOURCE
      if (typeof this.reservationResource.updateReservationStatus !== 'function') {
        console.error('❌ updateReservationStatus method does not exist on reservationResource');
        console.log('🔍 Available methods:', Object.getOwnPropertyNames(this.reservationResource));
        throw new Error('Método updateReservationStatus no existe en ReservationResource');
      }

      console.log('✅ Calling reservationResource.updateReservationStatus...');

      const reservation = await this.reservationResource.updateReservationStatus(bookingId, status);

      console.log('✅ ReservationResource.updateReservationStatus completed:', reservation);

      // Convertir a ReservationView
      const reservationView = ReservationView.fromDomain(reservation);

      console.log('✅ Converted to ReservationView:', reservationView);

      return reservationView;
    } catch (error) {
      console.error('❌ Error in ReservationService.updateReservationStatus:', error);
      throw error;
    }
  }

  /**
   * ❌ Rechazar reserva (cuando proveedor declina)
   */
  async rejectReservation(bookingId: string) {
    console.log('❌ ReservationService.rejectReservation called:', bookingId);
    return await this.updateReservationStatus(bookingId, 'rejected');
  }

  async getApprovedReservations() {
    console.log('📋 ReservationService.getApprovedReservations called');

    try {
      const reservations = await this.reservationResource.getReservationsByStatus('approved');
      return reservations.map(reservation => ReservationView.fromDomain(reservation));
    } catch (error) {
      console.error('❌ Error getting approved reservations:', error);
      throw error;
    }
  }

  /**
   * 🔄 Actualizar reserva con información del proveedor
   * Para cuando el proveedor acepta y necesitamos guardar sus datos
   */
  async updateReservationWithSupplierInfo(
    bookingId: string,
    supplierData: {
      supplierId: string;
      supplierName: string;
      supplierPhone: string;
      supplierEmail: string;
      confirmationMessage?: string;
      estimatedArrival?: string;
      confirmedAt: string;
    }
  ) {
    // Primero actualizamos el estado a APPROVED
    await this.updateReservationStatus(bookingId, ReservationStatus.APPROVED);

    // Luego agregamos la información del proveedor a las notas o formData
    const reservation = await this.getReservationById(bookingId);
    const updatedFormData = {
      ...reservation.formData,
      assignedSupplier: supplierData
    };

    // Aquí necesitarías un método para actualizar formData
    // Por ahora usamos notes como alternativa
    const supplierNotes = `PROVEEDOR ASIGNADO: ${supplierData.supplierName} - ${supplierData.supplierPhone}. ${supplierData.confirmationMessage || ''}`;

    return await this.updateReservationNotes(bookingId, supplierNotes);
  }
}
