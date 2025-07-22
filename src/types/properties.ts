import type { ReservationStatus } from './reservation';

export interface UserProperties {
  id: string;
  name: string;
  email: string;
}

export interface ReservationProperties {
  bookingId: string;
  serviceId: string;
  serviceName: string;
  bookingDate: Date;
  status: ReservationStatus;
  totalPrice: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  formData: Record<string, any>;
  notes?: string;
}
export type SupplierProperties = {
  id: string;
  name: string;
  cedula: string;
  email: string;
  phone: string;
  service: string;
  canProvideService: boolean;
  vehicleType?: string;
};


export interface EmailProperties {
  id: string;
  to: string;
  subject: string;
  templateType: string;
  status: string;
  sentAt: Date;
  reservationId?: string;
  messageId?: string;
  error?: string;
  deliveredAt?: Date;
  openedAt?: Date;
}
