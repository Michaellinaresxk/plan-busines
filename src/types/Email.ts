export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  FAILED = 'failed'
}

export enum EmailTemplateType {
  RESERVATION_CONFIRMATION = 'reservation_confirmation',
  RESERVATION_UPDATED = 'reservation_updated',
  RESERVATION_CANCELLED = 'reservation_cancelled'
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ReservationEmailData {
  reservationId: string;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  serviceDate: string;
  serviceTime: string;
  totalPrice: number;
  location?: string;
  supplierName?: string;
  supplierPhone?: string;
  additionalDetails?: Record<string, any>;
}