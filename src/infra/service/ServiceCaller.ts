// src/infra/service/ServiceCaller.ts
import type {
  Query,
  DocumentData,
  QuerySnapshot,
  Firestore,
  CollectionReference,
  DocumentSnapshot
} from '@firebase/firestore';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from '@firebase/firestore';
import type { ApiService } from './ApiService';

export class ServiceCaller {
  constructor(
    public readonly collection: (
      firestore: Firestore,
      path: string,
      ...pathSegments: string[]
    ) => CollectionReference<DocumentData>,
    public readonly getDocs: (query: Query<DocumentData>) => Promise<QuerySnapshot<DocumentData>>,
    public readonly db: Firestore
  ) {}

  async createService(
    title: string,
    category: string,
    basePrice: number,
    currency: string,
    description?: string,
    variants?: any[],
    tags?: string[]
  ): Promise<ApiService> {
    try {
      console.log('🔧 ServiceCaller.createService called:', { title, category, basePrice });

      // Generar IDs para las variantes si existen
      const processedVariants = variants?.map(variant => ({
        ...variant,
        id: `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));

      const servicesCollection = collection(this.db, 'services');
      const serviceData = {
        title,
        category,
        basePrice,
        currency,
        description: description || '',
        isActive: true,
        variants: processedVariants || [],
        tags: tags || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      console.log('📝 Creating service with data:', serviceData);

      const docRef = await addDoc(servicesCollection, serviceData);

      // Obtener el documento recién creado
      const createdDoc = await getDoc(docRef);

      if (!createdDoc.exists()) {
        throw new Error('Failed to retrieve created service');
      }

      const apiService: ApiService = {
        id: createdDoc.id,
        ...(createdDoc.data() as Omit<ApiService, 'id'>)
      };

      console.log('✅ ServiceCaller: Service created successfully:', apiService.title);
      return apiService;
    } catch (error) {
      console.error('❌ ServiceCaller.createService error:', error);
      throw error;
    }
  }

  async getAllServices(): Promise<ApiService[]> {
    try {
      console.log('🔧 ServiceCaller.getAllServices called');

      const servicesCollection = collection(this.db, 'services');

      // Try with orderBy first, fall back to simple query if it fails
      let querySnapshot: QuerySnapshot<DocumentData>;

      try {
        const q = query(servicesCollection, orderBy('createdAt', 'desc'));
        querySnapshot = await this.getDocs(q);
      } catch (orderError) {
        console.warn('⚠️ OrderBy failed, trying simple query:', orderError);
        // If orderBy fails (missing index), do a simple query
        querySnapshot = await this.getDocs(query(servicesCollection));
      }

      const services: ApiService[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();

        console.log('📄 Raw document data:', {
          id: doc.id,
          title: data.title,
          category: data.category,
          basePrice: data.basePrice,
          createdAt: data.createdAt,
          createdAtType: typeof data.createdAt,
          createdAtConstructor: data.createdAt?.constructor?.name,
          hasToDateMethod: data.createdAt && typeof data.createdAt.toDate === 'function',
          updatedAt: data.updatedAt,
          updatedAtType: typeof data.updatedAt,
          updatedAtConstructor: data.updatedAt?.constructor?.name,
          hasToDateMethod2: data.updatedAt && typeof data.updatedAt.toDate === 'function',
          isActive: data.isActive,
          variants: data.variants,
          tags: data.tags
        });

        // ✅ Validar datos antes de crear el objeto ApiService
        const apiService: ApiService = {
          id: doc.id,
          title: data.title || '',
          category: data.category || '',
          basePrice: data.basePrice || 0,
          currency: data.currency || 'USD',
          description: data.description || '',
          isActive: data.isActive !== undefined ? data.isActive : true,
          variants: Array.isArray(data.variants) ? data.variants : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
          createdAt: data.createdAt || Timestamp.now(), // Fallback si no existe
          updatedAt: data.updatedAt || Timestamp.now() // Fallback si no existe
        };

        services.push(apiService);
      });

      // Sort in JavaScript if we couldn't use orderBy
      if (querySnapshot.size > 0) {
        services.sort((a, b) => {
          try {
            const dateA =
              a.createdAt && typeof a.createdAt.toDate === 'function'
                ? a.createdAt.toDate().getTime()
                : 0;
            const dateB =
              b.createdAt && typeof b.createdAt.toDate === 'function'
                ? b.createdAt.toDate().getTime()
                : 0;
            return dateB - dateA; // Most recent first
          } catch (error) {
            console.warn('⚠️ Error sorting services by date:', error);
            return 0;
          }
        });
      }

      console.log('✅ ServiceCaller: Retrieved', services.length, 'services');
      return services;
    } catch (error) {
      console.error('❌ ServiceCaller.getAllServices error:', error);
      throw error;
    }
  }

  async getServiceById(id: string): Promise<ApiService | null> {
    try {
      console.log('🔧 ServiceCaller.getServiceById called:', id);

      if (!id || id.trim() === '') {
        throw new Error('Service ID is required');
      }

      const docRef = doc(this.db, 'services', id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log('❌ ServiceCaller: Service not found with ID:', id);
        return null;
      }

      const data = docSnap.data();
      const apiService: ApiService = {
        id: docSnap.id,
        title: data.title || '',
        category: data.category || '',
        basePrice: data.basePrice || 0,
        currency: data.currency || 'USD',
        description: data.description || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        variants: Array.isArray(data.variants) ? data.variants : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now()
      };

      console.log('✅ ServiceCaller: Service found:', apiService.title);
      return apiService;
    } catch (error) {
      console.error('❌ ServiceCaller.getServiceById error:', error);
      throw error;
    }
  }

  async getServicesByCategory(category: string): Promise<ApiService[]> {
    try {
      console.log('🔧 ServiceCaller.getServicesByCategory called:', category);

      const servicesCollection = collection(this.db, 'services');

      // Simple query without orderBy to avoid index requirements
      const q = query(
        servicesCollection,
        where('category', '==', category),
        where('isActive', '==', true)
      );

      const querySnapshot = await this.getDocs(q);

      const services: ApiService[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        services.push({
          id: doc.id,
          title: data.title || '',
          category: data.category || '',
          basePrice: data.basePrice || 0,
          currency: data.currency || 'USD',
          description: data.description || '',
          isActive: data.isActive !== undefined ? data.isActive : true,
          variants: Array.isArray(data.variants) ? data.variants : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
          createdAt: data.createdAt || Timestamp.now(),
          updatedAt: data.updatedAt || Timestamp.now()
        });
      });

      // Sort in JavaScript
      services.sort((a, b) => {
        try {
          const titleA = a.title.toLowerCase();
          const titleB = b.title.toLowerCase();
          return titleA.localeCompare(titleB);
        } catch (error) {
          return 0;
        }
      });

      console.log(
        '✅ ServiceCaller: Retrieved',
        services.length,
        'services for category:',
        category
      );
      return services;
    } catch (error) {
      console.error('❌ ServiceCaller.getServicesByCategory error:', error);
      throw error;
    }
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
  ): Promise<ApiService> {
    try {
      console.log('🔧 ServiceCaller.updateService called:', id);

      if (!id || id.trim() === '') {
        throw new Error('Service ID is required');
      }

      const docRef = doc(this.db, 'services', id);

      // Preparar datos de actualización
      const updateData: any = {
        updatedAt: Timestamp.now()
      };

      if (title !== undefined) updateData.title = title;
      if (category !== undefined) updateData.category = category;
      if (basePrice !== undefined) updateData.basePrice = basePrice;
      if (currency !== undefined) updateData.currency = currency;
      if (description !== undefined) updateData.description = description;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (variants !== undefined) updateData.variants = variants;
      if (tags !== undefined) updateData.tags = tags;

      await updateDoc(docRef, updateData);

      // Obtener el documento actualizado
      const updatedDoc = await getDoc(docRef);

      if (!updatedDoc.exists()) {
        throw new Error('Service not found after update');
      }

      const data = updatedDoc.data();
      const apiService: ApiService = {
        id: updatedDoc.id,
        title: data.title || '',
        category: data.category || '',
        basePrice: data.basePrice || 0,
        currency: data.currency || 'USD',
        description: data.description || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        variants: Array.isArray(data.variants) ? data.variants : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now()
      };

      console.log('✅ ServiceCaller: Service updated successfully:', apiService.title);
      return apiService;
    } catch (error) {
      console.error('❌ ServiceCaller.updateService error:', error);
      throw error;
    }
  }

  async deleteService(id: string): Promise<void> {
    try {
      console.log('🔧 ServiceCaller.deleteService called:', id);

      if (!id || id.trim() === '') {
        throw new Error('Service ID is required');
      }

      const docRef = doc(this.db, 'services', id);

      // Verificar que el documento existe antes de eliminar
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Service not found');
      }

      await deleteDoc(docRef);

      console.log('✅ ServiceCaller: Service deleted successfully');
    } catch (error) {
      console.error('❌ ServiceCaller.deleteService error:', error);
      throw error;
    }
  }

  async toggleServiceStatus(id: string): Promise<ApiService> {
    try {
      console.log('🔧 ServiceCaller.toggleServiceStatus called:', id);

      // Primero obtener el servicio actual
      const currentService = await this.getServiceById(id);

      if (!currentService) {
        throw new Error('Service not found');
      }

      // Cambiar el estado
      const newStatus = !currentService.isActive;

      // Actualizar usando el método updateService
      return await this.updateService(
        id,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        newStatus
      );
    } catch (error) {
      console.error('❌ ServiceCaller.toggleServiceStatus error:', error);
      throw error;
    }
  }
}
