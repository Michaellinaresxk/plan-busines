// src/types/services.ts
import { ServiceId } from '@/constants/serviceId';
import { ServiceCategory } from '@/constants/serviceCategories';

export type PackageType = 'standard' | 'premium';

export interface BookingDuration {
  min: number;
  max: number;
  unit: 'hours' | 'days' | 'sessions' | 'setups';
}

export interface CapacityInfo {
  min: number;
  max: number;
  price?: number;
}

export interface SubOption {
  id: string;
  nameKey: string;
  price: number | string;
  descriptionKey?: string;
  capacityInfo?: CapacityInfo;
}

export interface ServiceOption {
  id: string;
  nameKey: string;
  subOptions: Record<string, SubOption>;
}

export interface Availability {
  daysOfWeek: number[];
  hoursOfDay: number[];
}

export interface ServiceData {
  id: ServiceId;
  titleKey: string;
  descriptionKey: string;
  fullDescriptionKey: string;
  basePrice: number;
  priceUnit: string;
  category: ServiceCategory;
  packageType: PackageType[];
  imageUrl: string;
  duration: number;
  isPopular?: boolean;
  bookingDuration?: BookingDuration;
  options?: Record<string, ServiceOption>;
  includes?: string[];
  notIncluded?: string[];
  additionalInfoKeys?: string[];
  whatToBring?: string[];
  itinerary?: string[];
  disclaimer?: string;
  specialRender?: string;
  relatedServices?: ServiceId[];
  tags: string[];
  availability?: Availability;
  metaData?: Record<string, any>;
}
