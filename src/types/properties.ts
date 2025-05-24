export type UserProperties = {
  id: string;
  name: string;
  email: string;
};

export type ReservationProperties = {
  bookingId: string;
  serviceId: string;
  serviceName: string;
  bookingDate: Date;
  status: string;
  totalPrice: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  formData: Record<string, any>; // Objeto dinámico con propiedades específicas por servicio
  notes?: string;
};

export type SupplierProperties = {
  id: string;
  name: string;
  cedula: string;
  email: string;
  phone: string;
  service: string;
  canProvideService: boolean;
};
