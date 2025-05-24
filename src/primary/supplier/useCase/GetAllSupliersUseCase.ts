import { SupplierResource } from '@/infra/supplier/SupplierResource';
import type { UseCase } from '@/primary/UseCase';
import { SupplierView } from '@/views/SupplierView';

export class GetAllSuppliersUseCase implements UseCase {
  constructor(private supplierResource: SupplierResource) {}

  async execute(): Promise<SupplierView[]> {
    try {
      const suppliers = await this.supplierResource.getAllSuppliers();
      return suppliers.map(supplier => SupplierView.fromDomain(supplier));
    } catch (error) {
      console.error('Error getting all suppliers:', error);
      throw error;
    }
  }
}
