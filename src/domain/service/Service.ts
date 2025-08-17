import type { ServiceProperties } from '@/types/properties';
import type { ServiceVariant } from '@/types/services';

class Service {
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

  static fromProperties(properties: ServiceProperties): Service {
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
    } = properties;

    return new Service(
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
  }
}

export default Service;
