import { SupplierResource } from '@/infra/supplier/SupplierResource';
import type { UseCase } from '@/primary/UseCase';
import { SupplierView } from '@/views/SupplierView';

export class GetSupplierByIdUseCase implements UseCase {
  constructor(private supplierResource: SupplierResource) {}

  async execute(id: string): Promise<SupplierView | null> {
    try {
      const supplier = await this.supplierResource.getSupplierById(id);
      return supplier ? SupplierView.fromDomain(supplier) : null;
    } catch (error) {
      console.error(`Error getting supplier ${id}:`, error);
      throw error;
    }
  }
}
