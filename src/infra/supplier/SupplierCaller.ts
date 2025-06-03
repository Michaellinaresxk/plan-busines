// src/infra/supplier/SupplierCaller.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  type Firestore,
  query,
  where
} from 'firebase/firestore';
import type { ApiSupplier } from './ApiSupplier';

export class SupplierCaller {
  private readonly COLLECTION_NAME = 'supliers';

  constructor(private readonly db: Firestore) {}

  // ✅ Utility method to clean undefined values
  private cleanData<T extends Record<string, any>>(data: T): Partial<T> {
    const cleaned: Partial<T> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleaned[key as keyof T] = value;
      }
    });

    return cleaned;
  }

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
          vehicleType: data.vehicleType || undefined, // ✅ Mantener undefined si no existe
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
    canProvideService: boolean = true,
    vehicleType?: string
  ): Promise<ApiSupplier> {
    try {
      console.log('🔥 SupplierCaller: Creating new supplier...', {
        name,
        service,
        vehicleType,
        hasVehicleType: !!vehicleType
      });

      // ✅ Preparar datos base
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

      // ✅ Solo agregar vehicleType si tiene valor
      if (vehicleType && vehicleType.trim()) {
        (supplierData as any).vehicleType = vehicleType.trim();
      }

      console.log('🔥 Final supplier data to save:', supplierData);

      const supplierCollection = collection(this.db, this.COLLECTION_NAME);
      const docRef = await addDoc(supplierCollection, supplierData);

      console.log('✅ Supplier created with ID:', docRef.id);

      // ✅ Retornar datos consistentes
      const resultData: ApiSupplier = {
        id: docRef.id,
        name: supplierData.name,
        cedula: supplierData.cedula,
        email: supplierData.email,
        phone: supplierData.phone,
        service: supplierData.service,
        canProvideService: supplierData.canProvideService
      };

      // Solo incluir vehicleType si existe
      if ('vehicleType' in supplierData) {
        resultData.vehicleType = (supplierData as any).vehicleType;
      }

      return resultData;
    } catch (error) {
      console.error('❌ Error creating supplier:', error);
      console.error('❌ Error details:', {
        name: error?.name,
        message: error?.message,
        code: error?.code
      });
      throw error;
    }
  }

  async getSuppliersByService(serviceId: string): Promise<ApiSupplier[]> {
    try {
      console.log('🔥 SupplierCaller: Getting suppliers by service...', { serviceId });

      const supplierCollection = collection(this.db, this.COLLECTION_NAME);
      const q = query(supplierCollection, where('service', '==', serviceId));
      const snapshot = await getDocs(q);

      console.log('🔥 Query executed, found suppliers:', snapshot.size);

      if (snapshot.empty) {
        console.log('🔥 No suppliers found for service:', serviceId);
        return [];
      }

      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('🔥 Supplier found:', { id: doc.id, name: data.name, service: data.service });

        const result: ApiSupplier = {
          id: doc.id,
          name: data.name || '',
          cedula: data.cedula || '',
          email: data.email || '',
          phone: data.phone || '',
          service: data.service || '',
          canProvideService: data.canProvideService !== false
        };

        // Solo incluir vehicleType si existe en el documento
        if (data.vehicleType) {
          result.vehicleType = data.vehicleType;
        }

        return result;
      });

      console.log('✅ Found suppliers for service:', { serviceId, count: results.length });
      return results;
    } catch (error) {
      console.error('❌ Error getting suppliers by service:', error);
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

        const result: ApiSupplier = {
          id: docSnap.id,
          name: data.name || '',
          cedula: data.cedula || '',
          email: data.email || '',
          phone: data.phone || '',
          service: data.service || '',
          canProvideService: data.canProvideService !== false
        };

        // Solo incluir vehicleType si existe en el documento
        if (data.vehicleType) {
          result.vehicleType = data.vehicleType;
        }

        return result;
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

      // ✅ Limpiar datos undefined antes de enviar a Firestore
      const updateData = this.cleanData({
        ...data,
        updatedAt: new Date()
      });

      console.log('🔥 Cleaned update data:', updateData);

      await updateDoc(docRef, updateData);

      console.log('✅ Supplier updated successfully');

      // Obtener el documento actualizado
      const updatedDoc = await getDoc(docRef);

      if (!updatedDoc.exists()) {
        throw new Error('Supplier not found after update');
      }

      const updatedData = updatedDoc.data();

      const result: ApiSupplier = {
        id: updatedDoc.id,
        name: updatedData.name || '',
        cedula: updatedData.cedula || '',
        email: updatedData.email || '',
        phone: updatedData.phone || '',
        service: updatedData.service || '',
        canProvideService: updatedData.canProvideService !== false
      };

      // Solo incluir vehicleType si existe
      if (updatedData.vehicleType) {
        result.vehicleType = updatedData.vehicleType;
      }

      return result;
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
