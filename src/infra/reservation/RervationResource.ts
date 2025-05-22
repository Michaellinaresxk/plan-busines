import type ReservationRepository from '@/domain/reservation/ReservationRepository';
import type { ReservationStatus } from '@/types/reservation';
import { Reservation } from '@/domain/reservation/Reservation';
import { ReservationCaller } from './ReservationCaller';
import type { ApiReservation } from './ApiReservation';

export class ReservationResource implements ReservationRepository {
  constructor(private readonly reservationCaller: ReservationCaller) {}

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

  // Obtener reservas por estado
  async getReservationsByStatus(status: ReservationStatus): Promise<Reservation[]> {
    const apiReservations = await this.reservationCaller.getReservationsByStatus(status);
    return apiReservations.map(this.apiToDomain);
  }

  // Obtener reservas pendientes
  async getPendingReservations(): Promise<Reservation[]> {
    return this.getReservationsByStatus(ReservationStatus.PENDING);
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
  async updateReservationStatus(
    bookingId: string,
    status: ReservationStatus
  ): Promise<Reservation> {
    const apiReservation = await this.reservationCaller.updateReservationStatus(bookingId, status);
    return this.apiToDomain(apiReservation);
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
