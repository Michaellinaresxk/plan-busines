// src/types/supplier.ts

// Enums for better type safety - Real services from your system
export enum SupplierService {
  // Standard services
  CHEF = 'private-chef',
  GOLF_CART = 'golf-cart-rentals',
  AIRPORT_TRANSFER = 'airport-transfers',
  YOGA = 'yoga-standard',
  PERSONAL_TRAINER = 'personal-training',
  GROCERY = 'grocery-shopping',
  KARAOKE = 'karaoke',
  BIKE_RENTALS = 'bike-rentals',
  BABYSITTER = 'babysitter',
  CATAMARAN = 'catamaran-trips',
  SAONA_TOUR = 'saona-island-tour',
  HORSEBACK_RIDING = 'horseback-riding',
  DEEP_SEA_FISHING = 'deep-sea-fishing',
  PRIVATE_FISHING = 'private-fishing-trip',
  CUSTOM_DECORATIONS = 'custom-decorations',
  ADVENTURE_EXCURSIONS = 'adventure-excursions',
  LIVE_MUSIC = 'live-music',

  // Premium services
  LUXE_GOLF_CART = 'luxe-golf-cart',
  LUXE_YOGA = 'luxe-yoga',
  PRIVATE_CATAMARAN = 'private-catamaran',
  LUXE_FITNESS = 'luxe-fitness',
  LUXE_EBIKES = 'luxe-e-bikes',
  LUXE_YACHT = 'luxe-yacht',
  PRIVATE_YACHT = 'private-yacht-experience',
  LUXE_CULINARY = 'luxe-culinary',
  LUXE_MASSEUSE = 'luxe-masseuse',
  LUXE_ARRIVAL = 'luxe-arrival'
}

// Service display names mapping
export const SERVICE_DISPLAY_NAMES: Record<SupplierService, string> = {
  [SupplierService.CHEF]: 'Chef Privado',
  [SupplierService.GOLF_CART]: 'Alquiler Golf Cart',
  [SupplierService.AIRPORT_TRANSFER]: 'Transporte Aeropuerto',
  [SupplierService.YOGA]: 'Yoga Estándar',
  [SupplierService.PERSONAL_TRAINER]: 'Entrenador Personal',
  [SupplierService.GROCERY]: 'Compras Supermercado',
  [SupplierService.KARAOKE]: 'Karaoke',
  [SupplierService.BIKE_RENTALS]: 'Alquiler Bicicletas',
  [SupplierService.BABYSITTER]: 'Niñera',
  [SupplierService.CATAMARAN]: 'Excursión Catamarán',
  [SupplierService.SAONA_TOUR]: 'Tour Isla Saona',
  [SupplierService.HORSEBACK_RIDING]: 'Cabalgata',
  [SupplierService.DEEP_SEA_FISHING]: 'Pesca Alta Mar',
  [SupplierService.PRIVATE_FISHING]: 'Pesca Privada',
  [SupplierService.CUSTOM_DECORATIONS]: 'Decoraciones Personalizadas',
  [SupplierService.ADVENTURE_EXCURSIONS]: 'Excursiones Aventura',
  [SupplierService.LIVE_MUSIC]: 'Música en Vivo',

  // Premium services
  [SupplierService.LUXE_GOLF_CART]: 'Golf Cart Luxe',
  [SupplierService.LUXE_YOGA]: 'Yoga Luxe',
  [SupplierService.PRIVATE_CATAMARAN]: 'Catamarán Privado',
  [SupplierService.LUXE_FITNESS]: 'Fitness Luxe',
  [SupplierService.LUXE_EBIKES]: 'E-Bikes Luxe',
  [SupplierService.LUXE_YACHT]: 'Yacht Luxe',
  [SupplierService.PRIVATE_YACHT]: 'Experiencia Yacht Privado',
  [SupplierService.LUXE_CULINARY]: 'Experiencia Culinaria Luxe',
  [SupplierService.LUXE_MASSEUSE]: 'Masajista Luxe',
  [SupplierService.LUXE_ARRIVAL]: 'Llegada Luxe'
};

// Service categories for better organization
export enum ServiceCategory {
  CULINARY = 'culinary',
  TRANSPORTATION = 'transportation',
  WELLNESS = 'wellness',
  ENTERTAINMENT = 'entertainment',
  CHILDCARE = 'childcare',
  WATER_ACTIVITIES = 'water-activities',
  TOURS = 'tours',
  ADVENTURE = 'adventure',
  LUXURY = 'luxury'
}

export const SERVICE_CATEGORIES: Record<SupplierService, ServiceCategory> = {
  [SupplierService.CHEF]: ServiceCategory.CULINARY,
  [SupplierService.LUXE_CULINARY]: ServiceCategory.LUXURY,

  [SupplierService.GOLF_CART]: ServiceCategory.TRANSPORTATION,
  [SupplierService.AIRPORT_TRANSFER]: ServiceCategory.TRANSPORTATION,
  [SupplierService.BIKE_RENTALS]: ServiceCategory.TRANSPORTATION,
  [SupplierService.LUXE_GOLF_CART]: ServiceCategory.LUXURY,
  [SupplierService.LUXE_EBIKES]: ServiceCategory.LUXURY,
  [SupplierService.LUXE_ARRIVAL]: ServiceCategory.LUXURY,

  [SupplierService.YOGA]: ServiceCategory.WELLNESS,
  [SupplierService.PERSONAL_TRAINER]: ServiceCategory.WELLNESS,
  [SupplierService.LUXE_YOGA]: ServiceCategory.LUXURY,
  [SupplierService.LUXE_FITNESS]: ServiceCategory.LUXURY,
  [SupplierService.LUXE_MASSEUSE]: ServiceCategory.LUXURY,

  [SupplierService.KARAOKE]: ServiceCategory.ENTERTAINMENT,
  [SupplierService.LIVE_MUSIC]: ServiceCategory.ENTERTAINMENT,

  [SupplierService.BABYSITTER]: ServiceCategory.CHILDCARE,

  [SupplierService.CATAMARAN]: ServiceCategory.WATER_ACTIVITIES,
  [SupplierService.DEEP_SEA_FISHING]: ServiceCategory.WATER_ACTIVITIES,
  [SupplierService.PRIVATE_FISHING]: ServiceCategory.WATER_ACTIVITIES,
  [SupplierService.PRIVATE_CATAMARAN]: ServiceCategory.LUXURY,
  [SupplierService.LUXE_YACHT]: ServiceCategory.LUXURY,
  [SupplierService.PRIVATE_YACHT]: ServiceCategory.LUXURY,

  [SupplierService.SAONA_TOUR]: ServiceCategory.TOURS,
  [SupplierService.GROCERY]: ServiceCategory.TOURS,

  [SupplierService.HORSEBACK_RIDING]: ServiceCategory.ADVENTURE,
  [SupplierService.ADVENTURE_EXCURSIONS]: ServiceCategory.ADVENTURE,

  [SupplierService.CUSTOM_DECORATIONS]: ServiceCategory.ENTERTAINMENT
};

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

// Main Supplier interface
export interface Supplier {
  id: string;
  name: string;
  cedula: string;
  email: string;
  phone: string;
  service: SupplierService | string;
  featured?: boolean;
  rating?: number;
  status?: SupplierStatus;
  address?: string;
  description?: string;
  website?: string;
  profileImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastContactAt?: Date;
  // Additional metadata
  metadata?: {
    experience?: number; // years
    certifications?: string[];
    languages?: string[];
    availability?: {
      days: string[];
      hours: string;
    };
    pricing?: {
      currency: string;
      priceRange: {
        min: number;
        max: number;
      };
      unit: string; // 'hour', 'day', 'project'
    };
  };
}

// Supplier creation data (without id and timestamps)
export interface CreateSupplierData {
  name: string;
  cedula: string;
  email: string;
  phone: string;
  service: SupplierService | string;
  featured?: boolean;
  rating?: number;
  status?: SupplierStatus;
  address?: string;
  description?: string;
  website?: string;
  profileImage?: string;
  metadata?: Supplier['metadata'];
}

// Supplier update data (all fields optional except id)
export interface UpdateSupplierData {
  id: string;
  name?: string;
  cedula?: string;
  email?: string;
  phone?: string;
  service?: SupplierService | string;
  featured?: boolean;
  rating?: number;
  status?: SupplierStatus;
  address?: string;
  description?: string;
  website?: string;
  profileImage?: string;
  metadata?: Partial<Supplier['metadata']>;
}

// Filter interfaces
export interface SupplierFilters {
  service?: SupplierService | string | 'all';
  featured?: 'all' | 'featured' | 'regular';
  status?: SupplierStatus | 'all';
  rating?: {
    min?: number;
    max?: number;
  };
  location?: string;
}

// Search and pagination
export interface SupplierSearchParams {
  query?: string;
  filters?: SupplierFilters;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'rating' | 'createdAt' | 'service';
  sortOrder?: 'asc' | 'desc';
}

// API response types
export interface SupplierListResponse {
  suppliers: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SupplierStats {
  total: number;
  featured: number;
  services: number;
  avgRating: number;
  byService: Record<string, number>;
  byStatus: Record<SupplierStatus, number>;
}

// Event types for component communication
export interface SupplierEvents {
  view: (supplier: Supplier) => void;
  contact: (supplier: Supplier) => void;
  edit: (supplier: Supplier) => void;
  delete: (supplier: Supplier) => void;
  'toggle-featured': (supplier: Supplier) => void;
  'update-status': (supplier: Supplier, status: SupplierStatus) => void;
  'update-rating': (supplier: Supplier, rating: number) => void;
}

// Validation schemas (for future use with form validation)
export interface SupplierValidationRules {
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  cedula: {
    required: boolean;
    pattern: RegExp;
  };
  email: {
    required: boolean;
    pattern: RegExp;
  };
  phone: {
    required: boolean;
    pattern: RegExp;
  };
  service: {
    required: boolean;
    allowedValues: SupplierService[];
  };
}

// Constants for form options
export const SUPPLIER_SERVICE_OPTIONS = [
  // Standard Services
  { title: 'Chef Privado', value: SupplierService.CHEF, category: ServiceCategory.CULINARY },
  {
    title: 'Alquiler Golf Cart',
    value: SupplierService.GOLF_CART,
    category: ServiceCategory.TRANSPORTATION
  },
  {
    title: 'Transporte Aeropuerto',
    value: SupplierService.AIRPORT_TRANSFER,
    category: ServiceCategory.TRANSPORTATION
  },
  { title: 'Yoga Estándar', value: SupplierService.YOGA, category: ServiceCategory.WELLNESS },
  {
    title: 'Entrenador Personal',
    value: SupplierService.PERSONAL_TRAINER,
    category: ServiceCategory.WELLNESS
  },
  {
    title: 'Compras Supermercado',
    value: SupplierService.GROCERY,
    category: ServiceCategory.TOURS
  },
  { title: 'Karaoke', value: SupplierService.KARAOKE, category: ServiceCategory.ENTERTAINMENT },
  {
    title: 'Alquiler Bicicletas',
    value: SupplierService.BIKE_RENTALS,
    category: ServiceCategory.TRANSPORTATION
  },
  { title: 'Niñera', value: SupplierService.BABYSITTER, category: ServiceCategory.CHILDCARE },
  {
    title: 'Excursión Catamarán',
    value: SupplierService.CATAMARAN,
    category: ServiceCategory.WATER_ACTIVITIES
  },
  { title: 'Tour Isla Saona', value: SupplierService.SAONA_TOUR, category: ServiceCategory.TOURS },
  {
    title: 'Cabalgata',
    value: SupplierService.HORSEBACK_RIDING,
    category: ServiceCategory.ADVENTURE
  },
  {
    title: 'Pesca Alta Mar',
    value: SupplierService.DEEP_SEA_FISHING,
    category: ServiceCategory.WATER_ACTIVITIES
  },
  {
    title: 'Pesca Privada',
    value: SupplierService.PRIVATE_FISHING,
    category: ServiceCategory.WATER_ACTIVITIES
  },
  {
    title: 'Decoraciones Personalizadas',
    value: SupplierService.CUSTOM_DECORATIONS,
    category: ServiceCategory.ENTERTAINMENT
  },
  {
    title: 'Excursiones Aventura',
    value: SupplierService.ADVENTURE_EXCURSIONS,
    category: ServiceCategory.ADVENTURE
  },
  {
    title: 'Música en Vivo',
    value: SupplierService.LIVE_MUSIC,
    category: ServiceCategory.ENTERTAINMENT
  },

  // Premium Services
  {
    title: 'Golf Cart Luxe',
    value: SupplierService.LUXE_GOLF_CART,
    category: ServiceCategory.LUXURY
  },
  { title: 'Yoga Luxe', value: SupplierService.LUXE_YOGA, category: ServiceCategory.LUXURY },
  {
    title: 'Catamarán Privado',
    value: SupplierService.PRIVATE_CATAMARAN,
    category: ServiceCategory.LUXURY
  },
  { title: 'Fitness Luxe', value: SupplierService.LUXE_FITNESS, category: ServiceCategory.LUXURY },
  { title: 'E-Bikes Luxe', value: SupplierService.LUXE_EBIKES, category: ServiceCategory.LUXURY },
  { title: 'Yacht Luxe', value: SupplierService.LUXE_YACHT, category: ServiceCategory.LUXURY },
  {
    title: 'Experiencia Yacht Privado',
    value: SupplierService.PRIVATE_YACHT,
    category: ServiceCategory.LUXURY
  },
  {
    title: 'Experiencia Culinaria Luxe',
    value: SupplierService.LUXE_CULINARY,
    category: ServiceCategory.LUXURY
  },
  {
    title: 'Masajista Luxe',
    value: SupplierService.LUXE_MASSEUSE,
    category: ServiceCategory.LUXURY
  },
  { title: 'Llegada Luxe', value: SupplierService.LUXE_ARRIVAL, category: ServiceCategory.LUXURY }
];

export const SUPPLIER_STATUS_OPTIONS = [
  { title: 'Activo', value: SupplierStatus.ACTIVE },
  { title: 'Inactivo', value: SupplierStatus.INACTIVE },
  { title: 'Pendiente', value: SupplierStatus.PENDING },
  { title: 'Suspendido', value: SupplierStatus.SUSPENDED }
];

// Utility type for component props
export type SupplierCardProps = {
  supplier: Supplier;
} & {
  [K in keyof SupplierEvents]: SupplierEvents[K];
};

// Mock data factory (for development)
export const createMockSupplier = (overrides: Partial<Supplier> = {}): Supplier => ({
  id: Math.random().toString(36).substr(2, 9),
  name: 'Juan Pérez',
  cedula: '123456789',
  email: 'juan.perez@email.com',
  phone: '3001234567',
  service: SupplierService.TRANSPORT,
  featured: false,
  rating: 4.0,
  status: SupplierStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export default Supplier;
