// src/primary/supplier/useCase/FindCompatibleSuppliersUseCase.ts - VERSIÓN FINAL CORREGIDA
import { SupplierResource } from '@/infra/supplier/SupplierResource';
import type { UseCase } from '@/primary/UseCase';
import { SupplierView } from '@/views/SupplierView';
import { isAirportTransferService } from '@/types/supplier';

export interface SupplierSearchCriteria {
  serviceId: string;
  vehicleType?: string;
}

export class FindCompatibleSuppliersUseCase implements UseCase {
  constructor(private supplierResource: SupplierResource) {}

  async execute(criteria: SupplierSearchCriteria): Promise<SupplierView[]> {
    try {
      // Validar entrada
      if (!criteria.serviceId) {
        throw new Error('Service ID is required');
      }

      // Obtener todos los proveedores
      const allSuppliers = await this.supplierResource.getAllSuppliers();

      if (!allSuppliers || allSuppliers.length === 0) {
        return [];
      }

      // PASO 1: Filtrar por servicio
      let compatibleSuppliers = allSuppliers.filter(supplier =>
        this.isServiceMatch(supplier.service, criteria.serviceId)
      );

      // PASO 2: ✅ LÓGICA CORREGIDA para airport transfer + vehicleType
      if (isAirportTransferService(criteria.serviceId)) {
        if (criteria.vehicleType) {
          // ✅ Filtrar por vehicleType usando nueva lógica mejorada
          compatibleSuppliers = compatibleSuppliers.filter(supplier =>
            this.isVehicleTypeMatch(supplier, criteria.vehicleType!)
          );
        }
        // Si NO se especifica vehicleType, mostrar todos los de airport transfer
      }

      // PASO 3: Solo proveedores activos
      const activeSuppliers = compatibleSuppliers.filter(supplier => supplier.canProvideService);

      // Convertir a SupplierView
      return activeSuppliers.map(supplier => SupplierView.fromDomain(supplier));
    } catch (error) {
      throw new Error(
        `Failed to find compatible suppliers: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * ✅ Verificar si el servicio del proveedor coincide con el solicitado
   */
  private isServiceMatch(supplierService: string, requestedService: string): boolean {
    if (!supplierService || !requestedService) return false;

    // Coincidencia exacta
    if (supplierService === requestedService) return true;

    // Normalizar y comparar
    const normalizeService = (service: string) =>
      service
        .toLowerCase()
        .trim()
        .replace(/[-_\s]+/g, '');

    const normalizedSupplier = normalizeService(supplierService);
    const normalizedRequested = normalizeService(requestedService);

    return (
      normalizedSupplier === normalizedRequested ||
      normalizedSupplier.includes(normalizedRequested) ||
      normalizedRequested.includes(normalizedSupplier)
    );
  }

  /**
   * ✅ FUNCIÓN CORREGIDA: Verificar si el vehicleType coincide usando nueva lógica
   */
  private isVehicleTypeMatch(supplier: any, requestedVehicleType: string): boolean {
    // ✅ CAMBIO CRÍTICO: Si el proveedor no tiene vehicleType, puede servir cualquier tipo
    // Esto permite que proveedores sin vehicleType específico aparezcan para todas las búsquedas
    if (!supplier.vehicleType || supplier.vehicleType.trim() === '') {
      return true; // ← ESTE ES EL CAMBIO CLAVE
    }

    // ✅ Usar la nueva función de compatibilidad
    return areVehicleTypesCompatible(supplier.vehicleType, requestedVehicleType);
  }
}
