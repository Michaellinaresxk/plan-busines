// src/types/supplier.ts
import type { SupplierProperties } from './properties';

// ✅ Exportar la interfaz Supplier para usar en components
export interface Supplier extends SupplierProperties {
  featured?: boolean;
  rating?: number;
  address?: string;
  createdAt?: Date;
}

// ✅ Tipos de servicios
export type SupplierService =
  | 'private-chef'
  | 'luxe-culinary'
  | 'golf-cart-rentals'
  | 'airport-transfers'
  | 'bike-rentals'
  | 'luxe-golf-cart'
  | 'luxe-e-bikes'
  | 'luxe-arrival'
  | 'yoga-standard'
  | 'personal-training'
  | 'luxe-yoga'
  | 'luxe-fitness'
  | 'luxe-masseuse'
  | 'catamaran-trips'
  | 'deep-sea-fishing'
  | 'private-fishing-trip'
  | 'private-catamaran'
  | 'luxe-yacht'
  | 'private-yacht-experience'
  | 'karaoke'
  | 'live-music'
  | 'custom-decorations'
  | 'babysitter'
  | 'grocery-shopping'
  | 'saona-island-tour'
  | 'horseback-riding'
  | 'adventure-excursions';

// ✅ Opciones de servicios para formularios
export const SUPPLIER_SERVICE_OPTIONS = [
  // Culinary
  { title: 'Chef Privado', value: 'private-chef' },
  { title: 'Experiencia Culinaria Luxe', value: 'luxe-culinary' },

  // Transportation
  { title: 'Alquiler de Carritos de Golf', value: 'golf-cart-rentals' },
  { title: 'Transporte Aeropuerto', value: 'airport-transfers' },
  { title: 'Alquiler de Bicicletas', value: 'bike-rentals' },
  { title: 'Carritos de Golf Luxe', value: 'luxe-golf-cart' },
  { title: 'E-Bikes Luxe', value: 'luxe-e-bikes' },
  { title: 'Llegada Luxe', value: 'luxe-arrival' },

  // Wellness
  { title: 'Yoga Estándar', value: 'yoga-standard' },
  { title: 'Entrenamiento Personal', value: 'personal-training' },
  { title: 'Yoga Luxe', value: 'luxe-yoga' },
  { title: 'Fitness Luxe', value: 'luxe-fitness' },
  { title: 'Masajista Luxe', value: 'luxe-masseuse' },

  // Water Activities
  { title: 'Excursiones en Catamarán', value: 'catamaran-trips' },
  { title: 'Pesca en Alta Mar', value: 'deep-sea-fishing' },
  { title: 'Viaje de Pesca Privado', value: 'private-fishing-trip' },
  { title: 'Catamarán Privado', value: 'private-catamaran' },
  { title: 'Yate Luxe', value: 'luxe-yacht' },
  { title: 'Experiencia de Yate Privado', value: 'private-yacht-experience' },

  // Entertainment
  { title: 'Karaoke', value: 'karaoke' },
  { title: 'Música en Vivo', value: 'live-music' },
  { title: 'Decoraciones Personalizadas', value: 'custom-decorations' },

  // Others
  { title: 'Niñera', value: 'babysitter' },
  { title: 'Compras de Supermercado', value: 'grocery-shopping' },
  { title: 'Tour Isla Saona', value: 'saona-island-tour' },
  { title: 'Paseo a Caballo', value: 'horseback-riding' },
  { title: 'Excursiones de Aventura', value: 'adventure-excursions' }
];

// ✅ Nombres de display para servicios
export const SERVICE_DISPLAY_NAMES: Record<SupplierService, string> = {
  'private-chef': 'Chef Privado',
  'luxe-culinary': 'Experiencia Culinaria Luxe',
  'golf-cart-rentals': 'Alquiler de Carritos de Golf',
  'airport-transfers': 'Transporte Aeropuerto',
  'bike-rentals': 'Alquiler de Bicicletas',
  'luxe-golf-cart': 'Carritos de Golf Luxe',
  'luxe-e-bikes': 'E-Bikes Luxe',
  'luxe-arrival': 'Llegada Luxe',
  'yoga-standard': 'Yoga Estándar',
  'personal-training': 'Entrenamiento Personal',
  'luxe-yoga': 'Yoga Luxe',
  'luxe-fitness': 'Fitness Luxe',
  'luxe-masseuse': 'Masajista Luxe',
  'catamaran-trips': 'Excursiones en Catamarán',
  'deep-sea-fishing': 'Pesca en Alta Mar',
  'private-fishing-trip': 'Viaje de Pesca Privado',
  'private-catamaran': 'Catamarán Privado',
  'luxe-yacht': 'Yate Luxe',
  'private-yacht-experience': 'Experiencia de Yate Privado',
  karaoke: 'Karaoke',
  'live-music': 'Música en Vivo',
  'custom-decorations': 'Decoraciones Personalizadas',
  babysitter: 'Niñera',
  'grocery-shopping': 'Compras de Supermercado',
  'saona-island-tour': 'Tour Isla Saona',
  'horseback-riding': 'Paseo a Caballo',
  'adventure-excursions': 'Excursiones de Aventura'
};

// ✅ Servicios que requieren vehicleType (solo airport transfer por ahora)
export const AIRPORT_TRANSFER_SERVICES = ['airport-transfers', 'transporte-aeropuerto'];

// ✅ Helper function para verificar si un servicio es de airport transfer
export function isAirportTransferService(service: string): boolean {
  const normalizedService = service.toLowerCase();
  return AIRPORT_TRANSFER_SERVICES.some(
    airportService =>
      normalizedService.includes(airportService) || airportService.includes(normalizedService)
  );
}

// ✅ Opciones de tipos de vehículos
export const VEHICLE_TYPE_OPTIONS = [
  { title: 'Van Pequeña (1-6 personas)', value: 'vanSmall' },
  { title: 'Van Mediana (7-10 personas)', value: 'vanMedium' },
  { title: 'Van Grande (11-16 personas)', value: 'vanLarge' },
  { title: 'SUV (1-6 personas)', value: 'suv' }
];

// ✅ Helper function para obtener label del tipo de vehículo
export function getVehicleTypeLabel(vehicleType: string): string {
  const vehicleTypes: Record<string, string> = {
    vanSmall: 'Van Pequeña (1-6 personas)',
    vanMedium: 'Van Mediana (7-10 personas)',
    vanLarge: 'Van Grande (11-16 personas)',
    suv: 'SUV (1-6 personas)'
  };

  return vehicleTypes[vehicleType] || vehicleType;
}
