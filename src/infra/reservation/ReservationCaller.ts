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
  type CollectionReference,
  type DocumentData,
  type Query,
  type QuerySnapshot
} from 'firebase/firestore';
import type {
  ApiReservation,
  CreateReservationData,
  UpdateReservationData
} from './ApiReservation';

export class ReservationCaller {
  private readonly COLLECTION_NAME = 'bookings';

  constructor(private readonly db: Firestore) {}

  // Obtener todas las reservas
  async getAllReservations(): Promise<ApiReservation[]> {
    try {
      const reservationsRef = collection(this.db, this.COLLECTION_NAME);
      const querySnapshot = await getDocs(query(reservationsRef, orderBy('bookingDate', 'desc')));

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
  // Obtener reservas por estado
  async getReservationsByStatus(status: string): Promise<ApiReservation[]> {
    try {
      const reservationsRef = collection(this.db, this.COLLECTION_NAME);
      const q = query(
        reservationsRef,
        where('status', '==', status),
        orderBy('bookingDate', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(
        doc =>
          ({
            bookingId: doc.id,
            ...doc.data()
          }) as ApiReservation
      );
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

      await updateDoc(docRef, data);

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

  // Obtener reservas por servicio
  async getReservationsByService(serviceId: string): Promise<ApiReservation[]> {
    try {
      const reservationsRef = collection(this.db, this.COLLECTION_NAME);
      const q = query(
        reservationsRef,
        where('serviceId', '==', serviceId),
        orderBy('bookingDate', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(
        doc =>
          ({
            bookingId: doc.id,
            ...doc.data()
          }) as ApiReservation
      );
    } catch (error) {
      console.error(`Error fetching reservations by service ${serviceId}:`, error);
      throw error;
    }
  }
}
