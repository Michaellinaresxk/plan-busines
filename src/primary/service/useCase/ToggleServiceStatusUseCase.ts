import { ServiceResource } from '@/infra/service/ServiceResource';
import type { UseCase } from '@/primary/UseCase';
import { ServiceView } from '@/views/ServiceView';

export class ToggleServiceStatusUseCase implements UseCase {
  constructor(private serviceResource: ServiceResource) {}

  async execute(id: string): Promise<ServiceView> {
    try {
      console.log('🔍 ToggleServiceStatusUseCase: Toggling service status:', id);

      // Validar entrada
      if (!id || id.trim() === '') {
        throw new Error('Service ID is required');
      }

      // Cambiar estado del servicio
      const service = await this.serviceResource.toggleServiceStatus(id);

      // Convertir a ServiceView
      const serviceView = ServiceView.fromDomain(service);

      console.log(
        '✅ ToggleServiceStatusUseCase: Service status toggled:',
        serviceView.title,
        'isActive:',
        serviceView.isActive
      );
      return serviceView;
    } catch (error) {
      console.error('❌ ToggleServiceStatusUseCase: Error toggling service status:', error);
      throw error;
    }
  }
}
