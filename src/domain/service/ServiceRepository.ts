import type Service from './Service';

export default interface ServiceRepository {
  createService(
    title: string,
    category: string,
    basePrice: number,
    currency: string,
    description?: string,
    variants?: any[],
    tags?: string[]
  ): Promise<Service>;

  getAllServices(): Promise<Service[]>;

  getServiceById(id: string): Promise<Service | null>;

  getServicesByCategory(category: string): Promise<Service[]>;

  updateService(
    id: string,
    title?: string,
    category?: string,
    basePrice?: number,
    currency?: string,
    description?: string,
    isActive?: boolean,
    variants?: any[],
    tags?: string[]
  ): Promise<Service>;

  deleteService(id: string): Promise<void>;

  toggleServiceStatus(id: string): Promise<Service>;
}
