// src/infra/service/ServiceResource.ts
import type ServiceRepository from '@/domain/service/ServiceRepository';
import { ServiceCaller } from './ServiceCaller';
import Service from '@/domain/service/Service';
import type { ApiService } from './ApiService';
import type { ServiceProperties } from '@/types/properties';

export class ServiceResource implements ServiceRepository {
  constructor(public readonly serviceCaller: ServiceCaller) {}

  async createService(
    title: string,
    category: string,
    basePrice: number,
    currency: string,
    description?: string,
    variants?: any[],
    tags?: string[]
  ): Promise<Service> {
    const apiService = await this.serviceCaller.createService(
      title,
      category,
      basePrice,
      currency,
      description,
      variants,
      tags
    );
    return Service.fromProperties(this.apiToProperties(apiService));
  }

  async getAllServices(): Promise<Service[]> {
    const apiServices = await this.serviceCaller.getAllServices();
    return apiServices.map(apiService => Service.fromProperties(this.apiToProperties(apiService)));
  }

  async getServiceById(id: string): Promise<Service | null> {
    const apiService = await this.serviceCaller.getServiceById(id);
    if (!apiService) {
      return null;
    }
    return Service.fromProperties(this.apiToProperties(apiService));
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    const apiServices = await this.serviceCaller.getServicesByCategory(category);
    return apiServices.map(apiService => Service.fromProperties(this.apiToProperties(apiService)));
  }

  async updateService(
    id: string,
    title?: string,
    category?: string,
    basePrice?: number,
    currency?: string,
    description?: string,
    isActive?: boolean,
    variants?: any[],
    tags?: string[]
  ): Promise<Service> {
    const apiService = await this.serviceCaller.updateService(
      id,
      title,
      category,
      basePrice,
      currency,
      description,
      isActive,
      variants,
      tags
    );
    return Service.fromProperties(this.apiToProperties(apiService));
  }

  async deleteService(id: string): Promise<void> {
    await this.serviceCaller.deleteService(id);
  }

  async toggleServiceStatus(id: string): Promise<Service> {
    const apiService = await this.serviceCaller.toggleServiceStatus(id);
    return Service.fromProperties(this.apiToProperties(apiService));
  }

  private apiToProperties(apiService: ApiService): ServiceProperties {
    console.log('🔍 ServiceResource.apiToProperties - Raw apiService:', {
      id: apiService.id,
      title: apiService.title,
      createdAt: apiService.createdAt,
      createdAtType: typeof apiService.createdAt,
      createdAtHasToDate: apiService.createdAt && typeof apiService.createdAt.toDate === 'function',
      updatedAt: apiService.updatedAt,
      updatedAtType: typeof apiService.updatedAt,
      updatedAtHasToDate: apiService.updatedAt && typeof apiService.updatedAt.toDate === 'function'
    });

    // ✅ Función helper para convertir timestamp con validación
    const safeTimestampToDate = (timestamp: any, fallbackName: string): Date => {
      if (!timestamp) {
        console.warn(`⚠️ ${fallbackName} is null/undefined, using current date`);
        return new Date();
      }

      if (typeof timestamp.toDate === 'function') {
        try {
          return timestamp.toDate();
        } catch (error) {
          console.error(`❌ Error converting ${fallbackName} to date:`, error);
          return new Date();
        }
      }

      // Si es una fecha ya convertida
      if (timestamp instanceof Date) {
        return timestamp;
      }

      // Si es un string de fecha
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }

      // Si es un número (timestamp en milisegundos)
      if (typeof timestamp === 'number') {
        return new Date(timestamp);
      }

      console.warn(`⚠️ Unknown ${fallbackName} format:`, timestamp, 'using current date');
      return new Date();
    };

    const properties: ServiceProperties = {
      id: apiService.id,
      title: apiService.title,
      category: apiService.category,
      basePrice: apiService.basePrice,
      currency: apiService.currency,
      description: apiService.description,
      isActive: apiService.isActive,
      variants: apiService.variants,
      tags: apiService.tags,
      createdAt: safeTimestampToDate(apiService.createdAt, 'createdAt'),
      updatedAt: safeTimestampToDate(apiService.updatedAt, 'updatedAt')
    };

    console.log('✅ ServiceResource.apiToProperties - Converted properties:', {
      id: properties.id,
      title: properties.title,
      createdAt: properties.createdAt,
      updatedAt: properties.updatedAt
    });

    return properties;
  }
}
