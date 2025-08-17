import { ServiceResource } from '@/infra/service/ServiceResource';
import type { UseCase } from '@/primary/UseCase';
import { ServiceView } from '@/views/ServiceView';

export class UpdateServiceUseCase implements UseCase {
  constructor(private serviceResource: ServiceResource) {}

  async execute(
    id: string,
    updateData: {
      title?: string;
      category?: string;
      basePrice?: number;
      currency?: string;
      description?: string;
      isActive?: boolean;
      variants?: any[];
      tags?: string[];
    }
  ): Promise<ServiceView> {
    try {
      console.log('🔍 UpdateServiceUseCase: Updating service:', { id, updateData });

      // Validar entrada
      if (!id || id.trim() === '') {
        throw new Error('Service ID is required');
      }

      // Preparar datos de actualización
      const serviceUpdateData = {
        id,
        ...updateData
      };

      // Actualizar el servicio
      const service = await this.serviceResource.updateService(id, serviceUpdateData);

      // Convertir a ServiceView
      const serviceView = ServiceView.fromDomain(service);

      console.log('✅ UpdateServiceUseCase: Service updated successfully:', serviceView.title);
      return serviceView;
    } catch (error) {
      console.error('❌ UpdateServiceUseCase: Error updating service:', error);
      throw error;
    }
  }
}
