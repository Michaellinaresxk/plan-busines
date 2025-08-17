import type Service from '@/domain/service/Service';
import type { ServiceVariant } from '@/domain/service/Service';

export class ServiceView {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly category: string,
    public readonly basePrice: number,
    public readonly currency: string,
    public readonly description: string | undefined,
    public readonly isActive: boolean,
    public readonly variants: ServiceVariant[] | undefined,
    public readonly tags: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static fromDomain(service: Service): ServiceView {
    try {
      console.log('🔍 ServiceView.fromDomain called with:', service);

      const {
        id,
        title,
        category,
        basePrice,
        currency,
        description,
        isActive,
        variants,
        tags,
        createdAt,
        updatedAt
      } = service;

      console.log('✅ ServiceView.fromDomain creating view for:', title);

      return new ServiceView(
        id,
        title,
        category,
        basePrice,
        currency,
        description,
        isActive,
        variants,
        tags,
        createdAt,
        updatedAt
      );
    } catch (error) {
      console.error('❌ Error in ServiceView.fromDomain:', error);
      console.error('Service data:', service);
      throw error;
    }
  }
}
