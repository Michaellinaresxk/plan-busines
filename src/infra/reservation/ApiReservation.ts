import type { Timestamp } from 'firebase/firestore';

// Tipo que representa exactamente lo que viene de Firebase
export type ApiReservation = {
  bookingId: string;
  serviceId: string;
  serviceName: string;
  bookingDate: Timestamp; // Firebase Timestamp
  status: string;
  totalPrice: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  formData: Record<string, any>; // Objeto dinámico con propiedades específicas
  notes?: string;
};

// Tipo para crear nuevas reservas (sin bookingId ya que Firestore lo genera)
export type CreateReservationData = {
  serviceId: string;
  serviceName: string;
  totalPrice: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  formData: Record<string, any>;
  notes?: string;
};

// Tipo para actualizar reservas
export type UpdateReservationData = {
  status?: string;
  totalPrice?: number;
  notes?: string;
  formData?: Record<string, any>;
};
