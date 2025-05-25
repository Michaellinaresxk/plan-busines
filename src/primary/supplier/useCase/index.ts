// src/primary/supplier/useCase/index.ts
import { SupplierResource } from '../../../infra/supplier/SupplierResource';
import { GetAllSuppliersUseCase } from './GetAllSupliersUseCase';
import { CreateSupplierUseCase } from './CreateSuplierUseCase';
import { UpdateSupplierUseCase } from './UpdateSupplierUseCase';
import { DeleteSupplierUseCase } from './DeleteSuplierUseCase';
import { GetSupplierByIdUseCase } from './GetSuplierByIdUseCase';

export class SupplierService {
  private getAllSuppliersUseCase: GetAllSuppliersUseCase;
  private createSupplierUseCase: CreateSupplierUseCase;
  private updateSupplierUseCase: UpdateSupplierUseCase;
  private getSupplierByIdUseCase: GetSupplierByIdUseCase;
  private deleteSupplierUseCase: DeleteSupplierUseCase;

  constructor(private readonly supplierResource: SupplierResource) {
    this.getAllSuppliersUseCase = new GetAllSuppliersUseCase(supplierResource);
    this.createSupplierUseCase = new CreateSupplierUseCase(supplierResource);
    this.updateSupplierUseCase = new UpdateSupplierUseCase(supplierResource);
    this.getSupplierByIdUseCase = new GetSupplierByIdUseCase(supplierResource);
    this.deleteSupplierUseCase = new DeleteSupplierUseCase(supplierResource);
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

  async updateSupplier(
    id: string,
    data: {
      name?: string;
      cedula?: string;
      email?: string;
      phone?: string;
      service?: string;
      canProvideService?: boolean;
    }
  ) {
    return await this.updateSupplierUseCase.execute(id, data);
  }

  async GetSupplierById(id: string): Promise<void> {
    return await this.deleteSupplierUseCase.execute(id);
  }

  // ✅ NUEVO: Método para eliminar supplier
  async deleteSupplier(id: string): Promise<void> {
    return await this.deleteSupplierUseCase.execute(id);
  }
}
