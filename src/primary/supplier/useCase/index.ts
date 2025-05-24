// src/primary/supplier/useCase/index.ts
import { SupplierResource } from '../../../infra/supplier/SupplierResource';
import { GetAllSuppliersUseCase } from './GetAllSupliersUseCase';
// import { CreateSupplierUseCase } from './CreateSupplierUseCase';
// import { GetSupplierByIdUseCase } from './GetSupplierByIdUseCase';
// import { UpdateSupplierUseCase } from './UpdateSupplierUseCase';
// import { DeleteSupplierUseCase } from './DeleteSupplierUseCase';

export class SupplierService {
  private getAllSuppliersUseCase: GetAllSuppliersUseCase;
  // private createSupplierUseCase: CreateSupplierUseCase;
  // private getSupplierByIdUseCase: GetSupplierByIdUseCase;
  // private updateSupplierUseCase: UpdateSupplierUseCase;
  // private deleteSupplierUseCase: DeleteSupplierUseCase;

  constructor(private readonly supplierResource: SupplierResource) {
    // ✅ Pasar la instancia, no la clase
    this.getAllSuppliersUseCase = new GetAllSuppliersUseCase(supplierResource);
    // this.createSupplierUseCase = new CreateSupplierUseCase(supplierResource);
    // this.getSupplierByIdUseCase = new GetSupplierByIdUseCase(supplierResource);
    // this.updateSupplierUseCase = new UpdateSupplierUseCase(supplierResource);
    // this.deleteSupplierUseCase = new DeleteSupplierUseCase(supplierResource);
  }

  // async createSupplier(
  //   name: string,
  //   cedula: string,
  //   email: string,
  //   phone: string,
  //   service: string,
  //   canProvideService: boolean = true
  // ) {
  //   return await this.createSupplierUseCase.execute(
  //     name,
  //     cedula,
  //     email,
  //     phone,
  //     service,
  //     canProvideService
  //   );
  // }

  async getAllSuppliers() {
    return await this.getAllSuppliersUseCase.execute();
  }

  // async getSupplierById(id: string) {
  //   return await this.getSupplierByIdUseCase.execute(id);
  // }

  // async updateSupplier(
  //   id: string,
  //   data: {
  //     name?: string;
  //     cedula?: string;
  //     email?: string;
  //     phone?: string;
  //     service?: string;
  //     canProvideService?: boolean;
  //   }
  // ) {
  //   return await this.updateSupplierUseCase.execute(id, data);
  // }

  // async deleteSupplier(id: string): Promise<void> {
  //   await this.deleteSupplierUseCase.execute(id);
  // }

  // async getSuppliersByService(service: string) {
  //   return await this.supplierResource.getSuppliersByService(service);
  // }

  // Métodos de conveniencia para operaciones comunes
  // async getSupplierStats() {
  //   const allSuppliers = await this.getAllSuppliers();

  //   const total = allSuppliers.length;
  //   const byService = allSuppliers.reduce(
  //     (acc, supplier) => {
  //       acc[supplier.service] = (acc[supplier.service] || 0) + 1;
  //       return acc;
  //     },
  //     {} as Record<string, number>
  //   );

  //   const activeSuppliers = allSuppliers.filter(s => s.canProvideService).length;

  //   return {
  //     total,
  //     active: activeSuppliers,
  //     inactive: total - activeSuppliers,
  //     byService,
  //     services: Object.keys(byService).length
  //   };
  // }
}
