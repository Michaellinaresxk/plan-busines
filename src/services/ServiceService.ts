// src/services/ServiceService.ts
import type { InjectionKey } from 'vue';
import { ServiceResource } from '@/infra/service/ServiceResource';
import { ServiceService } from '@/primary/service/useCase/index';
import { ServiceCaller } from '@/infra/service/ServiceCaller';
import { db } from '@/infra/api/FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const serviceCaller = new ServiceCaller(collection, getDocs, db);
const serviceResource = new ServiceResource(serviceCaller);
const serviceService = new ServiceService(serviceResource);

const serviceServiceKey = Symbol() as InjectionKey<ServiceService>;
export { serviceService, serviceServiceKey };
