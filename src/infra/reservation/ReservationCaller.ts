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
  type Firestore
} from 'firebase/firestore';
import type {
  ApiReservation,
  CreateReservationData,
  UpdateReservationData
} from './ApiReservation';

export class ReservationCaller {
  private readonly COLLECTION_NAME = 'bookings';

  constructor(private readonly db: Firestore) {}

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
    return this.updateReservation(bookingId, { status });
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
    try {
      const reservationsRef = collection(this.db, this.COLLECTION_NAME);

      // Agregar timestamps
      const reservationData = {
        ...data,
        bookingDate: Timestamp.now(),
        status: 'pending', // Estado inicial
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(reservationsRef, reservationData);

      // Obtener la reserva creada
      const createdReservation = await this.getReservationById(docRef.id);

      if (!createdReservation) {
        throw new Error('Failed to create reservation');
      }

      return createdReservation;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
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
