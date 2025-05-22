import { ReservationStatus } from '@/types/reservation';
import type { ReservationProperties } from '@/types/properties';

export class Reservation {
  private constructor(
    public readonly bookingId: string,
    public readonly serviceId: string,
    public readonly serviceName: string,
    public readonly bookingDate: Date,
    public readonly status: ReservationStatus,
    public readonly totalPrice: number,
    public readonly clientName: string,
    public readonly clientEmail: string,
    public readonly clientPhone: string,
    public readonly formData: Record<string, any>, // Propiedades dinámicas por servicio
    public readonly notes?: string,
    public readonly timeAgo?: string
  ) {}

  static fromProperties(properties: ReservationProperties): Reservation {
    const {
      bookingId,
      serviceId,
      serviceName,
      bookingDate,
      status,
      totalPrice,
      clientName,
      clientEmail,
      clientPhone,
      formData,
      notes
    } = properties;

    // Calcular timeAgo basado en bookingDate
    const timeAgo = calculateTimeAgo(bookingDate);

    return new Reservation(
      bookingId,
      serviceId,
      serviceName,
      bookingDate,
      status,
      totalPrice,
      clientName,
      clientEmail,
      clientPhone,
      formData || {},
      notes,
      timeAgo
    );
  }

  get properties(): ReservationProperties {
    return Object.freeze({
      bookingId: this.bookingId,
      serviceId: this.serviceId,
      serviceName: this.serviceName,
      bookingDate: this.bookingDate,
      status: this.status,
      totalPrice: this.totalPrice,
      clientName: this.clientName,
      clientEmail: this.clientEmail,
      clientPhone: this.clientPhone,
      formData: this.formData,
      notes: this.notes
    });
  }

  // Métodos de negocio
  approve(): Reservation {
    return Reservation.fromProperties({
      ...this.properties,
      status: ReservationStatus.APPROVED
    });
  }

  reject(): Reservation {
    return Reservation.fromProperties({
      ...this.properties,
      status: ReservationStatus.REJECTED
    });
  }

  complete(): Reservation {
    return Reservation.fromProperties({
      ...this.properties,
      status: ReservationStatus.COMPLETED
    });
  }

  cancel(): Reservation {
    return Reservation.fromProperties({
      ...this.properties,
      status: ReservationStatus.CANCELLED
    });
  }

  updateNotes(notes: string): Reservation {
    return Reservation.fromProperties({
      ...this.properties,
      notes
    });
  }

  updatePrice(totalPrice: number): Reservation {
    return Reservation.fromProperties({
      ...this.properties,
      totalPrice
    });
  }

  // Getters para el estado
  isPending(): boolean {
    return this.status === ReservationStatus.PENDING;
  }

  isApproved(): boolean {
    return this.status === ReservationStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.status === ReservationStatus.REJECTED;
  }

  isCompleted(): boolean {
    return this.status === ReservationStatus.COMPLETED;
  }

  isCancelled(): boolean {
    return this.status === ReservationStatus.CANCELLED;
  }

  // Getter para verificar si es prioritario (basado en formData o lógica de negocio)
  get isPriority(): boolean {
    // Lógica para determinar prioridad - puede ser basada en:
    // - Precio alto
    // - Servicio específico
    // - Cliente VIP
    // - Fecha cercana
    return this.totalPrice > 200 || this.formData.priority === true;
  }

  // Getter para determinar si es cliente nuevo
  get isNewClient(): boolean {
    // Esta lógica podría venir del formData o ser calculada
    return this.formData.isNewClient === true;
  }

  // Getter para obtener la fecha del servicio (puede venir del formData)
  get serviceDate(): string {
    return this.formData.date || '';
  }

  // Getter para obtener la hora del servicio (puede venir del formData)
  get serviceTime(): string {
    return this.formData.time || '';
  }
}

// Función utilitaria para calcular tiempo transcurrido
function calculateTimeAgo(bookingDate: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - bookingDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'hace un momento';
  } else if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffInDays < 7) {
    return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
  } else {
    return bookingDate.toLocaleDateString('es-ES');
  }
}

export default Reservation;
