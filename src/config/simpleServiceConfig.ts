// 🎯 TIPOS ACTUALIZADOS en simpleServiceConfig.ts

export interface ServiceField {
  key: string;
  label: string;
  type: 'select' | 'number' | 'switch' | 'text';
  options?: Array<{ label: string; value: string | number; extraPrice?: number }>;
  required?: boolean;
  prefix?: string;
  suffix?: string;
}

export interface ServiceConfig {
  name: string;
  category: string;
  icon: string;
  color: string;
  fields: ServiceField[];
  basePrice: number;
  baseTaxes: number; // Percentage (0.18 = 18%)
  baseProfit: number; // Percentage (0.30 = 30%)
  priceCalculation?: 'simple' | 'complex' | 'age-based' | 'round-trip' | 'hourly';
}

export interface PriceCalculation {
  basePrice: number; // Precio base de referencia del servicio
  extraPrice: number; // Diferencia vs precio base (puede ser negativo)
  subtotal: number; // Precio real del servicio/opción seleccionada
  taxes: number; // Taxes calculados sobre el subtotal
  profit: number; // Ganancia calculada sobre el subtotal
  finalPrice: number; // Total final (subtotal + taxes + profit)
  clientPays: number; // Total que paga el cliente (igual a finalPrice)
}

// 🎯 TIPOS ADICIONALES para mejor tipado

export type ServiceType = keyof typeof BUSINESS_SERVICE_CONFIG;

export interface ServicePricingBreakdown {
  serviceName: string;
  selectedOption: string;
  baseServicePrice: number;
  taxes: number;
  profit: number;
  totalClientPays: number;
  netProfitAfterTaxes: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 🎯 CONSTANTES útiles

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'DOP'] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export const SERVICE_CATEGORIES = [
  'wellness',
  'adventure',
  'transport',
  'tours',
  'luxury',
  'entertainment',
  'services'
] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

// 🎯 FUNCIONES HELPER para el UI

export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function getServiceCategoryLabel(category: ServiceCategory): string {
  const labels: Record<ServiceCategory, string> = {
    wellness: 'Bienestar',
    adventure: 'Aventura',
    transport: 'Transporte',
    tours: 'Tours',
    luxury: 'Lujo',
    entertainment: 'Entretenimiento',
    services: 'Servicios'
  };
  return labels[category] || category;
}

export function calculateNetProfitMargin(calculation: PriceCalculation): number {
  if (calculation.subtotal === 0) return 0;
  return (calculation.profit / calculation.subtotal) * 100;
}

export function calculateTaxRate(calculation: PriceCalculation): number {
  if (calculation.subtotal === 0) return 0;
  return (calculation.taxes / calculation.subtotal) * 100;
}
// 🎯 CONFIGURACIÓN ESPECÍFICA PARA TU NEGOCIO
export const BUSINESS_SERVICE_CONFIG: Record<string, ServiceConfig> = {
  // 🧘 YOGA - Precio base + tiempo extra
  yoga: {
    name: 'Yoga',
    category: 'wellness',
    icon: 'mdi-meditation',
    color: '#4CAF50',
    basePrice: 60,
    baseTaxes: 0.18,
    baseProfit: 0.3,
    priceCalculation: 'simple',
    fields: [
      {
        key: 'duration',
        label: 'Duración',
        type: 'select',
        required: true,
        options: [
          { label: '60 minutos', value: 60, extraPrice: 60 }, // $60 total
          { label: '90 minutos', value: 90, extraPrice: 80 } // $80 total
        ]
      }
    ]
  },

  // 🏍️ ATV - Precios absolutos por vehículo
  atv: {
    name: 'ATV Adventures',
    category: 'adventure',
    icon: 'mdi-quad-bike',
    color: '#FF6B35',
    basePrice: 50, // Precio de referencia
    baseTaxes: 0.18,
    baseProfit: 0.35,
    priceCalculation: 'simple',
    fields: [
      {
        key: 'vehicleType',
        label: 'Tipo de Vehículo',
        type: 'select',
        required: true,
        options: [
          { label: 'ATV Individual', value: 'atv', extraPrice: 50 }, // $50 total
          { label: 'Buggies', value: 'buggies', extraPrice: 45 }, // $45 total
          { label: 'Polaris RZR', value: 'polaris', extraPrice: 100 } // $100 total
        ]
      }
    ]
  },

  // 💆 MASAJE - Precios absolutos por tipo
  massage: {
    name: 'Masajes',
    category: 'wellness',
    icon: 'mdi-hand-heart',
    color: '#E91E63',
    basePrice: 100, // Precio de referencia
    baseTaxes: 0.18,
    baseProfit: 0.4,
    priceCalculation: 'simple',
    fields: [
      {
        key: 'massageType',
        label: 'Tipo de Masaje',
        type: 'select',
        required: true,
        options: [
          { label: 'Relajante', value: 'relaxing', extraPrice: 100 }, // $100 total
          { label: 'Deportivo', value: 'sports', extraPrice: 120 }, // $120 total
          { label: 'Piedras Calientes', value: 'hot-stone', extraPrice: 130 }, // $130 total
          { label: 'Pareja', value: 'couples', extraPrice: 180 } // $180 total
        ]
      }
    ]
  },

  // 🏌️ GOLF CART - Precio base + capacidad extra
  'golf-cart': {
    name: 'Golf Cart',
    category: 'transport',
    icon: 'mdi-golf-cart',
    color: '#795548',
    basePrice: 400,
    baseTaxes: 0.18,
    baseProfit: 0.25,
    priceCalculation: 'simple',
    fields: [
      {
        key: 'capacity',
        label: 'Capacidad',
        type: 'select',
        required: true,
        options: [
          { label: '4 puertas', value: 4, extraPrice: 60 }, // $400 total
          { label: '6 puertas', value: 6, extraPrice: 80 } // $800 total
        ]
      }
    ]
  },

  // 🏝️ EXCURSIONES - Precios absolutos por destino
  excursion: {
    name: 'Excursiones',
    category: 'tours',
    icon: 'mdi-island',
    color: '#00BCD4',
    basePrice: 85, // Precio de referencia
    baseTaxes: 0.18,
    baseProfit: 0.3,
    priceCalculation: 'age-based',
    fields: [
      {
        key: 'excursionType',
        label: 'Tipo de Excursión',
        type: 'select',
        required: true,
        options: [
          { label: 'Saona Island', value: 'saona', extraPrice: 85 }, // $85 total
          { label: 'Horseback Riding', value: 'horseback', extraPrice: 95 }, // $95 total
          { label: 'ATV Tour', value: 'atv-tour', extraPrice: 180 }, // $180 total
          { label: 'Catalina Island', value: 'catalina', extraPrice: 100 } // $100 total
        ]
      }
    ]
  },

  // ⛵ CATAMARÁN - Precio base + upgrade
  catamaran: {
    name: 'Private Catamaran',
    category: 'luxury',
    icon: 'mdi-ferry',
    color: '#9C27B0',
    basePrice: 900,
    baseTaxes: 0.18,
    baseProfit: 0.4,
    priceCalculation: 'simple',
    fields: [
      {
        key: 'catamaranType',
        label: 'Tipo de Catamarán',
        type: 'select',
        required: true,
        options: [
          { label: 'Standard', value: 'standard', extraPrice: 900 }, // $900 total
          { label: 'Con Slide', value: 'with-slide', extraPrice: 1200 } // $1200 total
        ]
      }
    ]
  },

  // 🎤 KARAOKE - Precio fijo
  karaoke: {
    name: 'Karaoke',
    category: 'entertainment',
    icon: 'mdi-microphone',
    color: '#FF9800',
    basePrice: 150,
    baseTaxes: 0.18,
    baseProfit: 0.35,
    priceCalculation: 'simple',
    fields: []
  },

  // ✈️ TRANSPORTE AEROPUERTO - Precio base + ubicación
  'airport-transport': {
    name: 'Transporte Aeropuerto',
    category: 'transport',
    icon: 'mdi-airplane',
    color: '#2196F3',
    basePrice: 80,
    baseTaxes: 0.18,
    baseProfit: 0.25,
    priceCalculation: 'round-trip',
    fields: [
      {
        key: 'isRoundTrip',
        label: 'Viaje Redondo',
        type: 'switch',
        required: false
      },
      {
        key: 'location',
        label: 'Ubicación',
        type: 'select',
        required: true,
        options: [
          { label: 'Punta Cana', value: 'punta-cana', extraPrice: 80 }, // $80 total
          { label: 'Bavaro', value: 'bavaro', extraPrice: 90 }, // $90 total
          { label: 'Cap Cana', value: 'cap-cana', extraPrice: 95 }, // $95 total
          { label: 'La Romana', value: 'la-romana', extraPrice: 140 } // $140 total
        ]
      }
    ]
  },

  // 👶 BABY SITTER - Precio por hora
  babysitter: {
    name: 'Baby Sitter',
    category: 'services',
    icon: 'mdi-baby',
    color: '#E91E63',
    basePrice: 25,
    baseTaxes: 0.18,
    baseProfit: 0.3,
    priceCalculation: 'hourly',
    fields: [
      {
        key: 'hours',
        label: 'Horas',
        type: 'number',
        required: true,
        suffix: 'horas'
      }
    ]
  },

  // 🎨 DECORACIÓN PERSONALIZADA - Precio base + tipo
  'custom-decoration': {
    name: 'Custom Decoration',
    category: 'services',
    icon: 'mdi-party-popper',
    color: '#673AB7',
    basePrice: 200,
    baseTaxes: 0.18,
    baseProfit: 0.4,
    priceCalculation: 'simple',
    fields: [
      {
        key: 'decorationType',
        label: 'Tipo de Decoración',
        type: 'select',
        required: true,
        options: [
          { label: 'Romántica', value: 'romantic', extraPrice: 200 }, // $200 total
          { label: 'Cumpleaños', value: 'birthday', extraPrice: 250 }, // $250 total
          { label: 'Aniversario', value: 'anniversary', extraPrice: 300 }, // $300 total
          { label: 'Propuesta', value: 'proposal', extraPrice: 350 } // $350 total
        ]
      }
    ]
  },

  // 🎵 MÚSICA EN VIVO - Precio base + formato
  'live-music': {
    name: 'Live Music',
    category: 'entertainment',
    icon: 'mdi-music',
    color: '#FF5722',
    basePrice: 300,
    baseTaxes: 0.18,
    baseProfit: 0.3,
    priceCalculation: 'simple',
    fields: [
      {
        key: 'musicFormat',
        label: 'Formato Musical',
        type: 'select',
        required: true,
        options: [
          { label: 'Solista', value: 'solo', extraPrice: 300 }, // $300 total
          { label: 'Dúo', value: 'duo', extraPrice: 450 }, // $450 total
          { label: 'Trío', value: 'trio', extraPrice: 600 }, // $600 total
          { label: 'Banda Completa', value: 'band', extraPrice: 800 } // $800 total
        ]
      }
    ]
  },

  // 🛥️ YATES - Precio base + modelo
  yacht: {
    name: 'Yates',
    category: 'luxury',
    icon: 'mdi-sail-boat',
    color: '#3F51B5',
    basePrice: 800,
    baseTaxes: 0.18,
    baseProfit: 0.45,
    priceCalculation: 'simple',
    fields: [
      {
        key: 'yachtModel',
        label: 'Modelo de Yate',
        type: 'select',
        required: true,
        options: [
          { label: 'Fairline 43', value: 'fairline-43', extraPrice: 800 }, // $800 total
          { label: 'Aicon Fly 60', value: 'aicon-60', extraPrice: 1200 } // $1200 total
        ]
      }
    ]
  }
};

// 🎯 FUNCIONES HELPER PARA CÁLCULOS DE NEGOCIO

export interface PriceCalculation {
  basePrice: number;
  extraPrice: number;
  subtotal: number;
  taxes: number;
  profit: number;
  finalPrice: number;
  clientPays: number;
}

export function calculateServicePrice(
  serviceType: string,
  formData: Record<string, any>
): PriceCalculation {
  const config = BUSINESS_SERVICE_CONFIG[serviceType];
  if (!config) {
    throw new Error(`Service type ${serviceType} not configured`);
  }

  // 🎯 PRECIO DEL PROVEEDOR (costo base)
  let providerPrice = config.basePrice;

  // Buscar precio según la opción seleccionada
  config.fields.forEach(field => {
    const value = formData[field.key];

    if (field.type === 'select' && field.options) {
      const selectedOption = field.options.find(opt => opt.value === value);
      if (selectedOption?.extraPrice !== undefined) {
        // 🎯 ESTE ES EL PRECIO QUE LE PAGAS AL PROVEEDOR
        providerPrice = selectedOption.extraPrice;
      }
    }

    if (field.type === 'number' && field.suffix === 'horas') {
      // Para baby sitter - multiplicar por horas
      providerPrice = config.basePrice * (value || 1);
    }
  });

  // Aplicar modificadores específicos
  let finalProviderPrice = providerPrice;

  switch (config.priceCalculation) {
    case 'round-trip':
      if (formData.isRoundTrip) {
        finalProviderPrice = providerPrice * 1.8;
      }
      break;

    case 'age-based':
      if (formData.hasMinors && formData.minorsCount) {
        const minorsPrice = (formData.minorsCount || 0) * (providerPrice * 0.5);
        finalProviderPrice = providerPrice + minorsPrice;
      }
      break;
  }

  // 🎯 CALCULAR TU GANANCIA
  const yourProfit = finalProviderPrice * config.baseProfit;

  // 🎯 SUBTOTAL = Precio proveedor + Tu ganancia
  const subtotal = finalProviderPrice + yourProfit;

  // 🎯 CALCULAR TAXES sobre el subtotal
  const taxes = subtotal * config.baseTaxes;

  // 🎯 PRECIO FINAL = Subtotal + Taxes
  const clientPays = subtotal + taxes;

  return {
    basePrice: config.basePrice, // Precio base de referencia
    extraPrice: 0, // No usado en este modelo
    subtotal: finalProviderPrice, // Precio del proveedor
    taxes: Math.round(taxes * 100) / 100, // Taxes sobre (proveedor + ganancia)
    profit: Math.round(yourProfit * 100) / 100, // Tu ganancia
    finalPrice: Math.round(clientPays * 100) / 100, // Total final
    clientPays: Math.round(clientPays * 100) / 100 // Lo que paga el cliente
  };
}

// 🎯 FUNCIÓN HELPER para obtener nombre de la opción seleccionada
export function getSelectedOptionDetails(
  serviceType: string,
  formData: Record<string, any>
): {
  optionName: string;
  optionPrice: number;
} {
  const config = BUSINESS_SERVICE_CONFIG[serviceType];
  if (!config) {
    return { optionName: 'N/A', optionPrice: config?.basePrice || 0 };
  }

  // Buscar la primera opción select con precio
  const selectField = config.fields.find(
    field => field.type === 'select' && field.options && field.options.length > 0
  );

  if (selectField && formData[selectField.key]) {
    const selectedOption = selectField.options!.find(
      opt => opt.value === formData[selectField.key]
    );

    if (selectedOption) {
      return {
        optionName: selectedOption.label,
        optionPrice: selectedOption.extraPrice || config.basePrice
      };
    }
  }

  // Para servicios sin opciones (como Karaoke)
  return {
    optionName: config.name,
    optionPrice: config.basePrice
  };
}

// 🎯 FUNCIÓN para validar configuración específica
export function validateServiceConfiguration(serviceType: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const config = getServiceConfig(serviceType);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config) {
    errors.push(`Configuración no encontrada para el tipo de servicio: ${serviceType}`);
    return { isValid: false, errors, warnings };
  }

  // Validar campos requeridos
  if (!config.name) errors.push('Nombre del servicio es requerido');
  if (!config.category) errors.push('Categoría del servicio es requerida');
  if (!config.basePrice || config.basePrice <= 0) errors.push('Precio base debe ser mayor a 0');
  if (config.baseTaxes < 0 || config.baseTaxes > 1)
    warnings.push('Taxes fuera del rango normal (0-100%)');
  if (config.baseProfit <= 0 || config.baseProfit > 1)
    warnings.push('Ganancia fuera del rango normal (0-100%)');

  // Validar campos del formulario
  config.fields?.forEach((field, index) => {
    if (!field.key) errors.push(`Campo ${index + 1} sin clave definida`);
    if (!field.label) errors.push(`Campo ${field.key} sin etiqueta`);
    if (!field.type) errors.push(`Campo ${field.key} sin tipo definido`);

    if (field.type === 'select') {
      if (!field.options || field.options.length === 0) {
        errors.push(`Campo select ${field.key} sin opciones`);
      } else {
        // Validar que todas las opciones tengan extraPrice definido
        field.options.forEach((option, optIndex) => {
          if (option.extraPrice === undefined) {
            warnings.push(`Opción ${optIndex + 1} en ${field.key} sin precio definido`);
          }
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function getServiceConfig(serviceType: string): ServiceConfig | null {
  return BUSINESS_SERVICE_CONFIG[serviceType] || null;
}

export function getAllServiceTypes(): string[] {
  return Object.keys(BUSINESS_SERVICE_CONFIG);
}

export function getServicesByCategory(category: string): string[] {
  return Object.keys(BUSINESS_SERVICE_CONFIG).filter(
    key => BUSINESS_SERVICE_CONFIG[key].category === category
  );
}

// 🎯 FUNCIONES DE VALIDACIÓN
export function validateServiceData(
  serviceType: string,
  formData: Record<string, any>
): {
  isValid: boolean;
  errors: string[];
} {
  const config = getServiceConfig(serviceType);
  if (!config) {
    return { isValid: false, errors: ['Tipo de servicio no válido'] };
  }

  const errors: string[] = [];

  config.fields.forEach(field => {
    if (field.required && (!formData[field.key] || formData[field.key] === '')) {
      errors.push(`${field.label} es requerido`);
    }
  });

  return { isValid: errors.length === 0, errors };
}

// Agregar estas funciones al final de simpleServiceConfig.ts

// 🎯 FUNCIÓN PARA CREAR VARIANTE POR DEFECTO
export function createDefaultVariant(serviceType: string): Record<string, any> {
  const config = getServiceConfig(serviceType);

  if (!config) {
    return {
      id: `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'Nueva Variante',
      price: 0,
      description: '',
      isAvailable: true,
      features: []
    };
  }

  const defaultVariant: Record<string, any> = {
    id: `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${config.name} - Nueva Variante`,
    basePrice: config.basePrice,
    isAvailable: true,
    features: [],
    description: ''
  };

  // Inicializar campos específicos del servicio
  config.fields.forEach(field => {
    if (field.type === 'select' && field.options?.[0]) {
      defaultVariant[field.key] = field.options[0].value;
    } else if (field.type === 'number') {
      defaultVariant[field.key] = 1;
    } else if (field.type === 'switch') {
      defaultVariant[field.key] = false;
    } else {
      defaultVariant[field.key] = '';
    }
  });

  return defaultVariant;
}

// 🎯 FUNCIÓN PARA OBTENER VARIANTES ESTÁNDAR POR TIPO DE SERVICIO
export function getStandardVariantsForService(
  serviceType: string,
  basePrice: number
): Record<string, any>[] {
  switch (serviceType) {
    case 'atv':
      return [
        {
          id: `variant_${Date.now()}_1`,
          name: 'ATV Individual',
          vehicleType: 'atv',
          basePrice: basePrice,
          maxCapacity: 1,
          duration: 3,
          isAvailable: true,
          features: ['Equipo de seguridad', 'Guía incluido']
        },
        {
          id: `variant_${Date.now()}_2`,
          name: 'Buggies Deportivo',
          vehicleType: 'buggies',
          basePrice: basePrice - 20,
          maxCapacity: 2,
          duration: 3,
          isAvailable: true,
          features: ['Equipo de seguridad', 'Guía incluido', 'Para 2 personas']
        }
      ];

    case 'massage':
      return [
        {
          id: `variant_${Date.now()}_1`,
          name: 'Masaje Relajante',
          massageType: 'relaxing',
          basePrice: basePrice,
          duration: 60,
          isAvailable: true,
          features: ['Aceites aromáticos', 'Música relajante']
        },
        {
          id: `variant_${Date.now()}_2`,
          name: 'Masaje Deportivo',
          massageType: 'sports',
          basePrice: basePrice + 20,
          duration: 60,
          isAvailable: true,
          features: ['Técnicas deportivas', 'Alivio muscular']
        }
      ];

    case 'yoga':
      return [
        {
          id: `variant_${Date.now()}_1`,
          name: 'Yoga 60 min',
          duration: 60,
          basePrice: basePrice,
          isAvailable: true,
          features: ['Mat incluido', 'Agua', 'Instructor certificado']
        },
        {
          id: `variant_${Date.now()}_2`,
          name: 'Yoga 90 min',
          duration: 90,
          basePrice: basePrice + 20,
          isAvailable: true,
          features: ['Mat incluido', 'Agua', 'Instructor certificado', 'Sesión extendida']
        }
      ];

    default:
      return [];
  }
}

// 🎯 FUNCIÓN PARA OBTENER ESTADÍSTICAS DE NEGOCIO
export function getBusinessStats(services: any[]): {
  totalServices: number;
  totalVariants: number;
  totalRevenue: number;
  totalProfit: number;
  totalTaxes: number;
  averagePrice: number;
} {
  let totalVariants = 0;
  let totalRevenue = 0;
  let totalProfit = 0;
  let totalTaxes = 0;

  services.forEach(service => {
    // Contar variantes
    if (service.variants) {
      totalVariants += service.variants.length;
    }

    // Calcular métricas de negocio
    try {
      const calculation = calculateServicePrice(service.category || service.serviceType, service);
      totalRevenue += calculation.clientPays;
      totalProfit += calculation.profit;
      totalTaxes += calculation.taxes;

      // Agregar métricas de variantes
      if (service.variants) {
        service.variants.forEach((variant: any) => {
          try {
            const variantCalc = calculateServicePrice(service.category || service.serviceType, {
              ...service,
              ...variant
            });
            totalRevenue += variantCalc.clientPays;
            totalProfit += variantCalc.profit;
            totalTaxes += variantCalc.taxes;
          } catch (error) {
            console.warn('Error calculating variant metrics:', error);
          }
        });
      }
    } catch (error) {
      console.warn('Error calculating service metrics:', error);
    }
  });

  return {
    totalServices: services.length,
    totalVariants,
    totalRevenue: Math.round(totalRevenue),
    totalProfit: Math.round(totalProfit),
    totalTaxes: Math.round(totalTaxes),
    averagePrice: services.length > 0 ? Math.round(totalRevenue / services.length) : 0
  };
}
