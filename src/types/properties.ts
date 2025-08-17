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
  hostInfo: string;
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

export interface PaymentProperties {
  id: string;
  reservationId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  paymentUrl: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  customerEmail: string;
  customerName: string;
  description: string;
  metadata: Record<string, any>;
  providerPaymentId?: string;
  completedAt?: Date;
  failureReason?: string;
  refundedAt?: Date;
  refundAmount?: number;
  webhookData?: Record<string, any>;
}

export interface ServiceProperties {
  id: string;
  title: string;
  category: string;
  basePrice: number;
  currency: string;
  description?: string;
  isActive: boolean;
  variants?: ServiceVariant[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceVariant {
  id: string;
  name: string;
  price: number;
  description?: string;
  isAvailable: boolean;
  maxCapacity?: number;
  features?: string[];
  imageUrl?: string;
}
