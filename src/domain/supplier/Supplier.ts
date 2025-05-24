// src/domain/supplier/Supplier.ts
import type { SupplierProperties } from '@/types/properties';

export class Supplier {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly cedula: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly service: string,
    public readonly canProvideService: boolean
  ) {}

  static fromProperties(properties: SupplierProperties): Supplier {
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

  // Métodos de negocio
  activate(): Supplier {
    return Supplier.fromProperties({
      ...this.properties,
      canProvideService: true
    });
  }

  deactivate(): Supplier {
    return Supplier.fromProperties({
      ...this.properties,
      canProvideService: false
    });
  }

  updateContactInfo(email: string, phone: string): Supplier {
    return Supplier.fromProperties({
      ...this.properties,
      email,
      phone
    });
  }

  updateService(service: string): Supplier {
    return Supplier.fromProperties({
      ...this.properties,
      service
    });
  }

  // Getters para validaciones de negocio
  isActive(): boolean {
    return this.canProvideService;
  }

  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  isValidCedula(): boolean {
    // Validación básica de cédula dominicana (xxx-xxxxxxx-x)
    const cedulaRegex = /^\d{3}-?\d{7}-?\d{1}$/;
    return cedulaRegex.test(this.cedula.replace(/-/g, ''));
  }

  getFormattedCedula(): string {
    const cleaned = this.cedula.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 10)}-${cleaned.slice(10)}`;
    }
    return this.cedula;
  }

  getFormattedPhone(): string {
    const cleaned = this.phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return this.phone;
  }
}

export default Supplier;
