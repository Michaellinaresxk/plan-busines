// ✅ /src/domain/reservation/Reservation.ts
 class Reservation {
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
    public readonly isPriority?: boolean,
    public readonly isNewClient?: boolean,
    public readonly serviceDate?: string,
    public readonly serviceTime?: string,
    // ✅ NUEVO: Estado del email
    public readonly emailStatus?: 'pending' | 'sent' | 'failed' | 'delivered' | 'opened'
  ) {}

  // ✅ Factory method para crear una nueva reserva
  static create(
    bookingId: string,
    serviceId: string,
    serviceName: string,
    bookingDate: Date,
    status: string,
    totalPrice: number,
    clientName: string,
    clientEmail: string,
    clientPhone: string,
    formData: Record<string, any>,
    notes?: string
  ): Reservation {
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
      formData,
      notes,
      undefined, // timeAgo se calculará después
      false, // isPriority
      false, // isNewClient
      undefined, // serviceDate
      undefined, // serviceTime
      'pending' // ✅ Estado inicial del email
    );
  }

  // ✅ Factory method desde properties (para Firebase)
  static fromProperties(properties: any): Reservation {
    return new Reservation(
      properties.bookingId,
      properties.serviceId,
      properties.serviceName,
      new Date(properties.bookingDate),
      properties.status,
      properties.totalPrice,
      properties.clientName,
      properties.clientEmail,
      properties.clientPhone,
      properties.formData || {},
      properties.notes,
      properties.timeAgo,
      properties.isPriority,
      properties.isNewClient,
      properties.serviceDate,
      properties.serviceTime,
      properties.emailStatus || 'pending'
    );
  }
}

export default Reservation;