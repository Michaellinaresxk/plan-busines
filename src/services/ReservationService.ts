import {
  ReservationStatus,
  type AirportTransferReservation,
  type BabysitterReservation,
  type CustomDecorationReservation,
  type GroceryReservation
} from '@/types/reservation';

// Tipo de servicio conocido
export enum ServiceType {
  AIRPORT_TRANSFER = 'airport-transfer',
  BABYSITTER = 'babysitter',
  CUSTOM_DECORATION = 'custom-decoration',
  GROCERY_SHOPPING = 'grocery-shopping',
  UNKNOWN = 'unknown'
}

// Clase que proporciona métodos para trabajar con reservas
export class ReservationService {
  // Detecta el tipo de servicio basado en las propiedades de la reserva
  static detectServiceType(reservation: any): ServiceType {
    // Comprobar si el tipo está explícitamente definido
    if (reservation.serviceType) {
      return this.normalizeServiceType(reservation.serviceType);
    }

    if (reservation.serviceId) {
      return this.normalizeServiceType(reservation.serviceId);
    }

    // Inferir el tipo basado en las propiedades presentes
    if (reservation.flightNumber || reservation.vehicleType) {
      return ServiceType.AIRPORT_TRANSFER;
    }

    if (reservation.childrenCount || reservation.childrenAges) {
      return ServiceType.BABYSITTER;
    }

    if (reservation.occasion || reservation.colors || reservation.referenceImage) {
      return ServiceType.CUSTOM_DECORATION;
    }

    if (
      reservation.items ||
      reservation.foodRestrictions ||
      (reservation.hasAllergies && reservation.deliveryAddress)
    ) {
      return ServiceType.GROCERY_SHOPPING;
    }

    return ServiceType.UNKNOWN;
  }

  // Normaliza los tipos de servicio a los valores enum
  private static normalizeServiceType(type: string): ServiceType {
    const typeMap: Record<string, ServiceType> = {
      'airport-transfer': ServiceType.AIRPORT_TRANSFER,
      airportTransfer: ServiceType.AIRPORT_TRANSFER,
      babysitter: ServiceType.BABYSITTER,
      'custom-decoration': ServiceType.CUSTOM_DECORATION,
      customDecoration: ServiceType.CUSTOM_DECORATION,
      'grocery-shopping': ServiceType.GROCERY_SHOPPING,
      grocery: ServiceType.GROCERY_SHOPPING
    };

    return typeMap[type] || ServiceType.UNKNOWN;
  }

  // Verifica si una reserva es de un tipo específico
  static isServiceType(reservation: any, type: ServiceType): boolean {
    return this.detectServiceType(reservation) === type;
  }

  // Convierte un objeto a una AirportTransferReservation estrictamente tipada
  static asAirportTransfer(reservation: any): AirportTransferReservation {
    return reservation as AirportTransferReservation;
  }

  // Convierte un objeto a una BabysitterReservation estrictamente tipada
  static asBabysitter(reservation: any): BabysitterReservation {
    return reservation as BabysitterReservation;
  }

  // Convierte un objeto a una CustomDecorationReservation estrictamente tipada
  static asCustomDecoration(reservation: any): CustomDecorationReservation {
    return reservation as CustomDecorationReservation;
  }

  // Convierte un objeto a una GroceryReservation estrictamente tipada
  static asGrocery(reservation: any): GroceryReservation {
    return reservation as GroceryReservation;
  }

  // Obtiene una etiqueta legible para un tipo de servicio
  static getServiceLabel(type: ServiceType): string {
    const labels: Record<ServiceType, string> = {
      [ServiceType.AIRPORT_TRANSFER]: 'Transporte Aeropuerto',
      [ServiceType.BABYSITTER]: 'Servicio de Niñera',
      [ServiceType.CUSTOM_DECORATION]: 'Decoración Personalizada',
      [ServiceType.GROCERY_SHOPPING]: 'Compras de Supermercado',
      [ServiceType.UNKNOWN]: 'Servicio Desconocido'
    };

    return labels[type];
  }

  // Obtiene un icono para un tipo de servicio
  static getServiceIcon(type: ServiceType): string {
    const icons: Record<ServiceType, string> = {
      [ServiceType.AIRPORT_TRANSFER]: 'mdi-airplane',
      [ServiceType.BABYSITTER]: 'mdi-baby',
      [ServiceType.CUSTOM_DECORATION]: 'mdi-party-popper',
      [ServiceType.GROCERY_SHOPPING]: 'mdi-cart',
      [ServiceType.UNKNOWN]: 'mdi-help-circle'
    };

    return icons[type];
  }

  // Obtiene un color para un tipo de servicio
  static getServiceColor(type: ServiceType): string {
    const colors: Record<ServiceType, string> = {
      [ServiceType.AIRPORT_TRANSFER]: 'blue-darken-2',
      [ServiceType.BABYSITTER]: 'deep-purple',
      [ServiceType.CUSTOM_DECORATION]: 'amber-darken-2',
      [ServiceType.GROCERY_SHOPPING]: 'green',
      [ServiceType.UNKNOWN]: 'grey'
    };

    return colors[type];
  }

  // Obtiene el estado de texto legible
  static getStatusText(status: ReservationStatus): string {
    const statusTexts: Record<ReservationStatus, string> = {
      [ReservationStatus.PENDING]: 'Pendiente',
      [ReservationStatus.APPROVED]: 'Aprobada',
      [ReservationStatus.REJECTED]: 'Rechazada',
      [ReservationStatus.COMPLETED]: 'Completada',
      [ReservationStatus.CANCELLED]: 'Cancelada'
    };

    return statusTexts[status];
  }

  // Obtiene el color para un estado
  static getStatusColor(status: ReservationStatus): string {
    const statusColors: Record<ReservationStatus, string> = {
      [ReservationStatus.PENDING]: 'warning',
      [ReservationStatus.APPROVED]: 'success',
      [ReservationStatus.REJECTED]: 'error',
      [ReservationStatus.COMPLETED]: 'info',
      [ReservationStatus.CANCELLED]: 'grey'
    };

    return statusColors[status];
  }
}
