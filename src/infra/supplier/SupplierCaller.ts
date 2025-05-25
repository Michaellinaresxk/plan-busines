// src/infra/supplier/SupplierCaller.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  type Firestore
} from 'firebase/firestore';
import type { ApiSupplier } from './ApiSupplier';

export class SupplierCaller {
  private readonly COLLECTION_NAME = 'supliers'; // ✅ Nombre correcto de tu colección

  constructor(private readonly db: Firestore) {}

  async getAllSuppliers(): Promise<ApiSupplier[]> {
    try {
      console.log('🔥 SupplierCaller: Starting getAllSuppliers...');
      console.log('🔥 Collection name:', this.COLLECTION_NAME);
      console.log('🔥 Database instance:', this.db ? '✅ Available' : '❌ Not available');

      const supplierCollection = collection(this.db, this.COLLECTION_NAME);
      console.log('🔥 Collection reference created');

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

  async getSupplierById(id: string): Promise<ApiSupplier | null> {
    try {
      console.log('🔥 SupplierCaller: Getting supplier by ID...', { id });

      const docRef = doc(this.db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ Supplier found:', { id: docSnap.id, name: data.name });

        return {
          id: docSnap.id,
          name: data.name || '',
          cedula: data.cedula || '',
          email: data.email || '',
          phone: data.phone || '',
          service: data.service || '',
          canProvideService: data.canProvideService !== false
        };
      } else {
        console.log('❌ Supplier not found with ID:', id);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error fetching supplier ${id}:`, error);
      throw error;
    }
  }

  async updateSupplier(id: string, data: Partial<Omit<ApiSupplier, 'id'>>): Promise<ApiSupplier> {
    try {
      console.log('🔥 SupplierCaller: Updating supplier...', { id, data });

      const docRef = doc(this.db, this.COLLECTION_NAME, id);

      // Preparar datos para actualizar
      const updateData = {
        ...data,
        updatedAt: new Date()
      };

      // Limpiar campos undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await updateDoc(docRef, updateData);

      console.log('✅ Supplier updated successfully');

      // Obtener el documento actualizado
      const updatedDoc = await getDoc(docRef);

      if (!updatedDoc.exists()) {
        throw new Error('Supplier not found after update');
      }

      const updatedData = updatedDoc.data();

      return {
        id: updatedDoc.id,
        name: updatedData.name || '',
        cedula: updatedData.cedula || '',
        email: updatedData.email || '',
        phone: updatedData.phone || '',
        service: updatedData.service || '',
        canProvideService: updatedData.canProvideService !== false
      };
    } catch (error) {
      console.error('❌ Error updating supplier:', error);
      throw error;
    }
  }

  async deleteSupplier(id: string): Promise<void> {
    try {
      console.log('🔥 SupplierCaller: Deleting supplier...', { id });

      const docRef = doc(this.db, this.COLLECTION_NAME, id);

      // Verificar que el documento existe antes de eliminar
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(`Supplier with ID ${id} not found`);
      }

      const supplierData = docSnap.data();
      console.log('🔍 Supplier to delete:', { id, name: supplierData.name });

      // Eliminar el documento
      await deleteDoc(docRef);

      console.log('✅ Supplier deleted successfully from Firestore');
    } catch (error) {
      console.error('❌ Error deleting supplier:', error);
      throw error;
    }
  }
}
