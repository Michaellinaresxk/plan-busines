// src/types/inventory.ts
export interface ServiceInventoryItem {
  id: string;
  serviceId: string; // Referencia a SERVICE_IDS existentes
  serviceName: string;
  category: ServiceCategory;
  basePrice: number;
  currency: 'USD' | 'DOP';

  // Configuración de precios y comisiones
  pricing: ServicePricing;

  // Configuración de disponibilidad
  availability: ServiceAvailability;

  // Metadatos
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;

  // Información adicional
  description?: string;
  notes?: string;
  tags: string[];
}

export interface ServicePricing {
  // Precio base del servicio
  basePrice: number;

  // Costos externos (lo que pagas a proveedores)
  externalCosts: ExternalCost[];

  // Impuestos aplicables
  taxes: TaxConfiguration[];

  // Descuentos disponibles
  discounts: DiscountConfiguration[];

  // Cálculo de comisión
  commission: CommissionConfiguration;

  // Precio final calculado automáticamente
  finalPrice: number;
  netProfit: number; // Tu ganancia neta
}

export interface ExternalCost {
  id: string;
  name: string; // ej: "Proveedor Transporte", "Fee Entrada", etc.
  amount: number;
  type: 'fixed' | 'percentage';
  isRequired: boolean;
  supplierId?: string; // Opcional: vinculado a un proveedor
  description?: string;
}

export interface TaxConfiguration {
  id: string;
  name: string; // ej: "ITBIS", "Tax Municipal", etc.
  rate: number; // 18 para 18%
  type: 'percentage' | 'fixed';
  appliesTo: 'basePrice' | 'totalPrice' | 'profit';
  isActive: boolean;
}

export interface DiscountConfiguration {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  amount: number;
  conditions: DiscountCondition[];
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
}

export interface DiscountCondition {
  type: 'minQuantity' | 'dateRange' | 'customerType' | 'serviceBundle';
  value: any;
}

export interface CommissionConfiguration {
  type: 'percentage' | 'fixed';
  amount: number;
  minAmount?: number; // Comisión mínima
  maxAmount?: number; // Comisión máxima
}

export interface ServiceAvailability {
  isAvailable: boolean;
  schedules: AvailabilitySchedule[];
  blackoutDates: Date[];
  maxBookingsPerDay?: number;
  advanceBookingDays: {
    min: number; // Mínimo días de anticipación
    max: number; // Máximo días de anticipación
  };
}

export interface AvailabilitySchedule {
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, etc.
  timeSlots: TimeSlot[];
  isActive: boolean;
}

export interface TimeSlot {
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  maxBookings?: number;
}

// Enums para categorías existentes (extender si es necesario)
export enum ServiceCategory {
  FOOD_DRINKS = 'food-drinks',
  WELLNESS = 'wellness',
  TRANSPORTATION = 'transportation',
  TOURS = 'tours',
  LEISURE = 'leisure',
  WATER_ACTIVITIES = 'water-activities',
  // Nuevas categorías para tu inventario específico
  ATV = 'atv',
  BUGGIES = 'buggies',
  POLARIS = 'polaris'
}

// Interfaces para operaciones CRUD
export interface CreateInventoryItemData {
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  basePrice: number;
  currency: 'USD' | 'DOP';
  pricing: Omit<ServicePricing, 'finalPrice' | 'netProfit'>;
  availability: ServiceAvailability;
  description?: string;
  tags: string[];
}

export interface UpdateInventoryItemData extends Partial<CreateInventoryItemData> {
  id: string;
}

// Interface para cálculos de pricing
export interface PricingCalculationResult {
  basePrice: number;
  totalExternalCosts: number;
  totalTaxes: number;
  totalDiscounts: number;
  commissionAmount: number;
  finalPrice: number;
  netProfit: number;
  breakdown: {
    externalCosts: { name: string; amount: number }[];
    taxes: { name: string; amount: number }[];
    discounts: { name: string; amount: number }[];
  };
}

// Interface para reportes y analytics
export interface InventoryAnalytics {
  totalServices: number;
  activeServices: number;
  totalRevenue: number;
  totalProfit: number;
  averageMargin: number;
  topCategories: { category: ServiceCategory; count: number; revenue: number }[];
  topServices: { serviceId: string; bookings: number; revenue: number }[];
}
