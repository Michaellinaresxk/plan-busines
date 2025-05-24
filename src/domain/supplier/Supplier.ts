import type { SupplierProperties } from '@/types/properties';

class Supplier {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly cedula: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly service: string,
    public readonly canProvideService: boolean
  ) {}
  static fromProperties(properties: SupplierProperties) {
    const { id, name, cedula, email, phone, service, canProvideService } = properties;
    return new Supplier(id, name, cedula, email, phone, service, canProvideService);
  }
  get properties(): SupplierProperties {
    return Object.freeze({
      id: this.id,
      name: this.name,
      cedula: this.cedula,
      email: this.email,
      phone: this.phone,
      service: this.service,
      canProvideService: this.canProvideService
    });
  }
}

export default Supplier;
