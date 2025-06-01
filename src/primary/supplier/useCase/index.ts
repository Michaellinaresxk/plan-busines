// src/primary/supplier/useCase/index.ts
import { SupplierResource } from '../../../infra/supplier/SupplierResource';
import { GetAllSuppliersUseCase } from './GetAllSupliersUseCase';
import { CreateSupplierUseCase } from './CreateSuplierUseCase';
import { UpdateSupplierUseCase } from './UpdateSupplierUseCase';
import { DeleteSupplierUseCase } from './DeleteSuplierUseCase';
import { GetSupplierByIdUseCase } from './GetSuplierByIdUseCase';
import { GetSuppliersByServiceUseCase } from './GetSuppliersByServiceUseCase';
import { FindCompatibleSuppliersUseCase } from './FindCompatibleSuppliersUseCase';

export class SupplierService {
  private getAllSuppliersUseCase: GetAllSuppliersUseCase;
  private createSupplierUseCase: CreateSupplierUseCase;
  private updateSupplierUseCase: UpdateSupplierUseCase;
  private getSupplierByIdUseCase: GetSupplierByIdUseCase;
  private getSuppliersByServiceUseCase: GetSuppliersByServiceUseCase;
  private deleteSupplierUseCase: DeleteSupplierUseCase;
  private findCompatibleSuppliersUseCase: FindCompatibleSuppliersUseCase;

  constructor(private readonly supplierResource: SupplierResource) {
    this.getAllSuppliersUseCase = new GetAllSuppliersUseCase(supplierResource);
    this.createSupplierUseCase = new CreateSupplierUseCase(supplierResource);
    this.updateSupplierUseCase = new UpdateSupplierUseCase(supplierResource);
    this.getSupplierByIdUseCase = new GetSupplierByIdUseCase(supplierResource);
    this.deleteSupplierUseCase = new DeleteSupplierUseCase(supplierResource);
    this.getSuppliersByServiceUseCase = new GetSuppliersByServiceUseCase(supplierResource);
    this.findCompatibleSuppliersUseCase = new FindCompatibleSuppliersUseCase(supplierResource);
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
    canProvideService: boolean = true,
    vehicleType?: string // ✅ Agregar parámetro vehicleType
  ) {
    return await this.createSupplierUseCase.execute(
      name,
      cedula,
      email,
      phone,
      service,
      canProvideService,
      vehicleType // ✅ Pasar vehicleType al use case
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
      vehicleType?: string; // ✅ Agregar vehicleType a los datos de actualización
    }
  ) {
    return await this.updateSupplierUseCase.execute(id, data);
  }

  async getSupplierById(id: string) {
    return await this.getSupplierByIdUseCase.execute(id);
  }

  async deleteSupplier(id: string): Promise<void> {
    return await this.deleteSupplierUseCase.execute(id);
  }

  async getSuppliersByService(serviceId: string) {
    return await this.getSuppliersByServiceUseCase.execute(serviceId);
  }

  async findCompatibleSuppliers(serviceId: string, vehicleType?: string) {
    return await this.findCompatibleSuppliersUseCase.execute({ serviceId, vehicleType });
  }
}
