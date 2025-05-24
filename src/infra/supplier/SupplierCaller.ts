import type {
  Query,
  DocumentData,
  QuerySnapshot,
  Firestore,
  CollectionReference
} from '@firebase/firestore';
import { addDoc, collection, getDocs, query } from '@firebase/firestore';
import { auth, db, signInWithEmailAndPassword } from '../api/FirebaseConfig';
import { createUserWithEmailAndPassword, getAuth, updateProfile } from 'firebase/auth';
import type { ApiSupplier } from './ApiSupplier';
import type Supplier from '@/domain/supplier/Supplier';

export class SupplierCaller {
  constructor(
    public readonly collection: (
      firestore: Firestore,
      path: string,
      ...pathSegments: string[]
    ) => CollectionReference<DocumentData>,
    public readonly getDocs: (query: Query<DocumentData>) => Promise<QuerySnapshot<DocumentData>>,
    public readonly db: Firestore
  ) {}

  async createSupplier(
    id: string,
    name: string,
    cedula: string,
    email: string,
    phone: string,
    service: string,
    canProvideService: boolean
  ): Promise<ApiSupplier> {
    if (!this.db) {
      throw new Error('Firestore instance or user ID is undefined!');
    }
    const supplierData = {
      id,
      name,
      cedula,
      email,
      phone,
      service,
      canProvideService
    };

    const supplierCollection = collection(this.db, 'suppliers');
    const docRef = await addDoc(supplierCollection, {
      ...supplierData
    });

    return {
      id: docRef.id,
      ...supplierData
    };
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    const supplierCollection = collection(this.db, 'suppliers');
    let supplierQuery = query(supplierCollection);

    const snapshot = await getDocs(supplierQuery);
    return snapshot.docs.map(
      doc =>
        ({
          id: doc.id,
          ...doc.data()
        }) as ApiSupplier
    );
  }
}
