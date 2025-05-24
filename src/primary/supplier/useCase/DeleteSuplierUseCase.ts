import { SupplierResource } from '@/infra/supplier/SupplierResource';
import type { UseCase } from '@/primary/UseCase';

export class DeleteSupplierUseCase implements UseCase {
  constructor(private supplierResource: SupplierResource) {}

  async execute(id: string): Promise<void> {
    try {
      await this.supplierResource.deleteSupplier(id);
    } catch (error) {
      console.error(`Error deleting supplier ${id}:`, error);
      throw error;
    }
  }
}
