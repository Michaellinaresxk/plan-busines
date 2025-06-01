// src/utils/supplier-helpers.ts
import type { SupplierService } from '@/types/supplier';

interface ServiceStyle {
  color: string;
  icon: string;
  gradient: string;
  category: 'culinary' | 'transportation' | 'wellness' | 'water' | 'entertainment' | 'other';
}

const SERVICE_STYLES: Record<string, ServiceStyle> = {
  // Culinary
  'private-chef': {
    color: '#FF6B35',
    icon: 'mdi-chef-hat',
    gradient: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    category: 'culinary'
  },
  'luxe-culinary': {
    color: '#D4AF37',
    icon: 'mdi-silverware-fork-knife',
    gradient: 'linear-gradient(135deg, #D4AF37, #FFD700)',
    category: 'culinary'
  },

  // Transportation
  'golf-cart-rentals': {
    color: '#4CAF50',
    icon: 'mdi-golf-cart',
    gradient: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
    category: 'transportation'
  },
  'airport-transfers': {
    color: '#2196F3',
    icon: 'mdi-airplane',
    gradient: 'linear-gradient(135deg, #2196F3, #03DAC6)',
    category: 'transportation'
  },
  'bike-rentals': {
    color: '#FF9800',
    icon: 'mdi-bike',
    gradient: 'linear-gradient(135deg, #FF9800, #FFC107)',
    category: 'transportation'
  },
  'luxe-golf-cart': {
    color: '#9C27B0',
    icon: 'mdi-golf-cart',
    gradient: 'linear-gradient(135deg, #9C27B0, #E91E63)',
    category: 'transportation'
  },
  'luxe-e-bikes': {
    color: '#673AB7',
    icon: 'mdi-bike-fast',
    gradient: 'linear-gradient(135deg, #673AB7, #9C27B0)',
    category: 'transportation'
  },
  'luxe-arrival': {
    color: '#795548',
    icon: 'mdi-car-luxury',
    gradient: 'linear-gradient(135deg, #795548, #8D6E63)',
    category: 'transportation'
  },

  // Wellness
  'yoga-standard': {
    color: '#E91E63',
    icon: 'mdi-yoga',
    gradient: 'linear-gradient(135deg, #E91E63, #FF5722)',
    category: 'wellness'
  },
  'personal-training': {
    color: '#FF5722',
    icon: 'mdi-dumbbell',
    gradient: 'linear-gradient(135deg, #FF5722, #FF9800)',
    category: 'wellness'
  },
  'luxe-yoga': {
    color: '#9C27B0',
    icon: 'mdi-meditation',
    gradient: 'linear-gradient(135deg, #9C27B0, #E91E63)',
    category: 'wellness'
  },
  'luxe-fitness': {
    color: '#3F51B5',
    icon: 'mdi-weight-lifter',
    gradient: 'linear-gradient(135deg, #3F51B5, #673AB7)',
    category: 'wellness'
  },
  'luxe-masseuse': {
    color: '#8BC34A',
    icon: 'mdi-spa',
    gradient: 'linear-gradient(135deg, #8BC34A, #4CAF50)',
    category: 'wellness'
  },

  // Water Activities
  'catamaran-trips': {
    color: '#00BCD4',
    icon: 'mdi-sail-boat',
    gradient: 'linear-gradient(135deg, #00BCD4, #0097A7)',
    category: 'water'
  },
  'deep-sea-fishing': {
    color: '#009688',
    icon: 'mdi-fish',
    gradient: 'linear-gradient(135deg, #009688, #00BCD4)',
    category: 'water'
  },
  'private-fishing-trip': {
    color: '#607D8B',
    icon: 'mdi-fishing',
    gradient: 'linear-gradient(135deg, #607D8B, #78909C)',
    category: 'water'
  },
  'private-catamaran': {
    color: '#FF6F00',
    icon: 'mdi-yacht',
    gradient: 'linear-gradient(135deg, #FF6F00, #FF8F00)',
    category: 'water'
  },
  'luxe-yacht': {
    color: '#1976D2',
    icon: 'mdi-ferry',
    gradient: 'linear-gradient(135deg, #1976D2, #1E88E5)',
    category: 'water'
  },
  'private-yacht-experience': {
    color: '#283593',
    icon: 'mdi-sail-boat',
    gradient: 'linear-gradient(135deg, #283593, #3949AB)',
    category: 'water'
  },

  // Entertainment
  karaoke: {
    color: '#E040FB',
    icon: 'mdi-microphone',
    gradient: 'linear-gradient(135deg, #E040FB, #D500F9)',
    category: 'entertainment'
  },
  'live-music': {
    color: '#7C4DFF',
    icon: 'mdi-music',
    gradient: 'linear-gradient(135deg, #7C4DFF, #651FFF)',
    category: 'entertainment'
  },
  'custom-decorations': {
    color: '#FF4081',
    icon: 'mdi-party-popper',
    gradient: 'linear-gradient(135deg, #FF4081, #F50057)',
    category: 'entertainment'
  },

  // Others
  babysitter: {
    color: '#FFEB3B',
    icon: 'mdi-baby-face-outline',
    gradient: 'linear-gradient(135deg, #FFEB3B, #FDD835)',
    category: 'other'
  },
  'grocery-shopping': {
    color: '#4CAF50',
    icon: 'mdi-cart-outline',
    gradient: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
    category: 'other'
  },
  'saona-island-tour': {
    color: '#00E676',
    icon: 'mdi-island',
    gradient: 'linear-gradient(135deg, #00E676, #1DE9B6)',
    category: 'other'
  },
  'horseback-riding': {
    color: '#8D6E63',
    icon: 'mdi-horse-human',
    gradient: 'linear-gradient(135deg, #8D6E63, #A1887F)',
    category: 'other'
  },
  'adventure-excursions': {
    color: '#FF7043',
    icon: 'mdi-hiking',
    gradient: 'linear-gradient(135deg, #FF7043, #FF5722)',
    category: 'other'
  }
} as const;

const SERVICE_DISPLAY_NAMES: Record<SupplierService, string> = {
  'airport-transfers': 'Transporte Aeropuerto',
  'private-chef': 'Chef Privado',
  babysitter: 'Niñera',
  'golf-cart-rentals': 'Alquiler de Carritos',
  'bike-rentals': 'Alquiler de Bicicletas',
  'luxe-culinary': 'Culinaria Luxe',
  'luxe-golf-cart': 'Carrito Luxe',
  'luxe-e-bikes': 'E-Bikes Luxe',
  'luxe-arrival': 'Llegada Luxe',
  'yoga-standard': 'Yoga Estándar',
  'personal-training': 'Entrenamiento Personal',
  'luxe-yoga': 'Yoga Luxe',
  'luxe-fitness': 'Fitness Luxe',
  'luxe-masseuse': 'Masajista Luxe',
  'catamaran-trips': 'Paseos en Catamarán',
  'deep-sea-fishing': 'Pesca en Alta Mar',
  'private-fishing-trip': 'Pesca Privada',
  'private-catamaran': 'Catamarán Privado',
  'luxe-yacht': 'Yate Luxe',
  'private-yacht-experience': 'Experiencia Yate Privado',
  karaoke: 'Karaoke',
  'live-music': 'Música en Vivo',
  'custom-decorations': 'Decoraciones Personalizadas',
  'grocery-shopping': 'Compras de Supermercado',
  'saona-island-tour': 'Tour Isla Saona',
  'horseback-riding': 'Cabalgata',
  'adventure-excursions': 'Excursiones de Aventura'
};

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  vanSmall: 'Van Pequeña (1-6 personas)',
  vanMedium: 'Van Mediana (7-10 personas)',
  vanLarge: 'Van Grande (11-16 personas)',
  suv: 'SUV (1-6 personas)'
};

const AIRPORT_TRANSFER_SERVICES = [
  'airport-transfer',
  'airport-transfers',
  'transporte-aeropuerto'
] as const;

// Default values
const DEFAULT_SERVICE_COLOR = '#6366F1';
const DEFAULT_SERVICE_ICON = 'mdi-account-hard-hat';
const DEFAULT_SERVICE_GRADIENT = 'linear-gradient(135deg, #6366F1, #4F46E5)';

/**
 * Get service color
 */
export function getServiceColor(service: string): string {
  return SERVICE_STYLES[service]?.color ?? DEFAULT_SERVICE_COLOR;
}

/**
 * Get service icon
 */
export function getServiceIcon(service: string): string {
  return SERVICE_STYLES[service]?.icon ?? DEFAULT_SERVICE_ICON;
}

/**
 * Get service gradient
 */
export function getServiceGradient(service: string): string {
  return SERVICE_STYLES[service]?.gradient ?? DEFAULT_SERVICE_GRADIENT;
}

/**
 * Get service category
 */
export function getServiceCategory(service: string): ServiceStyle['category'] {
  return SERVICE_STYLES[service]?.category ?? 'other';
}

/**
 * Get service display name
 */
export function getServiceDisplayName(service: string): string {
  return SERVICE_DISPLAY_NAMES[service as SupplierService] ?? service;
}

/**
 * Get vehicle type label
 */
export function getVehicleTypeLabel(vehicleType: string): string {
  return VEHICLE_TYPE_LABELS[vehicleType] ?? vehicleType;
}

/**
 * Check if service is airport transfer
 */
export function isAirportTransferService(service: string): boolean {
  const normalizedService = service.toLowerCase();
  return AIRPORT_TRANSFER_SERVICES.some(
    airportService =>
      normalizedService.includes(airportService) || airportService.includes(normalizedService)
  );
}

/**
 * Check if service is luxe/premium
 */
export function isLuxeService(service: string): boolean {
  return service.includes('luxe') || service.includes('private');
}

/**
 * Get all services by category
 */
export function getServicesByCategory(category: ServiceStyle['category']): string[] {
  return Object.keys(SERVICE_STYLES).filter(
    service => SERVICE_STYLES[service].category === category
  );
}
