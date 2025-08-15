// src/types/email.ts - TIPOS ACTUALIZADOS CON PAYMENT LINK

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  templateUsed?: string;
  htmlGenerated?: boolean;
  warning?: string;
  fallbackError?: string;
}

// ✅ ACTUALIZADO: ReservationEmailData con paymentLink
export interface ReservationEmailData {
  // Información básica del cliente
  clientEmail: string;
  clientName: string;

  // Información del servicio
  serviceName: string;
  serviceDate: string;
  serviceTime?: string;
  location?: string;

  // Información de la reserva
  reservationId: string;
  totalPrice?: number;

  // ✅ NUEVO: Link de pago (opcional)
  paymentLink?: string;

  // Información del proveedor (opcional)
  supplierName?: string;
  supplierPhone?: string;

  // Detalles adicionales específicos del servicio (opcional)
  additionalDetails?: {
    formData?: Record<string, any>;
    notes?: string;
    specialRequests?: string[];
  };
}

// ✅ NUEVO: Tipo específico para datos de pago
export interface PaymentEmailData extends ReservationEmailData {
  paymentLink: string; // Required for payment emails
  expirationHours?: number;
  paymentDescription?: string;
}

// ✅ NUEVO: Tipo para diferentes tipos de email
export type EmailType =
  | 'reservation-confirmation'
  | 'payment-request'
  | 'payment-completed'
  | 'supplier-notification'
  | 'cancellation'
  | 'reminder';

// ✅ NUEVO: Template context para mejor typing
export interface EmailTemplateContext {
  // Datos básicos
  clientName: string;
  serviceName: string;
  serviceDate: string;
  serviceTime: string;
  location: string;
  reservationId: string;
  formattedPrice: string;
  totalPrice: string;
  year: number;

  // Payment data
  paymentLink: string;
  hasPaymentLink: boolean;
  noPaymentLink: boolean;

  // Supplier data
  supplierName: string;
  supplierPhone: string;
  hasSupplierInfo: boolean;
  showSupplierInfo: boolean;

  // Service details
  serviceDetails: string;
  hasServiceDetails: boolean;
  showServiceDetails: boolean;

  // Company info
  companyName: string;
  companyEmail: string;
}

// ✅ NUEVO: Configuración de email por tipo de servicio
export interface ServiceEmailConfig {
  serviceType: string;
  templateVariables: string[];
  requiredFields: string[];
  optionalFields: string[];
}

export const SERVICE_EMAIL_CONFIGS: Record<string, ServiceEmailConfig> = {
  'airport-transfer': {
    serviceType: 'airport-transfer',
    templateVariables: ['flightNumber', 'vehicleType', 'passengerCount', 'needsCarSeat'],
    requiredFields: ['clientName', 'clientEmail', 'serviceDate'],
    optionalFields: ['flightNumber', 'vehicleType', 'pickupAddress']
  },
  babysitter: {
    serviceType: 'babysitter',
    templateVariables: ['childrenCount', 'childrenAges', 'startTime', 'endTime'],
    requiredFields: ['clientName', 'clientEmail', 'serviceDate'],
    optionalFields: ['childrenCount', 'childrenAges', 'specialRequests']
  },
  'custom-decoration': {
    serviceType: 'custom-decoration',
    templateVariables: ['occasion', 'colors', 'style', 'venue'],
    requiredFields: ['clientName', 'clientEmail', 'serviceDate'],
    optionalFields: ['occasion', 'colors', 'decorationType']
  },
  'grocery-shopping': {
    serviceType: 'grocery-shopping',
    templateVariables: ['deliveryAddress', 'items', 'deliveryTime'],
    requiredFields: ['clientName', 'clientEmail', 'serviceDate'],
    optionalFields: ['deliveryAddress', 'specialInstructions', 'items']
  }
};
