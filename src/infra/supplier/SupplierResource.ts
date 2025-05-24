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

  async createSupplier(
    name: string,
    cedula: string,
    email: string,
    phone: string,
    service: string,
    canProvideService: boolean = true
  ): Promise<Supplier> {
    try {
      const apiSupplier = await this.supplierCaller.createSupplier(
        name,
        cedula,
        email,
        phone,
        service,
        canProvideService
      );
      return this.apiToDomain(apiSupplier);
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
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

  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const apiSupplier = await this.supplierCaller.getSupplierById(id);

      if (!apiSupplier) {
        return null;
      }

      return this.apiToDomain(apiSupplier);
    } catch (error) {
      console.error(`Error getting supplier ${id}:`, error);
      throw error;
    }
  }

  async updateSupplier(id: string, data: Partial<Omit<ApiSupplier, 'id'>>): Promise<Supplier> {
    try {
      const apiSupplier = await this.supplierCaller.updateSupplier(id, data);
      return this.apiToDomain(apiSupplier);
    } catch (error) {
      console.error(`Error updating supplier ${id}:`, error);
      throw error;
    }
  }

  async deleteSupplier(id: string): Promise<void> {
    try {
      await this.supplierCaller.deleteSupplier(id);
    } catch (error) {
      console.error(`Error deleting supplier ${id}:`, error);
      throw error;
    }
  }

  async getSuppliersByService(service: string): Promise<Supplier[]> {
    try {
      const apiSuppliers = await this.supplierCaller.getSuppliersByService(service);
      return apiSuppliers.map(apiSupplier => this.apiToDomain(apiSupplier));
    } catch (error) {
      console.error(`Error getting suppliers by service ${service}:`, error);
      throw error;
    }
  }
}
