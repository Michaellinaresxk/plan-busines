// src/types/supplierInquiry.ts

export enum InquiryStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export interface SupplierInquiry {
  id: string;
  reservationId: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  serviceId: string;
  serviceName: string;
  status: InquiryStatus;
  inquiryDate: Date;
  responseDate?: Date;
  expiresAt: Date;
  message: string;
  supplierResponse?: string;
  adminNotes?: string;
  // Datos de la reserva para contexto
  reservationData: {
    clientName: string;
    date: string;
    time: string;
    totalPrice: number;
    formData: Record<string, any>;
  };
}

export interface CreateInquiryData {
  reservationId: string;
  supplierId: string;
  message: string;
  expirationHours?: number; // Default 24 horas
}

export interface InquiryResponse {
  inquiryId: string;
  status: InquiryStatus.ACCEPTED | InquiryStatus.REJECTED;
  response: string;
  supplierNotes?: string;
}
