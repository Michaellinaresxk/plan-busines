import { SupplierResource } from '@/infra/supplier/SupplierResource';
import type { UseCase } from '@/primary/UseCase';
import { SupplierView } from '@/views/SupplierView';

export class CreateSupplierUseCase implements UseCase {
  constructor(private supplierResource: SupplierResource) {}

  async execute(
    name: string,
    cedula: string,
    email: string,
    phone: string,
    service: string,
    canProvideService: boolean = true
  ): Promise<SupplierView> {
    try {
      const supplier = await this.supplierResource.createSupplier(
        name,
        cedula,
        email,
        phone,
        service,
        canProvideService
      );
      return SupplierView.fromDomain(supplier);
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  }
}
