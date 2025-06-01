// src/domain/supplier/SupplierRepository.ts
import type Supplier from './Supplier';

export default interface SupplierRepository {
  createSupplier(
    name: string,
    cedula: string,
    email: string,
    phone: string,
    service: string,
    canProvideService: boolean,
    vehicleType?: string // ✅ Agregar parámetro vehicleType
  ): Promise<Supplier>;

  getAllSuppliers(): Promise<Supplier[]>;

  getSupplierById(id: string): Promise<Supplier | null>; // ✅ Corregir nombre del método

  updateSupplier(
    id: string,
    data: {
      name?: string;
      cedula?: string;
      email?: string;
      phone?: string;
      service?: string;
      canProvideService?: boolean;
      vehicleType?: string; // ✅ Agregar vehicleType
    }
  ): Promise<Supplier>; // ✅ Agregar método updateSupplier

  deleteSupplier(id: string): Promise<void>;
}
