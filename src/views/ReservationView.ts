import type Reservation from '@/domain/reservation/Reservation';

export class ReservationView {
  private constructor(
    public readonly bookingId: string,
    public readonly serviceId: string,
    public readonly serviceName: string,
    public readonly bookingDate: Date,
    public readonly status: string,
    public readonly totalPrice: number,
    public readonly clientName: string,
    public readonly clientEmail: string,
    public readonly clientPhone: string,
    public readonly formData: Record<string, any>,
    public readonly notes?: string,
    public readonly timeAgo?: string,
    // Propiedades computadas para la UI
    public readonly isPriority?: boolean,
    public readonly isNewClient?: boolean,
    public readonly serviceDate?: string,
    public readonly serviceTime?: string,
    // ✅ NUEVO: Estado del email
    public readonly emailStatus?: 'pending' | 'sent' | 'failed' | 'delivered' | 'opened'
  ) {}

  static fromDomain(reservation: Reservation): ReservationView {
    return new ReservationView(
      reservation.bookingId,
      reservation.serviceId,
      reservation.serviceName,
      reservation.bookingDate,
      reservation.status,
      reservation.totalPrice,
      reservation.clientName,
      reservation.clientEmail,
      reservation.clientPhone,
      reservation.formData,
      reservation.notes,
      reservation.timeAgo,
      reservation.isPriority,
      reservation.isNewClient,
      reservation.serviceDate,
      reservation.serviceTime,
      reservation.emailStatus // ✅ NUEVO CAMPO
    );
  }
}