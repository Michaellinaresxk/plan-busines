// types/reservation.ts

export enum ReservationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Tipos base para las diferentes reservas
export interface BaseReservation {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  status: ReservationStatus;
  totalPrice: number;
  notes?: string;
  timeAgo?: string;
  isPriority?: boolean;
  isNewClient?: boolean;
}

// Tipos específicos para cada servicio
export interface AirportTransferReservation extends BaseReservation {
  flightNumber: string;
  vehicleType: 'suv' | 'van';
  passengerCount: number;
  kidsCount?: number;
  needsCarSeat?: boolean;
  carSeatCount?: number;
  isRoundTrip?: boolean;
  returnDate?: string;
  returnFlightNumber?: string;
}

export interface BabysitterReservation extends BaseReservation {
  childrenCount: number;
  childrenAges: string[];
  startTime: string;
  endTime: string;
  hasSpecialNeeds?: boolean;
  specialNeedsDetails?: string;
  specialRequests?: string;
}

export interface CustomDecorationReservation extends BaseReservation {
  occasion: 'birthday' | 'anniversary' | 'proposal' | 'romantic' | 'baby-shower';
  location: string;
  exactAddress: string;
  colors: string[];
  referenceImage?: string;
}

export interface GroceryReservation extends BaseReservation {
  deliveryAddress: string;
  hour: string;
  items: Array<{ name: string; quantity: number; note?: string }>;
  hasAllergies: 'yes' | 'no';
  allergyDetails?: string;
  foodRestrictions?: string;
}
