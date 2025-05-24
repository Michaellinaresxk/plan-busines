import { SupplierResource } from '../../../infra/supplier/SupplierResource';
import CreateSupplierUseCase from './CreateSupplierUseCase';
import { GetAllSuppliersUseCase } from './GetAllSuppliersUseCase';
import { GetSupplierByIdUseCase } from './GetSupplierByIdUseCase';
import { DeleteSupplierUseCase } from './DeleteSupplierUseCase';

export class SuplierService {
  private createSupplierUseCase: CreateSupplierUseCase;
  private getAllSuppliersUseCase: GetAllSuppliersUseCase;
  private getSupplierByIdUseCase: GetSupplierByIdUseCase;
  private deleteSupplierUseCase: DeleteSupplierUseCase;

  constructor(private readonly supplierResource: SupplierResource) {
    this.createSupplierUseCase = new CreateSupplierUseCase(SupplierResource);
    this.getAllSuppliersUseCase = new GetAllSuppliersUseCase(SupplierResource);
    this.getSupplierByIdUseCase = new GetSupplierByIdUseCase(SupplierResource);
    this.deleteSupplierUseCase = new DeleteSupplierUseCase(SupplierResource);
  }

  async createSupplier(
    id: string,
    name: string,
    cedula: string,
    email: string,
    phone: string,
    service: string,
    canProvideService: boolean
  ) {
    return await this.createSupplierUseCase.execute(
      id,
      name,
      cedula,
      email,
      phone,
      service,
      canProvideService
    );
  }
  async getAllSuppliers() {
    return await this.getAllSuppliersUseCase.execute();
  }
  async getSupplierById(id: string) {
    return await this.getSupplierByIdUseCase.execute(id);
  }
  async deleteSupplier(): Promise<void> {
    await this.deleteSupplierUseCase.execute();
  }
}
