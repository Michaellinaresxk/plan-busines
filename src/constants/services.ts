// src/constants/services.ts

// IDs de servicios disponibles
export const SERVICE_IDS = {
  // Servicios estándar
  CHEF: 'private-chef',
  GOLF_CART: 'golf-cart-rentals',
  AIRPORT_TRANSFER: 'airport-transfers',
  YOGA: 'yoga-standard',
  PERSONAL_TRAINER: 'personal-training',
  GROCERY: 'grocery-shopping',
  KARAOKE: 'karaoke',
  BIKE_RENTALS: 'bike-rentals',
  BABYSITTER: 'babysitter',
  CATAMARAN: 'catamaran-trips',

  SAONA_TOUR: 'saona-island-tour',
  HORSEBACK_RIDING: 'horseback-riding',
  DEEP_SEA_FISHING: 'deep-sea-fishing',
  PRIVATE_FISHING: 'private-fishing-trip',
  CUSTOM_DECORATIONS: 'custom-decorations',
  ADVENTURE_EXCURSIONS: 'adventure-excursions',
  LIVE_MUSIC: 'live-music',

  // Servicios premium
  LUXE_GOLF_CART: 'luxe-golf-cart',
  LUXE_YOGA: 'luxe-yoga',
  PRIVATE_CATAMARAN: 'private-catamaran',
  LUXE_FITNESS: 'luxe-fitness',
  LUXE_EBIKES: 'luxe-e-bikes',
  LUXE_YACHT: 'luxe-yacht',
  PRIVATE_YACHT: 'private-yacht-experience',
  LUXE_CULINARY: 'luxe-culinary',
  LUXE_MASSEUSE: 'luxe-masseuse',
  LUXE_ARRIVAL: 'luxe-arrival'
} as const;

// Categorías de servicios
export enum ServiceCategory {
  FOOD_DRINKS = 'food-drinks',
  WELLNESS = 'wellness',
  TRANSPORTATION = 'transportation',
  TOURS = 'tours',
  LEISURE = 'leisure',
  WATER_ACTIVITIES = 'water-activities'
}

// Mapeo de servicios a categorías
export const SERVICE_CATEGORIES: Record<string, ServiceCategory> = {
  [SERVICE_IDS.CHEF]: ServiceCategory.FOOD_DRINKS,
  [SERVICE_IDS.YOGA]: ServiceCategory.WELLNESS,
  [SERVICE_IDS.LUXE_YOGA]: ServiceCategory.WELLNESS,
  [SERVICE_IDS.AIRPORT_TRANSFER]: ServiceCategory.TRANSPORTATION,
  [SERVICE_IDS.SAONA_TOUR]: ServiceCategory.TOURS,
  [SERVICE_IDS.GROCERY]: ServiceCategory.LEISURE,
  [SERVICE_IDS.BABYSITTER]: ServiceCategory.LEISURE,
  [SERVICE_IDS.CUSTOM_DECORATIONS]: ServiceCategory.LEISURE,
  [SERVICE_IDS.LIVE_MUSIC]: ServiceCategory.LEISURE,
  [SERVICE_IDS.LUXE_YACHT]: ServiceCategory.WATER_ACTIVITIES,
  [SERVICE_IDS.PRIVATE_CATAMARAN]: ServiceCategory.WATER_ACTIVITIES
};

// Información básica de servicios (para UI)
export interface ServiceInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ServiceCategory;
}

// Información básica de los servicios para la UI
export const SERVICES_INFO: Record<string, ServiceInfo> = {
  [SERVICE_IDS.CHEF]: {
    id: SERVICE_IDS.CHEF,
    name: 'Chef Privado',
    description: 'Servicio de chef privado para tu estancia',
    icon: 'mdi-chef-hat',
    category: ServiceCategory.FOOD_DRINKS
  },
  [SERVICE_IDS.YOGA]: {
    id: SERVICE_IDS.YOGA,
    name: 'Yoga Estándar',
    description: 'Sesiones de yoga personalizadas',
    icon: 'mdi-yoga',
    category: ServiceCategory.WELLNESS
  },
  [SERVICE_IDS.LUXE_YOGA]: {
    id: SERVICE_IDS.LUXE_YOGA,
    name: 'Yoga Premium',
    description: 'Experiencia de yoga de lujo',
    icon: 'mdi-yoga',
    category: ServiceCategory.WELLNESS
  },
  [SERVICE_IDS.AIRPORT_TRANSFER]: {
    id: SERVICE_IDS.AIRPORT_TRANSFER,
    name: 'Traslado Aeropuerto',
    description: 'Servicio de traslado desde y hacia el aeropuerto',
    icon: 'mdi-airplane',
    category: ServiceCategory.TRANSPORTATION
  },
  [SERVICE_IDS.SAONA_TOUR]: {
    id: SERVICE_IDS.SAONA_TOUR,
    name: 'Tour a Isla Saona',
    description: 'Excursión a la paradisíaca Isla Saona',
    icon: 'mdi-island',
    category: ServiceCategory.TOURS
  },
  [SERVICE_IDS.GROCERY]: {
    id: SERVICE_IDS.GROCERY,
    name: 'Compras de Supermercado',
    description: 'Servicio de compras y entrega de comestibles',
    icon: 'mdi-cart',
    category: ServiceCategory.LEISURE
  },
  [SERVICE_IDS.BABYSITTER]: {
    id: SERVICE_IDS.BABYSITTER,
    name: 'Niñera',
    description: 'Servicio profesional de cuidado infantil',
    icon: 'mdi-baby',
    category: ServiceCategory.LEISURE
  },
  [SERVICE_IDS.CUSTOM_DECORATIONS]: {
    id: SERVICE_IDS.CUSTOM_DECORATIONS,
    name: 'Decoraciones Personalizadas',
    description: 'Decoración para eventos y ocasiones especiales',
    icon: 'mdi-party-popper',
    category: ServiceCategory.LEISURE
  },
  [SERVICE_IDS.LIVE_MUSIC]: {
    id: SERVICE_IDS.LIVE_MUSIC,
    name: 'Música en Vivo',
    description: 'Artistas y bandas para tu evento',
    icon: 'mdi-music',
    category: ServiceCategory.LEISURE
  },
  [SERVICE_IDS.LUXE_YACHT]: {
    id: SERVICE_IDS.LUXE_YACHT,
    name: 'Yate de Lujo',
    description: 'Experiencia exclusiva en yate privado',
    icon: 'mdi-sail-boat',
    category: ServiceCategory.WATER_ACTIVITIES
  },
  [SERVICE_IDS.PRIVATE_CATAMARAN]: {
    id: SERVICE_IDS.PRIVATE_CATAMARAN,
    name: 'Catamarán Privado',
    description: 'Navegación privada en catamarán',
    icon: 'mdi-sail-boat',
    category: ServiceCategory.WATER_ACTIVITIES
  }
};
