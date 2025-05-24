import type SupplierRepository from '@/domain/supplier/SupplierRepository';
import { SupplierCaller } from './SupplierCaller';
import Supplier from '../../domain/supplier/Supplier';

export class SupplierResource implements SupplierRepository {
  constructor(public readonly supplierCaller: SupplierCaller) {}

  async createSupplier(
    id: string,
    name: string,
    cedula: string,
    email: string,
    phone: string,
    service: string,
    canProvideService: boolean
  ): Promise<Supplier> {
    const apiSupplier = await this.supplierCaller.createSupplier(
      id,
      name,
      cedula,
      email,
      phone,
      service,
      canProvideService
    );
    return Supplier.fromProperties(apiSupplier);
  }
  async getAllSuppliers(): Promise<Supplier[]> {
    const supplier = await this.supplierCaller.getAllSuppliers();
    return Supplier.fromProperties(supplier);
  }

  // async deleteSupplier(id: string): Promise<void> {
  //   await this.supplierCaller.deleteSupplier(id);
  // }
}
