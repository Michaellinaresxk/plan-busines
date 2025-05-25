// src/infra/supplier/SupplierCaller.ts
import { collection, doc, getDocs, getDoc, addDoc, type Firestore } from 'firebase/firestore';
import type { ApiSupplier } from './ApiSupplier';

export class SupplierCaller {
  private readonly COLLECTION_NAME = 'supliers'; // ✅ Mantienes el nombre actual

  constructor(private readonly db: Firestore) {}

  async getAllSuppliers(): Promise<ApiSupplier[]> {
    try {
      console.log('🔥 SupplierCaller: Starting getAllSuppliers...');

      const supplierCollection = collection(this.db, this.COLLECTION_NAME);
      const snapshot = await getDocs(supplierCollection);

      if (snapshot.empty) {
        console.log('🔥 No documents found in collection:', this.COLLECTION_NAME);
        return [];
      }

      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || data['name '] || '',
          cedula: data.cedula || '',
          email: data.email || '',
          phone: data.phone || '',
          service: data.service || '',
          canProvideService: data.canProvideService !== false,
          ...data
        };
      }) as ApiSupplier[];

      console.log('🔥 Final results count:', results.length);
      return results;
    } catch (error) {
      console.error('❌ Error in getAllSuppliers:', error);
      throw error;
    }
  }

  async createSupplier(
    name: string,
    cedula: string,
    email: string,
    phone: string,
    service: string,
    canProvideService: boolean = true
  ): Promise<ApiSupplier> {
    try {
      console.log('🔥 SupplierCaller: Creating new supplier...', { name, service });

      const supplierData = {
        name: name.trim(),
        cedula: cedula.trim(),
        email: email.trim(),
        phone: phone.trim(),
        service: service.trim(),
        canProvideService,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const supplierCollection = collection(this.db, this.COLLECTION_NAME);
      const docRef = await addDoc(supplierCollection, supplierData);

      console.log('✅ Supplier created with ID:', docRef.id);

      return {
        id: docRef.id,
        name: supplierData.name,
        cedula: supplierData.cedula,
        email: supplierData.email,
        phone: supplierData.phone,
        service: supplierData.service,
        canProvideService: supplierData.canProvideService
      };
    } catch (error) {
      console.error('❌ Error creating supplier:', error);
      throw error;
    }
  }
}
