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
  orderBy,
  Timestamp,
  type Firestore,
  CollectionReference,
  type DocumentData,
  Query,
  QuerySnapshot
} from 'firebase/firestore';
import type {
  ApiReservation,
  CreateReservationData,
  UpdateReservationData
} from './ApiReservation';

export class ReservationCaller {
  private readonly COLLECTION_NAME = 'bookings';

  constructor(
    private readonly db: Firestore,
    public readonly collection: (
      firestore: Firestore,
      path: string,
      ...pathSegments: string[]
    ) => CollectionReference<DocumentData>,
    public readonly getDocs: (query: Query<DocumentData>) => Promise<QuerySnapshot<DocumentData>>
  ) {}

  // Obtener todas las reservas (con ordenamiento simple)
  async getAllReservations(): Promise<ApiReservation[]> {
    try {
      const reservationsRef = collection(this.db, this.COLLECTION_NAME);
      const q = query(reservationsRef, orderBy('bookingDate', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(
        doc =>
          ({
            bookingId: doc.id,
            ...doc.data()
          }) as ApiReservation
      );
    } catch (error) {
      console.error('Error fetching all reservations:', error);
      throw error;
    }
  }

  // OPCIÓN A: Consulta simple por status (SIN orderBy para evitar índice)
  async getReservationsByStatus(status: string): Promise<ApiReservation[]> {
    try {
      const reservationsRef = collection(this.db, this.COLLECTION_NAME);
      const q = query(reservationsRef, where('status', '==', status));
      const querySnapshot = await getDocs(q);

      // Ordenar en JavaScript después de obtener los datos
      const reservations = querySnapshot.docs.map(
        doc =>
          ({
            bookingId: doc.id,
            ...doc.data()
          }) as ApiReservation
      );

      // Ordenar por fecha en JavaScript
      return reservations.sort((a, b) => {
        const dateA = a.bookingDate.toDate().getTime();
        const dateB = b.bookingDate.toDate().getTime();
        return dateB - dateA; // Más reciente primero
      });
    } catch (error) {
      console.error(`Error fetching reservations by status ${status}:`, error);
      throw error;
    }
  }

  // OPCIÓN B: Método alternativo que usa getAllReservations y filtra
  async getReservationsByStatusAlternative(status: string): Promise<ApiReservation[]> {
    try {
      // Obtener todas las reservas y filtrar en JavaScript
      const allReservations = await this.getAllReservations();
      return allReservations.filter(reservation => reservation.status === status);
    } catch (error) {
      console.error(`Error fetching reservations by status ${status}:`, error);
      throw error;
    }
  }

  // Obtener una reserva por ID
  async getReservationById(bookingId: string): Promise<ApiReservation | null> {
    try {
      const docRef = doc(this.db, this.COLLECTION_NAME, bookingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          bookingId: docSnap.id,
          ...docSnap.data()
        } as ApiReservation;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error fetching reservation ${bookingId}:`, error);
      throw error;
    }
  }

  // Actualizar reserva
  async updateReservation(bookingId: string, data: UpdateReservationData): Promise<ApiReservation> {
    try {
      const docRef = doc(this.db, this.COLLECTION_NAME, bookingId);

      // Agregar timestamp de actualización
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };

      await updateDoc(docRef, updateData);

      // Obtener la reserva actualizada
      const updatedReservation = await this.getReservationById(bookingId);

      if (!updatedReservation) {
        throw new Error(`Reservation ${bookingId} not found after update`);
      }

      return updatedReservation;
    } catch (error) {
      console.error(`Error updating reservation ${bookingId}:`, error);
      throw error;
    }
  }

  // Actualizar solo el estado
  async updateReservationStatus(bookingId: string, status: string): Promise<ApiReservation> {
    console.log('🔥 ReservationCaller.updateReservationStatus called');
    console.log('📋 Parameters:', { bookingId, status });
    console.log('🗄️ Collection name:', this.COLLECTION_NAME);
    console.log('🔥 Database instance:', this.db ? '✅ Available' : '❌ Not available');

    try {
      // ✅ VERIFICAR QUE LA RESERVA EXISTE PRIMERO
      console.log('🔍 First, checking if reservation exists...');
      const existingReservation = await this.getReservationById(bookingId);

      if (!existingReservation) {
        console.error('❌ Reservation not found:', bookingId);
        throw new Error(`Reservation with ID ${bookingId} not found`);
      }

      console.log('✅ Reservation found:', {
        id: existingReservation.bookingId,
        currentStatus: existingReservation.status,
        serviceName: existingReservation.serviceName
      });

      // ✅ PREPARAR DATOS DE ACTUALIZACIÓN
      const updateData = {
        status: status,
        updatedAt: Timestamp.now()
      };

      console.log('📝 Update data:', updateData);

      // ✅ CREAR REFERENCIA AL DOCUMENTO
      const docRef = doc(this.db, this.COLLECTION_NAME, bookingId);
      console.log('📄 Document reference created for:', bookingId);

      // ✅ ACTUALIZAR DOCUMENTO EN FIREBASE
      console.log('🚀 Updating document in Firebase...');
      await updateDoc(docRef, updateData);
      console.log('✅ Firebase document updated successfully');

      // ✅ OBTENER LA RESERVA ACTUALIZADA
      console.log('🔄 Fetching updated reservation...');
      const updatedReservation = await this.getReservationById(bookingId);

      if (!updatedReservation) {
        console.error('❌ Failed to fetch updated reservation');
        throw new Error(`Reservation ${bookingId} not found after update`);
      }

      console.log('🎉 Updated reservation retrieved:', {
        id: updatedReservation.bookingId,
        newStatus: updatedReservation.status,
        serviceName: updatedReservation.serviceName
      });

      // ✅ VERIFICAR QUE EL STATUS SE ACTUALIZÓ
      if (updatedReservation.status !== status) {
        console.error('⚠️ Status was not updated correctly:', {
          expected: status,
          actual: updatedReservation.status
        });
        throw new Error(
          `Status update failed - expected ${status}, got ${updatedReservation.status}`
        );
      }

      console.log('✅ Status verification passed');
      return updatedReservation;
    } catch (error) {
      console.error('❌ ERROR in ReservationCaller.updateReservationStatus:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code || 'No code',
        stack: error instanceof Error ? error.stack : 'No stack'
      });

      throw error;
    }
  }

  // Actualizar solo las notas
  async updateReservationNotes(bookingId: string, notes: string): Promise<ApiReservation> {
    return this.updateReservation(bookingId, { notes });
  }

  // Actualizar solo el precio
  async updateReservationPrice(bookingId: string, totalPrice: number): Promise<ApiReservation> {
    return this.updateReservation(bookingId, { totalPrice });
  }

  // Crear nueva reserva
  async createReservation(data: CreateReservationData): Promise<ApiReservation> {
    console.log('📝 Creating reservation with host info:', {
      ...data,
      hasHostInfo: !!data.clientHostInfo,
      hostInfoType: this.detectHostContactType(data.clientHostInfo)
    });

    try {
      const docData = {
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        bookingDate: Timestamp.now(),
        status: 'pending',
        totalPrice: data.totalPrice,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        hostInfo: data.hostInfo, // ✅ NEW: Store host info
        formData: data.formData,
        notes: data.notes || ''
      };

      const docRef = await addDoc(this.collection(this.db, 'reservations'), docData);

      console.log('✅ Reservation created with host info:', {
        id: docRef.id,
        clientName: data.clientName,
        hasHostInfo: !!data.hostInfo
      });

      return {
        bookingId: docRef.id,
        ...docData
      };
    } catch (error) {
      console.error('❌ Error creating reservation:', error);
      throw error;
    }
  }

  // ✅ NEW: Helper method to detect host contact type
  private detectHostContactType(hostInfo: string): 'email' | 'phone' | 'unknown' {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[\+]?[\d\s\-\(\)]+$/;

    if (emailPattern.test(hostInfo)) {
      return 'email';
    } else if (phonePattern.test(hostInfo)) {
      return 'phone';
    }
    return 'unknown';
  }

  // Eliminar reserva
  async deleteReservation(bookingId: string): Promise<void> {
    try {
      const docRef = doc(this.db, this.COLLECTION_NAME, bookingId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting reservation ${bookingId}:`, error);
      throw error;
    }
  }

  // Obtener reservas por servicio (sin ordenamiento para evitar índice)
  async getReservationsByService(serviceId: string): Promise<ApiReservation[]> {
    try {
      const reservationsRef = collection(this.db, this.COLLECTION_NAME);
      const q = query(reservationsRef, where('serviceId', '==', serviceId));
      const querySnapshot = await getDocs(q);

      const reservations = querySnapshot.docs.map(
        doc =>
          ({
            bookingId: doc.id,
            ...doc.data()
          }) as ApiReservation
      );

      // Ordenar en JavaScript
      return reservations.sort((a, b) => {
        const dateA = a.bookingDate.toDate().getTime();
        const dateB = b.bookingDate.toDate().getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error(`Error fetching reservations by service ${serviceId}:`, error);
      throw error;
    }
  }

  // Obtener reservas por cliente (sin ordenamiento para evitar índice)
  async getReservationsByClient(clientEmail: string): Promise<ApiReservation[]> {
    try {
      const reservationsRef = collection(this.db, this.COLLECTION_NAME);
      const q = query(reservationsRef, where('clientEmail', '==', clientEmail));
      const querySnapshot = await getDocs(q);

      const reservations = querySnapshot.docs.map(
        doc =>
          ({
            bookingId: doc.id,
            ...doc.data()
          }) as ApiReservation
      );

      // Ordenar en JavaScript
      return reservations.sort((a, b) => {
        const dateA = a.bookingDate.toDate().getTime();
        const dateB = b.bookingDate.toDate().getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error(`Error fetching reservations by client ${clientEmail}:`, error);
      throw error;
    }
  }

  // Obtener estadísticas de reservas
  async getReservationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
    cancelled: number;
  }> {
    try {
      const reservationsRef = collection(this.db, this.COLLECTION_NAME);
      const querySnapshot = await getDocs(reservationsRef);

      const stats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
        cancelled: 0
      };

      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        stats.total++;

        switch (data.status) {
          case 'pending':
            stats.pending++;
            break;
          case 'approved':
            stats.approved++;
            break;
          case 'rejected':
            stats.rejected++;
            break;
          case 'completed':
            stats.completed++;
            break;
          case 'cancelled':
            stats.cancelled++;
            break;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching reservation stats:', error);
      throw error;
    }
  }
}
