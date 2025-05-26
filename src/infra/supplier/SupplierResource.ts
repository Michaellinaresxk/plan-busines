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

  // ✅ NUEVO: Método para actualizar supplier
  async updateSupplier(id: string, data: Partial<Omit<ApiSupplier, 'id'>>): Promise<Supplier> {
    try {
      console.log('🔧 SupplierResource: Updating supplier...', { id, data });

      const apiSupplier = await this.supplierCaller.updateSupplier(id, data);
      const domainSupplier = this.apiToDomain(apiSupplier);

      console.log('✅ SupplierResource: Supplier updated successfully');
      return domainSupplier;
    } catch (error) {
      console.error('❌ SupplierResource: Error updating supplier:', error);
      throw error;
    }
  }

  async getSuppliersByService(serviceId: string): Promise<Supplier[]> {
    try {
      console.log('🔧 SupplierResource: Getting suppliers by service...', { serviceId });

      const apiSuppliers = await this.supplierCaller.getSuppliersByService(serviceId);
      const domainSuppliers = apiSuppliers.map(apiSupplier => this.apiToDomain(apiSupplier));

      console.log('✅ SupplierResource: Found suppliers for service:', {
        serviceId,
        count: domainSuppliers.length
      });
      return domainSuppliers;
    } catch (error) {
      console.error(`❌ SupplierResource: Error getting suppliers by service ${serviceId}:`, error);
      throw error;
    }
  }

  // Mantenemos solo estos métodos por ahora
  async getSupplierByID(id: string): Promise<Supplier | null> {
    try {
      console.log('🔧 SupplierResource: Getting supplier by ID...', { id });

      const apiSupplier = await this.supplierCaller.getSupplierById(id);

      if (!apiSupplier) {
        console.log('❌ SupplierResource: Supplier not found');
        return null;
      }

      const domainSupplier = this.apiToDomain(apiSupplier);
      console.log('✅ SupplierResource: Supplier found');
      return domainSupplier;
    } catch (error) {
      console.error(`❌ SupplierResource: Error getting supplier ${id}:`, error);
      throw error;
    }
  }

  async deleteSupplier(id: string): Promise<void> {
    try {
      console.log('🔧 SupplierResource: Deleting supplier...', { id });

      await this.supplierCaller.deleteSupplier(id);

      console.log('✅ SupplierResource: Supplier deleted successfully');
    } catch (error) {
      console.error(`❌ SupplierResource: Error deleting supplier ${id}:`, error);
      throw error;
    }
  }
}
