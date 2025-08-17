import { ServiceResource } from '@/infra/service/ServiceResource';
import type { UseCase } from '@/primary/UseCase';

export class DeleteServiceUseCase implements UseCase {
  constructor(private serviceResource: ServiceResource) {}

  async execute(id: string): Promise<void> {
    try {
      console.log('🔍 DeleteServiceUseCase: Deleting service:', id);

      // Validar entrada
      if (!id || id.trim() === '') {
        throw new Error('Service ID is required');
      }

      // Eliminar el servicio
      await this.serviceResource.deleteService(id);

      console.log('✅ DeleteServiceUseCase: Service deleted successfully');
    } catch (error) {
      console.error('❌ DeleteServiceUseCase: Error deleting service:', error);
      throw error;
    }
  }
}
