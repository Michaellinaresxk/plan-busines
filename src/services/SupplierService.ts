import type { InjectionKey } from 'vue';
import { SupplierResource } from '@/infra/supplier/SupplierResource';
import { SupplierService } from '@/primary/supplier/useCase/index';
import { SupplierCaller } from '@/infra/supplier/SupplierCaller';
import { db } from '@/infra/api/FirebaseConfig';

// Crear la cadena de dependencias
const supplierCaller = new SupplierCaller(db); // ✅ Solo pasar db
const supplierResource = new SupplierResource(supplierCaller);
const supplierService = new SupplierService(supplierResource);

// Clave de inyección para Vue
const supplierServiceKey = Symbol() as InjectionKey<SupplierService>;

export { supplierService, supplierServiceKey };
