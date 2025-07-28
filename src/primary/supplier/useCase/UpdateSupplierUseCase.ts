// src/primary/supplier/useCase/UpdateSupplierUseCase.ts
import { SupplierResource } from '@/infra/supplier/SupplierResource';
import type { UseCase } from '@/primary/UseCase';
import { SupplierView } from '@/views/SupplierView';

export class UpdateSupplierUseCase implements UseCase {
  constructor(private supplierResource: SupplierResource) {}

  async execute(
    id: string,
    data: {
      name?: string;
      cedula?: string;
      email?: string;
      phone?: string;
      service?: string;
      canProvideService?: boolean;
      vehicleType?: string; // ✅ Mantener vehicleType opcional
    }
  ): Promise<SupplierView> {
    try {
      console.log('🔄 UpdateSupplierUseCase: Executing update...', { id, data });

      // ✅ MANTENER validaciones mínimas originales
      const hasData = Object.values(data).some(value => value !== undefined);
      if (!hasData) {
        throw new Error('No data provided for update');
      }

      // ✅ REMOVER validaciones estrictas de vehicleType que rompían funcionalidad
      // Llamar al resource para actualizar tal como está
      const updatedSupplier = await this.supplierResource.updateSupplier(id, data);

      // Convertir a SupplierView
      const supplierView = SupplierView.fromDomain(updatedSupplier);

      console.log('✅ UpdateSupplierUseCase: Supplier updated successfully');
      return supplierView;
    } catch (error) {
      console.error('❌ UpdateSupplierUseCase: Error updating supplier:', error);
      throw error;
    }
  }
}
