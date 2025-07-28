// src/primary/supplier/useCase/CreateSupplierUseCase.ts
import { SupplierResource } from '@/infra/supplier/SupplierResource';
import type { UseCase } from '@/primary/UseCase';
import { SupplierView } from '@/views/SupplierView';

export class CreateSupplierUseCase implements UseCase {
  constructor(private supplierResource: SupplierResource) {}

  async execute(
    name: string,
    cedula: string,
    email: string,
    phone: string,
    service: string,
    canProvideService: boolean = true,
    vehicleType?: string // ✅ Mantener como opcional
  ): Promise<SupplierView> {
    try {
      console.log('🔄 CreateSupplierUseCase: Creating supplier...', {
        name,
        service,
        vehicleType,
        isAirportTransfer: this.isAirportTransferService(service)
      });

      // ✅ REMOVER validaciones estrictas que rompían la funcionalidad
      // NO validar vehicleType como requerido - mantener comportamiento original

      const supplier = await this.supplierResource.createSupplier(
        name,
        cedula,
        email,
        phone,
        service,
        canProvideService,
        vehicleType // ✅ Pasar vehicleType tal como viene, sin validaciones extras
      );

      const supplierView = SupplierView.fromDomain(supplier);
      console.log('✅ CreateSupplierUseCase: Supplier created successfully', {
        id: supplierView.id,
        name: supplierView.name,
        vehicleType: supplierView.vehicleType
      });

      return supplierView;
    } catch (error) {
      console.error('❌ CreateSupplierUseCase: Error creating supplier:', error);
      throw error;
    }
  }

  // ✅ Mantener helper method simple
  private isAirportTransferService(service: string): boolean {
    const airportServices = ['airport-transfer', 'airport-transfers', 'transporte-aeropuerto'];
    const normalizedService = service.toLowerCase();
    return airportServices.some(
      airportService =>
        normalizedService.includes(airportService) || airportService.includes(normalizedService)
    );
  }
}
