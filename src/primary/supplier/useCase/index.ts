// src/primary/supplier/useCase/index.ts
import { SupplierResource } from '../../../infra/supplier/SupplierResource';
import { GetAllSuppliersUseCase } from './GetAllSupliersUseCase';
import { CreateSupplierUseCase } from './CreateSuplierUseCase';

export class SupplierService {
  private getAllSuppliersUseCase: GetAllSuppliersUseCase;
  private createSupplierUseCase: CreateSupplierUseCase;

  constructor(private readonly supplierResource: SupplierResource) {
    this.getAllSuppliersUseCase = new GetAllSuppliersUseCase(supplierResource);
    this.createSupplierUseCase = new CreateSupplierUseCase(supplierResource);
  }

  async getAllSuppliers() {
    return await this.getAllSuppliersUseCase.execute();
  }

  async createSupplier(
    name: string,
    cedula: string,
    email: string,
    phone: string,
    service: string,
    canProvideService: boolean = true
  ) {
    return await this.createSupplierUseCase.execute(
      name,
      cedula,
      email,
      phone,
      service,
      canProvideService
    );
  }
}
