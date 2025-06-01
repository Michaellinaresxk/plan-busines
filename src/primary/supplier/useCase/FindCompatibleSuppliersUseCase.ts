// src/primary/supplier/useCase/FindCompatibleSuppliersUseCase.ts
import { SupplierResource } from '@/infra/supplier/SupplierResource';
import type { UseCase } from '@/primary/UseCase';
import { SupplierView } from '@/views/SupplierView';

// ✅ Función local para verificar airport transfer
function isAirportTransferService(service: string): boolean {
  const airportServices = ['airport-transfer', 'airport-transfers', 'transporte-aeropuerto'];
  const normalizedService = service.toLowerCase();
  return airportServices.some(
    airportService =>
      normalizedService.includes(airportService) || airportService.includes(normalizedService)
  );
}

export interface SupplierSearchCriteria {
  serviceId: string;
  vehicleType?: string;
}

export class FindCompatibleSuppliersUseCase implements UseCase {
  constructor(private supplierResource: SupplierResource) {}

  async execute(criteria: SupplierSearchCriteria): Promise<SupplierView[]> {
    try {
      console.log('🔍 FindCompatibleSuppliersUseCase: Searching with criteria:', criteria);

      // Validar entrada
      if (!criteria.serviceId) {
        throw new Error('Service ID is required');
      }

      // Obtener todos los proveedores
      const allSuppliers = await this.supplierResource.getAllSuppliers();

      if (!allSuppliers || allSuppliers.length === 0) {
        console.log('📭 No suppliers found in database');
        return [];
      }

      console.log(`📊 Total suppliers in database: ${allSuppliers.length}`);

      // Filtrar por servicio
      let compatibleSuppliers = allSuppliers.filter(supplier =>
        this.isServiceMatch(supplier.service, criteria.serviceId)
      );

      console.log(
        `🔧 Suppliers matching service "${criteria.serviceId}": ${compatibleSuppliers.length}`
      );

      // ✅ LÓGICA PRINCIPAL: Si es airport transfer Y se especifica vehicleType, filtrar por vehículo
      if (isAirportTransferService(criteria.serviceId) && criteria.vehicleType) {
        compatibleSuppliers = compatibleSuppliers.filter(supplier =>
          this.isVehicleTypeMatch(supplier, criteria.vehicleType!)
        );

        console.log(
          `🚗 Suppliers matching vehicleType "${criteria.vehicleType}": ${compatibleSuppliers.length}`
        );
      }

      // Solo proveedores activos
      const activeSuppliers = compatibleSuppliers.filter(supplier => supplier.canProvideService);
      console.log(`✅ Active suppliers: ${activeSuppliers.length}`);

      // Convertir a SupplierView
      const supplierViews = activeSuppliers.map(supplier => SupplierView.fromDomain(supplier));

      // Log de resultados
      this.logResults(criteria, supplierViews);

      return supplierViews;
    } catch (error) {
      console.error('❌ FindCompatibleSuppliersUseCase: Error:', error);
      throw new Error(
        `Failed to find compatible suppliers: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Verificar si el servicio del proveedor coincide con el solicitado
   */
  private isServiceMatch(supplierService: string, requestedService: string): boolean {
    // Coincidencia exacta
    if (supplierService === requestedService) {
      return true;
    }

    // Normalizar y comparar
    const normalizedSupplier = supplierService.toLowerCase().replace(/[-_\s]/g, '');
    const normalizedRequested = requestedService.toLowerCase().replace(/[-_\s]/g, '');

    return (
      normalizedSupplier === normalizedRequested ||
      normalizedSupplier.includes(normalizedRequested) ||
      normalizedRequested.includes(normalizedSupplier)
    );
  }

  /**
   * ✅ Verificar si el vehicleType del proveedor coincide (solo para airport transfer)
   */
  private isVehicleTypeMatch(supplier: any, requestedVehicleType: string): boolean {
    // Si el proveedor no tiene vehicleType pero necesita uno, no es compatible
    if (!supplier.vehicleType) {
      console.log(`⚠️ Supplier "${supplier.name}" has no vehicleType for airport transfer service`);
      return false;
    }

    // Coincidencia exacta
    return supplier.vehicleType === requestedVehicleType;
  }

  /**
   * Log de resultados
   */
  private logResults(criteria: SupplierSearchCriteria, results: SupplierView[]): void {
    console.log('\n📋 SUPPLIER SEARCH RESULTS:');
    console.log('═══════════════════════════════');
    console.log(`🔍 Service: ${criteria.serviceId}`);

    if (criteria.vehicleType) {
      console.log(`🚗 Vehicle Type: ${criteria.vehicleType}`);
    }

    console.log(`✅ Compatible Suppliers: ${results.length}`);

    if (results.length > 0) {
      results.forEach((supplier, index) => {
        const vehicleInfo = supplier.vehicleType ? ` [${supplier.vehicleType}]` : '';
        console.log(`  ${index + 1}. ${supplier.name}${vehicleInfo}`);
      });
    }

    console.log('═══════════════════════════════\n');
  }
}
