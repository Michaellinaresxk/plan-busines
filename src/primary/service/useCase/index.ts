import { ServiceResource } from '@/infra/service/ServiceResource';
import { CreateServiceUseCase } from './CreateServiceUseCase';
import { GetAllServicesUseCase } from './GetAllServicesUseCase';
import { GetServiceByIdUseCase } from './GetServiceByIdUseCase';
import { GetServicesByCategoryUseCase } from './GetServicesByCategoryUseCase';

export class ServiceService {
  private createServiceUseCase: CreateServiceUseCase;
  private getAllServicesUseCase: GetAllServicesUseCase;
  private getServiceByIdUseCase: GetServiceByIdUseCase;
  private getServicesByCategoryUseCase: GetServicesByCategoryUseCase;

  constructor(private readonly serviceResource: ServiceResource) {
    this.createServiceUseCase = new CreateServiceUseCase(serviceResource);
    this.getAllServicesUseCase = new GetAllServicesUseCase(serviceResource);
    this.getServiceByIdUseCase = new GetServiceByIdUseCase(serviceResource);
    this.getServicesByCategoryUseCase = new GetServicesByCategoryUseCase(serviceResource);
  }

  async createService(
    title: string,
    category: string,
    basePrice: number,
    currency: string,
    description?: string,
    variants?: any[],
    tags?: string[]
  ) {
    return await this.createServiceUseCase.execute(
      title,
      category,
      basePrice,
      currency,
      description,
      variants,
      tags
    );
  }

  async getAllServices() {
    return await this.getAllServicesUseCase.execute();
  }

  async getServiceById(id: string) {
    return await this.getServiceByIdUseCase.execute(id);
  }

  async getServicesByCategory(category: string) {
    return await this.getServicesByCategoryUseCase.execute(category);
  }
}
