import type Reservation from './Reservation';
import type { ReservationStatus } from '@/types/reservation';

export default interface ReservationRepository {
  getAllReservations(): Promise<Reservation[]>;
  getReservationsByStatus(status: ReservationStatus): Promise<Reservation[]>;
  getPendingReservations(): Promise<Reservation[]>;
  getReservationById(bookingId: string): Promise<Reservation>;
  createReservation(
    serviceId: string,
    serviceName: string,
    totalPrice: number,
    clientName: string,
    clientEmail: string,
    clientPhone: string,
    formData: Record<string, any>,
    hostInfo: string,
    notes?: string
  ): Promise<Reservation>;
  updateReservationStatus(bookingId: string, status: ReservationStatus): Promise<Reservation>;
  updateReservationNotes(bookingId: string, notes: string): Promise<Reservation>;
  updateReservationPrice(bookingId: string, totalPrice: number): Promise<Reservation>;
  deleteReservation(bookingId: string): Promise<void>;
  approveReservation(bookingId: string): Promise<Reservation>;
  completeReservation(bookingId: string): Promise<Reservation>;
  cancelReservation(bookingId: string): Promise<Reservation>;
  getReservationsByService(serviceId: string): Promise<Reservation[]>;
  getReservationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
    cancelled: number;
  }>;
}
