// src/views/ReservationView.ts - UPDATED VERSION
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
    // Estado del email
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
      reservation.formData || {},
      reservation.notes,
      reservation.timeAgo,
      reservation.isPriority,
      reservation.isNewClient,
      reservation.serviceDate,
      reservation.serviceTime,
      reservation.emailStatus || 'pending'
    );
  }

  // ✅ GETTERS PARA COMPATIBILIDAD CON CÓDIGO EXISTENTE

  /**
   * 📅 Obtener fecha del servicio formateada
   */
  get date(): string {
    if (this.serviceDate) return this.serviceDate;
    if (this.formData?.date) return this.formData.date;

    return this.bookingDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * 🕐 Obtener hora del servicio
   */
  get time(): string {
    if (this.serviceTime) return this.serviceTime;

    const { formData } = this;
    return (
      formData?.time ||
      formData?.startTime ||
      formData?.hour ||
      (formData?.startTime && formData?.endTime
        ? `${formData.startTime} - ${formData.endTime}`
        : 'Por confirmar')
    );
  }

  /**
   * 📍 Obtener ubicación
   */
  get location(): string | undefined {
    return (
      this.formData?.location ||
      this.formData?.exactAddress ||
      this.formData?.deliveryAddress
    );
  }

  // ✅ GETTERS ESPECÍFICOS POR TIPO DE SERVICIO

  // Airport Transfer
  get flightNumber(): string | undefined {
    return this.formData?.flightNumber;
  }

  get vehicleType(): string | undefined {
    return this.formData?.vehicleType;
  }

  get passengerCount(): number | undefined {
    return this.formData?.passengerCount;
  }

  get needsCarSeat(): boolean | undefined {
    return this.formData?.needsCarSeat;
  }

  get carSeatCount(): number | undefined {
    return this.formData?.carSeatCount;
  }

  get isRoundTrip(): boolean | undefined {
    return this.formData?.isRoundTrip;
  }

  // Babysitter
  get childrenCount(): number | undefined {
    return this.formData?.childrenCount;
  }

  get childrenAges(): string[] | undefined {
    return this.formData?.childrenAges;
  }

  get startTime(): string | undefined {
    return this.formData?.startTime;
  }

  get endTime(): string | undefined {
    return this.formData?.endTime;
  }

  get specialNeedsDetails(): string | undefined {
    return this.formData?.specialNeedsDetails;
  }

  // Custom Decoration
  get occasion(): string | undefined {
    return this.formData?.occasion;
  }

  get colors(): string[] | undefined {
    return this.formData?.colors;
  }

  get referenceImage(): string | undefined {
    return this.formData?.referenceImage;
  }

  get exactAddress(): string | undefined {
    return this.formData?.exactAddress;
  }

  // Grocery Shopping
  get deliveryAddress(): string | undefined {
    return this.formData?.deliveryAddress;
  }

  get items(): any[] | undefined {
    return this.formData?.items;
  }

  get hasAllergies(): string | undefined {
    return this.formData?.hasAllergies;
  }

  get allergyDetails(): string | undefined {
    return this.formData?.allergyDetails;
  }

  get foodRestrictions(): string | undefined {
    return this.formData?.foodRestrictions;
  }

  // ✅ MÉTODOS UTILITARIOS

  /**
   * 🔍 Verificar si la reserva tiene un campo específico
   */
  hasField(fieldName: string): boolean {
    return fieldName in this.formData && this.formData[fieldName] !== undefined;
  }

  /**
   * 📋 Obtener resumen de información específica del servicio
   */
  getServiceSpecificSummary(): string {
    switch (this.serviceId) {
      case 'airport-transfer':
        const flight = this.flightNumber ? `Vuelo: ${this.flightNumber}` : '';
        const vehicle = this.vehicleType ? `Vehículo: ${this.vehicleType}` : '';
        return [flight, vehicle].filter(Boolean).join(' • ');

      case 'babysitter':
        const children = this.childrenCount ? `${this.childrenCount} niños` : '';
        const ages = this.childrenAges ? `Edades: ${this.childrenAges.join(', ')}` : '';
        return [children, ages].filter(Boolean).join(' • ');

      case 'custom-decoration':
        const occ = this.occasion ? `Ocasión: ${this.occasion}` : '';
        const cols = this.colors ? `Colores: ${this.colors.join(', ')}` : '';
        return [occ, cols].filter(Boolean).join(' • ');

      case 'grocery-shopping':
        const addr = this.deliveryAddress ? `Entrega: ${this.deliveryAddress}` : '';
        const itemCount = this.items ? `${this.items.length} items` : '';
        return [addr, itemCount].filter(Boolean).join(' • ');

      default:
        return '';
    }
  }

  /**
   * 📊 Obtener datos completos para debugging
   */
  toDebugObject(): Record<string, any> {
    return {
      bookingId: this.bookingId,
      serviceId: this.serviceId,
      serviceName: this.serviceName,
      clientName: this.clientName,
      clientEmail: this.clientEmail,
      totalPrice: this.totalPrice,
      status: this.status,
      date: this.date,
      time: this.time,
      location: this.location,
      formData: this.formData,
      emailStatus: this.emailStatus
    };
  }

  /**
   * ✅ Validar que la reserva tiene todos los datos mínimos necesarios
   */
  isValid(): boolean {
    return !!(
      this.bookingId &&
      this.clientName &&
      this.clientEmail &&
      this.serviceName &&
      this.totalPrice > 0 &&
      this.formData
    );
  }
}
