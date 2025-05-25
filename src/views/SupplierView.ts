// src/views/SupplierView.ts
import type Supplier from '../domain/supplier/Supplier';

export class SupplierView {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly cedula: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly service: string,
    public readonly canProvideService: boolean
  ) {}

  static fromDomain(supplier: Supplier): SupplierView {
    const { id, name, cedula, email, phone, service, canProvideService } = supplier.properties;
    return new SupplierView(id, name, cedula, email, phone, service, canProvideService);
  }
}

export default SupplierView;
