// src/primary/service/useCases/GetServiceByIdUseCase.ts
import { ServiceResource } from '@/infra/service/ServiceResource';
import type { UseCase } from '@/primary/UseCase';
import { ServiceView } from '@/views/ServiceView';

export class GetServiceByIdUseCase implements UseCase {
  constructor(private serviceResource: ServiceResource) {}

  async execute(id: string): Promise<ServiceView | null> {
    try {
      console.log('🔍 GetServiceByIdUseCase: Getting service by ID:', id);

      if (!id || id.trim() === '') {
        throw new Error('Service ID is required');
      }

      const service = await this.serviceResource.getServiceById(id);

      if (!service) {
        console.log('❌ GetServiceByIdUseCase: Service not found');
        return null;
      }

      const serviceView = ServiceView.fromDomain(service);

      console.log('✅ GetServiceByIdUseCase: Service found:', serviceView.title);
      return serviceView;
    } catch (error) {
      console.error('❌ GetServiceByIdUseCase: Error getting service by ID:', error);
      throw error;
    }
  }
}
