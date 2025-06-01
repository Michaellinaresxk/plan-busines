// src/types/properties.ts
export interface SupplierProperties {
  id: string;
  name: string;
  cedula: string;
  email: string;
  phone: string;
  service: string;
  canProvideService: boolean;
  vehicleType?: string; // ✅ Nueva propiedad opcional
}

// src/types/supplierHelpers.ts - Archivo separado para helpers
export const AIRPORT_TRANSFER_SERVICES = [
  'airport-transfer',
  'airport-transfers',
  'transporte-aeropuerto'
];

export function isAirportTransferService(service: string): boolean {
  const normalizedService = service.toLowerCase();
  return AIRPORT_TRANSFER_SERVICES.some(
    airportService =>
      normalizedService.includes(airportService) || airportService.includes(normalizedService)
  );
}

export function getVehicleTypeLabel(vehicleType: string): string {
  const vehicleTypes: Record<string, string> = {
    vanSmall: 'Van Pequeña (1-6 personas)',
    vanMedium: 'Van Mediana (7-10 personas)',
    vanLarge: 'Van Grande (11-16 personas)',
    suv: 'SUV (1-6 personas)'
  };

  return vehicleTypes[vehicleType] || vehicleType;
}

export const VEHICLE_TYPE_OPTIONS = [
  { title: 'Van Pequeña (1-6 personas)', value: 'vanSmall' },
  { title: 'Van Mediana (7-10 personas)', value: 'vanMedium' },
  { title: 'Van Grande (11-16 personas)', value: 'vanLarge' },
  { title: 'SUV (1-6 personas)', value: 'suv' }
];
