// src/primary/service/useCases/GetAllServicesUseCase.ts
import { ServiceResource } from '@/infra/service/ServiceResource';
import type { UseCase } from '@/primary/UseCase';
import { ServiceView } from '@/views/ServiceView';

export class GetAllServicesUseCase implements UseCase {
  constructor(private serviceResource: ServiceResource) {}

  async execute(): Promise<ServiceView[]> {
    try {
      console.log('🔍 GetAllServicesUseCase: Getting all services');

      const services = await this.serviceResource.getAllServices();
      const serviceViews = services.map(service => ServiceView.fromDomain(service));

      console.log('✅ GetAllServicesUseCase: Retrieved', serviceViews.length, 'services');
      return serviceViews;
    } catch (error) {
      console.error('❌ GetAllServicesUseCase: Error getting services:', error);
      throw error;
    }
  }
}
