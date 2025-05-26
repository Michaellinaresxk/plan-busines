// src/primary/supplier/useCase/GetSuppliersByServiceUseCase.ts

import { SupplierResource } from '@/infra/supplier/SupplierResource';
import type { UseCase } from '@/primary/UseCase';
import { SupplierView } from '@/views/SupplierView';

export class GetSuppliersByServiceUseCase implements UseCase {
  constructor(private supplierResource: SupplierResource) {}

  async execute(serviceId: string): Promise<SupplierView[]> {
    try {
      console.log('🔍 GetSuppliersByServiceUseCase: Searching suppliers for service:', serviceId);

      // Validar entrada
      if (!serviceId || serviceId.trim() === '') {
        console.warn('⚠️ GetSuppliersByServiceUseCase: Empty serviceId provided');
        return [];
      }

      // Obtener todos los proveedores
      const allSuppliers = await this.supplierResource.getAllSuppliers();

      if (!allSuppliers || allSuppliers.length === 0) {
        console.log('📭 GetSuppliersByServiceUseCase: No suppliers found in database');
        return [];
      }

      console.log(`📊 GetSuppliersByServiceUseCase: Found ${allSuppliers.length} total suppliers`);

      // Filtrar por servicio específico - más flexible
      const filteredSuppliers = allSuppliers.filter(supplier => {
        const supplierService = supplier.service.toLowerCase();
        const targetService = serviceId.toLowerCase();

        // Coincidencia exacta
        if (supplierService === targetService) {
          return true;
        }

        // Coincidencias parciales para mayor flexibilidad
        if (supplierService.includes(targetService) || targetService.includes(supplierService)) {
          return true;
        }

        return false;
      });

      // Solo retornar proveedores activos
      const activeSuppliers = filteredSuppliers.filter(supplier => supplier.canProvideService);

      // Convertir a SupplierView
      const supplierViews = activeSuppliers.map(supplier => SupplierView.fromDomain(supplier));

      console.log(
        `✅ GetSuppliersByServiceUseCase: Found ${supplierViews.length} active suppliers for service: ${serviceId}`
      );

      // Log detallado para debug
      supplierViews.forEach(supplier => {
        console.log(`  - ${supplier.name} (${supplier.service})`);
      });

      return supplierViews;
    } catch (error) {
      console.error('❌ GetSuppliersByServiceUseCase: Error getting suppliers by service:', error);
      throw new Error(
        `Failed to get suppliers for service ${serviceId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
