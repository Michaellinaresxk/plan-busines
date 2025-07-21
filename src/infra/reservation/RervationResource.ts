import type ReservationRepository from '@/domain/reservation/ReservationRepository';
import { ReservationStatus } from '@/types/reservation';;
import { ReservationCaller } from './ReservationCaller';
import type { ApiReservation } from './ApiReservation';
import type Reservation from '@/domain/reservation/Reservation';

export class ReservationResource implements ReservationRepository {
  constructor(private readonly reservationCaller: ReservationCaller) {}
  createReservation(serviceId: string, serviceName: string, totalPrice: number, clientName: string, clientEmail: string, clientPhone: string, formData: Record<string, any>, notes?: string): Promise<Reservation> {
    throw new Error('Method not implemented.');
  }
  deleteReservation(bookingId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  cancelReservation(bookingId: string): Promise<Reservation> {
    throw new Error('Method not implemented.');
  }

  // Convertir ApiReservation a Reservation (Domain Entity)
  private apiToDomain(apiReservation: ApiReservation): Reservation {
    return Reservation.fromProperties({
      bookingId: apiReservation.bookingId,
      serviceId: apiReservation.serviceId,
      serviceName: apiReservation.serviceName,
      bookingDate: apiReservation.bookingDate.toDate(), // Convertir Timestamp a Date
      status: apiReservation.status,
      totalPrice: apiReservation.totalPrice,
      clientName: apiReservation.clientName,
      clientEmail: apiReservation.clientEmail,
      clientPhone: apiReservation.clientPhone,
      formData: apiReservation.formData,
      notes: apiReservation.notes
    });
  }

  // Obtener todas las reservas
  async getAllReservations(): Promise<Reservation[]> {
    const apiReservations = await this.reservationCaller.getAllReservations();
    return apiReservations.map(this.apiToDomain);
  }

  async getPendingReservations(): Promise<Reservation[]> {
    return this.getReservationsByStatus(ReservationStatus.PENDING);
  }

  // Obtener reservas por estado
  async getReservationsByStatus(status: string): Promise<Reservation[]> {
    console.log('📋 ReservationResource.getReservationsByStatus called:', status);

    try {
      const apiReservations = await this.reservationCaller.getReservationsByStatus(status);
      const domainReservations = apiReservations.map(this.apiToDomain.bind(this));

      console.log(`✅ Found ${domainReservations.length} reservations with status ${status}`);
      return domainReservations;
    } catch (error) {
      console.error(`❌ Error getting reservations by status ${status}:`, error);
      throw error;
    }
  }

  // Obtener una reserva por ID
  async getReservationById(bookingId: string): Promise<Reservation> {
    const apiReservation = await this.reservationCaller.getReservationById(bookingId);

    if (!apiReservation) {
      throw new Error(`Reservation with ID ${bookingId} not found`);
    }

    return this.apiToDomain(apiReservation);
  }

  // Actualizar estado de reserva
  async updateReservationStatus(bookingId: string, status: string): Promise<Reservation> {
    console.log('🔧 ReservationResource.updateReservationStatus called:', { bookingId, status });

    try {
      // ✅ VERIFICAR QUE TENEMOS EL CALLER
      if (!this.reservationCaller) {
        console.error('❌ reservationCaller is null/undefined');
        throw new Error('ReservationCaller no está disponible');
      }

      // ✅ VERIFICAR QUE EL MÉTODO EXISTE EN EL CALLER
      if (typeof this.reservationCaller.updateReservationStatus !== 'function') {
        console.error('❌ updateReservationStatus method does not exist on reservationCaller');
        console.log('🔍 Available methods:', Object.getOwnPropertyNames(this.reservationCaller));
        throw new Error('Método updateReservationStatus no existe en ReservationCaller');
      }

      console.log('✅ Calling reservationCaller.updateReservationStatus...');

      const apiReservation = await this.reservationCaller.updateReservationStatus(
        bookingId,
        status
      );

      console.log('✅ ReservationCaller.updateReservationStatus completed:', apiReservation);

      if (!apiReservation) {
        throw new Error(`Failed to update reservation ${bookingId} - no response from caller`);
      }

      // Convertir ApiReservation a Reservation (Domain Entity)
      const domainReservation = this.apiToDomain(apiReservation);

      console.log('✅ Converted to domain reservation:', domainReservation);

      return domainReservation;
    } catch (error) {
      console.error('❌ Error in ReservationResource.updateReservationStatus:', error);
      throw error;
    }
  }

  // Actualizar notas de reserva
  async updateReservationNotes(bookingId: string, notes: string): Promise<Reservation> {
    const apiReservation = await this.reservationCaller.updateReservationNotes(bookingId, notes);
    return this.apiToDomain(apiReservation);
  }

  // Actualizar precio de reserva
  async updateReservationPrice(bookingId: string, totalPrice: number): Promise<Reservation> {
    const apiReservation = await this.reservationCaller.updateReservationPrice(
      bookingId,
      totalPrice
    );
    return this.apiToDomain(apiReservation);
  }

  // Aprobar reserva
  async approveReservation(bookingId: string): Promise<Reservation> {
    return this.updateReservationStatus(bookingId, ReservationStatus.APPROVED);
  }

  // Completar reserva
  async completeReservation(bookingId: string): Promise<Reservation> {
    return this.updateReservationStatus(bookingId, ReservationStatus.COMPLETED);
  }

  // Filtrar reservas por servicio
  async getReservationsByService(serviceId: string): Promise<Reservation[]> {
    const apiReservations = await this.reservationCaller.getReservationsByService(serviceId);
    return apiReservations.map(this.apiToDomain);
  }

  // Filtrar reservas por cliente
  async getReservationsByClient(clientEmail: string): Promise<Reservation[]> {
    const apiReservations = await this.reservationCaller.getReservationsByClient(clientEmail);
    return apiReservations.map(this.apiToDomain);
  }

  // Obtener estadísticas básicas
  async getReservationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
    cancelled: number;
  }> {
    return await this.reservationCaller.getReservationStats();
  }
}
