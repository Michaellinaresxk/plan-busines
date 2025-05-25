// src/infra/supplier/SupplierResource.ts
import type SupplierRepository from '@/domain/supplier/SupplierRepository';
import { SupplierCaller } from './SupplierCaller';
import Supplier from '../../domain/supplier/Supplier';
import type { ApiSupplier } from './ApiSupplier';

export class SupplierResource implements SupplierRepository {
  constructor(private readonly supplierCaller: SupplierCaller) {}

  // Convertir ApiSupplier a Supplier (Domain Entity)
  private apiToDomain(apiSupplier: ApiSupplier): Supplier {
    return Supplier.fromProperties({
      id: apiSupplier.id,
      name: apiSupplier.name,
      cedula: apiSupplier.cedula,
      email: apiSupplier.email,
      phone: apiSupplier.phone,
      service: apiSupplier.service,
      canProvideService: apiSupplier.canProvideService
    });
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      const apiSuppliers = await this.supplierCaller.getAllSuppliers();
      return apiSuppliers.map(apiSupplier => this.apiToDomain(apiSupplier));
    } catch (error) {
      console.error('Error getting all suppliers:', error);
      throw error;
    }
  }

  async createSupplier(
    name: string,
    cedula: string,
    email: string,
    phone: string,
    service: string,
    canProvideService: boolean = true
  ): Promise<Supplier> {
    try {
      console.log('🔧 SupplierResource: Creating supplier...', { name, service });

      const apiSupplier = await this.supplierCaller.createSupplier(
        name,
        cedula,
        email,
        phone,
        service,
        canProvideService
      );

      const domainSupplier = this.apiToDomain(apiSupplier);
      console.log('✅ SupplierResource: Supplier created successfully');

      return domainSupplier;
    } catch (error) {
      console.error('❌ SupplierResource: Error creating supplier:', error);
      throw error;
    }
  }

  // Mantenemos solo estos métodos por ahora
  async getSupplierById(id: string): Promise<Supplier> {
    throw new Error('Not implemented yet');
  }

  async deleteSupplier(id: string): Promise<void> {
    throw new Error('Not implemented yet');
  }
}
