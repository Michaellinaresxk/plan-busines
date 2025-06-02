// src/primary/supplier/useCase/GetSupplierByIdUseCase.ts
import { SupplierResource } from '@/infra/supplier/SupplierResource';
import type { UseCase } from '@/primary/UseCase';
import { SupplierView } from '@/views/SupplierView';

export class GetSupplierByIdUseCase implements UseCase {
  constructor(private supplierResource: SupplierResource) {}

  async execute(id: string): Promise<SupplierView | null> {
    try {
      console.log('🔍 GetSupplierByIdUseCase: Getting supplier by ID:', id);

      // Validar entrada
      if (!id || id.trim() === '') {
        throw new Error('Supplier ID is required');
      }

      // ✅ Corregir nombre del método para coincidir con SupplierRepository
      const supplier = await this.supplierResource.getSupplierById(id);

      if (!supplier) {
        console.log('❌ GetSupplierByIdUseCase: Supplier not found');
        return null;
      }

      // Convertir a SupplierView
      const supplierView = SupplierView.fromDomain(supplier);

      console.log('✅ GetSupplierByIdUseCase: Supplier found:', supplierView.name);
      return supplierView;
    } catch (error) {
      console.error('❌ GetSupplierByIdUseCase: Error getting supplier by ID:', error);
      throw error;
    }
  }
}
