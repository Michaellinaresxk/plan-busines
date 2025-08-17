// src/primary/service/useCases/GetServicesByCategoryUseCase.ts
import { ServiceResource } from '@/infra/service/ServiceResource';
import type { UseCase } from '@/primary/UseCase';
import { ServiceView } from '@/views/ServiceView';

export class GetServicesByCategoryUseCase implements UseCase {
  constructor(private serviceResource: ServiceResource) {}

  async execute(category: string): Promise<ServiceView[]> {
    try {
      console.log('🔍 GetServicesByCategoryUseCase: Getting services by category:', category);

      if (!category || category.trim() === '') {
        throw new Error('Category is required');
      }

      const services = await this.serviceResource.getServicesByCategory(category);
      const serviceViews = services.map(service => ServiceView.fromDomain(service));

      console.log(
        '✅ GetServicesByCategoryUseCase: Retrieved',
        serviceViews.length,
        'services for category:',
        category
      );
      return serviceViews;
    } catch (error) {
      console.error('❌ GetServicesByCategoryUseCase: Error getting services by category:', error);
      throw error;
    }
  }
}
