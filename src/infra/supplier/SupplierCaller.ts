// src/infra/supplier/SupplierCaller.ts - Versión Simple
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  type Firestore
} from 'firebase/firestore';
import type { ApiSupplier } from './ApiSupplier';

export class SupplierCaller {
  private readonly COLLECTION_NAME = 'supliers'; // ✅ Nombre correcto

  constructor(private readonly db: Firestore) {}

  async getAllSuppliers(): Promise<ApiSupplier[]> {
    try {
      console.log('🔥 SupplierCaller: Starting getAllSuppliers...');
      console.log('🔥 Collection name:', this.COLLECTION_NAME);
      console.log('🔥 Database instance:', this.db ? '✅ Available' : '❌ Not available');

      const supplierCollection = collection(this.db, this.COLLECTION_NAME);
      console.log('🔥 Collection reference created');

      // Simple query without orderBy to avoid field index issues
      const snapshot = await getDocs(supplierCollection);
      console.log('🔥 Query executed, snapshot size:', snapshot.size);
      console.log('🔥 Snapshot empty?', snapshot.empty);

      if (snapshot.empty) {
        console.log('🔥 No documents found in collection:', this.COLLECTION_NAME);
        return [];
      }

      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('🔥 Document data:', { id: doc.id, ...data });

        // Limpiar campos con espacios extra
        const cleanData = {
          id: doc.id,
          name: data.name || data['name '] || '', // Manejar "name " con espacio
          cedula: data.cedula || '',
          email: data.email || '',
          phone: data.phone || '',
          service: data.service || '',
          canProvideService: data.canProvideService !== false, // Default true
          ...data
        };

        return cleanData;
      }) as ApiSupplier[];

      console.log('🔥 Final results count:', results.length);
      return results;
    } catch (error) {
      console.error('❌ Error in getAllSuppliers:', error);
      console.error('❌ Error details:', {
        name: error?.name,
        message: error?.message,
        code: error?.code
      });
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
      const supplierData = {
        name,
        cedula,
        email,
        phone,
        service,
        canProvideService,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const supplierCollection = collection(this.db, this.COLLECTION_NAME);
      const docRef = await addDoc(supplierCollection, supplierData);

      return {
        id: docRef.id,
        ...supplierData
      };
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  }

  async getSupplierById(id: string): Promise<ApiSupplier | null> {
    try {
      const docRef = doc(this.db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as ApiSupplier;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error fetching supplier ${id}:`, error);
      throw error;
    }
  }
}
