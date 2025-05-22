// src/types/Reservation.ts
export interface Reservation {
  id: number;
  clientName: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  timeAgo: string;
  isPriority: boolean;
}

export interface FilterOptions {
  service: string;
  status: string;
  sortBy: string;
}

export enum ReservationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Interfaz base para todas las reservas
export interface BaseReservation {
  id: string | number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  serviceId: string;
  serviceCategory: string;
  date: string;
  time: string;
  status: ReservationStatus;
  notes?: string;
  createdAt: Date | string;
  timeAgo: string;
  isPriority: boolean;
}

// Interfaz para reservas de transporte aeroportuario
export interface AirportTransferReservation extends BaseReservation {
  flightNumber: string;
  vehicleType: string;
  passengerCount: number;
  kidsCount?: number;
  needsCarSeat?: boolean;
  carSeatCount?: number;
  isRoundTrip?: boolean;
  returnDate?: string;
}

// Interfaz para reservas de niñera
export interface BabysitterReservation extends BaseReservation {
  childrenCount: number;
  childrenAges: string[]; // Edades como "2 años", "6 meses"
  startTime: string;
  endTime: string;
  hasSpecialNeeds?: boolean;
  specialNeedsDetails?: string;
  specialRequests?: string;
}

// Interfaz para reservas de decoración personalizada
export interface CustomDecorationReservation extends BaseReservation {
  occasion: string; // Tipo de evento: cumpleaños, aniversario, etc.
  location: string; // Lugar donde se realizará la decoración
  exactAddress: string;
  colors?: string[]; // Lista de colores preferidos
  referenceImage?: string; // URL de imagen de referencia
  specialRequests?: string;
}

// Interfaz para reservas de compras de supermercado
export interface GroceryReservation extends BaseReservation {
  deliveryAddress: string;
  hour: string;
  items?: { name: string; quantity: number; note?: string }[];
  hasAllergies: 'yes' | 'no';
  allergyDetails?: string;
  foodRestrictions?: string;
  specialRequests?: string;
}

// Interfaz para detalles adicionales de una reserva
export interface ReservationDetail extends BaseReservation {
  isNewClient: boolean;
  previousReservations: number;
  averageSpending: string;
  lastVisit: string | null;
  address?: string;
  staff?: string;
  duration?: string;
  price?: string;
}

// Interfaz para opciones de filtro
export interface ReservationFilters {
  service: string;
  status: string;
  sortBy: string;
}
