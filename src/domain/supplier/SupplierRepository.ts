import type Supplier from './Supplier';
export default interface SupplierRepository {
  createSupplier(
    id: string,
    name: string,
    cedula: string,
    email: string,
    phone: string,
    service: string,
    canProvideService: boolean
  ): Promise<Supplier>;
  getAllSuppliers(): Promise<Supplier[]>;
  getSupplierById(id: string): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;
}
