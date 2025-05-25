// src/primary/supplier/useCase/DeleteSupplierUseCase.ts
import { SupplierResource } from '@/infra/supplier/SupplierResource';
import type { UseCase } from '@/primary/UseCase';

export class DeleteSupplierUseCase implements UseCase {
  constructor(private supplierResource: SupplierResource) {}

  async execute(id: string): Promise<void> {
    try {
      console.log('🗑️ DeleteSupplierUseCase: Executing delete...', { id });

      // Validar que el ID esté presente
      if (!id || id.trim() === '') {
        throw new Error('Supplier ID is required for deletion');
      }

      // Verificar que el supplier existe antes de eliminar (opcional pero recomendado)
      const existingSupplier = await this.supplierResource.getSupplierById(id);
      if (!existingSupplier) {
        throw new Error(`Supplier with ID ${id} not found`);
      }

      console.log('🔍 DeleteSupplierUseCase: Supplier found, proceeding with deletion...', {
        id,
        name: existingSupplier.name
      });

      // Llamar al resource para eliminar
      await this.supplierResource.deleteSupplier(id);

      console.log('✅ DeleteSupplierUseCase: Supplier deleted successfully');
    } catch (error) {
      console.error('❌ DeleteSupplierUseCase: Error deleting supplier:', error);
      throw error;
    }
  }
}
