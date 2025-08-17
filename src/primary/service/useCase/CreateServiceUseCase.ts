import { ServiceResource } from '@/infra/service/ServiceResource';
import type { UseCase } from '@/primary/UseCase';
import { ServiceView } from '@/views/ServiceView';

export class CreateServiceUseCase implements UseCase {
  constructor(private serviceResource: ServiceResource) {}

  async execute(
    title: string,
    category: string,
    basePrice: number,
    currency: string,
    description?: string,
    variants?: any[],
    tags?: string[]
  ): Promise<ServiceView> {
    try {
      console.log('🔍 CreateServiceUseCase: Creating service:', title);

      const service = await this.serviceResource.createService(
        title,
        category,
        basePrice,
        currency,
        description,
        variants,
        tags
      );

      const serviceView = ServiceView.fromDomain(service);

      console.log('✅ CreateServiceUseCase: Service created successfully:', serviceView.title);
      return serviceView;
    } catch (error) {
      console.error('❌ CreateServiceUseCase: Error creating service:', error);
      throw error;
    }
  }
}
